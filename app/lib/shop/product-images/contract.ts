/** Product media is presentation data. Never include it in fiscal request hashes. */
export const IMAGE_VARIANTS = {thumb:{edge:160,maxBytes:25*1024},card:{edge:640,maxBytes:100*1024},detail:{edge:1280,maxBytes:250*1024}} as const;
export type ImageVariant = keyof typeof IMAGE_VARIANTS;
export const IMAGE_LIMITS = {count:5,inputBytes:8*1024*1024,inputPixels:24_000_000,minEdge:64,stageHours:24,shopBytes:1024*1024*1024,maxDrafts:20} as const;
export type ImageReference = {id:string;version:string;width:number;height:number;alt:string};
export type ProductMedia = {cover:ImageReference|null;count:number;version:number};
export type ProductGallery = ProductMedia & {images:ImageReference[]};
export type GalleryInput = {clientId:string;expectedVersion:number;draftId?:string;images:{id:string;alt:string}[]};
export type StoredVariant = {key:string;bytes:number;width:number;height:number;hash:string};
export type StoredVariants = Record<ImageVariant,StoredVariant>;
export class ProductImageError extends Error {
 constructor(public code:string,public status=400){super('product_image_'+code);}
}
export const imageUuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export const emptyProductMedia=():ProductMedia=>({cover:null,count:0,version:0});
export function galleryInput(v:unknown):GalleryInput{
 const p=v as GalleryInput;
 if(!p||typeof p!=='object'||Object.keys(p).some(k=>!['clientId','expectedVersion','draftId','images'].includes(k))||!imageUuid(p.clientId)||!Number.isSafeInteger(p.expectedVersion)||p.expectedVersion<0||(p.draftId!==undefined&&!imageUuid(p.draftId))||!Array.isArray(p.images)||p.images.length>IMAGE_LIMITS.count)throw new ProductImageError('invalid');
 if(new Set(p.images.map(i=>i?.id)).size!==p.images.length)throw new ProductImageError('invalid');
 for(const i of p.images)if(!i||Object.keys(i).some(k=>!['id','alt'].includes(k))||!imageUuid(i.id)||typeof i.alt!=='string'||i.alt.length>240||/[\x00-\x1f]/.test(i.alt))throw new ProductImageError('invalid');
 return p;
}
