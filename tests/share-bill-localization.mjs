import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {billPlainText,shareBill}=require(process.env.GST_TEST_BUILD+'/share-bill.js');
const labels={bill:'বিল',subtotal:'উপমোট',discount:'ছাড়',total:'মোট',thanks:'ধন্যবাদ'};
const bill={shopName:'Test shop',saleNumber:12,when:'10 Oct',lines:[{name:'Test item',detail:'1 × ₹10',amount:'₹10'}],subtotal:'₹10',discount:'₹1',total:'₹9',payments:['নগদ · ₹9'],labels};
const text=billPlainText(bill);
for(const value of Object.values(labels))assert.ok(text.includes(value));
assert.ok(!/Bill|Subtotal|Discount|Total|Thank you/.test(text));
assert.ok(billPlainText({...bill,footer:'Custom footer'}).endsWith('Custom footer'));
assert.ok(billPlainText({...bill,labels:undefined}).includes('Bill #12'));
const drawn=[];
const ctx=new Proxy({fillText(value){drawn.push(value);},measureText(value){return {width:[...value].length*7};}}, {get(target,key){return target[key]??(()=>{});}});
const canvas={getContext:()=>ctx,toBlob:callback=>callback(null)};
const oldDocument=globalThis.document;
const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
let shared;
try{
 globalThis.document={createElement:()=>canvas};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{share:async value=>{shared=value;}}});
 assert.equal(await shareBill(bill),'shared');
 assert.equal(shared.title,'Test shop · বিল #12');
 assert.equal(shared.text,text);
 for(const value of [labels.subtotal,labels.discount,labels.total,labels.thanks])assert.ok(drawn.includes(value));
 assert.ok(drawn.includes('বিল #12'));
 console.log('Bill sharing: localized text, image labels, share title and custom footer passed.');
}finally{
 globalThis.document=oldDocument;
 if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;
}
