import type {InventoryItem,CreateSalePayload} from './types';
import type {Scope,RetainedRequest} from './gst-storage';
import {verifyLocalFiscalReceipt} from './local-fiscal-receipt';
export type BillingCatalog={format:'billing_catalog_v2';items:InventoryItem[];accountedRequestIds:string[]};
/** Only confirmations known before the server read began can be included in its stock baseline. */
export function accountedSales(rows:RetainedRequest[],scope:Scope) {
 return rows.filter(row=>row.actorId===scope.actorId&&row.shopId===scope.shopId&&row.path===`/api/shops/${scope.shopId}/sales`&&row.state==='confirmed').map(row=>row.id);
}
/** Conservatively reserve local bills against the retained baseline, including confirmations newer than that baseline. */
export async function projectLocalStock(catalog:BillingCatalog,rows:RetainedRequest[],scope:Scope):Promise<InventoryItem[]> {
 const accounted=new Set(catalog.accountedRequestIds),reserved=new Map<string,number>();
 for(const row of rows){
  if(row.actorId!==scope.actorId||row.shopId!==scope.shopId||row.path!==`/api/shops/${scope.shopId}/sales`||row.state==='closed'||accounted.has(row.id)||!row.verification?.localFiscalReceipt)continue;
  await verifyLocalFiscalReceipt(row,scope);
  for(const item of (row.payload as CreateSalePayload).items){
   if(!item.productId||!Number.isFinite(item.quantity)||item.quantity<=0||Math.round(item.quantity*1000)/1000!==item.quantity)throw Error('The saved document could not be verified.');
   reserved.set(item.productId,(reserved.get(item.productId)??0)+item.quantity);
  }
 }
 return catalog.items.map(item=>{
  if(item.product.trackStock===false)return item;
  const quantity=Math.max(0,Math.round((item.quantity-(reserved.get(item.productId)??0))*1000)/1000);
  return {...item,quantity,stockStatus:quantity===0?'OUT':quantity<=(item.product.minStockLevel??0)?'LOW':'OK'};
 });
}
/** Call inside the financial lock, immediately before reserving a new invoice. */
export function assertSaleStock(items:CreateSalePayload['items'],catalog:InventoryItem[]) {
 const byId=new Map(catalog.map(row=>[row.productId,row])),used=new Map<string,number>();
 for(const item of items){
  const row=item.productId?byId.get(item.productId):undefined;
  if(!row||row.product.isActive===false||item.unit!==row.unit||!Number.isFinite(item.quantity)||item.quantity<=0||Math.round(item.quantity*1000)/1000!==item.quantity)throw Error('The product changed. Refresh the cart before charging.');
  const total=(used.get(row.productId)??0)+item.quantity;used.set(row.productId,total);
  if(row.product.trackStock!==false&&Math.round(total*1000)>Math.round(row.quantity*1000))throw Error('Stock changed. Refresh the cart before charging.');
 }
}
