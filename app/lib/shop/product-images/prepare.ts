import {productPhotoDimensions} from "./input-dimensions";
import {IMAGE_LIMITS} from './contract';
import type {PreparedImage} from './editor';

export async function prepareProductPhoto(file:File):Promise<PreparedImage<Blob>>{
 if(!file.size||file.size>IMAGE_LIMITS.inputBytes)throw Error('product_image_size');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('product_image_format');
 productPhotoDimensions(new Uint8Array(await file.arrayBuffer()));
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try{
  if(bitmap.width*bitmap.height>IMAGE_LIMITS.inputPixels)throw Error('product_image_pixels');
  if(Math.min(bitmap.width,bitmap.height)<IMAGE_LIMITS.minEdge)throw Error('product_image_dimensions');
  const factor=Math.min(1,2048/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*factor);canvas.height=Math.round(bitmap.height*factor);
  const context=canvas.getContext('2d');if(!context)throw Error('product_image_format');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('product_image_format')),'image/webp',.85));
  canvas.width=canvas.height=0;
  if(blob.size>IMAGE_LIMITS.inputBytes)throw Error('product_image_size');
  const uri=URL.createObjectURL(blob);return {uri,payload:blob,release:()=>URL.revokeObjectURL(uri)};
 }finally{bitmap.close();}
}
