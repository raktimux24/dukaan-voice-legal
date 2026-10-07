import {reviewedPayableRounding,type PayableRoundingPolicy} from './payable-rounding-policy';
import {reversePayableRounding,type PayableRounding} from './payable-rounding';
export interface PayableRoundingSnapshot {format:'payable_rounding_snapshot_v1';shopId:string;issuedAt:string;policy:PayableRoundingPolicy;calculation:PayableRounding}
/** Candidate invoice evidence. Issuance activation requires full protocol/payment/report integration. */
export function createPayableRoundingSnapshot(shopId:string,issuedAt:string,before:string,policy:unknown):PayableRoundingSnapshot {
 const binding=reviewedPayableRounding(shopId,issuedAt,before,policy);
 return {format:'payable_rounding_snapshot_v1',shopId:binding.policy.shopId,issuedAt:new Date(issuedAt).toISOString(),...binding};
}
export function verifyPayableRoundingSnapshot(value:unknown,expected:{shopId:string;issuedAt:string;before:string}):PayableRoundingSnapshot{
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('payable_rounding_snapshot_mismatch');
 const snapshot=value as PayableRoundingSnapshot;
 if(Object.keys(snapshot).some(k=>!['format','shopId','issuedAt','policy','calculation'].includes(k))||snapshot.format!=='payable_rounding_snapshot_v1')throw Error('payable_rounding_snapshot_mismatch');
 const verified=createPayableRoundingSnapshot(expected.shopId,expected.issuedAt,expected.before,snapshot.policy);
 if(snapshot.shopId!==verified.shopId||snapshot.issuedAt!==verified.issuedAt||!snapshot.calculation||Object.keys(snapshot.calculation).length!==Object.keys(verified.calculation).length||Object.entries(verified.calculation).some(([key,v])=>snapshot.calculation[key as keyof PayableRounding]!==v))throw Error('payable_rounding_snapshot_mismatch');
 return verified;
}
export function reversePayableRoundingSnapshot(snapshot:unknown,expected:{shopId:string;issuedAt:string;before:string},beforeReturned:string,afterReturned:string){
 const original=verifyPayableRoundingSnapshot(snapshot,expected);
 return {original,credit:reversePayableRounding(original.calculation,beforeReturned,afterReturned)};
}
export function assertPayableRoundingPreview(expected:PayableRoundingSnapshot,value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('payable_rounding_preview_mismatch');
 const response=value as {status:unknown;snapshot:unknown};if(response.status!=='preview_only')throw Error('payable_rounding_preview_mismatch');
 const snapshot=verifyPayableRoundingSnapshot(response.snapshot,{shopId:expected.shopId,issuedAt:expected.issuedAt,before:expected.calculation.before});
 if(JSON.stringify(snapshot)!==JSON.stringify(expected))throw Error('payable_rounding_preview_mismatch');return snapshot;
}
