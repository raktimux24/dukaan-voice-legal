"use client";
import {useShop} from '../context';
import {PageHeader,Card,Button} from '../ui';
import {useGstQuery,ReadState,useGstAction} from '../gst-workspace';
import {useGstText} from '../gst-ui';
import {FiscalDocumentArticle} from '../gst-documents';
import {financialScope,retainedRequests,assertScope} from '../../../lib/shop/gst-storage';
import {verifyLocalIssuedReceipt,type LocalOrdinaryReceipt} from '../../../lib/shop/local-issued-receipt';
import {formatINR} from '../../../lib/shop/money';
import {formatQty} from '../../../lib/shop/units';
import {useShopDates} from '../use-shop-dates';
import {documentView} from '../../../lib/shop/gst-document-view';
import {recoverFinancialRequest} from '../../../lib/shop/gst-recovery';
import type {CreateSalePayload,Sale} from '../../../lib/shop/types';
export function LocalFiscalReceiptScreen({requestId}:{requestId:string}) {
 const {api,shop,offline}=useShop(),text=useGstText(),action=useGstAction();
 const q=useGstQuery(['local-fiscal-receipt',requestId],async()=>{
  const scope=financialScope(shop!.id);
  const row=(await retainedRequests(scope)).find(row=>row.id===requestId);
  if(!row)throw Error('This request does not belong to the active account and shop.');
  const receipt=await verifyLocalIssuedReceipt(row,scope);assertScope(scope);
  return {row,receipt,view:receipt.kind==='fiscal'?documentView(receipt.receipt.document):null};
 },true,'always');
 const saved=q.data,confirmed=saved?.row.state==='confirmed'?(saved.row.result as Sale|undefined):undefined;
 return <div className="shop-page">
  <PageHeader title={text('Saved bill')} back={{href:'/shop/settings/gst/recovery',label:text('Device bill recovery')}}/>
  {action.notice}
  <ReadState query={q} empty={!saved}>
   {saved?<>
    <Card>
     <p className="shop-section-title">{text(confirmed?'Confirmed':'Saved locally · awaiting synchronization')}</p>
     {!confirmed&&saved.receipt.kind==='fiscal'?<p className="shop-hint">{text('This bill keeps its original number and issue time. Server confirmation is pending.')}</p>:null}
     <div className="shop-actions">
      {confirmed?.id?<Button href={`/shop/sales/${confirmed.id}`}>{text('Review saved bill')}</Button>:<Button disabled={offline||action.busy} onClick={()=>void action.run(async()=>{await recoverFinancialRequest(api,shop!.id,saved.row);await q.refetch();})}>{text('Recover original request')}</Button>}
     </div>
    </Card>
    {saved.receipt.kind==='fiscal'&&saved.view?<FiscalDocumentArticle doc={saved.receipt.receipt.document} view={saved.view} local={!confirmed} payments={(saved.row.payload as CreateSalePayload).payments}/>:saved.receipt.kind==='ordinary'?<OrdinaryReceipt receipt={saved.receipt.receipt} pending={!confirmed}/>:null}

   </>:null}
  </ReadState>
 </div>;
}

function OrdinaryReceipt({receipt,pending}:{receipt:LocalOrdinaryReceipt;pending:boolean}){
 const {shop}=useShop(),text=useGstText(),{formatWhen}=useShopDates();
 return <>
 <div className="shop-actions no-print"><Button onClick={()=>window.print()}>{text('PDF')}</Button></div>
 <article className="receipt">
  <header className="receipt-head"><p className="receipt-shop">{shop?.name}</p><p>{formatWhen(receipt.issuedAt)}</p></header>
  <p className="receipt-status">{text(pending?'Saved locally · awaiting synchronization':'Confirmed')}</p>
  <p className="receipt-meta">{`S-${receipt.requestId.replace(/-/g,'').slice(-4).toUpperCase()}`}</p>
  {receipt.customer?.name?<p className="receipt-customer">{receipt.customer.name}</p>:null}
  <ul className="receipt-lines">{receipt.items.map((item,index)=><li key={index}><div><p>{item.name}</p><p className="receipt-qty">{formatQty(item.quantity,item.unit??'')} × {formatINR(item.price)}</p></div><b>{formatINR(Math.max(0,Math.round((item.quantity*(item.price??0)-(item.discount??0))*100)/100))}</b></li>)}</ul>
  <dl className="receipt-totals"><div><dt>{text('Subtotal')}</dt><dd>{formatINR(receipt.subtotal)}</dd></div><div><dt>{text('Discount')}</dt><dd>{formatINR(receipt.discount)}</dd></div><div className="is-total"><dt>{text('Total')}</dt><dd>{formatINR(receipt.total)}</dd></div></dl>
  {receipt.payments.map((p,index)=><p key={index}>{text(({cash:'Cash',upi:'UPI',card:'Card',credit:'Udhaar'} as Record<string,string>)[p.method])} · {formatINR(p.amount)}</p>)}
  {receipt.note?<p>{receipt.note}</p>:null}
 </article></>;
}
