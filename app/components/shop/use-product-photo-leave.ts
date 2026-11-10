'use client';
import {useEffect,useRef} from 'react';

type TraverseEvent=Event&{navigationType:string;hashChange:boolean;canIntercept?:boolean;intercept?:(options:{precommitHandler:()=>Promise<void>})=>void;destination:{sameDocument:boolean;key:string;index:number}};
type NavigationEvents=EventTarget&{currentEntry:{key:string;index:number};traverseTo:(key:string)=>unknown};
/** Preserve the editor checkpoint before intentional navigation; never clear an uncertain save. */
export function useProductPhotoLeave(options:{dirty:boolean;busy:boolean;current:()=>boolean;flush:()=>Promise<void>;message:string;onError:()=>void}){
 const state=useRef(options);state.current=options;
 const allowed=useRef(false),prompting=useRef(false);
 const requestLeave=async()=>{
  const active=state.current;
  if(allowed.current||!active.current()||!active.dirty)return true;
  if(prompting.current||active.busy)return false;
  prompting.current=true;
  try{
   if(!window.confirm(active.message))return false;
   await active.flush();if(!active.current())return false;
   allowed.current=true;return true;
  }catch{active.onError();return false;}finally{prompting.current=false;}
 };
 const leave=async(work:()=>void)=>{if(await requestLeave())work();};
 useEffect(()=>{
  const unload=(event:BeforeUnloadEvent)=>{const active=state.current;if(!allowed.current&&active.current()&&active.dirty){event.preventDefault();event.returnValue='';}};
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest('a[href]') as HTMLAnchorElement|null:null;
   if(!anchor||anchor.hasAttribute('download')||anchor.target&&anchor.target!=='_self')return;
   const active=state.current;if(allowed.current||!active.current()||!active.dirty)return;
   const target=new URL(anchor.href,location.href),here=new URL(location.href);
   if(target.origin===here.origin&&target.pathname===here.pathname&&target.search===here.search)return;
   event.preventDefault();event.stopImmediatePropagation();
   // A document navigation also covers external links and keeps Next's history untouched.
   void leave(()=>location.assign(target.href));
  };
  const navigation=(window as Window&{navigation?:NavigationEvents}).navigation;
  // WebKit needs a completed traversal/restore to keep its browser history UI in sync.
  // Prefer a pre-commit handler when supported; keep the original cancellation
  // path for older non-WebKit browsers.
  const precommit='NavigationPrecommitController' in window;
  const webkit=/AppleWebKit\//.test(navigator.userAgent)&&!/(?:Chrome|Chromium)\//.test(navigator.userAgent);
  let pending:{origin:string;index:number;destination:string;target:number;phase:'leaving'|'restoring'}|null=null;
  const traverse=(event:Event)=>{
   const next=event as TraverseEvent,active=state.current,origin=navigation?.currentEntry;
   if(next.navigationType!=='traverse'||next.hashChange||!next.destination.sameDocument||allowed.current||pending||!active.current()||!active.dirty||!origin||origin.key===next.destination.key||origin.index<0||next.destination.index<0)return;
   if(precommit&&event.cancelable&&next.canIntercept&&next.intercept){
    next.intercept({precommitHandler:async()=>{if(!await requestLeave())throw new DOMException('Photo editor navigation cancelled','AbortError');}});return;
   }
   if(event.cancelable&&!webkit){event.preventDefault();void leave(()=>{navigation!.traverseTo(next.destination.key);});return;}
   // Observe the destination without cancelling the browser's history traversal.
   // Safari can otherwise retain the attempted URL and skip an entry on Back.
   pending={origin:origin.key,index:origin.index,destination:next.destination.key,target:next.destination.index,phase:'leaving'};
  };
  const popstate=(event:PopStateEvent)=>{
   const entry=navigation?.currentEntry,attempt=pending,active=state.current;
   if(!attempt||!entry)return;
   if(allowed.current||!active.current()||!active.dirty){pending=null;return;}
   if(attempt.phase==='leaving'&&entry.key===attempt.destination){
    // Keep Next's router and the mounted draft on the original editor while
    // restoring the exact existing entry. Do not replace its router state.
    event.stopImmediatePropagation();attempt.phase='restoring';
    history.go(attempt.index-attempt.target);return;
   }
   if(attempt.phase==='restoring'&&entry.key===attempt.origin){
    event.stopImmediatePropagation();pending=null;
    void leave(()=>{navigation!.traverseTo(attempt.destination);});
   }
  };
  window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);navigation?.addEventListener('navigate',traverse);window.addEventListener('popstate',popstate,true);
  return()=>{pending=null;window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);navigation?.removeEventListener('navigate',traverse);window.removeEventListener('popstate',popstate,true);};
 },[]);
 return {leave,allow:()=>{allowed.current=true;},reset:()=>{allowed.current=false;}};
}
