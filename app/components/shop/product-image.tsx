'use client';
import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useShop} from './context';
import type {ShopApi} from '../../lib/shop/api';
import type {InventoryItem} from '../../lib/shop/types';
import type {ProductMedia} from '../../lib/shop/product-images/contract';
import {imageUuid,type ImageReference,type ImageVariant} from '../../lib/shop/product-images/contract';
import {createProductMediaBatcher} from '../../lib/shop/product-images/media-batcher';
import {createImageLeaseBatcher} from '../../lib/shop/product-images/lease-batcher';
import {privateImagePath} from '../../lib/shop/product-images/client';
import {readOfflineThumbnail,loadOnlineThumbnail,evictThumbnail} from '../../lib/shop/product-images/thumbnail-storage.web';
import {permitsOfflineShopFallback} from '../../lib/shop/offline-shop-context';
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
 const {api,shop,userId,photoSessionId,offline,t}=useShop(),[attempt,setAttempt]=useState(0),ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false),[result,setResult]=useState<{api:ShopApi;key:string;uri:string}|null>(null),[failed,setFailed]=useState(''),[loaded,setLoaded]=useState('');
 const key=`${userId}/${photoSessionId}/${shop?.id}/${image?.id}/${image?.version}/${variant}/${attempt}`;
 useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'128px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{let live=true,timer:ReturnType<typeof setTimeout>|undefined,controller:AbortController|undefined,objectUrl:string|undefined,serial=0;if(!visible||!image||!shop)return;
  const owner=userId&&photoSessionId?{actor:userId,session:photoSessionId,shop:shop.id}:null;
  const current=()=>{try{api.assertSession();return live;}catch{return false;}};
  const load=async()=>{
   const sequence=++serial;clearTimeout(timer);controller?.abort();const active=()=>current()&&serial===sequence;
   try{
    if(variant==='thumb'&&owner&&(offline||navigator.onLine===false)){
     const blob=await readOfflineThumbnail(owner,image,active);if(active()){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=blob?URL.createObjectURL(blob):undefined;setResult(objectUrl?{api,key,uri:objectUrl}:null);}return;
    }
    const token=await lease(api,shop.id,image.id);if(!active())return;let uri=base+privateImagePath(image.id,variant,token);
    if(variant==='thumb'&&owner){
     const requestController=new AbortController();controller=requestController;const deadline=setTimeout(()=>requestController.abort(),15_000);
     let blob:Blob|null;try{blob=await loadOnlineThumbnail(owner,image,base+privateImagePath(image.id,variant),token,active,requestController.signal);}finally{clearTimeout(deadline);}
     if(!active())return;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=blob?URL.createObjectURL(blob):undefined;if(!objectUrl){setResult(null);return;}uri=objectUrl;
    }
    if(active()){setResult({api,key,uri});timer=setTimeout(()=>void load(),270_000);}
   }catch(error){
    if(owner&&([401,403,404,410].includes((error as {status?:number}).status??0)||(error as Error).message==='product_image_not_found'))void evictThumbnail(owner,image).catch(()=>{});
    if(owner&&variant==='thumb'&&permitsOfflineShopFallback(error))try{const blob=await readOfflineThumbnail(owner,image,active);if(active()&&blob){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(blob);setResult({api,key,uri:objectUrl});return;}}catch{}
    if(active()){setResult(null);setFailed(key);}
   }
  };
  const reconnect=()=>void load();window.addEventListener('online',reconnect);window.addEventListener('offline',reconnect);void load();return()=>{live=false;controller?.abort();clearTimeout(timer);if(objectUrl)URL.revokeObjectURL(objectUrl);window.removeEventListener('online',reconnect);window.removeEventListener('offline',reconnect);};
 },[api,key,visible,offline]);
 const uri=result?.api===api&&result.key===key?result.uri:null,displayKey=key+'/'+(uri??''),detail=variant==='detail'&&!decorative;
 const loadFailed=failed===(uri?displayKey:key);
 const frame=<span ref={ref} role={decorative?undefined:'img'} aria-label={decorative?undefined:image?.alt||name} aria-hidden={decorative||undefined} style={{width:size,height:size,minWidth:size,flexShrink:0,display:'inline-flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',borderRadius:Math.min(12,size/6),background:'#25252D',color:'#FF9A50',fontSize:Math.min(size*.38,44),fontWeight:600}}>
  {!uri||loadFailed||loaded!==displayKey?(name.trim().charAt(0).toLocaleUpperCase()||'·'):null}
  {uri&&!loadFailed?<img key={displayKey} src={uri} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={()=>setLoaded(displayKey)} onError={()=>setFailed(displayKey)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>:null}
 </span>;
 return detail?<div style={{display:'grid',justifyItems:'center',gap:12}}>{frame}{image&&(loadFailed||loaded!==displayKey)?<div role={loadFailed?'alert':'status'} style={{textAlign:'center',fontSize:14,maxWidth:360}}><p>{t(loadFailed?'product_images.load_failed':'product_images.loading',loadFailed?'The photo could not be loaded. Try again.':'Loading photos…')}</p>{loadFailed?<button type="button" onClick={event=>{event.currentTarget.closest('dialog')?.querySelector<HTMLButtonElement>('button')?.focus();setAttempt(n=>n+1);}} style={{minHeight:48,minWidth:48,padding:'10px 16px',marginTop:8,border:'1px solid #555560',borderRadius:8}}>{t('product_images.retry','Retry')}</button>:null}</div>:null}</div>:frame;
}

export function ProductImageById({productId,...props}:{productId?:string|null;name:string;size?:number;decorative?:boolean}){
 const {api,shop,userId,photoSessionId,offline}=useShop(),client=useQueryClient(),query=useQuery({queryKey:['productMedia',userId,shop?.id,productId],enabled:!!shop&&!offline&&imageUuid(productId),queryFn:()=>mediaById(api,shop!.id,productId!),staleTime:30_000,gcTime:300_000,retry:false});
 const saved=useQuery({queryKey:['offlineProductMedia',userId,photoSessionId,shop?.id],enabled:!!shop&&offline,networkMode:'always',queryFn:()=>api.getCachedProductMedia(shop!.id),staleTime:30_000,retry:false});
 // Cart requests retain identity and prices, never photo metadata. After a full
 // offline reopen, use the validated catalogue in this actor/session's client.
 // Subscribe because that catalogue can finish restoring after the cart mounts.
 const cached=useSyncExternalStore(useCallback(notify=>{
  if(!offline||!shop)return()=>{};
  return client.getQueryCache().subscribe(event=>{if(event.query.queryKey[0]==='catalog'&&event.query.queryKey[1]===shop.id)notify();});
 },[client,offline,shop?.id]),useCallback(()=>{
  if(!offline||!shop||!imageUuid(productId))return null;
  let latest:ProductMedia|null=null;
  for(const [,rows]of client.getQueriesData<InventoryItem[]>({queryKey:['catalog',shop.id]})){
   if(!Array.isArray(rows))continue;
   const item=rows.find(row=>row?.shopId===shop.id&&row.productId===productId&&row.product?.id===productId&&row.product.shopId===shop.id);
   const media=item?.product.media;
   if(media&&(!latest||media.version>latest.version))latest=media;
  }
  return latest;
 },[client,offline,shop?.id,productId]),()=>null);
 let media=query.data;
 if(offline)for(const candidate of [productId?saved.data?.[productId]:null,cached])if(candidate&&(!media||candidate.version>=media.version))media=candidate;
 return <ProductImage {...props} image={media?.cover}/>;
}
