import {GST_VERSION,type TaxTotals} from './gst';
const amounts=['gross','discount','billDiscount','net','taxable','cgst','sgst','utgst','igst','tax','total'] as const;
function cents(value:unknown):bigint{
 if(typeof value!=='number'||!Number.isFinite(value))throw new Error('invalid_fiscal_amount');
 const s=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw new Error('invalid_fiscal_amount');
 const [whole,fraction='']=s.split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
}
/** Semantic reconciliation is independent of hashes: correctly hashed bad totals remain invalid. */
export function fiscalTotalsConsistent(totals:TaxTotals):boolean{
 try{
  if(totals.version!==GST_VERSION||!Array.isArray(totals.lines))return false;
  const sums=Object.fromEntries(amounts.map(k=>[k,0n])) as Record<typeof amounts[number],bigint>;
  for(const line of totals.lines){
   const row=Object.fromEntries(amounts.map(k=>[k,cents(line[k])])) as typeof sums;
   if(row.cgst+row.sgst+row.utgst+row.igst!==row.tax||row.net+row.tax!==row.total)return false;
   if(row.sgst>0n&&row.utgst>0n||row.igst>0n&&(row.cgst+row.sgst+row.utgst)>0n)return false;
   if(line.category==='taxable'?row.taxable!==row.net:row.taxable!==0n||row.tax!==0n)return false;
   for(const key of amounts)sums[key]+=row[key];
  }
  if(cents(totals.subtotal)!==sums.gross||cents(totals.discount)!==sums.discount+sums.billDiscount)return false;
  for(const key of ['billDiscount','net','taxable','cgst','sgst','utgst','igst','tax','total'] as const)if(cents(totals[key])!==sums[key])return false;
  return true;
 }catch{return false;}
}
