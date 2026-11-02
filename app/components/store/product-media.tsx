'use client';
import {useRef,useState} from 'react';
import type {ImageReference,ProductMedia} from '../../lib/shop/product-images/contract';
import {publicImagePath} from '../../lib/shop/product-images/client';
const base=process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,'')??'';
export function PublicProductImage({store,listing,name,image,compact=false,detail=false}:{store:string;listing:string;name:string;image?:ImageReference|null;compact?:boolean;detail?:boolean}){
 const [failed,setFailed]=useState(''),key=`${store}/${listing}/${image?.id}/${image?.version}`,uri=image?base+publicImagePath(store,listing,image.id,compact?'thumb':detail?'detail':'card'):'';
 return <span className={'store-photo'+(compact?' is-compact':'')} aria-hidden="true">
  <span>{name.trim().charAt(0).toLocaleUpperCase()||'·'}</span>
  {uri&&failed!==key?<img src={uri} alt="" width={compact?48:detail?1280:640} height={compact?48:detail?1280:640} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(key)}/>:null}
 </span>;
}
export function PublicProductGallery({store,listing,name,media,images,closeLabel}:{store:string;listing:string;name:string;media?:ProductMedia|null;images?:ImageReference[];closeLabel:string}){
 const [selected,setSelected]=useState(0),dialog=useRef<HTMLDialogElement>(null),photos=images?.length?images:media?.cover?[media.cover]:[],index=Math.min(selected,Math.max(0,photos.length-1)),photo=photos[index];
 const choices=<div className="store-photo-choices">{photos.map((image,i)=><button key={image.id} type="button" aria-label={`${image.alt||name} ${i+1}/${photos.length}`} aria-pressed={i===index} onClick={()=>setSelected(i)}><PublicProductImage store={store} listing={listing} image={image} name={name} compact/></button>)}</div>;
 return <div className="store-gallery">
  <button type="button" aria-label={photo?.alt||name} disabled={!photo} onClick={()=>dialog.current?.showModal()}><PublicProductImage store={store} listing={listing} image={photo} name={name}/></button>
  {photos.length>1?choices:null}
  <dialog ref={dialog} className="store-photo-dialog" aria-label={photo?.alt||name} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button type="button" className="store-button" onClick={()=>dialog.current?.close()}>{closeLabel}</button><h2>{name}</h2><PublicProductImage store={store} listing={listing} name={name} image={photo} detail/>{choices}</dialog>
 </div>;
}
