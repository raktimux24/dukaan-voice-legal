# Mobile / web feature parity audit — 9 October 2026

## Verdict

**Complete parity is not established, and confirmed implementation gaps remain.** The web now covers most core shop and GST workflows, but screen presence, shared calculations and passing tests do not establish full functional or experience parity.

Reference mobile/server commit: `0bc6c124a4e3ae415530ce93c0b9297942373abb`.
Reference web commit: `69d35c01df57d8a6b2fca532f50bb1f607f81358`. Netlify reports this exact production commit ready/published on 8 October, 19:32 IST.

This is a read-only audit. No invoices, payments, returns, registration, permissions or preferences were changed.

## Scope and verification

- Compared current mobile routes, API clients, permissions, offline adapters and key screens with the current web implementation.
- Re-ran all web GST tests and verified all 58 vendored contracts against the current mobile/server source, not just the vendored manifest.
- Re-ran translation tests: 1113 catalog labels, nine translated languages plus English, scripts and placeholders. TypeScript passed.
- Authenticated live web inspection: Sell, Settings, GST records hub, record checks, purchases and export preparation/history, using the user-approved Suresh Stationary Store test shop.
- Did not run fresh mobile write/readback transactions, role changes, offline restart or device/print acceptance in this audit. Earlier test-shop transaction evidence is in `gst-web-parity-acceptance-20261008.md`; it remains historical acceptance, not a new run.

## Feature comparison

| Area | Current status | Boundary |
|---|---|---|
| Account, shop create/join/switch | Present on both | Cold-start offline shop restoration differs. |
| Products, batches, stock adjustments, categories, units/packs | Broad implementation coverage | Not every role, expiry and stock lifecycle re-tested live. |
| Sell / cart / camera barcode | Present on both | Web also supports keyboard/USB scanner; voice entry remains absent. |
| Checkout: cash/change, UPI, card, credit, split, discounts | Present on both | Recovery exists, but native offline issuance is not fully mirrored. |
| Customer / GST buyer identity and ledger | Present on both | Full cross-client settlement matrix remains unverified. |
| Unified suppliers / GST identity | Present on both | Prior synthetic supplier persistence accepted; all lifecycle variants unverified. |
| GST registration and pricing / product tax / automatic MRP | Present on both | Owner-to-manager tax authorization management is missing on web. |
| Tax history, schedules, bulk review and file import/export | Present on both | Shared validation verified; all live conflict/retry cases not re-run. |
| Bills, retained documents, credit/debit notes and returns | Present on both | Sales discovery is incomplete; physical print/PDF acceptance remains open. |
| Supplier invoices, stock linking, input tax, credits and payments | Screens/API flows present | Current live purchase list shows WQA-261008-01, gross 10.50 and tax 0.50; stock receipt, ITC, refund and reversal lifecycle acceptance remains open. |
| GST checks, numbers, installations and recovery | Present on both | Checks/numbering do not approve or file returns; offline recovery depth differs. |
| GST exports / periods / turnover | Present on both | Earlier saved purchase CSV accepted; full close/reopen/turnover conflict and cross-client cases remain open. |
| RSP / mixed GST / payable rounding | Implemented and capability gated | Pure calculations/render/retry tests pass; eligible Regular GST live issuance still not accepted. |
| Sales/stock reports and text questions | Present on both | Audio questions/responses absent on web. |
| Daily brief / alerts / predictions | Present on both | Web lacks brief audio and native push delivery. |
| Languages / text size / contrast | Same ten language choices and bundled catalogs | Some messages bypass localization; shared dates still force English/browser timezone. |
| Staff, subscription and account management | Present on both | GST manager delegation control missing on web. |

## Confirmed gaps and recommended fixes

### 1. Missing GST manager authorization management — high priority

Mobile Staff management offers owner controls to authorize/revoke a manager's product GST confirmation, reads existing authorization and uses membership/event concurrency guards. Web Staff management offers ordinary role changes/removal but has no equivalent endpoint integration or controls.

Evidence:
- Mobile `app/(modals)/staff-manage.tsx:195` and `src/api/product-tax-authorization.ts:3`.
- Web `app/components/shop/screens/staff.tsx:80`; no `gst-product-confirmation-authorizations` endpoint anywhere in the web API adapters.

Impact: an owner cannot complete the same GST delegation workflow from web. A manager may remain unable to confirm tax details until the owner uses mobile. This is a missing management feature, not evidence of a permission bypass.

Fix: port owner-only authorization status/actions, exact membership/event guards, conflict handling, invalidation and translated feedback. Verify both grant/revoke and denied-role behavior.

### 2. Incomplete Sales discovery — high priority

Web requests only 50 bills and never consumes `hasMore` or exposes pagination. It prints `saleNumber`, not the retained GST `invoiceNumber`. Mobile uses infinite sales pagination and has completed/voided filters absent on web.

Evidence:
- Web `screens/sales.tsx:37`, `:109`; complete screen has no next-page control.
- Mobile `src/hooks/useSales.ts:15` and `app/(tabs)/sales.tsx:35`.

Impact: bills outside the first page cannot be reached through the list; the visible number may differ from the issued GST document number.

Fix: server-backed pagination with filters applied before pagination; retained invoice-number display with ordinary sale-number fallback; completed/voided filter parity and stable date/search behavior. Accept with more than 50 records.

### 3. Missing shop-wide refunds register — high priority

Web can return items from a sale and show that sale's refunds, but has no equivalent to mobile's dedicated Refunds screen/API integration. Mobile provides period filters, totals, method split and paginated original-bill links.

Evidence:
- Mobile `app/(modals)/refunds.tsx:24`, `src/api/sales.ts:52` and `/sales/refunds` endpoint.
- Web has no refunds route or `/sales/refunds` adapter; existing return actions are in sale detail/GST adjustments.

Fix: add a Refunds register reached from Sales, using the same summary and pagination contracts, with original bill and adjustment links.

### 4. Offline operation is not equivalent — high priority if web must run the counter offline

Native has persisted shop context, reduced offline permissions, cached tax/allocation evidence and locally retained fiscal issuance. Web retains pending requests/drafts and recovery journals, but requires a network shop load after cold start. For a new Regular GST sale, web issuance unconditionally fetches the current tax snapshot and POS settings before reserving/issuing; it cannot mirror native issuance from previously validated offline evidence.

Evidence:
- Mobile `src/store/authStore.ts:187`, `src/lib/permissions.ts:18`, `src/lib/pos/gst-reservation.ts:62`.
- Web `providers.tsx:49`, `:169` and `gst-issuance.ts:115`, `:120`.

Impact: retaining a request is useful recovery, but is not the same as opening the app after an offline restart and issuing a valid locally retained GST bill. The web's “bill is saved” copy should distinguish a saved request from an issued fiscal document.

Fix: define required browser offline scope; implement guarded shop/catalog context restoration and local issuance only from valid reserved evidence, with expiry/revocation/scope restrictions and truthful states. Test cold restart, lost response and storage denial.

### 5. Localization is not fully wired — medium priority

The catalogs and ten language choices match, but some call sites bypass translation. Web checkout prints literal `Sending…` / `Send bill now` despite translated entries existing, and builds an English credit-balance paragraph. Camera failures and native confirmation dialogs also print English directly. The translation test checks catalog completeness and literal JSX text nodes; it misses literals inside expressions, callbacks and template strings.

Evidence:
- `screens/checkout.tsx:283`, `:292`.
- `screens/sell.tsx:608`, `:623`, `:634`.
- `screens/settings.tsx:135`, `:152`, `:157`.
- `scripts/test-translations.mjs:47`.

Fix: explicit translation calls and named interpolation for these messages; broaden static checks to user-visible expressions/dialogs and add state-based language tests. Human wording review is separate from automated coverage.

The previous release report's “missing translations fixed” should be read as catalog/main-screen coverage, not proof that every runtime message is translated.

### 6. Shared date/time display still ignores language and IST — medium priority

`money.ts` formats dates in `en-IN` with no explicit timezone. Many ordinary sales/activity/purchase display call sites use it. GST-specific date adapters already use locale/IST; the ordinary shared formatters do not.

Evidence: `app/lib/shop/money.ts:12`, `:23`, `:30`.

Fix: one selected-locale, explicit-IST date/time service; preserve actual timestamps and fiscal period conversions. Test browsers in another timezone and Indic languages.

### 7. Voice/audio remains mobile-only — scope decision

Native supports spoken inventory/sales commands, confirmation/TTS, spoken analytics and daily-brief audio. Web implements manual/scanned selling and text analytics; web analytics explicitly disables voice feedback, and Brief has no audio control.

Evidence:
- Mobile `src/api/voice.ts`, `app/(tabs)/sell.tsx:267`, `app/(modals)/analytics.tsx:236`, `app/(modals)/daily-brief.tsx:36`.
- Web `app/lib/shop/api.ts:415` and `screens/brief.tsx`.

The original web plan explicitly says “Voice stays on the phone.” This is a deliberate scope difference, but it means literal whole-app feature parity is false. Decide whether to preserve this distinction or port voice/audio with permissions, languages and confirmation safety.

### 8. Notification delivery remains different — scope decision

Web has an in-app alerts page and can change the daily recap preference; its own hint says recap is sent to the phone. Native registers push tokens and handles notification navigation. Web has no browser push/service-worker delivery integration.

Evidence: mobile `app/_layout.tsx:252`, `src/api/devices.ts`; web `screens/settings.tsx:103`, `screens/alerts.tsx`.

Fix only if browser delivery is a product requirement; an in-app alerts page does not replace background push.

### 9. Exports can silently truncate — medium priority

Web inventory/buy-list/audit helpers stop at fixed caps. For example `getAllAudit` stops at offset 5000 while `hasMore` may remain true, returning rows without a completeness flag; Settings downloads that as Activity CSV. This is a completeness defect even if not unique to web.

Evidence: `app/lib/shop/api.ts:445`, `screens/settings.tsx:119`.

Fix: paginate to completion or use a server export contract; otherwise disclose partial coverage and disable misleading “all” exports. Large-shop validation needed.

## Acceptance still outstanding (not proven missing implementation)

1. Web-created records reopened on native and native-created records reopened on web, including tax history and settlements.
2. Owner, authorized/unauthorized manager and helper through direct routes and server denials.
3. Regular GST, registered buyer, mixed/RSP and payable-rounding live billing on an eligible reviewed test shop. Current shared test shop is Composition.
4. Purchase stock receipt/existing-batch/invoice-only, ITC decisions, credits, payments, refunds and reversals with reload/outcome recovery.
5. Two tabs, account/shop switch, refresh/restart, response loss, allocation expiry/revocation and storage failure in actual browsers.
6. Long multi-page multilingual bill/credit PDF and physical printing.
7. All ten languages across errors, empty/loading states, dialogs, keyboards and narrow layouts, plus native-speaker copy review.

## Recommended sequence

1. Close missing manager GST delegation, Sales pagination/number/filter parity and refunds register.
2. Finish runtime localization and shared date formatting; strengthen coverage tests.
3. Set explicit product scope for offline counter, voice/audio and browser notifications, then implement required differences.
4. Run the cross-client acceptance matrix above before claiming complete parity.

Government filing/e-invoice submission/provider activation and supplier-specific reconciliation exports are not currently supported cross-platform features. They must not be counted as web-only omissions or implied to be enabled by these GST screens.

## Implementation follow-up — 9 October 2026

The baseline findings above describe production commit `69d35c0`. On branch `codex/full-mobile-web-parity`, the following changes are now implemented:

- Owner-only manager product-tax authorization status and grant/revoke controls with membership/event guards and authorization refresh after role changes.
- Sales pagination, server-backed completed/voided filters and retained invoice-number display.
- A paginated refunds register reached from Sales, with period summaries, payment methods and original bill links.
- Inventory, buy-list and activity collection continues to completion; stalled endpoints and network failures reject instead of silently downloading a partial result.
- Shared dates on the main shop screens use selected-language formatting and explicit IST; GST dates share the same service.
- Checkout resend controls use translated labels; credit customer identity uses translated labels and preserves the customer's name.

Validation: TypeScript, Next production build, translation coverage and GST regression suite passed. Added tests cover API paths/filters/guards and denied/conflicting responses, 6107-row collection, short pages, stalled pagination, network failure, ten date locales and midnight IST under foreign timezones. These API tests use mocked transport; they do not prove authenticated role behavior. Rendered UI and fresh cross-client transactions remain acceptance gates. Changes are not a claim of full parity: offline issuance, voice/audio, browser push, remaining runtime localization and the acceptance matrix above still require work.

### Audio implementation follow-up

Reports now accepts microphone recordings through the existing analytics voice endpoint, preserves the transcript for editing, and exposes spoken answers when voice feedback is enabled. Daily brief now offers the existing Premium brief-audio endpoint. Capture supports browser-selected WebM/MP4/Ogg formats, stops after 30 seconds, and releases microphone tracks on cancel, errors, unmount or account/shop change. Late responses are scoped to the originating account/shop/preferences. Audio uses explicit playback controls.

Automated tests cover MIME/base64 encoding, recording timeout, cancellation, permission denial, a permission promise resolving after navigation, request paths and speech preference flags. TypeScript, translation and GST tests passed. The Netlify preview is ready, but Clerk production keys reject its hostname, preventing authenticated rendered acceptance there. These changes do not yet implement spoken stock mutations or sale-to-cart flow, and real speech recognition/playback acceptance remains open.

### Voice counter implementation follow-up

The web now has an explicit voice command review screen reached from Home and Sell. Recognition uses the existing server process endpoint; stock writes require an explicit confirmation, and sale lines enter the cart for normal checkout rather than completing a sale by voice. Product matching, quantities, current stock and prices are validated before an atomic cart write. Customer matches and payment hints carry into checkout. Account/shop/language changes discard the originating session.

Stock attempts cannot replay after a pending, failed or unknown outcome. A known successful stock update can be reused if cart handoff fails, allowing a cart-only retry. Edited quantities and products clear stale spoken-unit conversion fields so server conversion cannot override the user's correction. Empty recognition offers a retry message. Recovery copy is bundled in all ten languages.

Regression tests cover duplicate lines, product/shop scope, unit mismatch, stock and price checks, tax snapshot preservation, cart atomicity, concurrent confirmation, lost responses, partial outcomes, cart retry without repeated stock mutation, and process/confirm API payloads. Real microphone recognition, stock changes and voice checkout remain authenticated acceptance gates; automated tests do not prove those flows. The deployed refunds register was observed in Suresh Stationary Store with its existing return, cash summary and original bill link.

### Offline routing and recovery follow-up

The web now retains a minimal routing snapshot for the last verified shop, bound to the authenticated actor and Clerk login session with a seven-day expiry. Only transient connection failures may restore it; auth, membership, validation and rate-limit failures do not. Cached context excludes invites, addresses, member details and tax configuration. Restored routing reduces permissions to billing only, matching native offline restrictions. Storage refusal does not break online routing. A session change recreates the query client and workspace; obsolete refresh responses cannot restore an earlier context. Sign-out and known membership removal clear the routing snapshot. Reconnection refreshes authoritative shop data.

An offline banner links directly to device recovery. Its local journal query uses an always-available network mode, so TanStack does not pause browser-storage reads when disconnected. Server replay stays disabled in restored mode. Tests cover actor/session mismatch, expiry/future timestamps, invalid roles, owner consistency, minimal persistence, denied/readback-failed storage, network-only fallback and reduced permissions. Production build, translation coverage and GST regression suite passed.

This is the routing/recovery foundation, not complete offline parity. Offline navigation shell loading and Clerk bootstrapping, persistent catalog/POS/tax evidence, local fiscal document issuance from valid allocations, and disconnected restart/device acceptance remain to implement and verify. No new offline GST issuance is claimed by this tranche.

### Offline catalog and billing evidence follow-up

Catalog, POS settings and tax-snapshot reads now retain complete responses in browser storage, bound to actor, Clerk session and shop. Retained catalogs redact purchase costs. Cache restoration requires a transient connection failure, validated shape/scope, matching content hash and a seven-day maximum age. Auth failures invalidate the corresponding cache instead of restoring it. A successful settings write is preceded by invalidation so response loss cannot revive the old POS settings. Storage refusal preserves online behavior; late loads/writes cannot publish data after a scope change.

Sell and Checkout can run these read-through queries while TanStack considers the browser offline. A restored read activates the offline banner and reduced permissions. Checkout may select a subset from one complete retained tax snapshot; it does not combine independently captured product timelines or invent a missing product profile. Existing effective-date and tax-profile checks still run.

Tests cover scoped and complete catalog retention, purchase-cost redaction, tax subset provenance, missing products, session separation, expired/tampered data, auth rejection, storage refusal and late response/write invalidation. Production build, TypeScript, translation coverage and the GST suite passed. This does not yet prove disconnected browser acceptance or enable complete offline issuance: navigation shell/Clerk bootstrapping, retained entitlement and UI preferences, signed rounding capabilities, local fiscal render/receipt states and the acceptance matrix remain open.


### Offline entitlement and account preferences follow-up

The counter retains minimal subscription evidence without mandate identifiers or invoice URLs. Paid/trial access expires at its authoritative end date; the explicit temporary Premium server grant remains respected. Retained access has a seven-day maximum lifetime. The UI reassesses expiry on timers and tab resume, and credit checkout checks the current deadline at charge time. Cash/UPI sales retain the same free-access behavior as mobile.

Language, text size and other preferences use one actor/session-bound account cache across shops. A preference mutation invalidates it before sending, including lost responses; leaving the login session prevents cached reads. The validator accepts the server's extra_large text size. Tests cover exact paid/trial and cache expiry, temporary grants, private billing redaction, retained Bengali preferences and mutation invalidation. Full browser offline boot and local fiscal issuance remain open.


### Retained rounding selection follow-up

Checkout and issuance may read a retained, hashed rounding selection during a transient outage. Reuse is bounded to the interval beginning at the server-selected timestamp and ending before its refresh boundary, including policy effective-until. Wrong-shop, future, expired and malformed selections are rejected. The selection remains preview evidence: local issuance still requires the separate allocation/actor/device/policy-bound grant and its original issue-time checks. A settings update or authorization denial invalidates the retained selection. This closes a read dependency; locally issued receipt rendering and disconnected acceptance remain open.


### Checkout recovery state follow-up

Checkout now verifies its local-storage write before charging or claiming saved recovery state. Silent storage refusal preserves the original request and stops the attempt. Connection-loss copy distinguishes the saved checkout request from a server-confirmed invoice and states that retries preserve request identity. The wording is bundled in all ten supported languages. Only recognized transport failures trigger automatic reconnect retries; arbitrary TypeErrors no longer become misleading offline-save messages. This does not substitute for the remaining local fiscal receipt/issuance implementation.


### Locally retained fiscal receipts follow-up

Registered GST checkout now constructs a fiscal receipt from the issued request and commits it with the advanced allocation counter in the same IndexedDB transaction. It supports ordinary Regular GST, Composition bills of supply, mixed/RSP and rounded receipts; rounded receipts require the original allocation/actor/device/policy-bound grant. Replay verifies the outer document hash, tax/rounding totals, payment settlement and exact canonical request identity. It uses the original settings, product details, issue instant and invoice number, never refreshed catalog data.

After a transport failure following reservation, checkout opens the local bill. Recovery offers the same receipt after reload and, after successful synchronization, links to the confirmed server bill. Local receipt downloads/prints carry pending synchronization wording. Legacy unissued requests remain requests and do not gain fabricated invoice numbers. New copy is bundled for all ten languages.

Tests cover ordinary GST, Composition, mixed/RSP and rounded totals, altered request/document rejection, actor/shop isolation, missing/mismatched grants, atomic retention after lost response, no allocation reuse on replay and original receipt preservation after confirmation. Browser rendering and actual disconnected restart acceptance remain to verify. Complete offline shell/Clerk boot, allocation prewarming, multiple queued issuance with local stock reconciliation, notifications, runtime localization and the broader acceptance matrix remain open.

### Report and export date localization follow-up

Report charts and expiry labels now use the selected app language and Indian Standard Time. Inventory and activity CSV dates receive the same language from all export entry points, rather than browser-local English dates. Currency and machine-facing CSV column names retain their existing formats.

### Offline invoice preparation follow-up

The Sell page now prepares number reservations and scoped rounding grants online before checkout. Preparation shares checkout financial locking, preserves the next number, and retries a lost grant response with its original identity. It does not issue a bill or establish complete offline readiness: retained catalog/tax data, capability expiry and live offline acceptance still apply.

### Queued local GST bills and stock reconciliation follow-up

Verified locally issued GST bills may now queue consecutively. Catalog snapshots record the confirmations included before their server read; later local receipts reserve quantities against that baseline, including confirmations not yet reflected in a newer catalog. Checkout rechecks aggregate stock under the actor/shop invoice lock before consuming a number. Reconnection replays only original verified local sale requests in order; unsupported or uncertain legacy requests remain for manual recovery. Cached stock remains a device estimate and cannot prove stock on other disconnected devices. Cold-start offline shell and live multi-tab/reconnect acceptance remain open.

### Runtime confirmation localization follow-up

Browser prompts for clearing a cart, removing staff, leaving/deleting a shop and archiving products now reuse mobile translation keys and interpolation. Account-deletion prompts and the second-confirmation notice have all ten language entries. This removes literal English from these runtime dialogs; destructive actions have not been executed as part of localization validation. Dynamic errors and full native-speaker/browser acceptance remain separate open checks.


### Dynamic stock and product notices

Cart addition now returns stable stock outcome codes instead of constructing English sentences. Sell and product detail choose the same translated out-of-stock/capped templates as mobile, then insert the original product name, quantity and localized unit. Product creation and buy-list notices also reuse mobile keys. Translation tests exercise the four templates with product data in all ten languages and check for unresolved placeholders. Production build and the GST regression suite passed; this is not full runtime/native-speaker language acceptance.


### Ordinary locally retained bills

Web now retains ordinary non-GST receipts before upload, using the exact original request, payment splits, discounts, note and timestamp. These receipts use mobile's short local reference rather than claiming an allocated fiscal or server bill number. Checkout can show and restore them inline after a connection failure, recovery can reopen/print them, local catalog projection reserves their stock, and reconnect replays their original request IDs. Fresh ordinary issuance validates the retained/live POS registration and stock under the same financial lock; registered shops cannot bypass their GST workflow. Legacy requests without verified local receipts still require manual recovery. Tests cover totals, tampered/scope-mismatched receipts, two consecutive lost responses, no fiscal-number consumption, stock exhaustion and original reconnect replay. Build, translation coverage and GST suite passed. Cold disconnected shell/Clerk bootstrap and authenticated disconnected browser acceptance remain open. Ordinary local display uses the original request's customer data when present; existing-customer display metadata and server-assigned bill number are available after confirmation in the server bill.


### Billing shell and token-offline transport

Clerk's actual `ClerkOfflineError` is now recognized as an offline transport failure through its SDK type guard; generic errors bearing only that code, session denials and authorization responses do not restore cached data. A same-origin service worker warms Sell, Checkout and Device bill recovery HTML plus their explicit scripts, styles and fonts. It does not cache APIs, auth traffic, RSC responses, queried pages, arbitrary navigation or private transaction responses. Offline links and checkout redirects to those three routes use full cached document navigation, avoiding reuse of incompatible RSC router state. Resource/HTML warm-up is optional; failed storage cannot break connected asset loading. Signing out clears the shell cache, and actor/session evidence restrictions still apply independently. Regression tests cover complete/incomplete warming, cache misses, offline/transient navigation fallback, preservation of 401/403 responses, private-path/query exclusions, storage denial and origin-scoped clearing. Build, translations and GST suite passed. This fixes shell loading and token fallback, but cold Clerk SDK authentication bootstrap is still unproven and must pass a real disconnected browser restart before full offline parity can be accepted.

### Existing customer names on local receipts

New checkout requests now retain the selected saved customer's name and phone alongside customerId. The server's existing resolver returns the scoped customerId before considering the display snapshot, so this does not create or edit a customer. Ordinary local receipt reconstruction therefore retains readable customer details after storage/restart. Legacy pending requests with customerId and null customer keep that exact original field on retry; they are not rewritten or given new request hashes. Tests cover selected/draft/blank customers, legacy retry preservation, serialized receipt reconstruction, altered name and changed customerId rejection. Web build and GST suite passed; authenticated disconnected receipt rendering remains an acceptance check.

### GST record-check result parity follow-up

The web screen now uses the native monitor-state rules and actionable core issue kinds. It shows checked-document coverage and an explicit empty-current-result message; failed refreshes preserve prior results without declaring success. Issue truncation offers increased observation loading up to the server's 10,000 limit, while history truncation stays separate. Prior checks and optional support-copy diagnostics remain accessible. Async check and document lookup results are guarded against account/shop changes.

Validation: production build, GST regression suite (including monitor complete/attention/partial/stale/never-checked/offline/unavailable states), and translation coverage passed. Live rendering verification follows release. This does not close the remaining authenticated offline, role, Regular GST, cross-client purchase, notification, or print acceptance gaps.

### Purchase navigation and retained detail follow-up

A fresh authenticated mobile/web comparison reopened WQA-261008-01 on both clients with matching supplier, invoice total 10.50 and purchase tax 0.50. This establishes that existing web-created invoice readback, not the complete purchase lifecycle.

The web purchase overview now mirrors the native saved-request recovery entry, current/previous-month shortcuts, purchase export-history entry and combined records/totals refresh. Its optional accounting section exposes all native reconciliation fields, including opening/closing payable/recoverable balances, recorded payments/refunds, acquisition value and inventory/consumed cost changes. Invoice rows expose retained purchase tax. Supplier invoice detail exposes original registration/document kind, component tax, reviewed delivery evidence and the preserved supplier/recipient identity and structured addresses, using snapshot data rather than current directory identities.

Build, GST regressions, translation coverage and diff validation passed. No financial records, supplier identities, role permissions or registration were changed in this comparison. Production rendering/navigation verification follows release. Live write/recovery/ITC/settlement/return/reversal and cross-client mutation acceptance remain open.

The same comparison exposed a purchase-review mismatch: web offered reviewed eligibility for a Composition recipient and permitted save while the cost preview was unavailable. The selector now follows native's regular-recipient/regular-supplier restriction; save requires a successful current cost preview. Native eligibility/cost-impact guidance is reused from the language catalogs. Backend eligibility validation remains authoritative.

### Live purchase review and retained export acceptance

Production deploy `6ac91e1bc4ea700008964af2` was ready and published at 2026-10-09T17:03:23.514Z for main `2d0f5f77ca10ecd28de0cff8bdfda7ed4bd3d32d`.

On the approved test-only Suresh Stationary Store, WQA-261008-01 displayed original Regular GST supplier/Tax invoice, net 10.00, CGST 0.25, SGST 0.25, supplier and recipient identity/address snapshots. Its Composition recipient could select only deferred or ineligible, with save disabled until evidence/note and successful cost preview were available.

An ineligible review was saved for this existing synthetic, invoice-only fixture with note `Synthetic parity review: Composition recipient; no credit claimed.` and reference `WQA-261008-01 acceptance review`. Web retained it after reload; native's retained review/correction history independently displayed the same decision, note and reference, timestamp 9 Oct 2026 at 10:38 PM IST. The overview's unreviewed count changed to zero. No stock receipt, money transfer, registration change or credit claim was performed.

September 1–30 filtering produced empty invoice results and zero period totals; restoring October 1–9 restored this invoice, purchases 10.50 and tax 0.50. Combined refresh disabled while fetching and recovered. Accounting details showed closing payable 10.50, no payments/refunds, no reviewed credit, no cost changes and current unreviewed tax zero. Purchase export-history navigation selected Purchases and preserved October 1–9.

A purchase register was prepared and persisted in history. Downloaded CSV `e845d8c5-360b-4a6b-b33b-a9e549d5ee99` contained the supplier invoice and ineligible review with zero ITC movement and retained identity details. A fresh reload and history download produced exactly the same 3416 bytes, SHA-256 `099905b1f3be637814de3668a51174536281b42f427287754ddd6451280b03f9`. Report details showed one invoice, zero credit notes, total 10.50 and tax 0.50. Screenshot evidence: `/private/tmp/gst-purchase-export-accepted-20261009.jpg`.

This accepts this purchase review write/readback and small retained-export path. It does not establish stock-receipt/linking, eligible ITC, payment/refund/reversal/return lifecycle, large reports, offline recovery or the complete permissions/concurrency matrix.

The same live test exposed export-operation UX gaps: selector changes were possible during an operation, the retained download button remained enabled during its own request, and report preparation wording was shown while downloading. The follow-up disables selectors/download re-entry during operations and limits preparation wording to preparation. Invoice-number snapshots no longer depend on hidden date-field validity; period-based and credit-note reports retain their range validation.

### Purchase correction draft parity

Export-operation follow-up PR57 was published at 2026-10-09T17:19:52.051Z, Netlify deploy `6ac921e2d2e77d00082cf414`, main `5b2aa62689422b10bd58e88922ff61fd20450a83`.

Comparison with native purchase-detail exposed another functional mismatch: web reused review note/reference and effective date across ITC, settlement, supplier credit and reversal. This could carry evidence from an unrelated workflow. Native maintains independent drafts and clears successful settlement/credit/correction drafts.

Web now follows that separation. Choosing Correct entry opens a dedicated original-entry correction form with fresh date, reason and evidence. Reversal validation uses the selected settlement's date rather than only the purchase date, rejects missing/already-reversed entries, and preserves the original payload on uncertain retries. Settlement rows use localized payment/refund/reversal labels. Successful payment, credit and correction writes reset their own drafts without clearing unrelated work.

Supplier credits expose stock removal only for linked batches, defaulting to removal for those batches as native does. Fully returned lines are hidden. Nonblank invalid/nonpositive quantities cannot be silently omitted alongside valid lines, over-returns are rejected, and credit document numbers follow the native character/length constraints. This implementation still requires live settlement/refund/reversal and linked-stock acceptance; it is not a claim that those acceptance gates are closed.

### Live invoice-only purchase correction acceptance

PR58 production deploy `6ac9235c0d227c0008801cbc` published at 2026-10-09T17:26:18.067Z, commit `9f882be66351d8a3d005fdc4a67d5ef112d8f2f1`.

The existing approved synthetic WQA-261008-01 fixture completed these web writes, all explicitly labeled synthetic with no actual money transfer or goods movement:

- A 1.00 payment reduced outstanding from 10.50 to 9.50. Dedicated correction restored 10.50; both entries persisted after reload and appeared on mobile.
- A 10.50 payment settled outstanding. Supplier credit WQA-CR-1009 returned 0.5 of the invoice-only quantity without stock removal and created recoverable 5.25.
- A 5.25 supplier refund settled recoverable. Correcting that refund restored recoverable 5.25; correcting the dependent 10.50 payment then yielded outstanding 5.25, recoverable zero.
- All six settlement/correction entries persisted after reload and independently appeared on native with the same amounts, dates, Cash method and evidence references. Native purchase overview showed purchases after credits 5.25 and purchase tax after credits 0.24. Web retained credit/review history displayed WQA-CR-1009 with 5.25. No actual payment/refund occurred; stock was not received or removed.

Payment and correction drafts reset after success. Opening the credit form after entering payment evidence left its evidence field blank. Invoice-only return lines had no stock-removal control. Browser console error inspection returned no errors. Screenshot: `/private/tmp/purchase-lifecycle-accepted-20261009.jpg`.

This closes the successful invoice-only partial-credit, payment/refund and dependent-reversal readback path for this fixture. Linked-stock receive/link/remove, eligible ITC, concurrency, response-loss/retry and opposite-direction native writes remain acceptance gates.

The live lifecycle exposed raw `settled` / `supplier_owes` status strings on web. They now map to existing translated customer-facing wording; settlement history includes localized payment method as native does. Build and translation coverage passed.


### Linked-stock purchase and partial-tax rounding follow-up

The approved synthetic WQA-ST-1009 invoice received one Camlin pencil unit into batch WQA-ST-1009. Web inventory changed from 13 to 14. Full supplier credit WQA-ST-CR1009 removed that unit and restored inventory to 13, with outstanding and recoverable both zero. This test moved only the synthetic stock quantity and made no actual payment. Native independently displayed WQA-ST-1009, the same original totals, Stock received with this invoice, and credit WQA-ST-CR1009 with minus 10.50 and the same synthetic-return reason. This accepts received-stock invoice and full-credit readback; independent native inventory quantity and existing-receipt linking remain unaccepted.

The observed 0.24 tax remaining after the earlier half return follows shared returnTax component allocation: each original 0.25 CGST/SGST component has a half credit rounded to 0.13, leaving 0.12 each. Cumulative allocation differences preserve the full component amounts across subsequent returns; this is not evidence of a web-only calculation discrepancy. This source inspection does not establish regulatory approval of the policy.

Web purchase detail now uses native translated stock-action labels for received, linked and invoice-only records. Older batch-linked invoices explicitly state that their original stock action was not recorded, rather than implying a new receipt. Production build and translation coverage passed.


### Invoice-page pending request recovery

PR60 production deploy 6ac9291916099a0008413f24 published 2026-10-09T17:50:45.742Z, main 1cdcace254dec286f9c4ff64fb6ed2d436b787c3. Authenticated web reload displayed Stock received with this invoice and All settled for WQA-ST-1009.

Native supports server-confirmed closure of unrecorded rejected purchase requests directly in the workflow. Web previously offered only immediate retry on invoice detail, despite closure existing in device recovery. Invoice detail now loads its scoped pending review/return/settlement/reversal journal after reload, blocks new edits while requests are unresolved, and offers original-request recovery plus capability-gated closure with per-request reasons. Failed journal loading blocks new submissions and offers storage retry. Closure preserves the original payload and requires a verified server receipt; stale/confirmed/changed stored requests cannot be closed. Requests are never discarded merely because a transport failure or not-found outcome occurred.

Automated closure coverage tests all four invoice operations, exact payload preservation, confirmed-state/stale-payload rejection, malformed receipt, already-recorded rejection, response loss and actor changes. GST regressions, production build and translation coverage passed. Actual rejected-request closure and lost-response/restart acceptance remain unproven and must be tested against a closure-capable live server.


### Live rejected-request closure acceptance

PR61 production deploy 6ac92af6c830050008228163 published 2026-10-09T17:58:55.194Z, main 37991ca9bf33c20c3e99e52fb316d14a18c2aef1.

On approved synthetic WQA-261008-01, a 0.1-unit invoice-only return deliberately reused existing supplier credit WQA-CR-1009. The action was rejected; original remaining quantity 0.5 and outstanding 5.25 stayed unchanged. The pending request survived a full page reload, with editors locked. Invoice-page closure was available from the live server. A synthetic closure reason was submitted; verified closure removed the pending lock, and return fields were editable again. Device recovery retained Closed without recording and offered its original evidence export.

Downloaded request 78a2947c-cc35-459d-b91c-9d471670f7f8 retained the original WQA-CR-1009 payload/quantity 0.1 and verified closed receipt 178c4042-76f5-47b7-8b8c-fdb641a6082d with exact request hash 3d864ca152fcd8dcbed5b2814f202ae8ab87c159ed78540161f17d4aa3b72958. Screenshot: /private/tmp/purchase-closure-accepted-20261009.jpg. No stock or actual money moved. This accepts this rejected-return/reload/closure path; network response loss and other rejected workflows remain open.

The test exposed generic document-conflict wording. Web now explains an already-recorded supplier document number in every supported language and rejects a known duplicate credit number before retaining/sending another request. Server uniqueness validation remains authoritative for stale clients and concurrent writes.

Native independently confirmed Camlin stock 13 pieces after WQA-ST-1009 received one unit and WQA-ST-CR1009 removed it, matching the original web baseline 13. This closes native inventory readback for the receive-and-return fixture; existing-receipt linking and native-originated writes remain open.


### Native-origin review and post-correction export acceptance

Production PR62 deploy 6ac92d90e044850008e72780 was ready and published 2026-10-09T18:09:56.020Z for main 76fcdcbcfb33c58e43e7a24ae75b01b353deebd8. Its known duplicate supplier-credit warning was observed live, with submission disabled before a new request was retained.

On approved synthetic fully returned WQA-ST-1009, mobile saved an Ineligible review at 9 Oct 2026 11:45 PM IST, note `Synthetic native review - no ITC claimed`, evidence `WQA-ST-1009 native-to-web acceptance`. Native retained history displayed the saved entry. A fresh web navigation independently displayed the same decision, timestamp, note and reference in Review and adjustment history. Invoice outstanding and recoverable remained zero. This accepts native-to-web readback for this ineligible review only; eligible ITC, other native-origin purchase mutations and response-loss cases remain open. Screenshot: /private/tmp/native-review-web-readback-20261009.jpg.

The earlier retained purchase register e845d8c5-360b-4a6b-b33b-a9e549d5ee99 was downloaded again from production history after the later review, payments, refunds, reversals, credit and synthetic stock receipt/return. The downloaded `(2).csv` was exactly equal to the original: 3416 bytes, SHA-256 099905b1f3be637814de3668a51174536281b42f427287754ddd6451280b03f9. This accepts saved-file immutability after subsequent mutations for this small report; large report pagination remains unaccepted.


### Purchase reversal dependency preview

Both clients previously let a fresh payment correction reach the server even when active supplier refunds exceeded the payments that would remain. Mobile and web now share a preview using the authoritative exact-paise purchaseSettlement calculation. The selected correction displays the existing translated reconciliation explanation and disables fresh submission until the dependent refunds are corrected. Other payments that still cover refunds are allowed; the guard does not indiscriminately block every payment with a refund. Missing, already-reversed or invalid ledger entries fail the preview. The server continues to validate under its transaction lock. Original retained requests bypass new-draft checks and remain recoverable.

Validation: native TypeScript passed; four focused native settlement tests passed; full web GST regressions, translation coverage (1127 labels across nine translated languages), vendored contract checks and production build passed. Live rendered dependent-refund guard acceptance remains open. No server ledger policy, issued invoice or money transfer was changed.


### Existing receipt linking acceptance and picker parity

On the approved test shop, the original Camlin batch BSSDD9222 had 20 originally received units, 13 remaining, and unit cost 6.00. Synthetic WQA-LINK-1010 (invoice 419c001f-7143-4bda-806a-8c44a98bdd6a) linked those original 20 units with GST-included price 6.00, total 120.00 and purchase tax 5.71. Its evidence explicitly identifies the synthetic link with no new stock or real purchase. Web retained detail displayed Linked existing receipt — no additional stock added. A fresh product navigation displayed unchanged 13 units and 6.00 batch cost. Native independently displayed the same invoice, original quantity 20 and linked stock action; native inventory displayed 13 units. No actual money or goods moved. Screenshots: /private/tmp/existing-stock-link-invoice-20261010.jpg, /private/tmp/existing-stock-link-quantity-20261010.jpg, /private/tmp/native-existing-stock-link-20261010.png, /private/tmp/native-existing-stock-link-quantity-20261010.png. This accepts this successful existing-receipt link and cross-client readback; concurrent linking and acquisition-cost-change cases remain open.

This comparison exposed web's batch picker listing active receipts without native's original-quantity, prior-link or recorded-cost filters. Both clients now use one receipt-eligibility helper. Web loads depleted receipts too, shows original-to-remaining quantity, uses native translated guidance and explains no eligible matches. Already linked, wrong-original-quantity, unknown-cost and malformed stock receipts are excluded. Changing the invoice quantity clears the selected link on both clients. The server remains authoritative for concurrency and late changes.

Validation: native TypeScript and receipt eligibility test passed; web production build, GST suite, translation coverage and vendored contracts passed. Live picker rejection rendering follows deployment; successful link acceptance above used the pre-fix picker.


### Native credit/refund lifecycle and live reversal guard acceptance

On synthetic invoice-only WQA-261008-01, native saved Cash payment 5.25 at 10 October 00:41 IST, remaining half-quantity credit WQA-NCR-1010 (5.25), and Cash refund 5.25 at 00:43 IST. Both clients prevented payment reversal while its refund remained active, even with complete reason and evidence. Native corrected the refund at 00:48, then the payment at 00:49. Fresh web readback retained all originals, both reversals and both half-credit documents, with matching timestamps/references and outstanding 0.00 / recoverable 0.00. Evidence: /private/tmp/native-credit-refund-web-accepted-20261010.jpg and /private/tmp/dependent-refund-web-guard-20261010.jpg. No actual money or stock moved. This closes this successful native-origin invoice-only lifecycle and live dependent-refund guard; failures, native stock writes, eligible ITC and concurrency remain open.

PR65's deployed receipt picker excluded already-linked BSSDD9222 and displayed no eligible match guidance with saving disabled. Evidence: /private/tmp/deployed-receipt-picker-20261010.jpg. This closes already-linked picker rejection rendering; concurrent linkage remains open.

Native supplier credit date selection still reset to midnight; native PR11 changes it to the exact IST date/time picker with invoice/current-instant bounds and bundled labels. TypeScript and timezone regression passed. Simulator rendering/navigation failed after reload, so credit-picker visual acceptance, Android device and production EAS remain open. The Tamil web credit-date label now uses credit-note wording rather than incorrectly describing udhaar.

### GST check confidence and closed-period navigation — 10 October

Source review found cached clean results could remain reassuring while offline or after an unconfirmed manual scan. Native additionally ignored a failed latest server run in its confidence classifier. Both clients now preserve observations while showing stale/unconfirmed results for paused connectivity, disabled monitoring, failed reads, skipped scans or an unknown manual outcome. Native subscribes to query connectivity; web attempts a saved-results refresh after a failed scan and retains the uncertainty flag. This does not clear any server issue.

Changed closed-period observations were filtered out of both primary check lists. Both clients now display these warnings with existing localized guidance and route to the validated affected reporting month for review/reopening. The confidence classifier is shared with source-hash verification.

Native PR13 merged into development branch codex/gst-core-test-builds-20261006 (4642856). Web PR68 merged main 9ade56c; Netlify production 6ac94ac34f8e2500085759af is ready/published 2026-10-09T20:13:44.196Z. Native TypeScript and four focused monitor checks passed; web GST regressions, 62 vendored contracts, translation coverage and production build passed. Offline/failed/disabled/unknown-result confidence paths are automated acceptance; live runtime fault injection, changed-period issue navigation and native production EAS remain open.

After full production reload, a live manual scan in Suresh Stationary Store completed at 10 October 01:45 IST, checked nine saved documents and displayed no open core billing issues. Controls returned to idle and the timestamp advanced from 01:30. Evidence: /private/tmp/web-checks-confidence-release-20261010.jpg. This confirms normal successful scan behavior after release, not runtime fault/partial/offline or changed-period acceptance.


### Live changed-period warning lifecycle acceptance — 10 October

On the approved Suresh Stationary Store test account, September 2026 was closed with synthetic reason WQA-LATE-1010, then invoice-only WQA-LATE-1010 (c4b78dcb-93f7-4fca-84a0-590592c7bc19) was recorded for 30 September. Quantity was one, buying price and declared total zero, tax zero, and stock action Invoice only. Its evidence explicitly identifies synthetic acceptance with no stock, payment or filing. Outstanding and recoverable were zero.

A completed live scan at 01:55 IST surfaced Closed reporting period has new records and Some records need attention. Review records opened /shop/settings/gst/periods?month=2026-09, displaying Closed and Records changed after closing. September was reopened with a synthetic restoration reason. A full reload retained Open. Returning to checks still displayed the prior warning; opening/reopening did not silently mark it resolved. A fresh successful scan at 01:57 showed no open core billing issues and retained both completed runs in Previous results.

Evidence: /private/tmp/web-late-invoice-20261010.jpg, /private/tmp/web-changed-period-warning-20261010.jpg, /private/tmp/web-changed-period-navigation-20261010.jpg, /private/tmp/web-late-period-restored-20261010.jpg, /private/tmp/web-changed-period-resolved-20261010.jpg. September is restored to its original Open state. The labeled zero-value invoice and review history remain as evidence; no money, stock or registration changed. This closes successful web late-record detection, affected-month navigation and successful rescan resolution acceptance. Native rendering, offline/partial/failed scan runtime and period response-loss/concurrency remain open.


### Explicit ordinary-purchase confirmation parity

Native purchase creation requires confirmation that the document is an ordinary domestic forward-charge purchase without special valuation/cess/reverse charge/import/SEZ. Web previously submitted that supply type implicitly. Web now displays the same bundled translated confirmation, blocks fresh recording until confirmed, and invalidates affected tax/invoice review confirmations when this choice changes. An original retained request still retries its exact payload without requiring a new draft confirmation. Server purchase policy is unchanged.

Validation: full GST regressions, 62 shared contracts, 1127 labels across nine translated languages and production build passed. Rendered fresh-draft gating follows deployment. Native missing-product handoff remains a separately identified web gap.


### Missing-product handoff without losing the invoice draft

Web now offers the native missing-product entry inside supplier invoice creation. It opens the existing product form within the invoice page, retaining supplier/invoice/line drafts. Cancel returns without navigation. Save refreshes the invoice product selector and returns to the same draft instead of redirecting to product detail. Main invoice editing/recording is disabled while product entry is active. Product form supports optional completion/cancel callbacks; standalone create/edit behavior remains unchanged. The ordinary-purchase confirmation now precedes product review, so checking it does not force a backward trip through the form.

PR69 production 6ac94faf4c742b000812998d published 2026-10-09T20:35:41.670Z, main394b1e8. Live unsaved zero-value draft WQA-GATE-1010 verified: complete tax/invoice reviews still cannot record without ordinary-supply confirmation; checking supply clears those reviews and keeps recording disabled; reconfirming both enables recording. No invoice was submitted. Missing-product rendering and save/cancel acceptance follows its release. Full GST regressions, shared contracts, translations and production build passed.


PR70 production deploy 6ac950a6a2618e0007b5eb1b published 2026-10-09T20:39:43.816Z, main aebc3fa. Live unsaved WQA-HANDOFF-1010 retained Krishna Enterprise, evidence Unsaved draft handoff acceptance only and the existing Camlin line through opening/cancelling product entry. Saving synthetic product WQA Handoff 1010 test only (zero opening stock, selling price 1.00, reviewed synthetic HSN 4820 / 5 percent) returned to /shop/purchases/new with the same invoice draft unlocked and the new product visible in the refreshed selector. This is a labeled test fixture, not a real classification or purchase. No supplier invoice was submitted; no money or inventory quantity changed. Screenshot /private/tmp/web-product-handoff-saved-20261010.jpg. This accepts the successful web save/cancel handoff; response-loss product creation and native stock receipt acceptance remain open. Native WQA-NST-1010 is an unsaved draft after the computer-use pipe dropped; no native invoice write was attempted.


### Purchase review context and untracked-stock parity

Web now uses native purchase review signatures to bind each tax review and the final invoice confirmation to the exact supplier identity, recipient address and invoice context. Refreshing an identity with the same ID no longer leaves a stale confirmation usable. Goods-movement confirmation is separately bound to supplier/registration/destination/address, so later address changes cannot silently reuse a prior movement review. Original retained requests still replay their exact payload.

Untracked products now show invoice-only recording instead of offering stock receipt/link actions that the server rejects. Draft-only metadata is removed from the request. Product selection stops at the same 100-line limit as native, and blank original invoice total cannot become an implicit zero-value declaration. Regression checks cover identity invalidation, original-evidence immutability, untracked receipt/link rejection and payload metadata isolation; full GST regressions, 62 vendored contracts, translations and build passed. Live rendering follows deployment.

Native receipt draft WQA-NST-1010 now contains one Camlin unit at inclusive 10.50, receive-stock selection and labeled batch. A fresh independent web read confirmed baseline stock13. Native recording was not attempted: user interaction interrupted the simulator before tax/invoice confirmation. Draft remains unsaved and no stock changed.

### Native stock receipt and return acceptance — 10 October

The approved synthetic native draft WQA-NST-1010 was subsequently recorded after fresh UI inspection and line/invoice confirmation. Invoice b079b1ae-e1df-4deb-ad70-ed3a38082119 retained quantity one, inclusive buying price 10.50, net 10.00, tax 0.50 (CGST/SGST 0.25 each) and Receive new stock. Independent fresh web inventory read increased Camlin from 13 to 14 pieces. Native full supplier credit WQA-NST-CR1010 returned that one unit with Remove returned goods enabled, reason Return synthetic acceptance unit to restore baseline stock. Fresh web inventory returned to 13, and invoice history retained the 10.50 credit with outstanding/recoverable both zero. No actual goods or money moved. Screenshot /private/tmp/native-stock-return-web-20261010.jpg. This closes this successful native-origin receipt/stock-return lifecycle; failure, response-loss and concurrent stock cases remain open.

PR71 production 6ac9532d4c1283000848d99b published 2026-10-09T20:50:36.484Z at d879a98. Live unsaved WQA-REVIEW-1010 verified completed reviews enable recording, then editing evidence clears tax/final confirmations and disables recording. Explicit zero total allows a fully reviewed zero-value draft; clearing the declared total and reconfirming still blocks recording. No invoice submitted. Screenshot /private/tmp/web-blank-total-guard-20261010.jpg.

The same live check exposed an additional required-price gap: clearing Buying price changed it to implicit zero, and a reviewed zero-total draft could record. Web now retains raw buying-price text separately from its numeric request value, preserves empty input, rejects missing prices before totals/submission, and strips draft metadata from requests. An explicit zero remains valid. Original retained requests bypass new-draft checks for exact replay. Regression checks cover empty/whitespace versus explicit zero and metadata isolation. Deployed rendering of this follow-up remains pending.

PR72 merged main 9f974d5; production 6ac955792ec4390008d35e3b published 2026-10-09T21:00:28.353Z. Fresh live WQA-PRICE-1010 unsaved draft with supplier, evidence, ordinary supply and all reviews confirmed kept an empty buying price empty and recording disabled. Explicit zero plus renewed reviews enabled recording. No invoice submitted. Screenshot /private/tmp/web-required-price-live-20261010.jpg. GST regressions, 62 vendored contracts, translation coverage and production build passed.

Live untracked-line acceptance used zero-stock synthetic product WQA Handoff 1010 test only: temporarily disabled tracking through product edit, refreshed purchase catalog, and verified its line displayed Record invoice only with no Stock action selector. Restored tracking afterward through product edit; both saves retained activity history, no quantities changed. Screenshot /private/tmp/web-untracked-purchase-20261010.jpg. This closes the purchase-line rendering gate, but exposed a separate product-detail UI gap: while untracked, the page still displayed Out of stock, Add batch, Adjust stock and active-batch empty-state guidance. That broader stock-tracking experience needs correction and live acceptance.

### Untracked product detail remediation

Web and native now display the existing translated no-stock-tracking label instead of quantity/stock warnings, keep Sell available, and hide stock adjustment/receipt actions, replenishment controls, low-stock alerts and stock-cover estimates for untracked products. Existing retained batches are fetched including depleted history, displayed read-only and no longer marked next-out or described as future depletion sources. Untracked margin uses the product cost rather than an old stock batch. Web deep-link batch panels and stale inline batch editors are also gated by current tracking/edit permission. Native stock-related reorder/expiry/supplier-price nudges are hidden for untracked products. Native TypeScript, web production build and translation coverage passed; authenticated rendering and retained-batch-history acceptance follow deployment. Native production EAS remains separate.

Native PR14 merged development at 9eded85; simulator rendered synthetic WQA Handoff 1010 test only as Not stock-tracked with Sell available and no stock actions, batch empty state or minimum-stock field. Screenshot /private/tmp/native-untracked-detail-20261010.png. Web PR73 main 9e66a69, production 6ac95754aef43d0008a9fc5c published 2026-10-09T21:08:12.960Z; fresh reload independently showed Not stock-tracked, Sell, no out-of-stock warning, no stock controls, no batches empty state and no low-stock field. Screenshot /private/tmp/web-untracked-detail-live-20261010.jpg. Original tracking setting was restored afterward, and tracked stock controls/status returned on web; no quantity or financial changes. Existing historical-batch rendering remains untested on an untracked product with retained batches.

Follow-up discovered during this acceptance: web and native product lists still classify/filter untracked products using inventory stockStatus and display numeric stock badges. Server dashboard stats count LOW/OUT/near-expiry without a products.trackStock predicate. Product-detail fixes do not close those separate list/count gaps; they remain required follow-up work.

### Untracked list and filter acceptance — 10 October

Web PR74 published at main bf31a8c on production deploy 6ac958d55490440008afa3ad, 2026-10-09T21:14:34.165Z. Native/server PR15 merged development ff5433b. Both lists preserve untracked catalog items in All and render Not stock-tracked without numeric quantity/status badges. Stock-only filters exclude them; native low-first sorting places them after tracked products. Web attention rows exclude untracked products. Server LOW/OUT/near-expiry counts now filter products.trackStock, treating legacy null as tracked; this backend change is not yet production-deployed.

Authenticated live test temporarily disabled tracking on zero-stock synthetic WQA Handoff 1010 test only. Web production and native development All both showed four products including the fixture with Not stock-tracked and no stock badge. Out-of-stock, low-stock and near-expiry filters each showed zero matching products on both apps. Native Unpriced excluded the priced fixture, then All restored it. Web Home showed Stock looks healthy with no attention row, while its server-backed Out of stock count still showed one: deployment of the server fix remains required. Original tracking was restored through normal product editing; tracked controls/status returned and quantity remained zero. No invoice or payment was created. Screenshots: /private/tmp/web-untracked-list-20261010.jpg, /private/tmp/native-untracked-list-20261010.png, /private/tmp/web-tracking-restored-list-test-20261010.jpg.

The same check found the web editor still offered Low-stock alert at when tracking was disabled. That field now follows trackStock visibility while preserving its previous value for re-enabling tracking. Production build passed; release rendering follows deployment. This is separate from the remaining full parity acceptance gates.

Web PR75 merged main 7f5be75; production deploy 6ac95a91d3655400088accc4 published 2026-10-09T21:21:54.856Z. Fresh published editor read showed threshold 5 with tracking enabled. Unsaved tracking-off toggle removed the threshold field (DOM count zero); re-enabling restored value 5. Cancelled without saving. Screenshot /private/tmp/web-untracked-form-live-20261010.jpg. Native PR16 moves the same threshold below Track stock beside depletion order; iPhone 17 development editor likewise hid threshold/depletion controls when off and restored threshold 5 on re-enabling. Cancelled without saving. Screenshot /private/tmp/native-untracked-form-20261010.png. Native TypeScript check passed; EAS production remains pending.

### Browser notification implementation in progress

The new server dispatcher separates validated browser subscriptions from Expo tokens, bounds provider concurrency, keeps dead-token indices aligned and binds browser payloads to their registered account. The worker suppresses previous-account updates and stale notification clicks, and accepts only fixed same-origin destinations. Settings exposes explicit opt-in, unsubscribe and truthful unsupported, blocked, unavailable and failure states. Labels cover all ten languages. Delivery stays unavailable until matching VAPID keys are configured. Worker isolation, malformed-payload, denied-storage and existing shell tests pass; rendered permission, actual provider delivery and production configuration remain unverified. This tranche has not yet been deployed.

A broader server retest exposed a zero-value stock-return evidence inconsistency: accepted cash-method evidence with no monetary movement was incorrectly rejected on readback. The validator now accepts the retained method for an exactly zero settlement while continuing to reject nonzero amount mismatches and invented payment/ledger references. Full integration retest is required before release.
### Browser notification readiness and session follow-up (draft)

The settings enable state now requires a worker acknowledgement after ownership persistence. Storage denial, missing/failed activation and acknowledgement timeout return a retryable error rather than claiming enabled delivery. Existing subscriptions are checked against the current VAPID public key; obsolete subscriptions are removed before re-enabling. A shared actor-generation lease and serialized mutation queue reject delayed account work before it can unsubscribe or bind a newer session. The provider clears ownership promptly during auth changes and removes abandoned subscriptions through the same queue.

Validation: build, full web GST regression suite and ten-language label coverage passed. New tests cover stale account work, recovery after queue failure, matching/rotated/malformed keys, persisted-owner acknowledgement, wrong-owner acknowledgement, denied storage, absent worker, activation failure and timeouts. This is draft PR53 work; Render workspace selection/configuration and actual browser permission/provider delivery remain open.

GST record-check PR55 is published at commit 79ca0daebe685859a41b918760951e761577031a. Authenticated live validation on the approved Composition test shop completed a fresh 9-document check, updated summary/history, restored controls and produced no captured browser errors.

### Browser notification integration release — 10 October

Rebased web PR53 and server PR7 over the latest GST/stock fixes, preserving all current translation keys and regressions. Web full GST tests, 62 shared contracts, 1136 labels across nine translated languages, production build and diff check passed. Server build and isolated full suite passed 762/762 with a dummy local database URL and injected/PGlite test databases; the initial no-URL run failed on two database module imports, not behavioral assertions. No production database or delivery provider was used by these tests.

Web PR53 merged main 3ac2852 and production deploy 6ac95cae160bd00008bd9b98 published 2026-10-09T21:30:22.939Z. Server PR7 merged development 01d09c3; production server deployment remains pending workspace selection/configuration. Fresh authenticated web Settings displayed Browser notifications are not available yet, without an enable control or misleading connection retry. No notification permission or subscription was granted. Screenshot /private/tmp/web-browser-notification-unavailable-20261010.jpg. This accepts truthful unavailable rendering, not real notification delivery.

Comparison with native notificationDestination also exposed a recap navigation mismatch: web brief notifications opened Home, while native opens Daily brief. Web PR76 maps brief payloads to /shop/brief and retains a fixed same-origin destination allowlist. Worker tests verify subscription and daily-brief destinations plus previous-account, sign-out and storage-denial suppression. Provider configuration, live permission/delivery, multi-tab account races and click acceptance remain open.


### Runtime translation meaning acceptance and pricing guidance — 10 October

PR76 production deploy 6ac95d46e0c1ac0008abb240 published 2026-10-09T21:33:24.743Z. PR77 main 1465e92, production deploy 6ac95ed2f2df750008330b53 published 2026-10-09T21:39:55.742Z, corrects scoped Settings/purchase translation meanings across ten languages and translates invoice unit labels without changing retained evidence. Translation coverage (1139 web labels / nine translated languages), semantic override regressions and production build passed.

Fresh authenticated Bengali Settings displayed distinct Preferences and Extra Large, this-month sales CSV and the full two-confirmation/account-subscription boundary. The retained WQA-261008-01 invoice displayed Invoice total, quantity 1.000 ti in Bengali and All settled meaning instead of All. Both pages had document scrollWidth/clientWidth 390/390 at the temporary 390x844 viewport. Screenshots: /private/tmp/web-bengali-settings-corrected-20261010.jpg and /private/tmp/web-bengali-invoice-corrected-20261010.jpg. English was restored and persisted after a full reload; the viewport override was reset after acceptance. No invoice/payment/stock/registration changed. Other language runtime flows remain open.

Product form source comparison found web always advertised included/added GST, including Composition, unregistered and unknown settings. It now uses the same four bundled guidance messages and registration/price-mode selection as native. Preview arithmetic and stored prices are unchanged. Production build, translation coverage and diff check passed. Deployment and Composition rendering acceptance follow release.


PR78 main b1adb83 published on production deploy 6ac960ba8f0252000895c323 at 2026-10-09T21:48:19.632Z. Follow-up removes the unconditional selling-price tax hint for shops that do not collect GST and uses the native printed-MRP help. Build, translation coverage and diff check passed. These are UI guidance changes only; no price or tax arithmetic changed. Combined published Composition rendering will be checked after the follow-up release.


PR79 main 0fb2a41, production deploy 6ac96175e89cc00008aa14f4 published 2026-10-09T21:51:21.997Z. Fresh authenticated Composition product editor for WQA Handoff 1010 test only displayed This shop does not collect GST separately from customers, suppressed the unconditional selling-price GST hint, retained Before GST 1.00 / GST 0.00 / Customer pays 1.00 and showed the native printed-MRP override guidance. Screenshot /private/tmp/web-composition-pricing-guidance-20261010.jpg. Cancelled editing without saving; no product, registration, stock, invoice or financial data changed. This closes the identified Composition pricing-guidance gap. Unknown/unregistered/Regular GST rendered branches still require eligible-context live acceptance. Full mobile/web parity remains active with the previously listed release, recovery, concurrency, Regular GST, language, provider and export/print gates open.


### Retained batches and product tax-history entry parity — 10 October

Authenticated retained-history acceptance temporarily disabled tracking on Camlin C4 Pencils Pack of 10 (d74951f4-87ac-4b9c-bd51-b22a213a73bb). Web and native preserved the active batch (13 of 20) and both depleted synthetic receipt batches (0 of 1 each). Both showed Not stock-tracked and Sell, suppressed batch edits, stock adjustment/receipt, next-out and stock-cover controls. Evidence: /private/tmp/web-untracked-retained-batches-20261010.jpg and /private/tmp/native-untracked-retained-batches-20261010.png. Restored tracking through normal product editing; fresh web and native catalog showed original 13 pieces. No stock or financial mutations occurred; the two tracking edits remain in activity history. This closes retained-batch rendering acceptance for this fixture.

The comparison exposed missing web product-detail tax history. Product details now expose the same read-only history with a link to the existing full GST review/scheduling route. A shared renderer for both locations uses effectiveVersion/currentProfileStatus and distinguishes unconfirmed drafts, disabled profiles, scheduled/cancelled profiles, effective versus recorded dates, classification, named confirmation/authorization and source/cancellation evidence. Human-readable name fallbacks do not expose account IDs. Owner/Manager permission gating and existing account/shop-scoped paginated queries remain in place.

History now watches future effective boundaries and browser focus/visibility, preserves uncertainty for offline/errors/invalid captures and prevents new scheduling/cancellation until refreshed. Scheduling uses the effective version and an IST date/time field with future-time gating. Cancellation has its own reason entry, only appears before the effective instant, and retained requests have a separate exact-payload retry control. Timer tests cover invalid capture, bounded wait, due-once, cancellation and resumed clock. Full GST tests including 62 shared contracts, translation coverage and production build passed. Published history rendering and live scheduling/cancellation/lost-response boundary acceptance follow release; these are not claimed complete.


PR80 main 7c65e2f, production deploy 6ac964d30a75ee0008654e33 published 2026-10-09T22:05:45.047Z. Fresh authenticated Camlin product details now show Current profile HSN1006/5 percent and Previous profile HSN1005/3 percent, both confirmed/authorized by Suresh Kumar with Owner permission. The Tax profile history link opened the full product GST history route with the same rows and names. Screenshot /private/tmp/web-product-tax-history-live-20261010.jpg. Live settings did not expose tax scheduling, so scheduled/cancellation/missing-profile controls and boundary fault acceptance remain open; source/build/timer tests do not replace that acceptance. Existing 13-piece stock, original tracking and saved profiles remain unchanged.

Additional source/runtime observations to follow up: web batch rows omit batchNumber although native displays it; tracked margin briefly falls back to the product cost during an Active/All batch-query change before returning to the actual next-batch cost. Scheduling should additionally block fresh requests when there is no effective/current profile version. These are not yet claimed fixed.


### Stable batch costing release — 10 October

Web PR81 merged main 2e0a4a1; production deploy 6ac967641134a40008f99146 published 2026-10-09T22:16:40.806Z. Native PR17 merged development 97b1c50. Both product details now keep next-sale costing on an independent active-batch query, so switching history filters cannot substitute the last product cost. Initial missing/error costing is unknown rather than an assumed fallback. Web rows now display retained batch numbers and native average-cost/input-tax-credit guidance. Fresh tax scheduling requires an effective/current profile version.

Full web GST regressions and 62 shared contracts, translation coverage, production build and native TypeScript passed. Live native and freshly reloaded production web Camlin detail retained margin 6 rupees / 50 percent during All loading and after both depleted receipt batches appeared; native Active restored the same result. Web showed BSSDD9222, WQA-ST-1009 and WQA-NST-1010 and the recorded-cost/no-input-tax-credit explanation. Evidence: /private/tmp/web-batch-margin-stable-20261010.jpg and /private/tmp/native-batch-margin-stable-20261010.png. Stock stayed at 13; no data mutation occurred. Average-cost divergence and enabled scheduling runtime remain acceptance gates. Native EAS production, backend deployment/provider configuration, Regular GST, recovery/concurrency, all-language runtime, voice, large exports and print acceptance remain open.


### Current live acceptance and authentication drafts — 10 October

A fresh authenticated manual GST record check completed at 10 October 04:16 IST, checked all nine saved documents and reported no current core issues. During execution, controls disabled and previous results remained identified as the last completed check. The records hub independently reflected nine verified documents and zero records needing review. Evidence: /private/tmp/web-gst-check-completed-20261010.jpg. Failed, partial and offline checks remain live acceptance gates.

The retained invoice-number report 7c3225d4-bb37-4b9f-bcb9-6ea8ee713f4c was downloaded twice from export history. Both downloads were byte-identical: 94,091 bytes, 201 data rows, SHA-256 6c476aaf7a2f29e1d162be7fd7bcfdeddb095afc010c5d4d01aea294f0484c26. This accepts exact reopening of this retained numbering report, not large sales/purchase export pagination. No new report, invoice or financial/stock mutation was made.

An authenticated mobile Metro JS reload restored Suresh Stationary Store, four products and three customers without an authentication screen or module-resolution error. This proves an online JS reload only; offline startup and process-death restart remain unproven. Native simulator interaction has since recovered; the successful 04:33 IST nine-document scan and corrected Bengali workspace labels were verified through native controls. Offline startup and process-death acceptance remain open.

Native draft PR18 fixes a first-login cache race found in the installed Clerk SDK listener order. A bounded memory buffer retains the latest three SDK snapshots until successful authenticated scope persistence, then writes through existing actor/session ownership and generation guards. Sign-out clears the buffer. Focused first-event, wrong-account, signed-out, superseded hydration, storage fault and ownership tests pass, as does native TypeScript. The session-change message now uses current-language copy matching web in all supported languages.

Web PR82 guards token retrieval, 401 retries and response publication against changed sessions; its GST suite, shared contracts, translation coverage and production build passed. PR82 is merged and production deployed; native PR18 remains a pushed draft without an EAS release. Full parity remains active; the recovery, eligible Regular GST, concurrency, scheduling, provider, language runtime, export/print and production-native release gates remain open.

### Manual record-check receipt confirmation — 10 October

GST manual checks now stay unconfirmed until a successful saved-results read contains the exact returned completed run ID and scanned-document count. A skipped, malformed or missing receipt, stale report or failed refresh cannot clear uncertainty. A later manual refresh can confirm a retained receipt. Native TypeScript and focused receipt tests passed; the full web GST suite, 62 shared contracts and production build passed. Live failed-refresh and delayed-report acceptance remains pending.

The development-only core synchronization script also now maps the extensionless report-summary type import to the existing browser preparation-summary type, preventing synchronization from introducing a server-only path into the web build. No export behavior or stored report was changed. Web changes are now production deployed; the native equivalent remains in PR18 without an EAS release.

### Receipt-confirmation and responsive form release — 10 October

Web PR82 merged e55f91f5dc97a00d1a8b4a7e25d95847027ae099. Production deploy 6ac97681847b8c0009ee5ae3 published 2026-10-09T23:21:08.733Z. Full GST suite, 62 shared contracts, translation checks and production build passed. A fresh authenticated check showed unconfirmed previous results during execution, then a completed 04:52 IST scan of nine saved documents with enabled controls and no current core issues. Evidence: /private/tmp/web-monitor-receipt-confirmed-20261010.jpg. Failed refresh, delayed report, account-switch and offline acceptance remain open. No financial or stock mutations were made.

At 390px, the nested product section previously measured 370px inside a 312px content area and clipped its fields. Shrinkable grid columns and wrapping titles now keep the section at 312px, with scroll width 310px. Its tax input and review checkbox are visibly accessible. Evidence: /private/tmp/web-nested-gst-fields-fit-20261010.jpg. Viewport restored and the user's existing invoice draft preserved.

PR83 separately deployed confirmation-card spacing: 16px vertical gaps and explicit 12px 14px alert padding. Native PR18 also now includes thirteen previously missing GST design labels in all nine translated languages and corrected Bengali settings labels; corrected native Bengali workspace rendering was observed, then original English preferences restored. This closes key coverage and the inspected runtime labels, not semantic review of every language or full mobile/web release acceptance.

### Ordinary bill share language follow-up — 10 October

PR84 merged 67bad64fd2817d6ed43563759024fa2f692d8eef. Ordinary web bill copied text, canvas image, share title and payment descriptions now receive existing selected-language labels. Tests execute the public share function and verify Bengali text, canvas label calls, title, custom footer and English fallback. Full GST suite, 62 contracts, TypeScript and production build passed. Production deploy 6ac97820160bd00008c1fc0e was created but publication was not yet confirmed when this entry was written. Live OS sharing remains unaccepted.

Source inspection also confirms ordinary canvas sharing still truncates product names to 32 characters and uses fixed-height unwrapped address/detail/payment text. This is a remaining completeness gap for long or multilingual ordinary receipts; the GST verified document path is separate. Long multilingual PDF pagination and physical print acceptance remain open.

### Complete ordinary bill image layout follow-up — 10 October

PR84 production deploy 6ac97820160bd00008c1fc0e published 2026-10-09T23:28:18.180Z. PR85 merged 469a88bcc60caa811617a129c4d33e47fe9a0734, replacing fixed-height/truncated ordinary canvas receipts with measured complete text and word/grapheme-safe wrapping. Product names use the full content width; quantities and amounts occupy distinct columns. Addresses, payment descriptions, date and custom multiline footer are included in the height calculation.

The full GST suite, 62 contracts, TypeScript and production build passed. Layout tests preserve all 100 long multilingual line amounts and text, bound horizontal positions, keep Indic clusters intact and retain the final footer within the image. An actual browser canvas fixture rendered English, Bengali and Hindi names plus a long SKU, address, payment description and multiline footer without overlap or truncation. Evidence: /private/tmp/wrapped-bill-browser-proof-20261010.jpg. This synthetic rendering recorded no invoice, payment or stock change.

Production deploy 6ac979812cbb2600083c0c0f is in progress and not yet publication-verified. Live OS sharing, very large browser bitmap limits, long GST PDF pagination and physical printing remain open. Native PR18/EAS, authenticated recovery/concurrency, eligible Regular GST, provider and full runtime language gates remain open; full parity is not complete.


### Sharing fallback scope and focused release — 10 October

PR85 production deploy 6ac979812cbb2600083c0c0f is ready and published 2026-10-09T23:34:06.578Z.

PR86 merged 00077cb530b2679c1378d47a56a1bca078bbb52f. Ordinary bill sharing now checks the captured account/session and shop before conversion and after asynchronous image, failed share and clipboard boundaries, preventing subsequent stale fallback actions. Clipboard denial permits image download; explicit share cancellation remains cancellation. If neither copy nor download succeeds, the screen displays an error. Copy, download and failure notices have coverage in all ten supported language catalogs.

Targeted sharing context/cancellation/failure tests, the full GST suite with 62 contracts, production build, translation coverage and diff checks passed. Production deploy 6ac97b2167d5080008e019f4 is ready and published 2026-10-09T23:41:10.902Z. Real OS share-sheet acceptance remains unproven. The goal remains focused on reported gaps and essential parity; broad speculative edge cases are not new release requirements. Previously listed required production-native, eligible GST, recovery and provider acceptance still need evidence.
