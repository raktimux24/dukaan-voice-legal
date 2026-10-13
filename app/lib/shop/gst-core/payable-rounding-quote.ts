import {calculateTax,type TaxInput,type GstContext} from './gst';
import {createPayableRoundingSnapshot} from './payable-rounding-snapshot';
import {reconcileRoundedTenders,type RoundedTender} from './payable-rounding-payments';
import {projectRoundedReportAmounts} from './payable-rounding-report';
import {projectMixedGstInvoice} from './mixed-gst-projection';
function snapshotQuoteInput<T>(value:T):T{
 return JSON.parse(JSON.stringify(value,(_key,item)=>{if(typeof item==='number'&&!Number.isFinite(item))throw Error('invalid_rounding_quote_number');return item;})) as T;
}
/** Candidate ordinary-sale quote; not an authorization to issue the document. */
export function quoteRoundedOrdinarySale(input:{shopId:string;issuedAt:string;policy:unknown;items:TaxInput[];discount:number;context:GstContext;payments:readonly RoundedTender[];customerId:string|null}){
 if(input.context.issuedAt!==undefined&&Date.parse(input.context.issuedAt)!==Date.parse(input.issuedAt))throw Error('rounding_quote_issue_time_mismatch');
 const tax=calculateTax(input.items,input.discount,input.context);
 const before=tax.total.toFixed(2),snapshot=createPayableRoundingSnapshot(input.shopId,input.issuedAt,before,input.policy),expected={shopId:input.shopId,issuedAt:input.issuedAt,before};
 const settlement=reconcileRoundedTenders(snapshot,expected,input.payments,input.customerId);
 const report=projectRoundedReportAmounts(snapshot,expected,{commercialNet:tax.net.toFixed(2),outputTax:tax.tax.toFixed(2),reportingTaxableBase:tax.taxable.toFixed(2)});
 return {format:'rounded_ordinary_quote_v1' as const,status:'quote_only' as const,tax,snapshot,settlement,report};
}
/** Preserves mixed statutory/reporting evidence; rounds only the combined payable. */
export function quoteRoundedMixedSale(input:{shopId:string;issuedAt:string;policy:unknown;items:Parameters<typeof projectMixedGstInvoice>[0];context:GstContext;billDiscount?:Parameters<typeof projectMixedGstInvoice>[2];payments:readonly RoundedTender[];customerId:string|null}){
 if(!input.context.issuedAt||Date.parse(input.context.issuedAt)!==Date.parse(input.issuedAt))throw Error('rounding_quote_issue_time_mismatch');
 const invoice=projectMixedGstInvoice(input.items,input.context,input.billDiscount);
 const snapshot=createPayableRoundingSnapshot(input.shopId,input.issuedAt,invoice.payable,input.policy),expected={shopId:input.shopId,issuedAt:input.issuedAt,before:invoice.payable};
 const settlement=reconcileRoundedTenders(snapshot,expected,input.payments,input.customerId);
 const report=projectRoundedReportAmounts(snapshot,expected,{commercialNet:invoice.net,outputTax:invoice.tax,reportingTaxableBase:invoice.reportingTaxableValue});
 return {format:'rounded_mixed_quote_v1' as const,status:'quote_only' as const,invoice,snapshot,settlement,report};
}

/** Build wire input and independent expected quote together, retaining commercial discount evidence. */
export function prepareOrdinaryRoundingQuote(input:Parameters<typeof quoteRoundedOrdinarySale>[0]&{productIds:readonly string[]}){
 const retained=snapshotQuoteInput(input);
 if(!Array.isArray(retained.productIds)||retained.productIds.length!==retained.items.length||retained.productIds.some(id=>typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))throw Error('invalid_rounding_quote_items');
 const expected=quoteRoundedOrdinarySale(retained);
 const request={reviewVersion:expected.snapshot.policy.version,issuedAt:retained.issuedAt,items:retained.items.map((item,index)=>({productId:retained.productIds[index],quantity:item.quantity,price:item.price,...(item.listPrice==null?{}:{listPrice:item.listPrice}),...(item.discount===undefined?{}:{discount:item.discount})})),discount:retained.discount,placeOfSupply:retained.context.placeOfSupply,...(retained.context.buyer?{buyer:retained.context.buyer}:{}),payments:retained.payments,customerId:retained.customerId};
 return {shopId:retained.shopId,expected,request};
}

export function prepareMixedRoundingQuote(input:Parameters<typeof quoteRoundedMixedSale>[0]&{productIds:readonly string[]}){
 const retained=snapshotQuoteInput(input);
 if(!Array.isArray(retained.productIds)||retained.productIds.length!==retained.items.length||retained.productIds.some(id=>typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))throw Error('invalid_rounding_quote_items');
 const items=retained.items.map((line,index)=>({...line,lineId:`line-${index}`}));
 const expected=quoteRoundedMixedSale({...retained,items});
 const request={reviewVersion:expected.snapshot.policy.version,issuedAt:retained.issuedAt,items:items.map((line,index)=>{
  const productId=retained.productIds[index];
  if(line.kind==='ordinary')return {productId,quantity:line.input.quantity,price:line.input.price,...(line.input.listPrice==null?{}:{listPrice:line.input.listPrice}),...(line.input.discount===undefined?{}:{discount:line.input.discount})};
  if(line.transaction.productId!==productId)throw Error('rounding_quote_product_mismatch');
  const quantity=line.transaction.valuation.packageCount;
  if(!Number.isSafeInteger(quantity)||quantity<=0||!/^\d+(?:\.\d{1,2})?$/.test(line.transaction.grossSaleValue))throw Error('invalid_rsp_quote_unit_price');
  const [whole,fraction='']=line.transaction.grossSaleValue.split('.'),grossPaise=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  if(grossPaise%BigInt(quantity)!==0n||grossPaise/BigInt(quantity)>BigInt(Number.MAX_SAFE_INTEGER))throw Error('invalid_rsp_quote_unit_price');
  const price=Number(grossPaise/BigInt(quantity))/100;
  return {productId,quantity,price,discount:Number(line.transaction.discount),rsp:{profileVersion:line.profile.version,valuation:line.transaction.valuation,rounding:line.transaction.rounding}};
 }),...(retained.billDiscount?{billDiscount:retained.billDiscount}:{}),placeOfSupply:retained.context.placeOfSupply,...(retained.context.buyer?{buyer:retained.context.buyer}:{}),payments:retained.payments,customerId:retained.customerId};
 return {shopId:retained.shopId,expected,request};
}
