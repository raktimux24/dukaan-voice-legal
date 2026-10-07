import {fiscalDateLabel} from './fiscal-date';
import {normalizePayableRoundingPolicy,type PayableRoundingPolicy} from './payable-rounding-policy';
export interface RoundingReviewRequest {policy:PayableRoundingPolicy;expectedReviewVersion:string|null;reason:string}
export interface RoundingReviewReceipt {version:string;policy:PayableRoundingPolicy;status:'review_only'}
export interface RoundingReviewState {review:null|{version:string;policy:PayableRoundingPolicy;review:{actor:string;reason:string};createdAt:string};status:'review_only'}
const fail=():never=>{throw new Error('invalid_rounding_review_receipt');};
function record(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))return fail();return value as Record<string,unknown>;}
function policyForShop(value:unknown,shopId:string,version:unknown){const policy=normalizePayableRoundingPolicy(value);if(typeof version!=='string'||policy.version.toLowerCase()!==version.toLowerCase()||policy.shopId.toLowerCase()!==shopId.toLowerCase())return fail();return policy;}
export function assertRoundingReviewReceipt(expected:PayableRoundingPolicy,value:unknown):RoundingReviewReceipt{
 const response=record(value);if(response.status!=='review_only')return fail();
 const policy=policyForShop(response.policy,expected.shopId,response.version),normalized=normalizePayableRoundingPolicy(expected);
 if(JSON.stringify(policy)!==JSON.stringify(normalized))return fail();
 return {version:response.version as string,policy,status:'review_only'};
}
export function normalizeRoundingReviewState(value:unknown,shopId:string):RoundingReviewState{
 const response=record(value);if(response.status!=='review_only')return fail();if(response.review===null)return {review:null,status:'review_only'};
 const row=record(response.review),policy=policyForShop(row.policy,shopId,row.version),review=record(row.review);
 if(typeof review.actor!=='string'||!review.actor.trim()||typeof review.reason!=='string'||!review.reason.trim()||review.reason.length>500||typeof row.createdAt!=='string'||!row.createdAt.includes('T')||!Number.isFinite(Date.parse(row.createdAt)))return fail();
 try{fiscalDateLabel(row.createdAt);}catch{return fail();}
 return {review:{version:row.version as string,policy,review:{actor:review.actor,reason:review.reason},createdAt:row.createdAt},status:'review_only'};
}
export function validRoundingReviewRequest(value:unknown,shopId:string):boolean{
 try{const input=record(value);if(Object.keys(input).some(k=>!['policy','expectedReviewVersion','reason'].includes(k)))return false;
 const policy=normalizePayableRoundingPolicy(input.policy);
 return policy.shopId.toLowerCase()===shopId.toLowerCase()&&(input.expectedReviewVersion===null||typeof input.expectedReviewVersion==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.expectedReviewVersion))&&typeof input.reason==='string'&&!!input.reason.trim()&&input.reason.length<=500;
 }catch{return false;}
}

export interface RoundingSelection {format:'payable_rounding_selection_v1';shopId:string;issuedAt:string;selection:null|{version:string;policy:PayableRoundingPolicy;createdAt:string};refreshAt:string|null;status:'selection_only'}
/** A selected review is a scoped preview result; it is never an issuance capability. */
export function assertRoundingSelection(shopId:string,issuedAt:string,value:unknown):RoundingSelection{
 const response=record(value);
 if(Object.keys(response).some(k=>!['format','shopId','issuedAt','selection','refreshAt','status'].includes(k))||response.format!=='payable_rounding_selection_v1'||response.shopId!==shopId||response.issuedAt!==issuedAt||response.status!=='selection_only')return fail();
 try{fiscalDateLabel(issuedAt);if(!issuedAt.includes('T'))return fail();}catch{return fail();}
 const refreshAt=response.refreshAt;if(refreshAt!==null){if(typeof refreshAt!=='string'||!refreshAt.includes('T')||!Number.isFinite(Date.parse(refreshAt))||Date.parse(refreshAt)<=Date.parse(issuedAt))return fail();try{fiscalDateLabel(refreshAt);}catch{return fail();}}
 if(response.selection===null)return {format:'payable_rounding_selection_v1',shopId,issuedAt,selection:null,refreshAt:refreshAt as string|null,status:'selection_only'};
 const selected=record(response.selection),policy=policyForShop(selected.policy,shopId,selected.version);
 if(Object.keys(selected).some(k=>!['version','policy','createdAt'].includes(k))||typeof selected.createdAt!=='string'||!selected.createdAt.includes('T')||!Number.isFinite(Date.parse(selected.createdAt))||Date.parse(selected.createdAt)>Date.parse(issuedAt)||Date.parse(policy.effectiveFrom)>Date.parse(issuedAt)||policy.effectiveUntil!==null&&Date.parse(issuedAt)>=Date.parse(policy.effectiveUntil))return fail();
 try{fiscalDateLabel(selected.createdAt);}catch{return fail();}
 if(policy.effectiveUntil!==null&&(refreshAt===null||Date.parse(refreshAt as string)>Date.parse(policy.effectiveUntil)))return fail();
 return {format:'payable_rounding_selection_v1',shopId,issuedAt,refreshAt:refreshAt as string|null,selection:{version:selected.version as string,policy,createdAt:selected.createdAt},status:'selection_only'};
}

/** Preview freshness only; this interval does not authorize offline issuance. */
export function roundingSelectionCurrent(selection:RoundingSelection,now:number):boolean{
 return Number.isFinite(now)&&now>=Date.parse(selection.issuedAt)&&(selection.refreshAt===null||now<Date.parse(selection.refreshAt));
}
