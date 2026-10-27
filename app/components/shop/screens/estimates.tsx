'use client';
import {useEffect,useRef,useMemo} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {useShop} from '../context';
import {PageHeader} from '../ui';
import {openingWebUi} from './opening-balances';
import {DocumentPreview} from '../document-preview';
import {useEstimates,type EstimateStorage} from '../../../lib/shop/estimates/workflow';
import {EstimatesView} from '../../../lib/shop/estimates/view';
import {draftFromCart,cartFromEstimate} from '../../../lib/shop/estimates/handoff';
import {useCart,readCart,readPending} from '../../../lib/shop/cart';
import {financialScope,retainedRequests} from '../../../lib/shop/gst-storage';
const storage:EstimateStorage={getItem:async k=>localStorage.getItem(k),setItem:async(k,v)=>localStorage.setItem(k,v),removeItem:async k=>localStorage.removeItem(k)};
export function EstimatesScreen(){const c=useShop();return <Editor key={c.shop?.id+':'+c.userId}/>}
function Editor(){const {api,shop,userId,perms,offline,t:translate}=useShop(),router=useRouter(),params=useSearchParams(),opened=useRef(''),t=(key:string,vars?:Record<string,string|number>)=>translate(key,key,vars),cart=useCart(userId,shop?.id??null);
 const initial=useMemo(()=>{if(params.get('fromCart')!=='1'||!cart.cart.lines.length)return {};try{return {draft:draftFromCart(cart.cart,()=>crypto.randomUUID())}}catch{return {error:true}}},[]);
 const w=useEstimates(api.estimates,shop?.id+':'+userId,shop?.id??'',!!shop&&!!userId&&perms.canSell&&!offline,()=>crypto.randomUUID(),storage),id=params.get('id');useEffect(()=>{if(id&&opened.current!==id&&w.ready){opened.current=id;void w.open(id)}},[id,w.ready]);
 return <div className="shop-page retail-workspace"><PageHeader title={t('estimates.title')} back={{href:'/shop/sales',label:t('nav.sales')}}/>{initial.error?<p>{t('estimates.unsupported')}</p>:<EstimatesView w={w} ui={openingWebUi} t={t} uuid={()=>crypto.randomUUID()} initialDraft={initial.draft} hasCart={!!cart.cart.lines.length} share={async text=>{if(navigator.share)await navigator.share({title:t('estimates.title'),text});else{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=(w.order?.number??'estimate')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}} prepare={async p=>{const current=readCart(userId!,shop!.id);if(current.estimateSource&&current.estimateSource.intentId!==p.intent?.source.intentId)throw Error('estimates_in_progress');if(current.estimateSource?.intentId===p.intent?.source.intentId){router.push('/shop/checkout');return;}if(readPending(userId!,shop!.id)||(await retainedRequests(financialScope(shop!.id))).some(r=>r.state==='pending'&&r.path.endsWith('/sales')))throw Error('estimates_checkout_pending');const data=await api.getAllInventory(shop!.id,true,true);if(JSON.stringify(readCart(userId!,shop!.id))!==JSON.stringify(current))throw Error('estimates_cart_changed');cart.update(cartFromEstimate(p,data) as any);router.push('/shop/checkout')}} openSale={id=>router.push('/shop/sales/'+id)} renderDocument={data=><DocumentPreview {...data}/>}/>}</div>
}
