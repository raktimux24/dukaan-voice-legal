import {reversePayableRoundingSnapshot,type PayableRoundingSnapshot} from './payable-rounding-snapshot';
const paise=(value:string)=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw Error('invalid_rounded_return_settlement');return BigInt(value.replace('.',''));};
const amount=(v:bigint)=>`${v/100n}.${(v%100n).toString().padStart(2,'0')}`;
/** Candidate settlement against original cumulative return evidence and current unpaid principal. */
export function settleRoundedReturn(snapshot:PayableRoundingSnapshot,expected:{shopId:string;issuedAt:string;before:string},beforeReturned:string,afterReturned:string,unpaidCredit:string){
 const original=reversePayableRoundingSnapshot(snapshot,expected,'0.00',beforeReturned);
 const returned=reversePayableRoundingSnapshot(snapshot,expected,beforeReturned,afterReturned);
 const capacity=paise(original.original.calculation.payable)-paise(original.credit.payable),unpaid=paise(unpaidCredit),gross=paise(returned.credit.payable);
 if(unpaid>capacity||gross>capacity)throw Error('rounded_return_capacity_mismatch');
 const creditReduced=unpaid<gross?unpaid:gross,refund=gross-creditReduced;
 return {...returned.credit,creditReduced:amount(creditReduced),refundAmount:amount(refund),remainingUnpaidCredit:amount(unpaid-creditReduced),remainingReturnPayable:amount(capacity-gross)};
}
