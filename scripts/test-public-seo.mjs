import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

// Exercise the actual content and metadata functions, including all locale adapters.
const folder = mkdtempSync(join(tmpdir(), 'samaan-public-seo-'));
try {
  const compiled = spawnSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'),
    '--ignoreConfig', '--outDir', folder, '--target', 'ES2022', '--module', 'commonjs',
    '--moduleResolution', 'node', '--ignoreDeprecations', '6.0', '--skipLibCheck',
    '--esModuleInterop', '--resolveJsonModule', 'app/content/localized.ts',
    'app/seo.ts', 'app/sitemap.ts', 'app/lib/store-metadata.ts'], { stdio: 'inherit' });
  assert.equal(compiled.status, 0, 'Content compilation');
  writeFileSync(join(folder, 'package.json'), '{"type":"commonjs"}');
  const require = createRequire(join(folder, 'package.json'));
  const { locales, localizedPath, webAppHref } = require('./i18n.js');
  const { productAnswers } = require('./content/productAnswers.js');
  const { getLocalizedHtml } = require('./content/localized.js');
  const { getSubscriptionStrings } = require('./content/subscriptionStrings.js');
  const { getLocaleHomeSlots } = require('./content/localeHomeSlots.js');
  const { getUdhaarCopy } = require('./content/udhaarPage.js');
  const offerCopy = require('./content/offerCorrections.json');
  const workflowCopy = require('./content/shopWorkflowsLocales.json');
  const sectionCopy = require('./content/landingSectionCopy.json');
  const completionCopy = require('./content/landingCompletionCopy.json');
  const openingCopy = require('./content/landingOpeningCopy.json');
  const browserCopy = require('./content/browserPreviewCopy.json');
  const homePricingCopy = require('./content/homePricingCopy.json');
  const webAppCopy = require('./content/webAppCopy.json');
  const { planCopy } = require('./lib/subscriptions.js');
  const { faqPageSchema, pageMetadata, softwareApplicationSchemaFor, pricingOfferSchema } = require('./seo.js');
  const sitemap = require('./sitemap.js').default();
  for (const { code, hreflang } of locales) {
    const answers = productAnswers(code);
    const html = getLocalizedHtml('home', code);
    const document = new JSDOM(html).window.document;
    assert.equal(document.querySelectorAll('h1').length, 1, `${code}: one clear page title`);
    assert.deepEqual([...document.querySelectorAll('#hero-title > span')].map(el => el.textContent), openingCopy[code].headline, `${code}: localized hero headline`);
    assert.equal(document.querySelector('.counter-hero-conditions').textContent, openingCopy[code].conditions, `${code}: visible voice and Premium conditions`);
    assert.equal(document.querySelector('.counter-hero-actions .btn-primary').getAttribute('href'), '/shop', `${code}: hero shop action`);
    assert.equal(document.querySelectorAll('.counter-app-links a').length, 2, `${code}: phone download options`);
    assert.equal(document.querySelector('.counter-hero-scene figcaption').textContent, offerCopy[code].exampleLabel, `${code}: illustrative hero identified`);
    assert.equal(document.querySelector('.counter-bill-note').textContent, openingCopy[code].payment, `${code}: human payment confirmation`);
    assert.equal(document.querySelectorAll('#questions .answers-group').length, 3, `${code}: FAQ topic groups`);
    assert.equal(document.querySelectorAll('#questions details').length, answers.length, `${code}: all FAQ answers retained`);
    for (const link of document.querySelectorAll('.answers-index a')) assert.ok(document.querySelector(link.getAttribute('href')), `${code}: FAQ jump target exists`);
    assert.equal(document.querySelector('[data-motion-toggle]').getAttribute('aria-label'), openingCopy[code].pause, `${code}: localized motion control`);
    if (code === 'pa' || code === 'or') assert.ok(document.querySelector('.hero .language-support-note'), `${code}: reading-only language condition visible in hero`);
    const workflows = document.querySelector('#shop-workflows');
    assert.equal(workflows.querySelectorAll('.workflow-chapter').length, 3, `${code}: three task groups`);
    assert.equal(workflows.querySelectorAll('.workflow-art').length, 3, `${code}: illustrated groups`);
    assert.equal(workflows.querySelectorAll('details > summary').length, 9, `${code}: all workflows keyboard-discoverable`);
    for (const [title, body, note] of workflowCopy[code].cards) {
      assert.ok([...workflows.querySelectorAll('h4')].some(el => el.textContent === title), `${code}: workflow title retained`);
      assert.ok([...workflows.querySelectorAll('.workflow-detail-body > p')].some(el => el.textContent === body), `${code}: workflow explanation retained`);
      assert.ok([...workflows.querySelectorAll('.shop-workflow-note')].some(el => el.textContent === note), `${code}: full availability note retained`);
    }
    const voiceLinks = [...document.querySelectorAll('[data-language-support="voice"] a')];
    const readingLinks = [...document.querySelectorAll('[data-language-support="reading"] a')];
    assert.equal(voiceLinks.length, 9, `${code}: nine voice languages`);
    assert.deepEqual(readingLinks.map(el => el.getAttribute('lang')), ['pa-IN', 'or-IN'], `${code}: website-only language group`);
    assert.ok(!voiceLinks.some(el => ['pa-IN', 'or-IN'].includes(el.getAttribute('lang'))), `${code}: no unsupported voice promotion`);
    assert.equal(document.querySelector('.language-coming-note').textContent, completionCopy[code].comingSoonNote, `${code}: upcoming app support distinct from current website reading`);
    assert.equal(document.querySelectorAll('.language-specimen[aria-current="page"]').length, 1, `${code}: current website language identified`);
    assert.equal(document.querySelectorAll('.comparison-sheet tbody tr').length, 4, `${code}: four matched comparisons`);
    assert.ok(document.querySelector('.comparison-sheet').textContent.includes(completionCopy[code].rows[1][2]), `${code}: credit comparison includes Premium`);
    const pricingSummary = document.querySelector('#home-plans');
    assert.equal(document.querySelectorAll('#home-plans').length, 1, `${code}: one homepage pricing summary`);
    assert.equal(pricingSummary.nextElementSibling.id, 'download', `${code}: pricing immediately precedes final CTA`);
    assert.ok([...document.querySelectorAll('main > section')].indexOf(document.querySelector('#web')) < [...document.querySelectorAll('main > section')].indexOf(pricingSummary), `${code}: pricing follows product demo`);
    assert.equal(pricingSummary.querySelector('.home-plan--free .home-plan-price strong').textContent, '₹0', `${code}: free plan shown explicitly`);
    assert.equal(pricingSummary.querySelector('.home-plan--premium .home-plan-price strong').textContent, planCopy.monthly.price, `${code}: monthly price matches pricing page`);
    assert.equal(pricingSummary.querySelector('.home-plan-annual strong').textContent, planCopy.annual.price, `${code}: full annual price matches pricing page`);
    assert.equal(pricingSummary.querySelector('.home-plan-price > span').textContent, homePricingCopy[code].month, `${code}: monthly billing period translated`);
    assert.equal(pricingSummary.querySelector('.home-pricing-footer p').textContent, homePricingCopy[code].note, `${code}: GST availability and internet conditions visible`);
    assert.ok([...pricingSummary.querySelectorAll('.home-plan--free li')].some(el => el.textContent.includes('GST')), `${code}: GST billing included in Free`);
    assert.match(pricingSummary.querySelector('#home-trial-title').textContent, /7.*Premium/, `${code}: seven-day Premium trial visible`);
    assert.equal(pricingSummary.querySelector('.home-pricing-trial p').textContent, homePricingCopy[code].trialEligibility, `${code}: trial eligibility beside offer`);
    assert.ok(pricingSummary.querySelector('.home-pricing-footer p').textContent.includes('GST'), `${code}: GST conditions remain visible`);
    assert.equal(pricingSummary.querySelector('a').getAttribute('href'), localizedPath(code, 'pricing'), `${code}: full pricing link stays in the selected language`);
    assert.equal(document.querySelectorAll('.launch-plan ol li').length, 3, `${code}: three starting steps`);
    assert.equal(document.querySelector('.launch-primary').getAttribute('href'), '/shop', `${code}: primary action opens the shop`);
    assert.equal(document.querySelectorAll('.launch-store-options a').length, 2, `${code}: both app store options retained`);
    // Exercise final localized markup: string adapters must preserve every card,
    // its concise copy, and the feature conditions that readers rely on.
    assert.equal((html.match(/class="step-example step-example--/g) || []).length, 3, `${code}: three sale illustrations`);
    assert.equal((html.match(/class="payment-method"/g) || []).length, 3, `${code}: three payment examples`);
    for (const body of [...sectionCopy[code].steps, ...sectionCopy[code].features, ...sectionCopy[code].web, sectionCopy[code].language]) {
      assert.ok(html.includes(`<p>${body}</p>`), `${code}: concise section copy rendered`);
    }
    assert.ok(sectionCopy[code].features[0].includes('Premium'), `${code}: voice entitlement retained`);
    assert.ok(sectionCopy[code].steps[1].includes('Premium'), `${code}: credit entitlement retained`);
    assert.equal(document.querySelector('.web-demo-note').textContent, offerCopy[code].exampleLabel, `${code}: example data labelled`);
    const preview = document.querySelector('[data-shop-preview]');
    assert.equal(preview.getAttribute('aria-describedby'), 'web-preview-caption', `${code}: sample context announced`);
    assert.deepEqual([...preview.querySelectorAll('[role="tab"]')].map(el => el.textContent), browserCopy[code].tabs, `${code}: translated preview navigation`);
    assert.equal(preview.querySelectorAll('[role="tabpanel"]:not([hidden])').length, 1, `${code}: one preview view active`);
    for (const tab of preview.querySelectorAll('[role="tab"]')) assert.ok(document.getElementById(tab.getAttribute('aria-controls')), `${code}: tab target exists`);
    assert.equal(preview.querySelector('.preview-total').textContent, '₹9,060', `${code}: sample sales reconcile`);
    assert.deepEqual([...preview.querySelectorAll('.preview-payment-legend dd')].map(el => el.textContent), ['₹5,100', '₹3,320', '₹640'], `${code}: payment breakdown`);
    assert.deepEqual([...preview.querySelectorAll('.preview-facts dd')].map(el => el.textContent), ['24', '₹377.50', '₹640'], `${code}: average bill reconciles with day total`);
    assert.equal(preview.querySelector('.preview-bill-total strong').textContent, '₹370', `${code}: sample bill arithmetic`);
    assert.equal(preview.querySelectorAll('.preview-catalog-table tbody tr').length, 4, `${code}: example products`);
    assert.equal(preview.querySelector('.preview-stock-note').textContent, browserCopy[code].stockNote, `${code}: physical-count condition`);
    assert.ok(!html.includes('>undefined<'), `${code}: no missing card copy`);
    assert.equal(answers.length, 8, `${code}: eight FAQ topics`);
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
    assert.equal(new Set(answers.map(x => x.q)).size, 8, `${code}: unique questions`);
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
    assert.equal(document.querySelector(`#nav a[href="${webAppHref(code)}"]`).textContent, webAppCopy[code].label, `${code}: localized web-app navigation`);
    assert.equal(document.querySelector(`footer a[href="${webAppHref(code)}"]`).textContent, webAppCopy[code].label, `${code}: localized web-app footer`);
    assert.equal(getSubscriptionStrings(code).nav.webApp, webAppCopy[code].label, `${code}: React navigation agrees`);
    assert.ok(!html.includes('billing-on-a-laptop'), `${code}: no obsolete article links`);
    assert.equal(document.querySelector('#web .topic-link').getAttribute('href'), '#answers-group-1', `${code}: demo links to useful FAQ`);
    assert.ok(answers[4].a.includes(webAppCopy[code].syncNote), `${code}: same account/shop and connection requirements retained`);
    assert.equal(answers[7].a, webAppCopy[code].setupAnswer, `${code}: browser billing walkthrough migrated`);
    assert.ok(answers[7].a.includes('Premium') && answers[7].a.includes('UPI'), `${code}: credit and payment conditions retained`);
    assert.ok(!sitemap.some(item => item.url.includes('billing-on-a-laptop')), 'Retired pages excluded from sitemap');
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
