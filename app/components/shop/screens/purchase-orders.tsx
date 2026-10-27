'use client';
import {useEffect,useRef} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {useShop} from '../context';
import {PageHeader} from '../ui';
import {openingWebUi} from './opening-balances';
import {usePurchaseOrders,type PoStorage} from '../../../lib/shop/purchase-orders/workflow';
import {PurchaseOrdersView} from '../../../lib/shop/purchase-orders/view';
const storage:PoStorage={getItem:async k=>localStorage.getItem(k),setItem:async(k,v)=>localStorage.setItem(k,v),removeItem:async k=>localStorage.removeItem(k)};
export function PurchaseOrdersScreen(){const c=useShop();return <Editor key={c.shop?.id+':'+c.userId}/>}
function Editor(){const {api,shop,userId,perms,offline,t:translate}=useShop(),router=useRouter(),params=useSearchParams(),opened=useRef(''),t=(key:string,vars?:Record<string,string|number>)=>translate(key,key,vars);
 const w=usePurchaseOrders(api.purchaseOrders,shop?.id+':'+userId,shop?.id??'',!!shop&&!!userId&&perms.canEditProducts&&!offline,()=>crypto.randomUUID(),storage);
 const id=params.get('orderId');useEffect(()=>{if(id&&opened.current!==id&&w.ready){opened.current=id;void w.open(id)}},[id,w.ready]);
 return <div className="shop-page"><PageHeader title={t('po.title')} back={{href:'/shop/buy-list',label:t('nav.buy_list')}}/><PurchaseOrdersView w={w} ui={openingWebUi} t={t} uuid={()=>crypto.randomUUID()} initialBuyListId={params.get('buyListItemId')??undefined} initialSupplierId={params.get('supplierId')??undefined} share={async text=>{if(navigator.share){await navigator.share({title:t('po.title'),text})}else{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='purchase-order.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}} invoice={async(p,receipt)=>{const source=await api.purchaseOrders.invoice(shop!.id,p.id,receipt);if(source.lines.length)router.push('/shop/purchases/new?supplierId='+p.supplierId+'&poOrderId='+p.id+'&poReceiptId='+receipt);else if(source.invoiceIds.length)router.push('/shop/purchases/'+source.invoiceIds[0]);else throw Error('po_invoice_unavailable')}} newSupplier={()=>{window.open('/shop/suppliers','_blank','noopener')}} newProduct={()=>{window.open('/shop/products/new?qty=0','_blank','noopener')}}/></div>
}
