import {createThumbnailCache,type ThumbnailEntry} from './thumbnail-cache';
import type {ProductSaveScope} from './save-recovery';
import {IMAGE_VARIANTS,type ImageReference} from './contract';
let database:Promise<IDBDatabase>|undefined;
function open(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{
 const request=indexedDB.open('samaan-product-thumbnails-v1',1);
 request.onupgradeneeded=()=>{request.result.createObjectStore('metadata',{keyPath:'key'});request.result.createObjectStore('photos');};
 request.onerror=()=>{database=undefined;reject(Error('product_image_cache_unavailable'));};request.onblocked=()=>{database=undefined;reject(Error('product_image_cache_unavailable'));};
 request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();database=undefined;};resolve(db);};
});}
async function transaction<T>(stores:string[],mode:IDBTransactionMode,work:(tx:IDBTransaction,finish:(value:T)=>void)=>void){
 const db=await open();return new Promise<T>((resolve,reject)=>{const tx=db.transaction(stores,mode);let result:T;tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(Error('product_image_cache_unavailable'));try{work(tx,value=>{result=value;});}catch(error){tx.abort();reject(error);}});
}
const cache=createThumbnailCache<Blob>({
 entries:()=>transaction<ThumbnailEntry[]>(['metadata'],'readonly',(tx,finish)=>{const request=tx.objectStore('metadata').getAll();request.onsuccess=()=>finish(request.result);}),
 read:key=>transaction<Blob|null>(['photos'],'readonly',(tx,finish)=>{const request=tx.objectStore('photos').get(key);request.onsuccess=()=>finish(request.result instanceof Blob?request.result:null);}),
 write:(entry,blob)=>transaction<void>(['metadata','photos'],'readwrite',tx=>{tx.objectStore('metadata').put(entry);tx.objectStore('photos').put(blob,entry.key);}),
 touch:entry=>transaction<void>(['metadata'],'readwrite',tx=>{tx.objectStore('metadata').put(entry);}),
 remove:keys=>transaction<void>(['metadata','photos'],'readwrite',tx=>{for(const key of keys){tx.objectStore('metadata').delete(key);tx.objectStore('photos').delete(key);}}),
});
export const retainProductThumbnails=(scope:ProductSaveScope|null)=>cache.retainScope(scope);
export const readOfflineThumbnail=(scope:ProductSaveScope,image:ImageReference,current:()=>boolean)=>cache.get(scope,image,current);
export const evictThumbnail=(scope:ProductSaveScope,image:ImageReference)=>cache.remove(scope,image);
/** Authorize every online byte read; only the small response Blob may enter IndexedDB. */
export async function loadOnlineThumbnail(scope:ProductSaveScope,image:ImageReference,url:string,lease:string,current:()=>boolean,signal:AbortSignal){
 const response=await fetch(url,{headers:{Authorization:`Bearer ${lease}`},credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal});
 if([401,403,404,410].includes(response.status))await cache.remove(scope,image).catch(()=>{});
 if([408,502,503,504].includes(response.status))throw Object.assign(Error('product_image_temporarily_unavailable'),{status:response.status});
 if(!response.ok||!current()||!response.headers.get('content-type')?.startsWith('image/webp'))return null;
 const reader=response.body?.getReader();if(!reader)return null;const chunks:Uint8Array<ArrayBuffer>[]=[];let bytes=0;
 try{for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>IMAGE_VARIANTS.thumb.maxBytes||!current()){await reader.cancel();return null;}chunks.push(new Uint8Array(part.value));}}finally{reader.releaseLock();}
 if(!bytes||!current())return null;const blob=new Blob(chunks,{type:'image/webp'});
 try{await cache.put(scope,image,blob,bytes,current);}catch{/* Optional cache failure must not hide an authorized online photo. */}
 return current()?blob:null;
}
