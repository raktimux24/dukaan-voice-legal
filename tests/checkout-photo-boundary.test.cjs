const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {checkoutCustomer}=require('../app/lib/shop/checkout-customer.ts');
const {normalizeIndianMobile}=require('../app/lib/shop/phone.ts');
const {roundPaise}=require('../app/lib/shop/money.ts');
const {canonicalSaleRequest}=require('../app/lib/shop/gst-core/sale-request-canonical.ts');
const {prepareRspCartEntry}=require('../app/lib/shop/rsp-cart-entry.ts');
const filename=path.resolve(__dirname,'../app/components/shop/screens/checkout.tsx');
const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),builders=[];
function visit(node){if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.name.text==='buildBody')builders.push(node.initializer);ts.forEachChild(node,visit);}
visit(source);
assert.equal(builders.length,1,'exercise the actual checkout request builder, not a copied projection');
assert(ts.isArrowFunction(builders[0]));
const compiled=ts.transpileModule('const buildBody = '+builders[0].getText(source)+';',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const soldAt='2026-11-03T01:00:00.000Z',shop='10000000-0000-4000-8000-000000000003',product='20000000-0000-4000-8000-000000000003';
const profile={format:'samaan_rsp_product_profile_v1',version:'30000000-0000-4000-8000-000000000003',productId:product,rule:'cgst_rule_31d_2026',effectiveFrom:'2026-02-01T00:00:00.000Z',sourceReference:'SYNTHETIC test only',reviewed:true,goods:{hsn:'21069020',description:'pan_masala',reviewed:true,evidenceReference:'SYNTHETIC'},rates:{version:'SYNTHETIC',sourceReference:'SYNTHETIC',reviewed:true,cgst:20,sgst:20,utgst:0,igst:0}};
const snapshot={version:1,shopId:shop,productId:product,capturedAt:'2026-11-03T00:00:00.000Z',profiles:[{version:profile.version,recordedAt:'2026-02-01T00:00:00.000Z',effectiveAt:profile.effectiveFrom,state:'reviewed',profile}]};
function cart(){
 const prepared=prepareRspCartEntry({productId:product,name:'Synthetic package',unit:'piece',quantity:1,price:80,listPrice:80,discount:0},snapshot,shop,{area:'QA',packageId:'QA-1',prices:'140',increases:'',evidence:'SYNTHETIC photo boundary',reviewed:true},soldAt);
 assert.equal(prepared.calculation.statutory.tax,'40.00');
 return {lines:[prepared.line,{productId:'40000000-0000-4000-8000-000000000003',name:'No photo',unit:'piece',quantity:1,price:15,listPrice:15,discount:0}],note:'Synthetic only',customerId:null,customerName:null,customerPhone:null,inputMethod:'scan'};
}
function build(cart,portions={},options={}){
 const context={cartApi:{cart},normalizeIndianMobile,roundPaise,checkoutCustomer,cashPortion:135,tendered:135,upiPortion:0,upiRef:'',cardPortion:0,creditPortion:0,estimateReviewed:false,commerceCheckout:false,collectionReviewed:false,settings:{data:{}},gstContext:{settings:{version:'reviewed-synthetic-settings'}},creditReview:{},totals:{billDiscount:0},...portions,...options};
 const fn=new Function(...Object.keys(context),compiled+'; return buildBody;')(...Object.values(context));
 return fn(soldAt,'synthetic-customer',options.retained);
}
function canonical(body){return canonicalSaleRequest({...body,userId:'synthetic-actor'});}
function withPhotos(original,marker){
 const value=structuredClone(original);value.media={cover:marker};value.imageUrl='blob:'+marker;
 value.lines=value.lines.map(line=>({...line,media:{cover:{id:marker,version:marker}},mediaVersion:9,image:{id:marker},imageUrl:'blob:'+marker,thumbnailUri:'file:'+marker,product:{media:{cover:marker}}}));return value;
}
test('actual checkout projection strips photo state while retaining RSP and exact canonical identity',()=>{
 const original=cart(),expected=build(original),before=structuredClone(original);
 for(const marker of ['old-cover','replacement-cover','failed-photo']){
  const input=withPhotos(original,marker),saved=structuredClone(input),body=build(input);
  assert.deepEqual(body,expected);assert.deepEqual(input,saved,'projection cannot mutate the draft');
  assert.equal(canonical(body),canonical(expected));assert.equal(createHash('sha256').update(canonical(body)).digest('hex'),createHash('sha256').update(canonical(expected)).digest('hex'));
  assert(!JSON.stringify(body).includes(marker));
 }
 assert.deepEqual(original,before);assert.equal(expected.items[0].rsp.valuation.packageCount,1);assert.equal(expected.items[0].price,80);assert.equal(expected.payments[0].amount,135);
});
test('cash, UPI, card and split request payments stay exact across photo changes',()=>{
 const modes=[{cashPortion:135,tendered:140},{cashPortion:0,upiPortion:135,upiRef:'QA-UPI'},{cashPortion:0,cardPortion:135},{cashPortion:50,tendered:50,upiPortion:85,upiRef:'QA-SPLIT'}];
 for(const portions of modes){const original=cart(),expected=build(original,portions);assert.equal(expected.payments.reduce((sum,p)=>sum+p.amount,0),135);assert.deepEqual(build(withPhotos(original,'changed'),portions).payments,expected.payments);assert.equal(canonical(build(withPhotos(original,'changed'),portions)),canonical(expected));}
});
test('credit terms and retained customer/document presentation are not replaced by photo state',()=>{
 const original={...cart(),customerId:'synthetic-customer',customerName:'QA Customer',customerPhone:null};
 const retained={customerId:'synthetic-customer',customer:null,documentPresentation:{id:'retained-document',version:2}},options={retained,creditReview:{terms:{dueDate:null,acknowledged:true}},settings:{data:{documentBranding:{ref:{id:'new-document'}}}}};
 const portions={cashPortion:0,creditPortion:135};
 const body=build(original,portions,options);assert.equal(body.customer,null);assert.deepEqual(body.documentPresentation,retained.documentPresentation);assert.deepEqual(body.creditTerms,options.creditReview.terms);assert.equal(canonical(build(withPhotos(original,'changed'),portions,options)),canonical(body));
});
test('estimate/collection provenance and discounts remain the reviewed request values',()=>{
 const original={...cart(),estimateSource:{estimateId:'synthetic-estimate',commerceOrderId:'synthetic-order'},mixedDiscountReview:{policy:'commercial_amount_proportional_v1',reviewed:true,evidenceReference:'QA-discount'}};
 const options={estimateReviewed:true,commerceCheckout:true,collectionReviewed:true,totals:{billDiscount:5}};
 const body=build(original,{},options);assert.deepEqual(body.estimateSource,{...original.estimateSource,reviewed:true,collectionConfirmed:true});assert.equal(body.discountAmount,5);assert.deepEqual(body.mixedDiscountReview,original.mixedDiscountReview);assert.equal(canonical(build(withPhotos(original,'changed'),{},options)),canonical(body));
});
