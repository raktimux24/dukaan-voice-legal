import {calculateTax,validateContext,financialYear,allocationNumber} from './gst-core/gst';
import {fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION} from './gst-core/fiscal-integrity';
import {mixedGstFiscalConsistent,mixedGstDocumentType} from './gst-core/mixed-gst-fiscal';
import {buildRoundedFiscalDocument} from './gst-core/payable-rounding-fiscal';
import {canonicalJson,canonicalSaleRequest} from './gst-core/sale-request-canonical';
import {fiscalRenderVersion} from './gst-core/fiscal-render-version';
import {mixedCartProjection} from './mixed-cart-projection';
import {verifyRoundedReservation} from './rounded-reservation';
import {localRoundingGrantIssue} from './rounding-grant';
import {verifyDocument} from './gst-document';
import {documentView} from './gst-document-view';
import {ordinaryDocumentType} from './ordinary-document-type';
import {sha256,type Scope,type RetainedRequest} from './gst-storage';
import type {CreateSalePayload} from './types';
import type {FiscalDocument} from './gst-types';

export type LocalFiscalReceipt={format:'local_fiscal_receipt_v1';actorId:string;shopId:string;requestId:string;requestHash:string;document:FiscalDocument};
const fail=():never=>{throw Error('The saved document could not be verified.');};
/** Construct before the atomic number/request reservation. Never use current catalog data on readback. */
export async function buildLocalFiscalReceipt(scope:Scope,input:CreateSalePayload):Promise<LocalFiscalReceipt> {
 const p=structuredClone(input),c=p.gstContext,a=c?.allocation;
 if(!c||!a||!c.issuedAt||p.soldAt!==c.issuedAt||!p.clientId||!['regular','composition'].includes(c.settings.registration)||!p.items?.length||!Array.isArray(p.payments))return fail();
 fiscalRenderVersion(c.documentRenderVersion);
 const block=parseInt(a.number.split('-')[1],36);
 if(a.financialYear!==financialYear(new Date(c.issuedAt))||a.number!==allocationNumber({financialYear:a.financialYear,block},a.index)||!/^[0-9a-f-]{36}$/i.test(a.id)||!/^[0-9a-f-]{36}$/i.test(a.deviceEpoch??''))return fail();
 if(p.items.some(i=>!i.name?.trim()||!i.unit?.trim()||!Number.isFinite(i.quantity)||i.quantity<=0))return fail();
 const identity={shopId:scope.shopId,saleId:p.clientId,issuer:c.settings.gstin,financialYear:a.financialYear,number:a.number,issuedAt:c.issuedAt,originalNumber:null};
 let payload:FiscalDocument['payload'],type:string;
 if(p.items.some(i=>i.rsp)){
  const invoice=mixedCartProjection(p.items.map((i,index)=>({...i,key:`line-${index}`,price:i.price??0,discount:i.discount??0})),c,p.discountAmount??0,p.mixedDiscountReview);
  payload={format:'samaan_mixed_fiscal_v1',context:c,invoice,items:p.items.map((i,index)=>({lineId:`line-${index}`,productId:i.productId??null,name:i.name!,unit:i.unit!,categorySnapshot:null}))};
  type=mixedGstDocumentType(invoice);
 }else{
  const totals=calculateTax(p.items.map(i=>({quantity:i.quantity,price:i.price??0,listPrice:i.listPrice,discount:i.discount,tax:i.gstConfig})),p.discountAmount??0,c);
  validateContext(c,totals.total);
  type=ordinaryDocumentType(c,totals);
  payload={renderVersion:c.documentRenderVersion,invoiceNumber:a.number,documentType:type,context:c,totals,items:p.items.map((i,index)=>({name:i.name!,unit:i.unit!,quantity:i.quantity,price:i.price??0,tax:totals.lines[index]}))};
 }
 if(type==='invoice_cum_bill_of_supply'&&c.buyer?.gstin)return fail();
 let document:FiscalDocument={...identity,type,payload,id:p.clientId,integrity:'local_retained',hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash({...identity,type,payload})};
 if(payload.format==='samaan_mixed_fiscal_v1'&&!mixedGstFiscalConsistent(document))return fail();
 if(p.roundingSnapshot){
  const quote=verifyRoundedReservation(scope.shopId,p);if(!quote||!p.roundingGrant)return fail();
  localRoundingGrantIssue(p.roundingGrant,{shopId:scope.shopId,actorId:scope.actorId,deviceEpoch:a.deviceEpoch!,allocationId:a.id,issuer:c.settings.gstin,financialYear:a.financialYear,index:a.index,number:a.number,issuedAt:c.issuedAt,policyVersion:p.roundingSnapshot.policy.version});
  if(canonicalJson(p.roundingGrant.signedGrant.grant.policy)!==canonicalJson(p.roundingSnapshot.policy))return fail();
  const rounded=buildRoundedFiscalDocument(document,p.roundingSnapshot.policy);
  document={...rounded,id:p.clientId,issuedAt:c.issuedAt,integrity:'local_retained',payload:rounded.payload as FiscalDocument['payload']};
 }else if(p.roundingGrant)return fail();
 // Reuse immutable content checks without marking local evidence as server-verified.
 await verifyDocument({...document,integrity:'verified'},scope.shopId,p.clientId);
 const view=documentView(document);
 if(p.payments.some(x=>!['cash','upi','card','credit'].includes(x.method)||!Number.isFinite(x.amount)||x.amount<0||Number(x.amount.toFixed(2))!==x.amount)||p.payments.reduce((s,x)=>s+Math.round(x.amount*100),0)!==Math.round(view.total*100))return fail();
 return {format:'local_fiscal_receipt_v1',...scope,requestId:p.clientId,requestHash:await sha256(canonicalSaleRequest({...p,userId:scope.actorId})),document};
}
/** Hash checks plus replay bind the local document to its exact durable request and actor/shop. */
export async function verifyLocalFiscalReceipt(row:RetainedRequest,scope:Scope):Promise<LocalFiscalReceipt> {
 if(row.actorId!==scope.actorId||row.shopId!==scope.shopId||row.path!==`/api/shops/${scope.shopId}/sales`||row.state==='closed')return fail();
 const saved=row.verification?.localFiscalReceipt as LocalFiscalReceipt|undefined;
 if(!saved||saved.requestId!==row.id)return fail();
 const expected=await buildLocalFiscalReceipt(scope,row.payload as CreateSalePayload);
 if(canonicalJson(expected)!==canonicalJson(saved))return fail();
 return expected;
}
