const fs=require('node:fs'),ts=require('typescript'),{test}=require('node:test'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {billingActions,billingDate,invoiceHref}=require('../app/lib/shop/billing.ts');
const base={status:'active',plan:'monthly',hasMandate:true,currentPeriodEnd:'2027-01-01',isPremium:true};
test('only owners can change billing in every subscription state',()=>{
 for(const status of ['none','trialing','active','past_due','canceled','expired','legacy_free','pending_authentication']){
 const a=billingActions({...base,status,pendingReason:'plan_switch',canCancelPendingSwitch:true},false);
 for(const key of ['subscribe','manage','cancel','pending'])assert.equal(a[key],false);
 }
});
test('automatic trials can subscribe but have no mandate to cancel',()=>{
 const a=billingActions({...base,status:'trialing',hasMandate:false,trialSource:'auto'},true);
 assert.equal(a.subscribe,true);assert.equal(a.cancel,false);assert.equal(a.manage,false);
});
test('temporary access never prompts a new subscription but preserves existing mandate management',()=>{
 let a=billingActions({...base,status:'none',hasMandate:false,temporaryPremium:true},true);
 assert.equal(a.subscribe,false);assert.equal(a.cancel,false);
 a=billingActions({...base,temporaryPremium:true},true);assert.equal(a.manage,true);assert.equal(a.cancel,true);
});
test('pending replacements prevent duplicate checkout and require authorisation eligibility',()=>{
 for(const canCancelPendingSwitch of [true,false]){
 const a=billingActions({...base,pendingReason:'plan_switch',canCancelPendingSwitch},true);
 assert.equal(a.subscribe,false);assert.equal(a.manage,false);assert.equal(a.pending,canCancelPendingSwitch);assert.equal(a.cancel,true);
 }
});
test('unconfirmed cancellation and stale billing status block new payment setup',()=>{
 for(const patch of [{cancellationPending:true},{billingSyncPending:true}]){
 const a=billingActions({...base,...patch},true);assert.equal(a.manage,false);assert.equal(a.subscribe,false);assert.equal(a.pending,false);
 }
 assert.equal(billingActions({...base,cancellationPending:true},true).cancel,false);
 assert.equal(billingActions({...base,cancelAtPeriodEnd:true},true).cancel,false);
});
test('native companion remains purchase-free while preserving owner cancellation',()=>{
 const a=billingActions(base,true,true);assert.equal(a.subscribe,false);assert.equal(a.manage,false);assert.equal(a.cancel,true);
});
test('dates tolerate missing/invalid values and localize valid dates',()=>{
 assert.equal(billingDate(null,'hi','—'),'—');assert.equal(billingDate('not-a-date','en','—'),'—');
 assert.match(billingDate('2027-01-01','hi','—'),/2027/);assert.match(billingDate('2027-01-01','hinglish','—'),/Jan/);
});
test('invoice links require absolute HTTPS destinations',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','http://example.test','/invoice',undefined])assert.equal(invoiceHref(url),undefined);
 assert.equal(invoiceHref('https://example.test/invoice'),'https://example.test/invoice');
});
