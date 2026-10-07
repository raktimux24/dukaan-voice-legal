import {normalizeRspProductProfile,type RspProductProfile,type calculateRspProfileCommercial} from './rsp-profile-contract';
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export interface RspProfileReviewState {
 status:'review_only';review:null|{version:string;profile:RspProductProfile;review:{actor:string;reason:string};createdAt:string};
}
export function normalizeRspProfileReviewState(raw:unknown,productId:string):RspProfileReviewState{
 try{
  const value=raw as RspProfileReviewState;
  if(!uuid(productId)||!value||value.status!=='review_only')throw new Error();
  if(value.review===null)return {status:'review_only',review:null};
  const row=value.review,profile=normalizeRspProductProfile(row.profile);
  if(profile.productId!==productId.toLowerCase()||row.version!==profile.version||!row.review||typeof row.review.actor!=='string'||!row.review.actor.trim()||typeof row.review.reason!=='string'||!row.review.reason.trim()||row.review.reason.length>500||typeof row.createdAt!=='string'||!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(row.createdAt)||!Number.isFinite(Date.parse(row.createdAt)))throw new Error();
  return {status:'review_only',review:{version:row.version,profile,review:{actor:row.review.actor,reason:row.review.reason},createdAt:row.createdAt}};
 }catch{throw new Error('rsp_profile_response_unconfirmed');}
}
export function validRspProfileRequest(raw:unknown,productId:string):boolean{
 try{
  const value=raw as {profile:RspProductProfile;expectedReviewVersion:string|null;reason:string};
  if(!value||typeof value.reason!=='string'||!value.reason.trim()||value.reason.length>500||value.expectedReviewVersion!==null&&!uuid(value.expectedReviewVersion))return false;
  return normalizeRspProductProfile(value.profile).productId===productId.toLowerCase();
 }catch{return false;}
}
export function assertRspProfileReceipt(expected:RspProductProfile,raw:unknown){
 const response=raw as {status:string;version:string;profile:RspProductProfile};
 const original=normalizeRspProductProfile(expected);
 if(!response||response.status!=='review_only'||response.version!==original.version||JSON.stringify(normalizeRspProductProfile(response.profile))!==JSON.stringify(original))throw new Error('rsp_profile_response_unconfirmed');
}
function canonical(value:unknown):string{
 if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
 if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical((value as Record<string,unknown>)[key])}`).join(',')}}`;
 return JSON.stringify(value);
}
export function assertRspPreviewReceipt(expected:ReturnType<typeof calculateRspProfileCommercial>,raw:unknown){
 try{
  const response=raw as {status:string;profile:RspProductProfile;calculation:unknown};
  if(!response||response.status!=='preview_only')throw new Error();
  assertRspProfileReceipt(expected.profile,{status:'review_only',version:response.profile?.version,profile:response.profile});
  if(canonical(response.calculation)!==canonical(expected.calculation))throw new Error();
  return expected.calculation;
 }catch{throw new Error('rsp_preview_response_unconfirmed');}
}
