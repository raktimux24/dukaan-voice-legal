const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts','.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
}
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
global.React = React;
const {renderToStaticMarkup} = require('react-dom/server');
const {CashbookView} = require('../app/lib/shop/cashbook/view.tsx');
const h = React.createElement;
const ui = {
  Box: ({children}) => h('div', null, children),
  Text: ({children}) => h('p', null, children),
  Button: ({label,disabled}) => h('button', {disabled}, label),
  Input: ({label,value,disabled,type}) => h('input', {'aria-label':label,value,disabled,type:type==='date'?'date':'text',readOnly:true}),
  Check: ({label}) => h('span',null,label),
  Busy: ({label}) => h('span',null,label),
  Select: () => null, Totals: () => null,
};
function render({data,error,busy=false,pending=null,isPending=false,ready=true}={}) {
  const w={data:{data,error,isPending},day:'2026-10-29',ready,allowed:true,busy,pending,error:'',clearError(){},refresh(){},setDay(){},reloadStorage(){}};
  return renderToStaticMarkup(h(CashbookView,{w,ui,t:k=>k,language:'en',share:async()=>{}}));
}
test('cashbook keeps date navigation available while a selected day loads or fails',()=>{
  for(const state of [{isPending:true},{error:new Error('cashbook_invalid')}]) {
    const html=render(state);
    assert.match(html,/aria-label="cashbook.date"/);
    assert.match(html,/value="2026-10-29"/);
    assert.doesNotMatch(html,/<input[^>]*disabled/);
    assert.match(html,/cashbook.cashbook/);
  }
});
test('pending mutations block date navigation; first-time setup retains its own start date',()=>{
  assert.match(render({pending:{clientId:'retained'}}),/<input[^>]*disabled/);
  const html=render({data:{account:null,role:'OWNER',suggested:null,expenses:[],categories:[]}});
  assert.doesNotMatch(html,/aria-label="cashbook.date"/);
  assert.match(html,/aria-label="cashbook.start_day"/);
});
