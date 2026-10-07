import {verifyPayableRoundingSnapshot,type PayableRoundingSnapshot} from './payable-rounding-snapshot';
export interface RoundedTender {method:'cash'|'upi'|'card'|'credit';amount:string}
const paise=(v:unknown):bigint=>{if(typeof v!=='string'||!/^\d+\.\d{2}$/.test(v))throw Error('invalid_rounded_tender');return BigInt(v.replace('.',''));};
const amount=(v:bigint)=>`${v/100n}.${(v%100n).toString().padStart(2,'0')}`;
/** Candidate checkout contract: amounts are recorded tender values, not cash received before change. */
export function reconcileRoundedTenders(snapshot:PayableRoundingSnapshot,expected:{shopId:string;issuedAt:string;before:string},payments:readonly RoundedTender[],customerId:string|null){
 const verified=verifyPayableRoundingSnapshot(snapshot,expected);
 if(!Array.isArray(payments))throw Error('missing_rounded_tenders');
 const zero=paise(verified.calculation.payable)===0n;
 if(zero&&payments.length!==0)throw Error('zero_rounded_payable_requires_no_tenders');
 if(!zero&&payments.length===0)throw Error('missing_rounded_tenders');
 let paid=0n,credit=0n;
 for(const tender of payments){if(!tender||typeof tender!=='object'||Object.keys(tender).some(k=>!['method','amount'].includes(k))||!['cash','upi','card','credit'].includes(tender.method))throw Error('invalid_rounded_tender');const value=paise(tender.amount);if(tender.method==='credit')credit+=value;else paid+=value;}
 if(credit>0n&&(typeof customerId!=='string'||!customerId.trim()))throw Error('rounded_credit_requires_customer');
 if(paid+credit!==paise(verified.calculation.payable))throw Error('rounded_tenders_mismatch');
 return {before:verified.calculation.before,adjustment:verified.calculation.adjustment,total:verified.calculation.payable,paidTotal:amount(paid),creditTotal:amount(credit),collectionRequired:!zero,paymentStatus:credit===0n?'paid' as const:paid===0n?'credit' as const:'partial' as const};
}
