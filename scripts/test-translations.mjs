import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const web = JSON.parse(fs.readFileSync('app/lib/shop/gst-web-locales.json', 'utf8'));
const mobile = JSON.parse(fs.readFileSync('app/lib/shop/gst-locales.json', 'utf8'));
const languages = ['hi', 'hinglish', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml'];
const placeholders = value => (value.match(/\{\{?\w+\}?\}/g) ?? []).sort();
for (const language of languages) {
  const general = JSON.parse(fs.readFileSync(`app/lib/shop/locales/${language}.json`, 'utf8'));
  assert.ok(Object.keys(general).length > 2500, `${language}: incomplete mobile catalog`);
  for (const [key, english] of Object.entries(web.en)) {
    assert.ok(web[language]?.[key]?.trim(), `${language}: missing ${key}`);
    assert.deepEqual(placeholders(web[language][key]), placeholders(english), `${language}: placeholders ${key}`);
  }
  for (const key of Object.keys(mobile[language])) assert.ok(general[key] || mobile[language][key]);
}
const require = createRequire(new URL('../app/lib/shop/translations.ts', import.meta.url));
const loadTs = (filename) => {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('require', 'exports', source)((id) => id === './en-fallback' ? loadTs('app/lib/shop/en-fallback.ts') : require(id), exports);
  return exports;
};
const { translateUi } = loadTs('app/lib/shop/translations.ts');
assert.equal(translateUi('hi', { 'sale_complete.new_sale': 'छूट' }, 'sale_complete.new_sale', 'New sale'), 'नई बिक्री');
assert.equal(translateUi('hi', {}, 'missing.alias', 'GST setup'), web.hi['web.gst.gst_setup']);
assert.equal(translateUi('hi', {}, 'missing.alias', 'You are signed in as {{role}} of this shop.', { role: 'OWNER' }).includes('{{role}}'), false);
assert.equal(translateUi('en', {}, 'missing', 'Keep {{name}}', { name: 'Suresh' }), 'Keep Suresh');
assert.equal(translateUi('hi', {}, 'unknown', 'Krishna Enterprise'), 'Krishna Enterprise');
assert.equal(translateUi('kn', { arbitrary: 'ಕನ್ನಡ' }, 'arbitrary', 'A label'), 'ಕನ್ನಡ');
// Prevent hard-coded English from returning to authenticated screens.
for (const file of fs.readdirSync('app/components/shop/screens').filter(file => file.endsWith('.tsx'))) {
  const ast = ts.createSourceFile(file, fs.readFileSync(`app/components/shop/screens/${file}`, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = node => {
    if (ts.isJsxText(node) && /[A-Za-z]{3}/.test(node.text)) {
      assert.ok(['UPI', 'GST', 'GSTIN', 'HSN', 'SAC', 'MRP'].includes(node.text.trim()), `${file}: hard-coded UI text ${node.text.trim()}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
}
console.log(`Translation coverage passed: ${Object.keys(web.en).length} web labels across ${languages.length} translated languages, mobile catalogs and interpolation.`);
