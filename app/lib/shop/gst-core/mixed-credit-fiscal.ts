import {financialYear,GstError} from './gst';
import {fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION,verifyFiscalHash,type FiscalEnvelope,type FiscalHashRecord} from './fiscal-integrity';
import {mixedGstFiscalConsistent,type MixedFiscalPayload} from './mixed-gst-fiscal';
import {projectMixedGstReturn,planMixedGstReturn,type MixedReturnSelection,type MixedReturnHistory,type MixedReturnProjection} from './mixed-gst-return';
import {canonicalJson} from './sale-request-canonical';
import {returnSettlementConsistent} from './return-settlement-integrity';
type Document=FiscalEnvelope&FiscalHashRecord;
export interface MixedCreditPayload {
 format:'samaan_mixed_credit_v1';
 settlement?:import('./sale-return-settlement.js').ReturnSettlementPlan|null;
 original:Document;
 returnId:string;
 requestId:string;
 createdBy:string;
 selections:MixedReturnSelection[];
 projection:MixedReturnProjection;
 taxAdjustmentStatus:'review_required';
}
/** Transaction caller supplies a locked, verified original and authoritative history. */
export function buildMixedCreditDocument(original:Document,identity:{number:string;issuedAt:Date|string;returnId:string;requestId:string;createdBy:string;settlement?:import('./sale-return-settlement.js').ReturnSettlementPlan|null},selections:readonly MixedReturnSelection[]){
 const retained=structuredClone(original);
 if(!mixedGstFiscalConsistent(retained))throw new GstError('invalid_mixed_credit_original');
 const payload:MixedCreditPayload={format:'samaan_mixed_credit_v1',original:retained,returnId:identity.returnId,requestId:identity.requestId,createdBy:identity.createdBy,selections:structuredClone([...selections]),projection:projectMixedGstReturn((retained.payload as MixedFiscalPayload).invoice,selections),taxAdjustmentStatus:'review_required',...(identity.settlement===undefined?{}:{settlement:structuredClone(identity.settlement)})};
 const envelope:FiscalEnvelope={shopId:retained.shopId,saleId:retained.saleId,issuer:retained.issuer,financialYear:financialYear(new Date(identity.issuedAt)),number:identity.number,type:'credit_note',issuedAt:identity.issuedAt,originalNumber:retained.number,payload};
 const document={...envelope,hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash(envelope)};
 if(!mixedCreditConsistent(document,retained))throw new GstError('invalid_mixed_credit_evidence');
 return document;
}
/** A valid hash alone cannot prove original identity or correct reversal arithmetic. */
export function mixedCreditConsistent(document:Document,original:Document):boolean{
 try{
  if(document.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||verifyFiscalHash(document)!=='verified'||!mixedGstFiscalConsistent(original))return false;
  const p=document.payload as MixedCreditPayload;
  if(p?.format!=='samaan_mixed_credit_v1'||p.taxAdjustmentStatus!=='review_required'||[p.returnId,p.requestId,p.createdBy].some(v=>typeof v!=='string'||!v.trim()))return false;
  if(!mixedGstFiscalConsistent(p.original)||p.original.hash!==original.hash)return false;
  if(p.settlement!==undefined&&p.settlement!==null&&!returnSettlementConsistent(p.settlement,p.projection.creditValue))return false;
  const issued=new Date(document.issuedAt).getTime();
  if(!Number.isFinite(issued)||issued<new Date(original.issuedAt).getTime()||document.financialYear!==financialYear(new Date(issued)))return false;
  if(document.type!=='credit_note'||document.number===original.number||document.originalNumber!==original.number||document.shopId!==original.shopId||document.saleId!==original.saleId||document.issuer!==original.issuer)return false;
  return canonicalJson(projectMixedGstReturn((original.payload as MixedFiscalPayload).invoice,p.selections))===canonicalJson(p.projection);
 }catch{return false;}
}
/** Verify every history document against the same original before cumulative replay. */
export function planMixedCreditFromDocuments(original:Document,documents:readonly Document[],rows:Parameters<typeof planMixedGstReturn>[2],request:Parameters<typeof planMixedGstReturn>[3]){
 if(!mixedGstFiscalConsistent(original))throw new GstError('invalid_mixed_credit_original');
 const identities=new Set<string>();
 const requests=new Set<string>();
 let previousIssuedAt=new Date(original.issuedAt).getTime();
 const history:MixedReturnHistory[]=documents.map(document=>{
  if(!mixedCreditConsistent(document,original)||identities.has(document.number))throw new GstError('mixed_credit_history_invalid');identities.add(document.number);
  const p=document.payload as MixedCreditPayload;
  const issuedAt=new Date(document.issuedAt).getTime();
  if(requests.has(p.requestId)||issuedAt<previousIssuedAt)throw new GstError('mixed_credit_history_invalid');
  requests.add(p.requestId);previousIssuedAt=issuedAt;
  return {id:p.returnId,selections:p.selections,projection:p.projection};
 });
 return planMixedGstReturn((original.payload as MixedFiscalPayload).invoice,history,rows,request);
}
