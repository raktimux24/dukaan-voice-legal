/** Retain the exact product fields and request ID until an uncertain write resolves. */
export function createProductSaveIntent(uuid:()=>string){
 let pending:{fingerprint:string;body:Record<string,unknown>}|undefined;
 return {
  prepare(body:Record<string,unknown>){
   const fingerprint=JSON.stringify(body);
   if(pending){if(pending.fingerprint!==fingerprint)throw Error('product_image_save_pending');return pending.body;}
   const retained=JSON.parse(fingerprint);pending={fingerprint,body:{...retained,productRequestId:uuid()}};return pending.body;
  },
  succeeded(){pending=undefined;},
  failed(error:unknown){
   const e=error as {status?:number;code?:string};
   // A received, definitive validation/permission failure cannot have committed.
   if(e.status&&e.status>=400&&e.status<500&&![408,425,429].includes(e.status))pending=undefined;
  },
  unresolved:()=>!!pending,
  retry:()=>pending?.body,
 };
}
