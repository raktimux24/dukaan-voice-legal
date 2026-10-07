import {GstError,gstEffectiveTime} from './gst';
export interface DeclaredRsp {packageId:string;area:string;declaredPrices:number[];increasedPrices?:number[]}
export interface RspValuationInput {rule:'cgst_rule_31d_2026';sourceReference:string;reviewed:boolean;supplyAt:string;area:string;packageId:string;packageCount:number;packages:DeclaredRsp[]}
const effectiveAt=Date.parse('2026-02-01T00:00:00+05:30');
const fail=():never=>{throw new GstError('invalid_rsp_valuation_input');};
function paise(value:number):number{
 if(!Number.isFinite(value)||value<=0||value>1e9)return fail();
 const match=/^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));if(!match)return fail();
 return Number(match[1])*100+Number((match[2]??'').padEnd(2,'0'));
}
/** Resolves declared package RSP only. It does not authorize coverage or issue a tax document. */
export function resolveDeclaredRsp(input:RspValuationInput){
 if(!input||input.rule!=='cgst_rule_31d_2026'||input.reviewed!==true||typeof input.sourceReference!=='string'||!input.sourceReference.trim()||typeof input.area!=='string'||!input.area.trim()||!Array.isArray(input.packages)||!input.packages.length)return fail();
 if(typeof input.packageId!=='string'||!input.packageId.trim()||!Number.isSafeInteger(input.packageCount)||input.packageCount<1)return fail();
 if(typeof input.supplyAt!=='string'||!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(input.supplyAt))return fail();
 const supplyAt=gstEffectiveTime(input.supplyAt);
 if(supplyAt<effectiveAt)throw new GstError('rsp_rule_not_effective');
 const area=input.area.trim(),packageId=input.packageId.trim();
 const packages=input.packages.map(pkg=>{
  if(!pkg||typeof pkg.packageId!=='string'||!pkg.packageId.trim()||typeof pkg.area!=='string'||!pkg.area.trim()||!Array.isArray(pkg.declaredPrices)||!pkg.declaredPrices.length||pkg.increasedPrices!==undefined&&!Array.isArray(pkg.increasedPrices))return fail();
  const declaredPrices=pkg.declaredPrices.map(paise),increasedPrices=(pkg.increasedPrices??[]).map(paise);
  return {packageId:pkg.packageId.trim(),area:pkg.area.trim(),declaredPrices,increasedPrices};
 });
 const matching=packages.filter(pkg=>pkg.area===area&&pkg.packageId===packageId);
 if(!matching.length)return fail();
 const amounts=matching.flatMap(pkg=>[...pkg.declaredPrices,...pkg.increasedPrices]);
 const selectedPaise=amounts.reduce((highest,price)=>Math.max(highest,price),0);
 const totalRspPaise=BigInt(selectedPaise)*BigInt(input.packageCount);
 if(totalRspPaise>BigInt(Number.MAX_SAFE_INTEGER))return fail();
 return {packageId,packageCount:input.packageCount,totalRspPaise:Number(totalRspPaise),rule:input.rule,sourceReference:input.sourceReference.trim(),supplyAt:new Date(supplyAt).toISOString(),area,selectedPaise,packages};
}
