import {IMAGE_LIMITS,type GalleryInput,type ImageReference,type ProductGallery} from './contract';
import type {EditorCheckpoint,EditorFields} from './editor-recovery';

export type PreparedImage<T>={uri:string;payload:T;release:()=>void|Promise<void>};
export type EditorItem<T>={clientId:string;image?:ImageReference;local?:PreparedImage<T>;status:'ready'|'uploading'|'failed'|'reselect';progress:number;error?:string;recovered?:boolean};
export type ImageEditorState<T>={loaded:boolean;available:boolean;canEdit:boolean;version:number;items:EditorItem<T>[];error:string|null;fields?:EditorFields};
type Adapter<T>={
 uuid:()=>string;current:()=>boolean;
 capabilities:()=>Promise<{available:boolean;canEdit:boolean}>;
 gallery?:()=>Promise<ProductGallery>;
 draft:(id:string)=>Promise<{id:string}>;
 upload:(draft:string,client:string,payload:T,signal:AbortSignal,progress:(n:number)=>void)=>Promise<{image:ImageReference}>;
 outcome?:(client:string)=>Promise<{state:string;image?:ImageReference}>;
 recovery?:{load:()=>Promise<EditorCheckpoint|null>;save:(checkpoint:EditorCheckpoint)=>Promise<void>;clear:()=>Promise<void>};
};
/** Shared transient form state. Stable IDs and prepared bytes survive every retry. */
export function createProductImageEditor<T>(adapter:Adapter<T>){
 let state:ImageEditorState<T>={loaded:false,available:false,canEdit:false,version:0,items:[],error:null};
 let live=true,draft:Promise<string>|undefined,draftId:string|undefined,manifest:GalleryInput|undefined,initial='[]',queue=Promise.resolve();
 let initialized=false,cleared=false,persistence:Promise<void>=Promise.resolve(),storageError=false,hadCheckpoint=false,checkpointAt=Date.now();
 const listeners=new Set<()=>void>(),flights=new Map<string,AbortController>();
 const current=()=>live&&adapter.current();
 const persist=()=>{
  if(!adapter.recovery||!initialized||cleared)return Promise.resolve();
  const checkpoint:EditorCheckpoint={version:state.version,initial,draftId,updatedAt:checkpointAt,fields:state.fields,items:state.items.map(i=>({clientId:i.clientId,...(i.image?{image:{...i.image}}:{})}))};
  const changed=JSON.stringify(checkpoint.items.map(i=>({id:i.image?.id??i.clientId,alt:i.image?.alt??''})))!==initial;
  const result=persistence.catch(()=>{}).then(async()=>{if(!current())return;if(changed){await adapter.recovery!.save(checkpoint);hadCheckpoint=true;}else if(hadCheckpoint){await adapter.recovery!.clear();hadCheckpoint=false;}});
  persistence=result;
  void result.then(()=>{storageError=false;},()=>{storageError=true;if(current()){state={...state,error:'product_image_recovery_unavailable'};listeners.forEach(fn=>fn());}});
  return result;
 };
 const update=(patch:Partial<ImageEditorState<T>>,durable=true)=>{if(current()){state={...state,...patch};listeners.forEach(fn=>fn());if(durable)void persist().catch(()=>{});}};
 const edit=(client:string,patch:Partial<EditorItem<T>>)=>update({items:state.items.map(item=>item.clientId===client?{...item,...patch}:item)},Object.keys(patch).some(k=>k!=='progress'));
 const signature=()=>JSON.stringify(state.items.map(item=>({id:item.image?.id??item.clientId,alt:item.image?.alt??''})));
 const release=(local?:PreparedImage<T>)=>{if(local)void Promise.resolve(local.release()).catch(()=>{});};
 const upload=async(client:string)=>{
  const item=state.items.find(i=>i.clientId===client);if(!current()||!item||flights.has(client))return;
  if(!item.local){
   if(item.status==='reselect'&&adapter.outcome)try{const result=await adapter.outcome(client);if(current()&&result.image&&['staged','attached'].includes(result.state)){edit(client,{image:result.image,status:'ready',progress:1,recovered:true});await persistence;}}catch{/* No durable local file: keep the explicit reselection state. */}
   return;
  }
  const controller=new AbortController();flights.set(client,controller);edit(client,{status:'uploading',error:undefined,progress:0});
  const preceding=queue;let unlock!:()=>void;queue=new Promise<void>(resolve=>{unlock=resolve;});
  try{
   await preceding;if(!current()||controller.signal.aborted)return;
   await persistence;if(!current()||controller.signal.aborted)return;
   if(!draft){draftId??=adapter.uuid();await persist();draft=adapter.draft(draftId).then(value=>value.id).catch(error=>{draft=undefined;throw error;});}
   const id=await draft;if(!current()||controller.signal.aborted)return;
   const result=await adapter.upload(id,client,item.local.payload,controller.signal,n=>edit(client,{progress:Math.max(0,Math.min(n,1))}));
   if(!controller.signal.aborted){manifest=undefined;edit(client,{image:result.image,status:'ready',progress:1});await persistence;}
  }catch(error){if(!controller.signal.aborted)edit(client,{status:'failed',error:(error as Error).message??'product_image_failed'});}
  finally{flights.delete(client);unlock();}
 };
 return {
  getSnapshot:()=>state,
  subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
  async load(){
   try{const [cap,gallery,saved]=await Promise.all([adapter.capabilities(),adapter.gallery?.(),adapter.recovery?.load().catch(()=>{storageError=true;throw Error('product_image_recovery_unavailable');})]);if(!current())return;
    const items=gallery?.images.map(image=>({clientId:image.id,image,status:'ready' as const,progress:1}))??[];
    update({loaded:true,available:cap.available,canEdit:cap.canEdit,version:gallery?.version??0,items,error:null});initial=signature();
    if(saved&&cap.canEdit){
     hadCheckpoint=true;checkpointAt=saved.updatedAt;
     const expired=Date.now()-saved.updatedAt>=IMAGE_LIMITS.stageHours*3600000;
     draftId=expired?undefined:saved.draftId;
     initial=saved.initial;
     const restored=await Promise.all(saved.items.map(async item=>{
      const attached=gallery?.images.find(i=>i.id===item.image?.id&&i.version===item.image?.version);
      let image=expired&&!attached?undefined:item.image;
      if(!image&&!expired&&adapter.outcome)try{const result=await adapter.outcome(item.clientId);if(['staged','attached'].includes(result.state))image=result.image;}catch{/* Reselection remains available without retaining original bytes. */}
      return {clientId:item.clientId,...(image?{image}:{}),status:image?'ready' as const:'reselect' as const,progress:image?1:0,recovered:!!image&&!attached};
     }));
     update({version:saved.version,fields:saved.fields,items:restored});
    }
    initialized=true;
   }catch(error){update({loaded:true,error:(error as Error).message??'product_image_failed'});}
  },
  async add(local:PreparedImage<T>){
   if(!current()||!state.loaded||!state.available||!state.canEdit){release(local);throw Error('product_image_unavailable');}
   if(state.items.length>=IMAGE_LIMITS.count){release(local);throw Error('product_image_count');}
   const clientId=adapter.uuid();manifest=undefined;update({items:[...state.items,{clientId,local,status:'uploading',progress:0}]});await upload(clientId);
  },
  retry:upload,
  remove(client:string){const item=state.items.find(i=>i.clientId===client);flights.get(client)?.abort();flights.delete(client);manifest=undefined;update({items:state.items.filter(i=>i.clientId!==client)});release(item?.local);},
  move(client:string,index:number){const rows=[...state.items],from=rows.findIndex(i=>i.clientId===client);if(from<0||index<0||index>=rows.length)return;const [row]=rows.splice(from,1);rows.splice(index,0,row);manifest=undefined;update({items:rows});},
  alt(client:string,alt:string){if(alt.length>240||/[\x00-\x1f]/.test(alt))return;const item=state.items.find(i=>i.clientId===client);if(item?.image){manifest=undefined;edit(client,{image:{...item.image,alt}});}},
  dirty:()=>signature()!==initial,
  setFields(fields:EditorFields){if(JSON.stringify(fields)!==JSON.stringify(state.fields))update({fields:{...fields}});},
  async clearRecovery(){await persistence.catch(()=>{});if(adapter.recovery&&hadCheckpoint)await adapter.recovery.clear();cleared=true;hadCheckpoint=false;},
  async manifest():Promise<GalleryInput|undefined>{
   if(!current())throw Error('auth_session_changed');
   await persist();if(storageError)throw Error('product_image_recovery_unavailable');
   if(state.items.some(i=>i.status!=='ready'||!i.image))throw Error('product_image_pending');
   if(signature()===initial)return undefined;
   if(!state.available||!state.canEdit)throw Error('product_image_unavailable');
   if(!manifest)manifest={clientId:adapter.uuid(),expectedVersion:state.version,...(draftId?{draftId:draft?await draft:draftId}:{}),images:state.items.map(i=>({id:i.image!.id,alt:i.image!.alt}))};
   return manifest;
  },
  dispose(){live=false;for(const c of flights.values())c.abort();flights.clear();for(const i of state.items)release(i.local);listeners.clear();},
 };
}
