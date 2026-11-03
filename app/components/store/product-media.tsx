'use client';
import {productPhotoDialogFocus} from '../../lib/product-photo-dialog-focus';
import {useRef,useState} from 'react';
import type {ImageReference,ProductMedia} from '../../lib/shop/product-images/contract';
import {publicImagePath} from '../../lib/shop/product-images/client';
type PhotoLabels={loading:string;failed:string;retry:string};
const defaultPhotoLabels:PhotoLabels={loading:"Loading photos…",failed:"The photo could not be loaded. Try again.",retry:"Retry"};
const base=process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,'')??'';
export function PublicProductImage({store,listing,name,image,compact=false,detail=false,labels=defaultPhotoLabels}:{store:string;listing:string;name:string;image?:ImageReference|null;compact?:boolean;detail?:boolean;labels?:PhotoLabels}){
 const [attempt,setAttempt]=useState(0),[failed,setFailed]=useState(''),[loaded,setLoaded]=useState(''),key=`${store}/${listing}/${image?.id}/${image?.version}/${compact?"thumb":detail?"detail":"card"}/${attempt}`,uri=image?base+publicImagePath(store,listing,image.id,compact?'thumb':detail?'detail':'card'):'';
 const frame=<span className={'store-photo'+(compact?' is-compact':'')} aria-hidden="true">
  {!uri||failed===key||loaded!==key?<span>{name.trim().charAt(0).toLocaleUpperCase()||'·'}</span>:null}
  {uri&&failed!==key?<img key={key} src={uri} alt="" width={compact?48:detail?1280:640} height={compact?48:detail?1280:640} loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={()=>setLoaded(key)} onError={()=>setFailed(key)}/>:null}
 </span>;
 return detail?<div style={{display:'grid',justifyItems:'center',gap:12,width:'100%'}}>{frame}{image&&(failed===key||loaded!==key)?<div role={failed===key?'alert':'status'} style={{textAlign:'center',fontSize:14,maxWidth:360}}><p>{failed===key?labels.failed:labels.loading}</p>{failed===key?<button type="button" className="store-button" onClick={event=>{event.currentTarget.closest('dialog')?.querySelector<HTMLButtonElement>('button')?.focus();setAttempt(n=>n+1);}} style={{minHeight:48,minWidth:48}}>{labels.retry}</button>:null}</div>:null}</div>:frame;
}
export function PublicProductGallery({store,listing,name,media,images,closeLabel,photoLabels}:{store:string;listing:string;name:string;media?:ProductMedia|null;images?:ImageReference[];closeLabel:string;photoLabels?:PhotoLabels}){
 const [selected,setSelected]=useState(0),dialog=useRef<HTMLDialogElement>(null),photos=images?.length?images:media?.cover?[media.cover]:[],index=Math.min(selected,Math.max(0,photos.length-1)),photo=photos[index];
 const choices=<div className="store-photo-choices">{photos.map((image,i)=><button key={image.id} type="button" aria-label={`${image.alt||name} ${i+1}/${photos.length}`} aria-pressed={i===index} onClick={()=>setSelected(i)}><PublicProductImage store={store} listing={listing} image={image} name={name} compact/></button>)}</div>;
 return <div className="store-gallery">
  <button type="button" aria-label={photo?.alt||name} disabled={!photo} onClick={()=>dialog.current?.showModal()}><PublicProductImage store={store} listing={listing} image={photo} name={name}/></button>
  {photos.length>1?choices:null}
  <dialog ref={dialog} className="store-photo-dialog" aria-label={photo?.alt||name} onKeyDown={productPhotoDialogFocus} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button type="button" className="store-button" onClick={()=>dialog.current?.close()}>{closeLabel}</button><h2>{name}</h2><PublicProductImage store={store} listing={listing} name={name} image={photo} detail labels={photoLabels}/>{choices}</dialog>
 </div>;
}
