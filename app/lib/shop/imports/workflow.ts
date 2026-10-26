import {useEffect,useRef,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {inferImportMapping,type ImportJob,type ImportOptions} from './contract';
import type {InventoryImportsApi} from './client';

/** One controller drives native and web; every asynchronous result stays actor/shop scoped. */
export function useInventoryImport(api:InventoryImportsApi,scope:{shopId:string;actorId:string;generation?:number},enabled:boolean,newId:()=>string){
 const key=scope.actorId+':'+scope.shopId+':'+(scope.generation??0),current=useRef(key);current.current=key;
 const running=useRef(false);
 const qc=useQueryClient(),[job,setJob]=useState<ImportJob|null>(null),[options,setOptions]=useState<ImportOptions|null>(null),[phase,setPhase]=useState<'upload'|'mapping'|'review'>('upload'),[error,setError]=useState<unknown>(null),[busy,setBusy]=useState(false);
 const metadata=useQuery({queryKey:['inventoryImports',scope.shopId,scope.actorId,scope.generation],queryFn:()=>api.metadata(scope.shopId),enabled:enabled&&!!scope.shopId&&!!scope.actorId,retry:false});
 useEffect(()=>{running.current=false;setJob(null);setOptions(null);setPhase('upload');setError(null);setBusy(false);return ()=>{if(current.current===key)current.current='';};},[key]);
 const run=async(action:(guard:()=>void)=>Promise<void>)=>{
  const captured=key;const guard=()=>{if(current.current!==captured)throw Error('scope_changed');};
  if(running.current)return;running.current=true;setBusy(true);setError(null);
  try{guard();await action(guard);}catch(e){if(current.current===captured)setError(e);}finally{if(current.current===captured){running.current=false;setBusy(false);}}
 };
 const receive=(next:ImportJob)=>{
  setJob(next);setOptions(next.options??{sheet:0,mapping:inferImportMapping(next.sheets[0]?.headers??[]),category:metadata.data?.categories[0]?.code??'',subcategory:metadata.data?.categories[0]?.children[0]?.code??'',mode:'create',asOf:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),skipRows:[]});
  setPhase(next.state==='uploaded'?'mapping':'review');
 };
 const invalidate=()=>Promise.all(['catalog','inventory','inventoryStats','alerts','auditLog','inventoryImports'].map(query=>qc.invalidateQueries({queryKey:[query,scope.shopId]})));
 const upload=(file:{filename:string;base64:string})=>run(async guard=>{const next=await api.upload(scope.shopId,{...file,clientId:newId()});guard();receive(next);await metadata.refetch();});
 const open=(id:string)=>run(async guard=>{const next=await api.get(scope.shopId,id);guard();receive(next);});
 const review=(nextOptions=options)=>run(async guard=>{if(!job||!nextOptions)return;const next=await api.review(scope.shopId,job.id,job.version,nextOptions);guard();receive(next);});
 const commit=()=>run(async guard=>{
  if(!job)return;let next=job;
  try{
   while(next.state!=='applied'){
    guard();next=await api.commit(scope.shopId,next.id,next.version,newId());guard();receive(next);
   }
  }finally{if(current.current===key)await invalidate();}
 });
 const reset=()=>{setJob(null);setOptions(null);setPhase('upload');setError(null);};
 return {metadata,job,options,setOptions,phase,setPhase,error,setError,busy,upload,open,review,commit,reset,run};
}
