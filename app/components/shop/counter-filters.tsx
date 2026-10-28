'use client';
import {useEffect,useState,useRef} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {useShop} from './context';
import {Button,Field,inputClass,Notice} from './ui';
import {counterFilters,counterQuery,counterUrl,type CounterFilters} from '../../lib/shop/counter/query';
export function useCounterFilters(kind:'sales'|'refunds'){
 const params=useSearchParams(),router=useRouter(),raw=params.toString(),[f,setFilters]=useState(()=>counterFilters(new URLSearchParams(raw),kind)),latest=useRef(f);
 useEffect(()=>{const next=counterFilters(new URLSearchParams(raw),kind);latest.current=next;setFilters(next)},[raw,kind]);
 const change=(patch:Partial<CounterFilters>)=>{const next={...latest.current,...patch};latest.current=next;setFilters(next);router.replace(counterUrl(kind,next),{scroll:false})};
 return {filters:f,params:counterQuery(f),href:counterUrl(kind,f),change};
}
export function CounterFiltersView({kind,value,onChange}:{kind:'sales'|'refunds';value:CounterFilters;onChange:(p:Partial<CounterFilters>)=>void}){
 const {t}=useShop(),tr=(k:string)=>t('counter.'+k,''),[search,setSearch]=useState(value.q),[custom,setCustom]=useState(value.period==='custom'),[from,setFrom]=useState(value.from),[to,setTo]=useState(value.to);
 const changeRef=useRef(onChange);changeRef.current=onChange;
 useEffect(()=>setSearch(value.q),[value.q]);useEffect(()=>{setCustom(value.period==='custom');setFrom(value.from);setTo(value.to)},[value.period,value.from,value.to]);
 useEffect(()=>{if(search===value.q)return;const timer=setTimeout(()=>changeRef.current({q:search}),350);return()=>clearTimeout(timer)},[search,value.q]);
 const select=(label:string,field:'status'|'desk'|'method',options:string[])=> <Field label={tr(label)}><select className={inputClass} value={value[field]} onChange={e=>onChange({[field]:e.target.value})}>{options.map(v=><option key={v} value={v}>{field==='method'&&v!=='all'?t('pos.method.'+v,v):tr(field+'_'+v)}</option>)}</select></Field>;
 return <section className="counter-filters" aria-label={tr('filters')}><Field label={tr(kind==='sales'?'search_sales':'search_refunds')}><input type="search" className={inputClass} maxLength={160} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();onChange({q:search})}}}/></Field><div className="counter-filter-grid"><Field label={tr('period')}><select className={inputClass} value={custom?'custom':value.period} onChange={e=>{if(e.target.value==='custom')setCustom(true);else{setCustom(false);onChange({period:e.target.value,from:'',to:''})}}}>{['today','yesterday','7d','30d','month','all','custom'].map(p=><option key={p} value={p}>{tr('period_'+p)}</option>)}</select></Field>{kind==='sales'?<>{select('status','status',['all','completed','voided'])}{select('desk','desk',['all','udhaar'])}</>:null}{select('method','method',['all','cash','upi','card','credit'])}</div>{custom?<div className="counter-date-range"><Field label={tr('from')}><input type="date" className={inputClass} value={from} onChange={e=>setFrom(e.target.value)}/></Field><Field label={tr('to')}><input type="date" className={inputClass} value={to} onChange={e=>setTo(e.target.value)}/></Field><Button tone="ghost" disabled={!from||!to||from>to} onClick={()=>onChange({period:'custom',from,to})}>{tr('apply')}</Button><p className="text-sm text-muted">{tr('ist_days')}</p></div>:null}<Button tone="ghost" onClick={()=>{setSearch('');onChange({period:kind==='sales'?'today':'7d',from:'',to:'',q:'',status:'all',desk:'all',method:'all'})}}>{tr('reset')}</Button></section>;
}

export function CounterNotice({error}:{error:unknown}){const {t}=useShop();const code=(error as {code?:string})?.code;if(['counter_cursor','counter_invalid_filters','invalid_range','counter_not_allowed','counter_export_limit'].includes(code??''))return <p role="alert" className="text-danger">{t('counter.error.'+code,'')}</p>;return <Notice error={error}/>}
