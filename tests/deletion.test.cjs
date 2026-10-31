const fs=require('node:fs'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {test}=require('node:test'),assert=require('node:assert/strict');
const {getLocalizedHtml}=require('../app/content/localized.ts');
const copies=require('../app/content/retention-locales.json');
const privacyNotices=require('../app/content/privacy-disclosures.json');
const {performDeletion,deletionFailure}=require('../app/lib/shop/deletion/workflow.ts');
test('every published legal locale serves corrected retention, deletion, contact and updated terms',()=>{
 for(const [language,copy] of Object.entries(copies)) {
  const privacy=getLocalizedHtml('privacy',language),terms=getLocalizedHtml('terms',language);
  const section=privacy.match(/<details id="s6">[\s\S]*?<\/details>/)[0];
  const text=section.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  assert.ok(text.includes(copy.deletion),language+': complete deletion disclosure');
  assert.ok(privacy.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').includes(copy.retention),language+': retention disclosure');
  assert.ok(privacy.includes(privacyNotices[language].updated)&&terms.includes(copy.updated),language+': effective date');
  assert.ok(section.includes('mailto:meetslimshady07@gmail.com'),language+': support');
  assert.ok(section.includes('href="/delete-account"'),language+': no-shop deletion entry');
  assert.ok(terms.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').includes(copy.deletion),language+': terms aligned');
 }
});
test('identity removal requires an explicit successful server receipt',async()=>{
 let identities=0;
 for(const code of ['fiscal_retention_required','account_retention_check_failed','network_error']){
  await assert.rejects(performDeletion(async()=>{throw Object.assign(new Error(code),{code});},async()=>{identities++;}));
 }
 for(const receipt of [null,{}, {ok:false}])await assert.rejects(performDeletion(async()=>receipt,async()=>{identities++;}));
 assert.equal(identities,0);
 await performDeletion(async()=>({ok:true}),async()=>{identities++;});assert.equal(identities,1);
 assert.equal(deletionFailure({code:'fiscal_retention_required'}),'retained');
});
test('all eleven legal locales disclose actual collection and provider retention without obsolete deletion promises',()=>{
 for(const [language,copy] of Object.entries(privacyNotices)){
  const html=getLocalizedHtml('privacy',language);
  const text=html.replace(/<[^>]*>/g,' ').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&').replace(/\s+/g,' ');
  for(const key of ['voice','business','diagnostics','uses','providers','sharing','partial','updated'])assert.ok(text.includes(copy[key]),language+'/'+key);
  assert.match(html,/data-privacy-disclosures="2026-10-31"/);
 }
 const en=getLocalizedHtml('privacy','en');
 assert.ok(!en.includes('anonymized error reports'));assert.ok(!en.includes('typically 90 days'));assert.ok(!en.includes('Only the resulting text transcript'));
});
