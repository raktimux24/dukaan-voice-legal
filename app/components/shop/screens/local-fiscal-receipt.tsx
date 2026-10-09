"use client";
import {useShop} from '../context';
import {PageHeader,Card,Button} from '../ui';
import {useGstQuery,ReadState,useGstAction} from '../gst-workspace';
import {useGstText} from '../gst-ui';
import {FiscalDocumentArticle} from '../gst-documents';
import {financialScope,retainedRequests,assertScope} from '../../../lib/shop/gst-storage';
import {verifyLocalFiscalReceipt} from '../../../lib/shop/local-fiscal-receipt';
import {documentView} from '../../../lib/shop/gst-document-view';
import {recoverFinancialRequest} from '../../../lib/shop/gst-recovery';
import type {CreateSalePayload,Sale} from '../../../lib/shop/types';
export function LocalFiscalReceiptScreen({requestId}:{requestId:string}) {
 const {api,shop,offline}=useShop(),text=useGstText(),action=useGstAction();
 const q=useGstQuery(['local-fiscal-receipt',requestId],async()=>{
  const scope=financialScope(shop!.id);
  const row=(await retainedRequests(scope)).find(row=>row.id===requestId);
  if(!row)throw Error('This request does not belong to the active account and shop.');
  const receipt=await verifyLocalFiscalReceipt(row,scope);assertScope(scope);
  return {row,receipt,view:documentView(receipt.document)};
 },true,'always');
 const saved=q.data,confirmed=saved?.row.state==='confirmed'?(saved.row.result as Sale|undefined):undefined;
 return <div className="shop-page">
  <PageHeader title={text('Saved bill')} back={{href:'/shop/settings/gst/recovery',label:text('Device bill recovery')}}/>
  {action.notice}
  <ReadState query={q} empty={!saved}>
   {saved?<>
    <Card>
     <p className="shop-section-title">{text(confirmed?'Confirmed':'Saved locally · awaiting synchronization')}</p>
     {!confirmed?<p className="shop-hint">{text('This bill keeps its original number and issue time. Server confirmation is pending.')}</p>:null}
     <div className="shop-actions">
      {confirmed?.id?<Button href={`/shop/sales/${confirmed.id}`}>{text('Review saved bill')}</Button>:<Button disabled={offline||action.busy} onClick={()=>void action.run(async()=>{await recoverFinancialRequest(api,shop!.id,saved.row);await q.refetch();})}>{text('Recover original request')}</Button>}
     </div>
    </Card>
    <FiscalDocumentArticle doc={saved.receipt.document} view={saved.view} local={!confirmed} payments={(saved.row.payload as CreateSalePayload).payments}/>

   </>:null}
  </ReadState>
 </div>;
}
