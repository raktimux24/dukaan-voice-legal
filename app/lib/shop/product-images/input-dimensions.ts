import {IMAGE_LIMITS} from './contract';
type Dimensions={width:number;height:number};
/** Cheap pre-decode guard. The server still validates the complete decoded image. */
export function productPhotoDimensions(bytes:Uint8Array):Dimensions{
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=bytes.byteLength;
 const bad=():never=>{throw Error('product_image_format');};
 const dimensions=(width:number,height:number):Dimensions=>{
  if(!width||!height||Math.min(width,height)<IMAGE_LIMITS.minEdge)throw Error('product_image_dimensions');
  if(width*height>IMAGE_LIMITS.inputPixels)throw Error('product_image_pixels');
  return {width,height};
 };
 if(!n||n>IMAGE_LIMITS.inputBytes)throw Error('product_image_size');
 const text=(at:number,count:number)=>String.fromCharCode(...bytes.subarray(at,at+count));
 if(n>=24&&text(0,8)==='\x89PNG\r\n\x1a\n'){
  if(view.getUint32(8)!==13||text(12,4)!=='IHDR')return bad();
  return dimensions(view.getUint32(16),view.getUint32(20));
 }
 if(n>=4&&bytes[0]===255&&bytes[1]===216){
  let at=2;
  while(at<n){
   if(bytes[at++]!==255)return bad();while(at<n&&bytes[at]===255)at++;
   if(at>=n)return bad();const marker=bytes[at++];
   if(marker===217||marker===218)return bad();
   if(marker===1||marker>=208&&marker<=215)continue;
   if(at+2>n)return bad();const length=view.getUint16(at);if(length<2||at+length>n)return bad();
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){
    if(length<8)return bad();return dimensions(view.getUint16(at+5),view.getUint16(at+3));
   }
   at+=length;
  }
  return bad();
 }
 if(n>=20&&text(0,4)==='RIFF'&&text(8,4)==='WEBP'){
  const end=view.getUint32(4,true)+8;if(end>n||end<20)return bad();
  let canvas:Dimensions|undefined,frame:Dimensions|undefined;
  const u24=(at:number)=>bytes[at]+bytes[at+1]*256+bytes[at+2]*65536;
  for(let at=12;at+8<=end;){
   const kind=text(at,4),size=view.getUint32(at+4,true),start=at+8;if(start+size>end)return bad();
   if(kind==='ANIM'||kind==='ANMF')return bad();
   if(kind==='VP8X'){
    if(size!==10||bytes[start]&2)return bad();canvas=dimensions(u24(start+4)+1,u24(start+7)+1);
   }else if(kind==='VP8 '){
    if(size<10||text(start+3,3)!=='\x9d\x01\x2a')return bad();frame=dimensions(view.getUint16(start+6,true)&16383,view.getUint16(start+8,true)&16383);
   }else if(kind==='VP8L'){
    if(size<5||bytes[start]!==47)return bad();const bits=view.getUint32(start+1,true);frame=dimensions((bits&16383)+1,((bits>>>14)&16383)+1);
   }
   at=start+size+(size%2);
  }
  if(!frame||canvas&&(canvas.width!==frame.width||canvas.height!==frame.height))return bad();return frame;
 }
 return bad();
}
