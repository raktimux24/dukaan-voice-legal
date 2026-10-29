# Verified acquisition baseline — 1 October 2026

This document contains private account analytics. Keep it local; do not publish it as website content.

## Search Console

Verified domain property: `sc-domain:samaanbol.space`. The URL-prefix property previously inspected was the wrong property; the earlier access limitation is superseded.

| Metric | September 1–28 | June 29–September 28 |
|---|---:|---:|
| Web-text clicks | 5 | 8 |
| Web-text impressions | 56 | 90 |
| CTR | 8.9% | 8.9% |
| Average position | 3.7 | 3.8 |

Only one query row is exposed, with one impression. This cannot support a reliable branded/non-branded breakdown or a claim of strong generic rankings.

Google's Generative AI features beta report for September 1–28 shows 16 total impressions. Homepage row: 16; Bengali homepage row: 1. Page rows need not sum to the headline. No AI click or install outcome is established. Other answer engines remain unmeasured.

Homepage URL inspection: indexed; last crawl September 27, Googlebot smartphone; fetch successful, crawling and indexing allowed; declared canonical https://samaanbol.space/, Google-selected canonical matches inspected URL.

Page-indexing aggregate last updated September 21: 4 indexed, 3 redirect exclusions. The indexed-without-content warning refers to clerk.samaanbol.space. Do not interpret this old domain-wide count as 75 rejected marketing pages.

## Actions verified

- Google sitemap resubmission succeeded; read October 1; 79 discovered URLs.
- New voice-billing guide was unknown to Google. Indexing request accepted into the priority crawl queue. Not yet confirmed indexed.
- IndexNow accepted all 79 URLs with HTTP 202.
- GA4 property Samaan Bol Website (538098648) received two controlled homepage `app_store_click` events: `google_play` 1, `app_store` 1. Both store destinations visibly loaded correctly.
- Custom `page_path` and `placement` parameters arrived with both events. Page-language reporting remains to verify.

## Measurement limits

The two store visits are QA events, not new customer conversions. Current realtime/page-view figures include our site QA. Store clicks do not prove installs. Compare future complete reporting periods against this pre-release baseline; do not infer improvement from same-night technical checks.

GA4 custom dimensions and key-event setup are prepared, not saved, pending confirmation. Growth and expanded indexing require subsequent data, not repeated submissions.

Homepage recrawl request also completed successfully and entered Google's priority crawl queue. No repeat requests are needed now.


### GA4 configuration completed — 2026-10-01

User explicitly approved configuration. In Samaan Bol Website (property 538098648), saved and verified two event-scoped custom dimensions: **Destination store** (`store`) and **CTA placement** (`placement`). Marked the existing `app_store_click` event as a key event; verified its checked state and inclusion in the Key events tab. This supersedes earlier pending-approval/configuration notes. Store clicks measure outbound visits, not confirmed installs.

Local evidence: `docs/seo-evidence/ga4-dimensions-saved.png` and `docs/seo-evidence/ga4-key-event-saved.png`. Keep account evidence local.


## Page-language reporting verified — 1 October 2026

Saved event-scoped **Site language** (`site_language`) in Samaan Bol Website GA4. The custom definitions table now contains Destination store, CTA placement and Site language. Clicked the production Hindi homepage Google Play hero link once; the correct current Play listing opened. GA4 Realtime received one `app_store_click`, counted it as a key event, and its `site_language` drilldown showed `hi-IN` count 1. This is controlled QA traffic, not a customer conversion. Standard processed-report availability is not yet verified.

Evidence (local/private): `docs/seo-evidence/ga4-site-language-saved.png`, `docs/seo-evidence/ga4-site-language-received.png`.
