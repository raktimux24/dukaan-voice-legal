import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test';
const {bindApi,apiSend}=require(process.env.GST_TEST_BUILD+'/api.js');
const original=globalThis.fetch;
let current=true,tokenCalls=0,fetchCalls=0,respond;
const scope={actorId:'A',sessionId:'A-session',isCurrent:()=>current,isSessionCurrent:()=>current};
const token=async()=>{tokenCalls++;return 'A-token';};
const api=bindApi(token,scope);
const changed=error=>error.code==='auth_session_changed';
try {
 globalThis.fetch=()=>{fetchCalls++;return new Promise(resolve=>{respond=resolve;});};
 const pending=api.createShop({name:'A shop',category:'retail',subtype:'test',phone:'',address:'',city:'',language:'en'});
 while(!respond)await Promise.resolve();
 current=false;respond(new Response('',{status:401}));
 await assert.rejects(pending,changed);
 assert.equal(fetchCalls,1);assert.equal(tokenCalls,1,'stale 401 cannot obtain another token');
 await assert.rejects(api.getShops(),changed);
 assert.equal(tokenCalls,1,'expired API bindings cannot begin new requests');

 current=true;let finishToken;
 const delayed=bindApi(()=>new Promise(resolve=>{finishToken=resolve;}),scope);
 const waiting=delayed.getShops();current=false;finishToken('A-token');
 await assert.rejects(waiting,changed);assert.equal(fetchCalls,1,'account changes during token retrieval prevent fetch');

 current=true;let finishJson;
 globalThis.fetch=async()=>({status:200,ok:true,headers:new Headers({'content-type':'application/json'}),json:()=>new Promise(resolve=>{finishJson=resolve;})});
 const late=api.getShops();while(!finishJson)await Promise.resolve();
 current=false;finishJson({shops:[{id:'private'}]});await assert.rejects(late,changed);

 current=true;let finishText;
 globalThis.fetch=async()=>({status:200,ok:true,text:()=>new Promise(resolve=>{finishText=resolve;})});
 const csv=api.salesCsv('shop',{});while(!finishText)await Promise.resolve();
 current=false;finishText('private CSV');await assert.rejects(csv,changed);

 current=true;let attempt=0;const options=[];
 const valid=bindApi(async opts=>{options.push(opts?.skipCache);return opts?.skipCache?'fresh':'cached';},scope);
 globalThis.fetch=async(_url,init)=>{
  attempt++;if(attempt===1)return new Response('',{status:401});
  assert.equal(init.headers.Authorization,'Bearer fresh');return Response.json({shops:[]});
 };
 assert.deepEqual(await valid.getShops(),[]);assert.deepEqual(options,[undefined,true]);assert.equal(attempt,2);

 current=true;const metadata={};
 globalThis.fetch=async()=>({status:200,ok:true,headers:new Headers({'content-type':'text/csv','X-GST-Export-ID':'receipt','X-GST-Export-SHA256':'hash'}),text:()=>new Promise(resolve=>{finishText=resolve;})});
 finishText=null;
 const register=apiSend('/api/register',token,undefined,0,metadata,()=>{if(!current){const error=new Error('changed');error.code='auth_session_changed';throw error;}});
 while(!finishText)await Promise.resolve();
 current=false;finishText('retained CSV');await assert.rejects(register,changed);assert.deepEqual(metadata,{},'stale report bodies cannot publish receipt metadata');
 current=true;
 const readAbort=new AbortController();let observedSignal;
 globalThis.fetch=(_url,init)=>{observedSignal=init.signal;return new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>reject(init.signal.reason),{once:true}))};
 const reading=apiSend('/api/followups',token,{signal:readAbort.signal});
 while(!observedSignal)await Promise.resolve();readAbort.abort();await assert.rejects(reading,error=>error.name==='AbortError');
 assert.equal(observedSignal.aborted,true,'caller read deadline reaches the actual browser transport');
 let lateToken,lateFetch=0;const expired=new AbortController();
 globalThis.fetch=async()=>{lateFetch++;return Response.json({})};
 const tokenWait=apiSend('/api/followups',()=>new Promise(resolve=>{lateToken=resolve}),{signal:expired.signal});
 expired.abort();lateToken('session-token');await assert.rejects(tokenWait,error=>error.name==='AbortError');
 assert.equal(lateFetch,0,'a read that timed out waiting for auth cannot start a late request');
 // Media cancellation covers token lookup, not just the later fetch.
 current=true;let finishPhotoToken,photoFetch=0,photoState='pending';
 globalThis.fetch=async()=>{photoFetch++;return Response.json({state:'staged',image:{id:'synthetic-image'}});};
 const photoApi=bindApi(()=>new Promise(resolve=>{finishPhotoToken=resolve;}),scope),photoAbort=new AbortController();
 const photoUpload=photoApi.productImages.upload('shop','draft','image',new Blob(['synthetic photo']),photoAbort.signal);
 const photoOutcome=photoUpload.then(()=>{photoState='fulfilled';},error=>{photoState=error.name;});
 photoAbort.abort();await new Promise(setImmediate);
 try{assert.equal(photoState,'AbortError','cancelled photo work must settle before token lookup finishes');}finally{finishPhotoToken('late-photo-token');await photoOutcome;}
 assert.equal(photoFetch,0,'cancelled token work must never send a later photo upload');

 // Same-session refresh preserves the binary body, URL and content type.
 const photoBody=new Blob(['unchanged synthetic bytes']),photoCalls=[],photoTokens=[];
 const refreshingPhotos=bindApi(async opts=>{photoTokens.push(opts?.skipCache);return opts?.skipCache?'fresh-photo':'cached-photo';},scope);
 globalThis.fetch=async(url,init)=>{photoCalls.push({url,init});return photoCalls.length===1?new Response('',{status:401}):Response.json({state:'staged',image:{id:'synthetic-image'}});};
 assert.equal((await refreshingPhotos.productImages.upload('shop /1','draft/1','image?1',photoBody)).state,'staged');
 assert.deepEqual(photoTokens,[undefined,true]);assert.equal(photoCalls.length,2);assert.equal(photoCalls[0].url,photoCalls[1].url);
 assert.match(photoCalls[0].url,/shop%20%2F1.*draft%2F1.*image%3F1$/);
 for(const call of photoCalls){assert.equal(call.init.body,photoBody);assert.equal(call.init.headers['Content-Type'],'application/octet-stream');}
 assert.equal(photoCalls[1].init.headers.Authorization,'Bearer fresh-photo');

 const originalSetTimeout=globalThis.setTimeout,originalClearTimeout=globalThis.clearTimeout,photoTimers=new Map();
 let finishHungPhotoToken;
 try{
  globalThis.setTimeout=(fn,ms,...args)=>{if(ms!==60000)return originalSetTimeout(fn,ms,...args);const handle={photoDeadline:true};photoTimers.set(handle,fn);return handle;};
  globalThis.clearTimeout=handle=>{if(photoTimers.delete(handle))return;return originalClearTimeout(handle);};
  const stalled=bindApi(()=>new Promise(resolve=>{finishHungPhotoToken=resolve;}),scope);
  const hung=stalled.productImages.upload('shop','draft','image',photoBody),rejected=assert.rejects(hung,error=>error.code==='request_timeout'&&error.status===408);
  assert.equal(photoTimers.size,1);[...photoTimers.values()][0]();await rejected;assert.equal(photoTimers.size,0);
  finishHungPhotoToken('too-late-token');await new Promise(setImmediate);assert.equal(photoCalls.length,2,'a timed-out token cannot send a late binary request');
 }finally{finishHungPhotoToken?.('released-test-token');globalThis.setTimeout=originalSetTimeout;globalThis.clearTimeout=originalClearTimeout;}
 console.log('Web photo transport: immediate token-wait cancellation, unchanged binary 401 retry, and total deadline passed.');
 console.log('Web API sessions: stale sends/retries, JSON/CSV and export metadata rejected; current-session refresh passed.');
}finally{globalThis.fetch=original;}
