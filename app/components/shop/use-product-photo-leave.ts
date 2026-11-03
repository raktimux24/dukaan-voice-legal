'use client';
import {useEffect,useRef} from 'react';

type TraverseEvent=Event&{navigationType:string;hashChange:boolean;destination:{sameDocument:boolean;key:string}};
type NavigationEvents=EventTarget&{traverseTo:(key:string)=>unknown};
/** Preserve the editor checkpoint before intentional navigation; never clear an uncertain save. */
export function useProductPhotoLeave(options:{dirty:boolean;busy:boolean;current:()=>boolean;flush:()=>Promise<void>;message:string;onError:()=>void}){
 const state=useRef(options);state.current=options;
 const allowed=useRef(false),prompting=useRef(false);
 const leave=async(work:()=>void)=>{
  const active=state.current;
  if(allowed.current||!active.current()||!active.dirty){work();return;}
  if(prompting.current||active.busy)return;
  prompting.current=true;
  try{
   if(!window.confirm(active.message))return;
   await active.flush();if(!active.current())return;
   allowed.current=true;work();
  }catch{active.onError();}finally{prompting.current=false;}
 };
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
  const traverse=(event:Event)=>{
   const next=event as TraverseEvent,active=state.current;
   if(next.navigationType!=='traverse'||next.hashChange||!next.destination.sameDocument||!event.cancelable||allowed.current||!active.current()||!active.dirty)return;
   event.preventDefault();void leave(()=>{navigation!.traverseTo(next.destination.key);});
  };
  window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);navigation?.addEventListener('navigate',traverse);
  return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);navigation?.removeEventListener('navigate',traverse);};
 },[]);
 return {leave,allow:()=>{allowed.current=true;},reset:()=>{allowed.current=false;}};
}
