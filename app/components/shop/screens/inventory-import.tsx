'use client';

import {useEffect,useRef,useState} from 'react';
import {useInventoryImport} from '../../../lib/shop/imports/workflow';
import {IMPORT_FIELDS,importCounts,inferImportMapping,type ImportTemplate} from '../../../lib/shop/imports/contract';
import {importErrorKey,type InventoryImportsApi} from '../../../lib/shop/imports/client';
import {useShop} from '../context';
import {Button,Card,Field,PageHeader,Spinner} from '../ui';

type Translate=(key:string,vars?:Record<string,string|number>)=>string;
function download(file:ImportTemplate){const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:file.mime}));const a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function InventoryImportPanel({api,shopId,actorId,language,t,allowed=true,backHref='/shop/products',sampleFile}:{api:InventoryImportsApi;shopId:string;actorId:string;language:string;t:Translate;allowed?:boolean;backHref?:string;sampleFile?:{filename:string;base64:string}}){
 const w=useInventoryImport(api,{shopId,actorId},allowed,()=>crypto.randomUUID());
 const [limit,setLimit]=useState(50),input=useRef<HTMLInputElement>(null),[confirmed,setConfirmed]=useState(false);
 const {job,options,busy}=w;const counts=importCounts(job?.rows??[]),categories=w.metadata.data?.categories??[];
 useEffect(()=>{window.scrollTo({top:0,behavior:'auto'});},[w.phase,job?.id,job?.state==='applied']);
 const message=w.error??w.metadata.error;const available=w.metadata.data?.available===true;
 const choose=async(file:File|undefined)=>{
  if(!file)return;if(file.size>10*1024*1024){w.setError({code:'import_too_large'});return;}
  try{const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});await w.upload({filename:file.name,base64});setConfirmed(false);setLimit(50);}catch{w.setError({code:'import_invalid_file'});}
 };
 const fieldLabel=(field:string)=>t('imports.field.'+field);
 const display=(field:string,value:unknown)=>value===null||value===undefined?'—':field==='category'?t('catalog.l1.'+value):field==='subcategory'?t('catalog.l2.'+value):field==='unit'&&['piece','packet','dozen','crate'].includes(String(value))?t('imports.unit.'+value):String(value);
 if(!allowed)return <Card><p>{t('imports.error.not_allowed')}</p></Card>;
 return <div className="shop-page import-page">
  <PageHeader title={t('imports.title')} description={t('imports.help')} back={{href:backHref,label:t('products.title')}}/>
  <nav className="import-steps" aria-label={t('imports.title')}>{['upload','map','review'].map((step,index)=><span key={step} aria-current={index===(w.phase==='upload'?0:w.phase==='mapping'?1:2)?'step':undefined}>{t('imports.step_'+step)}</span>)}</nav>
  {message?<div className="import-notice" role="alert"><p>{t(!w.error&&[404,503].includes((w.metadata.error as {status?:number})?.status??0)?'imports.error.unavailable':importErrorKey(message))}</p><Button tone="ghost" onClick={()=>{if(job)void w.open(job.id);else void w.metadata.refetch();}}>{t('imports.refresh')}</Button></div>:null}
  {w.metadata.isLoading?<Spinner label={t('imports.title')}/>:null}
  {w.phase==='upload'?<>
   <Card className="import-upload-card"><div className="import-upload-symbol" aria-hidden="true">↑</div><h2>{t('imports.choose_file')}</h2><p>{t('imports.file_limit')}</p>
    <input ref={input} type="file" accept=".xlsx,.csv" className="sr-only" aria-hidden="true" tabIndex={-1} disabled={busy||!available} onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/>
    <Button disabled={busy||!available} onClick={()=>input.current?.click()}>{t('imports.choose_file')}</Button>
    {sampleFile?<Button tone="ghost" disabled={busy||!available} onClick={()=>void w.upload(sampleFile)}>{t('imports.load_sample')}</Button>:null}
    <div className="import-template-actions">{(['xlsx','csv'] as const).map(format=><Button key={format} tone="ghost" disabled={busy||!available} onClick={()=>void w.run(async guard=>{const file=await api.template(shopId,format,language);guard();download(file);})}>{t('imports.download_template')} · {format.toUpperCase()}</Button>)}</div>
    <p className="shop-hint">{t('imports.template_help')}</p>
   </Card>
   <Card><h2 className="shop-section-title">{t('imports.history')}</h2>{w.metadata.data?.jobs.length?w.metadata.data.jobs.map(j=><button key={j.id} className="shop-list-row w-full" aria-label={j.filename+' · '+t('imports.state.'+j.state)+' · '+t('imports.progress',{done:j.applied,total:j.total})} disabled={busy} onClick={()=>void w.open(j.id)}><span className="shop-list-main"><span className="shop-list-title">{j.filename}</span><span className="shop-list-meta">{t('imports.state.'+j.state)}</span></span><span>{j.applied}/{j.total}</span></button>):<p className="shop-hint">{t('imports.no_history')}</p>}</Card>
  </>:null}
  {job&&options&&w.phase==='mapping'?<Card>
   <h2 className="shop-section-title">{job.filename}</h2><p className="shop-hint">{t('imports.mapping_help')}</p>
   <div className="import-form-grid">
    <Field label={t('imports.sheet')}><select className="shop-field" disabled={busy||job.applied>0} value={options.sheet} onChange={e=>{const sheet=Number(e.target.value);w.setOptions({...options,sheet,mapping:inferImportMapping(job.sheets[sheet].headers),skipRows:[]});}}>{job.sheets.map((s,i)=><option key={i} value={i}>{s.name} ({s.rows.length})</option>)}</select></Field>
    <Field label={t('imports.review')}><select className="shop-field" disabled={busy||job.applied>0} value={options.mode} onChange={e=>w.setOptions({...options,mode:e.target.value as 'create'|'update'})}><option value="create">{t('imports.mode_create')}</option><option value="update">{t('imports.mode_update')}</option></select></Field>
    <Field label={fieldLabel('category')}><select className="shop-field" disabled={busy||job.applied>0} value={options.category} onChange={e=>w.setOptions({...options,category:e.target.value,subcategory:categories.find(c=>c.code===e.target.value)?.children[0]?.code??''})}>{categories.map(c=><option key={c.code} value={c.code}>{t('catalog.l1.'+c.code)}</option>)}</select></Field>
    <Field label={fieldLabel('subcategory')}><select className="shop-field" disabled={busy||job.applied>0} value={options.subcategory} onChange={e=>w.setOptions({...options,subcategory:e.target.value})}>{categories.find(c=>c.code===options.category)?.children.map(c=><option key={c.code} value={c.code}>{t('catalog.l2.'+c.code)}</option>)}</select></Field>
    <Field label={t('imports.as_of')}><input className="shop-field" type="date" value={options.asOf} disabled={busy||job.applied>0} onChange={e=>w.setOptions({...options,asOf:e.target.value})}/></Field>
   </div>
   <div className="import-mapping">{IMPORT_FIELDS.map(field=><Field key={field} label={fieldLabel(field)} hint={options.mapping[field]!==undefined?job.sheets[options.sheet].rows[0]?.cells[options.mapping[field]!]:undefined}><select className="shop-field" value={options.mapping[field]??''} disabled={busy||job.applied>0} onChange={e=>{const mapping={...options.mapping};if(e.target.value==='')delete mapping[field];else mapping[field]=Number(e.target.value);w.setOptions({...options,mapping});}}><option value="">{t('imports.ignore')}</option>{job.sheets[options.sheet].headers.map((header,i)=><option key={i} value={i}>{header}</option>)}</select></Field>)}</div>
   <p className="import-notice">{t('imports.stock_help')}</p><div className="import-bottom-actions"><Button tone="ghost" disabled={busy} onClick={w.reset}>{t('imports.start_over')}</Button><Button disabled={busy||options.mapping.name===undefined} onClick={()=>{setConfirmed(false);void w.review();}}>{t('imports.review')}</Button></div>
  </Card>:null}
  {job&&options&&w.phase==='review'?<>
   <Card><h2 className="shop-section-title">{job.state==='applied'?t('imports.done'):t('imports.step_review')}</h2><p>{t('imports.summary',counts)}</p><p className="shop-hint">{t('imports.progress',{done:job.applied,total:job.total})}</p>{job.state!=='applied'?<p className="shop-hint">{t('imports.review_help')}</p>:null}
    <div className="import-template-actions"><Button tone="ghost" disabled={busy} onClick={()=>void w.run(async guard=>{const file=await api.issues(shopId,job.id,language);guard();download(file);})}>{t('imports.download_issues')}</Button>{job.state!=='applied'?<Button tone="ghost" disabled={busy} onClick={()=>{setConfirmed(false);void w.review();}}>{t('imports.refresh')}</Button>:null}</div>
   </Card>
   <div className="import-review-list">{job.rows.slice(0,limit).map(row=><Card key={row.row} className={row.action==='skip'?'import-skipped':''}>
    <div className="import-row-head"><h3>{t('imports.row')} {row.row} · {row.name||'—'}</h3><span className="import-row-status">{row.outcome?t('imports.done'):row.action==='skip'?t('imports.skip'):row.issues.length?t('imports.issues'):t(row.action==='create'?'imports.mode_create':'imports.mode_update')}</span></div>
    {row.product?<dl className="import-values">{IMPORT_FIELDS.filter(f=>row.action==='update'?row.changes?.[f]!==undefined:row.product?.[f]!==undefined).map(f=><div key={f}><dt>{fieldLabel(f)}</dt><dd>{row.action==='update'?display(f,row.before?.[f])+' → ':''}{display(f,(row.action==='update'?row.changes:row.product)?.[f])}</dd></div>)}</dl>:null}
    {row.issues.map((issue,i)=><p className="import-row-error" key={'e'+i}>{issue.field?fieldLabel(issue.field)+': ':''}{t('imports.issue.'+issue.code)}</p>)}
    {row.warnings.map((issue,i)=><p className="shop-hint" key={'w'+i}>{t('imports.issue.'+issue.code)}</p>)}
    {!row.outcome&&job.state!=='applied'?<Button tone="quiet" disabled={busy} onClick={()=>{setConfirmed(false);void w.review({...options,skipRows:row.action==='skip'?options.skipRows.filter(n=>n!==row.row):[...options.skipRows,row.row]});}}>{t(row.action==='skip'?'imports.include':'imports.skip')}</Button>:null}
   </Card>)}</div>
   {limit<job.rows.length?<Button tone="ghost" onClick={()=>setLimit(n=>n+50)}>{t('imports.more')}</Button>:null}
   <Card className="import-sticky-actions">{job.state==='applied'?<div className="import-bottom-actions"><Button tone="ghost" onClick={w.reset}>{t('imports.start_over')}</Button><Button href={backHref}>{t('products.title')}</Button></div>:<>
    <label className="import-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/><span>{t('imports.confirm')}</span></label>
    <div className="import-bottom-actions"><Button tone="ghost" disabled={busy} onClick={()=>w.setPhase('mapping')}>{t('imports.back')}</Button><Button disabled={busy||!confirmed||counts.errors>0||job.total<=job.applied} onClick={()=>void w.commit()}>{busy?t('imports.progress',{done:job.applied,total:job.total}):t('imports.save')}</Button></div>
   </>}</Card>
  </>:null}
 </div>;
}

export function InventoryImportScreen(){const {api,shop,userId,perms,t,prefs}=useShop();if(!shop)return <Spinner label={t('imports.title','Import products')}/>;return <InventoryImportPanel api={api.imports} shopId={shop.id} actorId={userId??''} language={prefs?.appLanguage??'en'} allowed={perms.canEditProducts} t={(key,vars)=>t(key,key,vars)}/>;}
