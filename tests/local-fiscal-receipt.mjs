import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {webcrypto,randomUUID} from 'node:crypto';
import {indexedDB} from 'fake-indexeddb';
globalThis.crypto??=webcrypto;globalThis.indexedDB=indexedDB;
const locks=new Map();
Object.defineProperty(globalThis,'navigator',{value:{locks:{request:async(key,fn)=>{const previous=locks.get(key)??Promise.resolve();let release;const next=new Promise(resolve=>release=resolve);locks.set(key,next);await previous;try{return await fn();}finally{release();}}}},configurable:true});
const require=createRequire(import.meta.url),root=process.env.GST_TEST_BUILD;
const {buildLocalFiscalReceipt,verifyLocalFiscalReceipt}=require(root+'/local-fiscal-receipt.js');
const {documentView}=require(root+'/gst-document-view.js');
const {quoteRoundedReservation}=require(root+'/rounded-reservation.js');
const {prepareOfflineInvoices}=require(root+'/invoice-preparation.js');
const {projectLocalStock,assertSaleStock}=require(root+'/local-stock.js');
const {issueSale,syncQueuedSales}=require(root+'/gst-issuance.js');
const {financialYear}=require(root+'/gst-core/gst.js');
const {canonicalSaleRequest}=require(root+'/gst-core/sale-request-canonical.js');
const storage=require(root+'/gst-storage.js');
const scope={actorId:'actor',shopId:randomUUID()},at='2026-10-09T12:00:00.000Z';
const tax={version:randomUUID(),category:'taxable',codeType:'hsn',code:'1006',rate:5,reviewed:true};
const settings={version:randomUUID(),registration:'regular',gstin:'29AAAGM0289C1ZF',legalName:'Synthetic Shop',address:'Bengaluru',stateCode:'29',priceMode:'exclusive',effectiveFrom:'2026-01-01',reviewed:true,eInvoiceRequired:false};
const allocation={id:randomUUID(),deviceEpoch:randomUUID(),financialYear:'2026-27',index:1,number:'26-1-001'};
const body={clientId:randomUUID(),soldAt:at,gstContext:{settings,priceMode:'exclusive',placeOfSupply:'29',issuedAt:at,documentRenderVersion:'gst_bill_v2',allocation},items:[{productId:randomUUID(),name:'Pen',unit:'piece',quantity:1,price:100,gstConfig:tax}],payments:[{method:'cash',amount:105}]};
const receipt=await buildLocalFiscalReceipt(scope,body);
assert.equal(documentView(receipt.document).tax,5);
assert.equal(receipt.document.number,'26-1-001');
assert.equal(receipt.document.integrity,'local_retained');
const row={...scope,id:body.clientId,path:`/api/shops/${scope.shopId}/sales`,createdAt:at,state:'pending',payload:body,verification:{localFiscalReceipt:receipt}};
assert.deepEqual(await verifyLocalFiscalReceipt(row,scope),receipt);
await assert.rejects(verifyLocalFiscalReceipt(row,{...scope,actorId:'other'}));
await assert.rejects(verifyLocalFiscalReceipt({...row,payload:{...body,note:'changed'}},scope));
await assert.rejects(verifyLocalFiscalReceipt({...row,verification:{localFiscalReceipt:{...receipt,document:{...receipt.document,number:'26-1-002'}}}},scope));
await assert.rejects(buildLocalFiscalReceipt(scope,{...body,payments:[{method:'cash',amount:100}]}));
await assert.rejects(buildLocalFiscalReceipt(scope,{...body,gstContext:{...body.gstContext,issuedAt:'2026-10-10T12:00:00.000Z'}}));
const composition={...body,gstContext:{...body.gstContext,settings:{...settings,registration:'composition'}},payments:[{method:'cash',amount:100}]};
const supplied=await buildLocalFiscalReceipt(scope,composition);
assert.equal(supplied.document.type,'bill_of_supply');assert.equal(documentView(supplied.document).tax,0);
const policy={format:'payable_rounding_policy_v1',version:randomUUID(),shopId:scope.shopId,mode:'nearest_rupee',effectiveFrom:'2026-10-09T11:00:00.000Z',effectiveUntil:null,reviewed:true,evidenceReference:'SYNTHETIC'};
const rounded={...body,items:[{...body.items[0],price:100.5}],payments:[{method:'cash',amount:106}]};
rounded.roundingSnapshot=quoteRoundedReservation(scope.shopId,rounded,policy).snapshot;
await assert.rejects(buildLocalFiscalReceipt(scope,rounded));
rounded.roundingGrant={id:randomUUID(),signedGrant:{format:'signed_rounding_issuance_grant_v1',keyId:'synthetic',signature:'a'.repeat(64),grant:{format:'payable_rounding_issuance_grant_v1',shopId:scope.shopId,actorId:scope.actorId,deviceEpoch:allocation.deviceEpoch,allocationId:allocation.id,financialYear:allocation.financialYear,block:1,issuer:settings.gstin,validFrom:policy.effectiveFrom,expiresAt:'2026-10-09T13:00:00.000Z',policy}}};
assert.equal(documentView((await buildLocalFiscalReceipt(scope,rounded)).document).total,106);
const wrongGrant=structuredClone(rounded);wrongGrant.roundingGrant.signedGrant.grant.actorId='other';
await assert.rejects(buildLocalFiscalReceipt(scope,wrongGrant));
const {normalizeRspProductProfile}=require(root+'/gst-core/rsp-profile-contract.js');
const {prepareRspCartEntry}=require(root+'/rsp-cart-entry.js');
const product=randomUUID();
const profile=normalizeRspProductProfile({format:'samaan_rsp_product_profile_v1',version:randomUUID(),productId:product,rule:'cgst_rule_31d_2026',effectiveFrom:'2026-02-01T00:00:00+05:30',sourceReference:'SYNTHETIC',reviewed:true,goods:{hsn:'21069020',description:'pan_masala',reviewed:true,evidenceReference:'SYNTHETIC'},rates:{version:'QA',sourceReference:'SYNTHETIC',reviewed:true,cgst:20,sgst:20,utgst:0,igst:0}});
const snapshot={version:1,shopId:scope.shopId,productId:product,capturedAt:at,profiles:[{version:profile.version,recordedAt:'2026-09-01T00:00:00.000Z',effectiveAt:profile.effectiveFrom,state:'reviewed',profile}]};
const prepared=prepareRspCartEntry({productId:product,name:'Synthetic package',unit:'piece',quantity:2,price:90,listPrice:100,discount:0,key:'pack'},snapshot,scope.shopId,{area:'QA',packageId:'pack',prices:'120,130',increases:'140',evidence:'SYNTHETIC',reviewed:true},at);
const mixed={...body,items:[prepared.line,body.items[0]],payments:[{method:'cash',amount:365}]};
const mixedReceipt=await buildLocalFiscalReceipt(scope,mixed);
assert.equal(documentView(mixedReceipt.document).total,365);
assert.equal(documentView(mixedReceipt.document).lines.length,2);
// A lost response leaves the fiscal receipt in the same atomic transaction as the consumed number.
storage.setFinancialScope(scope);
let settingsReads=0,provisions=0,sent;
const currentYear=financialYear(new Date()),allocationExpiry=new Date(Date.UTC(Number(currentYear.slice(0,4))+1,3,1)).toISOString();
const draft={...composition,clientId:randomUUID(),gstContext:{settings:composition.gstContext.settings,priceMode:'exclusive',placeOfSupply:'29'},soldAt:new Date().toISOString()};
const stockBaseline={format:'billing_catalog_v2',items:[{id:randomUUID(),shopId:scope.shopId,productId:draft.items[0].productId,unit:'piece',quantity:2,stockStatus:'OK',product:{id:draft.items[0].productId,shopId:scope.shopId,name:'Pen',unit:'piece',trackStock:true,minStockLevel:1}}],accountedRequestIds:[]};
const api={getAllInventory:async()=>projectLocalStock(stockBaseline,await storage.retainedRequests(scope),scope),gst:{provision:async(_shop,input)=>{provisions++;return {id:randomUUID(),issuer:settings.gstin,financialYear:currentYear,block:1,deviceEpoch:input.deviceEpoch,expiresAt:allocationExpiry};}},getPosSettings:async()=>{settingsReads++;return {gstAvailable:true,gstSettings:composition.gstContext.settings};},createSale:async(_shop,payload)=>{sent=payload;throw new TypeError('Failed to fetch');}};
await prepareOfflineInvoices(api,scope.shopId);
await prepareOfflineInvoices(api,scope.shopId);
assert.equal(provisions,1);assert.equal((await storage.readState(`allocation:${scope.actorId}:${scope.shopId}`)).next,1);
assert.equal((await storage.retainedRequests(scope)).length,0);
api.gst.provision=async()=>{throw Error('Offline provisioning must not be needed');};
await assert.rejects(issueSale(api,scope.shopId,draft),/Failed to fetch/);
const saved=(await storage.retainedRequests(scope)).find(r=>r.id===draft.clientId);
const local=await verifyLocalFiscalReceipt(saved,scope);
const state=await storage.readState(`allocation:${scope.actorId}:${scope.shopId}`);
assert.equal(state.next,2);assert.equal(local.document.number,`${currentYear.slice(2,4)}-1-001`);
// Two simultaneous new bills contend for the one remaining unit; only one may reserve a number.
const nextDraft={...draft,clientId:randomUUID()},tooMany={...draft,clientId:randomUUID()};
const raced=await Promise.allSettled([issueSale(api,scope.shopId,nextDraft),issueSale(api,scope.shopId,tooMany)]);
assert.match(raced[0].reason.message,/Failed to fetch/);assert.match(raced[1].reason.message,/Stock changed/);
assert.equal((await storage.readState(`allocation:${scope.actorId}:${scope.shopId}`)).next,3);
assert.equal((await api.getAllInventory())[0].quantity,0);
assert.equal((await storage.retainedRequests(scope)).some(row=>row.id===tooMany.clientId),false);
// The durable transaction also rejects a stale number even if a caller loses its lock.
const counterKey=`allocation:${scope.actorId}:${scope.shopId}`,counterBefore=await storage.readState(counterKey);
await assert.rejects(storage.reserveSale(counterKey,{...counterBefore,next:2},{...saved,id:randomUUID()}),/reserve/);
await storage.reserveSale(counterKey,{...counterBefore,next:2},saved);
assert.equal((await storage.readState(counterKey)).next,3);
api.createSale=async(_shop,payload)=>({sale:{id:randomUUID(),shopId:scope.shopId,soldBy:scope.actorId,clientId:payload.clientId,requestHash:await storage.sha256(canonicalSaleRequest({...payload,userId:scope.actorId})),gstIntegrity:'verified',gstSnapshot:{invoiceNumber:payload.gstContext.allocation.number,context:payload.gstContext}},deduplicated:true});
await issueSale(api,scope.shopId,{...draft,note:'Do not replace original'});
assert.equal(settingsReads,4);assert.equal((await storage.readState(`allocation:${scope.actorId}:${scope.shopId}`)).next,3);
const confirmed=(await storage.retainedRequests(scope)).find(r=>r.id===draft.clientId);
assert.equal(confirmed.state,'confirmed');assert.deepEqual((await verifyLocalFiscalReceipt(confirmed,scope)).document,local.document);
let syncCalls=0;
const originalCreate=api.createSale;api.createSale=async(...args)=>{syncCalls++;return originalCreate(...args);};
assert.equal(await syncQueuedSales(api,scope.shopId,()=>false),0);assert.equal(syncCalls,0);
assert.equal(await syncQueuedSales(api,scope.shopId),1);assert.equal(syncCalls,1);
assert.equal(await syncQueuedSales(api,scope.shopId),0);
assert.equal((await storage.readState(`allocation:${scope.actorId}:${scope.shopId}`)).next,3);
// Confirmation alone must not restore stock in an older retained catalog.
assert.equal((await api.getAllInventory())[0].quantity,0);
const updatedBaseline={...stockBaseline,items:[{...stockBaseline.items[0],quantity:1}],accountedRequestIds:[draft.clientId]};
assert.equal((await projectLocalStock(updatedBaseline,await storage.retainedRequests(scope),scope))[0].quantity,0);
const unlimited={...stockBaseline,items:[{...stockBaseline.items[0],quantity:0,product:{...stockBaseline.items[0].product,trackStock:false}}]};
assertSaleStock([{...draft.items[0],quantity:99}],unlimited.items);
assert.throws(()=>assertSaleStock([{...draft.items[0],quantity:1},{...draft.items[0],quantity:2}],stockBaseline.items),/Stock changed/);
console.log('Local receipt: tax/composition/rounding, exact request binding, scope/tamper rejection, atomic lost-response retention and immutable replay passed.');

// Exercise the real read-through API: a cached stock baseline must not resurrect a confirmed local sale.
process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test';
const {bindApi}=require(root+'/api.js'),originalFetch=globalThis.fetch;
try{
 const catalogApi=bindApi(async()=> 'token',{actorId:scope.actorId,sessionId:'stock-test',isCurrent:()=>true,isSessionCurrent:()=>true});
 globalThis.fetch=async()=>Response.json({items:[{...stockBaseline.items[0],quantity:3}],hasMore:false});
 assert.equal((await catalogApi.getAllInventory(scope.shopId,true,false,true))[0].quantity,3);
 const extra=structuredClone(sent);extra.clientId=randomUUID();extra.gstContext.allocation.index=3;extra.gstContext.allocation.number=`${currentYear.slice(2,4)}-1-003`;
 const extraReceipt=await buildLocalFiscalReceipt(scope,extra);
 await storage.retainRequest({...scope,id:extra.clientId,path:`/api/shops/${scope.shopId}/sales`,payload:extra,createdAt:extra.soldAt,state:'pending',verification:{localFiscalReceipt:extraReceipt}});
 globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};
 assert.equal((await catalogApi.getAllInventory(scope.shopId,true,false,true))[0].quantity,2);
 await storage.requestStatus(extra.clientId,{state:'confirmed'});
 assert.equal((await catalogApi.getAllInventory(scope.shopId,true,false,true))[0].quantity,2);
 globalThis.fetch=async()=>Response.json({items:[{...stockBaseline.items[0],quantity:2}],hasMore:false});
 assert.equal((await catalogApi.getAllInventory(scope.shopId,true,false,true))[0].quantity,2);
 globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};
 assert.equal((await catalogApi.getAllInventory(scope.shopId,true,false,true))[0].quantity,2);
}finally{globalThis.fetch=originalFetch;}
console.log('Queued stock: concurrent last-unit reservation, stale-cache confirmation, fresh baseline and reconnect replay passed.');

// Rounding preparation retains the original grant request after a lost response, without consuming a number.
const warmScope={actorId:'prepared-actor',shopId:randomUUID()};storage.setFinancialScope(warmScope);
const warmFrom=new Date(Date.now()-60000).toISOString(),warmUntil=new Date(Date.now()+3600000).toISOString();
const warmPolicy={...policy,version:randomUUID(),shopId:warmScope.shopId,effectiveFrom:warmFrom,effectiveUntil:null};
let warmProvisions=0,grantCalls=0,grantRequest;
const warmApi={getPosSettings:async()=>({gstAvailable:true,gstSettings:composition.gstContext.settings,gstPayableRoundingAvailable:true}),gst:{
 provision:async(_shop,input)=>{warmProvisions++;return {id:randomUUID(),issuer:settings.gstin,financialYear:currentYear,block:2,deviceEpoch:input.deviceEpoch,expiresAt:allocationExpiry};},
 roundingSelection:async(shopId,issuedAt)=>({format:'payable_rounding_selection_v1',shopId,issuedAt,refreshAt:warmUntil,status:'selection_only',selection:{version:warmPolicy.version,createdAt:warmFrom,policy:warmPolicy}}),
 roundingGrant:async(shopId,input)=>{
  grantCalls++;
  if(!grantRequest){grantRequest=input;throw new TypeError('Lost grant response');}
  assert.deepEqual(input,grantRequest);
  return {id:randomUUID(),signedGrant:{format:'signed_rounding_issuance_grant_v1',keyId:'synthetic',signature:'a'.repeat(64),grant:{format:'payable_rounding_issuance_grant_v1',shopId,actorId:warmScope.actorId,deviceEpoch:input.deviceEpoch,allocationId:input.allocationId,financialYear:currentYear,block:2,issuer:settings.gstin,validFrom:warmFrom,expiresAt:warmUntil,policy:warmPolicy}}};
 }
}};
await assert.rejects(prepareOfflineInvoices(warmApi,warmScope.shopId),/Lost grant response/);
assert.equal((await storage.readState(`allocation:${warmScope.actorId}:${warmScope.shopId}`)).next,1);
const warmed=await prepareOfflineInvoices(warmApi,warmScope.shopId);
assert.equal(warmed.expiresAt,warmUntil);
await prepareOfflineInvoices(warmApi,warmScope.shopId);
assert.equal(warmProvisions,1);assert.equal(grantCalls,2);
assert.equal((await storage.readState(`allocation:${warmScope.actorId}:${warmScope.shopId}`)).next,1);
assert.equal((await storage.retainedRequests(warmScope)).length,0);
console.log('Invoice preparation: number/grant reuse, no counter consumption and immutable lost-response grant retry passed.');

// Ordinary local bills retain the exact request without borrowing a fiscal number.
const {buildLocalOrdinaryReceipt,verifyLocalIssuedReceipt}=require(root+'/local-issued-receipt.js');
const plainScope={actorId:'ordinary-actor',shopId:randomUUID()};storage.setFinancialScope(plainScope);
const plain={clientId:randomUUID(),soldAt:new Date().toISOString(),items:[{productId:randomUUID(),name:'Notebook',unit:'piece',quantity:1,price:80,listPrice:100,discount:5}],discountAmount:5,payments:[{method:'cash',amount:70}],customer:{name:'Synthetic customer'}};
const plainReceipt=await buildLocalOrdinaryReceipt(plainScope,plain);
assert.equal(plainReceipt.subtotal,100);assert.equal(plainReceipt.discount,30);assert.equal(plainReceipt.total,70);
const plainRow={...plainScope,id:plain.clientId,path:`/api/shops/${plainScope.shopId}/sales`,payload:plain,createdAt:plain.soldAt,state:'pending',verification:{localOrdinaryReceipt:plainReceipt}};
assert.equal((await verifyLocalIssuedReceipt(plainRow,plainScope)).kind,'ordinary');
const selectedPayload={...plain,clientId:randomUUID(),customerId:'selected-customer',customer:{name:'Existing buyer',phone:'9111222112'}};
const selectedReceipt=await buildLocalOrdinaryReceipt(plainScope,selectedPayload);
const selectedRow={...plainRow,id:selectedPayload.clientId,payload:JSON.parse(JSON.stringify(selectedPayload)),verification:{localOrdinaryReceipt:JSON.parse(JSON.stringify(selectedReceipt))}};
assert.equal((await verifyLocalIssuedReceipt(selectedRow,plainScope)).receipt.customer.name,'Existing buyer');
const alteredName=structuredClone(selectedRow);alteredName.verification.localOrdinaryReceipt.customer.name='Another buyer';await assert.rejects(verifyLocalIssuedReceipt(alteredName,plainScope));
const changedSelection=structuredClone(selectedRow);changedSelection.payload.customerId='another-id';await assert.rejects(verifyLocalIssuedReceipt(changedSelection,plainScope));

for(const mutate of [r=>r.payload.payments[0].amount=69,r=>r.verification.localOrdinaryReceipt.total=71,r=>r.actorId='other',r=>r.path='/other',r=>r.state='closed']){
 const altered=structuredClone(plainRow);mutate(altered);await assert.rejects(verifyLocalIssuedReceipt(altered,plainScope));
}
await assert.rejects(buildLocalOrdinaryReceipt(plainScope,{...plain,gstContext:body.gstContext}));
const plainCatalog={format:'billing_catalog_v2',items:[{productId:plain.items[0].productId,unit:'piece',quantity:2,product:{id:plain.items[0].productId,isActive:true,trackStock:true,minStockLevel:0}}],accountedRequestIds:[]};
let uploaded=[];
const plainApi={getPosSettings:async()=>({gstSettings:null}),getAllInventory:async()=>projectLocalStock(plainCatalog,await storage.retainedRequests(plainScope),plainScope),createSale:async(_shop,p)=>{uploaded.push(structuredClone(p));throw new TypeError('Failed to fetch');}};
await assert.rejects(issueSale(plainApi,plainScope.shopId,plain),/Failed to fetch/);
const plainNext={...plain,clientId:randomUUID()};
await assert.rejects(issueSale(plainApi,plainScope.shopId,plainNext),/Failed to fetch/);
assert.equal((await plainApi.getAllInventory())[0].quantity,0);
await assert.rejects(issueSale(plainApi,plainScope.shopId,{...plain,clientId:randomUUID()}),/Stock changed/);
assert.equal((await storage.retainedRequests(plainScope)).length,2);
assert.equal(await storage.readState(`allocation:${plainScope.actorId}:${plainScope.shopId}`),undefined);
plainApi.createSale=async(_shop,p)=>{uploaded.push(structuredClone(p));return {sale:{id:randomUUID(),shopId:plainScope.shopId,soldBy:plainScope.actorId,clientId:p.clientId,requestHash:await storage.sha256(canonicalSaleRequest({...p,userId:plainScope.actorId}))}};};
assert.equal(await syncQueuedSales(plainApi,plainScope.shopId),2);
assert.deepEqual(uploaded[0],uploaded[2]);assert.deepEqual(uploaded[1],uploaded[3]);
assert.equal(await syncQueuedSales(plainApi,plainScope.shopId),0);
console.log('Ordinary receipts: discount/payment totals, immutable request binding, scope/tamper guards, consecutive queued stock and original reconnect replay passed.');
