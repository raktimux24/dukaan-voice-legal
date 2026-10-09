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
