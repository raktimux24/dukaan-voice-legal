import { createHash } from '../gst-hash';
export const FISCAL_HASH_VERSION='canonical_json_v1';
export const FISCAL_DOCUMENT_HASH_VERSION='fiscal_document_v2';
export interface FiscalEnvelope {shopId:string;saleId:string;issuer:string;financialYear:string;number:string;type:string;issuedAt:Date|string;originalNumber?:string|null;payload:unknown}
export type FiscalHashRecord={payload:unknown;hash:string;hashVersion:string}&Partial<FiscalEnvelope>;
export function fiscalDocumentHash(document:FiscalEnvelope){
 const issuedAt=new Date(document.issuedAt);
 if(!Number.isFinite(issuedAt.getTime())||['shopId','saleId','issuer','financialYear','number','type'].some(key=>typeof document[key as keyof FiscalEnvelope]!=='string'||!document[key as keyof FiscalEnvelope]))throw new Error('invalid_fiscal_envelope');
 return fiscalHash({shopId:document.shopId,saleId:document.saleId,issuer:document.issuer,financialYear:document.financialYear,number:document.number,type:document.type,issuedAt:issuedAt.toISOString(),originalNumber:document.originalNumber??null,payload:document.payload});
}
function canonical(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical((value as Record<string,unknown>)[key])).join(',')+'}';
 return JSON.stringify(value);
}
export function fiscalHash(payload:unknown){
 // Apply JSON serialization semantics first (Dates, undefined and array nulls).
 return createHash('sha256').update(canonical(JSON.parse(JSON.stringify(payload)))).digest('hex');
}
export function verifyFiscalHash(document:FiscalHashRecord){
 if(document.hashVersion===FISCAL_DOCUMENT_HASH_VERSION){try{return fiscalDocumentHash(document as FiscalEnvelope)===document.hash?'verified' as const:'mismatch' as const;}catch{return 'mismatch' as const;}}
 if(document.hashVersion!==FISCAL_HASH_VERSION)return 'legacy_unverifiable' as const;
 return fiscalHash(document.payload)===document.hash?'verified' as const:'mismatch' as const;
}
