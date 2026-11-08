# Remaining workspace redesign — implementation tracker

User scope: all 31 remaining shop routes, plus adjacent public storefront and utility consistency review. Do not mark a route complete from shared CSS or translation coverage alone. Each needs mobile-source comparison, implementation and responsive interaction verification. No deployment requested in this iteration.

| Route | Parity | Design | Mobile/languages |
|---|---|---|---|
| `/shop/products/bulk` | Shared workflow matches mobile; controls audited | Step sequence, focused review, history disclosure | Ten languages at 320px; synthetic review, confirmation and apply passed |
| `/shop/products/barcodes` | Shared workflow matches mobile; generate/replace/download retained | Search, missing-code filter, label records | Ten languages at 320px; filter, selection, generation confirmation checked |
| `/shop/alerts` | Audited; bulk/prediction buy-list actions restored | Implemented | Ten languages at 320px; filters and add action checked |
| `/shop/brief` | Audited; history, stock, regeneration and Free audio restored | Implemented | 10-language 320px check; desktop visual and refresh verified |
| `/shop/voice` | Pending | Pending | Pending |
| `/shop/cashbook` | Pending | Pending | Pending |
| `/shop/sales/refunds` | Pending | Pending | Pending |
| `/shop/customers/[id]/statement` | Pending | Pending | Pending |
| `/shop/customers/followups` | Pending | Pending | Pending |
| `/shop/products/import` | Pending | Pending | Pending |
| `/shop/customers/import` | Pending | Pending | Pending |
| `/shop/suppliers/import` | Pending | Pending | Pending |
| `/shop/settings/opening-balances` | Pending | Pending | Pending |
| `/shop/settings/gst` | Pending | Pending | Pending |
| `/shop/settings/gst/checks` | Pending | Pending | Pending |
| `/shop/settings/gst/devices` | Pending | Pending | Pending |
| `/shop/settings/gst/numbers` | Pending | Pending | Pending |
| `/shop/settings/gst/recovery` | Pending | Pending | Pending |
| `/shop/settings/gst/recovery/[requestId]` | Pending | Pending | Pending |
| `/shop/settings/gst/exports` | Pending | Pending | Pending |
| `/shop/settings/gst/periods` | Pending | Pending | Pending |
| `/shop/settings/gst/turnover` | Pending | Pending | Pending |
| `/shop/settings/gst/providers` | Pending | Pending | Pending |
| `/shop/settings/gst/rounding` | Pending | Pending | Pending |
| `/shop/products/gst` | Pending | Pending | Pending |
| `/shop/products/[id]/gst` | Pending | Pending | Pending |
| `/shop/products/[id]/gst/rsp` | Pending | Pending | Pending |
| `/shop/adjustments/[id]` | Pending | Pending | Pending |
| `/shop/estimates` | Pending | Pending | Pending |
| `/shop/online-store` | Pending | Pending | Pending |
| `/shop/onboarding` | Pending | Pending | Pending |

## Verification notes

Adjacent review: /store/[storeId], /store/[storeId]/p/[itemId], /store/[storeId]/orders/[orderId], /subscription/return and /delete-account remain pending.

Daily brief verification: TypeScript, Home action regression tests and translation coverage passed. Actual component fixture at 320px in ten languages had no page overflow. Free audio control and regeneration verified with synthetic responses; live TTS not invoked. Uses existing HomeNudge confirmation, dismissal and message review. Corrected inaccurate translated Daily brief titles.

Alerts: stock/expiry/prediction flows compared to mobile low-stock-alerts. Added actionable-prediction and bulk buy-list actions, All-view predictions, localized quantities/expiry, in-flight guards, explicit fetch errors and retry. All ten languages fit 320px after filter wrapping; desktop filter and synthetic add-all checked. Live prediction generation and real buy-list writes not performed.

Bulk editor: shared contract/client/workflow match mobile. Existing dedicated-field protections, stale-review and uncertain-outcome recovery retained. Existing localized strings reused. TypeScript and translation coverage pass; synthetic price review requires confirmation and focuses the review before apply. Real bulk changes not made.

Barcodes: mobile contract/client/workflow match. Added missing-only filter with scope reset, compact label records and responsive command bar. Synthetic generation retained existing code and cleared missing selection; real code generation and physical printing not performed. Existing ten-language strings reused.
