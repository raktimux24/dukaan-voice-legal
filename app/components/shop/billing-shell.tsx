'use client';
import {useEffect,useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {useShop} from './context';
import {APP_LANGUAGES,loadBundledLanguage} from '../../lib/shop/translations';
export function clearBillingShell(){
 if('serviceWorker' in navigator)navigator.serviceWorker.controller?.postMessage({type:'CLEAR_BILLING_SHELL'});
}
export function BillingShell({enabled,offline}:{enabled:boolean;offline:boolean}){
 useEffect(()=>{
  if(!enabled||!('serviceWorker' in navigator)||!window.isSecureContext)return;
  let cancelled=false;
  const warm=async()=>{
   if(navigator.onLine===false)return;
   try{
    await navigator.serviceWorker.register('/shop-worker.js',{scope:'/'});
    if(cancelled)return;
    const ready=await navigator.serviceWorker.ready;
    if(cancelled)return;
    ready.active?.postMessage({type:'WARM_BILLING_SHELL'});
    // The same-origin translation chunks are bundled assets, never user records.
    await Promise.allSettled(APP_LANGUAGES.map(loadBundledLanguage));
   }catch{/* Shell caching is optional; storage failure never blocks connected billing. */}
  };
  void warm();window.addEventListener('online',warm);
  return()=>{cancelled=true;window.removeEventListener('online',warm);};
 },[enabled]);
 useEffect(()=>{
  if(!offline)return;
  const navigate=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest('a[href]'):null;
   if(!(link instanceof HTMLAnchorElement)||link.target||link.download)return;
   const url=new URL(link.href);
   if(url.origin!==location.origin||!['/shop/sell','/shop/sell/checkout','/shop/settings/gst/recovery'].includes(url.pathname)||url.search)return;
   // Cached documents support a full navigation; Next RSC responses are not reused across router states.
   event.preventDefault();event.stopPropagation();location.assign(url.href);
  };
  document.addEventListener('click',navigate,true);return()=>document.removeEventListener('click',navigate,true);
 },[offline]);
 return null;
}

/** Cached document navigation avoids reusing an RSC response for a different router state. */
export function useBillingRouter(){
 const router=useRouter(),{offline}=useShop();
 return useMemo(()=>{const local=(href:string)=>{
  const url=new URL(href,location.origin);
  return offline&&url.origin===location.origin&&!url.search&&['/shop/sell','/shop/sell/checkout','/shop/settings/gst/recovery'].includes(url.pathname)?url.href:null;
 };
 return {...router,push:(href:string,options?:Parameters<typeof router.push>[1])=>{const url=local(href);if(url)location.assign(url);else router.push(href,options);},replace:(href:string,options?:Parameters<typeof router.replace>[1])=>{const url=local(href);if(url)location.replace(url);else router.replace(href,options);}};},[router,offline]);
}
