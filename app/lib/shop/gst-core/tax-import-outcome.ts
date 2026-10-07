const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function confirmedTaxImport(result:unknown,shop:string,actor:string,client:string,contentHash:string){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!object(result)||result.status!=='recorded'||!object(result.receipt))return fail();
 const receipt=result.receipt,value=receipt.result;
 if(receipt.shopId!==shop||receipt.userId!==actor||receipt.clientId!==client||receipt.contentHash!==contentHash||typeof receipt.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(receipt.id)||typeof receipt.createdAt!=='string'||!Number.isFinite(Date.parse(receipt.createdAt))||!object(value)||typeof value.reviewed!=='number'||typeof value.changed!=='number'||!Number.isSafeInteger(value.reviewed)||!Number.isSafeInteger(value.changed)||value.reviewed<1||value.reviewed>100||value.changed<0||value.changed>value.reviewed)return fail();
 return {reviewed:value.reviewed,changed:value.changed};
}
