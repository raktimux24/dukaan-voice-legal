'use client';
import {useEffect,useRef,useState} from 'react';
import {BrowserAudioCapture,type RecordedAudio} from '../../lib/shop/browser-audio';
import {useShop} from './context';
import {Button} from './ui';

export function VoiceCapture({disabled,onRecorded}: {disabled?:boolean;onRecorded:(audio:RecordedAudio)=>Promise<void>}) {
  const {userId,shop,t}=useShop();
  const capture=useRef<BrowserAudioCapture|null>(null);
  const epoch=useRef(0);
  const [state,setState]=useState<'idle'|'starting'|'recording'|'sending'>('idle');
  const [error,setError]=useState(false);
  const [seconds,setSeconds]=useState(0);
  useEffect(()=>{
    if(state!=='recording')return;
    setSeconds(0);const timer=setInterval(()=>setSeconds(n=>Math.min(30,n+1)),1000);
    return ()=>clearInterval(timer);
  },[state]);
  useEffect(()=>{
    epoch.current++;setState('idle');setError(false);
    return ()=>{epoch.current++;capture.current?.cancel();};
  },[userId,shop?.id]);
  const start=async()=>{
    const version=epoch.current;
    setError(false);setState('starting');
    const controller=new BrowserAudioCapture();capture.current=controller;
    try {
      const started=await controller.start(audio=>{
        if(version!==epoch.current)return;
        setState('sending');
        void onRecorded(audio).catch(()=>{if(version===epoch.current)setError(true);}).finally(()=>{if(version===epoch.current)setState('idle');});
      },()=>{if(version===epoch.current){setError(true);setState('idle');}});
      if(started && version===epoch.current)setState('recording');
    } catch {if(version===epoch.current){setError(true);setState('idle');}}
  };
  return <div className="grid gap-2">
    <div className="shop-actions">
      <Button tone="ghost" disabled={disabled || state==='starting' || state==='sending'} onClick={()=>state==='recording'?capture.current?.stop():void start()}>
        {state==='recording'?t('modal.voice.stop','Stop Recording'):state==='starting'||state==='sending'?t('modal.voice.processing','Processing...'):t('a11y.voice','Voice')}
      </Button>
      {state==='recording'||state==='starting'?<Button tone="ghost" onClick={()=>{epoch.current++;capture.current?.cancel();setState('idle');}}>{t('common.cancel','Cancel')}</Button>:null}
    </div>
    {state==='recording'?<p role="status">{t('modal.analytics.listening','Listening... {{n}}s / 30s',{n:seconds})}</p>:null}
    {error?<p role="alert" className="text-danger">{t('modal.analytics.toast_voice_fail','Failed to process voice')}</p>:null}
  </div>;
}
export function SpeechAudio({base64,label}: {base64?:string|null;label:string}) {
  return base64?<audio className="w-full mt-3" aria-label={label} controls src={`data:audio/wav;base64,${base64}`} />:null;
}
