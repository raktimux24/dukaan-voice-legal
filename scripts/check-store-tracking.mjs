import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual component's effect; simulate DOM clicks without contacting GA.
const source = readFileSync(new URL('../app/components/StoreClickTracking.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const handlers = new Map();
let cleanup;
class Element { constructor(link) { this.link = link; } closest() { return this.link; } }
const window = { location: { origin: 'https://samaanbol.space', pathname: '/hi' } };
const document = { documentElement: { lang: 'hi-IN' }, addEventListener: (n, f) => handlers.set(n,f), removeEventListener: n => handlers.delete(n) };
const exports = {};
vm.runInNewContext(outputText, { exports, require: name => { assert.equal(name,'react'); return { useEffect: fn => { cleanup = fn(); } }; }, window, document, Element, URL });
exports.StoreClickTracking();
const click = (href, type='click', button=0) => {
 const link = { href, dataset: { storePlacement: 'hero' }, closest: () => null };
 handlers.get(type)({ type, button, target: new Element(link) });
};
click('https://play.google.com/store/apps/details?id=com.samaan.bol');
click('https://apps.apple.com/in/app/samaan-bol/id6759739444');
click('https://example.com');
click('https://play.google.com/store/apps/details?id=another.app');
click('https://play.google.com/store/apps/details?id=com.samaan.bol','auxclick',2);
assert.equal(window.dataLayer.length,2,'Only our two store links should queue events');
for (const [index, store] of ['google_play','app_store'].entries()) {
 const event=Array.from(window.dataLayer[index]);
 assert.equal(event[0],'event');assert.equal(event[1],'app_store_click');
 assert.equal(event[2].store,store);assert.equal(event[2].page_path,'/hi');assert.equal(event[2].language,'hi-IN');
 assert.equal(event[2].placement,'hero');assert.equal(event[2].transport_type,'beacon');
 assert.deepEqual(Object.keys(event[2]).sort(),['language','page_path','placement','store','transport_type']);
}
click('https://play.google.com/store/apps/details?id=com.samaan.bol','auxclick',1);
assert.equal(window.dataLayer.length,3,'Middle click queues exactly one event');
cleanup();assert.equal(handlers.size,0,'Listeners clean up across route changes');
console.log('PASS store event dispatch, store allowlist, locale/path, middle click and listener cleanup');
