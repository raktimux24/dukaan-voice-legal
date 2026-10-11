type Input={clientId:string;amount:number;method:string;note?:string;allocations?:{saleId:string;amount:number}[]};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const money=(value:unknown)=>typeof value==='string'&&/^-?[0-9]+\.[0-9]{2}$/.test(value)&&Number.isFinite(Number(value));
const uuid=(value:unknown)=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function confirmedCustomerPayment(result:unknown,shop:string,actor:string,customerId:string,input:Input){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!object(result)||result.status!=='recorded'||!object(result.entry)||!object(result.customer)||!Array.isArray(result.allocations))return fail();
 const entry=result.entry,customer=result.customer,expected=input.allocations??[];
 if(!uuid(entry.id)||entry.shopId!==shop||entry.customerId!==customerId||entry.createdBy!==actor||entry.clientId!==input.clientId||entry.type!=='payment'||entry.amount!==`-${input.amount.toFixed(2)}`||entry.method!==input.method||entry.note!==(input.note?.trim()||null)||typeof entry.createdAt!=='string'||!Number.isFinite(Date.parse(entry.createdAt))||customer.id!==customerId||customer.shopId!==shop||!money(customer.balance)||!money(entry.balanceAfter)||result.allocations.length!==expected.length)return fail();
 const ids=new Set<string>(),sales=new Set<string>();
 for(const row of result.allocations){
  if(!object(row)||!uuid(row.id)||ids.has(row.id as string)||typeof row.saleId!=='string'||sales.has(row.saleId)||row.shopId!==shop||row.customerId!==customerId||row.ledgerId!==entry.id||!expected.some(original=>original.saleId===row.saleId&&original.amount.toFixed(2)===row.amount))return fail();
  ids.add(row.id as string);sales.add(row.saleId);
 }
 return {customer:{...customer,balance:Number(customer.balance)},entry:{...entry,amount:Number(entry.amount),balanceAfter:Number(entry.balanceAfter)},allocations:result.allocations,deduplicated:true};
}
