# Checkout parity and web design — 8 November 2026

## Scope and evidence

Compared the current mobile sources (`app/(modals)/checkout.tsx`, `src/components/pos/gst-controls.tsx`, `attach-chips.tsx`, `udhaar-risk-line.tsx`, and `src/lib/pos/customer-buyer.ts`) with the web checkout, customer selection, cart and issuance code. This is a source comparison, followed by actual web-component tests and a browser preview using synthetic shop data. The native checkout was not replayed in a simulator during this revision. No live sale, payment, inventory update or deployment was made.

All web changes are in the existing `codex/web-home-parity-design-20261107` worktree alongside the Home and Sell updates.

## Parity findings and implementation

| Area | Result |
| --- | --- |
| Cash, UPI, card, udhaar, split | Preserved. Card remains conditional on shop settings. Collection-order checkout remains limited to Cash/UPI. |
| Cash handling | Added strict nonnegative decimal input, exact amount when blank, replacing denomination presets and clear change/shortfall amounts, matching mobile. |
| Split payment | Added per-method remaining-amount shortcuts and exact paise balancing. Invalid, negative, over-assigned and under-assigned amounts cannot complete. Cash, UPI and udhaar portions retain their own conditions. |
| UPI | A QR requests only the positive UPI portion of a verified payable amount. No QR/payment amount is shown while billing setup or tax evidence is unresolved. An unconfigured shop needs a reference of at least four characters, matching mobile. Uploaded QR amounts are explicitly entered by the customer. Merchant payment confirmation remains manual. |
| Udhaar | Requires a customer, Premium evidence and the existing online credit review. Preserves limits, warnings, acknowledgements, due dates and permitted overrides. Adds the mobile customer-history context to checkout and the picker. History is contextual; server credit rules remain authoritative. |
| Customer/buyer | Customer search and new-customer entry open in a dialog. Saved billing identities take precedence over imported GST contact information. Async selection is scope/session guarded. Required buyer details open for GSTIN, high-value bills or GST errors. |
| GST | Preserves registration/protocol checks, tax snapshots, MRP ceilings, composition bills, RSP package review, mixed-discount review and rounding. Adds a persisted bill-specific included/added price-basis choice, which also appears in the Sell estimate. Refresh controls expose failed or invalid tax evidence without showing an untaxed fallback as payable. |
| Bill discount and note | Kept in a disclosure. Invalid money text does not corrupt the saved discount and blocks completion. Notes remain part of the original request. |
| Bought-together suggestions | Adds mobile’s server-computed checkout suggestions: unique partners of items already in the bill, strongest first, up to three. Only available, priced catalogue items can be added. Further tax/package validation still applies. Suggestions never add products automatically. |
| Items and photos | Item/total review stays available above payment. Existing private product-photo presentation remains separate from the immutable financial payload. |
| Estimates and collection orders | Preserves source review, source identity, collection confirmation, allowed payment methods and server validation. |
| Zero payment | Ordinary zero-value bills are blocked; a valid bill rounded down to zero retains the existing zero-payment issuance path. |
| Retry and offline recovery | Submitted checkout becomes read-only. All payment modes retry the exact retained request, preserving identity, items, payments, tax, customer and document presentation. Existing financial locks, scope checks, local fiscal receipt verification and recovery routes remain. The narrow proven mixed-document rejection can still release an unissued draft for review. |
| Languages | New copy is explicit in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Existing detailed credit/GST copy continues to use the shared catalogues. |

## Layout

One continuous sheet matches the revised Sell workspace: amount due, optional item review, payment choice and only its relevant controls, customer details, optional bill adjustments, then a sticky confirmation action. The previous permanent bill sidebar is removed. On small screens the action stays above the app navigation and safe-area inset. Errors and unresolved saved requests remain visible.

## Validation

- `npm run build:verified` passed: GST/financial journal contracts, translations, billing, cashbook, account deletion, follow-ups, auth, Home, Sell, checkout, photo-session checks, TypeScript and Next production build.
- 16 focused checkout checks exercise the real component with synthetic APIs plus payment helpers. They cover strict decimals; defaults; exact cash and presets; invalid cash/discount preservation; split remainder and payload; UPI readiness; disabled card; GST failures and valid included/added totals; zero ordinary bills; immutable retries across settings failure; customer/Premium requirements; completed-cart clearing; and imported/saved buyer precedence.
- Browser: 40 cash layouts across all ten languages at 320, 390, 768 and 1135 px, plus 20 split layouts at 320 and 1135 px. No horizontal overflow or clipped controls; each split reached confirmation readiness after reference entry.
- Additional browser checks: customer lookup/selection, cash change, credit terms, dynamic UPI QR, unavailable settings, and responsive screenshots. No payment was submitted.
- Final small QR rendering change prevents a previously generated QR from being displayed for a newly changed amount. TypeScript, focused checkout checks and a final production build were rerun after the finishing changes.

Browser evidence lives in `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/checkout/`.

These checks do not establish new physical-device, payment-provider, production-offline, or native-language editorial acceptance. Browser offline recovery and native fiscal storage use their existing platform-specific implementations.
