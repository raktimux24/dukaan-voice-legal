'use client';
import {useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useShop} from './context';
import type {ShopApi} from '../../lib/shop/api';
import {imageUuid,type ImageReference,type ImageVariant} from '../../lib/shop/product-images/contract';
import {createProductMediaBatcher} from '../../lib/shop/product-images/media-batcher';
import {createImageLeaseBatcher} from '../../lib/shop/product-images/lease-batcher';
import {privateImagePath} from '../../lib/shop/product-images/client';
const base=process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,'')??'';
const batches=new WeakMap<ShopApi,Map<string,ReturnType<typeof createImageLeaseBatcher>>>();
const mediaBatches=new WeakMap<ShopApi,Map<string,ReturnType<typeof createProductMediaBatcher>>>();
function mediaById(api:ShopApi,shop:string,id:string){
 let shops=mediaBatches.get(api);if(!shops){shops=new Map();mediaBatches.set(api,shops);}
 let batch=shops.get(shop);if(!batch){batch=createProductMediaBatcher(ids=>api.productImages.query(shop,ids),()=>{try{api.assertSession();return true;}catch{return false;}});shops.set(shop,batch);}return batch.load(id);
}
function lease(api:ShopApi,shop:string,id:string){
 let shops=batches.get(api);if(!shops){shops=new Map();batches.set(api,shops);}
 let batch=shops.get(shop);if(!batch){batch=createImageLeaseBatcher(ids=>api.productImages.leases(shop,ids),()=>{try{api.assertSession();return true;}catch{return false;}});shops.set(shop,batch);}return batch.load(id);
}
export function ProductImage({image,name,size=48,variant='thumb',decorative=true}:{image?:ImageReference|null;name:string;size?:number;variant?:ImageVariant;decorative?:boolean}){
 const {api,shop,userId}=useShop(),ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false),[result,setResult]=useState<{api:ShopApi;key:string;uri:string}|null>(null),[failed,setFailed]=useState('');
 const key=`${userId}/${shop?.id}/${image?.id}/${image?.version}/${variant}`;
 useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'128px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{let live=true,timer:ReturnType<typeof setTimeout>|undefined;if(!visible||!image||!shop)return;
  const load=async()=>{try{const token=await lease(api,shop.id,image.id);if(live){setResult({api,key,uri:base+privateImagePath(image.id,variant,token)});timer=setTimeout(()=>void load(),270_000);}}catch{if(live)setResult(null);}};void load();return()=>{live=false;clearTimeout(timer);};
 },[api,key,visible]);
 const uri=result?.api===api&&result.key===key?result.uri:null;
 return <span ref={ref} role={decorative?undefined:'img'} aria-label={decorative?undefined:image?.alt||name} aria-hidden={decorative||undefined} style={{width:size,height:size,minWidth:size,flexShrink:0,display:'inline-flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',borderRadius:Math.min(12,size/6),background:'#25252D',color:'#FF9A50',fontSize:Math.min(size*.38,44),fontWeight:600}}>
  {name.trim().charAt(0).toLocaleUpperCase()||'·'}
  {uri&&failed!==uri?<img src={uri} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(uri)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>:null}
 </span>;
}

export function ProductImageById({productId,...props}:{productId?:string|null;name:string;size?:number;decorative?:boolean}){
 const {api,shop,userId,offline}=useShop(),query=useQuery({queryKey:['productMedia',userId,shop?.id,productId],enabled:!!shop&&!offline&&imageUuid(productId),queryFn:()=>mediaById(api,shop!.id,productId!),staleTime:30_000,gcTime:300_000,retry:false});
 return <ProductImage {...props} image={query.data?.cover}/>;
}
