import {mixedGstInvoiceConsistent} from './mixed-gst-integrity';
import type {projectMixedGstInvoice} from './mixed-gst-projection';
type Invoice=ReturnType<typeof projectMixedGstInvoice>;
/** Map fiscal evidence to sale columns without fabricating ordinary RSP snapshots. */
export function mixedSaleAmounts(invoice:Invoice){
 if(!mixedGstInvoiceConsistent(invoice))throw new Error('invalid_mixed_sale_calculation');
 const lines=invoice.lines.map(line=>{
  if(line.kind==='ordinary')return {id:line.lineId,quantity:line.quantity!,gross:line.tax!.gross,discount:line.tax!.discount+line.tax!.billDiscount,net:line.tax!.net,tax:line.tax!.tax,total:line.tax!.total,taxSnapshot:structuredClone(line.tax!),rspSnapshot:null};
  const evidence=line.evidence!,calculation=evidence.calculation;
  return {id:line.lineId,quantity:calculation.basis.rsp.packageCount,gross:Number(calculation.commercial.grossSaleValue),discount:Number(calculation.commercial.discount),net:Number(calculation.commercial.netSaleValue),tax:Number(calculation.statutory.tax),total:Number(calculation.payable),taxSnapshot:null,rspSnapshot:structuredClone({profile:evidence.profile,calculation})};
 });
 const cents=(value:number)=>BigInt(Math.round(value*100));
 const sum=(read:(line:typeof lines[number])=>number)=>Number(lines.reduce((total,line)=>total+cents(read(line)),0n))/100;
 return {subtotal:sum(l=>l.gross),discount:sum(l=>l.discount),billDiscount:Number(invoice.billDiscount?.amount??'0.00'),net:Number(invoice.net),tax:Number(invoice.tax),total:Number(invoice.payable),lines};
}
