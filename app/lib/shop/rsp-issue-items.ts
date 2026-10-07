import {calculateRspProfileCommercial} from './gst-core/rsp-profile-contract';
import type {SaleItemInput} from './types';

/** Bind package evidence to the same instant as its durable invoice reservation. */
export function rspItemsForIssue(items:readonly SaleItemInput[],issuedAt:string):SaleItemInput[]{
 return items.map(item=>{
  if(item.rsp===undefined)return item;
  const rsp=structuredClone(item.rsp);
  if(!item.productId||item.gstConfig||!Number.isSafeInteger(item.quantity)||item.quantity<1||rsp.valuation.packageCount!==item.quantity)throw new Error('invalid_rsp_sale_line');
  rsp.valuation.supplyAt=issuedAt;
  const r2=(value:number)=>Math.round(value*100)/100,charged=item.price??0;
  const price=item.listPrice!=null&&item.listPrice>charged?item.listPrice:charged;
  const gross=r2(price*item.quantity),discount=r2(Math.min(gross,r2((price-charged)*item.quantity)+r2(Math.max(0,item.discount??0))));
  calculateRspProfileCommercial(rsp.profile,{productId:item.productId,valuation:rsp.valuation,rounding:rsp.rounding,grossSaleValue:gross.toFixed(2),discount:discount.toFixed(2)});
  return {...item,rsp};
 });
}
