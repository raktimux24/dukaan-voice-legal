/** Audit text uses names and counts only; no stored image references or leases. */
export function productPhotoActivity(payload:Record<string,unknown>|null|undefined,t:(key:string,vars?:Record<string,string|number>)=>string){
 const p=payload??{},count=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0?Number(v):0;
 return t('product_images.activity',{name:String(p.productName??''),before:count(p.beforeCount),after:count(p.afterCount)})+(p.coverChanged===true?' · '+t('product_images.activity_cover'):'');
}
