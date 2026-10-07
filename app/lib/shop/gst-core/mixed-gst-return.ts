import {mixedGstInvoiceConsistent} from './mixed-gst-integrity';
import {canonicalJson} from './sale-request-canonical';
import {GstError,returnTax} from './gst';
import {calculateRspReturn} from './rsp-return-calculation';
import type {projectMixedGstInvoice} from './mixed-gst-projection';
type Invoice=ReturnType<typeof projectMixedGstInvoice>;
export interface MixedReturnSelection {lineId:string;originalQuantity:number;alreadyReturned:number;returning:number}
export type MixedReturnProjection=ReturnType<typeof projectMixedGstReturn>;
export interface MixedReturnHistory {
 id:string;
 selections:readonly MixedReturnSelection[];
 projection:MixedReturnProjection;
}
/** Replay locked history before trusting denormalized returned quantities.
 * The transaction caller must additionally verify each retained credit-note hash,
 * its financial movements and sale/shop scope before passing history here.
 */
export function verifyMixedReturnHistory(invoice:Invoice,history:readonly MixedReturnHistory[],rows:readonly {lineId:string;returnedQuantity:number}[]){
 if(!mixedGstInvoiceConsistent(invoice))throw new GstError('invalid_mixed_invoice_evidence');
 const quantities=new Map(invoice.lines.map(line=>[line.lineId,line.kind==='rsp'?line.evidence!.calculation.basis.rsp.packageCount:line.quantity!]));
 const cumulative=new Map(invoice.lines.map(line=>[line.lineId,0]));
 const seen=new Set<string>();
 for(const entry of history){
  if(!entry.id||seen.has(entry.id))throw new GstError('mixed_return_history_invalid');seen.add(entry.id);
  for(const selection of entry.selections){
   if(selection.originalQuantity!==quantities.get(selection.lineId)||selection.alreadyReturned!==cumulative.get(selection.lineId))throw new GstError('mixed_return_history_invalid');
  }
  const expected=projectMixedGstReturn(invoice,entry.selections);
  if(canonicalJson(expected)!==canonicalJson(entry.projection))throw new GstError('mixed_return_history_invalid');
  for(const selection of entry.selections)cumulative.set(selection.lineId,Math.round((cumulative.get(selection.lineId)!+selection.returning)*1000)/1000);
 }
 if(rows.length!==invoice.lines.length||new Set(rows.map(row=>row.lineId)).size!==rows.length||rows.some(row=>row.returnedQuantity!==cumulative.get(row.lineId)))throw new GstError('mixed_return_quantity_history_mismatch');
 return cumulative;
}
export function planMixedGstReturn(invoice:Invoice,history:readonly MixedReturnHistory[],rows:readonly {lineId:string;returnedQuantity:number}[],request:readonly {lineId:string;returning:number}[]){
 const cumulative=verifyMixedReturnHistory(invoice,history,rows);
 const quantities=new Map(invoice.lines.map(line=>[line.lineId,line.kind==='rsp'?line.evidence!.calculation.basis.rsp.packageCount:line.quantity!]));
 const selections=request.map(selection=>({lineId:selection.lineId,originalQuantity:quantities.get(selection.lineId)!,alreadyReturned:cumulative.get(selection.lineId)!,returning:selection.returning}));
 return {selections,projection:projectMixedGstReturn(invoice,selections)};
}
const cents=(value:string)=>{if(!/^\d+\.\d{2}$/.test(value))throw new GstError('invalid_mixed_return');return BigInt(value.replace('.',''));};
const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
/** Caller must verify retained invoice integrity and lock cumulative return history. */
export function projectMixedGstReturn(invoice:Invoice,selections:readonly MixedReturnSelection[]){
 if(!mixedGstInvoiceConsistent(invoice))throw new GstError('invalid_mixed_invoice_evidence');
 if(invoice?.format!=='samaan_mixed_gst_projection_v1'||!Array.isArray(invoice.lines)||!Array.isArray(selections)||!selections.length||selections.length>invoice.lines.length)throw new GstError('invalid_mixed_return');
 const seen=new Set<string>();
 const lines=selections.map(selection=>{
  if(!selection||seen.has(selection.lineId))throw new GstError('invalid_mixed_return');seen.add(selection.lineId);
  if(![selection.originalQuantity,selection.alreadyReturned,selection.returning].every(value=>Number.isFinite(value)&&Math.abs(value*1000-Math.round(value*1000))<1e-7))throw new GstError('invalid_mixed_return_precision');
  const matches=invoice.lines.filter(l=>l.lineId===selection.lineId);if(matches.length!==1)throw new GstError('invalid_mixed_return');const line=matches[0];
  if(line.kind==='rsp'){
   if(!line.evidence)throw new GstError('invalid_mixed_return');
   if(selection.originalQuantity!==line.evidence.calculation.basis.rsp.packageCount)throw new GstError('rsp_return_package_quantity_mismatch');
   const credit=calculateRspReturn(line.evidence.calculation,selection.alreadyReturned,selection.returning);
   return {lineId:line.lineId,kind:line.kind,credit,net:credit.commercial.netSaleValue,tax:credit.statutory.tax,total:credit.creditValue,reportingTaxableValue:credit.reporting.taxableValue,components:credit.statutory.components};
  }
  if(!line.tax)throw new GstError('invalid_mixed_return');
  if(selection.originalQuantity!==line.quantity)throw new GstError('mixed_return_quantity_mismatch');
  const credit=returnTax(line.tax,selection.originalQuantity,selection.alreadyReturned,selection.returning);
  return {lineId:line.lineId,kind:line.kind,credit,net:credit.net.toFixed(2),tax:credit.tax.toFixed(2),total:credit.total.toFixed(2),reportingTaxableValue:credit.taxable.toFixed(2),components:Object.fromEntries(['cgst','sgst','utgst','igst'].map(key=>[key,credit[key as 'cgst'].toFixed(2)]))};
 });
 const sum=(read:(line:typeof lines[number])=>string)=>decimal(lines.reduce((value,line)=>value+cents(read(line)),0n));
 return {format:'samaan_mixed_gst_return_v1' as const,lines,net:sum(l=>l.net),tax:sum(l=>l.tax),creditValue:sum(l=>l.total),reportingTaxableValue:sum(l=>l.reportingTaxableValue),components:Object.fromEntries(['cgst','sgst','utgst','igst'].map(key=>[key,sum(l=>l.components[key]??'0.00')]))};
}
