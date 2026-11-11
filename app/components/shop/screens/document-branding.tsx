'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect,useRef,useState } from 'react';
import { useShop } from '../context';
import { useBranding } from '../../../lib/shop/documents/workflow';
import { documentErrorKey } from '../../../lib/shop/documents/client';
import { DOCUMENT_LAYOUTS,DOCUMENT_PAPER } from '../../../lib/shop/documents/contract';
import { brandingScope,validateBrandImage } from '../../../lib/shop/documents/editor';
import { SUPPORTED_LANGUAGES } from '../../../lib/shop/languages';
import { BrandingAssets } from '../branding-assets';
import { BrandingGuide } from '../branding-guide';
import { BrandingPreviewDialog } from '../branding-preview-dialog';
import { Button,Field,PageHeader,Spinner } from '../ui';
import { TabList } from '../settings-tabs';
export function DocumentBrandingScreen() {
  const {shop,userId,photoSessionId}=useShop();
  return <Editor key={brandingScope(shop?.id,userId,photoSessionId)}/>;
}
function Editor() {
  const {api,shop,userId,photoSessionId,perms,prefs,offline,t:translate}=useShop(),t=(key:string)=>translate(key,key);
  const scope=brandingScope(shop?.id,userId,photoSessionId);
  const w=useBranding(api.documents,scope,shop?.id??'',perms.canManageShop&&!offline,prefs?.appLanguage??'en',()=>crypto.randomUUID());
  const pos=useQuery({queryKey:['pos',shop?.id],queryFn:()=>api.getPosSettings(shop!.id),enabled:!!shop&&perms.canManageShop&&!offline,refetchOnMount:'always',retry:false});
  const [tab,setTab]=useState('format'),[count,setCount]=useState(20),[reading,setReading]=useState(false),[confirmReload,setConfirmReload]=useState(false);
  const alive=useRef(true),readingRef=useRef(false);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  const blocked=w.busy||!!w.pending||reading||offline||w.meta.isFetching||!!w.meta.error;
  const upload=async(kind:'logo'|'signature',file?:File)=>{
    if(!file||blocked||readingRef.current||!perms.canManageShop)return;
    readingRef.current=true;setReading(true);w.setError(null);
    try{
      validateBrandImage(file);
      const base64=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('document_image_invalid'));r.readAsDataURL(file);});
      if(alive.current)await w.upload(kind,base64);
    }catch(error){if(alive.current)w.setError(error);}finally{readingRef.current=false;if(alive.current)setReading(false);}
  };
  const reload=()=>{if(w.dirty||w.pending)setConfirmReload(true);else void w.reload();};
  return <div className="shop-page branding-workspace">
    <PageHeader kicker={translate('settings.title','Settings')} title={t('documents.title')} description={t('documents.help')} back={{href:'/shop/settings/payments?tab=bills',label:translate('pos_settings.title','Payments & bills')}} actions={perms.canManageShop?<Button tone="ghost" disabled={w.busy||reading||offline||w.meta.isFetching} onClick={reload}>{t('documents.reload')}</Button>:undefined}/>
    {offline?<p role="status" className="shop-hint">{t('documents.online_help')}</p>:!perms.canManageShop?<p className="shop-hint">{t('documents.not_owner')}</p>:w.meta.isPending?<Spinner/>:<>
      {(w.error||w.meta.error)&&<p role="alert" className="branding-error">{t(documentErrorKey(w.error??w.meta.error))}</p>}
      {!w.meta.data?<Button disabled={w.busy} onClick={()=>void w.reload()}>{t('common.retry')}</Button>:<>
        <div className="branding-status"><span className={'shop-pill'+(w.dirty?' shop-pill--saffron':'')}>{w.pending?t('documents.uncertain'):w.dirty?translate('brandweb.draft','Unsaved draft'):w.meta.data.current?translate('brandweb.saved','Saved for new bills'):translate('brandweb.new','Not saved yet')}</span><p>{t('documents.identity_help')}</p></div>
        {confirmReload&&<section className="branding-reload" aria-labelledby="branding-reload-title"><h2 id="branding-reload-title">{translate('brandweb.reload_title','Replace this draft with saved settings?')}</h2><p>{translate('brandweb.reload_help','Your unsaved edits will be replaced by the latest saved profile. This does not undo a save that already reached the server.')}</p><div className="branding-actions"><Button tone="ghost" onClick={()=>setConfirmReload(false)}>{translate('brandweb.keep','Keep editing')}</Button><Button disabled={w.busy||reading||offline} onClick={()=>{setConfirmReload(false);void w.reload();}}>{t('documents.reload')}</Button></div></section>}
        <div className="branding-workbench"><div className="branding-editor">
          <TabList className="branding-tabs" label={t('documents.title')} idPrefix="branding" value={tab} onChange={setTab} items={[['format',translate('brandweb.format','Format')],['assets',translate('brandweb.assets','Brand assets')],['content',translate('brandweb.content','Content')]]}/>
          <section hidden={tab!=='format'} className="branding-panel" role="tabpanel" id="branding-panel-format" aria-labelledby="branding-tab-format"><h2>{t('documents.layout')}</h2><div className="branding-layouts" role="group" aria-label={t('documents.layout')}>
            {DOCUMENT_LAYOUTS.map(layout=><button className={'branding-layout is-'+layout} key={layout} type="button" disabled={blocked} aria-pressed={w.draft.layout===layout} onClick={()=>w.edit({layout})}><span className="branding-format-art" aria-hidden="true"><span><i/><i/><i/></span></span><strong>{t('documents.'+layout)}</strong><small>{DOCUMENT_PAPER[layout].widthMm} × {DOCUMENT_PAPER[layout].heightMm} mm</small><span className="branding-choice-check" aria-hidden="true">{w.draft.layout===layout?'✓':''}</span></button>)}
          </div><Field localized label={t('documents.language')} hint={t('documents.language_help')}><select className="shop-field" disabled={blocked} value={w.draft.language} onChange={e=>w.edit({language:e.target.value})}>{SUPPORTED_LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select></Field></section>
          <div hidden={tab!=='assets'} className="branding-panel" role="tabpanel" id="branding-panel-assets" aria-labelledby="branding-tab-assets"><BrandingAssets draft={w.draft} images={w.images} disabled={blocked} edit={w.edit} upload={(kind,file)=>void upload(kind,file)}/></div>
          <section hidden={tab!=='content'} className="branding-panel" role="tabpanel" id="branding-panel-content" aria-labelledby="branding-tab-content"><h2>{t('documents.terms')}</h2><Field localized label={t('documents.terms')} hint={t('documents.terms_help')}><textarea className="shop-field" disabled={blocked} rows={6} maxLength={2000} value={w.draft.terms} onChange={e=>w.edit({terms:e.target.value})}/></Field><p className="branding-character-count">{w.draft.terms.length.toLocaleString()} / 2,000</p>
            <div className="branding-payment"><h2>{t('documents.payment_title')}</h2><label className="branding-toggle"><span>{t('documents.payment_toggle')}</span><input type="checkbox" disabled={blocked} checked={w.draft.showPayment} onChange={e=>w.edit({showPayment:e.target.checked})}/></label><p className="shop-hint">{t('documents.payment_help')}</p>
              {pos.error?<div role="alert"><p>{translate('brandweb.payment_error','Payment details could not be refreshed. Retry before enabling them on bills.')}</p><Button tone="ghost" disabled={pos.isFetching} onClick={()=>void pos.refetch()}>{t('common.retry')}</Button></div>:pos.isPending?<Spinner/>:<p className="branding-upi">{pos.data?.upiVpa??t('documents.payment_missing')}</p>}
              <Button tone="quiet" href="/shop/settings/payments">{t('documents.payment_settings')} →</Button><p className="shop-hint">{t('documents.payment_caption')}</p>
            </div>
          </section>
        </div><BrandingGuide draft={w.draft} images={w.images} count={count} setCount={setCount} disabled={blocked} preview={()=>void w.sample(count)}/></div>
        <div className={"branding-savebar"+(!w.dirty&&!w.pending?" is-clean":"")}><div aria-live="polite">{w.busy||reading?t('common.loading'):w.saved?t(w.saved):w.pending?t('documents.uncertain'):w.dirty?translate('brandweb.draft','Unsaved draft'):translate('brandweb.ready','Choose a format, then preview before saving.')}</div><Button disabled={w.busy||reading||offline||w.meta.isFetching||!!w.meta.error||(!w.dirty&&!w.pending&&!!w.meta.data.current)} onClick={()=>void w.save()}>{t(w.pending?'documents.check_result':'documents.save')}</Button></div>
        <p className="shop-hint">{t('documents.online_help')}</p>
        {w.preview&&<BrandingPreviewDialog preview={w.preview} close={()=>w.setPreview(null)}/>}
      </>}
    </>}
  </div>;
}
