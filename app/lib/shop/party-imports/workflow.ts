import {useEffect,useRef,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {inferPartyMapping,type PartyJob,type PartyOptions} from './contract';
import type {PartyImportsApi} from './client';

/** One controller drives native and web; every asynchronous result stays actor/shop scoped. */
export function usePartyImport(api:PartyImportsApi,scope:{shopId:string;actorId:string;generation?:number},enabled:boolean,newId:()=>string,openingSessionId?:string){
 const key=api.kind+':'+scope.actorId+':'+scope.shopId+':'+(scope.generation??0)+':'+(openingSessionId??''),current=useRef(key);current.current=key;
 const running=useRef(false);
 const qc=useQueryClient(),[job,setJob]=useState<PartyJob|null>(null),[options,setOptions]=useState<PartyOptions|null>(null),[phase,setPhase]=useState<'upload'|'mapping'|'review'>('upload'),[error,setError]=useState<unknown>(null),[busy,setBusy]=useState(false);
 const metadata=useQuery({queryKey:['partyImports',scope.shopId,api.kind,scope.actorId,scope.generation],queryFn:()=>api.metadata(scope.shopId),enabled:enabled&&!!scope.shopId&&!!scope.actorId,retry:false});
 useEffect(()=>{running.current=false;setJob(null);setOptions(null);setPhase('upload');setError(null);setBusy(false);return ()=>{if(current.current===key)current.current='';};},[key]);
 const run=async(action:(guard:()=>void)=>Promise<void>)=>{
  const captured=key;const guard=()=>{if(current.current!==captured)throw Error('scope_changed');};
  if(running.current)return;running.current=true;setBusy(true);setError(null);
  try{guard();await action(guard);}catch(e){if(current.current===captured)setError(e);}finally{if(current.current===captured){running.current=false;setBusy(false);}}
 };
 const receive=(next:PartyJob)=>{
  setJob(next);setOptions(next.options??{sheet:0,mapping:inferPartyMapping(next.sheets[0]?.headers??[]),mode:'create',asOf:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),skipRows:[]});
  setPhase(next.state==='uploaded'?'mapping':'review');
 };
 const invalidate=()=>Promise.all(['customers','customer','customerSummary','customers-summary','suppliers','gstSuppliers','gstSupplier','gst','partyImports','partyProfile','auditLog'].map(query=>qc.invalidateQueries({queryKey:[query,scope.shopId]})));
 const upload=(file:{filename:string;base64:string})=>run(async guard=>{const next=await api.upload(scope.shopId,{...file,clientId:newId(),...(openingSessionId?{openingSessionId}:{})});guard();receive(next);await metadata.refetch();});
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
