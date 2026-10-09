import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const handlers={},entries=new Map(),origin='https://samaanbol.space';
const key=r=>new URL(typeof r==='string'?r:r.url,origin).href;
let denied=false,calls=[],transport=async r=>new Response('asset',{headers:{'content-type':'application/javascript'}});
const cache={match:async r=>entries.get(key(r))?.clone(),put:async(r,v)=>{if(denied)throw Error('quota');entries.set(key(r),v.clone());}};
vm.runInNewContext(fs.readFileSync('public/shop-worker.js','utf8'),{
 URL,Response,Set,fetch:async(r,o)=>{calls.push(key(r));return transport(r,o);},caches:{open:async()=>{if(denied)throw Error('denied');return cache;},delete:async()=>{entries.clear();return true;}},
 self:{location:{origin},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>handlers[name]=fn}
});
async function message(type,url=origin+'/shop/sell'){
 let work;handlers.message({source:{url},data:{type},waitUntil:p=>work=p});await work;
}
async function request(path,options={}){
 let result;handlers.fetch({request:{url:new URL(path,origin).href,method:options.method??'GET',mode:options.mode??'navigate',headers:new Headers(options.headers)},respondWith:p=>result=p});return result?await result:null;
}
transport=async r=>key(r).includes('/_next/static/')?new Response('bundle'):new Response('<script src="/_next/static/app.js"></script><link href="https://evil.test/leak"/>',{headers:{'content-type':'text/html'}});
await message('WARM_BILLING_SHELL');
assert.equal(entries.size,4);assert.ok(calls.every(url=>url.startsWith(origin)));
transport=async()=>{throw new TypeError('Failed to fetch');};
assert.match(await (await request('/shop/sell')).text(),/script/);
assert.equal(await (await request('/_next/static/app.js',{mode:'cors'})).text(),'bundle');
for(const path of ['/api/shops/private/sales','/shop/settings','/shop/sell?secret=1','https://clerk.example/client','/shop/settings/gst/recovery/secret'])assert.equal(await request(path),null,path);
assert.equal(await request('/shop/sell',{headers:{RSC:'1'}}),null);
assert.equal(await request('/shop/sell',{method:'POST'}),null);
for(const status of [401,403,404,500]){transport=async()=>new Response('denied',{status});assert.equal((await request('/shop/sell')).status,status);}
transport=async()=>new Response('unavailable',{status:503});assert.equal((await request('/shop/sell')).status,200);
await message('CLEAR_BILLING_SHELL','https://evil.test');assert.equal(entries.size,4);
await message('CLEAR_BILLING_SHELL');assert.equal(entries.size,0);
// An incomplete resource warm-up must not replace any retained HTML.
transport=async r=>key(r).includes('/_next/static/')?new Response('failed',{status:500}):new Response('<script src="/_next/static/new.js"></script>',{headers:{'content-type':'text/html'}});
await message('WARM_BILLING_SHELL');assert.equal(entries.size,0);
transport=async()=>new Response('live asset');denied=true;
assert.equal(await (await request('/_next/static/new.js',{mode:'cors'})).text(),'live asset');
console.log('Billing shell: warm complete resources, navigation fallback, no API/auth/RSC/query caching, denied auth response preservation, logout clear and optional storage passed.');
