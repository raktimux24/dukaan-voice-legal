# Web GST parity continuation acceptance — 8 October 2026

Test shop: Suresh Stationary Store (user-approved test account). Production: https://samaanbol.space.

## Automated evidence

- `npm run test:gst`: ordinary selling-price tax, buying discounts, fractional quantities, mixed rates, IST periods, document scope/tampering, scoped immutable browser requests, atomic reservations, concurrent financial locks, lost response/outcome recovery and delayed account-switch rejection.
- Added `tests/gst-parity.mjs`: browser/native hash compatibility with Indic text; reviewed RSP packages; mixed projections and discount gates; mixed and rounded renderers; credit-note replay; cumulative special returns; missing-history/over-return rejection; rehashed incorrect arithmetic and unknown-format rejection; complete tax timelines and mismatched-rate rejection; selected-document HTML/print styles.
- 58 shared pure mobile/server contracts verified against their manifest.
- Ten bundled web locale catalogs have every 595 source key and matching placeholders.
- Type checking and production Next.js build passed before release.

## Browser acceptance

Pending deployment of this continuation. Authenticated lifecycle checks, capability gates, screenshots and any limitations will be appended after the production commit is verified.

## Scope

The server's RSP and payable-rounding capability flags remain authoritative, as on mobile. The client does not activate unreviewed tax profiles or provider filing. Supplier filtering applies to invoice lists; both mobile and web reconciliation/exports use the shop-wide backend contract, explicitly labelled in the UI.
