# Branding & formats — parity and redesign

## Scope and evidence

Compared the web editor with `dukaan_voice_mobile/app/(modals)/document-branding.tsx`, its document workflow, and the server document-branding routes. Verified the actual web components locally using synthetic API responses and the production document renderer. No live shop settings were changed, and this work has not been deployed.

## Feature parity

| Capability | Result |
| --- | --- |
| Owner-only branding configuration | Retained; managers and helpers see an access explanation. |
| Receipt 80 mm, A4 and A5 | Retained; illustrated choices show physical dimensions. |
| Document language | All ten app languages retained independently of app language. |
| Logo and signature | PNG/JPEG upload, replace and remove; logo contain/cover and signature visibility retained. Browser file chooser supports the available device photo/file sources. |
| Image validation | Client rejects empty, unsupported or over-2 MB files; existing server dimension validation retained. |
| Terms and payment details | 2,000-character terms, configured UPI details and a link to Payments & bills retained. Payment-data refresh failure is explicit. |
| Samples | Real 1/20/100-item document previews retained, including pagination and PDF/PNG/print/share controls. Samples do not issue a bill. |
| Save/recovery | Immutable branding versions and identical-request retries retained. Duplicate saves are blocked; reload confirms before replacing an unsaved draft. |
| Existing issued bills | Keep their retained branding and legal/tax identity. |

The core mobile feature set was already present on web. This work closes usability and lifecycle gaps rather than inventing new billing capabilities. Session-aware editor scope prevents a late response from publishing into a closed editor.

## Design changes

- Format, Brand assets and Content sections reduce the amount of form content visible at once.
- A persistent desktop preview rail shows a clearly labelled layout guide and opens the real document sample. It stacks below the editor on small screens.
- Draft/saved state and recovery actions are explicit. The save bar sticks only while there is a change or unresolved save.
- Dark surfaces, saffron rules, restrained paper illustrations and existing typography match the redesigned shop screens.
- The sample dialog traps keyboard focus, supports Escape and restores focus to its trigger.
- Fixed shared document-preview scaling: it now measures the inner paper viewport instead of the wider outer panel. This prevents the right edge of receipts and paper documents from being clipped on phones.
- Added thirteen editor labels in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam; existing document translations are reused.

## Verification

- Full `build:verified` passed during implementation; final focused checks and production build passed after the preview fix.
- Branding suite: ten tests covering draft comparison, uploads, access, scope, duplicate saves, idempotent retries, reload, unmounted responses, localization and preview scaling.
- Sales/GST document regression suite: nineteen tests passed.
- Translation coverage: 2,182 web labels across English and nine translated languages passed.
- Three editor sections at 320px and 390px in all ten languages: sixty layout checks, no horizontal page overflow or raw translation keys.
- Actual receipt previews in all ten languages at 320px: paper fits the inner viewport, including rightmost amounts.
- A4 and A5 at 320, 390, 768, 1024 and 1440px: ten actual paper-width checks passed.
- Browser interactions: logo/signature upload and removal, contain/cover, terms and UPI changes, reload confirmation/cancel, first save, failed-save retry with the same request ID, stale-profile reload, non-owner, offline, loading, metadata error and payment-data error states.
- Actual samples: A4 20-item sample paginated to two pages; 100-item receipt paginated to twelve pages; next-page controls worked. Downloaded one-page A4 PDF measured approximately 595.28 × 841.89 points.
- Keyboard: backward/forward focus wrapping, Escape and return to Preview sample verified.

Evidence: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/branding-review-2026-11-09/` contains screenshots, layout/paper-width matrices and the sample PDF.

## Limits

The mobile comparison is source-backed; no fresh native simulator flow was needed or claimed. Browser checks use synthetic shop data, not production persistence. Physical mobile photo pickers, printer output and OS share targets were not exercised. Translation coverage and layout were verified, but this is not a native-speaker linguistic review.
