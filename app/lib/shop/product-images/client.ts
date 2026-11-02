import type {ProductGallery,GalleryInput,ProductMedia,ImageReference} from './contract';
type Send=<T>(path:string,init?:RequestInit)=>Promise<T>;
const base=(shop:string)=>`/api/shops/${encodeURIComponent(shop)}/product-images`;
export function bindProductImages(send:Send){
 const json=<T>(path:string,method:string,body:unknown)=>send<T>(path,{method,body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
 return {
  capabilities:(shop:string)=>send<{available:boolean;canEdit:boolean;limits:{count:number;inputBytes:number;stageHours:number}}>(base(shop)),
  draft:(shop:string,clientId:string)=>json<{id:string;expiresAt:string}>(base(shop)+'/drafts','POST',{clientId}),
  gallery:(shop:string,product:string)=>send<ProductGallery>(base(shop)+'/products/'+encodeURIComponent(product)),
  save:(shop:string,product:string,input:GalleryInput)=>json<ProductGallery>(base(shop)+'/products/'+encodeURIComponent(product),'PUT',input),
  query:(shop:string,productIds:string[])=>json<{media:Record<string,ProductMedia>}>(base(shop)+'/query','POST',{productIds}),
  leases:(shop:string,imageIds:string[])=>json<{leases:Record<string,string>;expiresAt:string}>(base(shop)+'/leases','POST',{imageIds}),
  outcome:(shop:string,client:string)=>send<{state:string;image?:ImageReference;result?:Record<string,unknown>;error?:string}>(base(shop)+'/requests/'+encodeURIComponent(client)),
  upload:(shop:string,draft:string,client:string,bytes:BodyInit,signal?:AbortSignal)=>send<{state:string;image:ImageReference}>(base(shop)+`/drafts/${encodeURIComponent(draft)}/images/${encodeURIComponent(client)}`,{method:'PUT',body:bytes,headers:{'Content-Type':'application/octet-stream'},signal}),
 };
}
export const privateImagePath=(image:string,variant:string,lease?:string)=>`/media/private/${encodeURIComponent(image)}/${encodeURIComponent(variant)}`+(lease?`?lease=${encodeURIComponent(lease)}`:'');
export const publicImagePath=(store:string,listing:string,image:string,variant:string)=>`/media/public/${encodeURIComponent(store)}/${encodeURIComponent(listing)}/${encodeURIComponent(image)}/${encodeURIComponent(variant)}`;
