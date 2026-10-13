import {quoteRoundedOrdinarySale,quoteRoundedMixedSale} from './gst-core/payable-rounding-quote';
import {canonicalJson} from './gst-core/sale-request-canonical';
import type {PayableRoundingSnapshot} from './gst-core/payable-rounding-snapshot';
import type {CreateSalePayload} from './types';
/** Recovery validation only: recompute at the already reserved issue instant; no policy substitution. */
export function quoteRoundedReservation(shopId:string,payload:Partial<CreateSalePayload>,policy:unknown){
 const context=payload.gstContext,issuedAt=context?.issuedAt;
 if(!context||context.settings.registration!=='regular'||!issuedAt||payload.soldAt!==issuedAt||!payload.items?.length||!Array.isArray(payload.payments))throw Error('rounded_reservation_invalid');
 const money=(value:unknown)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<0||Number(value.toFixed(2))!==value)throw Error('rounded_reservation_invalid');return value;};
 const payments=payload.payments.map(p=>({method:p.method,amount:money(p.amount).toFixed(2)}));
 const common={shopId,issuedAt,policy,context,payments,customerId:payload.customerId??payload.customer?.clientId??null};
 const items=payload.items;
 if(items.some(i=>i.rsp!==undefined)&&money(payload.discountAmount??0)>0&&!payload.mixedDiscountReview)throw Error('rounded_reservation_invalid');
 const quote=items.some(i=>i.rsp!==undefined)?quoteRoundedMixedSale({...common,items:items.map((item,index)=>{
  const price=money(item.price),list=Math.max(money(item.listPrice??price),price),discount=money(item.discount??0);
  if(item.rsp){if(!item.productId||!Number.isSafeInteger(item.quantity)||item.quantity!==item.rsp.valuation.packageCount||item.rsp.valuation.supplyAt!==issuedAt)throw Error('rounded_reservation_invalid');return {kind:'rsp' as const,lineId:`line-${index}`,profile:item.rsp.profile,transaction:{productId:item.productId,valuation:item.rsp.valuation,rounding:item.rsp.rounding,grossSaleValue:(list*item.quantity).toFixed(2),discount:((list-price)*item.quantity+discount).toFixed(2)}};}
  return {kind:'ordinary' as const,lineId:`line-${index}`,input:{quantity:item.quantity,price,listPrice:item.listPrice,discount,tax:item.gstConfig}};
 }),billDiscount:payload.mixedDiscountReview?{...payload.mixedDiscountReview,amount:money(payload.discountAmount??0).toFixed(2)}:undefined}):quoteRoundedOrdinarySale({...common,items:items.map(item=>({quantity:item.quantity,price:money(item.price),listPrice:item.listPrice,discount:item.discount,tax:item.gstConfig})),discount:money(payload.discountAmount??0)});
 return quote;
}

/** Validate recovered evidence without changing the original policy or issue time. */
export function verifyRoundedReservation(shopId:string,payload:Partial<CreateSalePayload>&{roundingSnapshot?:PayableRoundingSnapshot}){
 if(payload.roundingSnapshot===undefined)return;
 const quote=quoteRoundedReservation(shopId,payload,payload.roundingSnapshot.policy);
 if(canonicalJson(quote.snapshot)!==canonicalJson(payload.roundingSnapshot))throw Error('rounded_reservation_invalid');
 return quote;
}
