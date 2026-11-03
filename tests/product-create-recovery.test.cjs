const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),{randomUUID}=require('node:crypto');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {createProductSaveRecovery}=require('../app/lib/shop/product-images/save-recovery.ts');
const {productFormTaxPatch}=require('../app/lib/shop/product-images/product-tax-intent.ts');
// Execute the actual ProductForm submit handler, with retained storage and
// explicit request/parent boundaries. Browser captures cover real form input.
function handler(context){
 const source=ts.createSourceFile('product-form.tsx',fs.readFileSync('app/components/shop/screens/product-form.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let found;
 function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='handleSubmit')found=node.initializer;ts.forEachChild(node,visit);}visit(source);assert(found);
 const code=ts.transpileModule('module.exports='+found.getText(source),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,module={exports:{}};
 vm.runInNewContext(code,{...context,module});return module.exports;
}
async function fixture({caller='catalogue',loseResponse=true,loseLink=false,failStorage=false}={}){
 let raw=null,pending=null,linkLost=false,reset=false;
 const owner={actor:'qa-owner',session:'qa-session',shop:'qa-shop'},slot=caller;
 const storage={get:async()=>raw,set:async value=>{if(failStorage)throw Error('disk full');raw=value;},clear:async()=>{raw=null;}},journal=createProductSaveRecovery(storage);
 const attempts=[],products=new Map(),links=[],navigation=[],parents=[],errors=[],createdResult={current:null};
 const saveIntent={ready:true,error:false,current:()=>true,retry:()=>pending,
  prepare:async body=>{const retained=pending??{...JSON.parse(JSON.stringify(body)),productRequestId:randomUUID()};await journal.save(owner,slot,retained,()=>true);pending=retained;return retained;},
  succeeded:async()=>{if(pending)await journal.remove(owner,slot,pending.productRequestId,()=>true);pending=null;},failed:async()=>{},
 };
 const form={name:'Synthetic no-photo rice',category:'staples',subcategory:'rice',unit:'kg',barcode:'',minStockLevel:'0',sellingPrice:'80',mrp:'90',purchasePrice:'50',trackStock:true,shortCode:'',packSize:'',packLabel:'',initialStock:'4',supplier:'QA Supplier',expiryDate:'2027-01-01',purchaseDate:'2026-11-04',batchNumber:'QA-BATCH'};
 const context={pending:false,saveIntent,editorFields:{ready:true},isAllowedL2:()=>true,shop:{id:owner.shop,category:'kirana',subtype:null},form,hideCost:false,cost:50,autoMrp:false,priceBreakdown:{gross:80},gstConfig:null,gstDraft:undefined,productFormTaxPatch,text:s=>s,t:key=>key,onCreated:caller==='embedded'?async id=>parents.push(id):null,params:{get:key=>key==='buyListItemId'&&caller==='buy-list'?'qa-demand':null},productId:null,item:null,setPending:()=>{},setError:error=>{if(error)errors.push(error);},media:{busy:false,manifest:async()=>undefined,clearRecovery:async()=>{}},preparingPhoto:false,generateBarcode:false,createdResult,
  api:{addProduct:async(shop,body)=>{attempts.push(JSON.parse(JSON.stringify(body)));const id=body.productRequestId??randomUUID();if(!products.has(id))products.set(id,{product:{id:randomUUID(),name:body.name}});if(loseResponse&&attempts.length===1)throw Object.assign(Error('response lost after commit'),{status:503});return products.get(id);},updateBuyList:async(shop,id,body)=>{links.push(JSON.parse(JSON.stringify({id,...body})));if(loseLink&&!linkLost){linkLost=true;throw Object.assign(Error('link response lost'),{status:503});}}},
  queryClient:{invalidateQueries:async()=>{}},leaveGuard:{allow:()=>{},reset:()=>{}},setNotice:()=>{},setUncertainSave:()=>{},setPhotoReset:()=>{},setGenerateBarcode:()=>{},setDraft:()=>{reset=true;},blank:()=>({}),setGstDraft:()=>{},setBuyingDiscount:()=>{},setAutoMrp:()=>{},window:{scrollTo:()=>{}},router:{push:path=>navigation.push(path)},
 };
 return {attempts,products,links,navigation,parents,errors,retained:()=>raw,reset:()=>reset,
  save:async()=>handler({...context,uncertainSave:!!pending})(caller==='another'),
  remount:async()=>{createdResult.current=null;pending=await createProductSaveRecovery(storage).load(owner,slot,()=>true);},
 };
}
for(const caller of ['catalogue','embedded','another','buy-list'])test(`actual web ${caller} create retains the no-photo request across lost response and remount`,async()=>{
 const f=await fixture({caller});await f.save();assert.match(f.attempts[0]?.productRequestId??'',/^[0-9a-f-]{36}$/);assert(f.retained());assert.equal(f.navigation.length,0);assert.equal(f.parents.length,0);assert.equal(f.reset(),false);
 await f.remount();await f.save();assert.equal(f.attempts.length,2);assert.deepEqual(f.attempts[1],f.attempts[0]);assert.equal(f.products.size,1);assert.equal(f.retained(),null);assert.equal(f.attempts[1].initialStock,4);assert.equal(f.attempts[1].batchNumber,'QA-BATCH');
 const id=[...f.products.values()][0].product.id;
 if(caller==='embedded')assert.deepEqual(f.parents,[id]);else if(caller==='another')assert.equal(f.reset(),true);else assert.deepEqual(f.navigation,[`/shop/products/${id}`]);
 if(caller==='buy-list')assert.deepEqual(f.links,[{id:'qa-demand',status:'stocked',productId:id}]);
});
test('actual web buy-list completion retries its parent step without a second create',async()=>{
 const f=await fixture({caller:'buy-list',loseResponse:false,loseLink:true});await f.save();assert(f.retained());assert.equal(f.navigation.length,0);await f.save();assert.equal(f.attempts.length,1);assert.deepEqual(f.links[0],f.links[1]);assert.equal(f.products.size,1);assert.equal(f.retained(),null);assert.equal(f.navigation.length,1);
});

test('actual web no-photo create never sends before its recovery record is durable',async()=>{
 const f=await fixture({failStorage:true});await f.save();assert.equal(f.attempts.length,0);assert.equal(f.products.size,0);assert.equal(f.navigation.length,0);assert.equal(f.errors.length,1);
});
