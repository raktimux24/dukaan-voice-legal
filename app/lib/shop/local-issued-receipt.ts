import {calculateTax} from './gst-core/gst';
import {canonicalJson,canonicalSaleRequest} from './gst-core/sale-request-canonical';
import {sha256,type Scope,type RetainedRequest} from './gst-storage';
import {verifyLocalFiscalReceipt} from './local-fiscal-receipt';
import type {CreateSalePayload} from './types';
export type LocalOrdinaryReceipt={format:'local_ordinary_receipt_v1';actorId:string;shopId:string;requestId:string;requestHash:string;issuedAt:string;items:CreateSalePayload['items'];payments:CreateSalePayload['payments'];note:CreateSalePayload['note'];customer:CreateSalePayload['customer'];subtotal:number;discount:number;total:number};
const fail=():never=>{throw Error('The saved document could not be verified.');};
export async function buildLocalOrdinaryReceipt(scope:Scope,p:CreateSalePayload):Promise<LocalOrdinaryReceipt>{
 if(p.gstContext||p.roundingGrant||p.roundingSnapshot||p.items.some(i=>i.rsp)||!p.clientId||!p.items.length||!Number.isFinite(Date.parse(p.soldAt)))return fail();
 if(p.items.some(i=>!i.productId||!i.name?.trim()||!i.unit?.trim()||!Number.isFinite(i.quantity)||i.quantity<=0||Math.round(i.quantity*1000)/1000!==i.quantity||!Number.isFinite(i.price)||i.price!<0))return fail();
 const totals=calculateTax(p.items.map(i=>({quantity:i.quantity,price:i.price!,listPrice:i.listPrice,discount:i.discount})),p.discountAmount??0,null);
 if(!p.payments.length||p.payments.some(x=>!['cash','upi','card','credit'].includes(x.method)||!Number.isFinite(x.amount)||x.amount<0||Math.round(x.amount*100)/100!==x.amount)||p.payments.reduce((sum,x)=>sum+Math.round(x.amount*100),0)!==Math.round(totals.total*100))return fail();
 return {format:'local_ordinary_receipt_v1',...scope,requestId:p.clientId,requestHash:await sha256(canonicalSaleRequest({...p,userId:scope.actorId})),issuedAt:p.soldAt,items:structuredClone(p.items),payments:structuredClone(p.payments),note:p.note??null,customer:p.customer??null,subtotal:totals.subtotal,discount:totals.discount,total:totals.total};
}
export function hasLocalIssuedReceipt(row:RetainedRequest){return !!(row.verification?.localFiscalReceipt||row.verification?.localOrdinaryReceipt);}
export async function verifyLocalIssuedReceipt(row:RetainedRequest,scope:Scope){
 if(row.verification?.localFiscalReceipt)return {kind:'fiscal' as const,receipt:await verifyLocalFiscalReceipt(row,scope)};
 if(row.actorId!==scope.actorId||row.shopId!==scope.shopId||row.path!==`/api/shops/${scope.shopId}/sales`||row.state==='closed')return fail();
 const saved=row.verification?.localOrdinaryReceipt as LocalOrdinaryReceipt|undefined;
 if(!saved||saved.requestId!==row.id)return fail();
 const expected=await buildLocalOrdinaryReceipt(scope,row.payload as CreateSalePayload);
 if(canonicalJson(saved)!==canonicalJson(expected))return fail();
 return {kind:'ordinary' as const,receipt:expected};
}
