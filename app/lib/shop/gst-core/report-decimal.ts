// Retained monetary values are exact decimal cents, including negative ledger entries.
export function reportCents(value:unknown):bigint {
 const s=String(value??'0');
 if(!/^-?\d+(?:\.\d{1,2})?$/.test(s))throw new Error('invalid_report_amount');
 const negative=s.startsWith('-'),[whole,fraction='']=s.replace(/^-/,'').split('.');
 return (BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0')))*(negative?-1n:1n);
}
export const formatReportCents=(n:bigint)=>`${n<0n?'-':''}${(n<0n?-n:n)/100n}.${String((n<0n?-n:n)%100n).padStart(2,'0')}`;
