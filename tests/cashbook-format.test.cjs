const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {test}=require('node:test'),assert=require('node:assert/strict');
const {cashMoney}=require('../app/lib/shop/cashbook/format.ts');
test('cashbook groups exact decimal amounts without floating point precision loss',()=>{
 for(const [input,expected] of [['88736.64','₹88,736.64'],['1234567.89','₹12,34,567.89'],['-12500.50','−₹12,500.50'],['0','₹0.00'],['15.5','₹15.50'],['9007199254740993.01','₹9,00,71,99,25,47,40,993.01']])assert.equal(cashMoney(input),expected);
});
test('invalid amounts are not displayed as valid financial values',()=>{for(const x of ['','NaN','1.234','1e3'])assert.equal(cashMoney(x),'—')});
