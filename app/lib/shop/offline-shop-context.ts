import {parseRole,type Role} from './permissions';
import type {ShopRecord} from './types';

const MAX_AGE=7*24*60*60*1000;
type RoutingShop=Pick<ShopRecord,'id'|'name'|'category'|'ownerId'|'createdAt'>;
export type OfflineShopContext={version:1;actorId:string;sessionId:string;confirmedAt:number;role:Role;shop:RoutingShop};
export function readOfflineShopContext(raw:string|null,actorId:string,sessionId:string,now=Date.now()):OfflineShopContext|null {
  try {
    if(!raw||raw.length>2048||!actorId||!sessionId||!Number.isFinite(now))return null;
    const c=JSON.parse(raw);const s=c.shop;const role=parseRole(c.role);
    if(c.version!==1||c.actorId!==actorId||c.sessionId!==sessionId||!role||!Number.isFinite(c.confirmedAt)||c.confirmedAt>now||now-c.confirmedAt>MAX_AGE)return null;
    if(!s||['id','name','category','ownerId','createdAt'].some(k=>typeof s[k]!=='string'||!s[k].trim())||!Number.isFinite(Date.parse(s.createdAt)))return null;
    if((role==='OWNER')!==(s.ownerId===actorId))return null;
    return {version:1,actorId,sessionId,confirmedAt:c.confirmedAt,role,shop:{id:s.id,name:s.name,category:s.category,ownerId:s.ownerId,createdAt:s.createdAt}};
  } catch {return null;}
}
export function createOfflineShopContext(actorId:string,sessionId:string,shop:ShopRecord,now=Date.now()):OfflineShopContext {
  const {id,name,category,ownerId,createdAt}=shop;
  const result=readOfflineShopContext(JSON.stringify({version:1,actorId,sessionId,confirmedAt:now,role:shop.role,shop:{id,name,category,ownerId,createdAt}}),actorId,sessionId,now);
  if(!result)throw Error('offline_shop_context_invalid');
  return result;
}
export function offlineShopRecord(context:OfflineShopContext):ShopRecord {
  return {...context.shop,role:'HELPER',isActive:true,managerInviteCode:null,helperInviteCode:null};
}
export function permitsOfflineShopFallback(error:unknown) {
  const e=error as {name?:string;message?:string;status?:number}|null;
  return !!e&&([408,502,503,504].includes(e.status??0)||e.name==='TimeoutError'||(e.name==='TypeError'&&/^(Failed to fetch|Network request failed|NetworkError when attempting to fetch resource\.)$/.test(e.message??'')));
}
const key=(actor:string)=>`samaan-offline-shop:v1:${actor}`;
/** Storage refusal is a cache miss; it must never prevent an online shop from opening. */
export function loadOfflineShop(storage:Storage,actor:string,session:string):OfflineShopContext|null {
  try{return readOfflineShopContext(storage.getItem(key(actor)),actor,session);}catch{return null;}
}
export function saveOfflineShop(storage:Storage,context:OfflineShopContext) {
  try{
    const raw=JSON.stringify(context);storage.setItem(key(context.actorId),raw);
    if(storage.getItem(key(context.actorId))!==raw)throw Error('offline_shop_storage_unverified');
    return true;
  }catch{clearOfflineShop(storage,context.actorId);return false;}
}
export function clearOfflineShop(storage:Storage,actor:string) {
  try{storage.removeItem(key(actor));}catch{/* Storage unavailable. A future session still cannot load this context. */}
}
