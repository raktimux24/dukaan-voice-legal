/** Checks retained allocation evidence; invoice refund capacity is checked separately. */
export function returnSettlementConsistent(value:unknown,total:string):boolean {
 try {
  if(!value||typeof value!=='object')return false;
  const s=value as Record<string,unknown>;
  const cents=(v:unknown)=>{if(typeof v!=='string'||!/^\d+\.\d{2}$/.test(v))throw new Error('invalid');return BigInt(v.replace('.',''));};
  if(s.version!==1||!['cash','upi','card'].includes(String(s.method))||s.total!==total||cents(s.creditReduction)+cents(s.moneyRefund)!==cents(s.total))return false;
  const reference=s.evidenceReference;
  if(reference!==null&&(typeof reference!=='string'||reference.length>500||!reference.trim()||reference!==reference.trim()))return false;
  return cents(s.moneyRefund)===0n||typeof reference==='string';
 }catch{return false;}
}
