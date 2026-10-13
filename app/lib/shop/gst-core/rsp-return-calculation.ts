import {GstError} from './gst';
import type {calculateRspCommercial} from './rsp-commercial-calculation';
export type RspCommercialSnapshot=ReturnType<typeof calculateRspCommercial>;
const fail=():never=>{throw new GstError('invalid_rsp_return_snapshot');};
function paise(value:string):bigint{
 if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value)||value.length>24)return fail();
 return BigInt(value.replace('.',''));
}
const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
/** Candidate original-snapshot reversal, whole packages only; caller must lock and verify return history. */
export function calculateRspReturn(original:RspCommercialSnapshot,alreadyReturned:number,returning:number){
 const count=original?.basis?.rsp?.packageCount;
 if(!Number.isSafeInteger(count)||count<1||!Number.isSafeInteger(alreadyReturned)||alreadyReturned<0||!Number.isSafeInteger(returning)||returning<1||returning>count-alreadyReturned)throw new GstError('return_quantity_exceeds');
 if(original.format!=='samaan_rsp_commercial_v1'||!original.commercial||!original.statutory?.components||original.rounding?.rule!=='aggregate_half_up_largest_remainder_v1'||original.rounding.reviewed!==true||original.reporting?.mapping!=='gstn_rsp_advisory_20260123'||original.payableRoundOff!=='0.00')return fail();
 const net=paise(original.commercial.netSaleValue),discount=paise(original.commercial.discount),gross=paise(original.commercial.grossSaleValue),tax=paise(original.statutory.tax),payable=paise(original.payable);
 const keys=['cgst','sgst','utgst','igst'] as const;
 const components=keys.map(key=>({key,amount:paise(original.statutory.components[key])}));
 const rsp=original.basis.rsp.totalRspPaise;
 if(!Number.isSafeInteger(rsp)||rsp<0||gross-discount!==net||components.reduce((sum,c)=>sum+c.amount,0n)!==tax||net+tax!==payable||BigInt(rsp)-tax!==paise(original.statutory.deemedTaxableValue)||paise(original.reporting.taxableValue)!==net||paise(original.reporting.tax)!==tax||paise(original.reporting.invoiceValue)!==payable)return fail();
 const total=BigInt(count),before=BigInt(alreadyReturned),after=before+BigInt(returning);
 const cumulative=(amount:bigint,quantity:bigint)=>(amount*quantity*2n+total)/(total*2n);
 const credit=(amount:bigint)=>cumulative(amount,after)-cumulative(amount,before);
 const active=components.filter(c=>c.amount>0n);
 if(active.length>2||active.length===2&&!(active[0].key==='cgst'&&['sgst','utgst'].includes(active[1].key)))return fail();
 // Allocate cumulative aggregate tax, rather than independently rounding each
 // component's package share. Two-component routing keeps both shares monotone.
 const componentAt=(key:string,quantity:bigint)=>{
  if(!tax)return 0n;
  const target=cumulative(tax,quantity),first=active[0];
  const firstShare=(target*first.amount*2n+tax)/(tax*2n);
  return key===first.key?firstShare:active[1]?.key===key?target-firstShare:0n;
 };
 const creditedComponents=Object.fromEntries(components.map(c=>[c.key,decimal(componentAt(c.key,after)-componentAt(c.key,before))]));
 const creditedTax=credit(tax),creditedNet=credit(net),creditedDiscount=credit(discount),creditedRsp=credit(BigInt(rsp));
 if(creditedTax>creditedRsp)return fail();
 return {format:'samaan_rsp_return_v1' as const,allocationRule:'original_aggregate_cumulative_component_share_v1' as const,
  packageCount:returning,alreadyReturned,originalPackageCount:count,
  commercial:{netSaleValue:decimal(creditedNet),discount:decimal(creditedDiscount),grossSaleValue:decimal(creditedNet+creditedDiscount)},
  statutory:{rsp:decimal(creditedRsp),deemedTaxableValue:decimal(creditedRsp-creditedTax),tax:decimal(creditedTax),components:creditedComponents},
  reporting:{taxableValue:decimal(creditedNet),tax:decimal(creditedTax),invoiceValue:decimal(creditedNet+creditedTax),mapping:original.reporting.mapping},
  creditValue:decimal(creditedNet+creditedTax),
 };
}
