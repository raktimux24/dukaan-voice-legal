'use client';
import {useMemo,useRef,useState} from 'react';
import {useShop} from './context';
import {ProductImageById} from './product-image';
import {inputClass} from './ui';
/** Native select options cannot render thumbnails. Keep product choices as keyboard-accessible buttons. */
export function ProductSelect({label,value,onChange,options,disabled=false}:{label:string;value:string;onChange:(id:string)=>void;options:readonly(readonly[string,string])[];disabled?:boolean}){
 const {t}=useShop(),ref=useRef<HTMLDetailsElement>(null),[search,setSearch]=useState(''),[limit,setLimit]=useState(30);
 const matches=useMemo(()=>options.filter(([id,name])=>id&&name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),[options,search]);
 return <details ref={ref} className="rounded-xl border border-line p-3" onToggle={()=>{if(!ref.current?.open){setSearch('');setLimit(30);}}}>
  <summary className="cursor-pointer font-semibold">{value?options.find(([id])=>id===value)?.[1]??label:label}</summary>
  <input className={inputClass+' my-3'} aria-label={t('pos.search_placeholder','Search products or short code')} placeholder={t('pos.search_placeholder','Search products or short code')} value={search} disabled={disabled} onChange={e=>{setSearch(e.target.value);setLimit(30);}}/>
  <div className="grid max-h-80 gap-2 overflow-auto">
   {matches.slice(0,limit).map(([id,name])=><button type="button" key={id} disabled={disabled} className="flex min-w-0 items-center gap-3 rounded-lg p-2 text-left hover:bg-white/5 disabled:opacity-50" onClick={()=>{onChange(id);if(ref.current)ref.current.open=false;}}><ProductImageById productId={id} name={name} size={40}/><span className="min-w-0 break-words">{name}</span></button>)}
   {!matches.length?<p role="status">{t('common.no_results','No results')}</p>:null}
   {matches.length>limit?<button type="button" className="p-2 text-accent" onClick={()=>setLimit(n=>n+30)}>{t('common.load_more','Load more')}</button>:null}
  </div>
 </details>;
}
