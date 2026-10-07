// Shared purchasing contract. A recorded supplier invoice is not an ITC claim.
import { calculateTax,calculateRecordedGoodsPurchaseTax,validGstin,STATE_CODES,GstError,type Buyer,type ProductTax,type PriceMode,type TaxTotals } from './gst';
import {validIndianDocumentDate,fiscalDateLabel} from './fiscal-date';
export type SupplierRegistration='regular'|'composition'|'unregistered';
export type PurchaseDocumentType='tax_invoice'|'bill_of_supply'|'commercial_invoice';
export type ItcDecision='deferred'|'reviewed_eligible'|'ineligible';
export interface ItcConditions {invoiceValid:boolean;goodsReceived:boolean;businessUse:boolean;portalMatched:boolean;supplierTaxConfirmed:boolean;returnFiled:boolean;withinTimeLimit:boolean}
export interface PurchaseLineInput {productId:string;quantity:number;price:number;discount?:number;tax:ProductTax;receiveStock:boolean;existingBatchId?:string;batchNumber?:string;expiryDate?:string}
export interface PurchaseGoodsMovement {destinationStateCode:string;deliveryAddress:string;reviewed:boolean}
export interface PurchaseInput {clientId:string;supplierId:string;supplierRegistration:SupplierRegistration;documentType:PurchaseDocumentType;supplyType:'domestic_forward_charge';goodsMovement?:PurchaseGoodsMovement;invoiceNumber:string;invoiceDate:string;priceMode:PriceMode;placeOfSupply:string;discount:number;declaredTotal:number;recipient:Buyer;lines:PurchaseLineInput[];evidenceReference:string;reviewed:boolean}
export interface PurchaseSnapshot {stockActions?:{purchaseItemId:string;action:'received'|'linked'|'invoice_only'}[];supplier:Buyer;supplierRegistration:SupplierRegistration;documentType:PurchaseDocumentType;supplyType:'domestic_forward_charge';goodsMovement?:PurchaseGoodsMovement;recipient:Buyer;invoiceNumber:string;invoiceDate:string;placeOfSupply:string;priceMode:PriceMode;totals:TaxTotals;evidenceReference:string;reviewedBy:string}
function validPurchaseDate(value:string):boolean {
 if(typeof value!=='string')return false;
 if(!value.includes('T'))return validIndianDocumentDate(value);
 // Preserve previously retained explicit-instant requests and their exact date.
 try{fiscalDateLabel(value);return Date.parse(value)<=Date.now()+60000;}catch{return false;}
}
export function purchaseTotals(input:PurchaseInput,supplier:Buyer):TaxTotals {
  if(input.reviewed!==true||!Array.isArray(input.lines)||!input.lines.length||input.lines.length>100)throw new GstError('purchase_review_required');
  if(!/^[A-Za-z0-9/-]{1,16}$/.test(input.invoiceNumber)||!validPurchaseDate(input.invoiceDate)||!input.evidenceReference?.trim()||input.evidenceReference.length>1000)throw new GstError('invalid_purchase_document');
  if(!['inclusive','exclusive'].includes(input.priceMode)||!STATE_CODES.includes(input.placeOfSupply))throw new GstError('invalid_tax_context');
  for(const party of [supplier,input.recipient]) {
    if(!party||!party.name?.trim()||!party.address?.trim()||!STATE_CODES.includes(party.stateCode)||(party.gstin&&(!validGstin(party.gstin)||party.stateCode!==party.gstin.slice(0,2))))throw new GstError('invalid_buyer_gstin');
  }
  if(!['regular','composition','unregistered'].includes(input.supplierRegistration))throw new GstError('purchase_supplier_registration_required');
  if((input.supplierRegistration==='unregistered'&&supplier.gstin)||(input.supplierRegistration!=='unregistered'&&!supplier.gstin))throw new GstError('purchase_supplier_registration_mismatch');
  if(input.supplyType!=='domestic_forward_charge'||input.placeOfSupply!==input.recipient.stateCode)throw new GstError('purchase_supply_not_supported');
  if(!['tax_invoice','bill_of_supply','commercial_invoice'].includes(input.documentType)||(input.supplierRegistration==='composition'&&input.documentType!=='bill_of_supply')||(input.supplierRegistration==='unregistered'&&input.documentType!=='commercial_invoice')||(input.supplierRegistration==='regular'&&input.documentType==='commercial_invoice'))throw new GstError('purchase_document_type_mismatch');
  const settings={version:'purchase-manual-v1',registration:input.supplierRegistration,gstin:supplier.gstin,legalName:supplier.name,address:supplier.address,stateCode:supplier.stateCode,priceMode:input.priceMode,effectiveFrom:input.invoiceDate,reviewed:true,eInvoiceRequired:false};
  const interstate=supplier.stateCode!==input.placeOfSupply;
  const movement=input.goodsMovement;
  if(interstate&&(input.supplierRegistration==='composition'||input.lines.some(line=>line.tax?.codeType!=='hsn')))throw new GstError('purchase_supply_not_supported');
  if(interstate&&!movement)throw new GstError('purchase_goods_movement_required');
  if(movement){
    if(movement.reviewed!==true||movement.destinationStateCode!==input.placeOfSupply||typeof movement.deliveryAddress!=='string'||movement.deliveryAddress.trim()!==input.recipient.address.trim())throw new GstError('purchase_goods_movement_required');
    if(input.lines.some(line=>line.tax?.codeType!=='hsn'))throw new GstError('purchase_supply_not_supported');
  }
  const calculate=interstate?calculateRecordedGoodsPurchaseTax:calculateTax;
  const totals=calculate(input.lines.map(l=>({quantity:l.quantity,price:l.price,discount:l.discount,tax:l.tax})),input.discount,{settings,priceMode:input.priceMode,placeOfSupply:input.placeOfSupply,buyer:input.recipient});
  if(input.documentType==='bill_of_supply'&&totals.tax!==0)throw new GstError('purchase_document_type_mismatch');
  if(!Number.isFinite(input.declaredTotal)||Math.abs(Math.round(input.declaredTotal*100)-input.declaredTotal*100)>1e-7||Math.abs(input.declaredTotal-totals.total)>.001)throw new GstError('purchase_invoice_total_mismatch');
  if(input.lines.some(l=>l.existingBatchId&&(l.receiveStock||! /^[0-9a-f-]{36}$/i.test(l.existingBatchId))))throw new GstError('invalid_purchase_batch_link');
  if(input.lines.some(l=>typeof l.receiveStock!=='boolean'))throw new GstError('purchase_stock_choice_required');
  return totals;
}
export function validateItcReview(decision:ItcDecision,conditions:ItcConditions,registration:string,supplierGstin:string,note:string,reference:string,supplierRegistration:string='unknown') {
  if(!['deferred','reviewed_eligible','ineligible'].includes(decision)||!note?.trim()||note.length>1000||!reference?.trim()||reference.length>1000)throw new GstError('itc_review_evidence_required');
  const keys:(keyof ItcConditions)[]=['invoiceValid','goodsReceived','businessUse','portalMatched','supplierTaxConfirmed','returnFiled','withinTimeLimit'];
  if(!conditions||keys.some(k=>typeof conditions[k]!=='boolean'))throw new GstError('itc_review_evidence_required');
  if(decision==='reviewed_eligible'&&(registration!=='regular'||supplierRegistration!=='regular'||!validGstin(supplierGstin)||keys.some(k=>conditions[k]!==true)))throw new GstError('itc_conditions_not_satisfied');
}
