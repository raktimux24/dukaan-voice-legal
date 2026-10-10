import {readPending,writePending,type PendingSale} from './cart';
import {calculateTax} from './gst-core/gst';
import {canonicalJson} from './gst-core/sale-request-canonical';
import {ordinaryDocumentType} from './ordinary-document-type';
import {assertScope,financialScope,readState,retainedRequests,withFinancialLock,writeState} from './gst-storage';

/** Only this deterministic backend rejection proves an old draft was never issuable.
 * Never release valid, reserved, journalled, or uncertain checkout identities. */
export async function releaseRejectedMixedCheckout(shopId:string,expected:PendingSale):Promise<boolean>{
 const scope=financialScope(shopId);
 return withFinancialLock(scope,async()=>{
  const current=readPending(scope.actorId,shopId);
  if(!current||canonicalJson(current)!==canonicalJson(expected))return false;
  const p=current.payload,c=p.gstContext;
  if(p.clientId!==current.clientId||!c||c.settings.registration!=='regular'||!c.buyer?.gstin||c.allocation||!p.items.length||p.items.some(i=>i.rsp))return false;
  let rejected=false;
  try{ordinaryDocumentType(c,calculateTax(p.items.map(i=>({quantity:i.quantity,price:i.price??0,listPrice:i.listPrice,discount:i.discount,tax:i.gstConfig})),p.discountAmount??0,c));}
  catch(e){rejected=e instanceof Error&&e.message==='mixed_b2b_document_not_supported';}
  if(!rejected)return false;
  if((await retainedRequests(scope)).some(row=>row.id===current.clientId))return false;
  const allocation=await readState<{pending?:{clientId?:string}}>(`allocation:${scope.actorId}:${shopId}`);
  if(allocation?.pending?.clientId===current.clientId)return false;
  assertScope(scope);
  const key=`checkout-rejected:${scope.actorId}:${shopId}:${current.clientId}`;
  const archive={format:'unissued_checkout_rejection_v1',...scope,code:'mixed_b2b_document_not_supported',checkout:current};
  const saved=await readState(key);
  if(saved&&canonicalJson(saved)!==canonicalJson(archive))return false;
  await writeState(key,archive);
  if(canonicalJson(await readState(key))!==canonicalJson(archive))throw Error('Could not verify the saved checkout. Check browser storage and retry.');
  assertScope(scope);
  if(canonicalJson(readPending(scope.actorId,shopId))!==canonicalJson(current))return false;
  writePending(scope.actorId,shopId,null);
  if(readPending(scope.actorId,shopId)!==null)throw Error('Could not verify the saved checkout. Check browser storage and retry.');
  return true;
 });
}
