import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {eligiblePurchaseReceipts}=require(process.env.GST_TEST_BUILD+"/gst-core/purchase-batch-link.js");

const batch=(id,patch={})=>({id,initialQuantity:20,quantity:13,purchasePrice:6,purchaseItemId:null,...patch});
const rows=[batch('eligible'),batch('linked',{purchaseItemId:'invoice-item'}),batch('depleted',{quantity:0}),batch('different',{initialQuantity:10}),batch('unknown',{initialQuantity:null}),batch('costless',{purchasePrice:null}),batch('bad-cost',{purchasePrice:'bad'}),batch('negative',{quantity:-1}),batch('over',{quantity:21}),batch('free',{purchasePrice:0})];
assert.deepEqual(eligiblePurchaseReceipts(rows,20).map(row=>row.id),['eligible','depleted','free']);
assert.deepEqual(eligiblePurchaseReceipts(rows,13),[]);
assert.deepEqual(eligiblePurchaseReceipts(rows,0),[]);
assert.deepEqual(eligiblePurchaseReceipts(rows,NaN),[]);
assert.equal(rows[0].quantity,13);
assert.equal(rows[0].purchaseItemId,null);
assert.deepEqual(eligiblePurchaseReceipts([batch('fractional',{initialQuantity:'0.5',quantity:'0.2',purchasePrice:'6.00'})],0.5).map(row=>row.id),['fractional']);

console.log("Original quantity, depleted receipts, existing links and cost eligibility passed.");
