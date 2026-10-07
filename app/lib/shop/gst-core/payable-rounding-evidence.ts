import {fiscalHash,FISCAL_HASH_VERSION} from './fiscal-integrity';
import {createPayableRoundingSnapshot,verifyPayableRoundingSnapshot,type PayableRoundingSnapshot} from './payable-rounding-snapshot';
export interface RoundingInvoiceIdentity {saleId:string;number:string}
export interface PayableRoundingEvidence {document:RoundingInvoiceIdentity;snapshot:PayableRoundingSnapshot;hash:string;hashVersion:typeof FISCAL_HASH_VERSION}
function identity(value:RoundingInvoiceIdentity):RoundingInvoiceIdentity{
 if(!value||typeof value.saleId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.saleId)||typeof value.number!=='string'||!/^[A-Za-z0-9/-]{1,16}$/.test(value.number)||Object.keys(value).some(k=>!['saleId','number'].includes(k)))throw Error('invalid_rounding_invoice_identity');
 return {saleId:value.saleId.toLowerCase(),number:value.number};
}
export function createPayableRoundingEvidence(shopId:string,issuedAt:string,before:string,policy:unknown,document:RoundingInvoiceIdentity):PayableRoundingEvidence{
 const snapshot=createPayableRoundingSnapshot(shopId,issuedAt,before,policy),retained=identity(document);
 return {document:retained,snapshot,hash:fiscalHash({document:retained,snapshot}),hashVersion:FISCAL_HASH_VERSION};
}
export function verifyPayableRoundingEvidence(value:PayableRoundingEvidence,expected:{shopId:string;issuedAt:string;before:string;document:RoundingInvoiceIdentity}){
 if(!value||value.hashVersion!==FISCAL_HASH_VERSION||typeof value.hash!=='string'||fiscalHash({document:value.document,snapshot:value.snapshot})!==value.hash)throw Error('payable_rounding_hash_mismatch');
 const actual=identity(value.document),wanted=identity(expected.document);
 if(actual.saleId!==wanted.saleId||actual.number!==wanted.number)throw Error('payable_rounding_invoice_mismatch');
 return verifyPayableRoundingSnapshot(value.snapshot,expected);
}
