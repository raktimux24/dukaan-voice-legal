import {planMixedCreditFromDocuments} from './gst-core/mixed-credit-fiscal';
import {planRoundedMixedCreditFromDocuments,planRoundedOrdinaryCreditFromDocuments} from './gst-core/payable-rounding-credit-fiscal';
import {verifyDocument} from './gst-document';
import type {FiscalEnvelope,FiscalHashRecord} from './gst-core/fiscal-integrity';
import type {Sale} from './types';
import type {FiscalDocument} from './gst-types';
/** Replay the original immutable document and cumulative credits before offering a special return. */
export async function verifiedReturnDocuments(shopId:string,saleId:string,documents:FiscalDocument[]){
 if(documents.some(d=>d.shopId!==shopId||d.saleId!==saleId))throw Error('The return documents belong to another bill.');
 return Promise.all(documents.map(d=>verifyDocument(d,shopId,saleId)));
}
export function specialReturnPreview(sale:Sale,documents:FiscalDocument[],quantities:Record<string,string>,requestId:string,unpaidCredit:string){
 if(sale.gstIntegrity!=='verified'||sale.returnPlanningError)throw Error('The retained return evidence needs review.');
 const originals=documents.filter(d=>d.type!=='credit_note'&&d.type!=='debit_note');
 if(originals.length!==1)throw Error('The original retained invoice is missing or duplicated.');
 const original=originals[0] as FiscalEnvelope&FiscalHashRecord;
 const history=documents.filter(d=>d.type==='credit_note').sort((a,b)=>Date.parse(a.issuedAt)-Date.parse(b.issuedAt)) as (FiscalEnvelope&FiscalHashRecord)[];
 const selections=sale.items.filter(item=>Number(quantities[item.id])>0).map(item=>({lineId:item.id,returning:Number(quantities[item.id])}));
 if(!selections.length)return null;
 if(Object.entries(quantities).some(([id,v])=>!sale.items.some(item=>item.id===id)||!Number.isFinite(Number(v))||Number(v)<0))throw Error('Enter valid return quantities.');
 const rows=sale.items.map((item,index)=>({lineId:item.id,lineIndex:index,returnedQuantity:item.returnedQuantity}));
 if(sale.roundingEvidence){
  const input={requestId,initialUnpaidCredit:sale.creditTotal.toFixed(2),currentUnpaidCredit:unpaidCredit};
  const plan=sale.mixedGstSnapshot?planRoundedMixedCreditFromDocuments(original,history,rows,selections,input):planRoundedOrdinaryCreditFromDocuments(original,history,rows,selections,input);
  return {total:Number(plan.rounding.settlement.payable),creditReduction:Number(plan.rounding.settlement.creditReduced),moneyRefund:Number(plan.rounding.settlement.refundAmount)};
 }
 const plan=planMixedCreditFromDocuments(original,history,rows,selections);
 return {total:Number(plan.projection.creditValue),creditReduction:null,moneyRefund:null};
}
