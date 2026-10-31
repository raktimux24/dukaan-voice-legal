const fs=require('node:fs'),ts=require('typescript'),test=require('node:test'),assert=require('node:assert/strict');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {signInVerificationMethods,sendSignInCode,verifySignInCode,validSignInCode}=require('../app/lib/shop/sign-in-verification.ts');
function attempt(status='needs_client_trust',strategies=['email_code']) {
 const calls=[];const s={status,supportedSecondFactors:strategies.map(strategy=>({strategy})),mfa:{}};
 for(const name of ['sendEmailCode','sendPhoneCode','verifyEmailCode','verifyPhoneCode','verifyTOTP','verifyBackupCode'])s.mfa[name]=async arg=>{calls.push([name,arg]);return{error:null}};
 return {s,calls};
}
test('new-device and legacy second-factor challenges remain verifiable; complete/unknown states do not offer factor submission',()=>{
 for(const status of ['needs_client_trust','needs_second_factor'])assert.deepEqual(signInVerificationMethods(attempt(status,['email_code','totp','email_link']).s),['email_code','totp']);
 for(const status of ['complete','needs_identifier','needs_first_factor',null])assert.deepEqual(signInVerificationMethods(attempt(status).s),[]);
});
test('preparation sends email or phone codes only through offered second factors',async()=>{
 const {s,calls}=attempt('needs_client_trust',['email_code','phone_code','totp','backup_code']);
 for(const method of ['email_code','phone_code','totp','backup_code'])await sendSignInCode(s,method);
 assert.deepEqual(calls.map(c=>c[0]),['sendEmailCode','sendPhoneCode']);
 await assert.rejects(()=>sendSignInCode(attempt('complete').s,'email_code'));
 await assert.rejects(()=>sendSignInCode(attempt().s,'phone_code'));
});
test('six-digit verification and reusable backup-code formats are validated before contacting Clerk',async()=>{
 for(const code of ['','12345','1234567','abcdef'])assert.equal(validSignInCode('email_code',code),false);
 assert.equal(validSignInCode('email_code',' 123456 '),true);
 assert.equal(validSignInCode('backup_code','abcd-efgh'),true);
 const {s,calls}=attempt();await assert.rejects(()=>verifySignInCode(s,'email_code','bad'));assert.equal(calls.length,0);
});
test('each offered method reaches its corresponding SDK verifier with the trimmed code',async()=>{
 const {s,calls}=attempt('needs_second_factor',['email_code','phone_code','totp','backup_code']);
 for(const method of ['email_code','phone_code','totp','backup_code'])await verifySignInCode(s,method,' 123456 ');
 assert.deepEqual(calls,[['verifyEmailCode',{code:'123456'}],['verifyPhoneCode',{code:'123456'}],['verifyTOTP',{code:'123456'}],['verifyBackupCode',{code:'123456'}]]);
});
test('expired/incorrect/network failures stay available to the verification UI instead of completing sign-in',async()=>{
 const {s}=attempt();const error={message:'Code expired'};s.mfa.verifyEmailCode=async()=>({error});
 assert.deepEqual(await verifySignInCode(s,'email_code','123456'),{error});assert.equal(s.status,'needs_client_trust');
 s.mfa.sendEmailCode=async()=>{throw new Error('Network unavailable')};await assert.rejects(()=>sendSignInCode(s,'email_code'),/Network unavailable/);
});
test('all ten bundled verification languages have complete keys and matching destination/count placeholders',()=>{
 const locales=require('../app/lib/shop/auth-verification-locales.json');const keys=Object.keys(locales.en).sort();assert.equal(Object.keys(locales).length,10);
 for(const [lang,dict]of Object.entries(locales)){
  assert.deepEqual(Object.keys(dict).sort(),keys,lang);
  for(const key of keys){assert.ok(dict[key].trim(),lang+key);assert.deepEqual((dict[key].match(/\{\{[^}]+\}\}/g)||[]).sort(),(locales.en[key].match(/\{\{[^}]+\}\}/g)||[]).sort(),lang+key);}
 }
});
