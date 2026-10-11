# Search acquisition measurement

## Primary outcome

Qualified visits to the App Store and Google Play from the website. `app_store_click` measures an outbound visit, not an installation or purchase. Store-console attribution is needed for downstream conversion.

## GA4 acceptance

Property used by the site: measurement ID `G-VJV74F6STP`. Ownership/access and event receipt were verified on 1 October 2026; see the dated baseline below.

1. Open the correct property's Realtime/DebugView after release.
2. Visit the homepage and click a store link. Confirm `app_store_click` arrives once with `store`, `placement`, `page_path`, and `site_language`.
3. Repeat from the voice guide and a translated homepage. Test both stores and keyboard activation.
4. Register the relevant event-scoped custom dimensions. Mark the event as a key event if outbound store visits are the agreed conversion. Avoid counting it as an app install.
5. Build an exploration: organic landing-page sessions, sessions with a store click, click-through rate, store, locale, and source/medium. Use comparable 28-day periods and retain volume denominators.

Do not claim delivery based only on the local event test or the presence of a GA script. Consent rules, browser blockers and navigation timing can affect collection.

## Search Console acceptance

Use the verified `samaanbol.space` property. Record the preceding 28 and 90 days of clicks, impressions, CTR and position. Separate brand queries (`samaan bol`, `samaanbol`) from non-brand intent; segment by landing page, country and device. Inspect the homepage and new guide's live URL, declared/selected canonical and indexing state. Submit the sitemap and request indexing for the small set of materially changed pages if authorized tooling is available. A submitted sitemap is not proof of indexing.

## Answer-engine baseline

Keep a dated record of exact queries, engine/model, country/language, response and cited URLs. Suggested initial prompts: “voice billing app for an Indian kirana store”, “Hindi voice billing app with stock updates”, “Can Samaan Bol collect UPI payment automatically?”, “Does Samaan Bol work on a laptop?” and Hindi equivalents. Distinguish correct product mention, linked citation, recommendation and absence. Repeat the same prompt set later; personalized single responses are not a market-wide visibility score.

## Next content decisions

Use search impressions and customer questions to prioritize original guides. Add real screenshots and approved customer evidence when available. Review translations with fluent speakers before expanding answer content across all locales. Avoid thin keyword pages or invented accuracy/market-share claims.

## Verified account baseline — 1 October 2026

Access is available under the second signed-in Google account. Search Console uses the **domain property** `sc-domain:samaanbol.space`, not the URL-prefix property. Earlier access-blocked notes were based on the wrong property and are superseded. GA4 account 395128368, property 538098648 is named Samaan Bol Website.

Search Console web-text results:
- 28 days (September 1–28): 5 clicks, 56 impressions, 8.9% CTR, average position 3.7.
- Three months (June 29–September 28): 8 clicks, 90 impressions, 8.9% CTR, average position 3.8.
- Query table exposes only one query with one impression, so it cannot support a reliable brand/non-brand split. Do not infer that all traffic was branded or claim strong generic rankings.
- Generative AI features beta report for September 1–28: headline 16 impressions; page rows homepage 16 and Bengali homepage 1. Preserve the report's total rather than summing page rows. This is Google reporting only, not a ChatGPT/Perplexity citation rate.
- Indexing report last updated September 21: 4 indexed, 3 excluded for redirects. One indexed-without-content warning refers to `clerk.samaanbol.space`, not the marketing homepage. This lagging report does not represent all 79 current sitemap URLs.
- Resubmitted the sitemap through Search Console. Confirmation: success, read October 1, 79 discovered URLs.

GA4 realtime verification:
- Clicked the homepage Google Play and App Store links once each; both destinations rendered the correct listing.
- Realtime reports `app_store_click` count 2; `store` values `google_play` 1 and `app_store` 1. `page_path` and `placement` parameters appear with count 2.
- These are controlled test events and must not be presented as customer conversions. Earlier live-site QA also contributes to today's page views.
- Homepage last-7-days card: 25 active users, 22 new users, 978 events, zero key events; acquisition card has 26 direct, 10 referral and zero organic-search sessions. The card is a short-period baseline, not evidence of a post-release lift.

Remaining measurement work: register acquisition custom dimensions/key event if appropriate; verify page-language reporting; measure landing-page conversion on comparable periods; inspect/request indexing for the new guide. Do not create a new Google property or change account ownership.

Guide indexing request: Google confirmed addition to the priority crawl queue. Sitemap successfully resubmitted and read with 79 discovered URLs. Reporting configuration remains unsaved pending confirmation.


### GA4 configuration completed — 2026-10-01

User explicitly approved configuration. In Samaan Bol Website (property 538098648), saved and verified two event-scoped custom dimensions: **Destination store** (`store`) and **CTA placement** (`placement`). Marked the existing `app_store_click` event as a key event; verified its checked state and inclusion in the Key events tab. This supersedes earlier pending-approval/configuration notes. Store clicks measure outbound visits, not confirmed installs.

Local evidence: `docs/seo-evidence/ga4-dimensions-saved.png` and `docs/seo-evidence/ga4-key-event-saved.png`. Keep account evidence local.

## Page locale correction — PR #23

The earlier `language` payload used the rendered HTML locale, but GA4 defines Language as browser/device language. PR #23 changes the custom event to `site_language` and adds Hindi/English behavioral coverage. The change is merged as 63e270bae9b8224daaf5d199c78ca9ea9c3f7286. Preview route/auth metadata checks and TypeScript passed. GA4 receipt and registration of Site language remain unverified; do not claim this dimension is ready in reports. This change does not backfill historical events.

Production deployment 6abe219b5a881800087573a7 published successfully at 2026-10-01 09:03:03 UTC. Production HTML/chunk verification is recorded separately from GA4 receipt.


## Page-language reporting verified — 1 October 2026

Saved event-scoped **Site language** (`site_language`) in Samaan Bol Website GA4. The custom definitions table now contains Destination store, CTA placement and Site language. Clicked the production Hindi homepage Google Play hero link once; the correct current Play listing opened. GA4 Realtime received one `app_store_click`, counted it as a key event, and its `site_language` drilldown showed `hi-IN` count 1. This is controlled QA traffic, not a customer conversion. Standard processed-report availability is not yet verified.

Evidence (local/private): `docs/seo-evidence/ga4-site-language-saved.png`, `docs/seo-evidence/ga4-site-language-received.png`.
