import type {RspProductProfile} from './rsp-profile-contract';
import {GstError,validateProductTax,type ProductTax} from './gst';
import {assertRspSnapshotProfile,validateProductRspSnapshot,type ProductRspSnapshot,type CachedRspProfile} from './gst-rsp-cache';
export const GST_TAX_SNAPSHOT_VERSION=1;
export interface CachedTaxProfile {version:string;recordedAt:string;effectiveAt:string;state:'reviewed'|'disabled'|'invalid';config:ProductTax|null}
export interface ProductTaxSnapshot {version:1;shopId:string;productId:string;capturedAt:string;profiles:CachedTaxProfile[]}
export interface CatalogTaxSnapshot {version:1;shopId:string;capturedAt:string;rspVersion?:1;products:{productId:string;profiles:CachedTaxProfile[];rspProfiles?:CachedRspProfile[]}[]}
const uuid=(value:unknown)=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
const instant=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
function fail():never{throw new GstError('invalid_tax_snapshot');}
export function validateProductTaxSnapshot(value:ProductTaxSnapshot){
 if(!value||value.version!==1||!uuid(value.shopId)||!uuid(value.productId)||!instant(value.capturedAt)||!Array.isArray(value.profiles)||value.profiles.length>1000)fail();
 const ids=new Set<string>();
 for(const profile of value.profiles){
  if(!profile||!uuid(profile.version)||ids.has(profile.version)||!instant(profile.recordedAt)||!instant(profile.effectiveAt)||profile.recordedAt>value.capturedAt||!['reviewed','disabled','invalid'].includes(profile.state))fail();
  ids.add(profile.version);
  if(profile.state==='reviewed'){try{validateProductTax(profile.config!);}catch{fail();}if(profile.config!.version!==profile.version)fail();}
  else if(profile.config!==null)fail();
 }
}
/** Resolve only the captured timeline. New issuance must separately check cache freshness and device clock. */
export function cachedProductTaxAt(snapshot:ProductTaxSnapshot,shop:string,product:string,issuedAt:string):ProductTax{
 validateProductTaxSnapshot(snapshot);
 if(snapshot.shopId!==shop||snapshot.productId!==product)throw new GstError('tax_snapshot_scope_mismatch');
 if(!instant(issuedAt)||issuedAt<snapshot.capturedAt)throw new GstError('tax_snapshot_clock_error');
 const candidates=snapshot.profiles.filter(row=>row.recordedAt<=issuedAt&&row.effectiveAt<=issuedAt).sort((a,b)=>b.effectiveAt>a.effectiveAt?1:b.effectiveAt<a.effectiveAt?-1:b.recordedAt>a.recordedAt?1:b.recordedAt<a.recordedAt?-1:b.version>a.version?1:b.version<a.version?-1:0);
 const selected=candidates[0];
 if(!selected||selected.state!=='reviewed'||!selected.config)throw new GstError('tax_profile_missing');
 return {...selected.config};
}

/** Attach one complete snapshot after paginated catalog loading. Partial or mixed-shop data is never published. */
export function attachCatalogTaxSnapshot<T extends {product:{id:string;gstConfig?:ProductTax|null;gstTaxSnapshot?:ProductTaxSnapshot;gstRspSnapshot?:ProductRspSnapshot}}>(items:T[],snapshot:CatalogTaxSnapshot,shop:string):T[]{
 if(!snapshot||snapshot.version!==1||snapshot.shopId!==shop||!instant(snapshot.capturedAt)||!Array.isArray(snapshot.products)||snapshot.products.length!==items.length)fail();
 const expected=new Set(items.map(item=>item.product.id));
 if(expected.size!==items.length)fail();
 if(snapshot.rspVersion!==undefined&&snapshot.rspVersion!==1)fail();
 const rspProfiles=new Map<string,ProductRspSnapshot>();
 const profiles=new Map<string,ProductTaxSnapshot>();
 for(const row of snapshot.products){
  if(!row||!expected.has(row.productId)||profiles.has(row.productId))fail();
  const profile:ProductTaxSnapshot={version:1,shopId:snapshot.shopId,productId:row.productId,capturedAt:snapshot.capturedAt,profiles:row.profiles};
  validateProductTaxSnapshot(profile);profiles.set(row.productId,profile);
  if(snapshot.rspVersion===1){const rsp:ProductRspSnapshot={version:1,shopId:shop,productId:row.productId,capturedAt:snapshot.capturedAt,profiles:row.rspProfiles!};validateProductRspSnapshot(rsp);rspProfiles.set(row.productId,rsp);}
 }
 return items.map(item=>{
  const gstTaxSnapshot=profiles.get(item.product.id);if(!gstTaxSnapshot)fail();
  let gstConfig:ProductTax|null=null;
  try{gstConfig=cachedProductTaxAt(gstTaxSnapshot,shop,item.product.id,snapshot.capturedAt);}catch(error){if(!(error instanceof GstError)||error.code!=='tax_profile_missing')throw error;}
  return {...item,product:{...item.product,gstConfig,gstTaxSnapshot,gstRspSnapshot:rspProfiles.get(item.product.id)}};
 });
}

/** A pre-recorded scheduled boundary requires a refreshed server snapshot before final issuance. */
export function assertCartTaxSnapshots(cart:{gstTaxSnapshotsRequired?:boolean;lines:{productId:string|null;gstConfig?:ProductTax|null;gstTaxSnapshot?:ProductTaxSnapshot;gstRspSnapshot?:ProductRspSnapshot;rsp?:{profile:RspProductProfile}}[]},shop:string,issuedAt:string){
 for(const line of cart.lines){
  if(line.rsp){if(!line.productId||line.gstConfig)throw new GstError('invalid_rsp_sale_line');if(!line.gstRspSnapshot)throw new GstError('rsp_snapshot_refresh_required');assertRspSnapshotProfile(line.gstRspSnapshot,shop,line.productId,issuedAt,line.rsp.profile);continue;}
  if(!line.gstTaxSnapshot){if(cart.gstTaxSnapshotsRequired)throw new GstError('tax_snapshot_refresh_required');continue;}
  if(!line.productId)throw new GstError('tax_profile_missing');
  const selected=cachedProductTaxAt(line.gstTaxSnapshot,shop,line.productId,issuedAt);
  const boundary=line.gstTaxSnapshot.profiles.find(profile=>profile.version===selected.version)!;
  if(boundary.effectiveAt>line.gstTaxSnapshot.capturedAt)throw new GstError('tax_snapshot_refresh_required');
  if(!line.gstConfig||(['version','category','codeType','code','rate','reviewed'] as const).some(key=>line.gstConfig![key]!==selected[key]))throw new GstError('tax_version_unavailable');
 }
}

export function nextUnconfirmedTaxBoundary(snapshot:ProductTaxSnapshot):string|null{
 validateProductTaxSnapshot(snapshot);
 return snapshot.profiles.filter(profile=>profile.effectiveAt>snapshot.capturedAt).map(profile=>profile.effectiveAt).sort()[0]??null;
}
