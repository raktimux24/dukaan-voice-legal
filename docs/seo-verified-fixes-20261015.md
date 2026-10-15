# Verified SEO fixes — 15 October 2026

## Review state

Prepared locally on `seo/verified-seo-main-2026-10-15`, based on locally available `origin/main` commit `8bb8ee9236f8214d11b474ec32354e2835ccc2fb`. No push, PR, merge, deployment, production login or customer transaction was performed. The original acquisition checkout and its untracked SEO evidence were preserved. No secrets or customer records are included in these changes.

The original checkout was on an older acquisition branch. Its GST plan still said acceptance was outstanding. The newer main baseline includes the deployed acceptance records below; use those records rather than the stale branch's release description.

## Product evidence and wording boundaries

- **GST:** `docs/gst-web-parity-plan-20261007.md` and `docs/gst-web-parity-acceptance-20261008.md` record a released web implementation and persisted Composition billing, retained ordinary credit notes, purchase invoices and saved purchase CSV exports. Source routes under `app/shop/settings/gst`, `app/shop/purchases`, and the tax/profile/document implementations in `app/lib/shop` support scoped wording about settings, tax profiles, billing/purchase records and review exports. These are existing acceptance records, not new live acceptance in this SEO task. Export records are not government filing. Special RSP/rounding issuance and provider activation remain gated; no universal GST compliance claim is made.
- **Voice:** the mobile repository's `src/components/ui/language-picker.tsx` offers English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Kannada, Gujarati and Malayalam. `app/components/shop/screens/settings.tsx` and `app/lib/shop/translations.ts` use the same preference choices for browser UI. Punjabi and Odia are not selectable app/voice languages. `app/i18n.ts` exposes eleven website reading locales, including Punjabi and Odia. Therefore eleven website locales must not be presented as eleven voice or app UI languages.
- **Browser voice:** `app/components/shop/screens/voice.tsx`, `app/components/shop/voice-capture.tsx`, `app/lib/shop/browser-audio.ts` and `app/lib/shop/voice-review.ts` implement Premium microphone capture, server processing, review and cart preparation. Copy now states internet, microphone support and permission requirements. This is implementation verification, not a new real-device/browser voice acceptance or voice-recognition capture.
- **Pricing:** existing free manual plan, free download, 7-day in-app trial for new shops, ₹499/month and ₹3,999/year remain distinct. Zero-price application schema still describes the download, not free Premium.

## Changes

- Seven visible questions and matching FAQPage entities in each of eleven homepages. Nine locales previously returned no FAQ entries; English and Hindi already had six. The seventh topic explains scoped GST tools and filing limits.
- Existing combined SoftwareApplication/MobileApplication/WebApplication entity retained; no duplicate application entity added. App language scope stays separate from website reading locales. Localized schema features include voice/reading and GST distinctions.
- Home language section, hero, browser section, localized descriptions and laptop article now draw from shared factual answers, removing stale phone-only/browser-English-only claims.
- Samaan Bol spelling standardized in subscription/pricing strings and public legal/contact metadata/rendering.
- Hindi procedural section added to the existing English guide, with an updated modification date. Existing genuine manual simulator images and their disclosure remain unchanged. No voice demo was fabricated.
- Added optional `public/llms.txt` summary. It is not a Google ranking requirement. FAQ markup supports semantic consistency; this work does not promise FAQ rich results or rankings.

## Validation

Passed on the final source:

- `npm run test:seo`: all eleven locale adapters, seven unique visible FAQ topics, schema parity, GST wording, language scope, prices, canonical/hreflang helpers, sitemap inclusion, laptop/FAQ consistency, pricing branding and guide disclosures.
- `node node_modules/typescript/bin/tsc --noEmit`.
- `npm run test:translations`: 1,144 existing web labels across nine translated app languages, bundled mobile catalogs and interpolation. This does not certify the linguistic quality of the newly added marketing translations.
- `npm run build -- --webpack`: production compilation, TypeScript and 134 generated pages. Initial sandbox attempt could not resolve Google Fonts; the permitted build with network access passed. Existing matching dependencies were reused from the provider-CI worktree; no lockfile/dependency changes.
- `python3 scripts/check-public-seo.py http://127.0.0.1:3187 --public-only`: final production server, all eleven homepages and their pricing/laptop/udhaar routes, exact single combined application and FAQ schemas, seven visible matching FAQ answers, canonical and all twelve hreflang alternates, reciprocal target paths, ₹499/₹3,999 offers and visible pricing FAQ parity, store links, legacy refund redirects, guide/Hindi section/manual capture disclosure, sitemap and llms.txt.
- `git diff --check`.

Logs: `docs/seo-evidence/2026-10-15/`. Authenticated-route checks were explicitly skipped; no production credentials were loaded. Financial behavior was not changed, and the public checks are not a fresh GST acceptance run.

## Remaining review decisions

1. Native-speaker review of the nine new localized marketing FAQ sets before publication; automated parity does not validate fluency or every translated nuance.
2. Real voice-flow screenshots require a controlled synthetic demo, successful microphone/STT processing and review, with permission to operate the chosen test shop/device. Existing manual screenshots remain truthfully labelled.
3. Public App Store/Play descriptions were not edited. Align them through the store publication workflow after reviewing the website wording; no store write or release was authorized here.
4. Special billing eligibility, provider activation and tax filing must not be broadened by copy review. This change makes no claim of universal GST compliance or government submission.
