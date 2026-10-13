import {canonicalJson} from './gst-core/sale-request-canonical';
import {verifyRoundedReservation} from './rounded-reservation';
import {mixedSaleConfirmationMatches} from './mixed-sale-confirmation';
import type {Sale,CreateSalePayload} from './types';
/** Replay retained issuance and final tenders; cryptographic evidence is checked before queue release. */
export function roundedSaleConfirmationMatches(sale:Sale,shopId:string,payload:CreateSalePayload):boolean{
 try{
  const quote=verifyRoundedReservation(shopId,payload),evidence=sale.roundingEvidence,context=payload.gstContext;
  if(!quote||!evidence||sale.status!=='completed'||payload.customerId&&sale.customerId!==payload.customerId||quote.settlement.creditTotal!=='0.00'&&!sale.customerId||!context?.allocation||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sale.id)||sale.gstIntegrity!=='verified'||sale.shopId!==shopId||Date.parse(sale.soldAt)!==Date.parse(context.issuedAt!)||sale.total!==Number(quote.snapshot.calculation.payable)||canonicalJson(evidence.snapshot)!==canonicalJson(payload.roundingSnapshot)||evidence.hashVersion!=='canonical_json_v1'||!/^[a-f0-9]{64}$/.test(evidence.hash)||Object.keys(evidence).some(key=>!['document','snapshot','hash','hashVersion'].includes(key))||canonicalJson(evidence.document)!==canonicalJson({saleId:sale.id.toLowerCase(),number:context.allocation.number}))return false;
  if(!Array.isArray(sale.items)||sale.items.length!==payload.items.length||!Array.isArray(sale.payments))return false;
  const paymentKey=(p:{method:string;amount:number;tendered?:number|null;reference?:string|null})=>canonicalJson({method:p.method,amount:p.amount,tendered:p.method==='cash'?p.tendered??null:null,reference:p.reference?.trim()||null});
  if(canonicalJson(sale.payments.filter(p=>p.kind==='payment').map(paymentKey).sort())!==canonicalJson(payload.payments.filter(p=>p.amount>0).map(paymentKey).sort()))return false;
  if(sale.payments.filter(p=>p.kind==='payment').some(p=>p.method==='cash'&&p.changeGiven!==(p.tendered==null?null:Math.round(Math.max(0,p.tendered-p.amount)*100)/100)))return false;
  if(payload.items.some(item=>item.rsp!==undefined))return mixedSaleConfirmationMatches({...sale,total:Number(quote.snapshot.calculation.before)},payload);
  if(!('tax' in quote)||sale.mixedGstSnapshot!=null||!sale.gstSnapshot||canonicalJson(sale.gstSnapshot.context)!==canonicalJson(context)||canonicalJson(sale.gstSnapshot.totals)!==canonicalJson(quote.tax)||sale.gstSnapshot.invoiceNumber!==context.allocation.number||sale.netSales!==quote.tax.net||sale.taxTotal!==quote.tax.tax||sale.subtotal!==quote.tax.subtotal||sale.discountAmount!==quote.tax.discount)return false;
  if(sale.gstSnapshot.renderVersion!==(context.documentRenderVersion??'gst_bill_v1')||sale.gstSnapshot.documentType!==(quote.tax.lines.some(line=>line.category!=='taxable')?'invoice_cum_bill_of_supply':'tax_invoice'))return false;
  return sale.items.every((item,index)=>{
   const input=payload.items[index],tax=quote.tax.lines[index];
   return item.productId===(input.productId??null)&&item.quantity===input.quantity&&item.unitPrice===Math.max(input.price??0,input.listPrice??input.price??0)&&item.discountAmount===Math.round(((Math.max(input.price??0,input.listPrice??input.price??0)-(input.price??0))*input.quantity+(input.discount??0))*100)/100&&item.lineTotal===tax.total&&item.netSales===tax.net&&canonicalJson(item.taxSnapshot)===canonicalJson(tax)&&item.rspSnapshot==null&&(input.name===undefined||input.name.trim()===item.name)&&(input.unit===undefined||input.unit===item.unit);
  });
 }catch{return false;}
}
