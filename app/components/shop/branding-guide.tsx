'use client';
import type { BrandingDraft } from '../../lib/shop/documents/contract';
import { useShop } from './context';
import { Button, Field } from './ui';
export function BrandingGuide({draft,images,count,setCount,disabled,preview}:{draft:BrandingDraft;images:Record<string,string>;count:number;setCount:(n:number)=>void;disabled:boolean;preview:()=>void}) {
 const {t:translate,shop}=useShop(),t=(key:string)=>translate(key,key);
 return <aside className="branding-guide"><div className="branding-section-heading"><span>↗</span><h2>{t('documents.preview_title')}</h2></div>
   <div className="branding-paper-stage" aria-hidden="true"><div className={'branding-mini-paper is-'+draft.layout}>
    {draft.logoId&&images[draft.logoId]?<img className="branding-mini-logo" src={images[draft.logoId]} alt="" style={{objectFit:draft.logoFit}}/>:<b>{shop?.name}</b>}
    <div className="branding-mini-rule"/><div className="branding-mini-lines"><i/><i/><i/><i/></div><div className="branding-mini-total"/>
    {draft.terms&&<div className="branding-mini-terms"/>}{draft.showPayment&&<div className="branding-mini-payment"/>}
    {draft.showSignature&&draft.signatureId&&images[draft.signatureId]&&<img className="branding-mini-signature" src={images[draft.signatureId]} alt=""/>}
   </div></div>
   <p className="shop-hint">{translate('brandweb.guide','Layout guide only. Open a sample to check the actual document and page breaks.')}</p>
   <Field localized label={t('documents.sample_size')}><select className="shop-field" disabled={disabled} value={count} onChange={e=>setCount(Number(e.target.value))}>{[1,20,100].map(n=><option key={n} value={n}>{t('documents.sample_'+n)}</option>)}</select></Field>
   <Button disabled={disabled} onClick={preview}>{t('documents.preview')} ↗</Button>
   <p className="shop-hint">{t('documents.unsaved')}</p>
 </aside>;
}
