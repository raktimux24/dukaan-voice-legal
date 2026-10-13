import {verifyPayableRoundingSnapshot,type PayableRoundingSnapshot} from './payable-rounding-snapshot';
const paise=(value:string)=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw Error('invalid_rounding_report_amount');return BigInt(value.replace('.',''));};
/** Keeps commercial revenue, reporting basis and round-off independently identifiable. */
export function projectRoundedReportAmounts(snapshot:PayableRoundingSnapshot,expected:{shopId:string;issuedAt:string;before:string},basis:{commercialNet:string;outputTax:string;reportingTaxableBase:string}){
 const verified=verifyPayableRoundingSnapshot(snapshot,expected),net=paise(basis.commercialNet),tax=paise(basis.outputTax);paise(basis.reportingTaxableBase);
 if(net+tax!==paise(verified.calculation.before))throw Error('rounding_report_basis_mismatch');
 return {format:'rounded_report_amounts_v1' as const,commercialNet:basis.commercialNet,outputTax:basis.outputTax,reportingTaxableBase:basis.reportingTaxableBase,beforePayable:verified.calculation.before,payableRoundOff:verified.calculation.adjustment,finalPayable:verified.calculation.payable,policyVersion:verified.policy.version};
}
