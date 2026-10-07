type Input={clientId:string;ledgerId:string;reason:string;allocations:{saleId:string;amount:number}[]};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const uuid=(value:unknown)=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function confirmedCollectionReview(result:unknown,shop:string,actor:string,customer:string,input:Input){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!object(result)||result.status!=='recorded'||!object(result.review))return fail();
 const review=result.review;
 if(!uuid(review.id)||review.shopId!==shop||review.customerId!==customer||review.createdBy!==actor||review.clientId!==input.clientId||review.ledgerId!==input.ledgerId||review.reason!==input.reason.trim()||typeof review.createdAt!=='string'||!Number.isFinite(Date.parse(review.createdAt))||!Array.isArray(review.links)||review.links.length!==input.allocations.length)return fail();
 const ids=new Set<string>(),sales=new Set<string>();
 for(const row of review.links){
  if(!object(row)||!uuid(row.id)||typeof row.saleId!=='string'||ids.has(row.id as string)||sales.has(row.saleId)||!input.allocations.some(original=>original.saleId===row.saleId&&original.amount.toFixed(2)===row.amount))return fail();
  ids.add(row.id as string);sales.add(row.saleId);
 }
 return review;
}
