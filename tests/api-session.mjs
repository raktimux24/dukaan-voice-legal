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
 console.log('Web API sessions: stale sends/retries, JSON/CSV and export metadata rejected; current-session refresh passed.');
}finally{globalThis.fetch=original;}
