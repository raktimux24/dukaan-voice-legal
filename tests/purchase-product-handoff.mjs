import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
const require = createRequire(import.meta.url);
const ts = require('typescript');

// Exercise actual component event handlers with isolated hook/transport adapters.
// GST arithmetic/review contracts have their own integration tests; this verifies
// the product-creation handoff cannot silently create stock or lose the invoice.
let active;
function hooks() {
  const values = [], refs = [];
  return {
    render(fn, props = {}) { active = this; this.cursor = 0; this.refCursor = 0; return fn(props); },
    values, refs,
  };
}
const react = {
  useState(initial) {
    const owner = active, i = owner.cursor++;
    if (!(i in owner.values)) owner.values[i] = typeof initial === 'function' ? initial() : initial;
    return [owner.values[i], next => { owner.values[i] = typeof next === 'function' ? next(owner.values[i]) : next; }];
  },
  useRef(initial) { const i = active.refCursor++; return active.refs[i] ??= { current: initial }; },
  useMemo(fn) { return fn(); }, useEffect() {},
};
const jsx = (type, props) => ({ type, props });
const components = new Map();
const component = name => { if (!components.has(name)) components.set(name, Object.assign(() => null, { displayName: name })); return components.get(name); };
const ui = Object.fromEntries(['Button', 'Card', 'PageHeader', 'Notice', 'ShopDialog', 'Field', 'NoAccess', 'Spinner'].map(name => [name, component(name)]));
ui.cx = (...parts) => parts.filter(Boolean).join(' ');
ui.inputClass = 'shop-field';
const gstUi = Object.fromEntries(['BuyerFields', 'TaxFields', 'TextField', 'SelectField', 'StateField', 'Check', 'Section', 'Stats'].map(name => [name, component(name)]));
gstUi.useGstText = () => value => value;
gstUi.emptyTax = () => ({ category: 'taxable', rate: 0, reviewed: false });
gstUi.emptyBuyer = () => ({ name: '', address: '', gstin: '', stateCode: '' });
const calls = [], navigations = [];
const created = { id: 'created-product', name: 'New service', category: 'staples', subcategory: 'service', unit: 'piece', minStockLevel: 0, trackStock: false, gstConfig: { category: 'taxable', rate: 18, codeType: 'sac', code: '998719', reviewed: true, version: 'v1' } };
const shop = {
  api: {
    addProduct: async (id, body) => { calls.push({ id, body }); return { product: created }; },
    updateBuyList: async () => { throw Error('Inline creation must not update a URL buy-list item'); },
    getAllInventory: async () => [], gst: {},
  },
  shop: { id: 'shop-a', name: 'Synthetic shop', category: 'grocery' },
  perms: { canEditProducts: true, canSeeCost: true }, hideCost: false,
  setNotice() {}, t: (_key, fallback) => fallback,
};
const pos = { data: { gstPurchasesAvailable: true }, isPending: false };
const catalog = { data: [], refetch: async () => { calls.push({ refetch: true }); } };
const query = { useQuery: options => options.queryKey[0] === "catalog" ? { data: [] } : pos, useQueryClient: () => ({ invalidateQueries: async () => {} }) };
const params = new URLSearchParams('name=URL%20product&qty=12&buyListItemId=unrelated');
const nav = { useRouter: () => ({ push: path => navigations.push(path) }), useSearchParams: () => params };
const fallback = new Proxy({}, { get: (_target, key) => String(key) });
let productModule;
function load(file) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(output, {
    exports, crypto: webcrypto, console,
    require: name => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next/navigation') return nav;
      if (name === '@tanstack/react-query') return query;
      if (name.endsWith('/context')) return { useShop: () => shop };
      if (name.endsWith('/ui')) return ui;
      if (name.endsWith('/gst-ui')) return gstUi;
      if (name.endsWith('/product-form')) return productModule;
      if (name.endsWith('/supplier-field')) return { SupplierField: component('SupplierField') };
      if (name.endsWith('/gst-supplier')) return { SupplierPicker: component('SupplierPicker') };
      if (name.endsWith('/gst-workspace')) return {
        GstAccess: component('GstAccess'), ReadState: component('ReadState'),
        useGstAction: () => ({ busy: false, notice: null, run: fn => fn() }),
        useGstQuery: key => key[0] === 'settings' ? pos : key[0] === 'purchase-products' ? catalog : {},
      };
      if (name.endsWith('/catalog')) return {
        enabledL1: () => [{ code: 'staples' }], l2ForL1: () => [{ code: 'service' }],
        l2ItemType: () => 'service', isAllowedL2: () => true,
        labeledL1: () => 'Staples', labeledL2: () => 'Service', remapProductL1: value => value,
      };
      if (name.endsWith('/units')) return { UNITS: ['piece'], formatQty: value => String(value) };
      if (name.endsWith('/money')) return { formatINR: value => String(value) };
      if (name.endsWith('/en-fallback')) return { EN_FALLBACK: fallback };
      if (name.endsWith('/product-gross-price')) return { discountedBuyingPrice: price => price === '' ? null : Number(price), productPriceBreakdown: () => null };
      if (name.endsWith('/gst')) return { validateProductTaxDraft() {} };
      if (name.endsWith('/fiscal-date')) return { indianCalendarDate: () => '2026-10-13' };
      if (name.endsWith('/purchase-review-draft')) return { purchaseReviewSignature: value => JSON.stringify(value) };
      if (name.endsWith('/purchase-draft')) return { purchaseDraftHasPrice: line => line.priceText !== '', purchaseDraftTax: line => line.tax, purchaseLineForRequest: line => line };
      if (name.endsWith('/purchase-gst')) return { purchaseTotals: () => ({ net: 0, tax: 0, total: 0 }) };
      if (name.endsWith('/purchase-batch-link')) return { eligiblePurchaseReceipts: () => [] };
      throw Error(`Unmocked component dependency: ${name}`);
    },
  }, { filename: file });
  return exports;
}
function walk(node) {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children)];
}
const pick = (tree, name, predicate = () => true) => walk(tree).find(node => (node.type === name || node.type?.displayName === name) && predicate(node));
productModule = load('app/components/shop/screens/product-form.tsx');
const { PurchaseNewScreen } = load('app/components/shop/screens/purchase-new.tsx');
const purchaseHooks = hooks();
let tree = purchaseHooks.render(PurchaseNewScreen);
const supplier = { id: 'supplier-original', identity: { name: 'Original supplier', stateCode: '29' } };
pick(tree, 'SupplierPicker').props.onChange(supplier);
pick(tree, 'TextField', node => node.props.label === 'Supplier invoice number').props.onChange('INV-123');
pick(tree, 'TextField', node => node.props.label === 'Evidence reference').props.onChange('paper-original');
pick(tree, 'Button', node => node.props.children === 'Add product').props.onClick();
tree = purchaseHooks.render(PurchaseNewScreen);
assert.equal(pick(tree, 'fieldset').props.disabled, true, 'Invoice edits remain disabled while the product sheet is open');
const productNode = walk(tree).find(node => node.type === productModule.ProductFormScreen);
assert.ok(productNode);
const productHooks = hooks();
let form = productHooks.render(productModule.ProductFormScreen, productNode.props);
assert.equal(pick(form, 'input', node => node.props.placeholder === 'e.g. Tata Salt 1 kg').props.value, '', 'Invoice sheet ignores unrelated URL prefill');
pick(form, 'input', node => node.props.placeholder === 'e.g. Tata Salt 1 kg').props.onChange({ target: { value: created.name } });
form = productHooks.render(productModule.ProductFormScreen, productNode.props);
assert.equal(pick(form, 'Field', node => node.props.label === 'Opening stock'), undefined, 'Opening-stock editor is absent from invoice product creation');
form.props.onSubmit({ preventDefault() {} });
await new Promise(resolve => setImmediate(resolve));
assert.equal(calls[0].body.initialStock, 0);
assert.equal(calls[0].body.name, created.name);
assert.equal(calls.filter(call => call.body).length, 1);
assert.equal(navigations.length, 0, 'Inline creation keeps the original invoice screen');
tree = purchaseHooks.render(PurchaseNewScreen);
assert.equal(pick(tree, 'ShopDialog'), undefined);
assert.equal(pick(tree, 'SupplierPicker').props.value, supplier, 'Selected supplier survives inline creation');
assert.equal(pick(tree, 'TextField', node => node.props.label === 'Supplier invoice number').props.value, 'INV-123');
assert.equal(pick(tree, 'TextField', node => node.props.label === 'Evidence reference').props.value, 'paper-original');
const lineSection = pick(tree, 'Section', node => node.props.title === created.name);
assert.ok(lineSection, 'Created product is handed directly to the current invoice');
assert.equal(pick(lineSection, 'TextField', node => node.props.label === 'Buying price (₹)').props.value, '', 'Unknown cost must be entered, not silently interpreted as zero');
assert.equal(pick(lineSection, 'TaxFields').props.value.reviewed, false, 'Catalog review does not imply supplier-invoice review');
assert.equal(pick(lineSection, 'SelectField', node => node.props.label === 'Stock action'), undefined, 'Services cannot receive/link stock');
const line = purchaseHooks.values[2][0];
assert.equal(line.stockMode, 'invoice_only');
assert.equal(line.receiveStock, false);
assert.equal(line.trackStock, false);
assert.equal(line.productId, created.id);
// A tracked product follows the same explicit, non-receiving default.
created.trackStock = true;
created.purchasePrice = 42;
pick(tree, 'Button', node => node.props.children === 'Add product').props.onClick();
tree = purchaseHooks.render(PurchaseNewScreen);
walk(tree).find(node => node.type === productModule.ProductFormScreen).props.onCreated(created.id, created);
tree = purchaseHooks.render(PurchaseNewScreen);
assert.equal(purchaseHooks.values[2].length, 2);
assert.equal(purchaseHooks.values[2][0], line, 'Existing invoice lines are retained when another product is added');
const tracked = purchaseHooks.values[2][1];
assert.equal(tracked.stockMode, 'invoice_only');
assert.equal(tracked.receiveStock, false);
assert.equal(tracked.priceText, '42');
assert.equal(tracked.tax.reviewed, false);
assert.equal(pick(tree, 'Check', node => node.props.label === 'I have reviewed the invoice, tax details and stock actions.').props.checked, false);
console.log('Purchase product handoff: actual inline save, zero opening stock, original invoice draft, unknown price, service/stock defaults and fresh tax review passed.');
