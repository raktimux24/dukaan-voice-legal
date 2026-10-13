import {fiscalHash,FISCAL_HASH_VERSION} from './fiscal-integrity';
import {verifyPayableRoundingEvidence,type PayableRoundingEvidence,type RoundingInvoiceIdentity} from './payable-rounding-evidence';
import {settleRoundedReturn} from './payable-rounding-return-settlement';
export interface RoundedReturnBasis {shopId:string;issuedAt:string;before:string;document:RoundingInvoiceIdentity}
export interface RoundedReturnInput {requestId:string;beforeReturned:string;afterReturned:string;unpaidCredit:string}
export interface RoundedReturnEvidence {
 format:'payable_rounding_return_v1';originalInvoice:RoundingInvoiceIdentity;originalRoundingHash:string;
 request:RoundedReturnInput;settlement:ReturnType<typeof settleRoundedReturn>;
 hashVersion:typeof FISCAL_HASH_VERSION;hash:string;
}
/** Original-invoice binding and cumulative settlement evidence; does not authorize or persist a refund. */
export function createRoundedReturnEvidence(original:PayableRoundingEvidence,basis:RoundedReturnBasis,input:RoundedReturnInput):RoundedReturnEvidence {
 const retained=structuredClone(original),expected=structuredClone(basis),request=structuredClone(input);
 if(!request||Object.keys(request).length!==4||Object.keys(request).some(key=>!['requestId','beforeReturned','afterReturned','unpaidCredit'].includes(key))||typeof request.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(request.requestId))throw Error('invalid_rounded_return_request');
 const snapshot=verifyPayableRoundingEvidence(retained,expected);
 // A return must increase the original tax-basis amount, including when final payable is zero.
 const settlement=settleRoundedReturn(snapshot,expected,request.beforeReturned,request.afterReturned,request.unpaidCredit);
 if(BigInt(request.afterReturned.replace('.',''))<=BigInt(request.beforeReturned.replace('.','')))throw Error('invalid_rounded_return_request');
 const document={format:'payable_rounding_return_v1' as const,originalInvoice:{...retained.document},originalRoundingHash:retained.hash,request,settlement};
 return {...document,hashVersion:FISCAL_HASH_VERSION,hash:fiscalHash(document)};
}
export function verifyRoundedReturnEvidence(value:RoundedReturnEvidence,original:PayableRoundingEvidence,basis:RoundedReturnBasis,request:RoundedReturnInput):RoundedReturnEvidence {
 if(!value||Object.keys(value).length!==7||Object.keys(value).some(key=>!['format','originalInvoice','originalRoundingHash','request','settlement','hashVersion','hash'].includes(key)))throw Error('rounded_return_evidence_mismatch');
 const expected=createRoundedReturnEvidence(original,basis,request);
 const {hash,hashVersion,...document}=value;
 if(hashVersion!==FISCAL_HASH_VERSION||hash!==fiscalHash(document)||fiscalHash(document)!==expected.hash)throw Error('rounded_return_evidence_mismatch');
 return expected;
}
