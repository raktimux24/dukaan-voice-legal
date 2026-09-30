# SEO / AEO acquisition plan

Goal: increase qualified organic and answer-engine discovery and measurable outbound visits to the App Store and Google Play. Rankings and traffic growth cannot be guaranteed; implementation must make acquisition measurable and improve the controllable foundations.

## Baseline (1 October 2026)

Live sitemap: 78 URLs, all 200, canonical and language metadata present. Mobile Lighthouse performance 66, LCP 6.4s; desktop performance 60. Ten locale refund URLs return 404. No verified Search Console/GA4 performance baseline or AI citation baseline yet. See the audit saved in the mobile repository under docs/audits/samaan-bol-seo-2026-10-01.

## Work and acceptance criteria

1. Acquisition: offer both stores above the fold and from relevant content pages; retain browser access. Measure `app_store_click` with store, page path, placement and locale, without account/customer data. Verify keyboard and ordinary clicks, navigation and no duplicate event.
2. Technical/performance: remove unnecessary public-route auth and WebGL work; optimize font delivery; preserve authentication on shop, account and payment return routes. Repair refund URLs, page landmarks, language menu semantics and content visibility without JS. Build and check all locales plus auth entry screens.
3. AEO content: provide a concise branded definition, factual FAQs and an illustrated or demonstrated getting-started guide; add internal links and store CTAs. Verify claims against implementation, avoid fabricated testimonials, metrics or comparisons. Extend localized content where reviewable.
4. Entity/indexing: align app, organization, offers and page schemas with visible facts; truthful sitemap dates and canonical/hreflang; index only public useful pages. Validate crawl graph and schema. Optional llms.txt must reflect existing HTML, not substitute for it.
5. Evidence/trust: align product and trial explanations. Customer stories, quotes and screenshots require real source material and permission; never invent endorsement.
6. Verification: production build, repeatable route/link/metadata checks, browser checks at phone and desktop widths, auth regression checks, outbound event validation and comparable performance tests.
7. Release: review concrete changes, deploy through established workflow within authorization, verify live state, sitemap and store destinations. Do not claim local changes are live.
8. Measurement: obtain verified Search Console/GA4 access, record 28/90-day brand/non-brand baseline, confirm outgoing store events and track landing-page conversion. Submit changed sitemap/URLs through authorized tooling. Record repeatable AI citation/recommendation samples with exact date/query/engine. Organic outcomes require follow-up observation, not a one-off technical score.

## Order

Fix acquisition and public-page loading first, then content/structured data, then rendered QA and production verification. Prioritize intent: voice billing for kirana, Hindi/Hinglish billing, shared phone/laptop shop, udhaar on a bill. Avoid mass-produced low-value pages. Store listings and independent customer evidence are coordination dependencies, not excuses to delay site work.

## Progress

- Plan created; baseline confirmed against current website code.
- Implementation and verification in progress. No release or measured traffic uplift claimed.

## Implementation evidence and follow-up

- Both stores now appear in every localized homepage hero and shared product/footer links. English hero names the product category directly.
- Public routes no longer initialize Clerk; provider remains on shop, account (including locales), and subscription return. Removed continuous Three.js effect and duplicated initialization; retained static CSS atmosphere. Fonts use Next.js self-hosting.
- Home has a main landmark, visible content without JavaScript, and a language disclosure with native links rather than an incomplete ARIA menu.
- Refund links point to the working policy; old locale URLs redirect.
- Added matching visible/structured FAQs for English and Hindi and a practical English voice-billing guide with store links, internal discovery and sitemap inclusion.
- Added app_store_click event with destination store, placement, pathname and language. Behavioral script verifies dispatch and listener cleanup; GA4 receipt still needs account access.
- Product fact check: mobile src/components/ui/language-picker.tsx and server/src/lib/language-map.ts expose eight Indian languages plus English and Hinglish. Punjabi and Odia appear in provider mapping but not the client picker/validation. Corrected the acquisition copy and application language schema; retained translated website pages with explicit availability notices.
- Production builds pass; final public-route smoke checks pass locally and on the hosted draft across all 11 locales, guide, refund redirects, FAQ visibility and auth metadata. Store event behavior checks pass. Phone and desktop homepage, Hindi/Punjabi and guide previews were visually checked.
- Existing named testimonials are omitted from rendered homepages pending confirmation of source and permission; original source remains intact. Do not claim their authenticity without evidence.
- Remaining: auth entry checks on the production host, production release review/verification, indexing and acquisition baseline, actual AI citation baseline, broader trust/content improvements. No live release or traffic uplift claimed.

## Hosted draft verification — 1 October 2026

Draft: https://6abd7586a377251cdcf58852--samaan-bol.netlify.app/
PageSpeed: https://pagespeed.web.dev/analysis/https-6abd7586a377251cdcf58852--samaan-bol-netlify-app/u7xcgbehur

| Lab metric | Original live | Hosted draft |
|---|---:|---:|
| Mobile performance | 66 | 95 |
| Mobile LCP | 6.4 s | 2.6 s |
| Mobile FCP | 4.2 s | 1.2 s |
| Desktop performance | 60 | 96 |
| Desktop LCP | 1.2 s | 0.9 s |
| Accessibility | 87 | 96 |

Single Lighthouse runs on different hosts; these are lab indicators, not measured traffic or field Core Web Vitals. The Netlify draft correctly returns `x-robots-tag: noindex`; its Lighthouse SEO 66 is due to draft indexing protection. Do not remove this protection from preview hosts. Production must be verified separately.

Auth runtime QA on local.samaanbol.space:8443 is limited by Clerk production-origin rejection. Provider scripts and noindex are present on the expected routes, but this does not prove successful sign-in. Port 443 could not be bound without additional system privileges. No auth security settings were changed. Verify account/shop/payment-return entry on the production host during release.

Final draft including the tablet correction: https://6abd76f24e8265279d985c63--samaan-bol.netlify.app/ . At an actual 820 x 1180 browser viewport, store actions start at y=441 and the illustration at y=711. Build/deploy succeeded. The performance report above measures the preceding draft; the final change only adjusts tablet ordering.

Full hosted sitemap check: all 79 public URLs return HTTP 200, have the exact production canonical, one H1 and no page-level noindex. Evidence: docs/seo-evidence/sitemap-verification.json.
