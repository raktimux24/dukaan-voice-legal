import {imageUuid,type ImageReference} from './contract';
import type {ProductSaveScope} from './save-recovery';
export type EditorCheckpoint={version:number;initial:string;draftId?:string;items:{clientId:string;image?:ImageReference}[];updatedAt:number};
type Storage={get:()=>Promise<string|null>;set:(value:string)=>Promise<void>;clear:()=>Promise<void>};
type Row={scope:ProductSaveScope;slot:string;checkpoint:EditorCheckpoint};
const same=(a:ProductSaveScope,b:ProductSaveScope)=>a.actor===b.actor&&a.session===b.session&&a.shop===b.shop;
const bytes=(value:string)=>{let n=0;for(const c of value){const p=c.codePointAt(0)!;n+=p<128?1:p<2048?2:p<65536?3:4;}return n;};
const valid=(p:EditorCheckpoint)=>p&&Number.isSafeInteger(p.version)&&p.version>=0&&typeof p.initial==='string'&&p.initial.length<4096&&
 Number.isSafeInteger(p.updatedAt)&&(!p.draftId||imageUuid(p.draftId))&&Array.isArray(p.items)&&p.items.length<=5&&
 new Set(p.items.map(i=>i.clientId)).size===p.items.length&&p.items.every(i=>imageUuid(i.clientId)&&(!i.image||
 imageUuid(i.image.id)&&typeof i.image.version==='string'&&i.image.version.length<=128&&Number.isSafeInteger(i.image.width)&&i.image.width>0&&Number.isSafeInteger(i.image.height)&&i.image.height>0&&typeof i.image.alt==='string'&&i.image.alt.length<=240&&!/[\x00-\x1f]/.test(i.image.alt)));
/** Stable media metadata only. Interrupted local files deliberately require reselection. */
export function createEditorRecovery(storage:Storage){
 let queue:Promise<unknown>=Promise.resolve();
 const run=<T>(fn:()=>Promise<T>)=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
 const read=async():Promise<Row[]>=>{
  const raw=await storage.get();if(!raw)return [];
  if(bytes(raw)>131072)throw Error('product_image_recovery_unavailable');
  const value=JSON.parse(raw);
  if(value.version!==1||!Array.isArray(value.rows)||value.rows.length>20||value.rows.some((r:Row)=>!r?.scope?.actor||!r.scope.session||!r.scope.shop||typeof r.slot!=='string'||!valid(r.checkpoint)))throw Error('product_image_recovery_unavailable');
  return value.rows;
 };
 const write=async(rows:Row[])=>{
  if(!rows.length){await storage.clear();if(await storage.get()!==null)throw Error('product_image_recovery_unavailable');return;}
  const raw=JSON.stringify({version:1,rows});if(rows.length>20||bytes(raw)>131072)throw Error('product_image_recovery_unavailable');
  await storage.set(raw);if(await storage.get()!==raw)throw Error('product_image_recovery_unavailable');
 };
 return {
  load:(scope:ProductSaveScope,slot:string,current:()=>boolean)=>run(async()=>{const rows=await read();if(!current())throw Error('auth_session_changed');return rows.find(r=>same(r.scope,scope)&&r.slot===slot)?.checkpoint??null;}),
  save:(scope:ProductSaveScope,slot:string,input:EditorCheckpoint,current:()=>boolean)=>{
   // Allow only these fields: callers cannot accidentally persist a local URI or lease.
   const checkpoint:EditorCheckpoint={version:input.version,initial:input.initial,updatedAt:input.updatedAt,...(input.draftId?{draftId:input.draftId}:{}),items:input.items.map(i=>({clientId:i.clientId,...(i.image?{image:{id:i.image.id,version:i.image.version,width:i.image.width,height:i.image.height,alt:i.image.alt}}:{})}))};
   return run(async()=>{if(!valid(checkpoint))throw Error('product_image_recovery_unavailable');const rows=await read();if(!current())throw Error('auth_session_changed');await write([...rows.filter(r=>!same(r.scope,scope)||r.slot!==slot),{scope,slot,checkpoint}]);if(!current())throw Error('auth_session_changed');});
  },
  remove:(scope:ProductSaveScope,slot:string,current:()=>boolean)=>run(async()=>{const rows=await read();if(!current())throw Error('auth_session_changed');await write(rows.filter(r=>!same(r.scope,scope)||r.slot!==slot));}),
  retainScope:(scope:ProductSaveScope|null)=>run(async()=>{if(!scope){await write([]);return;}const rows=await read();await write(rows.filter(r=>r.scope.actor===scope.actor&&r.scope.session===scope.session));}),
 };
}
