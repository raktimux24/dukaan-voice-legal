const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid/shop/sell/checkout'});
global.location=dom.window.location;global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;global.localStorage=dom.window.localStorage;
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});global.indexedDB=require('fake-indexeddb').indexedDB;global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{QueryClient,QueryClientProvider}=require('@tanstack/react-query');
let context,calls,run=0,issueError=null;
const router={push:url=>calls.push(['navigate',url]),replace:url=>calls.push(['navigate',url])};
const link=({children,href,...props})=>React.createElement('a',{href,...props},children);
const original=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='next/link')return {__esModule:true,default:link};
 if(request==='next/navigation')return {useRouter:()=>router};
 const file=request.startsWith('.')&&parent?path.resolve(path.dirname(parent.filename),request):'';
 if(file.endsWith('/shop/context'))return {useShop:()=>context};
 if(file.endsWith('/shop/gst-ui'))return {useGstText:()=>s=>s};
 if(file.endsWith('/shop/gst-issuance'))return {issueSale:async(_a,_s,p)=>{calls.push(['issue',structuredClone(p)]);if(issueError)throw issueError;return {sale:{id:'synthetic-receipt'},deduplicated:false}}};
 if(file.endsWith('/shop/checkout-context'))return {CheckoutCustomerHistory:()=>null,CheckoutSuggestions:()=>null};
 if(file.endsWith('/shop/customer-attach'))return {CustomerAttach:()=>null};
 if(file.endsWith('/shop/product-photos'))return {ProductPhotos:()=>null};
 if(file.endsWith('/shop/counter-status'))return {CounterStatus:()=>null};
 if(file.endsWith('/shop/gst-rsp-checkout'))return {RspCheckoutControls:()=>null};
 if(file.endsWith('/screens/cashbook'))return {cashWebUi:{}};
 if(file.endsWith('/shop/credit/checkout'))return {useCheckoutCredit:(_a,_s,_u,_c,_p,selected,amount)=>({valid:amount<=0||selected,terms:{acknowledged:true,dueDate:null}}),CheckoutCreditView:()=>null};
 if(file.endsWith('/screens/local-fiscal-receipt'))return {LocalFiscalReceiptScreen:()=>null};
 if(file.endsWith('/shop/ui'))return {
 Button:({children,onClick,disabled,href,type='button'})=>href?link({children,href}):React.createElement('button',{onClick,disabled,type},children),Card:({children})=>React.createElement('div',null,children),Field:({children,label,hint})=>React.createElement('label',null,label,children,hint),Notice:({error})=>error?React.createElement('p',{role:'alert'},error.message):null,Spinner:({label})=>React.createElement('p',null,label),PremiumLock:()=>React.createElement('p',null,'Premium required'),Glyph:()=>null,cx:(...args)=>args.filter(Boolean).join(' '),inputClass:'input'};
 return original.call(this,request,parent,isMain);
};
const {CheckoutScreen}=require('../app/components/shop/screens/checkout.tsx');Module._load=original;
const {checkoutMoney,checkoutPayment,checkoutDefault,checkoutUpiUri}=require('../app/lib/shop/checkout.ts');
const cart=require('../app/lib/shop/cart.ts'),{permissionsFor}=require('../app/lib/shop/permissions.ts'),{setFinancialScope}=require('../app/lib/shop/gst-storage.ts');
const shop='10000000-0000-4000-8000-000000000001',product='20000000-0000-4000-8000-000000000001';
const line={key:'line',productId:product,name:'Synthetic rice',unit:'piece',quantity:1,price:125.5,listPrice:125.5,mrp:null,discount:0,trackStock:true,available:10};
const empty=()=>({lines:[line],billDiscount:0,note:'',customerId:null,customerName:null,customerPhone:null,customerClientId:null});
function setup(options={}){
 calls=[];issueError=null;const userId='checkout-fixture-'+(++run),settings={gstAvailable:false,cardEnabled:true,defaultPaymentMethod:'cash',...options};
 context={shop:{id:shop,name:'Synthetic'},userId,perms:permissionsFor('OWNER'),premium:true,entitlement:{isPremium:true,status:'active',currentPeriodEnd:'2099-01-01'},t:(_k,f,v)=>Object.entries(v??{}).reduce((s,[k,x])=>s.replaceAll('{{'+k+'}}',String(x)),f),api:{assertSession(){},credit:{},getPosSettings:async()=>settings,getAllInventory:async()=>[],getTaxSnapshot:async()=>{throw Error('Synthetic tax details unavailable')}}};
 setFinancialScope({actorId:userId,shopId:shop});cart.writeCart(userId,shop,empty());return settings;
}
const settle=async(ms=35)=>act(async()=>{await new Promise(r=>setTimeout(r,ms))});
async function mount(t){const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});document.body.innerHTML='<div id="root"></div>';const root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(QueryClientProvider,{client},React.createElement(CheckoutScreen))));await settle(80);t.after(async()=>{await act(async()=>root.unmount());client.clear()});return client;}
const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===text);
const confirm=()=>document.querySelector('.checkout-confirm button');
async function click(el){assert(el,'button exists');await act(async()=>el.click());await settle();}
async function fill(el,value){assert(el,'input exists');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));});await settle();}
const current=()=>cart.readCart(context.userId,shop);

test('money rejects signs, scientific notation, fractions of paise and unsafe values',()=>{
 for(const value of ['','-1','+1','1e2','.5','1.234','NaN','Infinity','999999999999999999'])assert.equal(checkoutMoney(value),null,value);
 assert.equal(checkoutMoney('125.50'),125.5);assert.equal(checkoutMoney(' 0 '),0);
 const split={cash:'0.10',upi:'0.20',credit:'',tendered:''};const payment=checkoutPayment(.3,'split','',split);assert.equal(payment.remainder,0);assert.equal(payment.valid,true);assert.equal(payment.tendered,.1);
 assert.equal(checkoutPayment(10,'split','',{...split,cash:'-5',upi:'15'}).valid,false);
 assert.equal(checkoutPayment(10,'cash','9.99',split).cashShort,true);
});
test('default avoids accidental remembered credit and unsupported cards; voice hint wins',()=>{
 assert.equal(checkoutDefault(undefined,'credit','cash',true),'cash');assert.equal(checkoutDefault('credit','cash','cash',true),'credit');assert.equal(checkoutDefault(undefined,'card','cash',false),'cash');
});
test('UPI QR can only request its positive verified portion',()=>{
 assert.equal(checkoutUpiUri('fixture@invalid','Example',100,false),'');assert.equal(checkoutUpiUri('fixture@invalid','Example',0,true),'');assert.equal(checkoutUpiUri(null,'Example',100,true),'');assert.equal(new URL(checkoutUpiUri('fixture@invalid','Example',12.5,true)).searchParams.get('am'),'12.50');
});
test('cash defaults to exact, presets replace the amount, and payload keeps the reviewed value',async t=>{
 setup();await mount(t);assert.equal(confirm().disabled,false);const cash=document.querySelector('.checkout-tender input');assert.equal(cash.value,'');await click(button('₹200.00'));assert.equal(cash.value,'200');await click(button('₹200.00'));assert.equal(cash.value,'200');assert(document.querySelector('.checkout-change').textContent.includes('₹74.50'));await click(confirm());assert.deepEqual(calls.find(c=>c[0]==='issue')[1].payments,[{method:'cash',amount:125.5,tendered:200}]);
});
test('negative/invalid cash and discount inputs cannot record a bill or corrupt the draft',async t=>{
 setup();await mount(t);await fill(document.querySelector('.checkout-tender input'),'-1');assert(confirm().disabled);await click(confirm());assert(!calls.some(c=>c[0]==='issue'));await fill(document.querySelector('.checkout-tender input'),'');const discount=document.querySelector('.checkout-adjustments input');await fill(discount,'1e2');assert(confirm().disabled);assert.equal(current().billDiscount,0);await fill(discount,'10.25');assert.equal(current().billDiscount,10.25);assert(document.querySelector('[data-checkout-total]').textContent.includes('115.25'));assert.equal(confirm().disabled,false);
});
test('split fills the remaining portion exactly and requires evidence for UPI without a shop QR',async t=>{
 setup();await mount(t);await click(button('Split'));const inputs=document.querySelectorAll('.checkout-rest input');await fill(inputs[0],'50');await click(document.querySelectorAll('.checkout-rest button')[1]);assert.equal(inputs[1].value,'75.5');assert(confirm().disabled);await fill(document.querySelector('.checkout-upi input'),'QA-REF');assert.equal(confirm().disabled,false);await click(confirm());assert.deepEqual(calls.find(c=>c[0]==='issue')[1].payments,[{method:'cash',amount:50,tendered:50},{method:'upi',amount:75.5,reference:'QA-REF'}]);
});
test('disabled card is absent and UPI without a QR waits for a valid reference',async t=>{
 setup({cardEnabled:false});await mount(t);assert.equal(button('Card'),undefined);await click(button('UPI'));assert(confirm().disabled);await fill(document.querySelector('.checkout-upi input'),'abc');assert(confirm().disabled);await fill(document.querySelector('.checkout-upi input'),'abcd');assert.equal(confirm().disabled,false);
});
test('unresolved GST hides payable amounts and QR, and blocks recording',async t=>{
 setup({gstAvailable:true,gstProtocol:2,upiVpa:'fixture@invalid',gstSettings:{registration:'regular',stateCode:'29',priceMode:'exclusive'}});await mount(t);assert.equal(document.querySelector('[data-checkout-total]').textContent,'Unavailable');assert.equal(document.querySelector('.checkout-methods'),null);assert.equal(document.querySelector('.checkout-upi'),null);assert(confirm().disabled);await click(confirm());assert(!calls.some(c=>c[0]==='issue'));
});
test('zero ordinary bills cannot be completed',async t=>{
 setup();cart.writeCart(context.userId,shop,{...empty(),lines:[{...line,price:0,listPrice:0}]});await mount(t);assert(confirm().disabled);
});
test('an uncertain submitted bill locks editing and retries identical request identity and payments',async t=>{
 setup();issueError=Error('Synthetic response lost');await mount(t);await click(confirm());const first=calls.find(c=>c[0]==='issue')[1];assert(cart.readPending(context.userId,shop));assert.equal(document.querySelector('.checkout-form'),null);assert.equal(confirm().textContent.trim(),'Check saved bill →');issueError=null;await click(confirm());assert.deepEqual(calls.filter(c=>c[0]==='issue').map(c=>JSON.parse(JSON.stringify(c[1]))),[first,first].map(p=>JSON.parse(JSON.stringify(p))));assert.equal(cart.readPending(context.userId,shop),null,document.querySelector('[role=alert]')?.textContent);
});
test('retained UPI is retried unchanged even when new settings fail',async t=>{
 setup();const payload={clientId:'saved-identity',soldAt:'2026-11-07T00:00:00.000Z',items:[{productId:product,name:'Old name',unit:'piece',quantity:1,price:100,discount:0}],payments:[{method:'upi',amount:100,reference:'ORIGINAL'}],discountAmount:0,note:'original'};
 cart.writePending(context.userId,shop,{clientId:payload.clientId,payload,fingerprint:'retained',startedAt:1});context.api.getPosSettings=async()=>{throw Error('Synthetic settings unavailable')};await mount(t);assert.equal(confirm().disabled,false);await click(confirm());assert.deepEqual(calls.find(c=>c[0]==='issue')[1],payload);
});
test('credit requires a customer and active Premium evidence',async t=>{
 setup();await mount(t);await click(button('Udhaar'));assert(confirm().disabled);await act(async()=>cart.writeCart(context.userId,shop,{...current(),customerId:'customer',customerName:'Synthetic customer'}));await settle();assert.equal(confirm().disabled,false);context.entitlement=null;await act(async()=>cart.writeCart(context.userId,shop,{...current(),note:'Updated synthetic bill'}));await settle();await click(confirm());assert(!calls.some(c=>c[0]==='issue'));
});

const version='084f9d89-5e6a-4973-9f3a-62787a97ca05';
function fiscal(){
 const gstSettings={version,registration:'regular',gstin:'29AAAGM0289C1ZF',legalName:'Synthetic',address:'Bengaluru',stateCode:'29',priceMode:'exclusive',effectiveFrom:'2026-01-01',reviewed:true,eInvoiceRequired:false};
 setup({gstAvailable:true,gstProtocol:2,gstSettings});
 context.api.getTaxSnapshot=async()=>({version:1,shopId:shop,capturedAt:new Date(Date.now()-1000).toISOString(),products:[{productId:product,profiles:[{version,recordedAt:'2026-01-01T00:00:00.000Z',effectiveAt:'2026-01-01T00:00:00.000Z',state:'reviewed',config:{version,category:'taxable',codeType:'hsn',code:'1006',rate:5,reviewed:true}}]}]});
}
test('GST refresh produces the payable total and bill price-basis changes persist into the sale',async t=>{
 fiscal();await mount(t);assert.equal(document.querySelector('[data-checkout-total]').textContent,'₹131.78');assert.equal(confirm().disabled,false);
 const select=document.querySelector('.checkout-tax-body select');await act(async()=>{select.value='inclusive';select.dispatchEvent(new window.Event('change',{bubbles:true}));});await settle();assert.equal(document.querySelector('[data-checkout-total]').textContent,'₹125.50');assert.equal(current().gstPriceMode,'inclusive');await click(confirm());assert.equal(calls.find(c=>c[0]==='issue')[1].gstContext.priceMode,'inclusive');assert.equal(calls.find(c=>c[0]==='issue')[1].payments[0].amount,125.5);
});
test('invalid tax evidence stays recoverable without crashing or showing a payable total',async t=>{
 fiscal();context.api.getTaxSnapshot=async()=>({version:1,shopId:'wrong-shop',capturedAt:new Date().toISOString(),products:[]});await mount(t);assert.equal(document.querySelector('[data-checkout-total]').textContent,'Unavailable');assert(confirm().disabled);assert(button('Refresh billing details'));
});
test('new customer identity is retained for issuance and the completed cart clears',async t=>{
 setup();cart.writeCart(context.userId,shop,{...empty(),customerName:'Synthetic new customer'});await mount(t);await click(confirm());assert(calls.find(c=>c[0]==='issue')[1].customer.clientId);assert.equal(current().lines.length,0);assert.equal(cart.readPending(context.userId,shop),null);
});
test('saved billing identity wins over imported GST contact data',()=>{
 const {checkoutBuyer}=require('../app/lib/shop/checkout-customer.ts'),saved={name:'Saved',gstin:'29AAAGM0289C1ZF',address:'Saved address',stateCode:'29'};
 const copy=checkoutBuyer('Other','27',saved,{gstin:'27ABC',address:'Other'});assert.deepEqual(copy,saved);assert.notEqual(copy,saved);
 assert.deepEqual(checkoutBuyer('Imported','29',undefined,{gstin:'27 abc ',address:' Address '}),{name:'Imported',gstin:'27ABC',address:'Address',stateCode:'27'});assert.equal(checkoutBuyer('Walk-in','29'),undefined);
});
