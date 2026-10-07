import type {ProductTax} from './gst';
export interface PurchaseLineReviewDraft {productId:string;quantity:string;price:string;discount:string;tax:ProductTax|null;taxReviewContext?:string}
/** A review refers to contents, independent of object key insertion order. */
export function purchaseReviewSignature(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(purchaseReviewSignature).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().filter(key=>(value as Record<string,unknown>)[key]!==undefined).map(key=>JSON.stringify(key)+':'+purchaseReviewSignature((value as Record<string,unknown>)[key])).join(',')+'}';
 return JSON.stringify(value)??'null';
}
export function purchaseLineTaxForContext(line:PurchaseLineReviewDraft,context:string):ProductTax|null{
 return line.tax?{...line.tax,reviewed:line.tax.reviewed===true&&line.taxReviewContext===context}:null;
}
export function invalidatePurchaseLineReviews<T extends PurchaseLineReviewDraft>(lines:T[]):T[]{
 let changed=false;
 const next=lines.map(line=>{
  if(!line.tax?.reviewed&&line.taxReviewContext===undefined)return line;
  changed=true;return {...line,tax:line.tax?{...line.tax,reviewed:false}:null,taxReviewContext:undefined};
 });
 return changed?next:lines;
}
export function updatePurchaseLineDraft<T extends PurchaseLineReviewDraft>(line:T,patch:Partial<T>):T{
 const next={...line,...patch};
 const valueChanged=(['productId','quantity','price','discount'] as const).some(key=>key in patch&&patch[key]!==line[key]);
 const taxChanged=patch.tax!=null&&(line.tax==null||(['category','codeType','code','rate'] as const).some(key=>patch.tax![key]!==line.tax![key]));
 if(valueChanged||taxChanged){next.tax=next.tax?{...next.tax,reviewed:false}:null;next.taxReviewContext=undefined;}
 return next;
}
