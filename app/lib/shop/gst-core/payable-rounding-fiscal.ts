import {verifyFiscalHash,fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION,type FiscalEnvelope,type FiscalHashRecord} from './fiscal-integrity';
import {mixedGstFiscalConsistent,type MixedFiscalPayload} from './mixed-gst-fiscal';
import {invoiceIntegrity} from './invoice-integrity';
import {fiscalTotalsConsistent} from './fiscal-totals-integrity';
import {validateContext,type TaxTotals,type GstContext} from './gst';
import {createPayableRoundingEvidence,verifyPayableRoundingEvidence,type PayableRoundingEvidence} from './payable-rounding-evidence';
type SignedInvoice=FiscalEnvelope&FiscalHashRecord;
export interface RoundedFiscalPayload {format:'samaan_rounded_fiscal_v1';originalInvoice:SignedInvoice;rounding:PayableRoundingEvidence;finalPayable:string}
function originalPayable(original:SignedInvoice){
 if(verifyFiscalHash(original)!=='verified'||original.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||!['tax_invoice','invoice_cum_bill_of_supply'].includes(original.type)||original.originalNumber!=null)throw Error('invalid_rounding_fiscal_source');
 const payload=original.payload as MixedFiscalPayload;
 if(payload?.format==='samaan_mixed_fiscal_v1'){if(!mixedGstFiscalConsistent(original))throw Error('invalid_rounding_fiscal_source');return payload.invoice.payable;}
 const ordinary=original.payload as {totals:TaxTotals;context:GstContext};
 if(invoiceIntegrity(ordinary,[original])!=='verified'||!fiscalTotalsConsistent(ordinary.totals))throw Error('invalid_rounding_fiscal_source');
 const allocation=ordinary.context?.allocation;
 if(ordinary.context?.settings.registration!=='regular'||!allocation||typeof allocation.id!=='string'||!allocation.id.trim()||!Number.isInteger(allocation.index)||allocation.index<1||allocation.index>100||allocation.number!==original.number||original.type!==(ordinary.totals.lines.some(line=>line.category!=='taxable')?'invoice_cum_bill_of_supply':'tax_invoice')||original.type==='invoice_cum_bill_of_supply'&&ordinary.context.buyer?.gstin)throw Error('invalid_rounding_fiscal_source');
 validateContext(ordinary.context,ordinary.totals.total);
 return ordinary.totals.total.toFixed(2);
}
/** Candidate hashed fiscal representation. Caller must authorize profiles/numbering and persist atomically. */
export function buildRoundedFiscalDocument(original:SignedInvoice,policy:unknown){
 const retained=structuredClone(original),before=originalPayable(retained);
 const rounding=createPayableRoundingEvidence(retained.shopId,new Date(retained.issuedAt).toISOString(),before,policy,{saleId:retained.saleId,number:retained.number});
 const payload:RoundedFiscalPayload={format:'samaan_rounded_fiscal_v1',originalInvoice:retained,rounding,finalPayable:rounding.snapshot.calculation.payable};
 const document:FiscalEnvelope={shopId:retained.shopId,saleId:retained.saleId,issuer:retained.issuer,financialYear:retained.financialYear,number:retained.number,type:retained.type,issuedAt:retained.issuedAt,originalNumber:null,payload};
 return {...document,hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash(document)};
}
export function roundedFiscalConsistent(document:SignedInvoice):boolean{
 try{
  if(document.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||verifyFiscalHash(document)!=='verified')return false;
  const payload=document.payload as RoundedFiscalPayload;if(payload?.format!=='samaan_rounded_fiscal_v1'||Object.keys(payload).some(k=>!['format','originalInvoice','rounding','finalPayable'].includes(k)))return false;
  const original=payload.originalInvoice,before=originalPayable(original);
  for(const key of ['shopId','saleId','issuer','financialYear','number','type'] as const)if(document[key]!==original[key])return false;
  if(document.originalNumber!=null||new Date(document.issuedAt).getTime()!==new Date(original.issuedAt).getTime())return false;
  const snapshot=verifyPayableRoundingEvidence(payload.rounding,{shopId:document.shopId,issuedAt:new Date(document.issuedAt).toISOString(),before,document:{saleId:document.saleId,number:document.number}});
  return payload.finalPayable===snapshot.calculation.payable;
 }catch{return false;}
}
