/** A photo/metadata edit must not replay the displayed tax setup as a tax write. */
export function productFormTaxPatch<T>(creating:boolean,edited:boolean,config:T):{gstConfig?:T}{
 return creating||edited?{gstConfig:config}:{};
}

/** Older photo drafts predate the explicit edit marker; preserve their changed tax value. */
export function restoredTaxWasEdited(flag:string|undefined,config:unknown,baseline:unknown){
 if(flag===undefined)return JSON.stringify(config)!==JSON.stringify(baseline);
 if(flag!=='true'&&flag!=='false')throw Error('product_image_recovery_unavailable');
 return flag==='true';
}
