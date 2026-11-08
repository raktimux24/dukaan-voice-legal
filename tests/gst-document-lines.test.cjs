const fs = require('node:fs');
const ts = require('typescript');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { fileName:f, compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX, target:ts.ScriptTarget.ES2022, esModuleInterop:true} }).outputText, f);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { GstDocumentLines } = require('../app/components/shop/gst-document-lines.tsx');
const { documentHtml } = require('../app/lib/shop/gst-print.ts');
const lines = [
  {name:'<Rice & grain>', quantity:2, unit:'kg', classification:'1006', rate:'5%', net:200, discount:10, taxable:200, tax:10, total:210, components:{CGST:5, SGST:5, IGST:0}},
  {name:'Interstate item', quantity:1, unit:'piece', classification:'8517', rate:'18%', net:1000, discount:0, taxable:1000, tax:180, total:1180, components:{IGST:180, UTGST:0}},
];
const markup = renderToStaticMarkup(React.createElement(GstDocumentLines, {lines, text:x=>'Translated '+x}));
test('mobile document preserves item particulars, discounts and component taxes', () => {
  const d = new JSDOM(markup).window.document;
  const items = [...d.querySelectorAll('.gst-mobile-lines>li')];
  assert.equal(items.length, 2);
  assert.equal(items[0].querySelector('h3').textContent, '<Rice & grain>');
  const fields = Object.fromEntries([...items[0].querySelectorAll('dl>div')].map(row=>[row.querySelector('dt').textContent,row.querySelector('dd').textContent]));
  assert.deepEqual(fields, {'Translated Quantity':'2 kg','Translated HSN / SAC':'10065%','Translated Before GST':'₹200.00','Translated Discount':'₹10.00','Translated Taxable value':'₹200.00','Translated GST':'₹10.00',CGST:'₹5.00',SGST:'₹5.00','Translated Total':'₹210.00'});
  assert.equal(items[1].querySelector('.gst-mobile-tax dt').textContent, 'IGST');
  assert.equal(items[1].querySelector('.gst-mobile-tax dd').textContent, '₹180.00');
  assert.equal(items[1].querySelector('.gst-mobile-total dd').textContent, '₹1,180.00');
  assert.ok(!items[1].textContent.includes('UTGST'));
  assert.equal(d.querySelectorAll('table tbody tr').length,2);
  assert.equal(d.querySelectorAll('th[scope="col"]').length,7);
});
test('download/print HTML retains full table and hides the alternate mobile view', () => {
  const d = new JSDOM('<article>'+markup+'</article>').window.document;
  const output = new JSDOM(documentHtml(d.querySelector('article'),'Example bill')).window.document;
  assert.equal(output.querySelectorAll('table tbody tr').length,2);
  assert.equal(output.defaultView.getComputedStyle(output.querySelector('.gst-mobile-lines')).display,'none');
  assert.notEqual(output.defaultView.getComputedStyle(output.querySelector('.gst-document-table')).display,'none');
});
