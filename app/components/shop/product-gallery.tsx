'use client';
import {useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useShop} from './context';
import {ProductImage} from './product-image';
import {Button} from './ui';
import type {ProductMedia} from '../../lib/shop/product-images/contract';
import {productPhotoDialogFocus} from '../../lib/product-photo-dialog-focus';

export function ProductGallery({productId,name,media}:{productId:string;name:string;media?:ProductMedia|null}){
 const {api,shop,userId,t}=useShop(),[selected,setSelected]=useState(0),dialog=useRef<HTMLDialogElement>(null);
 const gallery=useQuery({queryKey:['productImages',userId,shop?.id,productId,media?.version],enabled:!!shop&&!!media?.count,queryFn:()=>api.productImages.gallery(shop!.id,productId)});
 const photos=gallery.data?.images??(media?.cover?[media.cover]:[]),index=Math.min(selected,Math.max(0,photos.length-1)),photo=photos[index];
 if(!photo)return null;
 const choices=<div style={{display:'flex',gap:8,overflowX:'auto',padding:8}}>{photos.map((image,i)=><button key={image.id} type="button" aria-label={`${image.alt||name} ${i+1}/${photos.length}`} aria-pressed={i===index} onClick={()=>setSelected(i)} style={{border:'2px solid '+(index===i?'#FF6B00':'transparent'),borderRadius:12,padding:3}}><ProductImage image={image} name={name} size={52}/></button>)}</div>;
 return <section aria-label={t('product_images.title','Product photos')} style={{display:'grid',justifyItems:'center',gap:8,marginBottom:20}}>
  <button type="button" aria-label={photo.alt||name} onClick={()=>dialog.current?.showModal()}><ProductImage image={photo} name={name} size={240} variant="card" decorative={false}/></button>
  {photos.length>1?choices:null}
  <dialog ref={dialog} className="product-photo-dialog" aria-label={name} onKeyDown={productPhotoDialogFocus} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}} style={{background:'#101014',color:'#FAFAF9',border:'1px solid #555560',borderRadius:16,padding:20,margin:'auto',maxWidth:'calc(100vw - 24px)',maxHeight:'calc(100dvh - 24px)'}}>
   <div style={{display:'grid',justifyItems:'center',gap:12}}><Button tone="ghost" onClick={()=>dialog.current?.close()}>{t('common.close','Close')}</Button><h2>{name}</h2><ProductImage image={photo} name={name} size={Math.min(560,typeof window==='undefined'?300:Math.min(window.innerWidth-96,window.innerHeight-230))} variant="detail" decorative={false}/>{choices}</div>
  </dialog>
 </section>;
}
