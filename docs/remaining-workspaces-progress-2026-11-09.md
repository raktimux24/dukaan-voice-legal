# Remaining workspace redesign — implementation tracker

User scope: all 31 remaining shop routes, plus adjacent public storefront and utility consistency review. Do not mark a route complete from shared CSS or translation coverage alone. Each needs mobile-source comparison, implementation and responsive interaction verification. No deployment requested in this iteration.

| Route | Parity | Design | Mobile/languages |
|---|---|---|---|
| `/shop/products/bulk` | Shared workflow matches mobile; controls audited | Step sequence, focused review, history disclosure | Ten languages at 320px; synthetic review, confirmation and apply passed |
| `/shop/products/barcodes` | Shared workflow matches mobile; generate/replace/download retained | Search, missing-code filter, label records | Ten languages at 320px; filter, selection, generation confirmation checked |
| `/shop/alerts` | Audited; bulk/prediction buy-list actions restored | Implemented | Ten languages at 320px; filters and add action checked |
| `/shop/brief` | Audited; history, stock, regeneration and Free audio restored | Implemented | 10-language 320px check; desktop visual and refresh verified |
| `/shop/voice` | Pending | Pending | Pending |
| `/shop/cashbook` | Shared mutations match mobile; expense entry and ledger presentation restored | Amount-first expense form, ledger rows, expense list/details | Ten languages at 320px for day and form; synthetic unpaid save verified |
| `/shop/sales/refunds` | Native periods, summary, rows and bill navigation audited; settlement fallback restored | Sales-style metrics and settlement ledger | Ten languages at 320px; audit disclosure and settlement amounts checked |
| `/shop/customers/[id]/statement` | Pending | Pending | Pending |
| `/shop/customers/followups` | Pending | Pending | Pending |
| `/shop/products/import` | Shared workflow matches mobile; issue-first review and grouped mapping restored | Responsive upload/history, mapped columns and review | Ten languages × upload/mapping/review at 320px; skip/include checked |
| `/shop/customers/import` | Shared workflow and native party screen audited | Grouped mapping, issue-first review and upload history | Ten languages × three stages at 320px |
| `/shop/suppliers/import` | Shared workflow and native party screen audited | Grouped mapping, issue-first review and upload history | Ten languages × three stages at 320px |
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
| `/shop/onboarding` | Owner name, language, phone validation, invite-link/QR support restored | Two-stage responsive create/join workspace | Ten languages × join/details/GST at 320px; phone and invite parsing verified |

## Verification notes

Adjacent review: /store/[storeId], /store/[storeId]/p/[itemId], /store/[storeId]/orders/[orderId], /subscription/return and /delete-account remain pending.

Daily brief verification: TypeScript, Home action regression tests and translation coverage passed. Actual component fixture at 320px in ten languages had no page overflow. Free audio control and regeneration verified with synthetic responses; live TTS not invoked. Uses existing HomeNudge confirmation, dismissal and message review. Corrected inaccurate translated Daily brief titles.

Alerts: stock/expiry/prediction flows compared to mobile low-stock-alerts. Added actionable-prediction and bulk buy-list actions, All-view predictions, localized quantities/expiry, in-flight guards, explicit fetch errors and retry. All ten languages fit 320px after filter wrapping; desktop filter and synthetic add-all checked. Live prediction generation and real buy-list writes not performed.

Bulk editor: shared contract/client/workflow match mobile. Existing dedicated-field protections, stale-review and uncertain-outcome recovery retained. Existing localized strings reused. TypeScript and translation coverage pass; synthetic price review requires confirmation and focuses the review before apply. Real bulk changes not made.

Barcodes: mobile contract/client/workflow match. Added missing-only filter with scope reset, compact label records and responsive command bar. Synthetic generation retained existing code and cleared missing selection; real code generation and physical printing not performed. Existing ten-language strings reused.

Cashbook: compared native view and expense form, retained unchanged shared contract/client/workflow. Ported expense/ledger presentation hooks, unsupported-service errors and return-to-list after expense save. Desktop form and 320px day/form checked in ten languages using existing translated keys. Unpaid synthetic expense saved with zero payment and full remaining balance. Cashbook regression tests, translation coverage and TypeScript passed. Live payments/reconciliation/export not executed.

Refunds: native refunds.tsx comparison complete. Web retains search, custom dates and cursor navigation; reversed custom ranges now suppress queries. Both flat and nested settlement evidence display correctly. Sales regressions, TypeScript and translations pass. 320px ten-language check and synthetic audit disclosure verified; no real refund submitted.

Product import: native import screen compared, with shared contract/client/workflow retained. Added issue-first review, all-row toggle, matched/optional field grouping and missing-name guidance. Existing safe confirmation, batch recovery and opening-session handoff retained. Native importUI translations copied for all ten languages. Browser checked 30 stage/language combinations at 320px and skip/include state with synthetic jobs; real uploads/writes not executed.

Customer/supplier imports share one implementation. Native party import reviewed; customer Premium and supplier access conditions, balances, staging and confirmation retained. Both routes tested in all ten languages at 320px in upload, mapping and review stages using synthetic jobs. TypeScript and translation coverage passed.

Onboarding: compared native create/join flows and server create fields. Added owner name and preferred language, localized shop type/subtype, normalized Indian phone validation, GST name/address prefill, explicit join confirmation after owned-link parsing and QR capture reuse. Duplicate submission protected. Corrected translated GST select overflow; final ten-language 320px pass. Parser tests, TypeScript and translation checks pass. No shop created/joined, camera permission or physical QR scan executed.
