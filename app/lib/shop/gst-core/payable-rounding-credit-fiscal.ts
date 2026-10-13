import {ordinaryCreditConsistent,verifyOrdinaryCreditHistory,planOrdinaryCreditFromDocuments,type OrdinaryReturnRow} from './ordinary-credit-fiscal';
import {verifyMixedReturnHistory} from './mixed-gst-return';
import type {MixedFiscalPayload} from './mixed-gst-fiscal';
import {fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION,verifyFiscalHash,type FiscalEnvelope,type FiscalHashRecord} from './fiscal-integrity';
import {roundedFiscalConsistent,type RoundedFiscalPayload} from './payable-rounding-fiscal';
import {mixedCreditConsistent,planMixedCreditFromDocuments,type MixedCreditPayload} from './mixed-credit-fiscal';
import {createRoundedReturnEvidence,verifyRoundedReturnEvidence,type RoundedReturnInput,type RoundedReturnEvidence} from './payable-rounding-return-evidence';
type Document=FiscalEnvelope&FiscalHashRecord;
export interface RoundedCreditPayload {format:'samaan_rounded_credit_v1';original:Document;taxCredit:Document;rounding:RoundedReturnEvidence;finalCreditValue:string}
function basis(original:Document){const p=original.payload as RoundedFiscalPayload;return {shopId:original.shopId,issuedAt:new Date(original.issuedAt).toISOString(),before:p.rounding.snapshot.calculation.before,document:p.rounding.document};}
/** Tax credit must be constructed from the original unrounded source; caller owns cumulative history/ledger locks. */
export function buildRoundedCreditDocument(original:Document,taxCredit:Document,request:RoundedReturnInput):Document {
 const retained=structuredClone(original),credit=structuredClone(taxCredit);
 if(!roundedFiscalConsistent(retained))throw Error('invalid_rounded_credit_original');
 const p=retained.payload as RoundedFiscalPayload;
 const rounding=createRoundedReturnEvidence(p.rounding,basis(retained),request);
 const payload:RoundedCreditPayload={format:'samaan_rounded_credit_v1',original:retained,taxCredit:credit,rounding,finalCreditValue:rounding.settlement.payable};
 const envelope:FiscalEnvelope={shopId:credit.shopId,saleId:credit.saleId,issuer:credit.issuer,financialYear:credit.financialYear,number:credit.number,type:credit.type,issuedAt:credit.issuedAt,originalNumber:credit.originalNumber,payload};
 const result={...envelope,hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash(envelope)};
 if(!roundedCreditConsistent(result,retained,request))throw Error('invalid_rounded_credit_evidence');
 return result;
}
export function roundedCreditConsistent(document:Document,original:Document,request:RoundedReturnInput):boolean {
 try {
  if(document.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||verifyFiscalHash(document)!=='verified'||!roundedFiscalConsistent(original))return false;
  const p=document.payload as RoundedCreditPayload,source=original.payload as RoundedFiscalPayload;
  if(p?.format!=='samaan_rounded_credit_v1'||Object.keys(p).length!==5||Object.keys(p).some(k=>!['format','original','taxCredit','rounding','finalCreditValue'].includes(k))||!roundedFiscalConsistent(p.original)||p.original.hash!==original.hash)return false;
  if((p.taxCredit.payload as {format?:string})?.format==='samaan_ordinary_credit_v1'? !ordinaryCreditConsistent(p.taxCredit,source.originalInvoice):!mixedCreditConsistent(p.taxCredit,source.originalInvoice))return false;
  const tax=p.taxCredit.payload as MixedCreditPayload;
  // The source projection preserves tax basis; monetary settlement belongs to the rounded wrapper.
  if(tax.settlement!=null||tax.requestId!==request.requestId)return false;
  for(const key of ['shopId','saleId','issuer','financialYear','number','type','originalNumber'] as const)if(document[key]!==p.taxCredit[key])return false;
  if(new Date(document.issuedAt).getTime()!==new Date(p.taxCredit.issuedAt).getTime())return false;
  const evidence=verifyRoundedReturnEvidence(p.rounding,source.rounding,basis(original),request);
  return evidence.settlement.before===tax.projection.creditValue&&p.finalCreditValue===evidence.settlement.payable;
 }catch{return false;}
}

/** Replay verified tax quantities and cumulative financial credit before planning the next return.
 * Caller must lock documents/rows and independently verify original credit and ledger movements.
 */
function verifiedRoundedFinancialHistory(original:Document,documents:readonly Document[],initialUnpaidCredit:string){
 const retained=structuredClone(original),history=structuredClone([...documents]),state={initialUnpaidCredit};
 if(!roundedFiscalConsistent(retained))throw Error('invalid_rounded_credit_original');
 const cents=(value:string)=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw Error('rounded_credit_history_invalid');return BigInt(value.replace('.',''));};
 const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
 const source=retained.payload as RoundedFiscalPayload;
 let cumulative=0n,unpaid=cents(state.initialUnpaidCredit),issued=new Date(retained.issuedAt).getTime();
 if(unpaid>cents(source.finalPayable))throw Error('rounded_credit_history_invalid');
 const requests=new Set<string>(),numbers=new Set<string>();
 const taxDocuments=history.map(document=>{
  const p=document.payload as RoundedCreditPayload,request=p?.rounding?.request;
  if(!request||!roundedCreditConsistent(document,retained,request)||requests.has(request.requestId)||numbers.has(document.number)||new Date(document.issuedAt).getTime()<issued||cents(request.beforeReturned)!==cumulative||cents(request.unpaidCredit)>unpaid)throw Error('rounded_credit_history_invalid');
  requests.add(request.requestId);numbers.add(document.number);issued=new Date(document.issuedAt).getTime();
  cumulative=cents(request.afterReturned);unpaid=cents(p.rounding.settlement.remainingUnpaidCredit);
  return p.taxCredit;
 });
 return {source,taxDocuments,beforeReturned:decimal(cumulative),remainingUnpaidCredit:decimal(unpaid),requests:[...requests]};
}
export function verifyRoundedMixedCreditHistory(original:Document,documents:readonly Document[],rows:Parameters<typeof planMixedCreditFromDocuments>[2],initialUnpaidCredit:string){
 const history=verifiedRoundedFinancialHistory(original,documents,initialUnpaidCredit);
 if(history.taxDocuments.some(document=>(document.payload as {format?:string})?.format!=='samaan_mixed_credit_v1'))throw Error('rounded_credit_history_invalid');
 verifyMixedReturnHistory((history.source.originalInvoice.payload as MixedFiscalPayload).invoice,history.taxDocuments.map(document=>{const p=document.payload as MixedCreditPayload;return {id:p.returnId,selections:p.selections,projection:p.projection};}),rows);
 const {source,...result}=history;return result;
}
export function verifyRoundedOrdinaryCreditHistory(original:Document,documents:readonly Document[],rows:readonly OrdinaryReturnRow[],initialUnpaidCredit:string){
 const history=verifiedRoundedFinancialHistory(original,documents,initialUnpaidCredit);
 if(history.taxDocuments.some(document=>(document.payload as {format?:string})?.format!=='samaan_ordinary_credit_v1'))throw Error('rounded_credit_history_invalid');
 verifyOrdinaryCreditHistory(history.source.originalInvoice,history.taxDocuments,rows);
 const {source,...result}=history;return result;
}
export function planRoundedOrdinaryCreditFromDocuments(original:Document,documents:readonly Document[],rows:readonly OrdinaryReturnRow[],selections:readonly {lineId:string;returning:number}[],input:{requestId:string;initialUnpaidCredit:string;currentUnpaidCredit:string}){
 const retained=structuredClone(original),state=structuredClone(input),source=retained.payload as RoundedFiscalPayload;
 const history=verifyRoundedOrdinaryCreditHistory(retained,documents,rows,state.initialUnpaidCredit);
 const cents=(value:string)=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw Error('rounded_credit_history_invalid');return BigInt(value.replace('.',''));};
 const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
 if(history.requests.includes(state.requestId)||cents(state.currentUnpaidCredit)>cents(history.remainingUnpaidCredit))throw Error('rounded_credit_history_invalid');
 const plan=planOrdinaryCreditFromDocuments(source.originalInvoice,history.taxDocuments,rows,selections);
 const request={requestId:state.requestId,beforeReturned:history.beforeReturned,afterReturned:decimal(cents(history.beforeReturned)+cents(plan.projection.creditValue)),unpaidCredit:state.currentUnpaidCredit};
 return {...plan,request,rounding:createRoundedReturnEvidence(source.rounding,basis(retained),request)};
}
export function planRoundedMixedCreditFromDocuments(original:Document,documents:readonly Document[],rows:Parameters<typeof planMixedCreditFromDocuments>[2],selections:Parameters<typeof planMixedCreditFromDocuments>[3],input:{requestId:string;initialUnpaidCredit:string;currentUnpaidCredit:string}){
 const retained=structuredClone(original),state=structuredClone(input),source=retained.payload as RoundedFiscalPayload;
 const history=verifyRoundedMixedCreditHistory(retained,documents,rows,state.initialUnpaidCredit);
 const cents=(value:string)=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw Error('rounded_credit_history_invalid');return BigInt(value.replace('.',''));};
 const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
 if(history.requests.includes(state.requestId)||cents(state.currentUnpaidCredit)>cents(history.remainingUnpaidCredit))throw Error('rounded_credit_history_invalid');
 const plan=planMixedCreditFromDocuments(source.originalInvoice,history.taxDocuments,structuredClone([...rows]),structuredClone([...selections]));
 const request={requestId:state.requestId,beforeReturned:history.beforeReturned,afterReturned:decimal(cents(history.beforeReturned)+cents(plan.projection.creditValue)),unpaidCredit:state.currentUnpaidCredit};
 const rounding=createRoundedReturnEvidence(source.rounding,basis(retained),request);
 return {...plan,request,rounding};
}

/** Mixed-specific callers continue to reject an ordinary source. */
export function roundedMixedCreditConsistent(document:Document,original:Document,request:RoundedReturnInput):boolean{
 return (document.payload as RoundedCreditPayload)?.taxCredit?.payload!=null&&((document.payload as RoundedCreditPayload).taxCredit.payload as {format?:string})?.format==='samaan_mixed_credit_v1'&&roundedCreditConsistent(document,original,request);
}
export function buildRoundedMixedCreditDocument(original:Document,taxCredit:Document,request:RoundedReturnInput):Document{
 if((taxCredit.payload as {format?:string})?.format!=='samaan_mixed_credit_v1')throw Error('invalid_rounded_credit_evidence');
 return buildRoundedCreditDocument(original,taxCredit,request);
}
