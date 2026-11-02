import {imageUuid,type ImageReference,IMAGE_VARIANTS} from './contract';
import type {ProductSaveScope} from './save-recovery';
export type ThumbnailEntry={key:string;scope:ProductSaveScope;imageId:string;version:string;bytes:number;savedAt:number;usedAt:number};
export type ThumbnailStorage<T>={entries:()=>Promise<ThumbnailEntry[]>;read:(key:string)=>Promise<T|null>;write:(entry:ThumbnailEntry,value:T)=>Promise<void>;touch:(entry:ThumbnailEntry)=>Promise<void>;remove:(keys:string[])=>Promise<void>};
const same=(a:ProductSaveScope,b:ProductSaveScope)=>a.actor===b.actor&&a.session===b.session&&a.shop===b.shop;
const keyFor=(scope:ProductSaveScope,image:Pick<ImageReference,'id'|'version'>)=>JSON.stringify([scope.actor,scope.session,scope.shop,image.id,image.version]);
const ttl=7*24*3600000;
const valid=(entry:ThumbnailEntry,now:number)=>entry&&entry.scope&&typeof entry.scope.actor==='string'&&typeof entry.scope.session==='string'&&typeof entry.scope.shop==='string'&&imageUuid(entry.imageId)&&typeof entry.version==='string'&&entry.version.length<=128&&entry.key===keyFor(entry.scope,{id:entry.imageId,version:entry.version})&&Number.isSafeInteger(entry.bytes)&&entry.bytes>0&&entry.bytes<=IMAGE_VARIANTS.thumb.maxBytes&&Number.isFinite(entry.savedAt)&&entry.savedAt<=now&&now-entry.savedAt<ttl&&Number.isFinite(entry.usedAt);
/** Optional thumbnail bytes only. Every online read still revalidates at the media endpoint. */
export function createThumbnailCache<T>(storage:ThumbnailStorage<T>,options:{maxBytes?:number;maxEntries?:number;now?:()=>number}={}){
 const maxBytes=options.maxBytes??50*1024*1024,maxEntries=options.maxEntries??2000,now=options.now??Date.now;
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1||!Number.isSafeInteger(maxEntries)||maxEntries<1)throw Error('product_image_cache_limits');
 let queue:Promise<unknown>=Promise.resolve();
 const run=<R>(work:()=>Promise<R>)=>{const value=queue.then(work);queue=value.catch(()=>{});return value;};
 const rows=async()=>{
  const all=await storage.entries(),accepted=all.filter(e=>valid(e,now())).sort((a,b)=>b.usedAt-a.usedAt),keep:ThumbnailEntry[]=[],remove=all.filter(e=>!accepted.includes(e)).map(e=>e.key);
  let total=0;for(const entry of accepted){if(keep.length>=maxEntries||total+entry.bytes>maxBytes)remove.push(entry.key);else{keep.push(entry);total+=entry.bytes;}}
  if(remove.length)await storage.remove(remove);return keep;
 };
 return {
  get:(scope:ProductSaveScope,image:ImageReference,current:()=>boolean)=>run(async()=>{
   const entries=await rows();if(!current())return null;
   const entry=entries.find(e=>e.key===keyFor(scope,image));if(!entry)return null;
   const value=await storage.read(entry.key);if(!current())return null;
   if(value===null){await storage.remove([entry.key]);return null;}
   await storage.touch({...entry,usedAt:now()});return current()?value:null;
  }),
  put:(scope:ProductSaveScope,image:ImageReference,value:T,bytes:number,current:()=>boolean)=>run(async()=>{
   if(!current())return false;
   const entry:ThumbnailEntry={key:keyFor(scope,image),scope:{...scope},imageId:image.id,version:image.version,bytes,savedAt:now(),usedAt:now()};
   if(!valid(entry,now())||bytes>maxBytes)return false;
   const entries=(await rows()).filter(e=>e.key!==entry.key).sort((a,b)=>a.usedAt-b.usedAt);
   let total=entries.reduce((n,e)=>n+e.bytes,0)+bytes,count=entries.length+1;const remove:string[]=[];
   // An updated image version retires all old versions of that image in this scope.
   for(const old of [...entries])if(same(old.scope,scope)&&old.imageId===image.id){remove.push(old.key);total-=old.bytes;count--;entries.splice(entries.indexOf(old),1);}
   for(const old of entries){if(total<=maxBytes&&count<=maxEntries)break;remove.push(old.key);total-=old.bytes;count--;}
   if(!current())return false;
   if(remove.length)await storage.remove(remove);if(!current())return false;
   await storage.write(entry,value);
   if(!current()){await storage.remove([entry.key]);return false;}return true;
  }),
  remove:(scope:ProductSaveScope,image:ImageReference)=>run(()=>storage.remove([keyFor(scope,image)])),
  retainScope:(scope:ProductSaveScope|null)=>run(async()=>{const all=await storage.entries();const remove=all.filter(e=>!scope||!valid(e,now())||!same(e.scope,scope)).map(e=>e.key);if(remove.length)await storage.remove(remove);}),
 };
}
