import {financialYear,allocationNumber} from './gst';
import {normalizePayableRoundingPolicy,type PayableRoundingPolicy} from './payable-rounding-policy';
export interface RoundingIssuanceGrant {
 format:'payable_rounding_issuance_grant_v1';shopId:string;actorId:string;deviceEpoch:string;
 allocationId:string;financialYear:string;block:number;issuer:string;validFrom:string;expiresAt:string;
 policy:PayableRoundingPolicy;
}
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
const instant=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
/** Shared payload validation only. A client must not treat this as signature verification. */
export function normalizeRoundingIssuanceGrant(value:unknown):RoundingIssuanceGrant{
 const p=structuredClone(value) as RoundingIssuanceGrant;
 const keys=['format','shopId','actorId','deviceEpoch','allocationId','financialYear','block','issuer','validFrom','expiresAt','policy'];
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length!==keys.length||Object.keys(p).some(k=>!keys.includes(k))||p.format!=='payable_rounding_issuance_grant_v1'||!uuid(p.shopId)||!uuid(p.deviceEpoch)||!uuid(p.allocationId)||typeof p.actorId!=='string'||!p.actorId.trim()||p.actorId!==p.actorId.trim()||!Number.isSafeInteger(p.block)||p.block<1||typeof p.issuer!=='string'||!p.issuer||!instant(p.validFrom)||!instant(p.expiresAt)||Date.parse(p.expiresAt)<=Date.parse(p.validFrom))throw Error('invalid_rounding_issuance_grant');
 p.policy=normalizePayableRoundingPolicy(p.policy);
 if(p.policy.shopId!==p.shopId||p.financialYear!==financialYear(new Date(p.validFrom))||p.financialYear!==financialYear(new Date(Date.parse(p.expiresAt)-1))||Date.parse(p.validFrom)<Date.parse(p.policy.effectiveFrom)||p.policy.effectiveUntil!==null&&Date.parse(p.expiresAt)>Date.parse(p.policy.effectiveUntil))throw Error('invalid_rounding_issuance_grant');
 allocationNumber({financialYear:p.financialYear,block:p.block},100);
 return {format:p.format,shopId:p.shopId,actorId:p.actorId,deviceEpoch:p.deviceEpoch,allocationId:p.allocationId,financialYear:p.financialYear,block:p.block,issuer:p.issuer,validFrom:p.validFrom,expiresAt:p.expiresAt,policy:p.policy};
}
export interface RoundingGrantIssue {shopId:string;actorId:string;deviceEpoch:string;allocationId:string;issuer:string;financialYear:string;number:string;index:number;issuedAt:string;policyVersion:string}
/** Check original issue time, never synchronization time; revoked scope is checked by the caller. */
export function verifyRoundingGrantIssue(value:unknown,expected:RoundingGrantIssue){
 const p=normalizeRoundingIssuanceGrant(value),e=structuredClone(expected);
 if(!instant(e.issuedAt)||!Number.isInteger(e.index)||e.index<1||e.index>100||Date.parse(e.issuedAt)<Date.parse(p.validFrom)||Date.parse(e.issuedAt)>=Date.parse(p.expiresAt)||e.financialYear!==financialYear(new Date(e.issuedAt))||e.number!==allocationNumber(p,e.index)||e.policyVersion!==p.policy.version||['shopId','actorId','deviceEpoch','allocationId','issuer','financialYear'].some(k=>p[k as keyof RoundingIssuanceGrant]!==e[k as keyof RoundingGrantIssue]))throw Error('rounding_issuance_grant_scope_mismatch');
 return p;
}
