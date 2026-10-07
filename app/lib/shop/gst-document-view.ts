import type { FiscalDocument, GstContext, LineTax } from './gst-types';
import { mixedGstFiscalConsistent, type MixedFiscalPayload } from './gst-core/mixed-gst-fiscal';
import { mixedCreditConsistent, type MixedCreditPayload } from './gst-core/mixed-credit-fiscal';
import { roundedFiscalConsistent, type RoundedFiscalPayload } from './gst-core/payable-rounding-fiscal';
import { roundedCreditConsistent, type RoundedCreditPayload } from './gst-core/payable-rounding-credit-fiscal';
import { ordinaryCreditConsistent, type OrdinaryCreditPayload } from './gst-core/ordinary-credit-fiscal';
import { fiscalLineParticulars } from './gst-core/fiscal-line-particulars';
import type { FiscalEnvelope, FiscalHashRecord } from './gst-core/fiscal-integrity';
type Signed = FiscalEnvelope & FiscalHashRecord;
export type DocumentLine = {name:string;quantity:number;unit:string;classification:string;rate:string;net:number;taxable:number;tax:number;total:number;discount:number;components:Record<string,number>};
export type DocumentView = {context:GstContext;lines:DocumentLine[];net:number;tax:number;taxable:number;total:number;roundOff:number;components:Record<string,number>;reason?:string;creditReduction?:number;moneyRefund?:number};
const invalid=():never=>{throw Error('This saved document has incomplete or inconsistent fiscal details.');};
function ordinaryLine(item:{name:string;unit:string;quantity:number;tax:LineTax}):DocumentLine {
 const p=fiscalLineParticulars(item.tax);
 return {name:item.name,unit:item.unit,quantity:item.quantity,classification:p.classification,rate:String(p.rate)+'%',net:p.net,taxable:p.taxable,tax:p.tax,total:item.tax.total,discount:p.discount,components:{CGST:item.tax.cgst,SGST:item.tax.sgst,UTGST:item.tax.utgst,IGST:item.tax.igst}};
}
function mixedLines(p:MixedFiscalPayload):DocumentLine[]{
 if(!p.items||p.items.length!==p.invoice.lines.length)return invalid();
 return p.invoice.lines.map((line,index)=>{
  const item=p.items![index];
  if(!item||item.lineId!==line.lineId)return invalid();
  if(line.kind==='ordinary')return ordinaryLine({...item,quantity:line.quantity!,tax:line.tax!});
  const e=line.evidence!,c=e.calculation;
  return {name:item.name,unit:item.unit,quantity:c.basis.rsp.packageCount,classification:`HSN ${e.profile.goods.hsn} · RSP`,rate:Object.entries(e.profile.rates).filter(([k,v])=>['cgst','sgst','utgst','igst'].includes(k)&&Number(v)>0).map(([k,v])=>`${k.toUpperCase()} ${v}%`).join(' · '),net:Number(c.commercial.netSaleValue),taxable:Number(c.reporting.taxableValue),tax:Number(c.statutory.tax),total:Number(c.payable),discount:Number(c.commercial.discount),components:Object.fromEntries(Object.entries(c.statutory.components).map(([k,v])=>[k.toUpperCase(),Number(v)]))};
 });
}
function summed(context:GstContext,lines:DocumentLine[]):DocumentView {
 const sum=(key:'net'|'tax'|'taxable'|'total')=>Math.round(lines.reduce((s,l)=>s+l[key],0)*100)/100;
 return {context,lines,net:sum('net'),tax:sum('tax'),taxable:sum('taxable'),total:sum('total'),roundOff:0,components:Object.fromEntries(['CGST','SGST','UTGST','IGST'].map(k=>[k,Math.round(lines.reduce((s,l)=>s+(l.components[k]??0),0)*100)/100]))};
}
/** Call only after verifying the outer immutable hash. Replay special tax and rounding contracts. */
export function documentView(doc: FiscalDocument | Signed):DocumentView {
 const p=doc.payload as Record<string,unknown>,signed=doc as Signed;
 if(p.format==='samaan_rounded_fiscal_v1'){
  if(!roundedFiscalConsistent(signed))return invalid();
  const v=p as unknown as RoundedFiscalPayload,base=documentView(v.originalInvoice);
  return {...base,total:Number(v.finalPayable),roundOff:Number(v.finalPayable)-base.total};
 }
 if(p.format==='samaan_rounded_credit_v1'){
  const v=p as unknown as RoundedCreditPayload;
  if(!roundedCreditConsistent(signed,v.original,v.rounding.request))return invalid();
  const base=documentView(v.taxCredit);
  return {...base,total:Number(v.finalCreditValue),roundOff:Number(v.finalCreditValue)-base.total,creditReduction:Number(v.rounding.settlement.creditReduced),moneyRefund:Number(v.rounding.settlement.refundAmount)};
 }
 if(p.format==='samaan_mixed_fiscal_v1'){
  if(!mixedGstFiscalConsistent(signed))return invalid();
  const v=p as unknown as MixedFiscalPayload;
  return summed(v.context,mixedLines(v));
 }
 if(p.format==='samaan_mixed_credit_v1'){
  const v=p as unknown as MixedCreditPayload;
  if(!mixedCreditConsistent(signed,v.original))return invalid();
  const original=v.original.payload as MixedFiscalPayload,source=mixedLines(original);
  const lines=v.projection.lines.map(row=>{
   const index=original.invoice.lines.findIndex(l=>l.lineId===row.lineId),selection=v.selections.find(s=>s.lineId===row.lineId);
   if(index<0||!selection)return invalid();
   return {...source[index],quantity:selection.returning,net:Number(row.net),taxable:Number(row.reportingTaxableValue),tax:Number(row.tax),total:Number(row.total),discount:0,components:Object.fromEntries(Object.entries(row.components).map(([k,n])=>[k.toUpperCase(),Number(n)]))};
  });
  return {...summed(original.context,lines),...(v.settlement?{creditReduction:Number(v.settlement.creditReduction),moneyRefund:Number(v.settlement.moneyRefund)}:{})};
 }
 if(p.format==='samaan_ordinary_credit_v1'){
  const v=p as unknown as OrdinaryCreditPayload;
  if(!ordinaryCreditConsistent(signed,v.original))return invalid();
  const original=documentView(v.original);
  const lines=v.projection.lines.map(row=>ordinaryLine({name:original.lines[row.lineIndex].name,unit:original.lines[row.lineIndex].unit,quantity:row.quantity,tax:row.tax}));
  return summed(original.context,lines);
 }
 if(p.format!==undefined)return invalid();
 const context=p.context as GstContext|undefined,items=p.items as {name:string;unit:string;quantity:number;tax:LineTax}[]|undefined;
 if(!context||!items?.length)return invalid();
 return {...summed(context,items.map(ordinaryLine)),reason:typeof p.reason==='string'?p.reason:undefined};
}
