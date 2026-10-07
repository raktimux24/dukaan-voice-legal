type Input={clientId:string;kind:string;amount:number;method:string;occurredAt:string;evidenceReference:string;reason:string;reversesId?:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const uuid=(value:unknown)=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function confirmedDebitSettlement(result:unknown,shop:string,actor:string,adjustment:string,input:Input){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!input||!uuid(input.clientId)||!['collection','collection_reversal'].includes(input.kind)||!['cash','upi','card'].includes(input.method)||typeof input.amount!=='number'||!Number.isFinite(input.amount)||input.amount<=0||typeof input.occurredAt!=='string'||!Number.isFinite(Date.parse(input.occurredAt))||typeof input.evidenceReference!=='string'||!input.evidenceReference.trim()||typeof input.reason!=='string'||!input.reason.trim()||input.kind==='collection_reversal'&&!uuid(input.reversesId)||input.kind==='collection'&&input.reversesId!==undefined)return fail();
 if(!object(result)||result.status!=='recorded'||!object(result.event)||!object(result.ledger)||!object(result.balance))return fail();
 const {event,ledger,balance}=result;
 if(!uuid(event.ledgerId)||!uuid(ledger.id))return fail();
 if(!object(balance.obligation)||!object(balance.document)||balance.integrity!=='verified'||balance.obligation.id!==adjustment||balance.obligation.shopId!==shop||balance.document.id!==balance.obligation.documentId||balance.document.shopId!==shop||!Array.isArray(balance.events))return fail();
 const amount=input.amount.toFixed(2),date=new Date(input.occurredAt).toISOString();
 if(typeof event.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(event.id)||event.shopId!==shop||event.createdBy!==actor||event.adjustmentId!==adjustment||event.clientId!==input.clientId||event.kind!==input.kind||event.amount!==amount||event.method!==input.method||event.occurredAt!==date||event.evidenceReference!==input.evidenceReference.trim()||event.reason!==input.reason.trim()||event.reversesId!==(input.reversesId??null))return fail();
 if(ledger.id!==event.ledgerId||ledger.shopId!==shop||ledger.customerId!==balance.obligation.customerId||ledger.createdBy!==actor||ledger.method!==input.method||ledger.note!==input.reason.trim()||ledger.type!==(input.kind==='collection'?'adjustment_payment':'adjustment_payment_reversal')||ledger.amount!==(input.kind==='collection'?'-'+amount:amount))return fail();
 const retained=balance.events.find(row=>object(row)&&row.id===event.id);
 if(balance.events.filter(row=>object(row)&&row.id===event.id).length!==1)return fail();
 if(!object(retained)||['shopId','createdBy','adjustmentId','clientId','kind','amount','method','occurredAt','evidenceReference','reason','reversesId','ledgerId'].some(key=>retained[key]!==event[key]))return fail();
 if(input.kind==='collection_reversal'){
  const source=balance.events.find(row=>object(row)&&row.id===input.reversesId);
  if(!object(source)||source.kind!=='collection'||source.shopId!==shop||source.adjustmentId!==adjustment||source.amount!==amount||source.method!==input.method)return fail();
 }
 return {event,balance,deduplicated:true};
}
