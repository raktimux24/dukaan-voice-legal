import type { VoiceEntityWithMatch, VoiceConfirmResponse } from './voice-types';
import type { InventoryItem } from './types';
export interface VoiceStockAttempt {
  status: 'ready'|'pending'|'succeeded'|'failed'|'unknown';
  result?: VoiceConfirmResponse;
}
/** A cart retry may reuse a successful outcome, but must never replay a stock write. */
export async function confirmStockOnce(attempt:VoiceStockAttempt,entities:VoiceEntityWithMatch[],send:()=>Promise<VoiceConfirmResponse>) {
  if(attempt.status==='succeeded')return attempt.result!;
  if(attempt.status!=='ready')throw Error('voice_stock_already_attempted');
  attempt.status='pending';
  try {
    const result=await send();
    attempt.result=result;
    attempt.status=result.success&&result.results.length===entities.length&&result.results.every(row=>row.success)?'succeeded':'failed';
    return result;
  } catch(error) {
    attempt.status='unknown';
    throw error;
  }
}
export function voiceEntityValid(entity: VoiceEntityWithMatch) {
  return !!entity.matchedProduct && !entity.unitMismatch && Number.isFinite(entity.quantity) &&
    (entity.action==='update'?entity.quantity>=0:entity.quantity>0) &&
    ['sell','add','remove','update','query'].includes(entity.action) && entity.unit===entity.matchedProduct.unit;
}
/** Once the user edits base units, the original spoken-unit conversion is no longer authoritative. */
export function editVoiceEntity(entity:VoiceEntityWithMatch,changes:Partial<VoiceEntityWithMatch>):VoiceEntityWithMatch {
  return {...entity,...changes,spokenQuantity:undefined,spokenUnit:undefined};
}
/** Re-check the current catalog before changing the cart; never skip a spoken line silently. */
export function voiceSalePlan(entities:VoiceEntityWithMatch[],catalog:InventoryItem[],shopId:string) {
  const quantities=new Map<string,number>();
  for(const entity of entities.filter(row=>row.action==='sell')) {
    if(!voiceEntityValid(entity))throw Error('invalid_voice_line');
    const id=entity.matchedProduct!.id;
    quantities.set(id,(quantities.get(id)??0)+entity.quantity);
  }
  return [...quantities].map(([id,quantity])=>{
    const item=catalog.find(row=>row.productId===id&&row.shopId===shopId&&row.product.shopId===shopId);
    if(!item||item.product.isActive===false||item.unit!==entities.find(row=>row.matchedProduct?.id===id)?.unit)throw Error('invalid_voice_line');
    if(item.product.sellingPrice==null)throw Error('price_required');
    if(item.product.trackStock!==false&&quantity>item.quantity)throw Error('insufficient_stock');
    return {item,quantity};
  });
}

import type { Cart, CartLine } from './cart';
import { cartLineWithQuantity } from './rsp-cart-quantity';
export function appendVoiceSale(cart:Cart,plan:ReturnType<typeof voiceSalePlan>):Cart {
  const lines=[...cart.lines];
  for(const {item,quantity} of plan) {
    const index=lines.findIndex(row=>row.productId===item.productId);
    const existing=index>=0?lines[index]:undefined;
    const nextQuantity=Math.round(((existing?.quantity??0)+quantity)*1000)/1000;
    if(item.product.trackStock!==false&&nextQuantity>item.quantity)throw Error('insufficient_stock');
    const line:CartLine=existing?{...cartLineWithQuantity(existing,nextQuantity),available:item.product.trackStock===false?null:item.quantity}: {
      key:crypto.randomUUID(),productId:item.productId,name:item.product.name,unit:item.unit,quantity:nextQuantity,
      price:item.product.sellingPrice!,listPrice:item.product.sellingPrice!,discount:0,trackStock:item.product.trackStock!==false,
      available:item.product.trackStock===false?null:item.quantity,gstConfig:item.product.gstConfig,gstTaxSnapshot:item.product.gstTaxSnapshot,gstRspSnapshot:item.product.gstRspSnapshot,
      packSize:item.product.packSize,packLabel:item.product.packLabel,
    };
    if(index>=0)lines[index]=line;else lines.push(line);
  }
  return {...cart,lines,inputMethod:'voice'};
}
