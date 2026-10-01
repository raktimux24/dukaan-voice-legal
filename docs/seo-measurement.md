# Search acquisition measurement

## Primary outcome

Qualified visits to the App Store and Google Play from the website. `app_store_click` measures an outbound visit, not an installation or purchase. Store-console attribution is needed for downstream conversion.

## GA4 acceptance

Property used by the site: measurement ID `G-VJV74F6STP`. Ownership/access and event receipt remain unverified.

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

## Page language versus visitor language

Use event-scoped **Site language**, parameter `site_language`, to group outbound store clicks by the rendered page language. GA4 built-in Language describes the visitor browser/device. Do not override it with the page locale. Register Site language after the parameter is received and allow processing before using it in standard reports. Historical events using `language` do not backfill this new dimension.

Reference: https://support.google.com/analytics/table/13594742?hl=en
