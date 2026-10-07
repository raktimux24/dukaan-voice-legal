import {normalizeRspProductProfile,calculateRspProfileCommercial} from './rsp-profile-contract';
import {calculateRspReturn} from './rsp-return-calculation';
import type {projectMixedGstInvoice} from './mixed-gst-projection';
type Invoice=ReturnType<typeof projectMixedGstInvoice>;
const keys=['cgst','sgst','utgst','igst'] as const;
function canonical(value:unknown):string{
 if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
 if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical((value as Record<string,unknown>)[key])}`).join(',')}}`;
 return JSON.stringify(value);
}
function cents(value:unknown):bigint{
 const text=typeof value==='number'?String(value):value;
 if(typeof text!=='string'||!/^\d{1,15}(?:\.\d{1,2})?$/.test(text))throw new Error('invalid_mixed_fiscal_amount');
 const [whole,fraction='']=text.split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
}
/** Reconciliation cannot authenticate an invoice; verify its immutable hash separately. */
export function mixedGstInvoiceConsistent(invoice:Invoice):boolean{
 try{
  if(invoice?.format!=='samaan_mixed_gst_projection_v1'||!Array.isArray(invoice.lines)||!invoice.lines.length||invoice.lines.length>100||invoice.payableRoundOff!=='0.00')return false;
  const ids=new Set<string>(),components={cgst:0n,sgst:0n,utgst:0n,igst:0n};let net=0n,tax=0n,payable=0n,reporting=0n;
  for(const line of invoice.lines){
   if(typeof line.lineId!=='string'||!line.lineId.trim()||ids.has(line.lineId))return false;ids.add(line.lineId);
   let rowNet:bigint,rowTax:bigint,rowTotal:bigint,rowReporting:bigint,rowComponents:Record<typeof keys[number],unknown>;
   if(line.kind==='rsp'){
    if(!line.evidence)return false;
    const profile=normalizeRspProductProfile(line.evidence.profile),snapshot=line.evidence.calculation;
    if(canonical(profile.goods)!==canonical(snapshot.basis.goods)||canonical(profile.rates)!==canonical(snapshot.basis.rates))return false;
    const retained=snapshot.basis.rsp;
    const replay=calculateRspProfileCommercial(profile,{productId:profile.productId,valuation:{supplyAt:retained.supplyAt,area:retained.area,packageId:retained.packageId,packageCount:retained.packageCount,packages:retained.packages.map(pkg=>({packageId:pkg.packageId,area:pkg.area,declaredPrices:pkg.declaredPrices.map(paise=>paise/100),increasedPrices:pkg.increasedPrices.map(paise=>paise/100)}))},grossSaleValue:snapshot.commercial.grossSaleValue,discount:snapshot.commercial.discount,rounding:snapshot.rounding});
    if(canonical(replay.calculation)!==canonical(snapshot))return false;
    const credit=calculateRspReturn(snapshot,0,snapshot.basis.rsp.packageCount);
    rowNet=cents(credit.commercial.netSaleValue);rowTax=cents(credit.statutory.tax);rowTotal=cents(credit.creditValue);rowReporting=cents(credit.reporting.taxableValue);rowComponents={cgst:credit.statutory.components.cgst,sgst:credit.statutory.components.sgst,utgst:credit.statutory.components.utgst,igst:credit.statutory.components.igst};
   }else if(line.kind==='ordinary'){
    if(!line.tax||typeof line.quantity!=='number'||!Number.isFinite(line.quantity)||line.quantity<=0)return false;
    rowNet=cents(line.tax.net);rowTax=cents(line.tax.tax);rowTotal=cents(line.tax.total);rowReporting=cents(line.tax.taxable);rowComponents=line.tax;
    if(line.tax.category==='taxable'?rowReporting!==rowNet:rowReporting!==0n||rowTax!==0n)return false;
   }else return false;
   const parts=keys.map(key=>cents(rowComponents[key]));
   if(parts.reduce((a,b)=>a+b,0n)!==rowTax||rowNet+rowTax!==rowTotal||parts[1]>0n&&parts[2]>0n||parts[3]>0n&&parts[0]+parts[1]+parts[2]>0n)return false;
   keys.forEach((key,index)=>components[key]+=parts[index]);net+=rowNet;tax+=rowTax;payable+=rowTotal;reporting+=rowReporting;
  }
  if(invoice.billDiscount!==null){
   const discount=invoice.billDiscount;
   if(!discount||discount.policy!=='commercial_amount_proportional_v1'||discount.reviewed!==true||typeof discount.evidenceReference!=='string'||!discount.evidenceReference.trim()||!Array.isArray(discount.allocations)||discount.allocations.length!==invoice.lines.length)return false;
   const requested=cents(discount.amount);
   const shares=invoice.lines.map((line,index)=>{
    const retained=discount.allocations[index];if(retained.lineId!==line.lineId)throw new Error();
    const amount=cents(retained.amount);
    const originalDiscount=line.kind==='ordinary'?cents(line.tax!.discount):cents(line.evidence!.calculation.commercial.discount);
    if(amount>originalDiscount)throw new Error();
    const after=line.kind==='ordinary'?cents(line.tax!.gross)-cents(line.tax!.discount):cents(line.evidence!.calculation.commercial.netSaleValue);
    if(after<0n)throw new Error();
    return {index,amount,weight:after+amount,expected:0n,remainder:0n};
   });
   const available=shares.reduce((sum,row)=>sum+row.weight,0n);
   if(requested>available||shares.reduce((sum,row)=>sum+row.amount,0n)!==requested)return false;
   for(const row of shares){row.expected=available?requested*row.weight/available:0n;row.remainder=available?requested*row.weight%available:0n;}
   const ordered=[...shares].sort((a,b)=>a.remainder>b.remainder?-1:a.remainder<b.remainder?1:a.index-b.index);
   const residual=requested-shares.reduce((sum,row)=>sum+row.expected,0n);
   for(let index=0;index<Number(residual);index++)ordered[index].expected++;
   if(shares.some(row=>row.amount!==row.expected))return false;
  }
  return net===cents(invoice.net)&&tax===cents(invoice.tax)&&payable===cents(invoice.payable)&&reporting===cents(invoice.reportingTaxableValue)&&keys.every(key=>components[key]===cents(invoice.components[key]));
 }catch{return false;}
}
