import {GstError} from './gst';
import {resolveDeclaredRsp,type RspValuationInput} from './rsp-valuation-input';
import {assertRspGoodsCovered,type RspGoodsEvidence} from './rsp-goods-coverage';
export interface RspTaxRates {version:string;sourceReference:string;reviewed:boolean;cgst:number;sgst:number;utgst:number;igst:number}
const fail=():never=>{throw new GstError('invalid_rsp_tax_rates');};
function basisPoints(rate:number){
 if(!Number.isFinite(rate)||rate<0||rate>100)return fail();
 const match=/^(\d+)(?:\.(\d{1,2}))?$/.exec(String(rate));if(!match)return fail();
 return BigInt(match[1])*100n+BigInt((match[2]??'').padEnd(2,'0'));
}
function fraction(numerator:bigint,denominator:bigint){
 let a=numerator,b=denominator;while(b){const next=a%b;a=b;b=next;}
 const divisor=a||1n;
 return {numerator:(numerator/divisor).toString(),denominator:(denominator/divisor).toString(),unit:'paise' as const};
}
export function validateRspTaxRates(rates:RspTaxRates){
 if(!rates||rates.reviewed!==true||typeof rates.version!=='string'||!rates.version.trim()||typeof rates.sourceReference!=='string'||!rates.sourceReference.trim())return fail();
 const cgst=basisPoints(rates.cgst),sgst=basisPoints(rates.sgst),utgst=basisPoints(rates.utgst),igst=basisPoints(rates.igst);
 const sum=cgst+sgst+utgst+igst;
 if(sum<=0n||sum>10000n||igst>0n&&(cgst+sgst+utgst)>0n||sgst>0n&&utgst>0n||igst===0n&&(cgst===0n||cgst!==sgst+utgst))return fail();
 return {cgst,sgst,utgst,igst,sum};
}
/** Exact unrounded Rule 31D basis. Not a payable quote or final fiscal total. */
export function resolveRspTaxBasis(input:RspValuationInput&{goods:RspGoodsEvidence},rates:RspTaxRates){
 assertRspGoodsCovered(input?.goods);
 const {cgst,sgst,utgst,igst,sum}=validateRspTaxRates(rates);
 const rsp=resolveDeclaredRsp(input),gross=BigInt(rsp.totalRspPaise),denominator=10000n+sum;
 return {format:'samaan_rsp_tax_basis_v2' as const,rsp,goods:{...input.goods},rates:{...rates},
  taxableValue:fraction(gross*10000n,denominator),tax:fraction(gross*sum,denominator),
  components:{cgst:fraction(gross*cgst,denominator),sgst:fraction(gross*sgst,denominator),utgst:fraction(gross*utgst,denominator),igst:fraction(gross*igst,denominator)},
 };
}
