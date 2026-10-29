'use client';
import {useEffect,useRef} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import {useShop} from '../context';
import {PageHeader,PremiumLock} from '../ui';
import {cashWebUi} from './cashbook';
import {useFollowups} from '../../../lib/shop/followups/workflow';
import {FollowupView} from '../../../lib/shop/followups/view';
import {followupUri} from '../../../lib/shop/followups/contract';
const storage={getItem:async(k:string)=>localStorage.getItem(k),setItem:async(k:string,v:string)=>localStorage.setItem(k,v),removeItem:async(k:string)=>localStorage.removeItem(k)};
export function CollectionFollowupsScreen(){const c=useShop(),params=useSearchParams(),id=params.get('customerId');if(!c.premium)return <PremiumLock shopId={c.shop?.id} feature="udhaar"/>;return <Editor key={c.shop?.id+':'+c.userId+':'+id} customerId={id}/>}
function Editor({customerId}:{customerId:string|null}){const {api,shop,userId,perms,offline,prefs,t:translate}=useShop(),router=useRouter(),top=useRef<HTMLDivElement>(null),alive=useRef(true),t=(k:string,v?:Record<string,string|number>)=>translate(k,k,v),w=useFollowups(api.followups,shop?.id??'',customerId,shop?.id+':'+userId,!!shop&&!!userId&&perms.canManageCustomers,!!offline,()=>crypto.randomUUID(),storage);useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);useEffect(()=>{if(!w.busy)top.current?.scrollIntoView({block:'start'})},[w.busy]);return <div ref={top} className="shop-page retail-workspace"><PageHeader title={t('followups.title')} back={{href:customerId?'/shop/customers/'+customerId:'/shop/customers',label:t('customers.title')}}/><FollowupView w={w} ui={cashWebUi} t={t} language={prefs?.appLanguage??'en'} openCustomer={()=>router.push('/shop/customers/'+customerId)} openCredit={()=>router.push('/shop/customers/'+customerId+'/statement')} openFollowup={id=>router.push('/shop/customers/followups?customerId='+id)} launch={async(p,c)=>{if(!alive.current)throw Error('followups_not_allowed');if(c==='copy'){await navigator.clipboard.writeText(p.message);if(!alive.current)throw Error('followups_not_allowed');return 'copied'}const a=document.createElement('a');a.href=c==='whatsapp'?`https://wa.me/91${p.phone}?text=${encodeURIComponent(p.message)}`:followupUri(p,c);a.target='_blank';a.rel='noopener noreferrer';a.click();return 'requested'}}/></div>}
