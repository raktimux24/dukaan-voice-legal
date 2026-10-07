export type PayableRoundingMode='none'|'nearest_rupee';
export interface PayableRounding {version:'payable_rounding_v1';mode:PayableRoundingMode;before:string;adjustment:string;payable:string}
const parse=(value:string):bigint=>{if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw new Error('invalid_payable_rounding_amount');return BigInt(value.replace('.',''));};
const decimal=(v:bigint):string=>`${v<0n?'-':''}${(v<0n?-v:v)/100n}.${((v<0n?-v:v)%100n).toString().padStart(2,'0')}`;
/** Candidate commercial contract; not enabled in issuance workflows. */
export function roundPayable(before:string,mode:PayableRoundingMode):PayableRounding {
 const amount=parse(before);if(mode!=='none'&&mode!=='nearest_rupee')throw new Error('invalid_payable_rounding_mode');
 const payable=mode==='none'?amount:((amount+50n)/100n)*100n;
 return {version:'payable_rounding_v1',mode,before:decimal(amount),adjustment:decimal(payable-amount),payable:decimal(payable)};
}
/** Original adjustment allocated cumulatively; full reversal is exact. */
export function reversePayableRounding(original:PayableRounding,beforeReturned:string,afterReturned:string){
 const verified=roundPayable(original.before,original.mode);
 if(original.version!==verified.version||original.before!==verified.before||original.adjustment!==verified.adjustment||original.payable!==verified.payable)throw new Error('payable_rounding_evidence_mismatch');
 const total=parse(original.before),before=parse(beforeReturned),after=parse(afterReturned);
 if(before>after||after>total)throw new Error('invalid_payable_rounding_return');
 const adjustment=parse(verified.adjustment.replace(/^-/,'')),sign=verified.adjustment.startsWith('-')?-1n:1n;
 const allocated=(returned:bigint)=>total===0n?0n:sign*((adjustment*returned*2n+total)/(2n*total));
 const reversed=allocated(after)-allocated(before),gross=after-before;
 return {before:decimal(gross),adjustment:decimal(reversed),payable:decimal(gross+reversed)};
}
