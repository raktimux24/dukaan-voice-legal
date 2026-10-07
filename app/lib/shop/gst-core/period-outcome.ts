type Action={clientId:string;action:string;note:string;expectedSequence:number;expectedSourceFingerprint?:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const uuid=(value:unknown)=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function confirmedPeriodEvent(result:unknown,shopId:string,actorId:string,month:string,input:Action){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!object(result)||result.status!=='recorded'||!object(result.event))return fail();
 const event=result.event;
 if(!uuid(event.id)||event.shopId!==shopId||event.createdBy!==actorId||event.clientId!==input.clientId||event.month!==month||event.action!==input.action||event.note!==input.note.trim()||!Number.isSafeInteger(event.sequence)||event.sequence!==input.expectedSequence+1||typeof event.createdAt!=='string'||!Number.isFinite(Date.parse(event.createdAt)))return fail();
 if(input.action==='close'){
  if(event.sourceFingerprint!==input.expectedSourceFingerprint||!uuid(event.salesExportId)||!uuid(event.purchaseExportId))return fail();
 }else if(input.action!=='reopen'||event.sourceFingerprint!==null||event.salesExportId!==null||event.purchaseExportId!==null)return fail();
 return event;
}
