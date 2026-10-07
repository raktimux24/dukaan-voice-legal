# Web GST parity plan — 7 October 2026

## Scope and evidence

Bring the Samaan Bol web shop to functional parity with the current mobile GST experience, including existing screens, new pages, tax fields, connected customer/supplier workflows, retained documents and recovery. The first web GST release is live at main commit `0a14223` (PR #25). The continuation closes special checkout, document and return gaps. The original gaps below describe the baseline; they are not a current inventory of missing screens. Authenticated acceptance of the continuation is recorded below.

The production web app was opened in the Codex in-app browser at https://samaanbol.space/shop. The existing production browser is authenticated as Suresh Stationary Store. The deployed GST hub has loaded saved checks successfully for this account. Earlier protocol warnings described the pre-release baseline. The local HTTPS preview is rejected by the production Clerk hostname rules. Findings below are grounded in the current source of both repositories, not assumed from screenshot labels or earlier deployment reports.

Web baseline: `c4f6872e423022cbbef25db260dd0c4b71aaafa7` in `dukaan-voice-legal`. Mobile/server reference: current `dukaan_voice_mobile` checkout, including the GST localization work. Existing unrelated SEO edits in the web repository are outside this plan.

## Current implementation and acceptance status — 8 October 2026

The web implementation includes GST onboarding/settings, selling-price tax and buying discounts, unified customer/buyer and supplier identities, canonical supplier detail routes, retained issuance and recovery, product tax history/import/export/scheduling, ordinary GST documents and adjustments, purchase invoices/stock linking/input-tax reviews/credits/payments/reversals, checks/numbering/installations, verified report history, period and turnover reviews, and capability-gated RSP/rounding/provider review screens.

Financial journals use scoped IndexedDB records, atomic reservations and browser coordination. Confirmed receipts preserve originals; lost responses use exact original request/outcome verification. Reloaded RSP/rounding reviews restore their saved payload. Source contracts are vendored with a manifest and reproducible drift check. Bundled mobile catalogs and 514 supplemental web labels cover ten languages.

Verified locally: production Next build, TypeScript, pricing/discount/fractional/IST/document-integrity tests, immutable browser storage/reservations/locks, lost-response replay, delayed account-switch rejection, and 32 matching pure contracts. These tests do not prove authenticated cross-client behavior.

Remaining completion gates:

- Configure an authenticated development/staging preview. User approved Suresh Stationary Store as a test account; production Clerk keys reject the local hostname. Do not weaken authentication or extract another browser's tokens.
- Run the acceptance matrix below against the new code, including persisted web/mobile readback, owner/manager/helper permissions, supplier purchase lifecycle, browser restart, two-tab issuance, print/PDF pagination and keyboard/Indic layout checks.
- Supplier filtering currently narrows the invoice list. Reconciliation totals and purchase exports remain shop-wide, clearly stated in the UI. Supplier-filtered totals/exports require a backend contract extension; they are not implemented.
- Ordinary retained GST document rendering is implemented. Special mixed/RSP/rounded payloads require complete dedicated print/adjustment acceptance; unsupported invoice payloads fail closed and retain original JSON export rather than displaying invented zero totals.
- RSP and rounding review tools do not enable special billing; real server capabilities control availability. Provider status is read-only.
- Publish only after the authenticated acceptance gate, then verify critical live flows. PR #25 has been merged and its exact commit was confirmed published by Netlify. The continuation will be released separately after checks. Unrelated existing SEO work has been preserved.

This plan is therefore **implemented in substantial part, with acceptance and the explicit scope gaps above still open**. It must not be labelled complete or mobile-equivalent based on the build alone.

## Confirmed gaps in the web source

| Area | Current web behavior | Required change |
| --- | --- | --- |
| Contracts and inventory mapping | `app/lib/shop/types.ts` lacks GST settings, sale context/snapshots and product tax contracts. `api.ts:201` maps products without tax profiles. | Carry profiles, versions, capabilities, fiscal snapshots, request identities and response metadata through every layer. |
| Onboarding | `screens/onboarding.tsx` creates a shop with business/contact details only. | Shop details → GST setup or explicit defer → create shop; do not equate defer with unregistered. |
| Payments settings | `screens/payments.tsx` handles UPI and ordinary bill preferences. | Collapsible Payments & bills sections, GST registration and pricing mode, readiness and links into GST workflows. Also fix its failed-load path: no data currently returns a spinner before rendering the error. |
| Products | `screens/product-form.tsx` has selling price, manual MRP and purchase price; no GST controls. | Buying price/discount, selling price, tax classification/rate/code and visible GST breakdown; automatic MRP suggestion with manual override. |
| Checkout | `cart.ts:178` calculates subtotal less discounts only. Checkout sends no GST context or tax profiles. | Use the shared tax calculation and retained issuance contracts; unify customer selection with GST buyer identity. |
| Financial retry | Checkout stores one pending sale in localStorage, uses a time-based lock and clears pending on most non-network errors. | Durable requests, cross-tab issuance coordination, retained uncertain outcomes and verified retry/recovery; do not clear evidence simply because a response was an error. |
| Bills | `share-bill.ts` builds ordinary text/canvas receipts; `sale-detail.tsx` has ordinary void/returns. | Render verified, retained GST documents, original tax profiles and linked adjustments; correct tax-aware returns and settlements. |
| Suppliers | `supplier-field.tsx` and supplier screens use batch supplier names and name-based routes. | One canonical supplier directory with GSTIN/address/state, legacy-name linking and the same picker/editor in products and purchases. |
| Purchases | No purchase invoice, input-tax review, settlement or reconciliation screen/API adapter exists. | Implement the complete purchase lifecycle, including stock linking and recoverable mutations. |
| GST records/reporting | No web GST hub, number register, record checks, recovery, export history, period or turnover pages exist. | Add connected routes with actionable status, pagination and truthful error/partial states. |
| Languages | Web loads translations from the API and falls back to strings embedded in screens. | Integrate the new GST catalogs, named variables, error messages and locale-aware IST dates; retain bundled fallback when the API is unavailable. |

## Architecture decisions

1. Keep one backend and one set of shop records. Extend the existing web API client against the Hono routes already used by mobile; do not build a second GST database or a separate set of suppliers/customers.
2. Extract/version browser-safe contracts and pure helpers into an explicitly distributed shared package or generated vendored bundle. Mobile currently imports pure helpers from its sibling `server/src/lib` directory. A web production build must not depend on that checkout being adjacent on a developer's machine. Do not import database/auth/server-only modules into client bundles.
3. Reuse tax, decimal money, fiscal date, discount allocation, profile validation, canonical request, outcome verification and fiscal integrity logic. Separate platform adapters for browser storage, Web Crypto, files/downloads, print/PDF, visibility/network and authentication. Never copy Expo/React Native runtime dependencies into Next.js.
4. Audit actual backend permissions per operation. The existing coarse web permission flags are insufficient for owner-only declarations, manager tax authorization, cost visibility and helper access. Cache queries by shop and actor where required; reject delayed responses after account/shop changes.
5. Read capabilities from the live API. Setup availability and billing availability are separate. Keep retained records accessible when new issuance is unavailable. RSP, rounding grants, provider jobs and other advanced workflows must be gated by their real contracts and server availability.
6. Use IndexedDB transactions for financial journals, requests, confirmed receipts and invoice reservations. Use cross-tab coordination and a transactional fallback, not an expiring localStorage flag. Migrate any existing pending sale without discarding its original identity. Storage denial/quota failure must prevent issuance rather than pretend a bill was safely saved.
7. Preserve the filing boundary: exports prepare records for external filing. Checks, turnover reviews and period closure do not approve or file GST returns. Enforce the backend's supported supply rules instead of promising universal GST coverage.

## Connected web structure

Suggested routes (new unless noted):

- Existing `/shop/settings/payments`: Payments & bills, with collapsed summaries for UPI, bill details, GST setup, billing defaults and readiness.
- `/shop/settings/gst`: GST records & invoice numbers hub, with links to existing `/shop/sales` and the pages below.
- `/shop/settings/gst/checks`: saved-record checks and actionable issues.
- `/shop/settings/gst/recovery`: this browser's retained bills and uncertain financial requests.
- `/shop/settings/gst/numbers`: invoice number blocks, synchronized/unconfirmed numbers and expandable details.
- `/shop/settings/gst/devices`: billing installations, status and permitted revocation.
- `/shop/settings/gst/exports`: report preparation and exact saved-file history.
- `/shop/settings/gst/periods`: reporting period review/close/reopen with supporting exports.
- `/shop/settings/gst/turnover`: business turnover evidence and revision history.
- `/shop/products/gst`: bulk product tax review/import/export, linked from products and readiness.
- `/shop/purchases`, `/shop/purchases/new`, `/shop/purchases/[id]`: supplier invoices and purchase tax lifecycle.
- Existing `/shop/suppliers`: unified directory; add canonical-ID detail routing with compatibility for old name links.
- Conditional `/shop/settings/gst/providers`, `/shop/settings/gst/rounding`, and product RSP review routes: only when supported and relevant.
- Tax-aware credit/debit note creation/detail and customer collection/settlement review routes reached from the relevant sale/customer, not disconnected generic settings links.

Desktop design: use existing web saffron/dark tokens and components, concise status summaries, sortable/paginated tables, filters and focused side panels. Keep technical identifiers behind support details. Preserve responsive behavior and keyboard/focus accessibility. The existing web display font differs from mobile; resolve typography against the current brand references before introducing new GST-only styling.

## Implementation sequence

### 1. Contracts, permissions, capabilities and recovery foundation

- Add typed domain API modules for GST, purchases, billing parties, tax profiles and fiscal adjustments; preserve error code, request ID and capability metadata.
- Build the shared pure-helper distribution and reproducible version checks.
- Add browser storage/crypto/file adapters, scoped journals, verified outcomes, reservation lifecycle and recovery cache invalidation.
- Confirm production API host, Clerk JWT acceptance and CORS for the web origin. Read representative authenticated endpoints before calling any feature live-ready.
- Ensure failed/paused/partial reads remain distinguishable from empty or zero results.

Completion gate: both repos build with matching contracts; representative authenticated reads succeed; uncertain-response replay cannot duplicate a financial record; account/shop switches cannot show or submit another scope's records.

### 2. GST setup and product tax readiness

- Mirror create-shop GST setup, distinct defer action and clear registration explanations.
- Extend Payments & bills with registration, GSTIN/state validation, legal identity, reviewed structured address, effective date, pricing mode and supported billing explanation.
- Preserve active-registration change rules and owner approval/delegation where applicable.
- In product add/edit show buying price, buying discount and effective acquisition cost separately from selling-price GST. Carry taxable/exempt/nil/non-GST, HSN/SAC, reviewed rate and profile version.
- Show before-tax, GST and final selling price immediately. Suggest MRP from the customer-facing gross price only when automatic mode is selected; preserve manual MRP and enforce the gross-price boundary.
- Add profile history with actor/owner names, effective-date schedules/cancellation and authorized review controls.
- Add bulk review and JSON/CSV import/export, validation, selection limits, retained request/outcome recovery and product-specific errors.

Completion gate: web profile changes appear in mobile; prior invoices retain their original profiles; registration/category never silently supplies a product GST rate.

### 3. Unified customers, taxable checkout and bills

- Extend inventory/catalog/cart serialization so GST profiles survive loading, editing, refresh and draft migration.
- Use one customer chooser for personal and registered buyers, with optional GST identity/address fields and saved billing-party linkage. Keep the customer ledger connected to the selected buyer.
- Inherit price-entry mode from shop settings; show a concise explanation in the order summary rather than another prominent independent setup section.
- Calculate GST on selling prices after the supported discounts. Use shared projections for taxable/exempt mixtures and enforce registered-buyer/supply restrictions.
- Include GST context, profile versions, reviewed decisions, allocation identity, fiscal render version and any supported rounding evidence in issuance.
- Retain the request/reservation before sending; verify persisted outcome before clearing the cart or journal. An uncertain response must be recoverable after navigation/restart.
- Show retained invoice number, supplier/buyer identity, tax groups and payment split on the bill. Share/download/print from verified fiscal content, including multilingual wrapping and pagination; do not reconstruct old tax from current settings.
- Port tax-aware returns, credit/debit notes, value adjustments, collection attribution and settlements reachable from sale/customer details. Preserve originals and evidence.

Completion gate: matched test carts produce identical web/mobile/server totals and tax snapshots; response-loss and two-tab retries create one bill; bill/PDF/share agrees with the retained document; supported adjustments reconcile.

### 4. Unified suppliers and complete purchase workflow

- Merge canonical supplier identity with legacy batch-name usage; do not auto-merge two legal businesses just because their names resemble each other.
- Replace every product/batch/purchase supplier field with the same directory picker and add/edit form, offering GSTIN/legal identity/state/address. Enforce GSTIN checksum/state consistency with field-level feedback.
- Invoice entry: supplier and registration/document type → invoice date/number/place of supply → product lines, buying prices/discounts and reviewed tax → original-total comparison and confirmation.
- Offer receive new stock, link an existing batch or record invoice only. Make stock consequences explicit and prevent receiving the same stock twice.
- Purchase list: shared date/supplier filters, consistent IST ranges for invoices, totals and exports, pagination, recoverable loading errors and no false ₹0 summaries on failed reads.
- Purchase detail: retained supplier/recipient/tax snapshot, stock actions, input-tax eligibility review with evidence/conditions, acquisition-cost impact preview, supplier credit/return, payments/refunds and reversal history.
- Keep stable request IDs and recovery for supplier save, invoice record, tax review, return and settlement. Explain unresolved outcomes and permit verified retry/closure.

Completion gate: supplier saved from product creation is available in purchase entry and mobile; purchase saves/retries produce one invoice and correct stock/cost movements; credit/payment/reversal totals reconcile.

### 5. GST records, checks, numbering and recovery

- Hub summary: loading, unavailable, partial, attention and checked states; links to actual bills/credit notes and corrective workflows.
- Checks: run vs refresh saved results; last successful run; failed/skipped runs; incomplete profiles, missing documents, number conflicts, unbalanced sales and integrity issues. Use understandable issue descriptions and affected bill/product links. A failed or truncated run must never show all clear.
- Number register: paginate blocks/details, display expiry and synchronized vs unconfirmed counts accurately. Unconfirmed numbers are not automatically unused; never offer reuse/reclaim.
- Installations: show names where available, explain browser installation identity, heartbeat/last-seen limitations and supported revocation without implying already-issued bills disappear.
- Recovery: distinguish drafts, issued local bills, pending upload, uncertain financial requests, permanent errors and confirmed records. Show safe retry/outcome lookup and evidence export. No automatic replay/delete of ambiguous financial requests.

Completion gate: actionable issues open the correct records; offline/restart/account-switch and truncated-history cases retain accurate status; revocation and expiry block only the issuance paths specified by the backend.

### 6. Exports, period review, turnover and conditional tools

- Report selector with sales/purchases/invoice numbers, inclusive user-facing dates converted to backend exclusive IST boundaries where applicable, clear scope and preparation-only wording.
- Creation: stable request identity, observable progress and a confirmed saved-file result. History: correct type/date pagination, exact retained CSV download and content-hash verification, safe filenames and retry. Browser share/download cancellation must not delete the saved report.
- Display export summary/source warnings; link back to invoices, purchases or review issues rather than dead-end notices.
- Include supported credit-note reports with their true covered period, separate from other adjustments.
- Period close/reopen: required source exports, optimistic sequence/fingerprint checks, changed-since-close state, immutable review history and recoverable outcomes.
- Turnover: financial-year selection, required business-wide evidence, revisions, responsible user names and explicit distinctions from this shop's sales totals.
- Add provider, RSP and rounding workflows only under the corresponding capability. Ordinary products must not receive unrelated special-goods tools. Match supported mobile functions without claiming deferred backend functionality is enabled.

Completion gate: saved downloads match retained hashes; start/end-day records are included exactly once; related lists and totals share the same range; close/reopen and turnover response-loss retries preserve one outcome.

### 7. Localization, accessibility and release acceptance

- Share the English/GST language catalogs and preserve named interpolation variables. Cover every label, helper, validation/error, loading/empty state, action and bill/download label.
- Add bundled fallback and guarded language changes; use selected-locale dates in IST while preserving entered names, GSTINs/codes and monetary values.
- Test keyboard operation, focus after panels/errors, readable table-to-card layouts, long Indic text and browser download/print support.
- Validate owner/manager/helper behavior and denied routes directly, not only hidden links.
- Run web TypeScript/build and meaningful shared-contract/browser tests. Compare persisted records through both clients and authenticate against a staging shop before any production write tests.
- Deployment is a separate final step: publish the approved web code, verify its API/schema/capability compatibility and rerun critical live reads and an authorized test-shop transaction. No mobile rebuild is required solely for adding web UI, unless shared extraction changes mobile behavior.

## Minimum acceptance matrix

| Journey | Required cases |
| --- | --- |
| Setup | Deferred, unregistered, regular, composition; invalid GSTIN/state/address; unavailable issuance; support-reviewed active changes. |
| Pricing | Inclusive and exclusive; selling price distinct from discounted buying cost; taxable/exempt/nil/non-GST; manual/automatic MRP; line and bill discounts; fractional quantities. |
| Buyer | Walk-in, saved customer, newly created customer, registered buyer, unsupported supply; buyer and ledger remain linked. |
| Issuance/recovery | Successful response, lost response, 4xx/5xx, refresh, tab close/reopen, two tabs, shop/account switch, storage failure, revoked/expired reservation. |
| Documents/adjustments | Historical profile change, retained hash mismatch, unsupported render version, long PDF, return/restock, credit/debit notes and collection settlement. |
| Purchases | All supported supplier registrations/document types; new stock/existing batch/invoice-only; total mismatch; ITC deferred/eligible/ineligible; return, credit, payment, refund, reversal and retry. |
| Reports/checks | Empty vs failed reads; pagination/partial status; IST boundaries; exact hash download; mixed credit report; changed closed period; named actors. |
| Cross-client/languages | Web-created records reopen on mobile and vice versa; all supported languages and offline catalog fallback; native speaker review remains a separate wording acceptance step. |

## Working references

Web: `app/lib/shop/{api,types,cart,share-bill,permissions}.ts`, `app/components/shop/{supplier-field,customer-attach,providers}.tsx`, existing `screens/{onboarding,payments,product-form,checkout,sale-detail,suppliers,supplier-detail}.tsx` and `app/shop/shop.css`.

Mobile: `app/(modals)/{pos-settings,add-product,gst-health,gst-monitor,gst-allocations,gst-recovery,gst-exports,gst-periods,gst-turnover,gst-catalog,gst-supplier,purchases,purchase-new,purchase-detail,supplier-detail,sale-detail,sale-return}.tsx`, fiscal adjustment/review screens, `src/api/{gst,purchases,sales,inventory,pos-settings}.ts`, `src/lib/pos/`, GST controls and the new localization bundle.

Backend: `server/src/lib/{gst,purchase-gst,gst-core-capabilities,fiscal-date}.ts` and related pure fiscal/outcome contracts; `server/src/routes/{pos-settings,purchases,gst-exports}.ts` plus sales/inventory/party/adjustment routes. Determine permission/capability details from these current routes when implementing each operation.


## Parity continuation — 8 October 2026

Implemented in the isolated `codex/gst-web-parity-completion` worktree:

- Coherent, complete tax/RSP timelines after catalog pagination; checkout refresh and exact issue-time checks, including scheduled boundaries and account/shop scope.
- Reviewed RSP package inputs and mixed-cart projections, reviewed proportional discounts, actual reservation-time package evidence, and mixed-sale receipt replay.
- Current rounding selection, durable authenticated grant requests, grant scope/expiry/version checks, recomputation of final payable/tenders, immutable rounding evidence, and rounded-sale receipt verification.
- Mixed/RSP/rounded invoice and credit-note renderers that replay retained fiscal contracts. Unknown, inconsistent and tampered formats fail closed. Printing isolates the selected document in an A4 frame, with repeating table headings and row-break protection.
- Mixed and rounded returns use original retained documents plus cumulative credit history. Rounded returns preserve original rounding residuals and determine credit reduction/refund; unsupported value corrections are hidden for special invoices.
- New UI labels added to every bundled web language catalog.

Validation: production build/type check, shared-contract drift checks and browser journal tests; added synthetic browser tests for RSP quantities, scope checks, mixed projections, nested rounded documents/credits, cumulative return history, rehashed mathematical tampering, unknown formats and selected-document HTML.

The supplier filter remains list-only because this is also the mobile/backend contract. Totals and exports are explicitly shop-wide; supplier-specific reports are an additional cross-platform feature, not an unimplemented web equivalent. Government filing, e-invoice submission and provider activation remain outside both clients' supported billing scope.

Authenticated release acceptance and available capability checks are recorded in `docs/gst-web-parity-acceptance-20261008.md`. Source parity does not by itself establish native or browser end-to-end acceptance.
