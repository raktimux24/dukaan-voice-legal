// Dependency-free contract shared by Node and the native sync verifier.
export function canonicalJson(value:unknown):string{
 const normalized=JSON.parse(JSON.stringify(value));
 const encode=(v:unknown):string=>Array.isArray(v)?'['+v.map(encode).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+encode((v as Record<string,unknown>)[k])).join(',')+'}':JSON.stringify(v);
 return encode(normalized);
}
export function canonicalSaleRequest(input:{userId:string;soldAt?:string|Date;gstContext?:unknown;items:unknown;payments:unknown;discountAmount?:number;mixedDiscountReview?:unknown;roundingSnapshot?:unknown;roundingGrant?:unknown;customerId?:string|null;customer?:unknown;note?:string|null;inputMethod?:string}){
 return canonicalJson({version:1,userId:input.userId,soldAt:input.soldAt==null?null:new Date(input.soldAt).toISOString(),gstContext:input.gstContext??null,items:input.items,payments:input.payments,discountAmount:input.discountAmount??0,customerId:input.customerId??null,customer:input.customer??null,note:input.note??null,inputMethod:input.inputMethod??'manual',...(input.roundingSnapshot===undefined?{}:{roundingSnapshot:input.roundingSnapshot}),...(input.roundingGrant===undefined?{}:{roundingGrant:input.roundingGrant}),...(input.mixedDiscountReview===undefined?{}:{mixedDiscountReview:input.mixedDiscountReview})});
}
