import {GstError} from './gst';
import {normalizeRspProductProfile,rspProductProfileAt,type RspProductProfile} from './rsp-profile-contract';
import {canonicalJson} from './sale-request-canonical';
export interface CachedRspProfile {version:string;recordedAt:string;effectiveAt:string;state:'reviewed'|'invalid';profile:RspProductProfile|null}
export interface ProductRspSnapshot {version:1;shopId:string;productId:string;capturedAt:string;profiles:CachedRspProfile[]}
const uuid=(value:unknown)=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
const instant=(value:unknown):value is string=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const fail=():never=>{throw new GstError('invalid_rsp_snapshot');};
export function validateProductRspSnapshot(snapshot:ProductRspSnapshot){
 if(!snapshot||snapshot.version!==1||!uuid(snapshot.shopId)||!uuid(snapshot.productId)||!instant(snapshot.capturedAt)||!Array.isArray(snapshot.profiles)||snapshot.profiles.length>1000)fail();
 const ids=new Set<string>();
 for(const row of snapshot.profiles){
  if(!row||!uuid(row.version)||ids.has(row.version)||!instant(row.recordedAt)||!instant(row.effectiveAt)||row.recordedAt>snapshot.capturedAt||!['reviewed','invalid'].includes(row.state))fail();
  ids.add(row.version);
  if(row.state==='invalid'){if(row.profile!==null)fail();continue;}
  if(!row.profile)return fail();
  const profile=normalizeRspProductProfile(row.profile);
  if(profile.version!==row.version||profile.productId!==snapshot.productId||profile.effectiveFrom!==row.effectiveAt||canonicalJson(profile)!==canonicalJson(row.profile))fail();
 }
}
export function cachedRspProductAt(snapshot:ProductRspSnapshot,shop:string,product:string,issuedAt:string){
 validateProductRspSnapshot(snapshot);
 if(snapshot.shopId!==shop||snapshot.productId!==product)throw new GstError('rsp_snapshot_scope_mismatch');
 if(!instant(issuedAt)||issuedAt<snapshot.capturedAt)throw new GstError('rsp_snapshot_clock_error');
 const selected=snapshot.profiles.filter(row=>row.recordedAt<=issuedAt&&row.effectiveAt<=issuedAt).sort((a,b)=>b.effectiveAt.localeCompare(a.effectiveAt)||b.recordedAt.localeCompare(a.recordedAt)||b.version.localeCompare(a.version))[0];
 if(!selected||selected.state!=='reviewed'||!selected.profile)throw new GstError('rsp_profile_missing');
 if(selected.effectiveAt>snapshot.capturedAt)throw new GstError('rsp_snapshot_refresh_required');
 return rspProductProfileAt(selected.profile,product,issuedAt);
}
export function assertRspSnapshotProfile(snapshot:ProductRspSnapshot,shop:string,product:string,issuedAt:string,profile:RspProductProfile){
 const accepted=cachedRspProductAt(snapshot,shop,product,issuedAt);
 if(canonicalJson(accepted)!==canonicalJson(normalizeRspProductProfile(profile)))throw new GstError('rsp_profile_evidence_mismatch');
}
export function nextUnconfirmedRspBoundary(snapshot:ProductRspSnapshot):string|null{
 validateProductRspSnapshot(snapshot);
 return snapshot.profiles.flatMap(row=>[row.effectiveAt,...(row.profile?.effectiveUntil?[row.profile.effectiveUntil]:[])]).filter(time=>time>snapshot.capturedAt).sort()[0]??null;
}
