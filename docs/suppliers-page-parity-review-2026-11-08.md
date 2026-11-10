# Suppliers review — 8 November 2026

Compared mobile Suppliers, SupplierDirectory, supplier-detail, gst-supplier and supplier query/API contracts with the web screens. Native parity is source-based; no new simulator or physical-device acceptance was performed.

## Changes

- Redesigned the saved supplier directory and stock receipt names as a ledger; only explicit inventorySupplierName associations join the two. Search queries the server directory with its existing pagination. A load-more notice makes partial result coverage explicit.
- Added supplier purchase-order counts with the native summary endpoint and a paginated fallback. Duplicate order IDs are counted once; a stalled fallback page fails rather than loops.
- Dedicated searchable comparison tab with per-supplier last paid price, date, last-used and lowest-price labels, plus links to supplier and product records.
- Receipt detail has total recorded spend, first/last purchase, product/receipt counts, products/batches tabs, archived status, optional margin, alternate supplier links and cheaper-product count. Missing prices render as unknown rather than zero. Literal percent signs in already-decoded route names no longer trigger double-decoding errors.
- Saved identity detail has order/receipt metrics, invoice entry, purchase orders, invoice history, linked receipt history, GST/address and existing import/contact/opening-balance profile.
- Unlinked receipt names go through the existing supplier identity review/editor before invoice entry. No fuzzy or automatic supplier merge.
- Supplier editing preserves a snapshot while background data refreshes. Added optional cancel with dirty-change confirmation; cancellation is disabled while saving or an uncertain request is retained. Offline supplier writes are disabled. Existing validation, optimistic version and request-outcome recovery remain in place.
- All ten app languages updated using explicit supplier and directory keys plus four new translated descriptions. Existing GST/editor translations reused.

## Verification

- Seven focused tests passed: explicit linking, special-character URLs, price comparison, null/threshold handling, summary counts, legacy pagination/deduplication and stalled-page detection.
- Full existing release checks and production build passed; final typecheck and production build passed after finishing changes.
- Translation checks passed: 1,625 web labels in English and nine translated languages.
- Browser: 90 list/history/identity layout cases (ten languages × three widths), ten phone edit forms, ten phone comparison views. Initial phone price-block and long-label overflows were fixed and all twenty affected detail combinations rerun successfully.
- Browser interactions: compare search, price order, editor cancellation, and Helper denial on all three screens. No real supplier save, invoice or purchase transaction was submitted.

Evidence: task visualization directory dashboard-review/suppliers/{suppliers,supplier,supplier-record}.png and layout-checks.json. Local preview uses synthetic data and actual screen components. Imported profiles, physical product photos, backend supplier writes and native-language human proofreading were not reaccepted in this pass. Dedicated import/purchase/order flows retain their existing designs.
