import {emptyProductMedia,type ProductMedia} from './contract';
/** Coalesce product-ID reads for history and secondary views outside the catalog. */
export function createProductMediaBatcher(load:(ids:string[])=>Promise<{media:Record<string,ProductMedia>}>,current:()=>boolean){
 const pending=new Map<string,{resolve:(media:ProductMedia)=>void;reject:(error:unknown)=>void}[]>();let scheduled=false,closed=false;
 const flush=async()=>{
  scheduled=false;const entries=[...pending.entries()].slice(0,100);for(const [id]of entries)pending.delete(id);
  if(pending.size){scheduled=true;void Promise.resolve().then(flush);}
  try{
   if(closed||!current())throw Error('auth_session_changed');const result=await load(entries.map(([id])=>id));if(closed||!current())throw Error('auth_session_changed');
   for(const [id,waiters]of entries)for(const waiter of waiters)waiter.resolve(result.media[id]??emptyProductMedia());
  }catch(error){for(const [,waiters]of entries)for(const waiter of waiters)waiter.reject(error);}
 };
 return {
  load(id:string):Promise<ProductMedia>{if(closed||!current())return Promise.reject(Error('auth_session_changed'));return new Promise((resolve,reject)=>{pending.set(id,[...(pending.get(id)??[]),{resolve,reject}]);if(!scheduled){scheduled=true;void Promise.resolve().then(flush);}});},
  clear(){closed=true;for(const waiters of pending.values())for(const waiter of waiters)waiter.reject(Error('auth_session_changed'));pending.clear();},
 };
}
