/** Fiscal dates belong to the retained Indian issue instant, never the viewing device's zone. */
export function indianCalendarDate(now:Date=new Date()):string {
 const instant=now.getTime();
 if(!Number.isFinite(instant))throw new Error('invalid_fiscal_issue_date');
 return new Date(instant+330*60_000).toISOString().slice(0,10);
}

export function validIndianDocumentDate(value:string,now:Date=new Date()):boolean {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const parsed=new Date(`${value}T00:00:00Z`);
 return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value&&value<=indianCalendarDate(now);
}

export function fiscalDateLabel(issuedAt:string,locale:string='en-IN'):string {
 // Explicit offsets (or an ISO date-only legacy value) avoid device-local interpretation.
 if(!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(issuedAt))throw new Error('invalid_fiscal_issue_date');
 const [year,month,day]=issuedAt.slice(0,10).split('-').map(Number);
 const leap=year%4===0&&(year%100!==0||year%400===0);
 const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 if(month<1||month>12||day<1||day>days[month-1])throw new Error('invalid_fiscal_issue_date');
 if(issuedAt.includes('T')){
  const [hour,minute,second]=issuedAt.slice(11,19).split(':').map(Number);
  const offset=issuedAt.match(/[+-](\d{2}):(\d{2})$/);
  if(hour>23||minute>59||second>59||offset&&(Number(offset[1])>23||Number(offset[2])>59))throw new Error('invalid_fiscal_issue_date');
 }
 const instant=new Date(issuedAt);
 if(!Number.isFinite(instant.getTime()))throw new Error('invalid_fiscal_issue_date');
 return `${new Intl.DateTimeFormat(typeof locale==='string'?locale:'en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}).format(instant)} IST`;
}
