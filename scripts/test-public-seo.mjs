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
    'app/content/laptopPage.ts', 'app/seo.ts', 'app/sitemap.ts', 'app/lib/store-metadata.ts'], { stdio: 'inherit' });
  assert.equal(compiled.status, 0, 'Content compilation');
  writeFileSync(join(folder, 'package.json'), '{"type":"commonjs"}');
  const require = createRequire(join(folder, 'package.json'));
  const { locales, localizedPath } = require('./i18n.js');
  const { productAnswers } = require('./content/productAnswers.js');
  const { getLocalizedHtml } = require('./content/localized.js');
  const { getLaptopCopy } = require('./content/laptopPage.js');
  const { getSubscriptionStrings } = require('./content/subscriptionStrings.js');
  const { getLocaleHomeSlots } = require('./content/localeHomeSlots.js');
  const { getUdhaarCopy } = require('./content/udhaarPage.js');
  const offerCopy = require('./content/offerCorrections.json');
  const workflowCopy = require('./content/shopWorkflowsLocales.json');
  const { faqPageSchema, pageMetadata, softwareApplicationSchemaFor, pricingOfferSchema } = require('./seo.js');
  const sitemap = require('./sitemap.js').default();
  for (const { code, hreflang } of locales) {
    const answers = productAnswers(code);
    const html = getLocalizedHtml('home', code);
    assert.equal(answers.length, 7, `${code}: seven FAQ topics`);
    const workflow = html.match(/<section class="shop-workflows"[\s\S]*?<\/section>/)?.[0];
    assert.ok(workflow, `${code}: expanded shop workflows rendered`);
    assert.equal((workflow.match(/<article class="shop-workflow">/g) || []).length, 9, `${code}: all nine workflow cards`);
    assert.ok(workflow.includes(`href="${localizedPath(code, 'pricing')}"`), `${code}: localized pricing CTA`);
    if (code !== 'en') {
      assert.equal(workflowCopy[code].cards.length, 9, `${code}: translated workflow coverage`);
      for (const card of workflowCopy[code].cards) assert.ok(card.length === 3 && card.every(Boolean), `${code}: each workflow includes a heading, benefit and condition`);
      const staleCta = getLocaleHomeSlots(code)?.ctaSub;
      if (staleCta) assert.ok(!html.includes(staleCta), `${code}: old all-new-shops trial promise removed`);
    }
    assert.equal(answers[1].a, offerCopy[code].offer, `${code}: current-offer FAQ`);
    assert.ok(getSubscriptionStrings(code).pricing.faq.some(item => item.a === answers[1].a), `${code}: pricing and homepage offer agree`);
    assert.ok(getUdhaarCopy(code).premiumPoints.includes(offerCopy[code].closing), `${code}: udhaar trial wording uses current-offer guidance`);
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
  const {storeMetadata}=require('./lib/store-metadata.js');
  const originalFetch=globalThis.fetch,originalApi=process.env.NEXT_PUBLIC_API_BASE_URL,originalSite=process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.invalid';process.env.NEXT_PUBLIC_SITE_URL='https://shop.example.invalid';
    const storeId='20000000-0000-4000-8000-000000000002',itemId='30000000-0000-4000-8000-000000000003',imageId='40000000-0000-4000-8000-000000000004';
    const store={id:storeId,config:{name:'Synthetic QA shop'}},item={id:itemId,name:'Photo rice',description:'Synthetic package',visible:true,supported:true,media:{cover:{id:imageId,alt:'Rice package'}}};
    let status=200,data={store,item},calls=0;
    globalThis.fetch=async(url,options)=>{calls++;assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');assert.equal(String(url),`https://api.example.invalid/api/storefront/${storeId}/products/${itemId}`);return new Response(JSON.stringify(data),{status});};
    const visible=await storeMetadata(storeId,itemId);
    assert.deepEqual(visible.title,{absolute:'Photo rice · Synthetic QA shop'});
    assert.equal(visible.robots.index,true);assert.equal(visible.alternates.canonical,`https://shop.example.invalid/store/${storeId}/p/${itemId}`);
    assert.equal(visible.openGraph.images.length,1);assert.match(visible.openGraph.images[0].url,/media\/public\//);assert.ok(!/lease|private|token/.test(visible.openGraph.images[0].url));
    data={store,item:{...item,visible:false}};const hidden=await storeMetadata(storeId,itemId);assert.equal(hidden.robots.index,false);assert.deepEqual(hidden.openGraph.images,[]);
    status=404;const unpublished=await storeMetadata(storeId,itemId);assert.equal(unpublished.robots.index,false);assert.deepEqual(unpublished.openGraph.images,[]);
    const before=calls;await storeMetadata('../bad',itemId);assert.equal(calls,before);
    console.log('PASS public product metadata: anonymous visibility, no cached private images, canonical link and unavailable fallback');
  }finally{globalThis.fetch=originalFetch;if(originalApi===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=originalApi;if(originalSite===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=originalSite;}
  assert.deepEqual(pricingOfferSchema.offers.map(x => x.price), ['499', '3999']);
  const guide = readFileSync('app/guides/voice-billing-for-kirana/page.tsx', 'utf8');
  assert.ok(guide.includes('lang="hi-IN"'));
  assert.ok(guide.includes('we selected') || guide.includes('We selected the product manually'));
  assert.ok(readFileSync('public/llms.txt', 'utf8').includes('not government return filing'));
} finally {
  rmSync(folder, { recursive: true, force: true });
}
