# Payments & Bills: mobile parity and web redesign

Date: 9 November 2026.

## Scope and source evidence

Compared the mobile `app/(modals)/pos-settings.tsx`, its GST controls/readiness journey, phone validation and `server/src/routes/pos-settings.ts` with the web Payments screen and API. Implemented in the existing web worktree alongside the preceding Supplier Invoices and Shop Profile changes. The mobile app and server were not changed. No commit, deployment or production settings mutation was performed.

## Parity findings

| Capability | Previous web | Updated web |
| --- | --- | --- |
| Member visibility / owner editing | Whole page owner-only | All members can view; owner-only writes. Settings navigation reflects this. Managers retain GST checks. |
| UPI image upload and decoding | Upload available, no decode feedback | Decoded ID/payee, unreadable image and non-UPI feedback. Unreadable/non-UPI responses preserve the existing ID. |
| QR camera source | Missing | Browser file input with rear-camera capture hint; platform may offer a picker instead. |
| Remove stored QR | Missing | Explicit removal, immediate save, existing UPI ID retained. |
| Generated QR preview | Missing | Amount-prefilled ₹1 sample from the typed UPI ID, saved-image fallback and unset state. Clearly labelled preview. |
| Bill header/footer, phone/address | Available, phone only trimmed | Live text preview, optional Indian phone validation and prefix normalization, existing field limits. |
| Sale counter and cancellation context | Counter absent | Next sale number, default payment and cancellation window summary. Web cancellation-window and card controls retained. |
| Active GST profile | Editable fields led to server rejection | Regular/composition profiles locked with support guidance, matching mobile/backend contract. |
| GST setup capabilities | Limited context | Unavailable setup and billing-disabled/setup-available states; existing GST validation and review confirmation preserved. |
| GST checks and exports | Existing GST journey | Owner/manager readiness, product tax review and records links; owner export link to existing web export flow. |
| Branding and document formats | Existing link | Preserved next to the bill-text preview. |
| Draft and save safety | Monolithic form | Payments, Bill details and GST sections retain drafts across switches. Failed saves retain edits; Cancel restores payment/bill fields. Only changed payment/bill fields are sent. QR changes save independently. |
| Actor/shop change | General page lifetime | Keyed editor isolates drafts across actor/shop/session changes, with async completion guards. |

UPI preview does not confirm payment collection. Native camera permissions and decoding quality on physical devices were not tested. The QR decoder's success/failure responses were simulated; the browser's chooser and actual file-read path were exercised. The existing server remains responsible for decoding, validation and authorization.

## Design

Dark brand surfaces, saffron rules and compact summary facts match the redesigned app. Text navigation separates payment setup, customer-facing bill details and GST. Desktop previews sit beside the form; mobile uses a single readable column. Unsaved payment/bill actions sit above the mobile bottom navigation. A paper-toned bill preview shows text only, avoiding an inaccurate claim to reproduce the selected legal invoice template.

## Localization

Updated English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Added 20 `payweb` labels and refreshed seven existing payment/bill labels in every language. Corrected inherited legislative-bill translations and a Save action that resolved to an unrelated import label. Explicit translation-key precedence protects this page's copy. Existing GST and operational translations are reused. This is code/layout review, not independent native-speaker certification.

## Verification

- `npm run build:verified` passed: release suite, translation coverage, TypeScript and production build.
- After the preview-contrast and final copy fixes, `npm run test:settings` passed 24 tests, `npm run test:translations` passed 2,169 web labels across English and nine translated languages, and the final production build passed.
- Added nine payments tests: unchanged/partial patches, UPI format/normalization, phone validation, cancellation bounds, optional null values, preservation of bill edits after QR updates, active GST lock, language coverage and translation alias regression.
- Mobile: 60 checks across ten languages, 320/390px widths and all three panels. Additional 30 checks covered final labels and expanded editable regular-GST forms at 320px; final copy/save-bar follow-up added 20 checks. No horizontal overflow or raw page translation keys found.
- Tablet/desktop: all three panels at 768, 1024 and 1440px. Larger-text payment drafts at 320px in English, Hindi and Malayalam fitted.
- Synthetic UI interactions: invalid phone/UPI rejected; normalized phone accepted; bill draft survived tab changes and QR upload; QR decode updated only UPI fields; image removal retained VPA; bill save sent only the changed header; failed save retained draft and Cancel restored it.
- Registered GST validation blocked incomplete/unconfirmed details; a valid synthetic regular profile saved and became locked. Unregistered profiles preserve the existing server validation semantics. Manager/Helper editing disabled, manager checks available, Helper checks restricted. Loading, read failure, offline, GST setup unavailable and billing-disabled states rendered.
- QR unreadable and non-UPI feedback displayed with the prior VPA retained. Final browser console reported no errors.
- `git diff --check` passed.

All browser interactions used actual web components with local synthetic API responses. No live payment configuration, GST registration, bill numbering or customer record was changed. Physical-device camera/keyboard behavior, live decoder acceptance and cross-device synchronization remain separate acceptance work.

## Review artifacts

Preview: `http://127.0.0.1:8010/?screen=payments&lang=en&role=OWNER&review=payments-v4-final`.

Evidence directory: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/payments-bills-review-2026-11-09/`.

Contains desktop Payments and Bill details screenshots, Hindi mobile screenshots, synthetic QR input and `layout-checks.json`. Build logs: `/tmp/payments-build.log`, `/tmp/payments-final-build.log`; focused tests: `/tmp/payments-final-tests.log`.
