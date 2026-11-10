'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useShop} from './context';
import {createProductSaveRecovery,type ProductSaveScope} from '../../lib/shop/product-images/save-recovery';
const storageKey='samaan-product-photo-saves-v1';
const journal=createProductSaveRecovery({get:async()=>localStorage.getItem(storageKey),set:async value=>localStorage.setItem(storageKey,value),clear:async()=>localStorage.removeItem(storageKey)});
const locked=<T,>(work:()=>Promise<T>)=>navigator.locks?.request('samaan-product-photo-saves-v1',work)??Promise.reject(Error('product_image_recovery_unavailable'));
export const retainProductPhotoSaves=(scope:ProductSaveScope|null)=>locked(()=>journal.retainScope(scope));
/** Web Locks serialize the journal across tabs, independently from billing recovery. */
export function useProductSaveRecovery(slot:string){
 const {api,userId,photoSessionId,shop}=useShop(),key=JSON.stringify([userId,photoSessionId,shop?.id,slot]);
 const latest=useRef({api,key});latest.current={api,key};
 const [,render]=useState(0),controller=useMemo(()=>({ready:false,error:false,live:true,pending:null as Record<string,unknown>|null}),[api,key]);
 const owner=useMemo(()=>userId&&photoSessionId&&shop?{actor:userId,session:photoSessionId,shop:shop.id}:null,[key]);
 const current=()=>{try{api.assertSession();return controller.live&&!!owner&&latest.current.key===key&&latest.current.api===api;}catch{return false;}};
 const changed=()=>{if(current())render(n=>n+1);};
 useEffect(()=>{
  controller.live=true;
  if(owner)void locked(async()=>{await journal.retainScope(owner);return journal.load(owner,slot,current);}).then(body=>{if(current()){controller.pending=body;controller.ready=true;changed();}}).catch(()=>{if(current()){controller.error=true;changed();}});
  return()=>{controller.live=false;};
 },[controller]);
 const clear=async()=>{
  const id=controller.pending?.productRequestId;
  // A successful parent callback may unmount this form before acknowledgement.
  const sameSession=()=>{try{api.assertSession();return !!owner;}catch{return false;}};
  if(owner&&typeof id==='string')await locked(()=>journal.remove(owner,slot,id,sameSession));
  if(!sameSession())throw Error('auth_session_changed');controller.pending=null;changed();
 };
 return {identity:key,current,ready:controller.ready,error:controller.error,pending:controller.pending,retry:()=>controller.pending,
  prepare:async(body:Record<string,unknown>)=>{
   if(!controller.ready||!owner||!current())throw Error('product_image_recovery_unavailable');
   const retained=controller.pending??{...JSON.parse(JSON.stringify(body)),productRequestId:crypto.randomUUID()};
   await locked(()=>journal.save(owner,slot,retained,current));controller.pending=retained;changed();return retained;
  },
  succeeded:clear,
  failed:async(error:unknown)=>{const status=(error as {status?:number})?.status;if(status&&status>=400&&status<500&&![408,425,429].includes(status)){try{await clear();}catch{controller.error=true;changed();}}},
 };
}
