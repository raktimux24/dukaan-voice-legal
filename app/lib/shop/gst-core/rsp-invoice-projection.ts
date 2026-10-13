import {GstError} from './gst';
import {calculateRspProfileCommercial} from './rsp-profile-contract';
type Line=Parameters<typeof calculateRspProfileCommercial>;
const money=(value:string)=>{if(!/^\d{1,15}\.\d{2}$/.test(value))throw new GstError('invalid_rsp_invoice_projection');return BigInt(value.replace('.',''));};
const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
/** Projects only reviewed RSP lines; issuance, numbering and stock remain the sales engine's responsibility. */
export function projectRspInvoice(inputs:readonly {lineId:string;profile:Line[0];transaction:Line[1]}[]){
 if(!Array.isArray(inputs)||!inputs.length||inputs.length>100)throw new GstError('invalid_rsp_invoice_projection');
 const ids=new Set<string>();
 const lines=inputs.map(input=>{
  if(!input||typeof input.lineId!=='string'||!input.lineId.trim()||input.lineId.length>100||ids.has(input.lineId))throw new GstError('invalid_rsp_invoice_projection');
  ids.add(input.lineId);
  return {lineId:input.lineId,...calculateRspProfileCommercial(input.profile,input.transaction)};
 });
 const sum=(read:(line:typeof lines[number])=>string)=>decimal(lines.reduce((total,line)=>total+money(read(line)),0n));
 const components=Object.fromEntries(['cgst','sgst','utgst','igst'].map(key=>[key,sum(line=>line.calculation.statutory.components[key]??'0.00')]));
 return {format:'samaan_rsp_invoice_projection_v1' as const,lines,
  commercial:{grossSaleValue:sum(l=>l.calculation.commercial.grossSaleValue),discount:sum(l=>l.calculation.commercial.discount),netSaleValue:sum(l=>l.calculation.commercial.netSaleValue)},
  statutory:{deemedTaxableValue:sum(l=>l.calculation.statutory.deemedTaxableValue),tax:sum(l=>l.calculation.statutory.tax),components},
  reporting:{taxableValue:sum(l=>l.calculation.reporting.taxableValue),tax:sum(l=>l.calculation.reporting.tax),invoiceValue:sum(l=>l.calculation.reporting.invoiceValue),mapping:'gstn_rsp_advisory_20260123' as const},
  payable:sum(l=>l.calculation.payable),payableRoundOff:'0.00',
 };
}
