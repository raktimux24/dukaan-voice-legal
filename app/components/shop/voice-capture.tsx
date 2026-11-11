'use client';
import {useEffect,useRef,useState} from 'react';
import {BrowserAudioCapture,type RecordedAudio} from '../../lib/shop/browser-audio';
import {useShop} from './context';
import {Button,Glyph} from './ui';

type CaptureError='mic'|'unsupported'|'recording'|null;

function captureError(error:unknown):CaptureError{
  const name=error instanceof Error?error.name:'';
  const message=error instanceof Error?error.message:'';
  if(message==='unsupported_audio')return 'unsupported';
  if(['NotAllowedError','SecurityError','NotFoundError','NotReadableError','OverconstrainedError'].includes(name))return 'mic';
  return 'recording';
}

/**
 * Records one voice command. Processing errors are shown by the caller (one
 * message, not two); this only explains problems with the microphone itself.
 */
export function VoiceCapture({disabled,onRecorded}: {disabled?:boolean;onRecorded:(audio:RecordedAudio)=>Promise<void>}) {
  const {userId,shop,t}=useShop();
  const capture=useRef<BrowserAudioCapture|null>(null);
  const button=useRef<HTMLButtonElement>(null);
  const epoch=useRef(0);
  const [state,setState]=useState<'idle'|'starting'|'recording'|'sending'>('idle');
  const [error,setError]=useState<CaptureError>(null);
  const [seconds,setSeconds]=useState(0);
  useEffect(()=>{
    if(state!=='recording')return;
    setSeconds(0);const timer=setInterval(()=>setSeconds(n=>Math.min(30,n+1)),1000);
    return ()=>clearInterval(timer);
  },[state]);
  useEffect(()=>{
    epoch.current++;setState('idle');setError(null);
    return ()=>{epoch.current++;capture.current?.cancel();};
  },[userId,shop?.id]);
  // Keyboard users land on the mic, not on Close: Enter or Space starts listening.
  useEffect(()=>{const frame=requestAnimationFrame(()=>button.current?.focus());return ()=>cancelAnimationFrame(frame);},[]);
  const start=async()=>{
    const version=epoch.current;
    setError(null);setState('starting');
    const controller=new BrowserAudioCapture();capture.current=controller;
    try {
      const started=await controller.start(audio=>{
        if(version!==epoch.current)return;
        setState('sending');
        void onRecorded(audio).catch(()=>{}).finally(()=>{if(version===epoch.current){setState('idle');button.current?.focus();}});
      },failure=>{if(version===epoch.current){setError(captureError(failure));setState('idle');}});
      if(started && version===epoch.current)setState('recording');
    } catch(failure) {if(version===epoch.current){setError(captureError(failure));setState('idle');}}
  };
  const busy=state==='starting'||state==='sending';
  const label=state==='recording'?t('modal.voice.stop','Stop Recording'):busy?t('modal.voice.processing','Processing...'):t('homeweb.voice_tap_to_speak','Tap to speak');
  return <div className={'voice-capture-stage is-'+state}><div className="voice-wave" aria-hidden="true">{Array.from({length:17},(_,i)=><i key={i} style={{height:12+((i*13)%37),animationDelay:(i%5)*-.13+'s'}}/>)}</div>
    <div className="shop-actions">
      <button ref={button} type="button" data-autofocus className={'shop-btn shop-btn-primary is-lg has-icon voice-mic-button'+(state==='recording'?' is-recording':'')} aria-pressed={state==='recording'}
        disabled={(disabled && state!=='recording') || busy} onClick={()=>state==='recording'?capture.current?.stop():void start()}>
        <span className="shop-btn-icon" aria-hidden="true"><Glyph name="mic"/></span>{label}
      </button>
      {state==='recording'||state==='starting'?<Button tone="ghost" onClick={()=>{epoch.current++;capture.current?.cancel();setState('idle');button.current?.focus();}}>{t('common.cancel','Cancel')}</Button>:null}
    </div>
    {state==='recording'?<p role="status">{t('modal.analytics.listening','Listening... {{n}}s / 30s',{n:seconds})}</p>:null}
    {error?<p role="alert" className="shop-notice">{error==='mic'?t('homeweb.voice_mic_blocked','Allow microphone access for this site in your browser, then try again.'):error==='unsupported'?t('homeweb.voice_mic_unsupported','This browser cannot record audio. Try the latest Chrome or Edge.'):t('modal.voice.err.voice_failed',"Couldn't process that. Please try again.")}</p>:null}
  </div>;
}
export function SpeechAudio({base64,label}: {base64?:string|null;label:string}) {
  return base64?<audio className="w-full mt-3" aria-label={label} controls src={`data:audio/wav;base64,${base64}`} />:null;
}
