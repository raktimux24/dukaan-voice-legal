import {canonicalJson} from './sale-request-canonical';
import {verifyPayableRoundingSnapshot} from './payable-rounding-snapshot';
import {validSavedSaleReturnShape} from './financial-request-shape';
type Input={requestId?:string;items:{saleItemId:string;quantity:number;restock?:boolean;reason?:string|null}[];refundMethod?:string|null;reason?:string|null;settlement?:{creditReduction:number;moneyRefund:number;method:string;evidenceReference?:string}};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const uuid=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
const cents=(v:number)=>{const n=Math.round(v*100);return Number.isFinite(v)&&v>=0&&Number.isSafeInteger(n)&&Math.abs(v*100-n)<0.000001?n:null;};
const same=(a:unknown,b:unknown):boolean=>a===b||Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>same(v,b[i]))||object(a)&&object(b)&&Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.prototype.hasOwnProperty.call(b,k)&&same(a[k],b[k]));
export function confirmedSaleReturn(result:unknown,shop:string,actor:string,saleId:string,input:Input,total:number){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!object(result)||result.status!=='recorded'||!object(result.record)||!object(result.sale)||!Number.isFinite(total)||total<0)return fail();
 if(!validSavedSaleReturnShape({saleId,body:input,total})||!input.items.length||new Set(input.items.map(i=>i.saleItemId)).size!==input.items.length)return fail();
 try{result=structuredClone(result);}catch{return fail();}
 const {record,sale}=result as {record:Record<string,unknown>;sale:Record<string,unknown>};
 // A disabled rollout blocks new returns, but must not strand an already
 // verified recorded return. All other planning failures retain the request.
 let roundedRecorded=false;
 if(sale.roundingEvidence!==undefined&&sale.roundingEvidence!==null){
  try{
   const evidence=sale.roundingEvidence;if(!object(evidence)||Object.keys(evidence).length!==4||Object.keys(evidence).some(key=>!['document','snapshot','hash','hashVersion'].includes(key))||evidence.hashVersion!=='canonical_json_v1'||typeof evidence.hash!=='string'||!/^[a-f0-9]{64}$/.test(evidence.hash)||!object(evidence.document)||Object.keys(evidence.document).length!==2||evidence.document.saleId!==saleId)return fail();
   const ordinary=object(sale.gstSnapshot)?sale.gstSnapshot:null,mixed=object(sale.mixedGstSnapshot)?sale.mixedGstSnapshot:null;
   const totals=ordinary&&object(ordinary.totals)?ordinary.totals:null,invoice=mixed&&object(mixed.invoice)?mixed.invoice:null;
   const context=mixed&&object(mixed.context)?mixed.context:null,allocation=context&&object(context.allocation)?context.allocation:null;
   const before=totals?totals.total:invoice?.payable,number=ordinary?ordinary.invoiceNumber:allocation?.number;
   if(evidence.document.number!==number||typeof sale.soldAt!=='string'||(typeof before!=='number'&&typeof before!=='string')||cents(Number(before))===null||typeof before==='string'&&!/^\d+\.\d{2}$/.test(before))return fail();
   const snapshot=verifyPayableRoundingSnapshot(evidence.snapshot,{shopId:shop,issuedAt:sale.soldAt,before:Number(before).toFixed(2)});
   if(typeof sale.total!=='number'||cents(sale.total)===null||sale.total.toFixed(2)!==snapshot.calculation.payable||sale.gstIntegrity!=='verified')return fail();
   roundedRecorded=true;
  }catch{return fail();}
 }
 if((sale.gstSnapshot||sale.mixedGstSnapshot)&&(sale.gstIntegrity!=='verified'||sale.returnPlanningError&&!(sale.mixedGstSnapshot&&sale.returnPlanningError==='mixed_return_integration_pending')&&!(roundedRecorded&&sale.returnPlanningError==='rounded_return_integration_pending')))return fail();
 if(sale.gstSnapshot&&sale.mixedGstSnapshot)return fail();
 if(typeof record.createdAt!=='string'||!Number.isFinite(Date.parse(record.createdAt))||!Array.isArray(sale.returns)||sale.returns.filter(row=>object(row)&&row.id===record.id).length!==1)return fail();
 if(!uuid(record.id)||record.shopId!==shop||record.saleId!==saleId||record.createdBy!==actor||record.requestId!==input.requestId||!uuid(input.requestId)||sale.id!==saleId||sale.shopId!==shop||record.refundAmount!==total.toFixed(2)||record.reason!==(input.reason?.trim()||null)||!Array.isArray(record.items)||record.items.length!==input.items.length||!Array.isArray(sale.returns))return fail();
 const seen=new Set<string>();for(const row of record.items){if(!object(row)||typeof row.saleItemId!=='string'||seen.has(row.saleItemId))return fail();seen.add(row.saleItemId);const saved=input.items.find(i=>i.saleItemId===row.saleItemId);if(!saved||row.quantity!==saved.quantity||row.restock!==(saved.restock!==false)||(typeof row.reason==='string'?row.reason.trim()||null:row.reason)!==(saved.reason?.trim()||null))return fail();}
 const retained=sale.returns.find(row=>object(row)&&row.id===record.id);if(!object(retained)||retained.createdBy!==actor||retained.refundAmount!==total)return fail();
 for(const field of ['creditNoteNumber','settlement','items','refundMethod','reason','createdAt'])if(!same(retained[field],record[field]))return fail();
 for(const field of ['netAmount','taxAmount'])if(retained[field]!== (record[field]==null?null:Number(record[field])))return fail();
 if(cents(total)===null)return fail();
 if(input.settlement){const original=input.settlement,creditCents=cents(original.creditReduction),moneyCents=cents(original.moneyRefund);if(creditCents===null||moneyCents===null||creditCents+moneyCents!==cents(total)||!object(record.settlement)||record.settlement.version!==1||record.refundMethod!==(moneyCents>0?original.method:'credit')||record.settlement.creditReduction!==original.creditReduction.toFixed(2)||record.settlement.moneyRefund!==original.moneyRefund.toFixed(2)||record.settlement.method!==original.method||record.settlement.evidenceReference!==(original.evidenceReference?.trim()||null)||record.settlement.total!==record.refundAmount)return fail();}
 else if(input.refundMethod&&record.refundMethod!==input.refundMethod)return fail();
 const credit=input.settlement?.creditReduction??(record.refundMethod==='credit'?total:0),money=input.settlement?.moneyRefund??(record.refundMethod==='credit'?0:total);
 if(total>0&&record.financialEvidenceVersion!==1)return fail();
 if(record.financialEvidenceVersion===1&&(credit>0?!uuid(record.creditLedgerId):record.creditLedgerId!==null))return fail();
 if(record.financialEvidenceVersion===1&&(money>0?!uuid(record.refundPaymentId):record.refundPaymentId!==null))return fail();
 return sale;
}

/** Native digest verifies invoice evidence before a retained return can be released. */
export async function confirmedSaleReturnReceipt(result:unknown,shop:string,actor:string,saleId:string,input:Input,total:number,digest:(value:string)=>Promise<string>){
 const sale=confirmedSaleReturn(result,shop,actor,saleId,input,total);
 if(object(sale.roundingEvidence)){
  const evidence=sale.roundingEvidence;
  if(await digest(canonicalJson({document:evidence.document,snapshot:evidence.snapshot}))!==evidence.hash)throw Error('purchase_request_outcome_unconfirmed');
 }
 return sale;
}
