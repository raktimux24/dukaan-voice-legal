import {createRequire} from 'node:module';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const require=createRequire(import.meta.url),root=process.env.GST_TEST_BUILD;
const {computeTotals,readCart,writeCart,readPending,writePending,useCart}=require(root+'/cart.js');
const {assertCartMrp,missingCartMrp,captureCartMrp,restoreCartMrp}=require(root+'/checkout-mrp.js');
const {prepareRspCartEntry}=require(root+'/rsp-cart-entry.js');
const shop='10000000-0000-4000-8000-000000000001',product='20000000-0000-4000-8000-000000000002',version='30000000-0000-4000-8000-000000000003',issuedAt='2026-11-04T00:00:00.000Z';
const context={settings:{version:'synthetic-settings',registration:'regular',gstin:'29ABCDE1234F1ZW',legalName:'SYNTHETIC ONLY',address:'Local fixture',stateCode:'29',priceMode:'inclusive',effectiveFrom:'2026-01-01',reviewed:true,eInvoiceRequired:false},priceMode:'inclusive',placeOfSupply:'29',issuedAt};
const tax={version:'synthetic-tax',category:'nil',codeType:'hsn',code:'1006',rate:0,reviewed:true};
function cart(price=80){
 const profile={format:'samaan_rsp_product_profile_v1',version,productId:product,rule:'cgst_rule_31d_2026',effectiveFrom:'2026-11-01T00:00:00.000Z',sourceReference:'SYNTHETIC',reviewed:true,goods:{hsn:'21069020',description:'pan_masala',reviewed:true,evidenceReference:'SYNTHETIC'},rates:{version:'SYNTHETIC',sourceReference:'SYNTHETIC',reviewed:true,cgst:20,sgst:20,utgst:0,igst:0}};
 const snapshot={version:1,shopId:shop,productId:product,capturedAt:issuedAt,profiles:[{version,recordedAt:profile.effectiveFrom,effectiveAt:profile.effectiveFrom,state:'reviewed',profile}]};
 const prepared=prepareRspCartEntry({key:'package',productId:product,name:'Pictured package',unit:'piece',quantity:1,price,listPrice:80,mrp:90,discount:0,trackStock:true,available:12},snapshot,shop,{area:'KA',packageId:'QA90',prices:'90',increases:'',evidence:'Synthetic package review',reviewed:true},issuedAt);
 return {lines:[prepared.line,{key:'ordinary',productId:'40000000-0000-4000-8000-000000000004',name:'No photo',unit:'piece',quantity:1,price:15,listPrice:15,mrp:null,discount:0,trackStock:true,available:8,gstConfig:tax}],billDiscount:0,note:'QA',customerId:null,customerName:null,customerPhone:null,customerClientId:null};
}
const check=(value,ctx=context)=>assertCartMrp(value,computeTotals(value,ctx),ctx);
test('actual mixed totals cannot issue a new bill above final-inclusive MRP',()=>{
 const value=cart(),before=structuredClone(value),totals=computeTotals(value,context);
 assert.equal(totals.total,120.71);assert.equal(totals.mixed.lines[0].evidence.calculation.payable,'105.71');
 assert.throws(()=>check(value),/price_above_mrp/);assert.deepEqual(value,before);
 value.lines.reverse();assert.throws(()=>check(value),/price_above_mrp/);
 value.lines[1].quantity=2;value.lines[1].rsp.valuation.packageCount=2;assert.throws(()=>check(value),/price_above_mrp/);
});
test('reviewed price reduction and proportional bill discount keep exact package tax',()=>{
 const value=cart(60);value.billDiscount=10;value.mixedDiscountReview={policy:'commercial_amount_proportional_v1',reviewed:true,evidenceReference:'Synthetic discount review'};
 const before=structuredClone(value),totals=computeTotals(value,context);assert.equal(totals.total,90.71);assert.equal(totals.mixed.tax,'25.71');assert.deepEqual(totals.mixed.billDiscount.allocations.map(row=>row.amount),['8.00','2.00']);assert.doesNotThrow(()=>check(value));assert.deepEqual(value,before);
});
test('ordinary exclusive GST, quantity and paise tolerance use line totals; services remain unbounded',()=>{
 const value=cart();value.lines=[{...value.lines[1],price:100,listPrice:100,mrp:100,gstConfig:{...tax,category:'taxable',rate:18}}];
 const exclusive={...context,priceMode:'exclusive',settings:{...context.settings,priceMode:'exclusive'}};
 assert.throws(()=>check(value,exclusive),/price_above_mrp/);value.lines[0].mrp=118;assert.doesNotThrow(()=>check(value,exclusive));
 value.lines[0].mrp=117.98;assert.throws(()=>check(value,exclusive),/price_above_mrp/);value.lines[0].mrp=117.99;assert.doesNotThrow(()=>check(value,exclusive));
 value.lines[0].mrp=1;value.lines[0].trackStock=false;assert.doesNotThrow(()=>check(value,exclusive));
 const rsp=cart();rsp.lines[0].trackStock=false;assert.throws(()=>check(rsp),/price_above_mrp/);
 assert.doesNotThrow(()=>assertCartMrp(cart(),computeTotals(cart()),null),'counter/fallback previews do not gain a throwing guard');
});
test('legacy missing/invalid limits fail closed; validated null is different from unknown',()=>{
 const value=cart(60);delete value.lines[0].mrp;assert.deepEqual(missingCartMrp(value),[product]);assert.throws(()=>check(value),/Refresh product MRP/);
 for(const mrp of [undefined,'90',NaN,Infinity,-1]){
  const item={shopId:shop,productId:product,product:{id:product,shopId:shop,mrp}};
  assert.throws(()=>captureCartMrp([item],shop,[product]),/Refresh product MRP/);
 }
 const item={shopId:shop,productId:product,product:{id:product,shopId:shop,mrp:null}},snapshot=captureCartMrp([item],shop,[product]);
 const restored=restoreCartMrp(value,snapshot,shop);assert.equal(restored.lines[0].mrp,null);assert.deepEqual(missingCartMrp(restored),[]);assert.doesNotThrow(()=>check(restored));
 for(const rows of [[],[item,item],[{...item,shopId:'foreign'}],[{...item,product:{...item.product,shopId:'foreign'}}]])assert.throws(()=>captureCartMrp(rows,shop,[product]),/Refresh product MRP/);
 assert.throws(()=>restoreCartMrp(value,snapshot,'foreign'),/another shop/);
});
test('actual saved working draft recovery preserves pending payload bytes and reviewed amounts',async()=>{
 const {IDBFactory}=require('fake-indexeddb'),data=new Map();
 Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});Object.defineProperty(globalThis,'indexedDB',{value:new IDBFactory(),configurable:true});
 Object.defineProperty(globalThis,'localStorage',{value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},configurable:true});
 Object.defineProperty(globalThis,'window',{value:{addEventListener:()=>{},removeEventListener:()=>{}},configurable:true});
 const value=cart(60);delete value.lines[0].mrp;const original=structuredClone(value),pending={clientId:'original-id',payload:{items:structuredClone(value.lines),payments:[{method:'cash',amount:100.71,tendered:110}]},fingerprint:'original-fingerprint',startedAt:1};
 writeCart('qa-actor',shop,value);writePending('qa-actor',shop,pending);const raw=data.get('samaan-pending-sale:qa-actor:'+shop);
 const snapshot=captureCartMrp([{shopId:shop,productId:product,product:{id:product,shopId:shop,mrp:90}}],shop,[product]);
 writeCart('qa-actor',shop,restoreCartMrp(readCart('qa-actor',shop),snapshot,shop));
 const recovered=readCart('qa-actor',shop);assert.deepEqual(recovered,{...original,lines:original.lines.map((line,index)=>index===0?{...line,mrp:90}:line)});assert.deepEqual(readPending('qa-actor',shop),pending);assert.equal(data.get('samaan-pending-sale:qa-actor:'+shop),raw);
 await new Promise(resolve=>setImmediate(resolve));
});
test('mounted actual cart retains numeric/null MRP for manual, voice and scanner additions',async()=>{
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
 const dom=new JSDOM('<div id="root"></div>',{url:'https://qa.example.invalid'});
 for(const key of ['window','document','navigator','localStorage'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
 Object.defineProperty(globalThis,'indexedDB',{value:new IDBFactory(),configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let current;function Probe(){current=useCart('qa-add',shop);return null;}const rootNode=createRoot(document.getElementById('root'));
 try{
  await act(async()=>rootNode.render(React.createElement(Probe)));
  for(const [index,method] of ['manual','voice','scan'].entries()){
   const id=product.slice(0,-1)+String(index+5),mrp=index===1?null:90;
   await act(async()=>{assert.equal(current.addProduct({shopId:shop,productId:id,quantity:10,unit:'piece',product:{id,shopId:shop,name:method,sellingPrice:60,mrp,trackStock:true}},1,method).ok,true);});
   assert.equal(current.cart.lines.at(-1).mrp,mrp);
  }
 }finally{await act(async()=>rootNode.unmount());dom.window.close();}
});
