const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),test=require('node:test'),assert=require('node:assert/strict');
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
test('all ten bundled auth languages have complete keys and matching placeholders',()=>{
 const locales=require('../app/lib/shop/auth-locales.json');const keys=Object.keys(locales.en).sort();assert.equal(Object.keys(locales).length,10);
 for(const [lang,dict]of Object.entries(locales)){
  assert.deepEqual(Object.keys(dict).sort(),keys,lang);
  for(const key of keys){assert.ok(dict[key].trim(),lang+key);assert.deepEqual((dict[key].match(/\{\{[^}]+\}\}/g)||[]).sort(),(locales.en[key].match(/\{\{[^}]+\}\}/g)||[]).sort(),lang+key);}
 }
});

const {authCopy,authErrorMessage,resolveAuthLanguage}=require('../app/lib/shop/auth-copy.ts');
test('auth language follows explicit choice, trusted marketing locale, saved choice and browser fallback',()=>{
 const origin='https://samaanbol.space';
 assert.equal(resolveAuthLanguage({requested:'ta',referrer:origin+'/hi',origin,saved:'bn',browser:'en-IN'}),'ta');
 assert.equal(resolveAuthLanguage({referrer:origin+'/hi/pricing',origin,saved:'bn',browser:'en-IN'}),'hi');
 assert.equal(resolveAuthLanguage({referrer:'https://untrusted.example/hi',origin,saved:'kn',browser:'en-IN'}),'kn');
 assert.equal(resolveAuthLanguage({requested:'unsupported',saved:'unsupported',browser:'hi-Latn-IN'}),'hinglish');
 assert.equal(resolveAuthLanguage({browser:'ml-IN'}),'ml');
 assert.equal(resolveAuthLanguage({browser:'or-IN'}),'en');
 assert.equal(resolveAuthLanguage({referrer:origin+'/',origin,saved:'hi'}),'en');
});
test('auth rendering keys are bundled without a translation API; native copy does not mix scripts',()=>{
 const locales=require('../app/lib/shop/auth-locales.json');
 const file=path.join(__dirname,'../app/components/shop/auth-screen.tsx');
 const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const used=new Set();
 const visit=node=>{
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='t'&&ts.isStringLiteral(node.arguments[0]))used.add(node.arguments[0].text);
  if(ts.isJsxText(node)&&/[A-Za-z]{3}/.test(node.text))assert.ok(['Samaan','Bol'].includes(node.text.trim()),'untranslated JSX: '+node.text.trim());
  ts.forEachChild(node,visit);
 };visit(ast);
 const scripts={hi:[0x900,0x97f],mr:[0x900,0x97f],bn:[0x980,0x9ff],gu:[0xa80,0xaff],ta:[0xb80,0xbff],te:[0xc00,0xc7f],kn:[0xc80,0xcff],ml:[0xd00,0xd7f],hinglish:[0,0]};
 for(const [lang,dict] of Object.entries(locales)){
  for(const key of used)assert.ok(dict[key]?.trim(),lang+': missing '+key);
  if(lang==='en')continue;
  const [start,end]=scripts[lang];
  for(const [key,text]of Object.entries(dict))assert.equal([...text].some(c=>/[\p{L}\p{M}]/u.test(c)&&c.codePointAt(0)>=0x900&&c.codePointAt(0)<=0xd7f&&(c.codePointAt(0)<start||c.codePointAt(0)>end)),false,lang+': mixed script '+key);
 }
});
test('localized code instructions interpolate destinations and provider errors keep the selected language',()=>{
 const locales=require('../app/lib/shop/auth-locales.json');
 for(const lang of Object.keys(locales)){
  const t=authCopy(lang);
  assert.ok(t('auth.verify.help.email_code','missing',{destination:'fixture@example.test'}).includes('fixture@example.test'));
  assert.equal(authErrorMessage({code:'form_password_incorrect',message:'Provider English'},'fallback',lang),locales[lang]['auth.error.credentials']);
  assert.equal(authErrorMessage({code:'form_password_pwned'},'fallback',lang),locales[lang]['auth.error.password_unsafe']);
  if(lang!=='en')assert.equal(authErrorMessage({code:'unrecognized',message:'Provider English'},'localized fallback',lang),'localized fallback');
 }
 assert.match(locales.en['auth.forgot.subtitle'],/code/);
 assert.doesNotMatch(locales.en['auth.forgot.button'],/link/i);
});
