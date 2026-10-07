import {GstError} from './gst';
import {resolveRspTaxBasis,type RspTaxRates} from './rsp-tax-basis';
import type {RspValuationInput} from './rsp-valuation-input';
import type {RspGoodsEvidence} from './rsp-goods-coverage';
export interface RspCommercialInput {
 valuation:RspValuationInput&{goods:RspGoodsEvidence};rates:RspTaxRates;
 grossSaleValue:string;discount:string;
 rounding:{rule:'aggregate_half_up_largest_remainder_v1';reviewed:boolean;evidenceReference:string};
}
const fail=():never=>{throw new GstError('invalid_rsp_commercial_calculation');};
function money(value:string):bigint{
 if(typeof value!=='string'||!/^\d{1,12}(?:\.\d{1,2})?$/.test(value))return fail();
 const [whole,decimal='']=value.split('.');return BigInt(whole)*100n+BigInt(decimal.padEnd(2,'0'));
}
const decimal=(value:bigint)=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
/** Reviewed candidate calculation. Does not issue invoices or authorize a product/rate. */
export function calculateRspCommercial(input:RspCommercialInput){
 if(!input||input.rounding?.rule!=='aggregate_half_up_largest_remainder_v1'||input.rounding.reviewed!==true||typeof input.rounding.evidenceReference!=='string'||!input.rounding.evidenceReference.trim())return fail();
 const basis=resolveRspTaxBasis(input.valuation,input.rates),gross=money(input.grossSaleValue),discount=money(input.discount);
 if(discount>gross)return fail();
 const taxN=BigInt(basis.tax.numerator),taxD=BigInt(basis.tax.denominator),tax=(taxN*2n+taxD)/(taxD*2n);
 const components=Object.entries(basis.components).map(([key,fraction],index)=>{
  const n=BigInt(fraction.numerator),d=BigInt(fraction.denominator);
  return {key,index,value:n/d,remainder:n%d,denominator:d};
 });
 const residual=tax-components.reduce((sum,c)=>sum+c.value,0n);
 if(residual<0n||residual>BigInt(components.length))return fail();
 const ordered=[...components].sort((a,b)=>{
  const comparison=a.remainder*b.denominator-b.remainder*a.denominator;
  return comparison>0n?-1:comparison<0n?1:a.index-b.index;
 });
 for(let i=0;i<Number(residual);i++)ordered[i].value++;
 const net=gross-discount,total=net+tax,rsp=BigInt(basis.rsp.totalRspPaise);
 return {format:'samaan_rsp_commercial_v1' as const,basis,rounding:{...input.rounding},
  commercial:{grossSaleValue:decimal(gross),discount:decimal(discount),netSaleValue:decimal(net)},
  statutory:{deemedTaxableValue:decimal(rsp-tax),tax:decimal(tax),components:Object.fromEntries(components.map(c=>[c.key,decimal(c.value)]))},
  reporting:{taxableValue:decimal(net),tax:decimal(tax),invoiceValue:decimal(total),mapping:'gstn_rsp_advisory_20260123' as const},
  payable:decimal(total),payableRoundOff:'0.00',
 };
}
