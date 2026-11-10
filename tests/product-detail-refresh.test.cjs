const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {QueryClient,QueryClientProvider}=require('@tanstack/react-query');
global.IS_REACT_ACT_ENVIRONMENT=true;
const shopId='synthetic-refresh-shop',productId='synthetic-new-photo-product';
const item={id:'synthetic-inventory',shopId,productId,quantity:0,unit:'piece',stockStatus:'OUT',product:{id:productId,name:'Synthetic photographed product',category:'staples',subcategory:null,unit:'piece',trackStock:true,minStockLevel:0,sellingPrice:null,media:{cover:null,count:0,version:0}}};
let inventoryRead;
const api={getAllInventory:()=>inventoryRead(),getBatches:async()=>[],getAudit:async()=>({logs:[]}),getProductHistory:async()=>({snapshots:[]}),captureHistory:async()=>({productSnapshots:0,shopStats:true}),getProductSales:async()=>({days:30,units:0,revenue:0,bills:0,daysOfCover:null,lastSoldAt:null}),getBuyList:async()=>[],getNudges:async()=>({nudges:[]})};
const context={api,shop:{id:shopId},perms:{canEditProducts:false,canSeeReports:false},hideCost:false,userId:'synthetic-actor',setNotice:()=>{},t:(_key,fallback)=>fallback};
const shell=({children})=>React.createElement('div',null,children);
const ui={Card:shell,Field:shell,Pill:shell,inputClass:'',isDenied:()=>false,isPremiumError:()=>false,PremiumLock:()=>null,PageHeader:({title})=>React.createElement('h1',null,title),Notice:({error})=>error?React.createElement('p',{role:'alert'},error.message):null,Spinner:({label})=>React.createElement('p',{role:'status'},label),Button:({children,onClick,disabled,href})=>href?React.createElement('a',{href},children):React.createElement('button',{onClick,disabled},children)};
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='next/navigation')return {useRouter:()=>({push:()=>{}}),useSearchParams:()=>new URLSearchParams()};
 const file=request.startsWith('.')&&parent?path.resolve(path.dirname(parent.filename),request):'';
 if(file.endsWith('/shop/context'))return {useShop:()=>context};
 if(file.endsWith('/shop/gst-ui'))return {useGstText:()=>value=>value};
 if(file.endsWith('/shop/ui'))return ui;
 if(file.endsWith('/shop/use-shop-dates'))return {useShopDates:()=>({formatDay:()=>'',formatWhen:()=>''})};
 if(file.endsWith('/shop/product-image'))return {ProductImage:()=>null};
 if(file.endsWith('/shop/product-gallery'))return {ProductGallery:()=>React.createElement('div',{'data-gallery':true})};
 if(file.endsWith('/shop/product-barcode'))return {ProductBarcodeCard:()=>null};
 if(file.endsWith('/shop/product-tax-history'))return {ProductTaxHistory:()=>null};
 if(file.endsWith('/shop/supplier-field'))return {SupplierField:()=>null};
 if(file.endsWith('/shop/cart'))return {useCart:()=>({addProduct:()=>({ok:true})})};
 return originalLoad.call(this,request,parent,isMain);
};
const {ProductDetailScreen}=require('../app/components/shop/screens/product-detail.tsx');
Module._load=originalLoad;
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const settle=async()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,15));});
async function mount(t,seed=[]){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid/shop/products/new-id'});global.window=dom.window;global.document=dom.window.document;
 const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});client.setQueryData(['catalog',shopId,false],seed);
 const root=createRoot(document.getElementById('root'));
 t.after(async()=>{await act(async()=>root.unmount());client.clear();dom.window.close();});
 await act(async()=>root.render(React.createElement(QueryClientProvider,{client},React.createElement(ProductDetailScreen,{productId}))));
 return {client};
}
test('a newly saved product stays loading while a cached catalogue refreshes, then renders the saved photo gallery',async t=>{
 const pending=deferred();inventoryRead=()=>pending.promise;await mount(t);
 assert.match(document.querySelector('[role=status]')?.textContent??'',/Loading product/);
 assert.doesNotMatch(document.body.textContent,/not found/);
 await act(async()=>pending.resolve([item]));await settle();
 assert.equal(document.querySelector('h1')?.textContent,item.product.name);assert(document.querySelector('[data-gallery]'));
});
test('not found is shown only after the refreshed catalogue authoritatively excludes the product',async t=>{
 const pending=deferred();inventoryRead=()=>pending.promise;await mount(t);
 assert.doesNotMatch(document.body.textContent,/not found/);
 await act(async()=>pending.resolve([]));await settle();assert.match(document.body.textContent,/That product was not found/);
});
test('a failed refresh is an error with retry, rather than a false missing-product result',async t=>{
 const pending=deferred();inventoryRead=()=>pending.promise;await mount(t);
 await act(async()=>pending.reject(Error('Synthetic catalogue unavailable')));await settle();
 assert.equal(document.querySelector('[role=alert]')?.textContent,'Synthetic catalogue unavailable');assert.doesNotMatch(document.body.textContent,/not found/);
 inventoryRead=async()=>[item];const retry=Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Retry');assert(retry);
 await act(async()=>retry.click());await settle();assert.equal(document.querySelector('h1')?.textContent,item.product.name);
});
test('an already loaded product remains usable during its background catalogue refresh',async t=>{
 const pending=deferred();inventoryRead=()=>pending.promise;await mount(t,[item]);
 assert.equal(document.querySelector('h1')?.textContent,item.product.name);assert.equal(document.querySelector('[role=status]'),null);
 await act(async()=>pending.resolve([item]));await settle();
});
