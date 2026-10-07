import {financialYear,returnTax,type LineTax} from './gst';
import {invoiceIntegrity} from './invoice-integrity';
import {fiscalTotalsConsistent} from './fiscal-totals-integrity';
import {fiscalDocumentHash,FISCAL_DOCUMENT_HASH_VERSION,verifyFiscalHash,type FiscalEnvelope,type FiscalHashRecord} from './fiscal-integrity';
import {canonicalJson} from './sale-request-canonical';
type Document=FiscalEnvelope&FiscalHashRecord;
export interface OrdinaryCreditSelection {lineId:string;lineIndex:number;alreadyReturned:number;returning:number}
export interface OrdinaryCreditPayload {format:'samaan_ordinary_credit_v1';original:Document;returnId:string;requestId:string;createdBy:string;selections:OrdinaryCreditSelection[];projection:ReturnType<typeof projectOrdinaryCredit>;taxAdjustmentStatus:'review_required'}
export function projectOrdinaryCredit(original:Document,selections:readonly OrdinaryCreditSelection[]){
 const p=original.payload as {totals:Parameters<typeof fiscalTotalsConsistent>[0];items:{quantity:number;tax:LineTax}[]};
 if(original.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||invoiceIntegrity(original.payload,[original])!=='verified'||!fiscalTotalsConsistent(p.totals)||!Array.isArray(p.items)||p.items.length!==p.totals.lines.length||!Array.isArray(selections)||!selections.length)throw Error('invalid_ordinary_credit_original');
 const seen=new Set<number>(),ids=new Set<string>();
 const lines=selections.map(selection=>{
  if(!selection||Object.keys(selection).length!==4||Object.keys(selection).some(key=>!['lineId','lineIndex','alreadyReturned','returning'].includes(key))||typeof selection.lineId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(selection.lineId)||!Number.isInteger(selection.lineIndex)||seen.has(selection.lineIndex)||ids.has(selection.lineId))throw Error('invalid_ordinary_credit_selection');
  seen.add(selection.lineIndex);ids.add(selection.lineId);
  const item=p.items[selection.lineIndex];if(!item||canonicalJson(item.tax)!==canonicalJson(p.totals.lines[selection.lineIndex])||!Number.isFinite(item.quantity)||item.quantity<=0)throw Error('invalid_ordinary_credit_selection');
  const tax=returnTax(item.tax,item.quantity,selection.alreadyReturned,selection.returning);
  return {lineId:selection.lineId,lineIndex:selection.lineIndex,quantity:selection.returning,tax};
 });
 const sum=(key:keyof LineTax)=>{let value=0n;for(const line of lines){const amount=Number(line.tax[key]);if(!Number.isFinite(amount)||amount<0||Math.abs(amount*100-Math.round(amount*100))>1e-5)throw Error('invalid_ordinary_credit_amount');value+=BigInt(Math.round(amount*100));}return `${value/100n}.${String(value%100n).padStart(2,'0')}`;};
 return {lines,net:sum('net'),tax:sum('tax'),creditValue:sum('total'),reportingTaxableValue:sum('taxable'),components:{cgst:sum('cgst'),sgst:sum('sgst'),utgst:sum('utgst'),igst:sum('igst')}};
}
export function buildOrdinaryCreditDocument(original:Document,identity:{number:string;issuedAt:Date|string;returnId:string;requestId:string;createdBy:string},selections:readonly OrdinaryCreditSelection[]):Document{
 const retained=structuredClone(original),input=structuredClone(identity),chosen=structuredClone([...selections]);
 const payload:OrdinaryCreditPayload={format:'samaan_ordinary_credit_v1',original:retained,...{returnId:input.returnId,requestId:input.requestId,createdBy:input.createdBy},selections:chosen,projection:projectOrdinaryCredit(retained,chosen),taxAdjustmentStatus:'review_required'};
 const envelope:FiscalEnvelope={shopId:retained.shopId,saleId:retained.saleId,issuer:retained.issuer,financialYear:financialYear(new Date(input.issuedAt)),number:input.number,type:'credit_note',issuedAt:input.issuedAt,originalNumber:retained.number,payload};
 const result={...envelope,hashVersion:FISCAL_DOCUMENT_HASH_VERSION,hash:fiscalDocumentHash(envelope)};
 if(!ordinaryCreditConsistent(result,retained))throw Error('invalid_ordinary_credit_evidence');return result;
}
export function ordinaryCreditConsistent(document:Document,original:Document):boolean{
 try{
  const p=document.payload as OrdinaryCreditPayload;
  if(document.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||verifyFiscalHash(document)!=='verified'||p?.format!=='samaan_ordinary_credit_v1'||Object.keys(p).length!==8||Object.keys(p).some(key=>!['format','original','returnId','requestId','createdBy','selections','projection','taxAdjustmentStatus'].includes(key))||p.taxAdjustmentStatus!=='review_required'||p.original.hash!==original.hash||verifyFiscalHash(p.original)!=='verified'||[p.returnId,p.requestId,p.createdBy].some(value=>typeof value!=='string'||!value.trim()))return false;
  const issued=new Date(document.issuedAt).getTime();
  if(!Number.isFinite(issued)||issued<new Date(original.issuedAt).getTime()||document.financialYear!==financialYear(new Date(issued))||document.type!=='credit_note'||document.number===original.number||document.originalNumber!==original.number||document.shopId!==original.shopId||document.saleId!==original.saleId||document.issuer!==original.issuer)return false;
  return canonicalJson(projectOrdinaryCredit(original,p.selections))===canonicalJson(p.projection);
 }catch{return false;}
}

export interface OrdinaryReturnRow {lineId:string;lineIndex:number;returnedQuantity:number}
/** Caller supplies the authoritative original item ordering and independently verifies financial receipts. */
export function verifyOrdinaryCreditHistory(original:Document,documents:readonly Document[],rows:readonly OrdinaryReturnRow[]){
 const retained=structuredClone(original),history=structuredClone([...documents]),mapping=structuredClone([...rows]);
 const payload=retained.payload as {items:{quantity:number;tax:LineTax}[];totals:Parameters<typeof fiscalTotalsConsistent>[0]};
 const items=payload?.items;
 if(retained.hashVersion!==FISCAL_DOCUMENT_HASH_VERSION||invoiceIntegrity(retained.payload,[retained])!=='verified'||!fiscalTotalsConsistent(payload?.totals)||!Array.isArray(items)||items.length!==payload.totals.lines.length||items.some((item,index)=>!Number.isFinite(item.quantity)||item.quantity<=0||canonicalJson(item.tax)!==canonicalJson(payload.totals.lines[index])))throw Error('ordinary_credit_history_invalid');
 if(!Array.isArray(items)||mapping.length!==items.length||new Set(mapping.map(row=>row.lineIndex)).size!==items.length||new Set(mapping.map(row=>row.lineId)).size!==items.length||mapping.some(row=>typeof row.lineId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(row.lineId)||Math.abs(row.returnedQuantity*1000-Math.round(row.returnedQuantity*1000))>1e-7||!Number.isInteger(row.lineIndex)||row.lineIndex<0||row.lineIndex>=items.length||!Number.isFinite(row.returnedQuantity)||row.returnedQuantity<0))throw Error('ordinary_credit_history_invalid');
 const cumulative=new Map(mapping.map(row=>[row.lineId,0])),indices=new Map(mapping.map(row=>[row.lineIndex,row.lineId]));
 const requests=new Set<string>(),returns=new Set<string>(),numbers=new Set<string>();let issued=new Date(retained.issuedAt).getTime();
 for(const document of history){
  const p=document.payload as OrdinaryCreditPayload;
  if(!ordinaryCreditConsistent(document,retained)||requests.has(p.requestId)||returns.has(p.returnId)||numbers.has(document.number)||new Date(document.issuedAt).getTime()<issued)throw Error('ordinary_credit_history_invalid');
  requests.add(p.requestId);returns.add(p.returnId);numbers.add(document.number);issued=new Date(document.issuedAt).getTime();
  for(const selection of p.selections){
   if(indices.get(selection.lineIndex)!==selection.lineId||cumulative.get(selection.lineId)!==selection.alreadyReturned)throw Error('ordinary_credit_history_invalid');
   cumulative.set(selection.lineId,Math.round((selection.alreadyReturned+selection.returning)*1000)/1000);
  }
 }
 if(mapping.some(row=>row.returnedQuantity!==cumulative.get(row.lineId)))throw Error('ordinary_credit_quantity_history_mismatch');
 return cumulative;
}
export function planOrdinaryCreditFromDocuments(original:Document,documents:readonly Document[],rows:readonly OrdinaryReturnRow[],request:readonly {lineId:string;returning:number}[]){
 const retained=structuredClone(original),mapping=structuredClone([...rows]),chosen=structuredClone([...request]);
 const cumulative=verifyOrdinaryCreditHistory(retained,documents,mapping);
 const selections=chosen.map(selection=>({lineId:selection.lineId,lineIndex:mapping.find(row=>row.lineId===selection.lineId)?.lineIndex??-1,alreadyReturned:cumulative.get(selection.lineId)??0,returning:selection.returning}));
 return {selections,projection:projectOrdinaryCredit(retained,selections)};
}
