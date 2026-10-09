'use client';
import {useEffect,useRef,useState} from 'react';
import {useShop} from './context';
import {Button,Card,Spinner} from './ui';
import {useGstText} from './gst-ui';
export const BROWSER_PUSH_OWNER='samaan-browser-push-owner';
export async function disconnectBrowserPush(api:{removeBrowserPush:(subscription:PushSubscriptionJSON)=>Promise<unknown>}){
 if(!('serviceWorker' in navigator))return;
 try{
  const registration=await navigator.serviceWorker.getRegistration('/');
  registration?.active?.postMessage({type:'BIND_PUSH_ACCOUNT',actorId:null});
  const subscription=await registration?.pushManager.getSubscription();
  if(subscription){await subscription.unsubscribe();await Promise.race([api.removeBrowserPush(subscription.toJSON()).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2000))]);}
 }finally{try{localStorage.removeItem(BROWSER_PUSH_OWNER);}catch{}}
}
export function BrowserNotifications(){
 const {api,userId,prefs,offline,t}=useShop(),text=useGstText();
 const [status,setStatus]=useState('loading'),[busy,setBusy]=useState(false);
 const [key,setKey]=useState<string|null>(null),[revision,setRevision]=useState(0);
 const alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{
  let cancelled=false;
  const check=async()=>{
   if(!window.isSecureContext||!('Notification' in window)||!('PushManager' in window)||!('serviceWorker' in navigator)){setStatus('unsupported');return;}
   try{
    const capability=await api.getBrowserPush();if(cancelled)return;
    setKey(capability.publicKey);
    if(!capability.available||!capability.publicKey){setStatus('unavailable');return;}
    const registration=await navigator.serviceWorker.register('/shop-worker.js',{scope:'/'});
    const subscription=await registration.pushManager.getSubscription();if(cancelled)return;
    const bound=localStorage.getItem(BROWSER_PUSH_OWNER);
    if(subscription&&bound!==userId){await disconnectBrowserPush(api);if(cancelled)return;setStatus('off');return;}
    if(subscription&&Notification.permission==='granted'){
     await api.saveBrowserPush(subscription.toJSON(),prefs?.appLanguage??'en');if(cancelled)return;
     registration.active?.postMessage({type:'BIND_PUSH_ACCOUNT',actorId:userId});setStatus('on');
    }else setStatus(Notification.permission==='denied'?'denied':'off');
   }catch{if(!cancelled)setStatus('error');}
  };
  if(offline){setStatus('error');return;}
  void check();return()=>{cancelled=true;};
 },[api,userId,prefs?.appLanguage,offline,revision]);
 const toggle=async()=>{
  if(busy||!userId)return;setBusy(true);
  try{
   if(status==='on'){await disconnectBrowserPush(api);if(alive.current)setStatus('off');return;}
   if(!key)return;
   // Permission is requested only from the user's explicit click.
   const permission=await Notification.requestPermission();if(!alive.current)return;
   if(permission!=='granted'){setStatus(permission==='denied'?'denied':'off');return;}
   await navigator.serviceWorker.register('/shop-worker.js',{scope:'/'});
   const registration=await navigator.serviceWorker.ready;if(!alive.current)return;
   const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
   if(!alive.current){await subscription.unsubscribe();return;}
   await api.saveBrowserPush(subscription.toJSON(),prefs?.appLanguage??'en');
   if(!alive.current){await subscription.unsubscribe();return;}
   localStorage.setItem(BROWSER_PUSH_OWNER,userId);
   registration.active?.postMessage({type:'BIND_PUSH_ACCOUNT',actorId:userId});setStatus('on');
  }catch{if(alive.current)setStatus('error');}finally{if(alive.current)setBusy(false);}
 };
 const labels:Record<string,string>={unsupported:'This browser does not support notifications.',unavailable:'Browser notifications are not available yet.',off:'Notifications are off on this browser.',denied:'Notifications are blocked. Allow them in your browser settings.',on:'Notifications are enabled on this browser.',error:'Could not update notifications. Connect and try again.'};
 return <Card className="grid gap-4"><div><h2 className="shop-section-title">{t('settings.section_notifications','Notifications')}</h2><p className="shop-section-sub">{text('Daily recaps and shop updates on this browser.')}</p></div>
 {status==='loading'?<Spinner/>:<p role="status">{text(labels[status])}</p>}
 {['off','on'].includes(status)?<div className="shop-actions"><Button disabled={busy||offline} onClick={()=>void toggle()}>{text(status==='on'?'Turn off notifications':'Enable notifications')}</Button></div>:status==='error'?<Button disabled={busy||offline} tone="ghost" onClick={()=>setRevision(value=>value+1)}>{t('common.retry','Try again')}</Button>:null}</Card>;
}
