import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {canReversePurchaseSettlement}=require(process.env.GST_TEST_BUILD+"/gst-core/purchase-settlement.js");

const row=(id,kind,amount,reversesId=null)=>({id,kind,amount,reversesId});
const paid=row('p','payment','10.50'),refund=row('f','supplier_refund','5.25');
assert.equal(canReversePurchaseSettlement('10.50',['5.25'],[paid,refund],'p'),false);
assert.equal(canReversePurchaseSettlement('10.50',['5.25'],[paid,refund],'f'),true);
const corrected=[paid,refund,row('fr','supplier_refund_reversal','5.25','f')];
assert.equal(canReversePurchaseSettlement('10.50',['5.25'],corrected,'p'),true);
assert.equal(canReversePurchaseSettlement('10.50',['5.25'],corrected,'f'),false);
assert.equal(canReversePurchaseSettlement('10.50',[],[paid],'missing'),false);
assert.equal(canReversePurchaseSettlement('10.50',[],[paid,row('pr','payment_reversal','10.50','p')],'p'),false);
assert.equal(canReversePurchaseSettlement('10.50',[],[paid,row('pr','payment_reversal','10.50','p')],'pr'),false);
// A different payment may cover the refund: do not block all payments indiscriminately.
assert.equal(canReversePurchaseSettlement('10.50',['10.50'],[row('a','payment','4.00'),row('b','payment','6.50'),row('c','supplier_refund','6.50')],'a'),true);
assert.equal(canReversePurchaseSettlement('10.50',['10.50'],[row('a','payment','4.00'),row('b','payment','6.50'),row('c','supplier_refund','6.50')],'b'),false);
// Exact paise, including values beyond safe floating-point cent arithmetic.
assert.equal(canReversePurchaseSettlement('9999999999.99',[],[row('a','payment','9999999999.99'),row('b','supplier_refund','0.01')],'a'),false);
assert.equal(canReversePurchaseSettlement('0.03',['0.03'],[row('a','payment','0.03'),row('b','supplier_refund','0.01'),row('c','payment','0.01')],'c'),true);
assert.equal(canReversePurchaseSettlement('bad',[],[paid],'p'),false);
assert.equal(canReversePurchaseSettlement('10.50',['11.00'],[paid],'p'),false);

console.log("Purchase reversal dependencies and exact-paise checks passed.");
