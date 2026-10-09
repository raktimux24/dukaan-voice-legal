import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { indexedDB } from 'fake-indexeddb';
const require = createRequire(import.meta.url);
const storage = require(`${process.env.GST_TEST_BUILD}/gst-storage.js`);
const {closeUnrecordedPurchase} = require(`${process.env.GST_TEST_BUILD}/gst-recovery.js`);
const {canonicalJson} = require(`${process.env.GST_TEST_BUILD}/gst-core/sale-request-canonical.js`);
Object.defineProperty(globalThis,'indexedDB',{value:indexedDB});
Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
const shopId='11111111-1111-4111-8111-111111111111';
const invoiceId='22222222-2222-4222-8222-222222222222';
const scope={actorId:'owner-a',shopId};
storage.setFinancialScope(scope);
const makeRow=async(suffix)=>{
 const id=crypto.randomUUID();
 const row={...scope,id,path:`/api/shops/${shopId}/purchases/${invoiceId}/${suffix}`,payload:{clientId:id,amount:'10.00',evidenceReference:'synthetic'},state:'pending',createdAt:new Date().toISOString()};
 await storage.retainRequest(row);return row;
};
const receipt=async(body)=>({status:'closed',shopId,operation:body.operation,clientId:body.request.clientId,invoiceId:body.invoiceId,requestHash:await storage.sha256(canonicalJson(body.request)),receiptId:crypto.randomUUID()});
for(const [suffix,operation] of [['itc-review','review'],['returns','return'],['settlements','settlement'],['settlement-reversals','settlement-reversal']]){
 const row=await makeRow(suffix);let sent;
 const api={gst:{post:async(path,body)=>{assert.equal(path,`/api/shops/${shopId}/purchases/request-closure`);sent=body;return receipt(body);}}};
 await closeUnrecordedPurchase(api,shopId,row,'Correct rejected synthetic request');
 assert.equal(sent.operation,operation);assert.deepEqual(sent.request,row.payload);
 const saved=(await storage.retainedRequests(scope)).find(x=>x.id===row.id);
 assert.equal(saved.state,'closed');assert.deepEqual(saved.payload,row.payload);assert.equal(saved.result.status,'closed');
 await assert.rejects(closeUnrecordedPurchase(api,shopId,row,'again'),/cannot be closed/);
}
for(const failure of ['network','recorded','hash','invoice','actor']){
 const row=await makeRow('settlements');
 const api={gst:{post:async(_path,body)=>{
  if(failure==='network')throw Error('Connection lost');
  if(failure==='recorded')throw Error('purchase_request_already_recorded');
  const result=await receipt(body);
  if(failure==='hash')result.requestHash='bad';
  if(failure==='invoice')result.invoiceId='wrong';
  if(failure==='actor')storage.setFinancialScope({actorId:'owner-b',shopId});
  return result;
 }}};
 await assert.rejects(closeUnrecordedPurchase(api,shopId,row,'synthetic correction'));
 storage.setFinancialScope(scope);
 const saved=(await storage.retainedRequests(scope)).find(x=>x.id===row.id);
 assert.equal(saved.state,'pending');assert.deepEqual(saved.payload,row.payload);
}
const confirmed=await makeRow('returns');await storage.requestStatus(confirmed.id,{state:'confirmed'});
let sends=0;const neverSend={gst:{post:async()=>{sends++;throw Error('must not send');}}};
await assert.rejects(closeUnrecordedPurchase(neverSend,shopId,confirmed,'stale row'));
const altered=await makeRow('returns');await assert.rejects(closeUnrecordedPurchase(neverSend,shopId,{...altered,payload:{...altered.payload,amount:'20.00'}},'changed'));
await assert.rejects(closeUnrecordedPurchase(neverSend,shopId,{...altered,path:altered.path.replace('/api/shops/','/wrongpath/')},'bad path'));
await assert.rejects(closeUnrecordedPurchase(neverSend,shopId,altered,' '.repeat(501)));
assert.equal(sends,0);
console.log('Purchase closure preserves exact evidence, guards stale state/scope, and requires verified terminal receipts.');
