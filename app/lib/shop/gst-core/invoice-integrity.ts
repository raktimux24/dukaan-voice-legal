import {fiscalHash,verifyFiscalHash,FISCAL_DOCUMENT_HASH_VERSION,type FiscalHashRecord} from './fiscal-integrity';
import {financialYear,gstEffectiveTime} from './gst';
export type InvoiceIntegrity='verified'|'mismatch'|'legacy_unverifiable'|'missing';
export function invoiceIntegrity(projectedPayload:unknown,documents:FiscalHashRecord[]):InvoiceIntegrity{
 if(documents.length!==1)return documents.length?'mismatch':'missing';
 const doc=documents[0],status=verifyFiscalHash(doc);
 if(status==='mismatch'||fiscalHash(projectedPayload)!==fiscalHash(doc.payload))return 'mismatch';
 if(doc.hashVersion===FISCAL_DOCUMENT_HASH_VERSION){try{
  const p=projectedPayload as {invoiceNumber:string;documentType:string;context:{issuedAt:string;settings:{gstin:string};allocation:{financialYear:string}}};
  const instant=gstEffectiveTime(p.context.issuedAt);
  if(!p.context.issuedAt.includes('T')||p.invoiceNumber!==doc.number||p.documentType!==doc.type||p.context.settings.gstin!==doc.issuer||instant!==new Date(doc.issuedAt!).getTime()||p.context.allocation.financialYear!==doc.financialYear||financialYear(new Date(instant))!==doc.financialYear)return 'mismatch';
 }catch{return 'mismatch';}}
 return status;
}
