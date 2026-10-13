import {projectMixedGstInvoice} from './gst-core/mixed-gst-projection';
import type {GstContext} from './gst-core/gst';
import type {SaleItemInput,CreateSalePayload} from './types';
type Line=SaleItemInput & {key:string;price:number;discount:number};
/** Uses the server's commercial/list-price and discount rules for the counter preview. */
export function mixedCartProjection(lines:readonly Line[],context:GstContext,billDiscount:number,review?:CreateSalePayload['mixedDiscountReview']){
 if(!Number.isFinite(billDiscount)||billDiscount<0||Math.abs(billDiscount*100-Math.round(billDiscount*100))>1e-5)throw new Error('invalid_mixed_bill_discount');
 const times=lines.flatMap(line=>line.rsp?[line.rsp.valuation.supplyAt]:[]);
 const issuedAt=context.issuedAt??[...times].sort((a,b)=>Date.parse(a)-Date.parse(b)).at(-1);
 if(!issuedAt||context.issuedAt&&times.some(time=>time!==issuedAt))throw new Error('rsp_supply_time_mismatch');
 if(billDiscount!==0&&!review)throw new Error('mixed_bill_discount_policy_required');
 const r2=(n:number)=>Math.round(n*100)/100;
 return projectMixedGstInvoice(lines.map(line=>{
  const price=line.listPrice!=null&&line.listPrice>line.price?line.listPrice:line.price;
  const gross=r2(price*line.quantity),discount=r2(Math.min(gross,r2((price-line.price)*line.quantity)+r2(Math.max(0,line.discount))));
  if(line.rsp){
   if(!line.productId||line.gstConfig||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.rsp.valuation.packageCount!==line.quantity)throw new Error('invalid_rsp_sale_line');
   return {kind:'rsp' as const,lineId:line.key,profile:line.rsp.profile,transaction:{productId:line.productId,valuation:{...line.rsp.valuation,supplyAt:issuedAt},rounding:line.rsp.rounding,grossSaleValue:gross.toFixed(2),discount:discount.toFixed(2)}};
  }
  return {kind:'ordinary' as const,lineId:line.key,input:{quantity:line.quantity,price,discount,tax:line.gstConfig}};
 }),{...context,issuedAt},review?{...review,amount:billDiscount.toFixed(2)}:undefined);
}
