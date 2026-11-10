'use client';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {useShop} from './context';
import {Button,Notice} from './ui';
import {ProductImageById} from './product-image';
import {formatINR} from '../../lib/shop/money';
import type {useCart} from '../../lib/shop/cart';
export function CheckoutCustomerHistory({customerId}:{customerId:string|null}) {
 const {api,shop,premium,t}=useShop();
 const risk=useQuery({queryKey:['udhaar-risk',shop?.id],enabled:!!shop&&!!customerId&&premium,queryFn:()=>api.getUdhaarRisk(shop!.id),retry:false});
 const p=risk.data?.profiles.find(p=>p.customerId===customerId);
 if(!p)return null;
 const values={balance:formatINR(p.balance),limit:formatINR(p.softLimit??0),n:p.daysSincePayment??p.daysSinceCredit??0,days:p.daysSinceCredit??0,typical:p.typicalRepayDays??0};
 const key=p.overLimit&&p.softLimit!=null?'nudge.udhaar.over_limit':p.stale?'nudge.udhaar.stale':p.overdue&&p.typicalRepayDays!=null?'nudge.udhaar.overdue':p.typicalRepayDays!=null?'nudge.udhaar.ok_typical':p.daysSinceCredit==null?'mobile.audit.no_credit_sales':p.daysSinceCredit===0?'mobile.audit.credit_today':'mobile.audit.credit_days';
 return <p className={'shop-hint '+(p.risk==='high'?'text-danger':p.risk==='medium'?'text-warn':'')}>{t(key,key,values)}</p>;
}
export function CheckoutSuggestions({cartApi}:{cartApi:ReturnType<typeof useCart>}) {
 const {api,shop,t,offline,premium}=useShop(),[error,setError]=useState<unknown>(null);
 const nudges=useQuery({queryKey:['checkoutSuggestions',shop?.id],enabled:!!shop&&!offline&&premium,queryFn:()=>api.getNudges(shop!.id,'checkout'),retry:false});
 const catalog=useQuery({queryKey:['catalog',shop?.id],enabled:!!shop&&!!nudges.data?.nudges.length,queryFn:()=>api.getAllInventory(shop!.id,true)});
 const ids=new Set(cartApi.cart.lines.map(l=>l.productId)),seen=new Set<string>();
 const suggestions=(nudges.data?.nudges??[]).filter(n=>n.kind==='attach'&&n.status==='open'&&n.productId&&!ids.has(n.productId)&&ids.has(String(n.action?.params?.anchorProductId??n.evidence?.anchorProductId??''))).sort((a,b)=>(b.evidence?.supportPct??0)-(a.evidence?.supportPct??0)).filter(n=>{if(seen.has(n.productId!))return false;seen.add(n.productId!);return true;}).map(n=>catalog.data?.find(i=>i.productId===n.productId)).filter(item=>item&&item.product.sellingPrice!=null&&item.product.isActive!==false&&(item.product.trackStock===false||item.quantity-(item.reservedQuantity??0)>=1)).slice(0,3);
 if(!suggestions.length)return null;
 return <details className="checkout-adjustments"><summary>{t('modal.product_detail.bought_with','Often bought with')}<span aria-hidden="true">＋</span></summary><Notice error={error}/><div className="checkout-suggestions">{suggestions.map(item=>item?<Button key={item.productId} tone="ghost" onClick={()=>{try{const result=cartApi.addProduct(item,1);if(result.message)setError(Error(t('checkoutweb.item_review','Review this item on the Sell page before adding it.')));else setError(null);}catch(e){setError(e)}}}><ProductImageById productId={item.productId} name={item.product.name} size={32}/><span>{item.product.name}<small>{formatINR(item.product.sellingPrice!)} / {item.unit}</small></span><span aria-hidden="true">＋</span></Button>:null)}</div></details>;
}
