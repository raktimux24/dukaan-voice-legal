/** The absence of loaded results is not evidence that no scan has run. */
export function gstMonitorView(input:{hasData:boolean;pending:boolean;fetchStatus:string;error:boolean;completed:boolean;truncated:boolean;issueCount:number;enabled?:boolean;unconfirmed?:boolean}){
 if(!input.hasData)return input.fetchStatus==='paused'?'offline':input.error?'unavailable':'loading';
 if(input.error||input.unconfirmed||input.fetchStatus==='paused'||input.enabled===false)return 'stale';
 if(!input.completed)return 'never_checked';
 if(input.issueCount)return 'attention';
 if(input.truncated)return 'partial';
 return 'checked';
}
export const CORE_MONITOR_KINDS=new Set(['integrityMismatch','legacyHashes','missingProfiles','numberConflict','missingInvoices','missingCreditNotes','unbalancedSales','closedPeriodChanged']);

/** A successful POST alone does not prove the displayed saved results include that check. */
export function gstMonitorReceiptConfirmed(receipt: unknown, report: unknown): boolean {
 const result=receipt as {skipped?:boolean;run?:{id?:string;status?:string;scannedDocuments?:number}}|null;
 const saved=report as {runs?:{id?:string;status?:string;scannedDocuments?:number}[]}|null;
 const run=result?.run;
 return result?.skipped===false&&typeof run?.id==='string'&&run.id.length>0&&run.status==='completed'&&Number.isSafeInteger(run.scannedDocuments)&&run.scannedDocuments!>=0&&Array.isArray(saved?.runs)&&saved.runs.some(row=>row?.id===run.id&&row.status==='completed'&&row.scannedDocuments===run.scannedDocuments);
}
