'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {startCounterCamera,scannerCode} from '../../lib/shop/counter/scanner';
import {useShop} from './context';
import {Button,Card,Field,inputClass} from './ui';
export function UsbCounterScanner({onCode,onClose,inputRef}:{onCode:(code:string)=>void;onClose:()=>void;inputRef?:RefObject<HTMLInputElement|null>}){
 const localRef=useRef<HTMLInputElement>(null),ref=inputRef??localRef,{t}=useShop(),[value,setValue]=useState(''),[error,setError]=useState(false),tr=(k:string)=>t('counter.'+k,'');useEffect(()=>{ref.current?.focus()},[]);
 const submit=()=>{const code=scannerCode(value);if(!code){setError(true);return}setError(false);setValue('');onCode(code);ref.current?.focus()};
 return <Card><Field label={tr('scanner_input')}><input ref={ref} className={inputClass} value={value} autoComplete="off" spellCheck={false} maxLength={256} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit()}if(e.key==='Escape'){e.preventDefault();onClose()}}}/></Field><p className="text-sm text-muted">{tr('scanner_help')}</p>{error?<p role="alert" className="text-danger">{tr('scanner_invalid')}</p>:null}<div className="shop-actions"><Button onClick={submit}>{tr('scanner_add')}</Button><Button tone="ghost" onClick={onClose}>{tr('scanner_close')}</Button></div></Card>;
}
export function CounterCamera({onCode,onClose}:{onCode:(code:string)=>void;onClose:()=>void}){
 const {t}=useShop(),video=useRef<HTMLVideoElement>(null),codeRef=useRef(onCode),[error,setError]=useState('');codeRef.current=onCode;
 useEffect(()=>{const node=video.current;if(!node)return;return startCounterCamera(node,c=>codeRef.current(c),setError,{stream:()=>navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}),detector:async()=>{const Native=(window as unknown as {BarcodeDetector?:new(opts:{formats:string[]})=>{detect:(v:HTMLVideoElement)=>Promise<{rawValue?:string}[]>}}).BarcodeDetector,Detector=Native??(await import('barcode-detector')).BarcodeDetector;return new Detector({formats:['ean_13','ean_8','code_128','upc_a','upc_e','qr_code']})},frame:requestAnimationFrame,cancel:cancelAnimationFrame})},[]);
 return <Card><p className="text-sm text-muted" role={error?'alert':undefined}>{t('counter.'+(error||'camera_help'),'')}</p><video ref={video} muted playsInline className="w-full rounded-lg" aria-label={t('counter.camera_view','')}/><Button tone="ghost" onClick={onClose}>{t('counter.camera_close','')}</Button></Card>;
}
