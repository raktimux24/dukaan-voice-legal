const fs=require('node:fs'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {useProductPhotoLeave}=require('../app/components/shop/use-product-photo-leave.ts');
global.IS_REACT_ACT_ENVIRONMENT=true;
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function mount(t,changes={},engine='webkit'){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid/shop/products/id/edit'});
 global.window=dom.window;global.document=dom.window.document;global.Element=dom.window.Element;global.location=dom.window.location;global.history=dom.window.history;
 Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
 Object.defineProperty(navigator,'userAgent',{value:engine==='webkit'?'Synthetic AppleWebKit/620 Safari/26.6.2':'Synthetic AppleWebKit/537.36 Chrome/145.0',configurable:true});
 const states=[{__NA:true,tree:['home']},{__NA:true,tree:['detail']},{__NA:true,tree:['edit'],keep:'exact router state'}];
 const entries=states.map((state,index)=>({key:'entry-'+index,index,state})),nav=new dom.window.EventTarget();
 nav.currentEntry=entries[2];window.navigation=nav;if(engine==='precommit')window.NavigationPrecommitController=class{};
 const seen=[],routed=[],deltas=[],prompts=[];let answer=false,controls;
 const options={dirty:true,busy:false,current:()=>true,flush:async()=>{seen.push('flush');},message:'Leave the synthetic draft?',onError:()=>seen.push('storage-error'),...changes};
 window.confirm=message=>{prompts.push({message,key:nav.currentEntry.key});return answer;};
 const traverse=(index,hashChange=false)=>{
  let intercepted;const event=new dom.window.Event('navigate',{cancelable:true});Object.assign(event,{navigationType:'traverse',hashChange,canIntercept:true,intercept:options=>{intercepted=options.precommitHandler;},destination:{sameDocument:true,key:entries[index].key,index}});
  nav.dispatchEvent(event);seen.push('navigate-'+index);if(engine==='webkit')assert.equal(event.defaultPrevented,false,'must not cancel WebKit traversal');if(event.defaultPrevented)return;
  const commit=()=>{nav.currentEntry=entries[index];window.dispatchEvent(new dom.window.PopStateEvent('popstate',{state:entries[index].state}));};
  if(intercepted){Promise.resolve().then(intercepted).then(commit,()=>seen.push('aborted-before-commit'));return;}commit();
 };
 nav.traverseTo=key=>{seen.push('replay');traverse(entries.findIndex(x=>x.key===key));};
 window.history.go=delta=>{deltas.push(delta);queueMicrotask(()=>traverse(nav.currentEntry.index+delta));};
 window.addEventListener('popstate',()=>routed.push(nav.currentEntry.key));
 function Probe(){controls=useProductPhotoLeave(options);return React.createElement('input',{defaultValue:'Retain synthetic draft', 'aria-label':'Draft'});}
 const root=createRoot(document.getElementById('root'));let mounted=true;
 const unmount=async()=>{if(mounted){mounted=false;await act(async()=>root.unmount());}};
 t.after(async()=>{await unmount();dom.window.close();});
 await act(async()=>root.render(React.createElement(Probe)));
 return {nav,states,seen,routed,deltas,prompts,options,unmount,traverse:async(...args)=>act(async()=>traverse(...args)),answer:value=>{answer=value;},controls:()=>controls};
}
test('Back Cancel restores the exact entry before prompting, blocks router popstate, and repeated Back does not skip detail',async t=>{
 const v=await mount(t),original=JSON.stringify(v.states);
 await v.traverse(1);await v.traverse(1);
 assert.deepEqual(v.deltas,[1,1]);assert.deepEqual(v.prompts.map(x=>x.key),['entry-2','entry-2']);assert.deepEqual(v.routed,[]);
 assert.equal(v.nav.currentEntry.key,'entry-2');assert.equal(document.querySelector('input').value,'Retain synthetic draft');assert.equal(JSON.stringify(v.states),original);
});
test('confirmed multi-entry Back waits for recovery then replays the exact target once',async t=>{
 const saved=deferred(),v=await mount(t,{flush:()=>saved.promise});v.answer(true);
 await v.traverse(0);assert.deepEqual(v.deltas,[2]);assert.equal(v.nav.currentEntry.key,'entry-2');assert.deepEqual(v.routed,[]);
 await act(async()=>saved.resolve());assert.equal(v.nav.currentEntry.key,'entry-0');assert.deepEqual(v.routed,['entry-0']);assert.equal(v.seen.filter(x=>x==='replay').length,1);
});
test('failed recovery keeps editor history intact and another Back can be cancelled normally',async t=>{
 const v=await mount(t,{flush:async()=>{throw Error('Synthetic storage failure');}});v.answer(true);await v.traverse(1);
 assert.equal(v.nav.currentEntry.key,'entry-2');assert.deepEqual(v.routed,[]);assert(v.seen.includes('storage-error'));
 v.answer(false);await v.traverse(1);assert.equal(v.prompts.length,2);assert.equal(v.nav.currentEntry.key,'entry-2');
});
test('busy saves restore the editor without prompting or replaying a navigation',async t=>{
 const v=await mount(t,{busy:true});await v.traverse(1);assert.equal(v.nav.currentEntry.key,'entry-2');assert.deepEqual(v.prompts,[]);assert.deepEqual(v.routed,[]);
});
test('scope loss during an accepted recovery never replays navigation from the old editor',async t=>{
 const saved=deferred();let current=true;const v=await mount(t,{current:()=>current,flush:()=>saved.promise});v.answer(true);await v.traverse(1);
 current=false;await act(async()=>saved.resolve());assert.equal(v.nav.currentEntry.key,'entry-2');assert(!v.seen.includes('replay'));
});
test('clean and hash-only traversals reach the router without restoration or a prompt',async t=>{
 const v=await mount(t);await v.traverse(1,true);v.options.dirty=false;await v.traverse(0);
 assert.deepEqual(v.routed,['entry-1','entry-0']);assert.deepEqual(v.deltas,[]);assert.deepEqual(v.prompts,[]);
});
test('unmount removes the traversal guard and does not retain a stale form blocker',async t=>{
 const v=await mount(t);await v.unmount();await v.traverse(1);assert.deepEqual(v.routed,['entry-1']);assert.deepEqual(v.deltas,[]);
});

test('Chromium cancels before router popstate and confirmed leave replays only after recovery',async t=>{
 const saved=deferred(),v=await mount(t,{flush:()=>saved.promise},'chromium');
 await v.traverse(1);await v.traverse(1);assert.equal(v.prompts.length,2);assert.deepEqual(v.deltas,[]);assert.deepEqual(v.routed,[]);assert.equal(v.nav.currentEntry.key,'entry-2');
 v.answer(true);await v.traverse(1);assert.equal(v.nav.currentEntry.key,'entry-2');await act(async()=>saved.resolve());assert.deepEqual(v.routed,['entry-1']);
});

test('supported precommit handling keeps both repeated cancellations before commit and commits accepted navigation after recovery',async t=>{
 const saved=deferred(),v=await mount(t,{flush:()=>saved.promise},'precommit');await v.traverse(1);await v.traverse(1);
 assert.equal(v.prompts.length,2);assert.equal(v.nav.currentEntry.key,'entry-2');assert.deepEqual(v.routed,[]);assert.deepEqual(v.deltas,[]);
 v.answer(true);await v.traverse(1);assert.equal(v.nav.currentEntry.key,'entry-2');await act(async()=>saved.resolve());assert.deepEqual(v.routed,['entry-1']);assert(!v.seen.includes('replay'));
});
