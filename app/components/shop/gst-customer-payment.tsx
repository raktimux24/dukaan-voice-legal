'use client';
import {useEffect,useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useShop} from './context';
import {Button,Card,Field,inputClass} from './ui';
import {useGstAction,useGstPages,useGstQuery,More,ReadState} from './gst-workspace';
import {financialScope,retainedRequests,assertScope} from '../../lib/shop/gst-storage';
import {recoverFinancialRequest} from '../../lib/shop/gst-recovery';
import {validSavedCustomerPaymentShape} from '../../lib/shop/gst-core/financial-request-shape';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import {formatINR} from '../../lib/shop/money';

export function GstCustomerPayment({customerId}:{customerId:string}){
 const {api,shop,t}=useShop(),action=useGstAction(),qc=useQueryClient();
 const label=(key:string,vars?:Record<string,string|number>)=>t(key,EN_FALLBACK[key],vars);
 const [amount,setAmount]=useState(''),[method,setMethod]=useState('cash'),[note,setNote]=useState(''),[amounts,setAmounts]=useState<Record<string,string>>({});
 const path=`/api/shops/${shop?.id}/customers/${customerId}/payments`;
 const journal=useGstQuery(['customer-payment-pending',customerId],async()=> (await retainedRequests(financialScope(shop!.id))).filter(row=>row.path===path&&row.state==='pending'),true,'always');
 const bills=useGstPages(['credit-invoices',customerId],cursor=>api.gst.creditInvoices(shop!.id,customerId,cursor));
 const pending=journal.data?.[0],rows=bills.data?.pages.flatMap(page=>page.items)??[];
 useEffect(()=>{if(pending&&validSavedCustomerPaymentShape(pending.payload)){const p=pending.payload as Parameters<typeof api.gst.recordCustomerPayment>[2];setAmount(String(p.amount));setMethod(p.method);setNote(p.note??'');setAmounts(Object.fromEntries((p.allocations??[]).map(row=>[row.saleId,String(row.amount)])));}},[pending]);
 const allocations=Object.entries(amounts).filter(([,value])=>value.trim()).map(([saleId,value])=>({saleId,amount:Number(value)}));
 const money=(value:string)=>/^\d+(\.\d{1,2})?$/.test(value)&&Number(value)>0&&Number(value)<=9999999999.99;
 const valid=money(amount)&&allocations.length<=100&&allocations.every(row=>money(amounts[row.saleId])&&row.amount<=Number(rows.find(b=>b.id===row.saleId)?.remainingCredit??0))&&allocations.reduce((sum,row)=>sum+Math.round(row.amount*100),0)<=Math.round(Number(amount)*100);
 async function submit(){
  const scope=financialScope(shop!.id);
  try{
   if(pending)await recoverFinancialRequest(api,shop!.id,pending);
   else await api.gst.recordCustomerPayment(shop!.id,customerId,{clientId:crypto.randomUUID(),amount:Number(amount),method,note:note.trim()||undefined,allocations});
   assertScope(scope);setAmount('');setNote('');setAmounts({});
   await qc.invalidateQueries({queryKey:['customer',shop!.id,customerId]});
   await qc.invalidateQueries({queryKey:['customers',shop!.id]});
  }finally{await journal.refetch();}
 }
 return <Card className="grid gap-3"><h2 className="shop-section-title">{label('customers.record_payment')}</h2>{action.notice}
 <ReadState query={journal}>{pending?<p className="shop-hint">{label('customers.collection_pending')}</p>:null}
 <fieldset className="grid gap-3" disabled={action.busy||!!pending||!journal.isSuccess}>
 <Field label={label('bill.amount')}><input className={inputClass} inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/></Field>
 <Field label={label('checkout.payment_method')}><select className={inputClass} value={method} onChange={e=>setMethod(e.target.value)}>{['cash','upi','card'].map(value=><option key={value} value={value}>{label(`pos.method.${value}`)}</option>)}</select></Field>
 <Field label={label('checkout.add_note')}><input className={inputClass} value={note} onChange={e=>setNote(e.target.value)}/></Field>
 <details><summary>{label('customers.match_bills')}</summary><p className="shop-hint">{label('customers.match_bills_help')}</p><ReadState query={bills}>{rows.map(row=><Field key={row.id} label={`#${row.saleNumber} · ${label('customers.bill_unmatched',{amount:formatINR(Number(row.remainingCredit))})}`}><input aria-label={`${label('customers.match_amount')} #${row.saleNumber}`} className={inputClass} inputMode="decimal" value={amounts[row.id]??''} onChange={e=>setAmounts({...amounts,[row.id]:e.target.value})}/></Field>)}<More query={bills}/></ReadState></details>
 </fieldset>
 <Button disabled={action.busy||!journal.isSuccess||(!pending&&!valid)} onClick={()=>void action.run(submit)}>{pending?label('common.retry'):label('customers.record_payment')}</Button>
 </ReadState></Card>;
}
