type Input={clientId:string;reason:string;priceMode:string;items:{originalSaleItemId:string;quantity:number;price:number}[]};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const uuid=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
export function confirmedDebitNote(result:unknown,shop:string,actor:string,sale:string,input:Input){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!input||!uuid(input.clientId)||typeof input.reason!=='string'||!input.reason.trim()||!['inclusive','exclusive'].includes(input.priceMode)||!Array.isArray(input.items)||!input.items.length||input.items.length>100||input.items.some(i=>!i||!uuid(i.originalSaleItemId)||!Number.isFinite(i.quantity)||i.quantity<=0||!Number.isFinite(i.price)||i.price<=0)||new Set(input.items.map(i=>i.originalSaleItemId)).size!==input.items.length)return fail();
 if(!object(result)||result.status!=='recorded'||!object(result.adjustment)||!object(result.document)||!object(result.ledger))return fail();
 const {adjustment,document,ledger}=result;
 if(!uuid(adjustment.id)||adjustment.shopId!==shop||adjustment.createdBy!==actor||adjustment.saleId!==sale||adjustment.clientId!==input.clientId||adjustment.type!=='debit_note'||!uuid(adjustment.customerId)||!uuid(document.id)||document.id!==adjustment.documentId||document.shopId!==shop||document.saleId!==sale||document.type!=='debit_note'||!object(document.payload))return fail();
 const payload=document.payload;
 if(payload.createdBy!==actor||payload.type!=='debit_note'||payload.reason!==input.reason.trim()||payload.priceMode!==input.priceMode||!Array.isArray(payload.items)||payload.items.length!==input.items.length)return fail();
 const seen=new Set<string>();
 for(const row of payload.items){if(!object(row)||typeof row.originalSaleItemId!=='string'||seen.has(row.originalSaleItemId))return fail();seen.add(row.originalSaleItemId);const original=input.items.find(i=>i.originalSaleItemId===row.originalSaleItemId);if(!original||row.quantity!==original.quantity||row.price!==original.price)return fail();}
 if(!uuid(ledger.id)||ledger.id!==adjustment.ledgerId||ledger.shopId!==shop||ledger.customerId!==adjustment.customerId||ledger.createdBy!==actor||ledger.type!=='adjustment_debit'||ledger.note!==input.reason.trim()||typeof adjustment.grossAmount!=='string'||!/^\d+\.\d{2}$/.test(adjustment.grossAmount)||Number(adjustment.grossAmount)<=0||ledger.amount!==adjustment.grossAmount)return fail();
 return {adjustment,document,deduplicated:true};
}
