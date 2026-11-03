import type {Metadata} from 'next';
import {imageUuid} from './shop/product-images/contract';
import {publicImagePath} from './shop/product-images/client';
const clean=(value:unknown,max:number)=>typeof value==='string'?value.replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,max):'';
/** Always re-check the anonymous visibility endpoint. Never use merchant/private DTOs or a cached gallery. */
export async function storeMetadata(storeId:string,itemId?:string):Promise<Metadata>{
 const fallback:Metadata={title:{absolute:'Samaan Bol store'},description:'Browse products from this shop.',robots:{index:false,follow:false},openGraph:{images:[]},twitter:{images:[]}};
 if(!imageUuid(storeId)||itemId!==undefined&&!imageUuid(itemId))return fallback;
 const api=process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,''),site=process.env.NEXT_PUBLIC_SITE_URL||'https://samaanbol.space';
 if(!api)return fallback;
 try{
  const response=await fetch(`${api}/api/storefront/${storeId}${itemId?'/products/'+itemId:''}`,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok)return fallback;
  const data=await response.json(),store=itemId?data.store:data,item=itemId?data.item:undefined;
  if(store?.id!==storeId||!clean(store?.config?.name,100)||itemId&&(!item||item.id!==itemId||item.visible!==true||item.supported!==true))return fallback;
  const name=clean(store.config.name,100),product=clean(item?.name,140),title=product?`${product} · ${name}`:name;
  const description=clean(item?.description,240)||`Browse products from ${name}.`,path=`/store/${storeId}${itemId?'/p/'+itemId:''}`,url=new URL(path,site).href;
  const image=item?.media?.cover,images=imageUuid(image?.id)?[{url:new URL(publicImagePath(storeId,itemId!,image.id,'detail'),api).href,alt:clean(image.alt,240)||product}]:[];
  return {title:{absolute:title},description,alternates:{canonical:url},robots:{index:true,follow:true},openGraph:{type:'website',title,description,url,images},twitter:{card:images.length?'summary_large_image':'summary',title,description,images:images.map(i=>i.url)}};
 }catch{return fallback;}
}
