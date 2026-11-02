type Storage = {get:()=>Promise<string|null>;set:(value:string)=>Promise<void>;clear:()=>Promise<void>};
export type ProductSaveScope={actor:string;session:string;shop:string};
type RecordRow={scope:ProductSaveScope;slot:string;body:Record<string,unknown>};
const same=(a:ProductSaveScope,b:ProductSaveScope)=>a.actor===b.actor&&a.session===b.session&&a.shop===b.shop;
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
/** A separate, bounded journal of exact media saves. It never submits requests automatically. */
export function createProductSaveRecovery(storage:Storage){
 let queue:Promise<unknown>=Promise.resolve();
 const run=<T>(work:()=>Promise<T>)=>{const result=queue.then(work);queue=result.catch(()=>{});return result;};
 const read=async():Promise<RecordRow[]>=>{
  const raw=await storage.get();if(!raw)return [];
  if(raw.length>65_536)throw Error('product_image_recovery_unavailable');
  const value=JSON.parse(raw);
  if(value.version!==1||!Array.isArray(value.rows)||value.rows.length>20||raw.length>65_536||
   value.rows.some((row:RecordRow)=>!row?.scope?.actor||!row.scope.session||!row.scope.shop||typeof row.slot!=='string'||
    !row.body||typeof row.body.productRequestId!=='string'))throw Error('product_image_recovery_unavailable');
  return value.rows;
 };
 const write=async(rows:RecordRow[])=>{
  if(!rows.length){await storage.clear();if(await storage.get()!==null)throw Error('product_image_recovery_unavailable');return;}
  const value=JSON.stringify({version:1,rows});
  if(rows.length>20||value.length>65_536)throw Error('product_image_recovery_unavailable');
  await storage.set(value);
  if(await storage.get()!==value)throw Error('product_image_recovery_unavailable');
 };
 return {
  load:(scope:ProductSaveScope,slot:string,current:()=>boolean)=>run(async()=>{
   const rows=await read();if(!current())throw Error('auth_session_changed');
   return clone(rows.find(row=>same(row.scope,scope)&&row.slot===slot)?.body??null);
  }),
  save:(scope:ProductSaveScope,slot:string,input:Record<string,unknown>,current:()=>boolean)=>{
   const body=clone(input);
   return run(async()=>{
   const rows=await read();if(!current())throw Error('auth_session_changed');
   if(typeof body.productRequestId!=='string')throw Error('product_image_recovery_unavailable');
   const previous=rows.find(row=>same(row.scope,scope)&&row.slot===slot);
   if(previous&&JSON.stringify(previous.body)!==JSON.stringify(body))throw Error('product_image_save_pending');
   if(!previous)rows.push({scope,slot,body:clone(body)});
   await write(rows);if(!current())throw Error('auth_session_changed');
   });
  },
  remove:(scope:ProductSaveScope,slot:string,request:string,current:()=>boolean)=>run(async()=>{
   const rows=await read();if(!current())throw Error('auth_session_changed');
   await write(rows.filter(row=>!same(row.scope,scope)||row.slot!==slot||row.body.productRequestId!==request));
  }),
  retainScope:(scope:ProductSaveScope|null)=>run(async()=>{
   if(!scope){await write([]);return;}
   // Switching shops must not erase an unconfirmed write in the previous shop.
   // Reads still require the complete actor/session/shop scope.
   const rows=await read();await write(rows.filter(row=>row.scope.actor===scope.actor&&row.scope.session===scope.session));
  }),
 };
}
