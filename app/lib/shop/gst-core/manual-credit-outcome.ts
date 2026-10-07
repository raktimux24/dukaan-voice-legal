type Input={clientId:string;reason:string;priceMode:string;items:{originalSaleItemId:string;quantity:number;price:number}[];settlement:{creditReduction:number;moneyRefund:number;method:string;evidenceReference?:string}};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const uuid=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
const money=(v:unknown):bigint|null=>typeof v==='string'&&/^\d+\.\d{2}$/.test(v)?BigInt(v.replace('.','')):null;
const equal=(a:unknown,b:unknown):boolean=>{if(a===b)return true;if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((v,i)=>equal(v,b[i]));if(object(a)&&object(b)){const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&equal(a[k],b[k]));}return false;};
export function confirmedManualCredit(result:unknown,shop:string,actor:string,sale:string,input:Input){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!input||!uuid(input.clientId)||typeof input.reason!=='string'||!input.reason.trim()||!['inclusive','exclusive'].includes(input.priceMode)||!Array.isArray(input.items)||!input.items.length||input.items.some(i=>!i||!uuid(i.originalSaleItemId)||!Number.isFinite(i.quantity)||i.quantity<=0||!Number.isFinite(i.price)||i.price<=0)||new Set(input.items.map(i=>i.originalSaleItemId)).size!==input.items.length||!input.settlement)return fail();
 const original=input.settlement;
 if([original.creditReduction,original.moneyRefund].some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v*100-Math.round(v*100))>1e-5))return fail();
 if(!Number.isFinite(original.creditReduction)||original.creditReduction<0||!Number.isFinite(original.moneyRefund)||original.moneyRefund<0||original.creditReduction+original.moneyRefund<=0||!['cash','upi','card'].includes(original.method)||original.evidenceReference!==undefined&&typeof original.evidenceReference!=='string')return fail();
 if(!object(result)||result.status!=='recorded'||result.evidenceStatus!=='verified'||!Array.isArray(result.discrepancies)||result.discrepancies.length||!object(result.note)||!object(result.document))return fail();
 const {note,document}=result;
 if(!uuid(note.id)||note.shopId!==shop||note.createdBy!==actor||note.saleId!==sale||note.clientId!==input.clientId||!uuid(document.id)||document.id!==note.documentId||document.shopId!==shop||document.saleId!==sale||document.type!=='credit_note'||document.integrity!=='verified'||!object(document.payload)||!object(note.plan)||!object(note.settlement))return fail();
 const payload=document.payload,plan=note.plan,settlement=note.settlement;
 if(payload.createdBy!==actor||plan.type!=='credit_note'||plan.reason!==input.reason.trim()||plan.priceMode!==input.priceMode||!Array.isArray(plan.items)||plan.items.length!==input.items.length)return fail();
 if(typeof note.createdAt!=='string'||!Number.isFinite(Date.parse(note.createdAt))||typeof document.issuedAt!=='string'||Date.parse(document.issuedAt)!==Date.parse(note.createdAt)||Object.keys(plan).some(key=>!equal(plan[key],payload[key]))||!equal(settlement,payload.settlement)||!object(plan.totals))return fail();
 const gross=money(note.grossAmount),credit=money(note.creditReduction),cash=money(note.moneyRefund);
 if(gross===null||gross<=0n||credit===null||cash===null||credit+cash!==gross||settlement.total!==note.grossAmount||typeof plan.totals.total!=='number'||!Number.isFinite(plan.totals.total)||plan.totals.total.toFixed(2)!==note.grossAmount)return fail();
 const seen=new Set<string>();for(const row of plan.items){if(!object(row)||typeof row.originalSaleItemId!=='string'||seen.has(row.originalSaleItemId))return fail();seen.add(row.originalSaleItemId);const saved=input.items.find(i=>i.originalSaleItemId===row.originalSaleItemId);if(!saved||row.quantity!==saved.quantity||row.price!==saved.price)return fail();}
 const reduction=original.creditReduction.toFixed(2),refund=original.moneyRefund.toFixed(2);
 if(note.creditReduction!==reduction||note.moneyRefund!==refund||settlement.creditReduction!==reduction||settlement.moneyRefund!==refund||settlement.method!==original.method||settlement.evidenceReference!==(original.evidenceReference?.trim()||null)||original.creditReduction>0&&!uuid(note.creditLedgerId)||original.creditReduction===0&&note.creditLedgerId!==null||original.moneyRefund>0&&!uuid(note.refundPaymentId)||original.moneyRefund===0&&note.refundPaymentId!==null)return fail();
 return {note,document,deduplicated:true};
}
