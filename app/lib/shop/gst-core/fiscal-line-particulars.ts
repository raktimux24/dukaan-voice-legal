import type {LineTax} from './gst';
export interface FiscalLineParticulars {
 classification:string;
 rate:number;
 gross:number;
 discount:number;
 net:number;
 taxable:number;
 components:{name:'CGST'|'SGST'|'UTGST'|'IGST';rate:number;amount:number}[];
 tax:number;
}
const classifications:Record<LineTax['category'],string>={taxable:'Taxable',nil:'Nil-rated',exempt:'Exempt',non_gst:'Non-GST',unknown:'Unclassified'};
/** Read original snapshots only. Component rates follow this domestic forward-charge contract. */
export function fiscalLineParticulars(line:LineTax):FiscalLineParticulars {
 return {
  classification:`${line.codeType.toUpperCase()} ${line.code} · ${classifications[line.category]}`,
  rate:line.rate,gross:line.gross,discount:Math.round((line.discount+line.billDiscount)*100)/100,
  net:line.net,taxable:line.taxable,tax:line.tax,
  components:([{name:'CGST',key:'cgst',rate:line.rate/2},{name:'SGST',key:'sgst',rate:line.rate/2},{name:'UTGST',key:'utgst',rate:line.rate/2},{name:'IGST',key:'igst',rate:line.rate}] as const)
   .filter(component=>line[component.key]>0).map(component=>({name:component.name,rate:component.rate,amount:line[component.key]})),
 };
}

const groupAmounts=['net','taxable','cgst','sgst','utgst','igst','tax','total'] as const;
type GroupAmount=typeof groupAmounts[number];
export interface FiscalTaxGroup {
 category:LineTax['category'];codeType:LineTax['codeType'];code:string;rate:number;classification:string;
 amounts:Record<GroupAmount,string>;
}
export function fiscalTaxGroups(lines:readonly LineTax[]):FiscalTaxGroup[]{
 const groups=new Map<string,{line:LineTax;amounts:Record<GroupAmount,bigint>}>();
 for(const line of lines){
  const key=JSON.stringify([line.category,line.codeType,line.code,line.rate]);
  let group=groups.get(key);
  if(!group){group={line,amounts:Object.fromEntries(groupAmounts.map(k=>[k,0n])) as Record<GroupAmount,bigint>};groups.set(key,group);}
  for(const k of groupAmounts){
   const amount=String(line[k]);
   if(!/^\d+(?:\.\d{1,2})?$/.test(amount))throw new Error('invalid_fiscal_line_amount');
   const [whole,fraction='']=amount.split('.');group.amounts[k]+=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  }
 }
 return [...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,group])=>({
  category:group.line.category,codeType:group.line.codeType,code:group.line.code,rate:group.line.rate,
  classification:fiscalLineParticulars(group.line).classification,
  amounts:Object.fromEntries(groupAmounts.map(k=>[k,`${group.amounts[k]/100n}.${String(group.amounts[k]%100n).padStart(2,'0')}`])) as Record<GroupAmount,string>,
 }));
}
