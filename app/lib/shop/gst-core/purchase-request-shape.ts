// Recovery checks structure only. Do not recalculate tax or reapply today's
// date/rate/review rules to an original operation that may already be recorded.
type ObjectValue=Record<string,unknown>;
const object=(value:unknown):value is ObjectValue=>!!value&&typeof value==='object'&&!Array.isArray(value);
const strings=(value:ObjectValue,keys:string[])=>keys.every(key=>typeof value[key]==='string');
const finite=(value:unknown)=>typeof value==='number'&&Number.isFinite(value);
const optionalString=(value:ObjectValue,key:string)=>value[key]===undefined||typeof value[key]==='string';
const buyer=(value:unknown)=>object(value)&&strings(value,['name','gstin','address','stateCode']);
const tax=(value:unknown)=>object(value)&&strings(value,['version','category','codeType','code'])&&finite(value.rate)&&typeof value.reviewed==='boolean';
export function validSavedSupplierShape(value:unknown):boolean{
 return object(value)&&typeof value.clientId==='string'&&buyer(value.identity);
}
export function validSavedPurchaseShape(value:unknown):boolean{
 if(!object(value)||!strings(value,['clientId','supplierId','invoiceNumber','invoiceDate','priceMode','placeOfSupply','evidenceReference'])||!finite(value.discount)||!finite(value.declaredTotal)||typeof value.reviewed!=='boolean'||!buyer(value.recipient)||!Array.isArray(value.lines))return false;
 // These context fields were introduced after the initial purchase contract.
 // Preserve older exact payloads for server-side outcome matching.
 if(!['supplierRegistration','documentType','supplyType'].every(key=>optionalString(value,key)))return false;
 if(value.goodsMovement!==undefined&&(!object(value.goodsMovement)||!strings(value.goodsMovement,['destinationStateCode','deliveryAddress'])||typeof value.goodsMovement.reviewed!=='boolean'))return false;
 return value.lines.every(line=>object(line)&&typeof line.productId==='string'&&finite(line.quantity)&&finite(line.price)&&(line.discount===undefined||finite(line.discount))&&typeof line.receiveStock==='boolean'&&tax(line.tax)&&['existingBatchId','batchNumber','expiryDate'].every(key=>optionalString(line,key)));
}

export function validSavedPurchaseSettlementShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','kind','amount','method','occurredAt','evidenceReference','note']);
}

export function validSavedSettlementReversalShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','settlementId','occurredAt','evidenceReference','note']);
}

export function validSavedPurchaseReturnShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','supplierCreditNumber','issuedAt','evidenceReference','reason'])&&Array.isArray(value.items)&&value.items.every(item=>object(item)&&typeof item.purchaseItemId==='string'&&finite(item.quantity)&&typeof item.removeStock==='boolean');
}

export const savedItcConditionKeys=['invoiceValid','goodsReceived','businessUse','portalMatched','supplierTaxConfirmed','returnFiled','withinTimeLimit'] as const;
export function validSavedItcReviewShape(value:unknown):boolean{
 return object(value)&&strings(value,['clientId','decision','note','evidenceReference'])&&object(value.conditions)&&savedItcConditionKeys.every(key=>typeof (value.conditions as ObjectValue)[key]==='boolean');
}

export function validSavedPurchaseOperationShape(operation:string,value:unknown):boolean{
 const validators:Record<string,(value:unknown)=>boolean>={supplier:validSavedSupplierShape,invoice:validSavedPurchaseShape,settlement:validSavedPurchaseSettlementShape,'settlement-reversal':validSavedSettlementReversalShape,return:validSavedPurchaseReturnShape,review:validSavedItcReviewShape};
 return Object.prototype.hasOwnProperty.call(validators,operation)&&validators[operation](value);
}
