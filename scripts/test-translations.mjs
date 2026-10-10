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
// Native-language labels must not accidentally inherit another language's script.
const scripts = { hi: [0x900, 0x97f], mr: [0x900, 0x97f], bn: [0x980, 0x9ff], gu: [0xa80, 0xaff], ta: [0xb80, 0xbff], te: [0xc00, 0xc7f], kn: [0xc80, 0xcff], ml: [0xd00, 0xd7f], hinglish: [0, 0] };
for (const [language, [start, end]] of Object.entries(scripts)) {
  for (const [key, value] of Object.entries(web[language])) {
    const foreign = [...value].some(character => {
      const code = character.codePointAt(0);
      return /[\p{L}\p{M}]/u.test(character) && code >= 0x900 && code <= 0xd7f && (code < start || code > end);
    });
    assert.equal(foreign, false, `${language}: unexpected script in ${key}`);
  }
}
const require = createRequire(new URL('../app/lib/shop/translations.ts', import.meta.url));
const loadTs = (filename) => {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('require', 'exports', source)((id) => id === './en-fallback' ? loadTs('app/lib/shop/en-fallback.ts') : require(id), exports);
  return exports;
};
const { translateUi } = loadTs('app/lib/shop/translations.ts');
// An older general catalog must not replace current bundled GST guidance.
assert.equal(translateUi('en', { 'gst.margin_estimate': 'Margin uses recorded purchase cost; input-tax credits are not calculated.' }, 'gst.margin_estimate', 'Margin estimates use recorded purchase cost. Saved input-tax reviews can change acquisition costs.'), 'Margin estimates use recorded purchase cost. Saved input-tax reviews can change acquisition costs.');
assert.equal(translateUi('hi', { 'sale_complete.new_sale': 'छूट' }, 'sale_complete.new_sale', 'New sale'), 'नई बिक्री');
assert.equal(translateUi('hi', {}, 'missing.alias', 'GST setup'), web.hi['web.gst.gst_setup']);
assert.equal(translateUi('hi', {}, 'missing.alias', 'You are signed in as {{role}} of this shop.', { role: 'OWNER' }).includes('{{role}}'), false);
assert.equal(translateUi('en', {}, 'missing', 'Keep {{name}}', { name: 'Suresh' }), 'Keep Suresh');
assert.equal(translateUi('hi', {}, 'unknown', 'Krishna Enterprise'), 'Krishna Enterprise');
for (const language of languages) {
  const fallback = 'This supplier document number has already been recorded. Review the existing document before creating another entry.';
  const translated = translateUi(language, {}, 'gst.error.duplicate_purchase_document', fallback);
  assert.notEqual(translated, fallback, `${language}: duplicate purchase conflict must be translated`);
}

for (const language of languages) {
  const fallback = web.en['bill.use_verified_gst_document'];
  assert.notEqual(translateUi(language, {}, 'bill.use_verified_gst_document', fallback), fallback, `${language}: GST bill guidance must be translated`);
}

assert.equal(translateUi('kn', { arbitrary: 'ಕನ್ನಡ' }, 'arbitrary', 'A label'), 'ಕನ್ನಡ');
// Web actions must not inherit differently scoped mobile copy for the same key.
assert.equal(translateUi('bn', { 'settings.export_sales': 'বিক্রয় (গত 30 দিন)' }, 'settings.export_sales', 'Sales CSV (this month)'), 'বিক্রির CSV (এই মাসের)');
assert.equal(translateUi('bn', { 'settings.section_language_voice': 'ভাষা এবং কণ্ঠস্বর' }, 'settings.section_language_voice', 'Preferences'), 'পছন্দসমূহ');
assert.equal(translateUi('bn', { 'text_size.extra_large': 'বড়' }, 'text_size.extra_large', 'Extra Large'), 'অতিরিক্ত বড়');
assert.equal(translateUi('bn', { 'unit_picker.piece': 'piece' }, 'unit_picker.piece', 'piece'), 'টি');
assert.equal(translateUi('bn', { 'customers.settled': 'সমস্ত' }, 'customers.settled', 'All settled'), 'সব বকেয়া মেটানো হয়েছে');
// Dynamic notices must select a template before inserting product data.
const dynamicNotices = {
  'pos.out_of_stock_toast': '{{name}} is out of stock',
  'pos.capped_toast': 'Only {{n}} {{unit}} of {{name}} in stock',
  'modal.add_product.toast_added': '{{name}} added to inventory',
  'modal.product_detail.toast_added_buy_list': '{{name}} added to Buy List',
};
for (const language of ['en', ...languages]) {
  const dictionary = JSON.parse(fs.readFileSync(`app/lib/shop/locales/${language}.json`, 'utf8'));
  for (const [key, fallback] of Object.entries(dynamicNotices)) {
    assert.ok(dictionary[key], `${language}: missing dynamic notice ${key}`);
    assert.deepEqual(placeholders(dictionary[key]), placeholders(fallback));
    const rendered = translateUi(language, dictionary, key, fallback, { name: 'Camlin C4', n: 2, unit: 'kg' });
    assert.ok(rendered.includes('Camlin C4'));
    assert.equal(placeholders(rendered).length, 0);
    if (language !== 'en') assert.notEqual(rendered, fallback.replace('{{name}}', 'Camlin C4').replace('{{n}}', '2').replace('{{unit}}', 'kg'));
  }
}

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
