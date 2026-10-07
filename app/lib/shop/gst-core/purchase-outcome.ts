import {purchaseReviewSignature} from './purchase-review-draft';
import {validSavedItcReviewShape} from './purchase-request-shape';
import type {PurchaseDetail,GstSupplier,PurchaseSettlementInput,SettlementReversalInput,PurchaseReturnInput,InputTaxReview} from '../gst-types';
import type {Buyer} from './gst';
import type {PurchaseInput} from './purchase-gst';
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
function invoiceHasSettlement(entries:unknown,row:Record<string,unknown>):boolean{
 return Array.isArray(entries)&&entries.some(entry=>entry&&typeof entry==='object'&&['id','kind','amount','method','occurredAt','evidenceReference','note','reversesId'].every(key=>(entry as Record<string,unknown>)[key]===row[key]));
}
/** Only a scoped recorded receipt can release the original local request. */
export function recordedPurchaseResult(value:unknown,shopId:string,input:Pick<PurchaseInput,'clientId'|'invoiceNumber'|'invoiceDate'>):{invoice:PurchaseDetail;deduplicated:true}{
 const result=value as {status?:unknown;deduplicated?:unknown;invoice?:Record<string,unknown>}|null;
 const invoice=result?.invoice,snapshot=invoice?.snapshot as Record<string,unknown>|undefined;
 if(!uuid(shopId)||!uuid(input?.clientId)||typeof input?.invoiceNumber!=='string'||typeof input?.invoiceDate!=='string'||result?.status!=='recorded'||result.deduplicated!==true||!invoice||!uuid(invoice.id)||!uuid(invoice.shopId)||!uuid(invoice.clientId)||invoice.shopId.toLowerCase()!==shopId.toLowerCase()||invoice.clientId.toLowerCase()!==input.clientId.toLowerCase()||snapshot?.invoiceNumber!==input.invoiceNumber||snapshot.invoiceDate!==input.invoiceDate||!Array.isArray(invoice.items))throw new Error('purchase_request_outcome_unconfirmed');
 return {invoice:invoice as unknown as PurchaseDetail,deduplicated:true};
}
export function recordedSupplierResult(value:unknown,shopId:string,input:{clientId:string;identity:Buyer}):GstSupplier{
 const result=value as {status?:unknown;supplier?:Record<string,unknown>}|null;
 const supplier=result?.supplier,identity=supplier?.identity as Record<string,unknown>|undefined;
 if(!uuid(shopId)||!uuid(input?.clientId)||result?.status!=='recorded'||!supplier||!uuid(supplier.id)||!uuid(supplier.shopId)||!uuid(supplier.clientId)||supplier.shopId.toLowerCase()!==shopId.toLowerCase()||supplier.clientId.toLowerCase()!==input.clientId.toLowerCase()||!identity||(['name','gstin','address','stateCode'] as const).some(key=>typeof identity[key]!=='string'||typeof input.identity?.[key]!=='string'||identity[key]!== (key==='gstin'?input.identity[key].trim().toUpperCase():input.identity[key].trim())))throw new Error('purchase_request_outcome_unconfirmed');
 return supplier as unknown as GstSupplier;
}

function recordedMoneyResult(value:unknown,shopId:string,invoiceId:string,input:PurchaseSettlementInput,expectedKind:string,reversesId:string|null):PurchaseDetail{
 const result=value as {status?:unknown;invoice?:Record<string,unknown>;settlement?:Record<string,unknown>}|null;
 const row=result?.settlement,invoice=result?.invoice;
 const amount=typeof input?.amount==='string'&&/^\d{1,10}(\.\d{1,2})?$/.test(input.amount)?input.amount.split('.'):null;
 const expectedAmount=amount?`${BigInt(amount[0])}.${(amount[1]??'').padEnd(2,'0')}`:null;
 const time=typeof input?.occurredAt==='string'?Date.parse(input.occurredAt):NaN;
 const rowTime=typeof row?.occurredAt==='string'?Date.parse(row.occurredAt):NaN;
 if(!uuid(shopId)||!uuid(invoiceId)||!uuid(input?.clientId)||result?.status!=='recorded'||!row||!invoice||!uuid(row.id)||!uuid(row.shopId)||!uuid(row.invoiceId)||!uuid(row.clientId)||!uuid(invoice.id)||!uuid(invoice.shopId)||row.shopId.toLowerCase()!==shopId.toLowerCase()||invoice.shopId.toLowerCase()!==shopId.toLowerCase()||row.invoiceId.toLowerCase()!==invoiceId.toLowerCase()||invoice.id.toLowerCase()!==invoiceId.toLowerCase()||row.clientId.toLowerCase()!==input.clientId.toLowerCase()||row.kind!==expectedKind||!['payment','supplier_refund'].includes(input.kind)||row.reversesId!==reversesId||row.amount!==expectedAmount||row.method!==input.method||!['cash','upi','bank','card'].includes(input.method)||!Number.isFinite(time)||rowTime!==time||typeof input.evidenceReference!=='string'||row.evidenceReference!==input.evidenceReference.trim()||typeof input.note!=='string'||row.note!==input.note.trim()||!invoiceHasSettlement(invoice.settlements,row))throw new Error('purchase_request_outcome_unconfirmed');
 return invoice as unknown as PurchaseDetail;
}

export function recordedPurchaseSettlementResult(value:unknown,shopId:string,invoiceId:string,input:PurchaseSettlementInput):PurchaseDetail{
 return recordedMoneyResult(value,shopId,invoiceId,input,input?.kind,null);
}
export function recordedPurchaseSettlementReversalResult(value:unknown,shopId:string,invoiceId:string,input:SettlementReversalInput):PurchaseDetail{
 const result=value as {originalSettlement?:Record<string,unknown>;invoice?:{settlements?:unknown}}|null;
 const original=result?.originalSettlement;
 if(!uuid(shopId)||!uuid(invoiceId)||!uuid(input?.settlementId)||!original||!uuid(original.id)||!uuid(original.shopId)||!uuid(original.invoiceId)||original.id.toLowerCase()!==input.settlementId.toLowerCase()||original.shopId.toLowerCase()!==shopId.toLowerCase()||original.invoiceId.toLowerCase()!==invoiceId.toLowerCase()||!['payment','supplier_refund'].includes(original.kind as string)||typeof original.amount!=='string'||typeof original.method!=='string'||original.reversesId!==null||!invoiceHasSettlement(result?.invoice?.settlements,original))throw new Error('purchase_request_outcome_unconfirmed');
 const expected={...input,kind:original.kind,amount:original.amount,method:original.method} as PurchaseSettlementInput;
 return recordedMoneyResult(value,shopId,invoiceId,expected,original.kind==='payment'?'payment_reversal':'supplier_refund_reversal',original.id);
}

export function recordedPurchaseReturnResult(value:unknown,shopId:string,invoiceId:string,input:PurchaseReturnInput):PurchaseDetail{
 const result=value as {status?:unknown;invoice?:Record<string,unknown>;credit?:Record<string,unknown>;items?:unknown}|null;
 const invoice=result?.invoice,credit=result?.credit;
 const originalTime=typeof input?.issuedAt==='string'?Date.parse(input.issuedAt):NaN;
 const recordedTime=typeof credit?.issuedAt==='string'?Date.parse(credit.issuedAt):NaN;
 if(!uuid(shopId)||!uuid(invoiceId)||!uuid(input?.clientId)||result?.status!=='recorded'||!invoice||!credit||!uuid(invoice.id)||!uuid(invoice.shopId)||!uuid(credit.id)||!uuid(credit.shopId)||!uuid(credit.invoiceId)||!uuid(credit.clientId)||invoice.id.toLowerCase()!==invoiceId.toLowerCase()||invoice.shopId.toLowerCase()!==shopId.toLowerCase()||credit.shopId.toLowerCase()!==shopId.toLowerCase()||credit.invoiceId.toLowerCase()!==invoiceId.toLowerCase()||credit.clientId.toLowerCase()!==input.clientId.toLowerCase()||credit.supplierCreditNumber!==input.supplierCreditNumber||!Number.isFinite(originalTime)||recordedTime!==originalTime||typeof input.evidenceReference!=='string'||credit.evidenceReference!==input.evidenceReference.trim()||typeof input.reason!=='string'||credit.reason!==input.reason.trim()||!Array.isArray(invoice.returns)||!invoice.returns.some(entry=>entry&&typeof entry==='object'&&['id','supplierCreditNumber','issuedAt','evidenceReference','reason','netAmount','taxAmount','grossAmount'].every(key=>(entry as Record<string,unknown>)[key]===credit[key]))||!Array.isArray(input.items)||!input.items.length||new Set(input.items.map(item=>item?.purchaseItemId)).size!==input.items.length||!Array.isArray(result.items)||result.items.length!==input.items.length||!Array.isArray(invoice.returnItems))throw new Error('purchase_request_outcome_unconfirmed');
 const seen=new Set<string>();
 for(const raw of result.items){
  const row=raw as Record<string,unknown>|null;
  if(!row||!uuid(row.id)||!uuid(row.shopId)||!uuid(row.invoiceId)||!uuid(row.returnId)||!uuid(row.purchaseItemId)||row.shopId.toLowerCase()!==shopId.toLowerCase()||row.invoiceId.toLowerCase()!==invoiceId.toLowerCase()||row.returnId.toLowerCase()!==credit.id.toLowerCase()||seen.has(row.purchaseItemId))throw new Error('purchase_request_outcome_unconfirmed');
  seen.add(row.purchaseItemId);
  const original=input.items.find(item=>uuid(item?.purchaseItemId)&&item.purchaseItemId.toLowerCase()===(row.purchaseItemId as string).toLowerCase());
  if(!original||!Number.isFinite(original.quantity)||typeof row.quantity!=='string'||!/^\d+(\.\d{1,3})?$/.test(row.quantity)||Number(row.quantity)!==original.quantity||row.removeStock!==original.removeStock||!invoice.returnItems.some(entry=>entry&&typeof entry==='object'&&['id','returnId','purchaseItemId','quantity','removeStock'].every(key=>(entry as Record<string,unknown>)[key]===row[key])))throw new Error('purchase_request_outcome_unconfirmed');
 }
 return invoice as unknown as PurchaseDetail;
}

export function recordedInputTaxReviewResult(value:unknown,shopId:string,invoiceId:string,input:InputTaxReview):PurchaseDetail{
 const result=value as {status?:unknown;invoice?:Record<string,unknown>;review?:Record<string,unknown>}|null;
 const invoice=result?.invoice,review=result?.review;
 if(!uuid(shopId)||!uuid(invoiceId)||!validSavedItcReviewShape(input)||!uuid(input.clientId)||result?.status!=='recorded'||!invoice||!review||!uuid(invoice.id)||!uuid(invoice.shopId)||!uuid(review.id)||!uuid(review.shopId)||!uuid(review.invoiceId)||!uuid(review.clientId)||invoice.id.toLowerCase()!==invoiceId.toLowerCase()||invoice.shopId.toLowerCase()!==shopId.toLowerCase()||review.shopId.toLowerCase()!==shopId.toLowerCase()||review.invoiceId.toLowerCase()!==invoiceId.toLowerCase()||review.clientId.toLowerCase()!==input.clientId.toLowerCase()||review.decision!==input.decision||review.note!==input.note.trim()||review.evidenceReference!==input.evidenceReference.trim()||purchaseReviewSignature(review.conditions)!==purchaseReviewSignature(input.conditions)||!Number.isInteger(review.sequence)||Number(review.sequence)<1||!Array.isArray(invoice.reviews)||!invoice.reviews.some(entry=>entry&&typeof entry==='object'&&purchaseReviewSignature({id:(entry as Record<string,unknown>).id,sequence:(entry as Record<string,unknown>).sequence,decision:(entry as Record<string,unknown>).decision,conditions:(entry as Record<string,unknown>).conditions,note:(entry as Record<string,unknown>).note,evidenceReference:(entry as Record<string,unknown>).evidenceReference})===purchaseReviewSignature({id:review.id,sequence:review.sequence,decision:review.decision,conditions:review.conditions,note:review.note,evidenceReference:review.evidenceReference}))||!Array.isArray(invoice.ledger)||!invoice.ledger.some(entry=>entry&&typeof entry==='object'&&uuid((entry as Record<string,unknown>).id)&&(entry as Record<string,unknown>).sourceId===review.id&&(entry as Record<string,unknown>).kind==='review_decision'&&(entry as Record<string,unknown>).shopId===review.shopId&&(entry as Record<string,unknown>).invoiceId===review.invoiceId))throw new Error('purchase_request_outcome_unconfirmed');
 return invoice as unknown as PurchaseDetail;
}
