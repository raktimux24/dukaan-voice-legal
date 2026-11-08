const fs = require('node:fs'), ts = require('typescript'), { test } = require('node:test'), assert = require('node:assert/strict');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const { profileDraft, profileChanges, PROFILE_UNITS } = require('../app/lib/shop/profile/form.ts');
const shop = { name: 'Corner shop', ownerName: 'Asha', phone: '9876543210', address: 'Market Road', city: 'Bengaluru', category: 'general', subtype: 'kirana' };
test('unchanged profile sends no patch; legacy missing owner is not forced into an invalid update', () => {
  assert.deepEqual(profileChanges(shop, profileDraft(shop)), { patch: {}, error: undefined });
  const legacy = { ...shop, ownerName: null };
  assert.deepEqual(profileChanges(legacy, { ...profileDraft(legacy), city: 'Mysuru' }).patch, { city: 'Mysuru' });
});
test('only edited fields are sent, so refreshing other fields cannot overwrite them', () => {
  assert.deepEqual(profileChanges(shop, { ...profileDraft(shop), name: '  Updated shop  ' }).patch, { name: 'Updated shop' });
});
test('optional Indian phone normalizes accepted prefixes and rejects invalid nonempty input', () => {
  for (const value of ['+91 98765 43210', '09876543210', '919876543210']) assert.deepEqual(profileChanges(shop, { ...profileDraft(shop), phone: value }).patch, {});
  assert.equal(profileChanges(shop, { ...profileDraft(shop), phone: '123' }).error, 'phone');
  assert.equal(profileChanges(shop, { ...profileDraft(shop), phone: ' ' }).patch.phone, null);
});
test('owner and shop names cannot be cleared; owner names respect server length limit', () => {
  assert.equal(profileChanges(shop, { ...profileDraft(shop), name: ' ' }).error, 'name');
  assert.equal(profileChanges(shop, { ...profileDraft(shop), ownerName: '' }).error, 'ownerName');
  assert.equal(profileChanges(shop, { ...profileDraft(shop), ownerName: 'x'.repeat(121) }).error, 'ownerName');
  assert.equal(profileChanges(shop, { ...profileDraft(shop), ownerName: '  Meena  ' }).patch.ownerName, 'Meena');
});
test('empty optional contacts become null and server field lengths are retained', () => {
  assert.deepEqual(profileChanges(shop, { ...profileDraft(shop), address: ' ', city: ' ' }).patch, { address: null, city: null });
  const patch = profileChanges(shop, { ...profileDraft(shop), address: 'a'.repeat(320), city: 'b'.repeat(90) }).patch;
  assert.equal(patch.address.length, 300); assert.equal(patch.city.length, 80);
});
test('changing business type cannot submit an incompatible subtype', () => {
  const patch = profileChanges(shop, { ...profileDraft(shop), category: 'medical', subtype: 'kirana' }).patch;
  assert.equal(patch.category, 'medical'); assert.equal(patch.subtype, 'chemist');
});
test('default-unit choices preserve the mobile preference contract', () => {
  assert.deepEqual(PROFILE_UNITS, ['kg', 'g', 'liter', 'ml', 'piece', 'dozen', 'pack', 'box']);
});
test('new profile copy exists in every application language', () => {
  const catalogs = require('../app/lib/shop/gst-web-locales.json');
  for (const [language, catalog] of Object.entries(catalogs)) for (const key of Object.keys(catalogs.en).filter(k => k.startsWith('profileweb.') || k.startsWith('catalog.shop.') || k.startsWith('catalog.subtype.'))) assert.ok(catalog[key]?.trim(), `${language}: ${key}`);
});
