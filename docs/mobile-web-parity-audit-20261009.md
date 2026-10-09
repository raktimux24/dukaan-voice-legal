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
