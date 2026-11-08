const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const ShopContext=React.createContext(null),original=Module._load;
Module._load=function(request,parent,isMain){const file=request.startsWith('.')&&parent?path.resolve(path.dirname(parent.filename),request):'';
 if(file.endsWith('/shop/context'))return {ShopContext,useShop:()=>React.useContext(ShopContext)};
 if(request==='next/link')return {__esModule:true,default:({children})=>React.createElement('a',null,children)};
 return original.apply(this,arguments);
};
const {Field}=require('../app/components/shop/ui.tsx');Module._load=original;
test('localized form labels and hints are not translated twice through stale text aliases',()=>{
 const render=localized=>renderToStaticMarkup(React.createElement(ShopContext.Provider,{value:{t:()=> 'पुराना अनुवाद'}},React.createElement(Field,{localized,label:'Category',hint:'Choose one'},React.createElement('input'))));
 const html=render(true);assert.match(html,/>Category</);assert.match(html,/>Choose one</);assert.doesNotMatch(html,/पुराना/);
 assert.match(render(false),/पुराना अनुवाद/,'legacy unlocalized callers still translate');
});
