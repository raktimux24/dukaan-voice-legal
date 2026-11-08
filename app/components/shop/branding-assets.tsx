'use client';
import { useRef } from 'react';
import type { BrandingDraft } from '../../lib/shop/documents/contract';
import { useShop } from './context';
import { Button, Field, Glyph } from './ui';
export function BrandingAssets({draft,images,disabled,edit,upload}:{draft:BrandingDraft;images:Record<string,string>;disabled:boolean;edit:(v:Partial<BrandingDraft>)=>void;upload:(kind:'logo'|'signature',file?:File)=>void}) {
  const {t}=useShop();
  return <div className="branding-assets">{(['logo','signature'] as const).map(kind=><Asset key={kind} kind={kind} draft={draft} images={images} disabled={disabled} edit={edit} upload={upload}/>)}<p className="shop-hint">{t('brandweb.image_source','Choose an image from Photos or Files in your device’s picker. Uploads are added to your draft; save to use them on new bills.')}</p></div>;
}
function Asset({kind,draft,images,disabled,edit,upload}:{kind:'logo'|'signature';draft:BrandingDraft;images:Record<string,string>;disabled:boolean;edit:(v:Partial<BrandingDraft>)=>void;upload:(kind:'logo'|'signature',file?:File)=>void}) {
  const {t:translate}=useShop(), t=(key:string)=>translate(key,key), input=useRef<HTMLInputElement>(null);
  const id=kind==='logo'?draft.logoId:draft.signatureId;
  return <section className="branding-asset"><div className="branding-section-heading"><span>{kind==='logo'?'01':'02'}</span><h2>{t('documents.'+kind)}</h2></div>
    <div className="branding-asset-body"><div className={'branding-image-slot'+(id&&images[id]?' has-image':'')}>
      {id&&images[id]?<img src={images[id]} alt={t('documents.'+kind)} style={{objectFit:kind==='logo'?draft.logoFit:'contain'}}/>:<Glyph name={kind==='logo'?'store':'receipt'}/>}
    </div><div><div className="branding-actions"><Button tone="ghost" disabled={disabled} onClick={()=>input.current?.click()}>{t('documents.'+kind+(id?'_replace':'_upload'))}</Button>{id&&<Button tone="quiet" disabled={disabled} onClick={()=>edit(kind==='logo'?{logoId:null}:{signatureId:null,showSignature:false})}>{t('documents.'+kind+'_remove')}</Button>}</div>
      <input type="file" ref={input} hidden disabled={disabled} accept="image/png,image/jpeg" aria-label={t('documents.'+kind+'_upload')} onChange={e=>{upload(kind,e.target.files?.[0]);e.target.value='';}}/>
      <p className="shop-hint">{t('documents.image_help')}</p>
    </div></div>
    {kind==='logo'?<Field localized label={t('documents.logo_fit')}><select className="shop-field" disabled={disabled} value={draft.logoFit} onChange={e=>edit({logoFit:e.target.value as 'contain'|'cover'})}><option value="contain">{t('documents.contain')}</option><option value="cover">{t('documents.cover')}</option></select></Field>:<><label className="branding-toggle"><span>{t('documents.signature_enable')}</span><input type="checkbox" disabled={disabled||!id} checked={draft.showSignature} onChange={e=>edit({showSignature:e.target.checked})}/></label><p className="shop-hint">{t('documents.signature_help')}</p></>}
  </section>;
}
