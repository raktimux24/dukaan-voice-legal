import {canonicalJson} from './gst-core/sale-request-canonical';
import {mixedSaleAmounts} from './gst-core/mixed-sale-amounts';
import {mixedCartProjection} from './mixed-cart-projection';
import type {Sale,CreateSalePayload} from './types';
/** Server verification plus replay of the exact retained request before clearing its outbox entry. */
export function mixedSaleConfirmationMatches(sale:Sale,payload:CreateSalePayload):boolean{
 try{
  const snapshot=sale.mixedGstSnapshot,context=payload.gstContext;
  if(!snapshot||snapshot.format!=='samaan_mixed_fiscal_v1'||sale.gstSnapshot!=null||sale.gstIntegrity!=='verified'||!context?.allocation||!context.issuedAt||!payload.items.some(item=>item.rsp!==undefined)||canonicalJson(snapshot.context)!==canonicalJson(context)||Date.parse(sale.soldAt)!==Date.parse(context.issuedAt)||!Array.isArray(sale.items)||sale.items.length!==payload.items.length||snapshot.items?.length!==sale.items.length)return false;
  const projection=mixedCartProjection(payload.items.map((item,index)=>({...item,key:sale.items[index].id,price:item.price??0,discount:item.discount??0})),context,payload.discountAmount??0,payload.mixedDiscountReview);
  if(canonicalJson(projection)!==canonicalJson(snapshot.invoice))return false;
  const amounts=mixedSaleAmounts(projection);
  for(const [field,amount] of [['subtotal',amounts.subtotal],['discountAmount',amounts.discount],['total',amounts.total],['netSales',amounts.net],['taxTotal',amounts.tax]] as const)if(sale[field]!==amount)return false;
  return amounts.lines.every((line,index)=>{
   const item=sale.items[index],input=payload.items[index],metadata=snapshot.items![index];
   const price=Math.round(Math.max(input.price??0,input.listPrice??input.price??0)*100)/100;
   return item.id===line.id&&item.unitPrice===price&&item.productId===(input.productId??null)&&item.quantity===line.quantity&&item.lineTotal===line.total&&item.discountAmount===line.discount&&canonicalJson(item.taxSnapshot??null)===canonicalJson(line.taxSnapshot)&&canonicalJson(item.rspSnapshot??null)===canonicalJson(line.rspSnapshot)&&metadata.lineId===item.id&&metadata.productId===item.productId&&metadata.name===item.name&&metadata.unit===item.unit&&(input.name===undefined||input.name.trim()===item.name)&&(input.unit===undefined||input.unit===item.unit);
  });
 }catch{return false;}
}
