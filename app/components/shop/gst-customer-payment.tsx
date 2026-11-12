'use client';
import {useEffect,useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useShop} from './context';
import {Button,Card,Field,SegmentedControl,inputClass} from './ui';
import {useGstAction,useGstPages,useGstQuery,More,ReadState} from './gst-workspace';
import {financialScope,retainedRequests,assertScope} from '../../lib/shop/gst-storage';
import {recoverFinancialRequest} from '../../lib/shop/gst-recovery';
import {validSavedCustomerPaymentShape} from '../../lib/shop/gst-core/financial-request-shape';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import {formatINR} from '../../lib/shop/money';

/** Repayment form. Like the phone app: the balance owed shows as a hint in an empty amount box, Cash or UPI only, and a "received" message after saving. */
export function GstCustomerPayment({customerId,balance,onRecorded}:{customerId:string;balance?:number;onRecorded?:()=>void}){
 const {api,shop,t,offline}=useShop(),action=useGstAction(),qc=useQueryClient();
 const label=(key:string,vars?:Record<string,string|number>)=>t(key,EN_FALLBACK[key],vars);
 // The amount starts empty, as on the phone: one press must never record the whole balance.
 const [typed,setAmount]=useState<string|null>(null),[method,setMethod]=useState('cash'),[note,setNote]=useState(''),[amounts,setAmounts]=useState<Record<string,string>>({}),[done,setDone]=useState('');
 const owed=balance!=null&&balance>0?balance:0,amount=typed??'';
 const path=`/api/shops/${shop?.id}/customers/${customerId}/payments`;
 const journal=useGstQuery(['customer-payment-pending',customerId],async()=> (await retainedRequests(financialScope(shop!.id))).filter(row=>row.path===path&&row.state==='pending'),true,'always');
 const bills=useGstPages(['credit-invoices',customerId],cursor=>api.gst.creditInvoices(shop!.id,customerId,cursor));
 const pending=journal.data?.[0],rows=bills.data?.pages.flatMap(page=>page.items)??[];
 useEffect(()=>{if(pending&&validSavedCustomerPaymentShape(pending.payload)){const p=pending.payload as Parameters<typeof api.gst.recordCustomerPayment>[2];setAmount(String(p.amount));setMethod(p.method);setNote(p.note??'');setAmounts(Object.fromEntries((p.allocations??[]).map(row=>[row.saleId,String(row.amount)])));}},[pending]);
 const allocations=Object.entries(amounts).filter(([,value])=>value.trim()).map(([saleId,value])=>({saleId,amount:Number(value)}));
 const money=(value:string)=>/^\d+(\.\d{1,2})?$/.test(value)&&Number(value)>0&&Number(value)<=9999999999.99;
 const valid=money(amount)&&allocations.length<=100&&allocations.every(row=>money(amounts[row.saleId])&&row.amount<=Number(rows.find(b=>b.id===row.saleId)?.remainingCredit??0))&&allocations.reduce((sum,row)=>sum+Math.round(row.amount*100),0)<=Math.round(Number(amount)*100);
 // Preview only, in whole paise. The server works out the real balance.
 const afterPaise=balance!=null&&money(amount)?Math.round(balance*100)-Math.round(Number(amount)*100):null;
 const after=afterPaise==null?'':afterPaise>0?t('customerweb.balance_after_payment','Balance after this payment: {{amount}}',{amount:formatINR(afterPaise/100)}):afterPaise===0?t('customerweb.payment_clears','This clears the full balance.'):t('customerweb.payment_advance','{{amount}} will be kept as advance',{amount:formatINR(-afterPaise/100)});
 // Card is hidden like on the phone app; it shows only to finish a saved card payment.
 const methods=['cash','upi',...(method==='card'?['card']:[])].map(id=>({id,label:label(`pos.method.${id}`)}));
 async function submit(){
  const scope=financialScope(shop!.id),received=Number(amount);setDone('');
  try{
   if(pending)await recoverFinancialRequest(api,shop!.id,pending);
   else await api.gst.recordCustomerPayment(shop!.id,customerId,{clientId:crypto.randomUUID(),amount:Number(amount),method,note:note.trim()||undefined,allocations});
   assertScope(scope);setAmount('');setNote('');setAmounts({});setMethod('cash');
   setDone(label('customers.payment_recorded',{amount:formatINR(received)}));onRecorded?.();
   await qc.invalidateQueries({queryKey:['customer',shop!.id,customerId]});
   await qc.invalidateQueries({queryKey:['customers',shop!.id]});
   await qc.invalidateQueries({queryKey:['customers-summary',shop!.id]});
   await Promise.all(['customerCredit','followup','followups'].map(k=>qc.invalidateQueries({queryKey:[k,shop!.id]})));
  }finally{await journal.refetch();}
 }
 return <Card className="grid gap-3">{action.notice}
 {done&&!action.error?<p role="status" className="gst-action-success customer-payment-done">{done}</p>:null}
 <ReadState query={journal}>{pending?<p className="shop-hint">{label('customers.collection_pending')}</p>:null}
 <fieldset className="grid gap-3" disabled={offline||action.busy||!!pending||!journal.isSuccess}>
 <Field label={label('bill.amount')}><input className={inputClass} inputMode="decimal" value={amount} placeholder={owed>0?owed.toFixed(2):'0'} onChange={e=>{setAmount(e.target.value);setDone('');}}/></Field>
 {after?<p className="customer-payment-after" aria-live="polite">{after}</p>:null}
 {owed>0&&amount!==owed.toFixed(2)?<Button tone="quiet" onClick={()=>{setAmount(owed.toFixed(2));setDone('');}}>{t('customerweb.full_amount','Full {{amount}}',{amount:formatINR(owed)})}</Button>:null}
 <div className="customer-payment-methods"><SegmentedControl label={label('checkout.payment_method')} options={methods} value={method} onChange={setMethod}/></div>
 <Field label={label('checkout.add_note')}><input className={inputClass} value={note} onChange={e=>setNote(e.target.value)}/></Field>
 <details><summary>{label('customers.match_bills')}</summary><p className="shop-hint">{label('customers.match_bills_help')}</p><ReadState query={bills}>{rows.map(row=><Field key={row.id} label={`#${row.saleNumber} · ${label('customers.bill_unmatched',{amount:formatINR(Number(row.remainingCredit))})}`}><input aria-label={`${label('customers.match_amount')} #${row.saleNumber}`} className={inputClass} inputMode="decimal" value={amounts[row.id]??''} onChange={e=>setAmounts({...amounts,[row.id]:e.target.value})}/></Field>)}<More query={bills}/></ReadState></details>
 </fieldset>
 <Button disabled={offline||action.busy||!journal.isSuccess||(!pending&&!valid)} onClick={()=>void action.run(submit)}>{pending?label('common.retry'):label('customers.record_payment')}</Button>
 </ReadState></Card>;
}
