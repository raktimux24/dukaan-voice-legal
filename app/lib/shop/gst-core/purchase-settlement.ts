import {GstError} from './gst';
export type SettlementKind='payment'|'supplier_refund'|'payment_reversal'|'supplier_refund_reversal';
export interface PurchaseSettlementInput {clientId:string;kind:'payment'|'supplier_refund';amount:string;method:'cash'|'upi'|'bank'|'card';occurredAt:string;evidenceReference:string;note:string}
const paise=(amount:string)=>{
 if(typeof amount!=='string'||!/^\d{1,10}(\.\d{1,2})?$/.test(amount))throw new GstError('invalid_settlement_amount');
 const [whole,fraction='']=amount.split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
};
const money=(value:bigint)=>`${value/100n}.${(value%100n).toString().padStart(2,'0')}`;
export function purchaseSettlement(gross:string,credits:string[],movements:{kind:SettlementKind;amount:string}[]){
 const invoice=paise(gross),credited=credits.reduce((sum,value)=>sum+paise(value),0n);
 if(credited>invoice)throw new GstError('purchase_settlement_reconciliation_required');
 let paid=0n,refunded=0n;
 for(const row of movements){if(row.kind==='payment')paid+=paise(row.amount);else if(row.kind==='supplier_refund')refunded+=paise(row.amount);else if(row.kind==='payment_reversal')paid-=paise(row.amount);else if(row.kind==='supplier_refund_reversal')refunded-=paise(row.amount);else throw new GstError('purchase_settlement_reconciliation_required');}
 if(paid<0n||refunded<0n||refunded>paid)throw new GstError('purchase_settlement_reconciliation_required');
 const due=invoice-credited-paid+refunded;
 return {invoiceGross:money(invoice),creditedGross:money(credited),paid:money(paid),supplierRefunds:money(refunded),outstanding:money(due>0n?due:0n),recoverable:money(due<0n?-due:0n),status:due>0n?'payable':due<0n?'supplier_owes':'settled'} as const;
}
export function normalizeSettlementIdentity(input:PurchaseSettlementInput):PurchaseSettlementInput{
 if(!input||typeof input!=='object'||Array.isArray(input)||typeof input.clientId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.clientId)||!['payment','supplier_refund'].includes(input.kind)||!['cash','upi','bank','card'].includes(input.method))throw new GstError('invalid_purchase_settlement');
 const amount=paise(input.amount);if(amount<=0n)throw new GstError('invalid_settlement_amount');
 const time=typeof input.occurredAt==='string'?Date.parse(input.occurredAt):NaN;if(!Number.isFinite(time))throw new GstError('invalid_settlement_date');
 if(typeof input.evidenceReference!=='string'||!input.evidenceReference.trim()||input.evidenceReference.length>1000||typeof input.note!=='string'||input.note.length>1000)throw new GstError('settlement_evidence_required');
 return {clientId:input.clientId,kind:input.kind,method:input.method,amount:money(amount),occurredAt:new Date(time).toISOString(),evidenceReference:input.evidenceReference.trim(),note:input.note.trim()};
}

export function normalizeSettlement(input:PurchaseSettlementInput,invoiceDate:Date):PurchaseSettlementInput{
 const normalized=normalizeSettlementIdentity(input),time=Date.parse(normalized.occurredAt);
 if(time<invoiceDate.getTime()||time>Date.now()+60000)throw new GstError('invalid_settlement_date');
 return normalized;
}

/** Preview only: server locking and idempotent request recovery remain authoritative. */
export function canReversePurchaseSettlement(
 gross:string, credits:string[],
 movements:{id:string;kind:SettlementKind;amount:string;reversesId:string|null}[],
 settlementId:string,
):boolean {
 const original=movements.find(row=>row.id===settlementId);
 if(!original||original.reversesId||!['payment','supplier_refund'].includes(original.kind)||movements.some(row=>row.reversesId===settlementId))return false;
 try {
  purchaseSettlement(gross,credits,[...movements,{kind:original.kind==='payment'?'payment_reversal':'supplier_refund_reversal',amount:original.amount}]);
  return true;
 } catch { return false; }
}
