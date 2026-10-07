# Web GST parity continuation acceptance — 8 October 2026

Test shop: Suresh Stationary Store (user-approved test account). Production: https://samaanbol.space.

## Automated evidence

- `npm run test:gst`: ordinary selling-price tax, buying discounts, fractional quantities, mixed rates, IST periods, document scope/tampering, scoped immutable browser requests, atomic reservations, concurrent financial locks, lost response/outcome recovery and delayed account-switch rejection.
- Added `tests/gst-parity.mjs`: browser/native hash compatibility with Indic text; reviewed RSP packages; mixed projections and discount gates; mixed and rounded renderers; credit-note replay; cumulative special returns; missing-history/over-return rejection; rehashed incorrect arithmetic and unknown-format rejection; complete tax timelines and mismatched-rate rejection; selected-document HTML/print styles.
- 58 shared pure mobile/server contracts verified against their manifest.
- Ten bundled web locale catalogs have every 595 source key and matching placeholders.
- Type checking and production Next.js build passed before release.

## Browser acceptance

Verified production web release `a61dbb3` on Netlify deploy `6ac6bca9e1930200083cfb21` (ready/published). Backend `0bc6c12` is live on Render deploy `dep-db3c0maj9qps73f05usg`.

- Created canonical synthetic supplier GST Web QA Supplier 08 Oct. Reloaded the invoice workflow and confirmed it remained in the directory alongside Krishna Enterprise.
- Recorded test sale `6273310f-a700-496e-a9fb-9e5486437a38`, bill of supply `26-3-001`: one book at ₹450, synthetic cash entry. Composition shop correctly collects zero GST.
- Paid refund preview exposed a read/write inconsistency. Removed the obsolete credit-only restriction in the backend settlement write path; full PGlite migration/issuance/retry/return test and TypeScript build pass. Recovered the exact saved request `8dd343c3-d37a-473b-bcb1-87a67e4c18d2`; browser recovery marked it Confirmed. Reloaded sale shows one returned/restocked book and ₹450 synthetic refund. Credit note `CN26-1` retained.
- Older ordinary credit-note payload exposed a web renderer gap. Added nested original-snapshot context support, original-number/amount/settlement checks and regression tests.
- Recorded purchase `dd8ded15-f7f3-4c40-b1ec-534057d9a656`, invoice `WQA-261008-01`: invoice-only stock action, ₹10 buying price plus 5% GST = ₹10.50. Reloaded detail confirms tax ₹0.50 and payable ₹10.50. No stock receipt or real payment.
- Required purchase tax fields now stay visible, confirmation resets on edits, manual profile version supplied when needed.

Deployment recovery: an initial Render API trigger selected configured old main rather than the requested branch SHA. Corrected using dashboard explicit commit deployment. Final live commit is recorded above.

Remaining acceptance boundaries: RSP and payable-rounding live issuance require an eligible reviewed Regular GST test shop; Suresh Stationary Store is Composition. Pure shared contract and web renderer tests cover those workflows, but no claim of live special-billing or physical printer/native PDF acceptance is made.

## Scope

The server's RSP and payable-rounding capability flags remain authoritative, as on mobile. The client does not activate unreviewed tax profiles or provider filing. Supplier filtering applies to invoice lists; both mobile and web reconciliation/exports use the shop-wide backend contract, explicitly labelled in the UI.
