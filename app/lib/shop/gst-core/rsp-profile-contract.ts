import {GstError,gstEffectiveTime} from './gst';
import {assertRspGoodsCovered,type RspGoodsEvidence} from './rsp-goods-coverage';
import {validateRspTaxRates,type RspTaxRates} from './rsp-tax-basis';
import {calculateRspCommercial,type RspCommercialInput} from './rsp-commercial-calculation';
export interface RspProductProfile {
 format:'samaan_rsp_product_profile_v1';version:string;productId:string;
 rule:'cgst_rule_31d_2026';effectiveFrom:string;effectiveUntil?:string;
 sourceReference:string;reviewed:true;goods:RspGoodsEvidence;rates:RspTaxRates;
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=():never=>{throw new GstError('invalid_rsp_product_profile');};
function knownFields(raw:unknown,keys:readonly string[]):void{
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(key=>!keys.includes(key)))return fail();
}
function reference(value:unknown):string{
 if(typeof value!=='string'||!value.trim()||value.length>1000)return fail();return value.trim();
}
function moment(value:unknown):number{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value))return fail();return gstEffectiveTime(value);
}
/** Validates retained review evidence; does not activate a product for billing. */
export function normalizeRspProductProfile(raw:RspProductProfile):RspProductProfile{
 knownFields(raw,['format','version','productId','rule','effectiveFrom','effectiveUntil','sourceReference','reviewed','goods','rates']);
 knownFields(raw.goods,['hsn','description','reviewed','evidenceReference']);
 knownFields(raw.rates,['version','sourceReference','reviewed','cgst','sgst','utgst','igst']);
 if(!raw||raw.format!=='samaan_rsp_product_profile_v1'||raw.rule!=='cgst_rule_31d_2026'||raw.reviewed!==true||typeof raw.version!=='string'||typeof raw.productId!=='string'||!uuid.test(raw.version)||!uuid.test(raw.productId))return fail();
 const from=moment(raw.effectiveFrom),until=raw.effectiveUntil===undefined?null:moment(raw.effectiveUntil);
 if(from<Date.parse('2026-02-01T00:00:00+05:30')||until!==null&&until<=from)return fail();
 assertRspGoodsCovered(raw.goods);validateRspTaxRates(raw.rates);
 return {format:raw.format,version:raw.version.toLowerCase(),productId:raw.productId.toLowerCase(),rule:raw.rule,reviewed:true,
  effectiveFrom:new Date(from).toISOString(),...(until===null?{}:{effectiveUntil:new Date(until).toISOString()}),sourceReference:reference(raw.sourceReference),
  goods:{hsn:raw.goods.hsn,description:raw.goods.description,reviewed:true,evidenceReference:reference(raw.goods.evidenceReference)},
  rates:{version:reference(raw.rates.version),sourceReference:reference(raw.rates.sourceReference),reviewed:true,cgst:raw.rates.cgst,sgst:raw.rates.sgst,utgst:raw.rates.utgst,igst:raw.rates.igst},
 };
}
export function rspProductProfileAt(raw:RspProductProfile,productId:string,supplyAt:string):RspProductProfile{
 if(typeof productId!=='string'||!uuid.test(productId))return fail();
 const profile=normalizeRspProductProfile(raw),at=moment(supplyAt);
 if(productId.toLowerCase()!==profile.productId||at<Date.parse(profile.effectiveFrom)||profile.effectiveUntil!==undefined&&at>=Date.parse(profile.effectiveUntil))throw new GstError('rsp_profile_not_effective');
 return profile;
}
export function calculateRspProfileCommercial(raw:RspProductProfile,transaction:{productId:string;valuation:Omit<RspCommercialInput['valuation'],'goods'|'rule'|'sourceReference'|'reviewed'>;grossSaleValue:string;discount:string;rounding:RspCommercialInput['rounding']}){
 const profile=rspProductProfileAt(raw,transaction.productId,transaction.valuation.supplyAt);
 const calculation=calculateRspCommercial({valuation:{...transaction.valuation,goods:profile.goods,rule:profile.rule,sourceReference:profile.sourceReference,reviewed:true},rates:profile.rates,grossSaleValue:transaction.grossSaleValue,discount:transaction.discount,rounding:transaction.rounding});
 return {profile,calculation};
}
