import {IMAGE_LIMITS,type GalleryInput,type ImageReference,type ProductGallery} from './contract';

export type PreparedImage<T>={uri:string;payload:T;release:()=>void|Promise<void>};
export type EditorItem<T>={clientId:string;image?:ImageReference;local?:PreparedImage<T>;status:'ready'|'uploading'|'failed';progress:number;error?:string};
export type ImageEditorState<T>={loaded:boolean;available:boolean;canEdit:boolean;version:number;items:EditorItem<T>[];error:string|null};
type Adapter<T>={
 uuid:()=>string;current:()=>boolean;
 capabilities:()=>Promise<{available:boolean;canEdit:boolean}>;
 gallery?:()=>Promise<ProductGallery>;
 draft:(id:string)=>Promise<{id:string}>;
 upload:(draft:string,client:string,payload:T,signal:AbortSignal,progress:(n:number)=>void)=>Promise<{image:ImageReference}>;
};
/** Shared transient form state. Stable IDs and prepared bytes survive every retry. */
export function createProductImageEditor<T>(adapter:Adapter<T>){
 let state:ImageEditorState<T>={loaded:false,available:false,canEdit:false,version:0,items:[],error:null};
 let live=true,draft:Promise<string>|undefined,manifest:GalleryInput|undefined,initial='[]',queue=Promise.resolve();
 const listeners=new Set<()=>void>(),flights=new Map<string,AbortController>();
 const current=()=>live&&adapter.current();
 const update=(patch:Partial<ImageEditorState<T>>)=>{if(current()){state={...state,...patch};listeners.forEach(fn=>fn());}};
 const edit=(client:string,patch:Partial<EditorItem<T>>)=>update({items:state.items.map(item=>item.clientId===client?{...item,...patch}:item)});
 const signature=()=>JSON.stringify(state.items.map(item=>({id:item.image?.id??item.clientId,alt:item.image?.alt??''})));
 const release=(local?:PreparedImage<T>)=>{if(local)void Promise.resolve(local.release()).catch(()=>{});};
 const upload=async(client:string)=>{
  const item=state.items.find(i=>i.clientId===client);if(!current()||!item?.local||flights.has(client))return;
  const controller=new AbortController();flights.set(client,controller);edit(client,{status:'uploading',error:undefined,progress:0});
  const preceding=queue;let unlock!:()=>void;queue=new Promise<void>(resolve=>{unlock=resolve;});
  try{
   await preceding;if(!current()||controller.signal.aborted)return;
   if(!draft){const id=adapter.uuid();draft=adapter.draft(id).then(value=>value.id).catch(error=>{draft=undefined;throw error;});}
   const id=await draft;if(!current()||controller.signal.aborted)return;
   const result=await adapter.upload(id,client,item.local.payload,controller.signal,n=>edit(client,{progress:Math.max(0,Math.min(n,1))}));
   if(!controller.signal.aborted){manifest=undefined;edit(client,{image:result.image,status:'ready',progress:1});}
  }catch(error){if(!controller.signal.aborted)edit(client,{status:'failed',error:(error as Error).message??'product_image_failed'});}
  finally{flights.delete(client);unlock();}
 };
 return {
  getSnapshot:()=>state,
  subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
  async load(){
   try{const [cap,gallery]=await Promise.all([adapter.capabilities(),adapter.gallery?.()]);if(!current())return;
    const items=gallery?.images.map(image=>({clientId:image.id,image,status:'ready' as const,progress:1}))??[];
    update({loaded:true,available:cap.available,canEdit:cap.canEdit,version:gallery?.version??0,items,error:null});initial=signature();
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
  async manifest():Promise<GalleryInput|undefined>{
   if(!current())throw Error('auth_session_changed');
   if(state.items.some(i=>i.status!=='ready'||!i.image))throw Error('product_image_pending');
   if(signature()===initial)return undefined;
   if(!state.available||!state.canEdit)throw Error('product_image_unavailable');
   if(!manifest)manifest={clientId:adapter.uuid(),expectedVersion:state.version,...(draft?{draftId:await draft}:{}),images:state.items.map(i=>({id:i.image!.id,alt:i.image!.alt}))};
   return manifest;
  },
  dispose(){live=false;for(const c of flights.values())c.abort();flights.clear();for(const i of state.items)release(i.local);listeners.clear();},
 };
}
