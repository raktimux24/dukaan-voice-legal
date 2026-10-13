import {GstError} from './gst';
import {reportCents,formatReportCents} from './report-decimal';
export interface ReturnSettlementInput {creditReduction:number;moneyRefund:number;method:'cash'|'upi'|'card';evidenceReference?:string}
export interface ReturnSettlementCapacity {returnTotal:string;unpaidCredit:string;refundableMoney:string;unassignedCollections:string}
export interface ReturnSettlementPlan {version:1;creditReduction:string;moneyRefund:string;method:'cash'|'upi'|'card';evidenceReference:string|null;total:string}
// The credit note reverses original discounted sale/tax values. This contract
// only allocates its gross value between unpaid credit and actual money refund.
// Capacity must come from original tender + explicit collections - prior
// credit/money reversals, under the shop transaction lock, never total debt.
export function planReturnSettlement(capacity:ReturnSettlementCapacity,input:ReturnSettlementInput):ReturnSettlementPlan{
 if(!input||!['cash','upi','card'].includes(input.method)||[input.creditReduction,input.moneyRefund].some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>9999999999.99||Math.abs(n*100-Math.round(n*100))>1e-5)||input.evidenceReference!==undefined&&(typeof input.evidenceReference!=='string'||input.evidenceReference.length>500))throw new GstError('invalid_return_settlement');
 const credit=reportCents(input.creditReduction.toFixed(2)),money=reportCents(input.moneyRefund.toFixed(2));
 let total:bigint,unpaid:bigint,refundable:bigint,unassigned:bigint;
 try{total=reportCents(capacity.returnTotal);unpaid=reportCents(capacity.unpaidCredit);refundable=reportCents(capacity.refundableMoney);unassigned=reportCents(capacity.unassignedCollections);}catch{throw new GstError('invalid_return_settlement_capacity');}
 if(total<0n||unpaid<0n||refundable<0n||unassigned<0n)throw new GstError('invalid_return_settlement_capacity');
 if(unassigned>0n)throw new GstError('unassigned_credit_collections_require_review');
 if(credit+money!==total)throw new GstError('return_settlement_total_mismatch');
 if(credit>unpaid)throw new GstError('return_credit_exceeds_unpaid_invoice');
 if(money>refundable)throw new GstError('return_money_exceeds_collected_invoice');
 const evidence=input.evidenceReference?.trim()||null;if(money>0n&&!evidence)throw new GstError('return_refund_evidence_required');
 return {version:1,creditReduction:formatReportCents(credit),moneyRefund:formatReportCents(money),method:input.method,evidenceReference:evidence,total:formatReportCents(total)};
}
