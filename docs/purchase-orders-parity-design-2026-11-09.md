# Purchase orders: web parity and workspace redesign

## Scope and evidence

Compared the current native implementation in `dukaan_voice_mobile/app/(modals)/purchase-orders.tsx`, `src/lib/purchase-orders/view.native.tsx`, `src/components/pos/po-supplier-field.tsx` and the purchase-order API/store with the web implementation. This is a source-backed parity review, not a new native-device acceptance run.

The changes are on `codex/purchase-orders-parity-design`. No production orders, receipts, supplier records or inventory were changed. Release uses the GitHub pull request → main → automatic Netlify deployment workflow.

## Parity outcomes

| Capability | Result |
| --- | --- |
| Owner/Manager access and online requirement | Preserved; direct order reads now also respect the client access/readiness gate. Server role enforcement remains authoritative. |
| Draft, issue, share, partial receipt, rejected goods, close remainder and cancel draft | Preserved. Added separate cancellation confirmation; issue and delivery still require explicit review. |
| Supplier search, pagination, creation and linking a stock supplier | Reuses the existing web SupplierPicker and retained-request SupplierEditor inline, matching native capabilities without leaving the order. |
| Product selection and stock context | Added full active stock catalog lookup, stock quantities and supplier-specific last cost suggestions; service/inactive products are excluded. |
| Buy-list entry | Preserves committed quantity constraints; unknown demand starts at one rather than zero. Entry links carry the item name so items beyond the first options page can be found. |
| Draft workflow | Supplier → items → review, validated base quantities and prices, optional date/notes, complete estimated totals only when every price is set. Edited costs are retained. |
| Missing product during draft or delivery | Existing zero-opening-stock product form opens in another tab, keeping the order/receipt form intact. Query refetch on return refreshes available products. |
| Receive manual buy-list item | Same-unit active stock product mapping, accepted and rejected quantities, cost including tax, batch and expiry fields. |
| Receipt validation | Added client guards for quantity precision, combined accepted/rejected amount above the remainder, required rejection reasons, missing product/cost and invalid/past expiry dates. Server revalidation remains authoritative. |
| Supplier invoice handoff | Preserved receipt-bound invoice creation/opening, without adding already received stock again. Actual invoice availability remains server-dependent. |
| Saved-request retry, idempotency and stale versions | Existing workflow/storage protocol retained; pending requests block new actions. |
| Receipts and history | Separate history view with receipt lines, rejection reasons, batch/expiry metadata, invoice links and localized event dates/times. |

## Web layout

- Status overview and counts explicitly scoped to the current 30-order page.
- Search by supplier, order number or item, combined with status filter; previous/next page controls remain available.
- Readable order rows show supplier, reference, due date, status and estimated amount.
- Order details use separate Details, Actions and History views. Ordered/received/remaining quantities are separated into labelled columns.
- Mobile forms use one column, wrapping labels, a visible review total and actions above the bottom navigation. Switching detail tabs retains the reader's position.
- Existing product-image component provides photo/fallback slots; no new photo acceptance work was performed.

## Localization

Updated explicit web copy for English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Existing translated order lifecycle/requirements remain in the retail catalog. Explicit PO keys take precedence over legacy English-text aliases; already-translated form labels are not translated a second time. Unit labels use the corrected shared unit mapping. Dates/times and currency use the selected language.

## Verification

- Nine focused tests: draft precision/estimates, supplier costs, unknown/committed buy-list demand, filtering, receipt bounds/reasons/product/cost/expiry, access restrictions, pending-request lock, issue/delivery review and cancellation confirmation, and review-before-save.
- Full `npm run build:verified` passed, including translation coverage and TypeScript.
- Actual web components in an isolated synthetic API preview: 80 mobile layout checks (10 languages × 320/390 px × list/details/receive/draft review). No horizontal overflow, clipped form controls or untranslated PO keys found.
- Additional 320 px Malayalam extra-large text checks for details/history passed.
- Browser interactions verified supplier selection → items → review → save → issue and a partial delivery (5 accepted, 1 rejected) → receipt history. These are synthetic API checks, not production transactions or backend integration acceptance.
- Desktop and representative mobile screenshots reviewed. Artifacts: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/purchase-orders-review/`.

## Limits

Filters/counts apply to the loaded page, not all orders across the shop. Orders and estimated costs are not supplier invoices or dues. Issuing/sharing does not prove supplier acceptance. Only accepted receipt goods add stock; rejected quantities remain outstanding. Invoice recording/configuration, native share sheets, physical-device behavior and real stock/database mutation were not replayed against production.
