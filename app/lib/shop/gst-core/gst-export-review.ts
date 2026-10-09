import type {GstPreparationSummary as GstReportSummary} from '../gst-types';
export function gstExportReview(summary:GstReportSummary){
 const lines=summary.extendedFilingLines;
 const groups=summary.hsnPreparation;
 const assessed=Array.isArray(lines)&&Array.isArray(groups)&&Array.isArray(summary.turnoverPreparation);
 const documents=new Set((lines??[]).filter(line=>line.section==='review_required'||line.review.length>0).map(line=>line.id));
 const shortCodes=new Set((summary.turnoverPreparation??[]).flatMap(assessment=>assessment.shortCodes));
 const classifications=(groups??[]).filter(group=>group.review.length>0||group.recipient==='unverified'||shortCodes.has(`${group.codeType?.toUpperCase()} ${group.code}`)).length;
 const businessReviews=(summary.turnoverPreparation??[]).filter(assessment=>assessment.review.some(issue=>issue!=='classification_length_review_required')).length;
 const discrepancies=summary.discrepancies.length;
 return {status:!assessed?'unavailable':documents.size||classifications||businessReviews||discrepancies?'review':'checked',documents:documents.size,classifications,businessReviews,discrepancies} as const;
}
export type GstExportReviewReason='identity'|'date'|'classification'|'unit'|'quantity'|'service'|'amount'|'context'|'turnover'|'policy'|'code_length';
export function gstExportReviewItems(summary:GstReportSummary){
 const items=new Map<string,{reference:string;reason:GstExportReviewReason;digits?:number}>();
 const reason=(code:string):GstExportReviewReason=>/code_length/.test(code)?'code_length':/policy/.test(code)?'policy':/turnover/.test(code)?'turnover':/gstin|recipient|original_invoice_evidence/.test(code)?'identity':/date/.test(code)?'date':/unit/.test(code)?'unit':/service/.test(code)?'service':/quantity/.test(code)?'quantity':/classification|categories/.test(code)?'classification':/amount|value|mismatch/.test(code)?'amount':'context';
 const add=(reference:string,code:string,digits?:number)=>{const mapped=reason(code);items.set(JSON.stringify([reference,mapped,digits]),{reference,reason:mapped,...(digits===undefined?{}:{digits})});};
 for(const line of summary.extendedFilingLines??[]){for(const issue of line.review)add(line.number,issue);if(line.section==='review_required'&&!line.review.length)add(line.number,'context');}
 for(const group of summary.hsnPreparation??[]){const reference=`${group.codeType.toUpperCase()} ${group.code}`;for(const issue of group.review)add(reference,issue);if(group.recipient==='unverified')add(reference,'recipient');}
 for(const assessment of summary.turnoverPreparation??[]){if(assessment.review.includes('turnover_policy_period_review_required'))add(`FY ${assessment.reportingFinancialYear}`,'policy');if(assessment.review.includes('turnover_review_required'))add(`FY ${assessment.previousFinancialYear}`,'turnover');for(const code of assessment.shortCodes)add(code,'code_length',assessment.minimumCodeDigits??undefined);}
 for(const issue of summary.discrepancies)add('',issue.reason);
 return [...items.values()];
}
