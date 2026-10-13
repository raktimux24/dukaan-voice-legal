import {calculateTax,validateContext,GstError,type GstContext,type TaxInput} from './gst';
import {projectRspInvoice} from './rsp-invoice-projection';
type RspInput=Parameters<typeof projectRspInvoice>[0][number];
export type MixedGstLine={lineId:string;kind:'ordinary';input:TaxInput}|({kind:'rsp'}&RspInput);
const cents=(value:string)=>BigInt(value.replace('.',''));
const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
/** Local-counter projection for future versioned fiscal issuance; no stock or numbering side effects. */
export function projectMixedGstInvoice(inputs:readonly MixedGstLine[],context:GstContext,billDiscount?:{amount:string;policy:'commercial_amount_proportional_v1';reviewed:true;evidenceReference:string}){
 if(!Array.isArray(inputs)||!inputs.length||inputs.length>100||!context||context.settings.registration!=='regular')throw new GstError('invalid_mixed_gst_projection');
 const ids=new Set<string>();
 for(const line of inputs){
  if(!line||!['ordinary','rsp'].includes(line.kind)||typeof line.lineId!=='string'||!line.lineId.trim()||line.lineId.length>100||ids.has(line.lineId))throw new GstError('invalid_mixed_gst_projection');
  ids.add(line.lineId);
 }
 validateContext(context,0);
 const ordinary=inputs.filter((l):l is Extract<MixedGstLine,{kind:'ordinary'}>=>l.kind==='ordinary');
 let ordinaryTotals=calculateTax(ordinary.map(l=>l.input),0,context);
 let rspInputs=inputs.filter((l):l is Extract<MixedGstLine,{kind:'rsp'}>=>l.kind==='rsp');
 for(const line of rspInputs){
  const rates=line.profile.rates,union=['04','26','31','35','38'].includes(context.settings.stateCode);
  if(rates.igst!==0||union&&(rates.sgst!==0||rates.cgst!==rates.utgst)||!union&&(rates.utgst!==0||rates.cgst!==rates.sgst))throw new GstError('rsp_jurisdiction_mismatch');
  if(!context.issuedAt||Date.parse(line.transaction.valuation.supplyAt)!==Date.parse(context.issuedAt))throw new GstError('rsp_supply_time_mismatch');
 }
 let rsp=rspInputs.length?projectRspInvoice(rspInputs):null;
 const allocations=new Map<string,bigint>();
 if(billDiscount){
  if(billDiscount.policy!=='commercial_amount_proportional_v1'||billDiscount.reviewed!==true||typeof billDiscount.evidenceReference!=='string'||!billDiscount.evidenceReference.trim()||typeof billDiscount.amount!=='string'||!/^\d{1,9}(?:\.\d{1,2})?$/.test(billDiscount.amount))throw new GstError('invalid_mixed_bill_discount');
  const [whole,fraction='']=billDiscount.amount.split('.'),requested=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  const weights=inputs.map((line,index)=>({lineId:line.lineId,index,value:line.kind==='ordinary'?cents((ordinaryTotals.lines[ordinary.findIndex(l=>l.lineId===line.lineId)].gross-ordinaryTotals.lines[ordinary.findIndex(l=>l.lineId===line.lineId)].discount).toFixed(2)):cents(rsp!.lines.find(l=>l.lineId===line.lineId)!.calculation.commercial.netSaleValue)}));
  const available=weights.reduce((sum,w)=>sum+w.value,0n);
  if(requested>available)throw new GstError('mixed_bill_discount_exceeds_value');
  const shares=weights.map(w=>({...w,amount:available?requested*w.value/available:0n,remainder:available?requested*w.value%available:0n}));
  const ordered=[...shares].sort((a,b)=>a.remainder>b.remainder?-1:a.remainder<b.remainder?1:a.index-b.index);
  const residual=requested-shares.reduce((sum,w)=>sum+w.amount,0n);
  for(let i=0;i<Number(residual);i++)ordered[i].amount++;
  shares.forEach(w=>allocations.set(w.lineId,w.amount));
  ordinaryTotals=calculateTax(ordinary.map(l=>({...l.input,discount:Number(decimal(cents((l.input.discount??0).toFixed(2))+(allocations.get(l.lineId)??0n)))})),0,context);
  rspInputs=rspInputs.map(l=>({...l,transaction:{...l.transaction,discount:decimal((()=>{const [whole,fraction='']=l.transaction.discount.split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));})()+(allocations.get(l.lineId)??0n))}}));
  rsp=rspInputs.length?projectRspInvoice(rspInputs):null;
 }

 const total=(ordinaryValue:number,rspValue:string)=>decimal(cents(ordinaryValue.toFixed(2))+cents(rspValue));
 const net=total(ordinaryTotals.net,rsp?.commercial.netSaleValue??'0.00'),tax=total(ordinaryTotals.tax,rsp?.statutory.tax??'0.00'),payable=total(ordinaryTotals.total,rsp?.payable??'0.00');
 validateContext(context,Number(payable));
 return {format:'samaan_mixed_gst_projection_v1' as const,lines:inputs.map(line=>line.kind==='ordinary'?{lineId:line.lineId,kind:line.kind,quantity:line.input.quantity,tax:ordinaryTotals.lines[ordinary.findIndex(l=>l.lineId===line.lineId)]}:{lineId:line.lineId,kind:line.kind,evidence:rsp!.lines.find(l=>l.lineId===line.lineId)!}),
  billDiscount:billDiscount?{...billDiscount,allocations:inputs.map(l=>({lineId:l.lineId,amount:decimal(allocations.get(l.lineId)??0n)}))}:null,net,tax,payable,reportingTaxableValue:total(ordinaryTotals.taxable,rsp?.reporting.taxableValue??'0.00'),components:Object.fromEntries(['cgst','sgst','utgst','igst'].map(key=>[key,total(ordinaryTotals[key as 'cgst'],rsp?.statutory.components[key]??'0.00')])),payableRoundOff:'0.00'};
}
