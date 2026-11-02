'use client';
import {useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useShop} from './context';
import type {ShopApi} from '../../lib/shop/api';
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
 const {api,shop,userId,photoSessionId,offline}=useShop(),ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false),[result,setResult]=useState<{api:ShopApi;key:string;uri:string}|null>(null),[failed,setFailed]=useState(''),[loaded,setLoaded]=useState('');
 const key=`${userId}/${photoSessionId}/${shop?.id}/${image?.id}/${image?.version}/${variant}`;
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
    if(active())setResult(null);
   }
  };
  const reconnect=()=>void load();window.addEventListener('online',reconnect);window.addEventListener('offline',reconnect);void load();return()=>{live=false;controller?.abort();clearTimeout(timer);if(objectUrl)URL.revokeObjectURL(objectUrl);window.removeEventListener('online',reconnect);window.removeEventListener('offline',reconnect);};
 },[api,key,visible,offline]);
 const uri=result?.api===api&&result.key===key?result.uri:null;
 return <span ref={ref} role={decorative?undefined:'img'} aria-label={decorative?undefined:image?.alt||name} aria-hidden={decorative||undefined} style={{width:size,height:size,minWidth:size,flexShrink:0,display:'inline-flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',borderRadius:Math.min(12,size/6),background:'#25252D',color:'#FF9A50',fontSize:Math.min(size*.38,44),fontWeight:600}}>
  {!uri||failed===uri||loaded!==uri?(name.trim().charAt(0).toLocaleUpperCase()||'·'):null}
  {uri&&failed!==uri?<img src={uri} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={()=>setLoaded(uri)} onError={()=>setFailed(uri)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>:null}
 </span>;
}

export function ProductImageById({productId,...props}:{productId?:string|null;name:string;size?:number;decorative?:boolean}){
 const {api,shop,userId,offline}=useShop(),query=useQuery({queryKey:['productMedia',userId,shop?.id,productId],enabled:!!shop&&!offline&&imageUuid(productId),queryFn:()=>mediaById(api,shop!.id,productId!),staleTime:30_000,gcTime:300_000,retry:false});
 return <ProductImage {...props} image={query.data?.cover}/>;
}
