const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{JSDOM}=require('jsdom');
const stableToken=async()=> 'fixture-token',user={id:'user',fullName:'Test owner',primaryEmailAddress:{emailAddress:'owner@example.test'}};
async function harness({role='OWNER',shops,invoiceFail=false}={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://local.test/shop/settings/subscription'});
 global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 let entitlement={status:'active',plan:'monthly',hasMandate:true,isPremium:true,currentPeriodEnd:'2027-01-01',trialEnd:null,pendingReason:null};
 const calls={cancel:0,checkout:0,entitlement:0,invoices:0,opens:0};
 let failInvoices=invoiceFail,checkoutResolve;
 const api={hasMandate:e=>!!e?.hasMandate,planCopy:{monthly:{price:'₹499',amount:'₹499/month'},annual:{price:'₹3,999',amount:'₹3,999/year'}},
  getShops:async()=>({shops:shops??[{id:'shop',name:'Test shop',role}]}),
  getEntitlement:async()=>{calls.entitlement++;return {...entitlement};},
  getInvoices:async()=>{calls.invoices++;if(failInvoices)throw Error('fixture');return {invoices:[{id:'invoice',date:'2026-11-08',amount:499,status:'paid',invoiceUrl:'https://example.test/paid'}]};},
  cancelSubscription:async()=>{calls.cancel++;entitlement={...entitlement,cancelAtPeriodEnd:true};return {...entitlement};},
  changePlan:async()=>{calls.checkout++;return new Promise(resolve=>{checkoutResolve=resolve;});},
 };
 dom.window.Razorpay=class{constructor(opts){this.opts=opts;}on(){}open(){calls.opens++;}};
 const cache=new Map();
 function load(file){if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module:m,exports:m.exports,window:dom.window,document:dom.window.document,URL,URLSearchParams,Intl,Date,process,console,require(id){
   if(id==='react')return React;
   if(id==='@clerk/nextjs')return {useAuth:()=>({getToken:stableToken}),useUser:()=>({user}),useClerk:()=>({signOut:async()=>{}}),UserButton:()=>null};
   if(id==='next/navigation')return {useSearchParams:()=>new URLSearchParams()};
   if(id==='next/link')return ({children,...props})=>React.createElement('a',props,children);
   if(id.endsWith('/subscriptions'))return api;
   if(id.startsWith('.')){let f=path.resolve(path.dirname(file),id);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f));f=['.ts','.tsx'].map(ext=>f+ext).find(fs.existsSync);return load(f);}
   return require(id);
  }},{filename:file});return m.exports;
 }
 const {AccountDashboard}=load(path.resolve('app/account/AccountClient.tsx'));
 const root=createRoot(document.getElementById('root'));
 await act(async()=>{root.render(React.createElement(AccountDashboard,{locale:'en',lockedShopId:'shop',embedded:true}));});
 const button=(text,scope=document)=>[...scope.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
 const click=async b=>{assert.ok(b,'button exists');await act(async()=>{b.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));});};
 return {dom,calls,button,click,stop:()=>act(async()=>root.unmount()),allowInvoices:()=>failInvoices=false,resolveCheckout:()=>checkoutResolve({subscriptionId:'test',keyId:'key'})};
}
test('cancellation requires a separate confirmation and updates recorded status',async()=>{
 const h=await harness();await h.click(h.button('Cancel subscription'));assert.equal(h.calls.cancel,0);assert.ok(document.querySelector('dialog[open]'));
 await h.click(h.button('Go back'));assert.equal(h.calls.cancel,0);assert.equal(document.querySelector('dialog'),null);
 await h.click(h.button('Cancel subscription'));await h.click(h.button('Cancel subscription',document.querySelector('dialog')));
 assert.equal(h.calls.cancel,1);assert.match(document.body.textContent,/Cancellation scheduled/);assert.equal(h.button('Cancel subscription'),undefined);await h.stop();
});
test('one pending operation blocks repeated setup and a stale checkout cannot open after unmount',async()=>{
 const h=await harness();const b=h.button('Switch to Annual — ₹3,999/year');await act(async()=>{b.click();b.click();});assert.equal(h.calls.checkout,1);assert.equal(h.button('Refresh status').disabled,true);
 await h.stop();await act(async()=>h.resolveCheckout());assert.equal(h.calls.opens,0);
});
test('refresh recovers invoice errors without creating payment operations',async()=>{
 const h=await harness({invoiceFail:true});assert.match(document.body.textContent,/Payment history could not be loaded/);h.allowInvoices();await h.click(h.button('Refresh status'));assert.equal(document.querySelectorAll('tbody tr').length,1);assert.doesNotMatch(document.body.textContent,/Payment history could not be loaded/);assert.equal(h.calls.checkout,0);await h.stop();
});
test('locked billing never reads another shop when the requested shop is inaccessible',async()=>{
 const h=await harness({shops:[{id:'other',name:'Other shop',role:'OWNER'}]});assert.equal(h.calls.entitlement,0);assert.equal(h.calls.invoices,0);assert.match(document.body.textContent,/This shop is unavailable/);await h.stop();
});
test('non-owner billing never fetches invoices or exposes cancellation',async()=>{
 const h=await harness({role:'MANAGER'});assert.equal(h.calls.invoices,0);assert.equal(h.button('Cancel subscription'),undefined);assert.match(document.body.textContent,/Only the shop owner/);await h.stop();
});
