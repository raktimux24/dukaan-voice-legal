import {financialYear,gstEffectiveTime,validateContext,type GstContext} from './gst';
import {projectMixedGstInvoice,type MixedGstLine} from './mixed-gst-projection';
import {mixedGstInvoiceConsistent} from './mixed-gst-integrity';
import {fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION,verifyFiscalHash,type FiscalEnvelope,type FiscalHashRecord} from './fiscal-integrity';
export interface MixedFiscalPayload {format:'samaan_mixed_fiscal_v1';context:GstContext;invoice:ReturnType<typeof projectMixedGstInvoice>;items?:{lineId:string;productId:string|null;name:string;unit:string;categorySnapshot:string|null}[]}
export function mixedGstDocumentType(invoice:MixedFiscalPayload['invoice']){
 return invoice.lines.some(line=>line.kind==='ordinary'&&line.tax?.category!=='taxable')?'invoice_cum_bill_of_supply' as const:'tax_invoice' as const;
}
/** Pure evidence construction. Caller must lock/validate allocation, role and accepted profiles before persisting. */
export function buildMixedGstFiscalDocument(identity:{shopId:string;saleId:string},context:GstContext,lines:readonly MixedGstLine[],discount?:Parameters<typeof projectMixedGstInvoice>[2]){
 const retainedContext=structuredClone(context);
 const invoice=projectMixedGstInvoice(lines,retainedContext,discount);
 const payload:MixedFiscalPayload={format:'samaan_mixed_fiscal_v1',context:retainedContext,invoice};
 const allocation=retainedContext.allocation;
 if(!allocation||!retainedContext.issuedAt)throw new Error('missing_mixed_fiscal_allocation');
 const document:FiscalEnvelope={...identity,issuer:retainedContext.settings.gstin,financialYear:allocation.financialYear,number:allocation.number,type:mixedGstDocumentType(invoice),issuedAt:retainedContext.issuedAt,originalNumber:null,payload};
 const signed={...document,hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash(document)};
 if(!mixedGstFiscalConsistent(signed))throw new Error('invalid_mixed_fiscal_evidence');
 return signed;
}
export function mixedGstFiscalConsistent(document:FiscalEnvelope&FiscalHashRecord):boolean{
 try{
  if(document.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||verifyFiscalHash(document)!=='verified'||!['tax_invoice','invoice_cum_bill_of_supply'].includes(document.type)||document.originalNumber!=null)return false;
  const payload=document.payload as MixedFiscalPayload;
  if(payload?.format!=='samaan_mixed_fiscal_v1'||!mixedGstInvoiceConsistent(payload.invoice))return false;
  if(payload.items!==undefined){
   if(!Array.isArray(payload.items)||payload.items.length!==payload.invoice.lines.length)return false;
   for(let i=0;i<payload.items.length;i++){
    const item=payload.items[i],line=payload.invoice.lines[i];
    if(!item||item.lineId!==line.lineId||typeof item.name!=='string'||!item.name.trim()||item.name.length>500||typeof item.unit!=='string'||!item.unit.trim()||item.unit.length>100||item.productId!==null&&typeof item.productId!=='string'||item.categorySnapshot!==null&&typeof item.categorySnapshot!=='string'||line.kind==='rsp'&&item.productId!==line.evidence!.profile.productId)return false;
   }
  }
  if(document.type!==mixedGstDocumentType(payload.invoice))return false;
  const c=payload.context,a=c?.allocation;
  if(document.type==='invoice_cum_bill_of_supply'&&c?.buyer?.gstin)return false;
  if(!a||!c.issuedAt?.includes('T')||typeof a.id!=='string'||!a.id.trim()||!Number.isSafeInteger(a.index)||a.index<1||a.index>100||a.number!==document.number||a.financialYear!==document.financialYear||c.settings.gstin!==document.issuer||c.settings.registration!=='regular')return false;
  const instant=gstEffectiveTime(c.issuedAt);
  if(instant!==new Date(document.issuedAt).getTime()||financialYear(new Date(instant))!==document.financialYear)return false;
  validateContext(c,Number(payload.invoice.payable));
  const union=['04','26','31','35','38'].includes(c.settings.stateCode);
  return payload.invoice.lines.every(line=>line.kind==='ordinary'?line.tax!.igst===0&&(union?line.tax!.sgst===0:line.tax!.utgst===0):Date.parse(line.evidence!.calculation.basis.rsp.supplyAt)===instant&&line.evidence!.profile.rates.igst===0&&(union?line.evidence!.profile.rates.sgst===0&&line.evidence!.profile.rates.cgst===line.evidence!.profile.rates.utgst:line.evidence!.profile.rates.utgst===0&&line.evidence!.profile.rates.cgst===line.evidence!.profile.rates.sgst));
 }catch{return false;}
}
