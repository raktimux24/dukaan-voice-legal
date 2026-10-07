import {fiscalDateLabel} from './fiscal-date';
import {roundPayable,type PayableRoundingMode} from './payable-rounding';
export interface PayableRoundingPolicy {format:'payable_rounding_policy_v1';version:string;shopId:string;mode:PayableRoundingMode;effectiveFrom:string;effectiveUntil:string|null;reviewed:true;evidenceReference:string}
const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const instant=(value:unknown):value is string=>{if(typeof value!=='string'||!value.includes('T'))return false;try{fiscalDateLabel(value);return true;}catch{return false;}};
export function normalizePayableRoundingPolicy(value:unknown):PayableRoundingPolicy {
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('invalid_payable_rounding_policy');
 const p=value as Record<string,unknown>,keys=['format','version','shopId','mode','effectiveFrom','effectiveUntil','reviewed','evidenceReference'];
 if(Object.keys(p).some(k=>!keys.includes(k))||p.format!=='payable_rounding_policy_v1'||!uuid(p.version)||!uuid(p.shopId)||(p.mode!=='none'&&p.mode!=='nearest_rupee')||!instant(p.effectiveFrom)||!(p.effectiveUntil===null||instant(p.effectiveUntil))||p.effectiveUntil!==null&&Date.parse(p.effectiveUntil as string)<=Date.parse(p.effectiveFrom)||p.reviewed!==true||typeof p.evidenceReference!=='string'||!p.evidenceReference.trim()||p.evidenceReference.trim().length>500)throw new Error('invalid_payable_rounding_policy');
 return {format:p.format,version:p.version.toLowerCase(),shopId:p.shopId.toLowerCase(),mode:p.mode as PayableRoundingMode,effectiveFrom:p.effectiveFrom,effectiveUntil:p.effectiveUntil as string|null,reviewed:true,evidenceReference:p.evidenceReference.trim()};
}
/** Candidate binding only; not an authorization to activate rounded invoices. */
export function reviewedPayableRounding(shopId:string,issuedAt:string,before:string,value:unknown){
 const policy=normalizePayableRoundingPolicy(value);
 if(!uuid(shopId)||!instant(issuedAt)||policy.shopId!==shopId.toLowerCase()||Date.parse(issuedAt)<Date.parse(policy.effectiveFrom)||policy.effectiveUntil!==null&&Date.parse(issuedAt)>=Date.parse(policy.effectiveUntil))throw new Error('payable_rounding_policy_not_effective');
 return {policy,calculation:roundPayable(before,policy.mode)};
}
