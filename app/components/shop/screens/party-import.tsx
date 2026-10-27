'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {usePartyImport} from '../../../lib/shop/party-imports/workflow';
import {PARTY_FIELDS,partyCounts,inferPartyMapping,type ImportTemplate} from '../../../lib/shop/party-imports/contract';
import {importErrorKey} from '../../../lib/shop/imports/client';
import type {PartyImportsApi,} from '../../../lib/shop/party-imports/client';
import type {PartyKind} from '../../../lib/shop/party-imports/contract';
import {useShop} from '../context';
import {Button,Card,Field,PageHeader,Spinner,PremiumLock} from '../ui';

type Translate=(key:string,vars?:Record<string,string|number>)=>string;
function download(file:ImportTemplate){const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:file.mime}));const a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function PartyImportPanel({api,shopId,actorId,language,t,allowed=true,backHref='/shop/customers',sampleFile,kind,jobId}:{jobId?:string;kind:PartyKind;api:PartyImportsApi;shopId:string;actorId:string;language:string;t:Translate;allowed?:boolean;backHref?:string;sampleFile?:{filename:string;base64:string}}){
 const params=useSearchParams(),openingSessionId=params.get('openingSessionId')??undefined;
 const w=usePartyImport(api,{shopId,actorId},allowed,()=>crypto.randomUUID(),openingSessionId);
 const [limit,setLimit]=useState(50),input=useRef<HTMLInputElement>(null),[confirmed,setConfirmed]=useState(false);
 const {job,options,busy}=w;const counts=partyCounts(job?.rows??[]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'auto'});},[w.phase,job?.id,job?.state==='applied']);
 const opened=useRef('');
 useEffect(()=>{if(jobId&&w.metadata.isSuccess&&opened.current!==jobId){opened.current=jobId;void w.open(jobId);}},[jobId,w.metadata.isSuccess]);
 const stagingId=job?.openingSessionId??openingSessionId,openingHref='/shop/settings/opening-balances?sessionId='+stagingId+'&kind='+kind+(params.get('onboarding')==='1'?'&onboarding=1':'')+(job?.state==='applied'?'&importId='+job.id:'');
 const message=w.error??w.metadata.error;const available=w.metadata.data?.available===true;
 const choose=async(file:File|undefined)=>{
  if(!file)return;if(file.size>10*1024*1024){w.setError({code:'import_too_large'});return;}
  try{const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});await w.upload({filename:file.name,base64});setConfirmed(false);setLimit(50);}catch{w.setError({code:'import_invalid_file'});}
 };
 const fieldLabel=(field:string)=>t('partiesImport.field.'+field);
 const display=(_field:string,value:unknown)=>value===null||value===undefined?'—':String(value);
 if(!allowed)return <Card><p>{t('partiesImport.error.not_allowed')}</p></Card>;
 return <div className="shop-page import-page">
  <PageHeader title={t('partiesImport.'+kind+'_title')} description={t('partiesImport.help')} back={{href:stagingId?openingHref:backHref,label:t(stagingId?'opening.return':kind==='customer'?'customers.title':'suppliers.title')}}/>
  {stagingId?<Card><p className="shop-hint">{t('opening.import_staged')}</p><Button href={openingHref} tone="ghost">{t('opening.return')}</Button></Card>:null}
  <nav className="import-steps" aria-label={t('partiesImport.'+kind+'_title')}>{['upload','map','review'].map((step,index)=><span key={step} aria-current={index===(w.phase==='upload'?0:w.phase==='mapping'?1:2)?'step':undefined}>{t('imports.step_'+step)}</span>)}</nav>
  {message?<div className="import-notice" role="alert"><p>{t(!w.error&&[404,503].includes((w.metadata.error as {status?:number})?.status??0)?'partiesImport.error.unavailable':importErrorKey(message).replace('imports.mapping_help','partiesImport.mapping_help').replace('imports.error.stale_review','partiesImport.error.stale_review').replace('imports.error.not_allowed','partiesImport.error.not_allowed').replace('imports.error.unavailable','partiesImport.error.unavailable'))}</p><Button tone="ghost" onClick={()=>{if(job)void w.open(job.id);else void w.metadata.refetch();}}>{t('imports.refresh')}</Button></div>:null}
  {w.metadata.isLoading?<Spinner label={t('partiesImport.'+kind+'_title')}/>:null}
  {w.phase==='upload'?<>
   <Card className="import-upload-card"><div className="import-upload-symbol" aria-hidden="true">↑</div><h2>{t('imports.choose_file')}</h2><p>{t('imports.file_limit')}</p>
    <input ref={input} type="file" accept=".xlsx,.csv" className="sr-only" aria-hidden="true" tabIndex={-1} disabled={busy||!available} onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/>
    <Button disabled={busy||!available} onClick={()=>input.current?.click()}>{t('imports.choose_file')}</Button>
    {sampleFile?<Button tone="ghost" disabled={busy||!available} onClick={()=>void w.upload(sampleFile)}>{t('imports.load_sample')}</Button>:null}
    <div className="import-template-actions">{(['xlsx','csv'] as const).map(format=><Button key={format} tone="ghost" disabled={busy||!available} onClick={()=>void w.run(async guard=>{const file=await api.template(shopId,format,language);guard();download(file);})}>{t('imports.download_template')} · {format.toUpperCase()}</Button>)}</div>
    <p className="shop-hint">{t('partiesImport.template_help')}</p>
   </Card>
   <Card><h2 className="shop-section-title">{t('partiesImport.history')}</h2>{w.metadata.data?.jobs.length?w.metadata.data.jobs.filter(j=>!openingSessionId||j.openingSessionId===openingSessionId).map(j=><button key={j.id} className="shop-list-row w-full" aria-label={j.filename+' · '+t('imports.state.'+j.state)+' · '+t('partiesImport.progress',{done:j.applied,total:j.total})} disabled={busy} onClick={()=>void w.open(j.id)}><span className="shop-list-main"><span className="shop-list-title">{j.filename}</span><span className="shop-list-meta">{t('imports.state.'+j.state)}</span></span><span>{j.applied}/{j.total}</span></button>):<p className="shop-hint">{t('partiesImport.no_history')}</p>}</Card>
  </>:null}
  {job&&options&&w.phase==='mapping'?<Card>
   <h2 className="shop-section-title">{job.filename}</h2><p className="shop-hint">{t('partiesImport.mapping_help')}</p>
   <div className="import-form-grid">
    <Field label={t('imports.sheet')}><select className="shop-field" disabled={busy||job.applied>0} value={options.sheet} onChange={e=>{const sheet=Number(e.target.value);w.setOptions({...options,sheet,mapping:inferPartyMapping(job.sheets[sheet].headers),skipRows:[]});}}>{job.sheets.map((s,i)=><option key={i} value={i}>{s.name} ({s.rows.length})</option>)}</select></Field>
    <Field label={t('partiesImport.review')}><select className="shop-field" disabled={busy||job.applied>0} value={options.mode} onChange={e=>w.setOptions({...options,mode:e.target.value as 'create'|'update'})}><option value="create">{t('partiesImport.mode_create')}</option><option value="update">{t('partiesImport.mode_update')}</option></select></Field>
    {!stagingId?<Field label={t('partiesImport.as_of')}><input className="shop-field" type="date" value={options.asOf} disabled={busy||job.applied>0} onChange={e=>w.setOptions({...options,asOf:e.target.value})}/></Field>:null}
   </div>
   <div className="import-mapping">{PARTY_FIELDS.map(field=><Field key={field} label={fieldLabel(field)} hint={options.mapping[field]!==undefined?job.sheets[options.sheet].rows[0]?.cells[options.mapping[field]!]:undefined}><select className="shop-field" value={options.mapping[field]??''} disabled={busy||job.applied>0} onChange={e=>{const mapping={...options.mapping};if(e.target.value==='')delete mapping[field];else mapping[field]=Number(e.target.value);w.setOptions({...options,mapping});}}><option value="">{t('imports.ignore')}</option>{job.sheets[options.sheet].headers.map((header,i)=><option key={i} value={i}>{header}</option>)}</select></Field>)}</div>
   <p className="import-notice">{t(stagingId?'opening.import_staged':'partiesImport.'+kind+'_balance_help')+' '+t('partiesImport.balance_help')+(kind==='supplier'?' '+t('partiesImport.supplier_required'):'')}</p><div className="import-bottom-actions"><Button tone="ghost" disabled={busy} onClick={w.reset}>{t('imports.start_over')}</Button><Button disabled={busy||options.mapping.name===undefined} onClick={()=>{setConfirmed(false);void w.review();}}>{t('partiesImport.review')}</Button></div>
  </Card>:null}
  {job&&options&&w.phase==='review'?<>
   <Card><h2 className="shop-section-title">{job.state==='applied'?t('partiesImport.done'):t('imports.step_review')}</h2><p>{t('imports.summary',counts)}</p><p>{t('partiesImport.as_of')} · {options.asOf}</p><p className="shop-hint">{t('partiesImport.progress',{done:job.applied,total:job.total})}</p>{job.state!=='applied'?<p className="shop-hint">{t(stagingId?'opening.import_staged':'partiesImport.review_help')}</p>:null}
    <div className="import-template-actions"><Button tone="ghost" disabled={busy} onClick={()=>void w.run(async guard=>{const file=await api.issues(shopId,job.id,language);guard();download(file);})}>{t('imports.download_issues')}</Button>{job.state!=='applied'?<Button tone="ghost" disabled={busy} onClick={()=>{setConfirmed(false);void w.review();}}>{t('imports.refresh')}</Button>:null}</div>
   </Card>
   <div className="import-review-list">{job.rows.slice(0,limit).map(row=><Card key={row.row} className={row.action==='skip'?'import-skipped':''}>
    <div className="import-row-head"><h3>{t('imports.row')} {row.row} · {row.name||'—'}</h3><span className="import-row-status">{row.outcome?t('partiesImport.done'):row.action==='skip'?t('imports.skip'):row.issues.length?t('imports.issues'):t(row.action==='create'?'partiesImport.mode_create':'partiesImport.mode_update')}</span></div>
    {row.party?<dl className="import-values">{PARTY_FIELDS.filter(f=>row.action==='update'?row.party?.[f]!==undefined:row.party?.[f]!==undefined).map(f=><div key={f}><dt>{fieldLabel(f)}</dt><dd>{row.action==='update'?display(f,row.before?.[f])+' → ':''}{display(f,row.party?.[f])}</dd></div>)}</dl>:null}
    {row.issues.map((issue,i)=><p className="import-row-error" key={'e'+i}>{issue.field?fieldLabel(issue.field)+': ':''}{t('partiesImport.issue.'+issue.code)}</p>)}
    {row.warnings.map((issue,i)=><p className="shop-hint" key={'w'+i}>{t('partiesImport.issue.'+issue.code)}</p>)}
    {!row.outcome&&job.state!=='applied'?<Button tone="quiet" disabled={busy} onClick={()=>{setConfirmed(false);void w.review({...options,skipRows:row.action==='skip'?options.skipRows.filter(n=>n!==row.row):[...options.skipRows,row.row]});}}>{t(row.action==='skip'?'imports.include':'imports.skip')}</Button>:null}
   </Card>)}</div>
   {limit<job.rows.length?<Button tone="ghost" onClick={()=>setLimit(n=>n+50)}>{t('imports.more')}</Button>:null}
   <Card className="import-sticky-actions">{job.state==='applied'?<div className="import-bottom-actions"><Button tone="ghost" onClick={w.reset}>{t('imports.start_over')}</Button><Button href={stagingId?openingHref:backHref}>{t(stagingId?'opening.return':kind==='customer'?'customers.title':'suppliers.title')}</Button></div>:<>
    <label className="import-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/><span>{t(stagingId?'opening.import_confirm':'partiesImport.confirm')}</span></label>
    <div className="import-bottom-actions"><Button tone="ghost" disabled={busy} onClick={()=>w.setPhase('mapping')}>{t('imports.back')}</Button><Button disabled={busy||!confirmed||counts.errors>0||job.total<=job.applied} onClick={()=>void w.commit()}>{busy?t('partiesImport.progress',{done:job.applied,total:job.total}):t('partiesImport.save')}</Button></div>
   </>}</Card>
  </>:null}
 </div>;
}

export function PartyImportScreen({kind,jobId}:{kind:PartyKind;jobId?:string}){const {api,shop,userId,perms,t,prefs,premium}=useShop();if(!shop)return <Spinner/>;if(kind==='customer'&&!premium)return <PremiumLock shopId={shop.id} feature="udhaar"/>;return <PartyImportPanel kind={kind} jobId={jobId} api={kind==='customer'?api.customerImports:api.supplierImports} shopId={shop.id} actorId={userId??''} language={prefs?.appLanguage??'en'} allowed={kind==='customer'?perms.canManageCustomers:perms.canSeeCost} backHref={'/shop/'+kind+'s'} t={(key,vars)=>t(key,key,vars)}/>;}
