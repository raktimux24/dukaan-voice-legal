import {normalizeRoundingIssuanceGrant,verifyRoundingGrantIssue,type RoundingGrantIssue} from './gst-core/payable-rounding-issuance-grant';
type SignedRoundingGrant = {format:'signed_rounding_issuance_grant_v1';keyId:string;signature:string;grant:import('./gst-core/payable-rounding-issuance-grant').RoundingIssuanceGrant};
export interface RetainedRoundingGrant {id:string;signedGrant:SignedRoundingGrant}
/** Shape/scope checks for authenticated secure-device storage; server verifies attestation on upload. */
export function parseRetainedRoundingGrant(value:unknown):RetainedRoundingGrant{
 const p=structuredClone(value) as RetainedRoundingGrant,s=p?.signedGrant;
 if(!p||Object.keys(p).length!==2||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(p.id)||!s||Object.keys(s).length!==4||s.format!=='signed_rounding_issuance_grant_v1'||!/^[-a-zA-Z0-9_]{1,64}$/.test(s.keyId)||!/^[0-9a-f]{64}$/.test(s.signature))throw Error('rounding_grant_invalid');
 return {id:p.id,signedGrant:{format:s.format,keyId:s.keyId,signature:s.signature,grant:normalizeRoundingIssuanceGrant(s.grant)}};
}
export function localRoundingGrantIssue(value:unknown,expected:RoundingGrantIssue){
 const retained=parseRetainedRoundingGrant(value);verifyRoundingGrantIssue(retained.signedGrant.grant,expected);return retained;
}
