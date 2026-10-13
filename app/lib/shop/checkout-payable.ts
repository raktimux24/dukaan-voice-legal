import {createPayableRoundingSnapshot} from './gst-core/payable-rounding-snapshot';
import type {GstContext} from './gst-core/gst';
/** Preview only. Issuance recomputes at the durable reservation's actual issue instant. */
export function checkoutPayable(before:number,shopId:string,context:GstContext|null|undefined,available:boolean|undefined,policy:unknown,issuedAt:string){
 if(!Number.isFinite(before)||before<0||Number(before.toFixed(2))!==before)throw Error('invalid_rounding_checkout_amount');
 if(available!==true)return {total:before,before,roundOff:0,rounded:false as const,policy:undefined};
 if(context?.settings.registration!=='regular'||policy==null)throw Error('rounding_checkout_review_required');
 const snapshot=createPayableRoundingSnapshot(shopId,issuedAt,before.toFixed(2),policy);
 return {total:Number(snapshot.calculation.payable),before,roundOff:Number(snapshot.calculation.adjustment),rounded:true as const,policy:snapshot.policy};
}
