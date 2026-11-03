/** Short-lived leases remain in memory and are batched across visible rows. */
export function createImageLeaseBatcher(load:(ids:string[])=>Promise<{leases:Record<string,string>;expiresAt:string}>,current:()=>boolean){
 const cache=new Map<string,{token:string;expires:number}>(),pending=new Map<string,{resolve:(token:string)=>void;reject:(error:unknown)=>void}[]>();let scheduled=false,revision=0;
 const flush=async()=>{
  scheduled=false;const entries=[...pending.entries()].slice(0,100);for(const [id]of entries)pending.delete(id);
  if(pending.size){scheduled=true;void Promise.resolve().then(flush);}
  if(!entries.length)return;const started=revision;
  try{
   if(!current())throw Error('auth_session_changed');const result=await load(entries.map(([id])=>id));if(started!==revision||!current())throw Error('auth_session_changed');
   const expires=Date.parse(result.expiresAt);if(!Number.isFinite(expires)||expires<=Date.now())throw Error('product_image_expired');
   for(const [id,waiters]of entries){const token=result.leases[id];if(token){cache.set(id,{token,expires});for(const w of waiters)w.resolve(token);}else for(const w of waiters)w.reject(Error('product_image_not_found'));}
   while(cache.size>500)cache.delete(cache.keys().next().value!);
  }catch(e){for(const [,waiters]of entries)for(const w of waiters)w.reject(e);}
 };
 return {
  load(id:string):Promise<string>{
   if(!current())return Promise.reject(Error('auth_session_changed'));
   const hit=cache.get(id);if(hit&&hit.expires-Date.now()>30000)return Promise.resolve(hit.token);
   return new Promise((resolve,reject)=>{pending.set(id,[...(pending.get(id)??[]),{resolve,reject}]);if(!scheduled){scheduled=true;void Promise.resolve().then(flush);}});
  },
  clear(){revision++;cache.clear();for(const waiters of pending.values())for(const w of waiters)w.reject(Error('auth_session_changed'));pending.clear();},
 };
}
