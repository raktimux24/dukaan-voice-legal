# SEO / AEO acquisition plan

Goal: increase qualified organic and answer-engine discovery and measurable outbound visits to the App Store and Google Play. Rankings and traffic growth cannot be guaranteed; implementation must make acquisition measurable and improve the controllable foundations.

## Current status (1 October 2026)

The implementation is live through merged PR #22 and production deploy 6abd79067006b40008fb097e. Production entry screens, public routes, store destinations and GA4 event receipt are verified. Google has read the 79-URL sitemap and accepted recrawl requests for the homepage and new guide. Exact search/AI baselines and limitations are in docs/seo-measurement.md.

Open: GA4 store and placement dimensions plus the key-event setting are saved; page-language reporting is released in PR #23 and verified in GA4 Realtime (`hi-IN`) with the Site language dimension saved; expanded customer proof and screenshots require authentic material; new-page indexing and traffic gains require later data. The objective is not yet proven complete. The sections below preserve the implementation history; earlier access/release limitations are superseded by the current status.

## Pre-change baseline (1 October 2026)

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
- Implementation released and verified; reporting configuration and outcome measurement remain open. No traffic uplift claimed.

## Implementation evidence and follow-up

- Both stores now appear in every localized homepage hero and shared product/footer links. English hero names the product category directly.
- Public routes no longer initialize Clerk; provider remains on shop, account (including locales), and subscription return. Removed continuous Three.js effect and duplicated initialization; retained static CSS atmosphere. Fonts use Next.js self-hosting.
- Home has a main landmark, visible content without JavaScript, and a language disclosure with native links rather than an incomplete ARIA menu.
- Refund links point to the working policy; old locale URLs redirect.
- Added matching visible/structured FAQs for English and Hindi and a practical English voice-billing guide with store links, internal discovery and sitemap inclusion.
- Added app_store_click event with destination store, placement, pathname and language. Behavioral script verifies dispatch and listener cleanup; production GA4 receipt is verified for both stores (controlled test clicks).
- Product fact check: mobile src/components/ui/language-picker.tsx and server/src/lib/language-map.ts expose eight Indian languages plus English and Hinglish. Punjabi and Odia appear in provider mapping but not the client picker/validation. Corrected the acquisition copy and application language schema; retained translated website pages with explicit availability notices.
- Production builds pass; final public-route smoke checks pass locally and on the hosted draft across all 11 locales, guide, refund redirects, FAQ visibility and auth metadata. Store event behavior checks pass. Phone and desktop homepage, Hindi/Punjabi and guide previews were visually checked.
- Existing named testimonials are omitted from rendered homepages pending confirmation of source and permission; original source remains intact. Do not claim their authenticity without evidence.
- Auth entry, production release and acquisition baseline checks are now complete. Remaining work is reporting configuration, richer verified product evidence and subsequent outcome measurement.

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

## Release attempt and rollback — 1 October 2026

Promoted draft 6abd76f24e8265279d985c63 to production, then promptly restored 6abbfbee2e63c5000955213b after live browser QA showed Clerk attempting to load `https:///npm/...`. The restored production shop resolves to its sign-in screen. Production does not currently contain the SEO changes.

The earlier metadata test only searched for `clerk` in a script URL and was insufficient; it now requires the exact `https://clerk.samaanbol.space/` prefix. Local configuration has a valid publishable key, but the local Netlify deployment build did not emit it correctly. No secrets or auth access settings were changed. Use the cloud preview to verify configured build values before release.

PR: https://github.com/raktimux24/dukaan-voice-legal/pull/22
Cloud preview build confirmed in progress: 6abd7894e1175e00081edc02.

## Successful production release — 1 October 2026

PR #22 merged as 4b9754d027fb6ae82cb9925f7113530aad7526df. Netlify cloud production deployment 6abd79067006b40008fb097e is ready and published. This supersedes the rollback status above.

- Full 11-locale public smoke checks pass on https://samaanbol.space, including the strengthened Clerk hostname check.
- Browser: production shop resolves to its sign-in form; account renders Clerk sign-in; subscription return renders its sign-in prompt. No new account, login, payment or checkout was submitted. Authenticated workflows were not exercised.
- Production homepage returns HTTP 200 without a noindex response header. Final mobile viewport 390 x 844 has store choices at y=539 and no horizontal overflow. Screenshot: docs/seo-evidence/production-mobile.png.
- IndexNow accepted 79 sitemap URLs with HTTP 202. This is submission evidence, not confirmed indexing.
- Production PageSpeed report: https://pagespeed.web.dev/analysis/https-samaanbol-space/634vaqid5b . Mobile performance 91 (baseline 66), LCP 3.2s (6.4s), FCP 2.0s (4.2s). Desktop performance 98 (60), LCP 0.7s (1.2s). Both: accessibility 96, best practices 100, SEO 100. Single lab runs; no field-data or traffic uplift claim.
- Subsequent account checks resolved Search Console and GA4 access and verified event receipt. Other answer-engine citation samples, approved customer evidence and reviewed additional translations remain open. Maximum traffic and best-in-market performance are not established.

## Measurement access correction and verified baseline

Access was found in the second Google account. Search Console uses the domain property rather than the previously tested URL-prefix property. No ownership or access change was needed. GA4 receives the live store-click events: one test click per store, two events total, with destination values confirmed. See docs/seo-measurement.md for exact dated baselines.

Google read the resubmitted sitemap successfully and discovered 79 URLs. The new guide was unknown to Google; its indexing request completed and it was added to the priority crawl queue. Index inclusion remains pending. The Google generative-AI beta report provides a 16-impression, 28-day baseline; no other answer-engine citation rate is established.

GA4 reporting dimensions and key-event designation are prepared but unsaved pending the user response required by browser application-setting confirmation policy. No data-collection, consent, account-access or advertising setting was changed.


### GA4 configuration completed — 2026-10-01

User explicitly approved configuration. In Samaan Bol Website (property 538098648), saved and verified two event-scoped custom dimensions: **Destination store** (`store`) and **CTA placement** (`placement`). Marked the existing `app_store_click` event as a key event; verified its checked state and inclusion in the Key events tab. This supersedes earlier pending-approval/configuration notes. Store clicks measure outbound visits, not confirmed installs.

Local evidence: `docs/seo-evidence/ga4-dimensions-saved.png` and `docs/seo-evidence/ga4-key-event-saved.png`. Keep account evidence local.


## Page-language reporting verified — 1 October 2026

Saved event-scoped **Site language** (`site_language`) in Samaan Bol Website GA4. The custom definitions table now contains Destination store, CTA placement and Site language. Clicked the production Hindi homepage Google Play hero link once; the correct current Play listing opened. GA4 Realtime received one `app_store_click`, counted it as a key event, and its `site_language` drilldown showed `hi-IN` count 1. This is controlled QA traffic, not a customer conversion. Standard processed-report availability is not yet verified.

Evidence (local/private): `docs/seo-evidence/ga4-site-language-saved.png`, `docs/seo-evidence/ga4-site-language-received.png`.


## Acquisition completion audit — 1 October 2026

Previous goal turn: progress (GA4 Site language saved and live Hindi event receipt verified). Current retrieval baseline: `docs/seo-evidence/search-retrieval-2026-10-01.md`.

| Requirement | Current evidence | Status |
|---|---|---|
| Both stores reachable from site | Production locale/guide link checks and actual destination visits | Implemented and verified |
| Performance, public content, auth separation | Merged PR #22, production lab and route checks; auth entry checks only | Implemented; authenticated workflows outside this audit |
| Factual answer content and schemas | Visible FAQs, English guide, canonical/sitemap checks; user-confirmed demo captured on 1 October | Four-stage manual checkout and verified stock-change illustration live through merged PR #24; desktop/mobile preview and production browser verified |
| Locale-aware store-click measurement | PR #23 production; Site language saved; hi-IN receipt and key-event count | Verified in Realtime; standard report processing pending |
| Search baseline and submission | GSC 28/90-day baseline; 79-URL sitemap read; guide crawl request accepted | Baseline recorded; fresh indexing outcome pending |
| Non-Google answer-engine citation baseline | Perplexity Search, one unbranded kirana/Hindi/stock/udhaar recommendation prompt on 1 October | Samaan Bol absent; one prompt only, not an overall citation rate. See docs/seo-evidence/perplexity-baseline-2026-10-01.md |
| Trust/customer proof | Unverified testimonials omitted | Authentic approved material still needed |
| Organic traffic and store-visit growth | No comparable post-release period | Unproven; cannot establish maximum traffic |
| Store conversion improvements | ASO audit and concrete copy drafts in mobile repo | Not published; store changes not covered by website release |

Do not keep resubmitting the same URL or rewriting content solely because a same-day search sample misses it. Give accepted crawl requests time to process, then investigate specific remaining indexing causes. No additional robots or special AI-file change is justified by the current crawl-permission evidence.

## Illustrated guide production verification — 1 October 2026

PR #24 merged as 626fc8753cac8dce91d3697b6cd33588a6b529a6. Production deploy 6abe49267c436a00083e8f4a published at 11:51:42 UTC. Four real Hindi simulator captures document manual cart review, payment selection, saved demo cash bill #91 and stock changing from 26.25 kg to 24.25 kg. The page explicitly distinguishes this from voice-recognition evidence; the private receipt with shop contact details was excluded.

Desktop and 390px preview rendering verified; production browser content verified. All four production optimized image URLs returned HTTP 200 with image content, descriptive alt text, intrinsic dimensions and lazy loading. Delivered fallback image sizes were approximately 62, 76, 65 and 53 KB. The initial inspection filter did not decode URL-encoded image paths; corrected the inspection and all four passed without a site change.

The earlier screenshot-source blocker is resolved. Remaining outcome evidence is unchanged: later indexing inclusion, processed GA4 reporting and a comparable post-release traffic period. Authentic customer endorsements and store-listing publication are not established by these demo screenshots.
