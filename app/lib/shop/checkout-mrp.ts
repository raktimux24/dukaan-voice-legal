import type {Cart} from './cart';
import type {InventoryItem} from './types';
import type {GstContext} from './gst-core/gst';
import type {computeTotals} from './cart';
import {roundPaise} from './money';

const knownMrp=(value:unknown):value is number|null=>value===null||typeof value==='number'&&Number.isFinite(value)&&value>=0;
const bounded=(line:Cart['lines'][number])=>line.trackStock||line.rsp!==undefined;
export function missingCartMrp(cart:Cart):string[]{
 return [...new Set(cart.lines.filter(line=>bounded(line)&&!knownMrp(line.mrp)).map(line=>line.productId))].sort();
}
export type CartMrpSnapshot={shopId:string;limits:Record<string,number|null>};
/** Recover only limits, never commercial prices, discounts, stock or reviewed package evidence. */
export function captureCartMrp(items:InventoryItem[],shopId:string,ids:string[]):CartMrpSnapshot{
 const limits:Record<string,number|null>={};
 for(const id of ids){
  const matches=items.filter(item=>item.productId===id);
  const item=matches[0];
  if(matches.length!==1||item.shopId!==shopId||item.product.shopId!==shopId||item.product.id!==id||!knownMrp(item.product.mrp))throw Error('Refresh product MRP details before charging this bill.');
  limits[id]=item.product.mrp;
 }
 return {shopId,limits};
}
export function restoreCartMrp(cart:Cart,snapshot:CartMrpSnapshot,shopId:string):Cart{
 if(snapshot.shopId!==shopId)throw Error('Product MRP details belong to another shop.');
 return {...cart,lines:cart.lines.map(line=>bounded(line)&&!knownMrp(line.mrp)&&Object.hasOwn(snapshot.limits,line.productId)?{...line,mrp:snapshot.limits[line.productId]}:line)};
}
/** Match the server's per-line final-inclusive ceiling, before reserving a new invoice. */
export function assertCartMrp(cart:Cart,totals:ReturnType<typeof computeTotals>,context?:GstContext|null){
 if(!context)return;
 if(missingCartMrp(cart).length)throw Error('Refresh product MRP details before charging this bill.');
 const amounts=totals.mixed?.lines.map(line=>line.kind==='ordinary'?line.tax!.total:Number(line.evidence!.calculation.payable))??totals.tax?.lines.map(line=>line.total);
 if(!amounts||amounts.length!==cart.lines.length)throw Error('Refresh product MRP details before charging this bill.');
 if(cart.lines.some((line,index)=>bounded(line)&&line.mrp!=null&&amounts[index]>roundPaise(line.mrp*line.quantity)+0.01))throw Error('price_above_mrp');
}
