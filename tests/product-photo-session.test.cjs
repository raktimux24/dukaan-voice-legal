const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
global.IS_REACT_ACT_ENVIRONMENT=true;
global.indexedDB=new IDBFactory();
const shopId='10000000-0000-4000-8000-000000000001',owner={actor:'photo-test-owner',session:'photo-test-session',shop:shopId};
const shop={id:shopId,name:'Synthetic photo test',category:'grocery',ownerId:owner.actor,createdAt:'2026-11-01T00:00:00.000Z',role:'OWNER',isActive:true};
const image={id:'20000000-0000-4000-8000-000000000002',version:'immutable-test-version',width:160,height:160,alt:'Synthetic thumbnail'};
let getShops=async()=>[shop],auth={isLoaded:true,isSignedIn:true,userId:owner.actor,sessionId:owner.session,getToken:async()=>null};
const defaultAuth=auth;
const api={getShops:()=>getShops(),getEntitlement:async()=>({premium:true}),getPreferences:async()=>({preferences:{appLanguage:'en'}}),assertSession:()=>{}};
const router={replace:()=>{},push:()=>{}},passthrough=({children})=>React.createElement(React.Fragment,null,children);
const oldLoad=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='@clerk/nextjs')return {useAuth:()=>auth,useClerk:()=>({signOut:async()=>{}}),AuthenticateWithRedirectCallback:()=>null};
 if(request==='next/navigation')return {usePathname:()=>'/shop',useRouter:()=>router};
 if(request==='next/link')return {__esModule:true,default:passthrough};
 const file=request.startsWith('.')&&parent?path.resolve(path.dirname(parent.filename),request):'';
 if(file.endsWith('/shop/api'))return {bindApi:()=>api};
 if(file.endsWith('/shop/chrome'))return {ShopChrome:passthrough};
 if(file.endsWith('/shop/billing-shell'))return {BillingShell:()=>null,clearBillingShell:()=>{}};
 if(file.endsWith('/shop/auth-screen'))return {AuthScreen:()=>React.createElement('p',null,'Signed out')};
 if(file.endsWith('/shop/browser-notifications'))return {BROWSER_PUSH_OWNER:'fixture-push-owner',disconnectBrowserPush:async()=>{}};
 if(file.endsWith('/shop/gst-issuance'))return {syncQueuedSales:async()=>0};
 if(file.endsWith('/shop/translations'))return {loadBundledLanguage:async()=>({}),translateUi:(_language,_entries,_key,fallback)=>fallback};
 return oldLoad.call(this,request,parent,isMain);
};
const {ShopProviders}=require('../app/components/shop/providers.tsx');
const {useShop}=require('../app/components/shop/context.tsx');
const thumbs=require('../app/lib/shop/product-images/thumbnail-storage.web.ts');
const {createProductSaveRecovery}=require('../app/lib/shop/product-images/save-recovery.ts');
const {createEditorRecovery}=require('../app/lib/shop/product-images/editor-recovery.ts');
const financial=require('../app/lib/shop/gst-storage.ts');
const {createOfflineShopContext,saveOfflineShop}=require('../app/lib/shop/offline-shop-context.ts');
const locks=new Map();
const lockNames=['samaan-product-thumbnails-v1','samaan-product-photo-saves-v1','samaan-product-photo-editors-v1'];
const storage=key=>({get:async()=>localStorage.getItem(key),set:async value=>localStorage.setItem(key,value),clear:async()=>localStorage.removeItem(key)});
let activeContext;
function Probe(){activeContext=useShop();return React.createElement('p',null,activeContext.offline?'Saved shop':'Online shop');}
async function drain(){await Promise.all(lockNames.map(name=>navigator.locks.request(name,async()=>{})));}
async function seed(){
 const originalFetch=global.fetch;
 try{
  // Exercise the real bounded Blob/IndexedDB adapter, without an external request.
  global.fetch=async()=>new Response(new Blob(['synthetic thumbnail bytes']),{headers:{'Content-Type':'image/webp'}});
  await thumbs.loadOnlineThumbnail(owner,image,'https://fixture.invalid/thumb','synthetic-test-lease',()=>true,new AbortController().signal);
 }finally{global.fetch=originalFetch;}
 await createProductSaveRecovery(storage('samaan-product-photo-saves-v1')).save(owner,'new',{productRequestId:'fixture-save',name:'Private draft'},()=>true);
 await createEditorRecovery(storage('samaan-product-photo-editors-v1')).save(owner,'new',{version:0,initial:'[]',items:[],updatedAt:Date.now(),fields:{name:'Private editor draft'}},()=>true);
 const bill={id:'fixture-retained-bill',actorId:owner.actor,shopId,path:`/api/shops/${shopId}/sales`,payload:{clientId:'exact-original-bill',items:[{quantity:1,price:85}]},createdAt:'2026-11-01T00:00:00.000Z',state:'pending'};
 await financial.retainRequest(bill);return bill;
}
async function mount(t,shops){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid/shop'});
 global.window=dom.window;global.document=dom.window.document;global.localStorage=dom.window.localStorage;global.CustomEvent=dom.window.CustomEvent;
 Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
 Object.defineProperty(navigator,'locks',{value:{request(name,work){const result=(locks.get(name)??Promise.resolve()).catch(()=>{}).then(work);locks.set(name,result);return result;}},configurable:true});
 await thumbs.retainProductThumbnails(null);getShops=shops;activeContext=null;auth=defaultAuth;
 const root=createRoot(document.getElementById('root'));
 t.after(async()=>{await act(async()=>root.unmount());await drain();dom.window.close();});
 return {render:()=>act(async()=>{root.render(React.createElement(ShopProviders,null,React.createElement(Probe)));}),dom};
}
async function assertPhotosPresent(){
 await act(async()=>{
 await drain();assert(await thumbs.readOfflineThumbnail(owner,image,()=>true));
 assert(localStorage.getItem('samaan-product-photo-saves-v1'));assert(localStorage.getItem('samaan-product-photo-editors-v1'));
 });
}
async function assertPhotosPurged(bill){
 await act(async()=>{
 await drain();assert.equal(await thumbs.readOfflineThumbnail(owner,image,()=>true),null,'revoked thumbnail bytes must be evicted');
 assert.equal(localStorage.getItem('samaan-product-photo-saves-v1'),null,'photo save journal purged');
 assert.equal(localStorage.getItem('samaan-product-photo-editors-v1'),null,'photo editor journal purged');
 assert.deepEqual(await financial.retainedRequests({actorId:owner.actor,shopId}),[bill],'original financial request remains exact');
 });
}
test('confirmed membership loss purges photo storage before a stalled shop refresh completes, preserving the bill',async t=>{
 const view=await mount(t,async()=>[shop]),bill=await seed();await view.render();await assertPhotosPresent();
 let finish;getShops=()=>new Promise(resolve=>{finish=resolve;});
 await act(async()=>window.dispatchEvent(new CustomEvent('samaan-not-member')));
 await assertPhotosPurged(bill);
 await act(async()=>finish([]));
});
test('pending initial shop lookup preserves eligible cached photos and draft recovery',async t=>{
 let finish;const view=await mount(t,()=>new Promise(resolve=>{finish=resolve;}));await seed();await view.render();await assertPhotosPresent();
 await act(async()=>finish([shop]));await assertPhotosPresent();
});
test('an authoritative empty shop list clears photo storage without deleting the pending bill',async t=>{
 const view=await mount(t,async()=>[]),bill=await seed();await view.render();await assertPhotosPurged(bill);
});
test('a denied shop lookup clears photo storage without deleting the pending bill',async t=>{
 const view=await mount(t,async()=>{throw Object.assign(Error('membership denied'),{status:403});}),bill=await seed();await view.render();await assertPhotosPurged(bill);
});
test('temporary upstream failure retains photos in the validated offline shop scope',async t=>{
 const view=await mount(t,async()=>{throw Object.assign(Error('temporary upstream failure'),{status:503});});
 await seed();saveOfflineShop(localStorage,createOfflineShopContext(owner.actor,owner.session,shop));
 await view.render();await assertPhotosPresent();assert.equal(activeContext.offline,true);assert.equal(activeContext.shop.id,shopId);
});
test('a shop switch evicts previous thumbnails but preserves the exact unconfirmed photo save in its original scope',async t=>{
 const other={...shop,id:'30000000-0000-4000-8000-000000000003',name:'Other synthetic shop'};
 const view=await mount(t,async()=>[shop,other]),bill=await seed();await view.render();await assertPhotosPresent();
 await act(async()=>activeContext.selectShop(other.id));await drain();
 assert.equal(await thumbs.readOfflineThumbnail(owner,image,()=>true),null);
 const journal=createProductSaveRecovery(storage('samaan-product-photo-saves-v1'));
 assert.equal((await journal.load(owner,'new',()=>true)).productRequestId,'fixture-save');
 assert.equal(await journal.load({...owner,shop:other.id},'new',()=>true),null);
 const editor=createEditorRecovery(storage('samaan-product-photo-editors-v1'));
 assert.equal(await editor.load({...owner,shop:other.id},'new',()=>true),null);
 assert.deepEqual(await financial.retainedRequests({actorId:owner.actor,shopId}),[bill]);
});
test('changing the signed-in actor and session clears previous photo storage while keeping the old financial record',async t=>{
 const view=await mount(t,async()=>[shop]),bill=await seed();await view.render();await assertPhotosPresent();
 const nextOwner={actor:'other-photo-actor',session:'other-photo-session',shop:'40000000-0000-4000-8000-000000000004'};
 auth={...defaultAuth,userId:nextOwner.actor,sessionId:nextOwner.session};
 getShops=async()=>[{...shop,id:nextOwner.shop,ownerId:nextOwner.actor}];
 await view.render();await assertPhotosPurged(bill);
 assert.equal(activeContext.userId,nextOwner.actor);assert.equal(activeContext.photoSessionId,nextOwner.session);
});
test('a new sign-in session for the same actor cannot reuse the previous session photo storage',async t=>{
 const view=await mount(t,async()=>[shop]),bill=await seed();await view.render();await assertPhotosPresent();
 auth={...defaultAuth,sessionId:'fresh-photo-session'};await view.render();await assertPhotosPurged(bill);
 assert.equal(activeContext.userId,owner.actor);assert.equal(activeContext.photoSessionId,'fresh-photo-session');
});
test('sign-out clears photo caches and journals while preserving the exact retained bill',async t=>{
 const view=await mount(t,async()=>[shop]),bill=await seed();await view.render();await assertPhotosPresent();
 auth={...defaultAuth,isSignedIn:false,userId:null,sessionId:null};await view.render();await assertPhotosPurged(bill);
 assert.match(document.body.textContent,/Signed out/);
});
