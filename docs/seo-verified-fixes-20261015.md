# Verified SEO fixes — 15 October 2026

## Review state

Prepared locally on `seo/verified-seo-main-2026-10-15`, rebased onto freshly fetched `origin/main` commit `9d3d55c820c74ba0cb16f2ec623dee2efb87a965`. A read-only `git fetch origin` succeeded on 15 October 2026. No push, PR merge, deployment, production login or customer transaction was performed. Only the isolated SEO branch was rebased; the original checkout was not altered. The original acquisition checkout and its untracked SEO evidence were preserved. No secrets or customer records are included in these changes.

The original checkout was on an older acquisition branch. Its GST plan still said acceptance was outstanding. The newer main baseline includes the deployed acceptance records below; use those records rather than the stale branch's release description.

## Product evidence and wording boundaries

- **GST:** `docs/gst-web-parity-plan-20261007.md` and `docs/gst-web-parity-acceptance-20261008.md` record a released web implementation and persisted Composition billing, retained ordinary credit notes, purchase invoices and saved purchase CSV exports. Source routes under `app/shop/settings/gst`, `app/shop/purchases`, and the tax/profile/document implementations in `app/lib/shop` support scoped wording about settings, tax profiles, billing/purchase records and review exports. These are existing acceptance records, not new live acceptance in this SEO task. Export records are not government filing. Special RSP/rounding issuance and provider activation remain gated; no universal GST compliance claim is made.
- **Voice:** the mobile repository's `src/components/ui/language-picker.tsx` offers English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Kannada, Gujarati and Malayalam. `app/components/shop/screens/settings.tsx` and `app/lib/shop/translations.ts` use the same preference choices for browser UI. Punjabi and Odia are not selectable app/voice languages. `app/i18n.ts` exposes eleven website reading locales, including Punjabi and Odia. Therefore eleven website locales must not be presented as eleven voice or app UI languages.
- **Browser voice:** `app/components/shop/screens/voice.tsx`, `app/components/shop/voice-capture.tsx`, `app/lib/shop/browser-audio.ts` and `app/lib/shop/voice-review.ts` implement Premium microphone capture, server processing, review and cart preparation. Merge `bd4b078` added sale-to-cart voice flows. However, `docs/mobile-web-parity-audit-20261009.md` explicitly leaves real microphone recognition, stock changes and voice checkout as acceptance gates. Independent final review found that the first SEO commit overreached by advertising browser voice availability. The follow-up removes those availability claims. Public copy describes search/scan in the browser and phone-app voice, without falsely asserting that browser voice is absent.
- **Pricing:** existing free manual plan, free download, 7-day in-app trial for new shops, ₹499/month and ₹3,999/year remain distinct. Zero-price application schema still describes the download, not free Premium.

## Changes

- Seven visible questions and matching FAQPage entities in each of eleven homepages. Nine locales previously returned no FAQ entries; English and Hindi already had six. The seventh topic explains scoped GST tools and filing limits.
- Existing combined SoftwareApplication/MobileApplication/WebApplication entity retained; no duplicate application entity added. App language scope stays separate from website reading locales. Localized schema features include voice/reading and GST distinctions.
- Home language section, hero, browser section, localized descriptions and laptop article now draw from shared factual answers, removing categorical phone-only/browser-English-only claims. Browser voice is not advertised as accepted or available.
- Samaan Bol spelling standardized only in product display strings, pricing FAQ and public page metadata. Legal-policy body rendering, business-address placeholders and copyright wording retain their upstream values. Contact destinations and identifiers are unchanged.
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

1. Native-speaker review of the nine new localized marketing FAQ sets before publication. All new translated FAQ copy, the Hindi additions and revised localized wording have only model drafting and automated structural review; no independent human linguistic review was performed. Automated parity does not validate fluency or every translated nuance.
2. Real voice-flow screenshots require a controlled synthetic demo, successful microphone/STT processing and review, with permission to operate the chosen test shop/device. Existing manual screenshots remain truthfully labelled.
3. Public App Store/Play descriptions were not edited. Align them through the store publication workflow after reviewing the website wording; no store write or release was authorized here.
4. Special billing eligibility, provider activation and tax filing must not be broadened by copy review. This change makes no claim of universal GST compliance or government submission.

## Independent final review

- Removed unsupported browser-voice availability claims from all locale answers, home hero, guide and llms.txt. Merged/deployed code is not equivalent to a successful real microphone/checkout acceptance run.
- GST release evidence is historical and scoped: PR #29 documentation commit `bb03c49` records web `e2c4b8330c9d1248437c653af6352b7457175327`, published Netlify deploy `6ac6c2bd37bca600081a1214`, and purchase/Composition/retained-credit/report readback. Later product-tax-history readback records PR #80 main `7c65e2f`, deploy `6ac964d30a75ee0008654e33`. No fresh production check or complete GST acceptance is claimed.
- Fresh remote verification: `git fetch origin` advanced main from `8bb8ee9` to `9d3d55c`. The sole upstream change adds `check:release` and `build:verified` scripts and sets Netlify to `build:verified`; no product-feature source or acceptance record changed. Rebase conflict resolution preserves both upstream release gates and the new SEO test command.
- Initial tests ran on the final working source before commit `6cd28e5`, not as a postcommit run on that hash. A fresh postcommit verification of the corrected final commit is required and recorded with the delivered review report.
- The scoped code review found no additional blocking SEO rendering/schema regressions. Authenticated financial behavior, microphone recognition, printer/device behavior, native-speaker quality and current production state remain outside the checks.

## Remote-baseline and branding follow-up

- Rebased the isolated branch onto freshly fetched origin/main `9d3d55c820c74ba0cb16f2ec623dee2efb87a965`. No push or remote/PR merge.
- Product evidence was rechecked against the upstream diff: no voice/GST/language implementation or release-evidence change occurred. Previously stated acceptance limits remain.
- Earlier SEO revisions changed the brand token in eleven business-address placeholders and ten localized copyright strings, and applied a broad brand replacement while rendering legal-policy bodies. Those changes were too broad for unverified legal identity and are restored to upstream values.
- No registered legal entity was independently verified or renamed. Business-address and copyright fields, legal source bodies, support/developer email destinations, postal/address values and link destinations are preserved exactly against upstream. Remaining brand edits are product display references.
- Final applicable verification includes the newly introduced upstream release gate (GST regression suite, translation coverage and TypeScript), production build, SEO regression and rendered locale checks. Exact resulting commit and postcommit logs are delivered in the final report.
