'use client';
import {useRef} from 'react';
import {useShop} from '../context';
import {PageHeader,Field,inputClass} from '../ui';
import {openingWebUi} from './opening-balances';
import {useCashbook,type CashStorage} from '../../../lib/shop/cashbook/workflow';
import {CashbookView,type CashUi} from '../../../lib/shop/cashbook/view';
const storage:CashStorage={getItem:async k=>localStorage.getItem(k),setItem:async(k,v)=>localStorage.setItem(k,v),removeItem:async k=>localStorage.removeItem(k)};
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
export const cashWebUi:CashUi={...openingWebUi,Select:({label,value,options,onChange,disabled})=><Field label={label}><select aria-label={label} className={inputClass} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>,Totals:({items,highlightLast})=><div className={'cashbook-totals'+(highlightLast?' has-closing':'')}>{items.map((x,i)=><div className={'shop-surface'+(highlightLast&&i===items.length-1?' cashbook-closing':'')} key={x.label}><p>{x.label}</p><p className="num">{x.value}</p></div>)}</div>};
export function CashbookScreen(){const c=useShop();return <Editor key={c.shop?.id+':'+c.userId}/>}
function Editor(){const {api,shop,userId,perms,offline,prefs,t:translate,setNotice}=useShop(),t=(k:string,v?:Record<string,string|number>)=>translate(k,k,v),language=prefs?.appLanguage??'en',top=useRef<HTMLDivElement>(null),w=useCashbook(api.cashbook,shop?.id+':'+userId,shop?.id??'',!!shop&&!!userId&&perms.canSeeReports&&!offline,()=>crypto.randomUUID(),storage,digest);

 return <div ref={top} className="shop-page retail-workspace"><PageHeader title={t('cashbook.title')} back={{href:'/shop/reports',label:t('reports.title')}}/><CashbookView onNavigate={()=>top.current?.scrollIntoView({block:'start'})} w={w} ui={cashWebUi} t={t} language={language} share={async file=>{api.assertSession();const blob=new Blob([file.content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setNotice(t('cashbook.exported'))}}/></div>
}
