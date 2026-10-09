import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={},origin='https://samaanbol.space',notices=[],opened=[];
let owner,storageDenied=false;
const database={close(){},transaction(_name,mode){
 const transaction={objectStore(){return {get(){const request={};queueMicrotask(()=>{request.result=owner;request.onsuccess?.();transaction.oncomplete?.();});return request;},put(value){const request={};queueMicrotask(()=>{owner=value;request.onsuccess?.();transaction.oncomplete?.();});return request;},delete(){const request={};queueMicrotask(()=>{owner=undefined;request.onsuccess?.();transaction.oncomplete?.();});return request;}};}};return transaction;
}};
vm.runInNewContext(fs.readFileSync('public/shop-worker.js','utf8'),{
 URL,Set,indexedDB:{open(){const request={};queueMicrotask(()=>{if(storageDenied){request.error=Error('denied');request.onerror();}else{request.result=database;request.onsuccess();}});return request;}},
 self:{location:{origin},addEventListener:(name,fn)=>handlers[name]=fn,registration:{showNotification:async(title,options)=>notices.push({title,...options})},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}}
});
async function dispatch(name,event){let work;handlers[name]({...event,waitUntil:p=>work=p});await work;}
await dispatch('message',{source:{url:'https://evil.test'},data:{type:'BIND_PUSH_ACCOUNT',actorId:'a'}});assert.equal(owner,undefined);
await dispatch('message',{source:{url:origin+'/shop'},data:{type:'BIND_PUSH_ACCOUNT',actorId:'a'}});
const push=data=>dispatch('push',{data:{json:()=>data}});
await push({title:'Private',data:{actorId:'b'}});assert.equal(notices.length,0);
await push({title:'अपडेट',body:'दुकान',data:{actorId:'a',screen:'subscription',url:'https://evil.test'}});assert.equal(notices.length,1);assert.equal(notices[0].data.path,'/shop/settings/subscription');
await dispatch('notificationclick',{notification:{data:notices[0].data,close(){}}});assert.deepEqual(opened,[origin+'/shop/settings/subscription']);
await dispatch('message',{source:{url:origin+'/shop'},data:{type:'BIND_PUSH_ACCOUNT',actorId:'b'}});
await dispatch('notificationclick',{notification:{data:notices[0].data,close(){}}});assert.equal(opened.length,1);
await push({title:'Earlier account',data:{actorId:'a'}});assert.equal(notices.length,1);
await dispatch('message',{source:{url:origin+'/shop'},data:{type:'BIND_PUSH_ACCOUNT',actorId:null}});assert.equal(owner,undefined);
await push({title:'Signed out',data:{actorId:'b'}});assert.equal(notices.length,1);
storageDenied=true;await push({title:'No safe owner',data:{actorId:'a'}});assert.equal(notices.length,1);
await dispatch('push',{data:{json(){throw Error('malformed');}}});
console.log('Browser push worker: account isolation, signout, safe destinations, stale clicks, denied storage and malformed payload passed.');
