import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

// Exercise the actual content and metadata functions, including all locale adapters.
const folder = mkdtempSync(join(tmpdir(), 'samaan-public-seo-'));
try {
  const compiled = spawnSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'),
    '--ignoreConfig', '--outDir', folder, '--target', 'ES2022', '--module', 'commonjs',
    '--moduleResolution', 'node', '--ignoreDeprecations', '6.0', '--skipLibCheck',
    '--esModuleInterop', '--resolveJsonModule', 'app/content/localized.ts',
    'app/content/laptopPage.ts', 'app/seo.ts', 'app/sitemap.ts'], { stdio: 'inherit' });
  assert.equal(compiled.status, 0, 'Content compilation');
  writeFileSync(join(folder, 'package.json'), '{"type":"commonjs"}');
  const require = createRequire(join(folder, 'package.json'));
  const { locales, localizedPath } = require('./i18n.js');
  const { productAnswers } = require('./content/productAnswers.js');
  const { getLocalizedHtml } = require('./content/localized.js');
  const { getLaptopCopy } = require('./content/laptopPage.js');
  const { getSubscriptionStrings } = require('./content/subscriptionStrings.js');
  const { faqPageSchema, pageMetadata, softwareApplicationSchemaFor, pricingOfferSchema } = require('./seo.js');
  const sitemap = require('./sitemap.js').default();
  for (const { code, hreflang } of locales) {
    const answers = productAnswers(code);
    const html = getLocalizedHtml('home', code);
    assert.equal(answers.length, 7, `${code}: seven FAQ topics`);
    assert.equal(new Set(answers.map(x => x.q)).size, 7, `${code}: unique questions`);
    assert.equal((html.match(/id="questions"/g) || []).length, 1, `${code}: one visible FAQ`);
    const schema = faqPageSchema(answers);
    for (const q of schema.mainEntity) {
      assert.ok(html.includes(`<summary>${q.name}</summary><p>${q.acceptedAnswer.text}</p>`), `${code}: visible/schema parity`);
    }
    assert.ok(answers[1].a.includes('₹499') && answers[1].a.includes('₹3,999'), `${code}: truthful prices`);
    assert.ok(answers[3].a.includes('11') || answers[3].a.includes('eleven'), `${code}: reading versus voice`);
    assert.ok(answers[6].a.includes('GST'), `${code}: scoped GST content`);
    assert.ok(!/Voice stays on the phone|browser shop is currently in English/.test(html), `${code}: no obsolete exclusivity`);
    const app = softwareApplicationSchemaFor(code);
    assert.deepEqual(app['@type'], ['SoftwareApplication', 'MobileApplication', 'WebApplication']);
    assert.ok(!app.inLanguage.includes('pa-IN') && !app.inLanguage.includes('or-IN'), `${code}: app voice scope`);
    assert.equal(app.offers.price, '0');
    assert.match(app.offers.name, /download.*Premium/);
    const path = localizedPath(code, 'home');
    const meta = pageMetadata({ title: 'Samaan Bol', path, locale: code });
    assert.equal(meta.alternates.canonical, path);
    assert.equal(Object.keys(meta.alternates.languages).length, 12);
    assert.equal(meta.alternates.languages[hreflang], path);
    assert.equal(meta.alternates.languages['x-default'], '/');
    for (const locale of locales) assert.equal(meta.alternates.languages[locale.hreflang], localizedPath(locale.code, 'home'));
    assert.ok(sitemap.some(item => new URL(item.url).pathname.replace(/\/$/, '') === path.replace(/\/$/, '')), `${code}: sitemap`);
    assert.ok(!html.includes('microphone-supported browsers') && !html.includes('browser shop includes Premium voice'), `${code}: no unaccepted browser-voice availability claim`);
    const laptop = getLaptopCopy(code);
    assert.equal(laptop.phoneBody, answers[4].a, `${code}: browser feature consistency`);
    assert.deepEqual(laptop.faq[0], answers[4]);
    assert.ok(!JSON.stringify(getSubscriptionStrings(code).pricing).includes('Samaan-Bol'), `${code}: pricing branding`);
    console.log(`PASS ${code}: FAQ, GST, languages, pricing, metadata, sitemap, browser copy`);
  }
  assert.deepEqual(pricingOfferSchema.offers.map(x => x.price), ['499', '3999']);
  const guide = readFileSync('app/guides/voice-billing-for-kirana/page.tsx', 'utf8');
  assert.ok(guide.includes('lang="hi-IN"'));
  assert.ok(guide.includes('we selected') || guide.includes('We selected the product manually'));
  assert.ok(readFileSync('public/llms.txt', 'utf8').includes('not government return filing'));
} finally {
  rmSync(folder, { recursive: true, force: true });
}
