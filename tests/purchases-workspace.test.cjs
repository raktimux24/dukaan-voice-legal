const fs=require('node:fs'),{test}=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {purchaseAccess,filterInvoices,invoicePeriod,reviewedCredit}=require('../app/lib/shop/purchases/presentation.ts');
test('retained invoices remain readable when creation is disabled; unknown capability blocks new records',()=>{
 assert.deepEqual(purchaseAccess({gstProtocol:2,gstPurchasesAvailable:false}),{readable:true,writable:false});
 assert.deepEqual(purchaseAccess({gstProtocol:2,gstPurchasesAvailable:true}),{readable:true,writable:true});
 for(const settings of [undefined,{}, {gstProtocol:1,gstPurchasesAvailable:true},{gstProtocol:2}])assert.deepEqual(purchaseAccess(settings),{readable:false,writable:false});
 assert.equal(purchaseAccess({gstProtocol:2,gstPurchasesAvailable:true},true).writable,false);
});
test('search finds supplier and document references without mutating loaded records',()=>{
 const rows=[{number:'Internal-1',snapshot:{invoiceNumber:'INV/9',supplier:{name:'श्री गणेश'}}},{number:'Internal-2',snapshot:{invoiceNumber:'ABC',supplier:{name:'Lakshmi Wholesale'}}}];
 assert.equal(filterInvoices(rows,' inv/9 ')[0],rows[0]);assert.equal(filterInvoices(rows,'गणेश')[0],rows[0]);assert.equal(filterInvoices(rows,'WHOLESALE')[0],rows[1]);assert.equal(filterInvoices(rows,'internal-2')[0],rows[1]);assert.deepEqual(filterInvoices(rows,'unknown'),[]);assert.equal(filterInvoices(rows,' '),rows);
});
test('period links retain inclusive boundaries and malformed dates safely use the current month',()=>{
 assert.deepEqual(invoicePeriod('2026-01-01','2026-01-31'),{from:'2026-01-01',through:'2026-01-31'});
 assert.notEqual(invoicePeriod('2026-02-31','2026-01-01').from,'2026-02-31');
 assert.notEqual(invoicePeriod('broken',null).from,'broken');
});
test('reviewed credit includes reversals and signed movements',()=>{assert.equal(reviewedCredit([{amount:'75'},{amount:'-15'},{amount:'0'}]),60);assert.equal(reviewedCredit([]),0);});
test('invoice display provides every locale with explicit supplier balance copy',()=>{
 const catalogs=require('../app/lib/shop/gst-web-locales.json');
 for(const [language,catalog] of Object.entries(catalogs)){
 for(const key of Object.keys(catalogs.en).filter(k=>k.startsWith('invoiceweb.')))assert.ok(catalog[key]?.trim(),language+':'+key);
 assert.doesNotMatch(catalog['invoiceweb.payable'],/udhaar/i);
 }
});
