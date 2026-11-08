const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid/shop/sell'});
global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;global.localStorage=dom.window.localStorage;
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
global.indexedDB=require('fake-indexeddb').indexedDB;global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{QueryClient,QueryClientProvider}=require('@tanstack/react-query');
let context,calls,readError,postError,scanItem,run=0;
const router={push:url=>calls.push(['navigate',url]),replace:()=>{}};
const link=({children,href,...props})=>React.createElement('a',{href,...props},children);
const original=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='next/link')return {__esModule:true,default:link};
 if(request==='next/navigation')return {useRouter:()=>router,useSearchParams:()=>new URLSearchParams()};
 const file=request.startsWith('.')&&parent?path.resolve(path.dirname(parent.filename),request):'';
 if(file.endsWith('/shop/context'))return {useShop:()=>context};
 if(file.endsWith('/shop/gst-ui'))return {useGstText:()=>s=>s};
 if(file.endsWith('/shop/product-image'))return {ProductImage:()=>null,ProductImageById:()=>null};
 if(file.endsWith('/shop/counter-status'))return {CounterStatus:()=>null};
 if(file.endsWith('/shop/invoice-preparation'))return {prepareOfflineInvoices:async()=>null};
 if(file.endsWith('/shop/customer-attach'))return {CustomerAttach:()=>null};
 if(file.endsWith('/shop/counter-scanner'))return {CounterCamera:({onCode})=>React.createElement('button',{onClick:()=>onCode('89012345')},'Synthetic scan'),UsbCounterScanner:()=>null};
 if(file.endsWith('/shop/voice-sheet'))return {VoiceSheet:({children,title,onClose})=>React.createElement('div',{role:'dialog','aria-label':title},children,React.createElement('button',{onClick:onClose},'Close sheet'))};
 if(file.endsWith('/shop/ui'))return {
  Button:({children,onClick,disabled,href,type='button'})=>href?link({children,href}):React.createElement('button',{onClick,disabled,type},children),
  Card:({children})=>React.createElement('div',null,children),Chip:({children,onClick})=>React.createElement('button',{onClick},children),
  Glyph:()=>null,Kbd:({children})=>React.createElement('kbd',null,children),Spinner:({label})=>React.createElement('p',null,label),
  Notice:({error})=>error?React.createElement('p',{role:'alert'},error.message):null,cx:(...args)=>args.filter(Boolean).join(' '),inputClass:'input',
 };
 return original.call(this,request,parent,isMain);
};
const {SellScreen}=require('../app/components/shop/screens/sell.tsx');
Module._load=original;
const {searchSellCatalog,sellAmount,sellBillPreview,sellStockShortfalls}=require('../app/lib/shop/sell.ts');
const {permissionsFor}=require('../app/lib/shop/permissions.ts'),cart=require('../app/lib/shop/cart.ts'),{setFinancialScope}=require('../app/lib/shop/gst-storage.ts');
const shop='10000000-0000-4000-8000-000000000001',product='20000000-0000-4000-8000-000000000001';
const item={id:'i1',shopId:shop,productId:product,unit:'piece',quantity:8,stockStatus:'OK',product:{id:product,name:'Rice pack',category:'staples',sellingPrice:100,shortCode:'R12',barcodeAliases:['ALT-1'],trackStock:true,isActive:true,mrp:null}};
const weight={...item,id:'i2',productId:'20000000-0000-4000-8000-000000000002',unit:'kg',product:{...item.product,id:'20000000-0000-4000-8000-000000000002',name:'Loose rice',shortCode:'R13'}};
const unpriced={...item,id:'i3',productId:'20000000-0000-4000-8000-000000000003',product:{...item.product,id:'20000000-0000-4000-8000-000000000003',name:'Unpriced rice',sellingPrice:null}};
const empty=()=>({lines:[],billDiscount:0,note:'',customerId:null,customerName:null,customerPhone:null,customerClientId:null});
const line={key:'l1',productId:product,name:'Rice pack',unit:'piece',quantity:1,price:100,listPrice:100,discount:0,trackStock:true,available:8};
function setup(role='OWNER',items=[item,weight,unpriced]){
 calls=[];readError=null;postError=null;scanItem=weight;
 const userId='sell-fixture-'+(++run),settings={shopId:shop,gstAvailable:false};
 context={shop:{id:shop,name:'Synthetic'},userId,perms:permissionsFor(role),offline:false,hideCost:role==='HELPER',setNotice:v=>calls.push(['notice',v]),t:(_k,f,v)=>Object.entries(v??{}).reduce((s,[k,x])=>s.replaceAll('{{'+k+'}}',String(x)),f),api:{
  assertSession(){},getPosSettings:async()=>settings,getAllInventory:async()=>{if(readError)throw readError;return items},getNudges:async()=>({nudges:[]}),getDemandTerms:async()=>({terms:[]}),postDemand:async(_s,q)=>{calls.push(['demand',q]);if(postError)throw postError;return {ok:true}},updateProduct:async(...args)=>calls.push(['price',...args]),lookupBarcode:async()=>({found:true,item:scanItem}),
 }};
 setFinancialScope({actorId:userId,shopId:shop});cart.writeCart(userId,shop,empty());
 return settings;
}
const settle=async(ms=30)=>act(async()=>{await new Promise(r=>setTimeout(r,ms))});
async function mount(t){const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});document.body.innerHTML='<div id="root"></div>';const root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(QueryClientProvider,{client},React.createElement(SellScreen))));await settle();t.after(async()=>{await act(async()=>root.unmount());client.clear();});return client;}
const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===text);
const option=name=>[...document.querySelectorAll('[role=option]')].find(el=>el.textContent.includes(name));
const readCart=()=>cart.readCart(context.userId,shop);
async function click(element){assert(element,'Expected visible control');await act(async()=>element.click());await settle();}
async function chooseProduct(name){if(!option(name))await click(button('Browse products'));await click(option(name));if(button('Back to bill →'))await click(button('Back to bill →'));}
async function fill(el,value){assert(el,'Expected input');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));});await settle();}

test('catalogue search ranks exact codes and aliases first and does not drop products beyond 60',()=>{
 assert.equal(searchSellCatalog([weight,item],'R12')[0].id,item.id);assert.equal(searchSellCatalog([item],'R1').length,1);assert.equal(searchSellCatalog([item],'ALT-1')[0].id,item.id);
 assert.equal(searchSellCatalog([item],'Rice','snacks').length,0);assert.equal(searchSellCatalog([{...item,product:{...item.product,isActive:false}}],'').length,0);
 assert.equal(searchSellCatalog(Array.from({length:80},(_,i)=>({...item,id:String(i)})),'').length,80);
});
test('blank, negative, non-finite and excessive-precision price edits are rejected',()=>{
 for(const value of ['',' ','-1','Infinity','NaN','12.345','1e3'])assert.equal(sellAmount(value),null);
 assert.equal(sellAmount('0'),0);assert.equal(sellAmount('125.50'),125.5);
});
test('GST estimate uses the shop context and requires review for unavailable or cross-shop tax evidence',()=>{
 const version='084f9d89-5e6a-4973-9f3a-62787a97ca05',tax={version,category:'taxable',codeType:'hsn',code:'1006',rate:5,reviewed:true};
 const gstSettings={version,registration:'regular',gstin:'29AAAGM0289C1ZF',legalName:'Synthetic',address:'Bengaluru',stateCode:'29',priceMode:'exclusive',effectiveFrom:'2026-01-01',reviewed:true,eInvoiceRequired:false};
 const gstTaxSnapshot={version:1,shopId:shop,productId:product,capturedAt:'2026-11-07T00:00:00.000Z',profiles:[{version,recordedAt:'2026-01-01T00:00:00.000Z',effectiveAt:'2026-01-01T00:00:00.000Z',state:'reviewed',config:tax}]};
 const bill={...empty(),lines:[{...line,gstConfig:tax,gstTaxSnapshot}]},settings={gstAvailable:true,gstSettings};
 const preview=sellBillPreview(bill,settings,shop,'2026-11-07T12:00:00.000Z');assert.equal(preview.reviewTax,false);assert.equal(preview.totals.total,105);assert.equal(preview.totals.tax.tax,5);
 assert.equal(sellBillPreview(bill,{...settings,gstSettings:{...gstSettings,priceMode:'inclusive'}},shop).totals.total,100);
 assert.equal(sellBillPreview({...bill,lines:[line]},settings,shop).reviewTax,true);
 assert.equal(sellBillPreview(bill,settings,'another-shop').reviewTax,true);
 assert.equal(sellBillPreview(bill,undefined,shop).reviewTax,true);
 assert.equal(sellBillPreview(bill,{...settings,gstAvailable:false},shop).reviewTax,true);
});
test('countable items add immediately; weighted items wait for quantity confirmation',async t=>{
 setup();await mount(t);await chooseProduct('Rice pack');assert.equal(readCart().lines[0].quantity,1);assert.equal(document.querySelector('[role=dialog]'),null);
 await chooseProduct('Rice pack');assert.equal(readCart().lines[0].quantity,2);
 await chooseProduct('Loose rice');assert(document.querySelector('[role=dialog]'));assert.equal(readCart().lines.length,1);
 await fill(document.querySelector('.pos-picker-step input'),'1.25');await click([...document.querySelectorAll('.sell-quantity-picker button')].at(-1));assert.equal(readCart().lines.find(l=>l.productId===weight.productId).quantity,1.25);
});
test('helpers can edit only the bill price, while unpriced catalogue products remain restricted',async t=>{
 setup('HELPER');await mount(t);await chooseProduct('Rice pack');const price=document.querySelector('.bill-price input');assert(price);
 await fill(price,'90');await act(async()=>price.dispatchEvent(new window.FocusEvent('focusout',{bubbles:true})));await settle();assert.equal(readCart().lines[0].price,90);assert.equal(calls.some(c=>c[0]==='price'),false);
 await chooseProduct('Unpriced rice');assert.equal(document.querySelector('[role=dialog]'),null);assert(calls.some(c=>c[0]==='notice'&&c[1].includes('owner or manager')));
});
test('demand is never recorded merely by typing; a failed explicit save remains retryable',async t=>{
 setup();await mount(t);await fill(document.querySelector('input[type=search]'),'Missing soap');await settle(850);assert.equal(calls.some(c=>c[0]==='demand'),false);
 postError=Error('Synthetic network failure');await click(button('Not in stock? Note it'));assert.equal(document.querySelector('input[type=search]').value,'Missing soap');assert(document.querySelector('[role=alert]'));
 postError=null;await click(button('Not in stock? Note it'));assert.equal(document.querySelector('input[type=search]').value,'');assert.equal(calls.filter(c=>c[0]==='demand').length,2);
});
test('failed catalogue reads cannot masquerade as missing stock or allow demand recording',async t=>{
 setup();readError=Error('Synthetic catalogue failure');await mount(t);await fill(document.querySelector('input[type=search]'),'Missing soap');assert.equal(button('Not in stock? Note it'),undefined);assert(document.querySelector('[role=alert]'));
});
test('unresolved submitted bills retain their cart and pending request while Sell edits are locked',async t=>{
 setup();cart.writeCart(context.userId,shop,{...empty(),lines:[line]});cart.writePending(context.userId,shop,{clientId:'pending',payload:{},fingerprint:'fixture',startedAt:1});await mount(t);
 assert(button('Browse products').disabled);assert(document.querySelector('input[type=search]').disabled);assert(button('Clear bill').disabled);assert(document.querySelector('.bill-line-controls').disabled);await click(button('Browse products'));assert.equal(readCart().lines[0].quantity,1);assert.equal(cart.readPending(context.userId,shop).clientId,'pending');
});
test('lower current stock is flagged and checkout waits for the shortfall confirmation',async t=>{
 setup('OWNER',[{...item,quantity:1}]);cart.writeCart(context.userId,shop,{...empty(),lines:[{...line,quantity:3}]});await mount(t);assert(document.querySelector('.sell-stock-warning'));window.confirm=()=>false;await click(button('Review & charge →'));assert.equal(calls.some(c=>c[0]==='navigate'),false);
 window.confirm=()=>true;await click(button('Review & charge →'));assert(calls.some(c=>c[0]==='navigate'&&c[1]==='/shop/sell/checkout'));
 assert.equal(sellStockShortfalls({...empty(),lines:[{...line,trackStock:false,quantity:99}]},[item]).length,0);
});
test('a weighted barcode hit outside the current catalogue can be reviewed and retains scan provenance',async t=>{
 setup('OWNER',[item]);scanItem={...weight,quantity:6,reservedQuantity:2};await mount(t);await click(button('Camera'));await click(button('Synthetic scan'));assert(document.querySelector('[role=dialog]'));
 await fill(document.querySelector('.pos-picker-step input'),'9');await click([...document.querySelectorAll('.sell-quantity-picker button')].at(-1));assert.equal(readCart().lines[0].quantity,4);assert.equal(readCart().inputMethod,'scan');
});
