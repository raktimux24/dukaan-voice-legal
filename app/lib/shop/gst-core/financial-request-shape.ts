// Structural recovery checks only: retain original values and unknown fields.
// Current fiscal rules belong to the server, not decoding historical requests.
type Row=Record<string,unknown>;
const object=(value:unknown):value is Row=>!!value&&typeof value==='object'&&!Array.isArray(value);
const strings=(value:Row,keys:string[])=>keys.every(key=>typeof value[key]==='string');
const finite=(value:unknown)=>typeof value==='number'&&Number.isFinite(value);
const optionalString=(value:Row,key:string)=>value[key]===undefined||typeof value[key]==='string';
const allocations=(value:unknown)=>Array.isArray(value)&&value.every(row=>object(row)&&typeof row.saleId==='string'&&finite(row.amount));
export function validSavedCustomerPaymentShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','method'])&&finite(value.amount)&&optionalString(value,'note')&&(value.allocations===undefined||allocations(value.allocations));
}
export function validSavedCollectionReviewShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','ledgerId','reason'])&&allocations(value.allocations);
}
export function validSavedGstPeriodShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','action','note'])&&typeof value.reviewed==='boolean'&&finite(value.expectedSequence)&&optionalString(value,'expectedSourceFingerprint');
}
export function validSavedTurnoverShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','financialYear','amount','evidenceReference'])&&typeof value.reviewed==='boolean'&&finite(value.expectedSequence);
}
export function validSavedTaxImportShape(value:unknown):boolean{
 // Content remains exact text; the existing import parser validates its rows.
 return object(value)&&strings(value,['clientId','content']);
}
const nullableString=(value:Row,key:string)=>value[key]===null||optionalString(value,key);
const returnSettlement=(value:unknown)=>object(value)&&finite(value.creditReduction)&&finite(value.moneyRefund)&&typeof value.method==='string'&&optionalString(value,'evidenceReference');
const adjustment=(value:unknown)=>object(value)&&strings(value,['clientId','reason','priceMode'])&&Array.isArray(value.items)&&value.items.every(row=>object(row)&&typeof row.originalSaleItemId==='string'&&finite(row.quantity)&&finite(row.price));
export function validSavedDebitNoteShape(value:unknown):boolean{
 return object(value)&&typeof value.saleId==='string'&&adjustment(value.body);
}
export function validSavedManualCreditShape(value:unknown):boolean{
 return validSavedDebitNoteShape(value)&&object(value)&&object(value.body)&&returnSettlement(value.body.settlement);
}
export function validSavedDebitSettlementShape(value:unknown):boolean{
 if(!object(value)||typeof value.adjustmentId!=='string'||!object(value.body))return false;
 return strings(value.body,['clientId','kind','method','occurredAt','evidenceReference','reason'])&&finite(value.body.amount)&&optionalString(value.body,'reversesId');
}
export function validSavedSaleReturnShape(value:unknown):boolean{
 if(!object(value)||typeof value.saleId!=='string'||!finite(value.total)||!object(value.body))return false;
 const body=value.body;
 return typeof body.requestId==='string'&&nullableString(body,'reason')&&nullableString(body,'refundMethod')&&(body.refundAmount===undefined||body.refundAmount===null||finite(body.refundAmount))&&(body.settlement===undefined||returnSettlement(body.settlement))&&Array.isArray(body.items)&&body.items.every(row=>object(row)&&typeof row.saleItemId==='string'&&finite(row.quantity)&&(row.restock===undefined||typeof row.restock==='boolean')&&nullableString(row,'reason'));
}

const validators:Record<string,(value:unknown)=>boolean>={'customer-payment':validSavedCustomerPaymentShape,'collection-review':validSavedCollectionReviewShape,'gst-period':validSavedGstPeriodShape,'gst-turnover':validSavedTurnoverShape,'product-tax-import':validSavedTaxImportShape,'sale-return':validSavedSaleReturnShape,'manual-credit':validSavedManualCreditShape,'debit-note':validSavedDebitNoteShape,'debit-settlement':validSavedDebitSettlementShape};
export function scopedFinancialRequestOperation(key:string,actor:string,shop:string):string|null{
 if(!actor||actor.includes(':')||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(shop))return null;
 const prefix=`purchase-request:${actor}:${shop}:`;
 if(!key.startsWith(prefix))return null;
 const suffix=key.slice(prefix.length);
 if(/^gst-turnover:20\d{2}-\d{2}$/.test(suffix))return 'gst-turnover';
 if(suffix==='product-tax-import')return suffix;
 if(/^gst-period:\d{4}-(0[1-9]|1[0-2])$/.test(suffix))return 'gst-period';
 const match=/^(customer-payment|collection-review|sale-return|manual-credit|debit-note|debit-settlement):([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.exec(suffix);
 return match?.[1]??null;
}
export function validSavedFinancialOperationShape(operation:string,value:unknown):boolean{
 return Object.hasOwn(validators,operation)&&validators[operation](value);
}
export function savedFinancialTargetMatchesKey(operation:string,key:string,value:unknown):boolean{
 if(!object(value))return false;
 if(operation==='gst-turnover')return value.financialYear===key.slice(key.lastIndexOf(':')+1);
 const field=['sale-return','manual-credit','debit-note'].includes(operation)?'saleId':operation==='debit-settlement'?'adjustmentId':null;
 if(field===null)return true; // Other operation targets live only in their key.
 const target=value[field],keyTarget=key.slice(key.lastIndexOf(':')+1);
 return typeof target==='string'&&target.toLowerCase()===keyTarget.toLowerCase();
}
export function savedFinancialClientId(operation:string,value:unknown):string|undefined{
 if(!value||typeof value!=='object'||Array.isArray(value))return undefined;
 const row=value as Record<string,unknown>;
 const wrapped=['sale-return','manual-credit','debit-note','debit-settlement'].includes(operation);
 const body=wrapped?row.body:row;
 if(!body||typeof body!=='object'||Array.isArray(body))return undefined;
 const id=(body as Record<string,unknown>)[operation==='sale-return'?'requestId':'clientId'];
 return typeof id==='string'?id:undefined;
}
