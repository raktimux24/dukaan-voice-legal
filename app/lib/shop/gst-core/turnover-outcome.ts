import type {TurnoverReviewInput} from './gst-turnover-review';
export function confirmedTurnoverReview(result:unknown,shopId:string,actorId:string,year:string,input:TurnoverReviewInput){
 const fail=():never=>{throw new Error('purchase_request_outcome_unconfirmed');};
 if(!result||typeof result!=='object'||Array.isArray(result))return fail();
 const {review,replayed}=result as Record<string,any>;
 if(typeof replayed!=='boolean'||!review||typeof review!=='object'||Array.isArray(review)||
 typeof review.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(review.id)||
 review.shopId!==shopId||review.createdBy!==actorId||review.financialYear!==year||review.clientId!==input.clientId.toLowerCase()||review.sequence!==input.expectedSequence+1||
 typeof input.amount!=='string'||!/^\d{1,16}(?:\.\d{1,2})?$/.test(input.amount)||typeof review.createdAt!=='string'||!Number.isFinite(Date.parse(review.createdAt)))return fail();
 const [whole,fraction='']=input.amount.split('.');const amount=`${whole.replace(/^0+(?=\d)/,'')}.${fraction.padEnd(2,'0')}`;
 if(review.amount!==amount||review.evidenceReference!==input.evidenceReference.trim())return fail();
 return review;
}
