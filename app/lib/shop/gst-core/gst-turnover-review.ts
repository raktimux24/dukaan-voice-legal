import {GstError} from './gst';
import {reportCents,formatReportCents} from './report-decimal';
export interface TurnoverReviewInput {clientId:string;expectedSequence:number;amount:string;evidenceReference:string;reviewed:true}
export function validTurnoverFinancialYear(year:string){
 const match=/^(20\d{2})-(\d{2})$/.exec(year);
 return !!match&&Number(match[2])===(Number(match[1])+1)%100;
}
/** AATO is business-wide evidence, never inferred from this app's shop sales. */
export function normalizeTurnoverReview(year:string,raw:unknown):TurnoverReviewInput{
 const input=raw as Record<string,unknown>;
 if(!validTurnoverFinancialYear(year)||!input||typeof input!=='object'||Array.isArray(input)||
 typeof input.clientId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.clientId)||
 !Number.isSafeInteger(input.expectedSequence)||(input.expectedSequence as number)<0||(input.expectedSequence as number)>=2147483647||input.reviewed!==true||
 typeof input.amount!=='string'||!/^\d{1,16}(?:\.\d{1,2})?$/.test(input.amount)||
 typeof input.evidenceReference!=='string'||!input.evidenceReference.trim()||input.evidenceReference.length>500)throw new GstError('invalid_turnover_review');
 return {clientId:input.clientId.toLowerCase(),expectedSequence:input.expectedSequence as number,amount:formatReportCents(reportCents(input.amount)),evidenceReference:input.evidenceReference.trim(),reviewed:true};
}
export function turnoverMinimumCodeDigits(amount:string):4|6{
 if(!/^\d{1,16}\.\d{2}$/.test(amount))throw new GstError('invalid_turnover_review');
 return reportCents(amount)>5000000000n?6:4;
}
