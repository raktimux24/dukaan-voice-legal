# Remaining workspace redesign — implementation tracker

User scope: all 31 remaining shop routes, plus adjacent public storefront and utility consistency review. Do not mark a route complete from shared CSS or translation coverage alone. Each needs mobile-source comparison, implementation and responsive interaction verification. No deployment requested in this iteration.

| Route | Parity | Design | Mobile/languages |
|---|---|---|---|
| `/shop/products/bulk` | Shared workflow matches mobile; controls audited | Step sequence, focused review, history disclosure | Ten languages at 320px; synthetic review, confirmation and apply passed |
| `/shop/products/barcodes` | Shared workflow matches mobile; generate/replace/download retained | Search, missing-code filter, label records | Ten languages at 320px; filter, selection, generation confirmation checked |
| `/shop/alerts` | Audited; bulk/prediction buy-list actions restored | Implemented | Ten languages at 320px; filters and add action checked |
| `/shop/brief` | Audited; history, stock, regeneration and Free audio restored | Implemented | 10-language 320px check; desktop visual and refresh verified |
| `/shop/voice` | Native review audited; price calculation, removal reason and offline guards restored | Recording states, staged review, responsive dialog | Ten languages at 320px; synthetic capture/review and quantity changes checked |
| `/shop/cashbook` | Shared mutations match mobile; expense entry and ledger presentation restored | Amount-first expense form, ledger rows, expense list/details | Ten languages at 320px for day and form; synthetic unpaid save verified |
| `/shop/sales/refunds` | Native periods, summary, rows and bill navigation audited; settlement fallback restored | Sales-style metrics and settlement ledger | Ten languages at 320px; audit disclosure and settlement amounts checked |
| `/shop/customers/[id]/statement` | Native/shared credit controls audited; export safeguards retained | Section navigation, paired dates, stable scroll and snapshot pagination reset | Ten languages at 320px; bills section and reversed dates checked |
| `/shop/customers/followups` | Shared workflow matches mobile; selection/contact safeguards retained | Aligned balance ledger, search/filter command bar, section navigation | Ten languages at 320px; settings and selection guard checked |
| `/shop/products/import` | Shared workflow matches mobile; issue-first review and grouped mapping restored | Responsive upload/history, mapped columns and review | Ten languages × upload/mapping/review at 320px; skip/include checked |
| `/shop/customers/import` | Shared workflow and native party screen audited | Grouped mapping, issue-first review and upload history | Ten languages × three stages at 320px |
| `/shop/suppliers/import` | Shared workflow and native party screen audited | Grouped mapping, issue-first review and upload history | Ten languages × three stages at 320px |
| `/shop/settings/opening-balances` | New native guided view ported; shared workflow aligned | Setup choices, records, status hierarchy and confirmation footer | Ten languages × hub/editor at 320px; synthetic setup transition checked |
| `/shop/settings/gst` | Native health reviewed; provider-history counts and affected bills restored | Two-column navigation and review metrics | Ten languages at 320px; affected-record links checked |
| `/shop/settings/gst/checks` | Native monitor compared; receipt confirmation and stale-result safeguards retained | Status summary and responsive issue records | Ten languages at 320px; Tamil action overflow fixed |
| `/shop/settings/gst/devices` | Native installation panel reviewed; identity, refresh and explicit revocation confirmation restored | Expandable records and focused confirmation dialog | Ten languages at 320px; empty-reason guard and cancellation checked |
| `/shop/settings/gst/numbers` | Native allocation register reviewed; support identity, document links and position ranges restored | Mobile ledger rows and desktop table | Ten languages at 320px with expanded records |
| `/shop/settings/gst/recovery` | Native recovery compared; cost-role separation and per-request closure reasons restored | Bills/request tabs and expandable evidence | Ten languages at 320px; synthetic retained bill and tab switch checked |
| `/shop/settings/gst/recovery/[requestId]` | Original receipt verification and recovery retained; units localized | Saved-state summary and responsive receipt | Ten languages at 320px with verified synthetic ordinary receipt |
| `/shop/settings/gst/exports` | Native history/prepare controls compared; all-kind history and offline guard restored | History/prepare navigation and mobile report ledger | Ten languages at 320px in history and prepare |
| `/shop/settings/gst/periods` | Native summaries, close/reopen and retained request checks compared | Month command bar and review summaries | Ten languages at 320px; Tamil overflow corrected |
| `/shop/settings/gst/turnover` | Native evidence workflow compared; financial-year selector restored | Grouped evidence form and retained amount summary | Ten languages at 320px; year switch and disabled-save guard checked |
| `/shop/settings/gst/providers` | Native provider jobs reviewed; subject reference and uncertain-state guidance restored | Status-led records and support disclosure | Ten languages at 320px |
| `/shop/settings/gst/rounding` | Native review compared; end date, retained-policy reuse, IST dates and manager read access restored | Grouped policy form and distinct preview | Ten languages at 320px; retained dates and manager permissions checked |
| `/shop/products/gst` | Native catalogue compared; manager confirmation authorization and offline guards restored | Product ledger, selection and grouped tax editor | Ten languages at 320px; selection and unauthorized-manager guard checked |
| `/shop/products/[id]/gst` | Native history/scheduling compared; support identity and separate cancellation reasons restored | Status-led history and schedule disclosure | Ten languages at 320px; empty-reason guard checked |
| `/shop/products/[id]/gst/rsp` | Native review/preview compared; refresh, IST date restoration and stale-preview reset restored | Responsive evidence form and retained review summary | Ten languages at 320px; unreviewed save disabled |
| `/shop/adjustments/[id]` | Native collection/reversal compared; date/time, evidence limits and saved-request restoration added | Balance summary, paired entry fields and dated collection history | Ten languages at 320px; over-balance and reviewed-entry guards checked |
| `/shop/estimates` | Shared workflow/view match mobile; editor, issue, share and bill handoff audited | Existing staged editor retained; status filters and compact list refined | Ten languages at 320px for list/editor/detail; item selection, terms and discard checked |
| `/shop/online-store` | Native/shared workflow compared; persistent section navigation restored | Store/products/orders tabs and focused detail/editor | Ten languages at 320px for setup, products, orders and order details |
| `/shop/onboarding` | Owner name, language, phone validation, invite-link/QR support restored | Two-stage responsive create/join workspace | Ten languages × join/details/GST at 320px; phone and invite parsing verified |

## Verification notes

Adjacent review is recorded below.

Daily brief verification: TypeScript, Home action regression tests and translation coverage passed. Actual component fixture at 320px in ten languages had no page overflow. Free audio control and regeneration verified with synthetic responses; live TTS not invoked. Uses existing HomeNudge confirmation, dismissal and message review. Corrected inaccurate translated Daily brief titles.

Alerts: stock/expiry/prediction flows compared to mobile low-stock-alerts. Added actionable-prediction and bulk buy-list actions, All-view predictions, localized quantities/expiry, in-flight guards, explicit fetch errors and retry. All ten languages fit 320px after filter wrapping; desktop filter and synthetic add-all checked. Live prediction generation and real buy-list writes not performed.

Bulk editor: shared contract/client/workflow match mobile. Existing dedicated-field protections, stale-review and uncertain-outcome recovery retained. Existing localized strings reused. TypeScript and translation coverage pass; synthetic price review requires confirmation and focuses the review before apply. Real bulk changes not made.

Barcodes: mobile contract/client/workflow match. Added missing-only filter with scope reset, compact label records and responsive command bar. Synthetic generation retained existing code and cleared missing selection; real code generation and physical printing not performed. Existing ten-language strings reused.

Cashbook: compared native view and expense form, retained unchanged shared contract/client/workflow. Ported expense/ledger presentation hooks, unsupported-service errors and return-to-list after expense save. Desktop form and 320px day/form checked in ten languages using existing translated keys. Unpaid synthetic expense saved with zero payment and full remaining balance. Cashbook regression tests, translation coverage and TypeScript passed. Live payments/reconciliation/export not executed.

Refunds: native refunds.tsx comparison complete. Web retains search, custom dates and cursor navigation; reversed custom ranges now suppress queries. Both flat and nested settlement evidence display correctly. Sales regressions, TypeScript and translations pass. 320px ten-language check and synthetic audit disclosure verified; no real refund submitted.

Product import: native import screen compared, with shared contract/client/workflow retained. Added issue-first review, all-row toggle, matched/optional field grouping and missing-name guidance. Existing safe confirmation, batch recovery and opening-session handoff retained. Native importUI translations copied for all ten languages. Browser checked 30 stage/language combinations at 320px and skip/include state with synthetic jobs; real uploads/writes not executed.

Customer/supplier imports share one implementation. Native party import reviewed; customer Premium and supplier access conditions, balances, staging and confirmation retained. Both routes tested in all ten languages at 320px in upload, mapping and review stages using synthetic jobs. TypeScript and translation coverage passed.

Onboarding: compared native create/join flows and server create fields. Added owner name and preferred language, localized shop type/subtype, normalized Indian phone validation, GST name/address prefill, explicit join confirmation after owned-link parsing and QR capture reuse. Duplicate submission protected. Corrected translated GST select overflow; final ten-language 320px pass. Parser tests, TypeScript and translation checks pass. No shop created/joined, camera permission or physical QR scan executed.

Voice: native voice-feedback compared. Sale checkout and uncertain stock-outcome protections retained. Synthetic capture/review, animated recording indicator and edited quantity calculation checked; ten languages fit 320px. GST/voice regression tests, translations and TypeScript pass. No real microphone, STT/TTS or inventory mutation tested.

Follow-ups: native view and shared workflow compared. Existing snooze, history, reviewed channel launch and explicit contact recording retained. Responsive queue and settings checked with synthetic data; deselection disables reminder preparation. No messages sent or real contact records changed. Follow-up regression, TypeScript and translation checks pass.

Credit statements: shared contract/workflow/client/statement source matches mobile; native view compared. Reversed date range disables snapshot creation, verified with keyboard input. Existing PDF/CSV export retained; new live exports not generated. Translation and TypeScript checks pass.

Opening balances: ported current portable native view and optional skip callback into the web host. Existing staged review, owner confirmation, retained-request recovery and supplier settlement controls preserved. Ten-language mobile hub/editor checks and TypeScript, financial regression and translations pass. No balances applied or payments recorded.

GST overview/installations/numbers: native health, devices and allocation screens compared with server response. Added provider-history evidence to review counts, affected-document links, installation support references, current-browser recognition and explicit reason/confirmation before revocation. Unconfirmed ranges preserve gaps. Expanded fixture records fit all ten languages at 320px; cancellation leaves device active. No real revocations or allocation writes. TypeScript and translation checks pass.

GST checks/recovery: native monitor/recovery source reviewed. Web retains scoped original requests and uncertain-outcome protections; helper visibility is limited to sales while management can review other financial requests. Closure reasons no longer leak between rows and offline closure is blocked. Tamil button overflow fixed and rechecked. Financial regression and TypeScript pass. No original requests replayed or closed.

Saved receipt: original content/hash verification preserved. Synthetic ordinary receipt generated through production builder and verified through actual screen; amount and original timestamp retained. Existing fiscal document renderer reused. No server recovery, print or fiscal issuance performed.

Providers/rounding: native source reviewed; subject references and uncertain-result guidance shown. Rounding dates retain IST calendar dates, end date must follow start, changes clear confirmation, and previews clear when input/version changes. Owner mutation and offline guards retained, managers may view/preview. Financial regression, translation checks and TypeScript passed. No provider call or rounding policy recorded.

GST reports/periods/turnover: native screens and server history filters compared. All-kind history omits the kind parameter as required by the API. Financial regression, translation coverage and TypeScript pass. Synthetic responsive checks cover all ten languages; no new report, period close/reopen or turnover record submitted.

Product GST catalogue/history: native authorization, history and scheduling compared; API enforces authorization independently. Existing immutable invoice profiles, fresh-history guard and retained requests preserved. Ten-language responsive fixture checks and TypeScript pass. No tax profile applied, imported or cancelled.

RSP review: existing receipt verification, feature gate and review-only notices preserved. TypeScript and responsive fixture checks pass. No RSP profile or preview submitted to the server; this does not establish enabled RSP billing.

Debit-note collections: existing financial API retains original requests and verifies outcomes. The screen restores unresolved input, blocks offline/new submissions while loading that journal, checks effective dates and refreshes balances after success. No payment or reversal recorded; synthetic amount validation checked. TypeScript passed.

Estimates: existing dedicated web editor already matches the new app direction. Extended status filters and improved narrow-screen amount/status layout. Existing freshness, expiration, cart-conflict and document safeguards retained. No estimate issued, shared or converted live. Financial regression, translations and TypeScript passed.

Online store: shared contract/client/workflow retain native publishing, stock reservation, QR, order-state and bill handoff capabilities. Opening a detail hides the repeated list; back restores it. No store published, QR downloaded, order accepted or customer notification sent. Synthetic controls and reason guards reviewed.

### Public catalogue, product and order tracking

`/store/[storeId]`, `/store/[storeId]/p/[itemId]` and `/store/[storeId]/orders/[orderId]` share one reviewed implementation. Aligned surfaces with the web workspaces, reduced mobile header height, preserved accessible language labels and added supported `lang` deep links. Ten-language 320px checks cover catalogue, product, order tracking and cart. Cart add/review checked with synthetic data. Existing email verification, private tracking token and staff-confirmed payment conditions retained; no real order, verification email or UPI payment invoked.

### Subscription return

`/subscription/return` now uses a focused status workspace and ten-language copy, with query-preserving language selection. Existing authenticated checkout polling and app return parameters are retained. Paid, authorized, failed, missing-detail and signed-out states were checked with synthetic responses; all ten languages fit 320px. Authorization is explicitly distinguished from a confirmed subscription charge. Billing regression, translations and TypeScript pass. No real checkout was opened or paid.

### Account deletion

`/delete-account` matches the utility workspace and loads the selected language catalogue. Shared deletion workflow/view match mobile; retained-record checks, explicit confirmation and identity-removal ordering are unchanged. Corrected translation precedence so Gujarati uses the reviewed delete-account wording rather than an obsolete merge label. Ten languages fit 320px. Deletion regression passed; no deletion was submitted.
