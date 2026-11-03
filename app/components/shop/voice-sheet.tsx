'use client';
import {useEffect,useRef,type ReactNode} from 'react';

export function VoiceSheet({title,closeLabel,onClose,children}:{title:string;closeLabel:string;onClose:()=>void;children:ReactNode}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const element=dialog.current;
    if(!element)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    element.showModal();
    return()=>{element.close();document.body.style.overflow=previousOverflow;};
  },[]);
  return <dialog ref={dialog} className="shop-voice-sheet" aria-labelledby="voice-command-title" aria-modal="true"
    onCancel={event=>{event.preventDefault();onClose();}}
    onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="shop-voice-header"><h2 id="voice-command-title">{title}</h2>
      <button type="button" className="shop-btn shop-btn-ghost" onClick={onClose} aria-label={closeLabel}>{closeLabel}</button></div>
    <div className="shop-voice-scroll">{children}</div>
  </dialog>;
}
