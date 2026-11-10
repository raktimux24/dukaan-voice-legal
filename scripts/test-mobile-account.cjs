const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');

function render(status,{role='OWNER',pending=false,managementOnly=true,invoiceScope='user:shop'}={}) {
  const entitlement={status,plan:'monthly',hasMandate:['active','past_due'].includes(status),currentPeriodEnd:'2027-01-01',trialEnd:'2027-01-01',pendingReason:pending?'plan_switch':null,pendingPlan:'annual',canCancelPendingSwitch:pending};
  const values=[[{id:'shop',name:'Test shop',role}], 'shop','monthly',entitlement,false,'','','',[
    {id:'paid',status:'paid',amount:499,date:'2026-10-01',invoiceUrl:'https://invoice.example/paid'},
    {id:'unpaid',status:'issued',amount:499,date:'2026-10-02',invoiceUrl:'https://invoice.example/pay-now'},
  ],'',invoiceScope];
  let cursor=0;
  const cache=new Map();
  function load(file) {
    if(cache.has(file))return cache.get(file).exports;
    const module={exports:{}};cache.set(file,module);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    vm.runInNewContext(code,{module,exports:module.exports,URLSearchParams,URL,Intl,process,console,require(id){
      if(id==='react') return {...React,useState:()=>[values[cursor++],()=>{}],useEffect:()=>{},useMemo:fn=>fn(),useRef:value=>({current:value}),useCallback:fn=>fn};
      if(id==='@clerk/nextjs')return {useAuth:()=>({getToken:async()=>null}),useUser:()=>({user:{id:'user',primaryEmailAddress:{emailAddress:'fixture@example.test'}}}),useClerk:()=>({signOut(){}}),UserButton:()=>null};
      if(id==='next/navigation')return {useSearchParams:()=>new URLSearchParams()};
      if(id==='next/link')return ({children,...props})=>React.createElement('a',props,children);
      if(id.startsWith('.')) {
        let resolved=path.resolve(path.dirname(file),id);
        if(resolved.endsWith('.json'))return JSON.parse(fs.readFileSync(resolved,'utf8'));
        resolved=['.ts','.tsx'].map(ext=>resolved+ext).find(p=>fs.existsSync(p));
        if(!resolved)throw Error('Unresolved module '+id);
        return load(resolved);
      }
      return require(id);
    }},{filename:file});
    return module.exports;
  }
  const {AccountDashboard}=load(path.resolve('app/account/AccountClient.tsx'));
  return renderToStaticMarkup(AccountDashboard({locale:'en',managementOnly}));
}

test('native account page has no purchase or payment-method setup flow in every billing state',()=>{
  for(const status of ['none','trialing','active','past_due','canceled','expired','pending_authentication','legacy_free']) {
    const html=render(status);
    assert.doesNotMatch(html,/Subscribe|Finish setup|Switch to|Update payment method|Set up a new payment method|\/pricing|pay-now|Authorise now/);
    assert.match(html,/invoice\.example\/paid/);
  }
  assert.doesNotMatch(render('active',{pending:true}),/Authorise now|pay-now|\/pricing/);
});
test('ordinary website retains checkout; native managers cannot cancel billing',()=>{
  assert.match(render('none',{managementOnly:false}),/Subscribe/);
  assert.match(render('active'),/Cancel subscription/);
  assert.doesNotMatch(render('active',{role:'MANAGER'}),/Cancel subscription|invoice\.example/);
  assert.doesNotMatch(render('active',{invoiceScope:'user:other-shop'}),/invoice\.example/);
  assert.doesNotMatch(render('active',{invoiceScope:'previous-user:shop'}),/invoice\.example/);
});
