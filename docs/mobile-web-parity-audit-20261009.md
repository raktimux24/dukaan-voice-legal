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
