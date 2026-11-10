# Products parity and web design — 8 November 2026

## Scope and evidence

Compared native `app/(modals)/products.tsx`, `product-detail.tsx`, `add-batch.tsx`, `adjust-stock.tsx`, catalogue search/expiry helpers, inventory API types and the owning server inventory routes with the web screens. The native application was reviewed in source; no fresh simulator replay was performed during this revision.

Web component tests and browser checks use synthetic data. No live stock, product, pricing, financial or archive operation was submitted. Changes remain local in the existing `codex/web-home-parity-design-20261107` worktree alongside Home, Sell, checkout and Sales.

## Parity findings and changes

| Area | Result |
| --- | --- |
| Catalogue search | Adds short-code matching and the same name/barcode/alias search semantics used by Sell and native Products. Archived products stay out of active views. |
| Filters and sorting | Adds category filtering and name, recently updated and stock-priority sorting. Untracked services are excluded from stock/expiry alerts and sort after tracked items for stock priority. Near-expiry includes expired items and the native 60-day window. |
| Navigation continuity | Search, stock filter, category and sort are retained in the URL and product-detail return link. List scroll position and selected product IDs are retained per user/shop. Return URLs are restricted to the local product list. |
| Bulk operations | Retains scoped bulk selection, pending-result recovery and history. Matching selection now carries the category and native search semantics. Shift selection remains available on desktop. |
| Catalogue tools | Import, barcode management and bulk tools move into a disclosure. CSV export is retained and excludes archived rows; hidden cost remains omitted. Error/loading states are distinct from an empty catalogue. |
| Product summary | Combines the existing private photo gallery, stock state, on-hand quantity, reservation information, selling price and low-stock threshold. Add to bill, receive stock, adjust stock and buy-list actions remain close to this context. |
| Receiving stock | Adds packs/base-unit entry, cost conversion, batch number, purchase date and optional selling-price update. Existing supplier and expiry controls remain. Buy-list handoff is preserved. Strict decimal and date-order checks block invalid input. |
| Partial completion | Once receipt is acknowledged, retrying a failed price or buy-list follow-up does not repeat the receipt within the open editor. If the stock-write outcome is uncertain, the editor stops resubmission and directs the user to refresh/check stock and activity. This is not a new durable, idempotent receipt protocol. |
| Stock correction | Removal requires an explicit reason and a positive quantity no greater than recorded stock. The native “sold instead” path adds the requested quantity to the bill. Manager absolute-count correction remains a separate disclosure, with zero valid and invalid text blocked. Writes are disabled offline. |
| Batch editing | Corrects a pre-existing mismatch: the server does not accept quantity in its batch-metadata patch. The editor now changes supported batch number, supplier, cost and dates, and directs quantity corrections to Adjust stock. |
| Batch history | Preserves active/all views and the independently fetched next-out batch for costing. Shows receipt quantity, supplier, dates, expiry state and creator/time provenance. |
| Product insights | Adds relevant product nudges and strongest unique “Often bought with” product links. Existing actions are reused with product-surface event attribution. Missing/archived related products are omitted. Suggestions do not automatically change stock or prices. |
| Sales and cost | Preserves 30-day product sales and recorded-cost margin. Stock-cover estimates are suppressed with fewer than three bills, matching native, and the estimate explanation remains visible. Helper views hide cost, reports and management controls. |
| Tax, barcodes, archive | Existing GST history/confirmation/scheduling and barcode generation/copy/download components are retained in expandable sections. Online-store management and confirmed archive/delete remain accessible. |
| Languages | Updated English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Corrected inherited wrong-script labels and English depletion/archive guidance in translated catalogues. New explicit keys take precedence over stale text aliases. |

## Layout

A stock-status strip leads into one catalogue with search, category and sort controls. Rows align product imagery/name, stock information and selling price, then stack on phones. Bulk and occasional tools expand only when needed.

Product details use one continuous record: product summary, contextual stock editor, batch ledger, sales/insights, then barcode, tax, detail and management sections. The charcoal surfaces, saffron rules, typography and regular page scrolling match the updated Home, Sell, checkout and Sales screens.

## Validation

- `npm run build:verified` passed the full existing release suite, the new Products tests, TypeScript and the Next production build.
- 15 focused checks cover search/category/sort, expiry, safe return URLs, related-product selection, actual catalogue filtering/bulk payloads, errors and Helper restrictions, pack/cost conversion, receive metadata, partial-completion retries, uncertain-write blocking, strict stock corrections, offline controls, supported batch metadata and sparse stock-cover suppression.
- Existing product-photo/session, detail-refresh, leave and create-recovery regression checks passed. The detail-refresh fixture adds a stub for the new summary thumbnail; its loading/error assertions remain unchanged.
- Translation coverage passed for 1,483 web labels across the nine translated languages plus English, including placeholder/script checks.
- Browser: product list and product details with the receiving editor open, in all ten languages at 320, 768 and 1135 px (60 cases). Four narrow supplier-link overflows were found and fixed; the 320px detail checks were repeated for all ten languages. The final matrix has no document or receiving-form horizontal overflow and no blank headings.
- Additional browser checks: short-code search, stock sort, filtered detail/back navigation, pack calculation (2.5 bags of 20 kg → 50 kg), and Helper cost/management visibility. No stock-write button was submitted.
- Final focused tests and production build passed after the final copy, supplier-label and layout adjustments. `git diff --check` passed.

Screenshots and the final matrix: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/products/`.

## Limits

This is not new physical-device or product-photo acceptance. Existing photo/gallery transport and consent behavior are retained; prior user-reported physical checks were not repeated. Native and browser offline caches remain platform-specific. Actual production stock mutations, barcode printing and human native-language editorial review were not performed. Product creation/edit forms and the dedicated import/bulk/barcode workflows retain their existing designs.
