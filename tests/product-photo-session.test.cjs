const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {useQueryClient}=require('@tanstack/react-query');
global.IS_REACT_ACT_ENVIRONMENT=true;
global.indexedDB=new IDBFactory();
const shopId='10000000-0000-4000-8000-000000000001',owner={actor:'photo-test-owner',session:'photo-test-session',shop:shopId};
const shop={id:shopId,name:'Synthetic photo test',category:'grocery',ownerId:owner.actor,createdAt:'2026-11-01T00:00:00.000Z',role:'OWNER',isActive:true};
const image={id:'20000000-0000-4000-8000-000000000002',version:'immutable-test-version',width:160,height:160,alt:'Synthetic thumbnail'};
let getShops=async()=>[shop],auth={isLoaded:true,isSignedIn:true,userId:owner.actor,sessionId:owner.session,getToken:async()=>null};
const defaultAuth=auth;
let mediaReads=0,leaseReads=0,savedMedia={},leaseFailure=true;
const api={getCachedProductMedia:async()=>savedMedia,getShops:()=>getShops(),getEntitlement:async()=>({premium:true}),getPreferences:async()=>({preferences:{appLanguage:'en'}}),assertSession:()=>{},productImages:{query:async()=>{mediaReads++;return {media:{}};},leases:async()=>{leaseReads++;if(leaseFailure)throw Error('Synthetic lease read failure');return {leases:{[image.id]:'synthetic-viewer-lease'},expiresAt:new Date(Date.now()+300_000).toISOString()};}}};
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
const {ProductImageById,ProductImage}=require('../app/components/shop/product-image.tsx');
const {PublicProductImage}=require('../app/components/store/product-media.tsx');
const {ProductImageEditor}=require('../app/components/shop/product-image-editor.tsx');
const {createProductImageEditor}=require('../app/lib/shop/product-images/editor.ts');
const thumbs=require('../app/lib/shop/product-images/thumbnail-storage.web.ts');
const {createProductSaveRecovery}=require('../app/lib/shop/product-images/save-recovery.ts');
const {createEditorRecovery}=require('../app/lib/shop/product-images/editor-recovery.ts');
const financial=require('../app/lib/shop/gst-storage.ts');
const {createOfflineShopContext,saveOfflineShop}=require('../app/lib/shop/offline-shop-context.ts');
const locks=new Map();
const lockNames=['samaan-product-thumbnails-v1','samaan-product-photo-saves-v1','samaan-product-photo-editors-v1'];
const storage=key=>({get:async()=>localStorage.getItem(key),set:async value=>localStorage.setItem(key,value),clear:async()=>localStorage.removeItem(key)});
let activeContext,activeQueryClient,photoProbeId,viewerProbe,editorProbe,viewerImage=image;const queryClients=new Set();
function ViewerFrame({children}){return React.createElement('dialog',{open:true},React.createElement('button',null,'Close viewer'),children);}
function EditorProbe(){const state=React.useSyncExternalStore(editorProbe.subscribe,editorProbe.getSnapshot);return React.createElement(ProductImageEditor,{media:{editor:editorProbe,state,dirty:editorProbe.dirty()},name:'Synthetic editor product'});}
function Probe(){activeContext=useShop();activeQueryClient=useQueryClient();queryClients.add(activeQueryClient);return React.createElement('div',null,React.createElement('p',null,activeContext.offline?'Saved shop':'Online shop'),editorProbe?React.createElement(EditorProbe):viewerProbe==='private'?React.createElement(ViewerFrame,null,React.createElement(ProductImage,{image:viewerImage,name:'Synthetic viewer product',variant:'detail',decorative:false,size:240})):viewerProbe==='public'?React.createElement(ViewerFrame,null,React.createElement(PublicProductImage,{image:viewerImage,name:'Synthetic viewer product',store:shopId,listing:'fixture-listing',detail:true,labels:{loading:'Loading photos',failed:'Photo unavailable',retry:'Retry photo'}})):photoProbeId?React.createElement(ProductImageById,{productId:photoProbeId,name:'Synthetic cart product'}):null);}
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
 global.IntersectionObserver=class{constructor(callback){this.callback=callback;}observe(){this.callback([{isIntersecting:true}]);}disconnect(){}};
 Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
 Object.defineProperty(navigator,'locks',{value:{request(name,work){const result=(locks.get(name)??Promise.resolve()).catch(()=>{}).then(work);locks.set(name,result);return result;}},configurable:true});
 await thumbs.retainProductThumbnails(null);getShops=shops;activeContext=null;activeQueryClient=null;photoProbeId=null;viewerProbe=null;editorProbe=null;viewerImage=image;leaseFailure=true;savedMedia={};auth=defaultAuth;mediaReads=0;leaseReads=0;
 const root=createRoot(document.getElementById('root'));
 t.after(async()=>{await act(async()=>root.unmount());for(const client of queryClients)client.clear();queryClients.clear();await drain();dom.window.close();});
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
test('an offline cart photo resolves from a later validated catalogue update and clears when its gallery is empty',async t=>{
 const view=await mount(t,async()=>{throw Object.assign(Error('upstream unavailable'),{status:503});});
 await seed();saveOfflineShop(localStorage,createOfflineShopContext(owner.actor,owner.session,shop));
 photoProbeId='50000000-0000-4000-8000-000000000005';await view.render();await assertPhotosPresent();
 assert.equal(document.querySelectorAll('img').length,0);
 const item={shopId,productId:photoProbeId,product:{id:photoProbeId,shopId,name:'Synthetic cart product',media:{cover:image,count:1,version:1}}};
 await act(async()=>activeQueryClient.setQueryData(['catalog',shopId,true,false],[item]));
 await act(async()=>{await drain();});
 assert.match(document.querySelector('img')?.src??'',/^blob:/,'restored bill must reuse its authorized cached thumbnail');
 await act(async()=>activeQueryClient.setQueryData(['catalog',shopId,false,false],[{...item,product:{...item.product,media:{cover:null,count:0,version:2}}}]));
 assert.equal(document.querySelectorAll('img').length,0,'a newer empty gallery cannot borrow the old cover');
 assert.equal(mediaReads,0);assert.equal(leaseReads,0);
});
test('offline photo lookup never matches a product by name or reads another shop catalogue',async t=>{
 const view=await mount(t,async()=>{throw Object.assign(Error('upstream unavailable'),{status:503});});await seed();saveOfflineShop(localStorage,createOfflineShopContext(owner.actor,owner.session,shop));
 photoProbeId='50000000-0000-4000-8000-000000000005';await view.render();await assertPhotosPresent();
 const otherShop='60000000-0000-4000-8000-000000000006',otherProduct='70000000-0000-4000-8000-000000000007';
 const row=(scope,id)=>({shopId:scope,productId:id,product:{id,shopId:scope,name:'Synthetic cart product',media:{cover:image,count:1,version:1}}});
 await act(async()=>activeQueryClient.setQueryData(['catalog',otherShop,true,false],[row(otherShop,photoProbeId)]));
 await act(async()=>{await drain();});assert.equal(document.querySelectorAll('img').length,0);
 await act(async()=>activeQueryClient.setQueryData(['catalog',shopId,true,false],[row(otherShop,photoProbeId),row(shopId,otherProduct)]));
 await act(async()=>{await drain();});assert.equal(document.querySelectorAll('img').length,0);
 assert.equal(mediaReads,0);assert.equal(leaseReads,0);
});

test('a fresh offline checkout restores its photo without a mounted catalogue query',async t=>{
 const view=await mount(t,async()=>{throw Object.assign(Error('upstream unavailable'),{status:503});});await seed();saveOfflineShop(localStorage,createOfflineShopContext(owner.actor,owner.session,shop));
 photoProbeId='50000000-0000-4000-8000-000000000005';savedMedia={[photoProbeId]:{cover:image,count:1,version:2}};
 await view.render();await act(async()=>{await drain();await new Promise(resolve=>setTimeout(resolve,10));});
 assert.equal(activeQueryClient.getQueriesData({queryKey:['catalog',shopId]}).length,0);
 assert.match(document.querySelector('img')?.src??'',/^blob:/);
 assert.equal(mediaReads,0);assert.equal(leaseReads,0);
});

async function settleViewer(){await act(async()=>{await drain();await new Promise(resolve=>setTimeout(resolve,10));});}
test('private detail distinguishes lease and image failures, retries the same URI, then clears its failure after load',async t=>{
 const view=await mount(t,async()=>[shop]);viewerProbe='private';await view.render();await settleViewer();
 assert.match(document.querySelector('[role="alert"]')?.textContent??'',/photo could not be loaded/);
 assert.equal(document.querySelectorAll('img').length,0);
 const retry=()=>[...document.querySelectorAll('button')].find(button=>button.textContent==='Retry');assert(retry());
 leaseFailure=false;retry().focus();await act(async()=>retry().click());assert.equal(document.activeElement.textContent,'Close viewer');await settleViewer();
 const first=document.querySelector('img');assert(first);assert.match(first.src,/\/detail\?/);
 await act(async()=>first.dispatchEvent(new window.Event('error')));
 assert(retry());assert.equal(document.querySelectorAll('img').length,0);
 await act(async()=>retry().click());await settleViewer();const second=document.querySelector('img');assert(second);assert.notEqual(second,first);assert.equal(second.src,first.src);
 await act(async()=>second.dispatchEvent(new window.Event('load')));
 assert.equal(document.querySelector('[role="alert"]'),null);assert.equal(document.querySelector('[role="status"]'),null);assert.equal(retry(),undefined);
});
test('public detail exposes localized retry outside its decorative image and resets state on a changed image',async t=>{
 const view=await mount(t,async()=>[shop]);viewerProbe='public';await view.render();
 const first=document.querySelector('img');assert(first);await act(async()=>first.dispatchEvent(new window.Event('error')));
 const alert=document.querySelector('[role="alert"]');assert.match(alert?.textContent??'',/Photo unavailable/);assert.equal(alert.closest('[aria-hidden="true"]'),null);
 const retry=[...document.querySelectorAll('button')].find(button=>button.textContent==='Retry photo');assert(retry);
 retry.focus();await act(async()=>retry.click());assert.equal(document.activeElement.textContent,'Close viewer');const second=document.querySelector('img');assert(second);assert.notEqual(second,first);assert.equal(second.src,first.src);
 await act(async()=>second.dispatchEvent(new window.Event('load')));assert.equal(document.querySelector('[role="alert"]'),null);assert.equal(document.querySelector('[role="status"]'),null);
 await act(async()=>second.dispatchEvent(new window.Event('error')));assert(document.querySelector('[role="alert"]'));
 viewerImage={...image,version:'different-immutable-version'};await view.render();assert.equal(document.querySelector('[role="alert"]'),null);assert(document.querySelector('[role="status"]'));
});


test('photo editor keeps focus on the moved card and adjacent controls after removal',async t=>{
 const view=await mount(t,async()=>[shop]);
 const scrolled=[];view.dom.window.HTMLElement.prototype.scrollIntoView=function(options){scrolled.push({target:this,options});};
 const photos=[image,{...image,id:'30000000-0000-4000-8000-000000000003',alt:'Second photo'},{...image,id:'40000000-0000-4000-8000-000000000004',alt:'Third photo'}];
 editorProbe=createProductImageEditor({uuid:()=>crypto.randomUUID(),current:()=>true,
  capabilities:async()=>({available:true,canEdit:true}),gallery:async()=>({version:1,count:3,cover:photos[0],images:photos}),
  draft:async id=>({id}),upload:async()=>{throw Error('No upload expected');}});
 const editor=editorProbe;t.after(()=>editor.dispose());await editor.load();await view.render();
 const groups=()=>[...document.querySelectorAll('[role="group"]')];
 const button=(group,label)=>[...group.querySelectorAll('button')].find(element=>element.textContent===label);
 const originalGroups=groups(),moved=originalGroups[1];
 button(moved,'product_images.set_cover').focus();await act(async()=>button(moved,'product_images.set_cover').click());
 assert.equal(groups()[0]===moved,true,'the same card node follows its photo');
 assert.equal(document.activeElement===moved,true,'cover action must keep keyboard focus with its photo');
 assert.equal(moved.getAttribute('aria-label'),'product_images.title 1/3');
 assert.equal(scrolled.at(-1).target===moved,true);assert.deepEqual(scrolled.at(-1).options,{block:'center',inline:'nearest'});
 button(moved,'product_images.next').focus();await act(async()=>button(moved,'product_images.next').click());
 assert.equal(groups()[1]===moved,true);assert.equal(document.activeElement===moved,true);
 assert.deepEqual(editor.getSnapshot().items.map(item=>item.image.id),photos.map(photo=>photo.id));assert.equal(await editor.manifest(),undefined,'returning to the original order needs no save');
 button(moved,'product_images.remove').focus();await act(async()=>button(moved,'product_images.remove').click());
 assert.equal(document.activeElement===originalGroups[2],true,'removal focuses the next remaining photo');
 button(originalGroups[2],'product_images.remove').focus();await act(async()=>button(originalGroups[2],'product_images.remove').click());
 assert.equal(document.activeElement===originalGroups[0],true,'last-position removal focuses the previous photo');
 button(originalGroups[0],'product_images.remove').focus();await act(async()=>button(originalGroups[0],'product_images.remove').click());
 assert.equal(document.activeElement.textContent,'product_images.library','empty gallery focuses the add action');
 assert.equal(scrolled.at(-1).target===document.activeElement,true,'the empty-gallery action must be brought into view');
 assert.equal(groups().length,0);assert.deepEqual((await editor.manifest()).images,[]);
 const reset=[...document.querySelectorAll('button')].find(element=>element.textContent==='product_images.reset');
 reset.focus();await act(async()=>reset.click());assert.equal(groups().length,3);
 assert.equal(document.activeElement.textContent,'product_images.library','reset must focus an available action after its own button disappears');
 assert.equal(scrolled.at(-1).target===document.activeElement,true);
});
