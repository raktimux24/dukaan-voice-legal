/* Billing shell only. Private API responses and authentication traffic are never cached here. */
const CACHE='samaan-billing-shell-v1';
const ROUTES=new Set(['/shop/sell','/shop/sell/checkout','/shop/settings/gst/recovery']);
const asset=url=>url.origin===self.location.origin&&url.pathname.startsWith('/_next/static/');
const shell=url=>url.origin===self.location.origin&&ROUTES.has(url.pathname)&&!url.search;
async function save(request,response){
 if(!response.ok||response.type==='opaque'||response.redirected)return false;
 try{const cache=await caches.open(CACHE);await cache.put(request,response.clone());return true;}catch{return false;}
}
async function prewarm(){
 const cache=await caches.open(CACHE);
 for(const path of ROUTES){
  try{
   const response=await fetch(path,{credentials:'same-origin',cache:'no-cache'});
   if(!response.ok||response.redirected||!response.headers.get('content-type')?.includes('text/html'))continue;
   const html=await response.clone().text();
   const urls=[...html.matchAll(/(?:src|href)="([^"<>]+)"/g)].map(m=>new URL(m[1],self.location.origin)).filter(asset);
   // Persist the HTML only once every resource explicitly referenced by it is available.
   let complete=true;
   const resources=[...new Set(urls.map(u=>u.href))];
   for(const url of resources){
    try{const cached=await cache.match(url),resource=cached??await fetch(url);if(!resource.ok||resource.type==='opaque'){complete=false;break;}if(url.endsWith('.css')){
     const css=await resource.clone().text();
     for(const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)){
      const child=new URL(match[1],url);if(asset(child)&&!resources.includes(child.href))resources.push(child.href);
     }
    }
    if(!cached&&!await save(url,resource)){complete=false;break;}}catch{complete=false;break;}
   }
   if(complete)await save(path,response);
  }catch{/* Existing usable shell remains intact on a failed warm-up. */}
 }
}
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 // Same-origin page clients only; messages cannot inject arbitrary URLs or content.
 if(!event.source?.url||new URL(event.source.url).origin!==self.location.origin)return;
 if(event.data?.type==='BIND_PUSH_ACCOUNT'&&(event.data.actorId===null||typeof event.data.actorId==='string'&&event.data.actorId.length<256))event.waitUntil(pushOwner(event.data.actorId).then(()=>event.ports?.[0]?.postMessage({ok:true,actorId:event.data.actorId})).catch(()=>event.ports?.[0]?.postMessage({ok:false})));
 if(event.data?.type==='WARM_BILLING_SHELL')event.waitUntil(prewarm());
 if(event.data?.type==='CLEAR_BILLING_SHELL')event.waitUntil(caches.delete(CACHE));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||request.headers.get('RSC')==='1')return;
 if(asset(url)){
  event.respondWith((async()=>{let saved;try{saved=await (await caches.open(CACHE)).match(request);}catch{}if(saved)return saved;const response=await fetch(request);await save(request,response);return response;})());return;
 }
 if(request.mode==='navigate'&&shell(url)){
  event.respondWith((async()=>{
   try{const response=await fetch(request);if([408,502,503,504].includes(response.status)){try{const saved=await (await caches.open(CACHE)).match(url.pathname);if(saved)return saved;}catch{}}return response;}catch(error){const cache=await caches.open(CACHE),saved=await cache.match(url.pathname);if(saved)return saved;throw error;}
  })());
 }
});

// Keep notification ownership separate from the optional billing shell cache.
// A reused browser must never display an earlier account's shop update.
function pushOwnerDatabase(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('samaan-browser-push',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('owner');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
async function pushOwner(value){
 const database=await pushOwnerDatabase();
 try{return await new Promise((resolve,reject)=>{
  const transaction=database.transaction('owner',value===undefined?'readonly':'readwrite');
  const store=transaction.objectStore('owner');
  const request=value===undefined?store.get('current'):value===null?store.delete('current'):store.put(value,'current');
  let result;request.onsuccess=()=>{result=request.result;};
  transaction.oncomplete=()=>resolve(result);transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);
 });}finally{database.close();}
}
function pushDestination(data){
 return data?.screen==='subscription'?'/shop/settings/subscription':'/shop';
}
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  let payload;try{payload=event.data?.json();}catch{return;}
  if(!payload||typeof payload.data?.actorId!=='string')return;
  let owner;try{owner=await pushOwner();}catch{return;}
  if(owner!==payload.data.actorId)return;
  await self.registration.showNotification(typeof payload.title==='string'?payload.title.slice(0,120):'SamaanBol',{
   body:typeof payload.body==='string'?payload.body.slice(0,500):'',
   data:{actorId:owner,path:pushDestination(payload.data)}
  });
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();event.waitUntil((async()=>{
  const data=event.notification.data;
  let owner;try{owner=await pushOwner();}catch{return;}
  if(!data?.actorId||owner!==data.actorId)return;
  const path=['/shop','/shop/settings/subscription'].includes(data.path)?data.path:'/shop';
  const url=new URL(path,self.location.origin).href;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const existing=windows.find(client=>new URL(client.url).origin===self.location.origin);
  if(existing){await existing.navigate(url);await existing.focus();}else await self.clients.openWindow(url);
 })());
});
