import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {shareBill}=require(process.env.GST_TEST_BUILD+'/share-bill.js');
const bill={shopName:'Synthetic',saleNumber:1,when:'10 Oct',lines:[],subtotal:'₹0',total:'₹0',payments:[]};
const originalDocument=globalThis.document,originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
let current=true,finishBlob,copied=0,downloaded=0,revoked=0,shareCalls=0;
const guard=()=>{if(!current)throw Error('context changed');};
const ctx=new Proxy({measureText:()=>({width:40})},{get(target,key){return target[key]??(()=>{});}});
const canvas={getContext:()=>ctx,toBlob:callback=>{finishBlob=callback;}};
const navigatorWith=value=>Object.defineProperty(globalThis,'navigator',{configurable:true,value});
const copy=async()=>{copied++;};
try{
 globalThis.document={createElement:type=>type==='canvas'?canvas:{click(){downloaded++;}}};
 URL.createObjectURL=()=> 'blob:synthetic';URL.revokeObjectURL=()=>{revoked++;};
 navigatorWith({clipboard:{writeText:copy}});
 current=false;await assert.rejects(shareBill(bill,guard),/context changed/);assert.equal(finishBlob,undefined);
 current=true;const stale=shareBill(bill,guard);current=false;finishBlob(new Blob(['receipt']));
 await assert.rejects(stale,/context changed/);assert.equal(copied,0);assert.equal(downloaded,0);

 current=true;navigatorWith({share:async()=>{shareCalls++;current=false;throw Error('share unavailable');},clipboard:{writeText:copy}});
 const failedShare=shareBill(bill,guard);finishBlob(null);await assert.rejects(failedShare,/context changed/);
 assert.equal(copied,0);assert.equal(downloaded,0);assert.equal(shareCalls,1);

 current=true;navigatorWith({clipboard:{writeText:async()=>{copied++;current=false;}}});
 const lateCopy=shareBill(bill,guard);finishBlob(new Blob(['receipt']));await assert.rejects(lateCopy,/context changed/);
 assert.equal(downloaded,0,'a completed clipboard write cannot trigger stale image download');

 current=true;navigatorWith({clipboard:{writeText:async()=>{throw Error('clipboard denied');}}});
 const denied=shareBill(bill,guard);finishBlob(new Blob(['receipt']));assert.equal(await denied,'downloaded');
 assert.equal(downloaded,1);assert.equal(revoked,1);
 const noOutput=shareBill(bill,guard);finishBlob(null);await assert.rejects(noOutput,/Could not share or download/);

 current=true;navigatorWith({share:async()=>{throw new DOMException('cancel','AbortError');},clipboard:{writeText:copy}});
 const cancel=shareBill(bill,guard);finishBlob(new Blob(['receipt']));assert.equal(await cancel,'cancelled');
 assert.equal(downloaded,1,'explicit share cancellation never falls through to download');
 console.log('Bill sharing: stale image/share/clipboard boundaries, denied clipboard download, visible failure and cancellation passed.');
}finally{
 globalThis.document=originalDocument;if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;
 URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;
}
