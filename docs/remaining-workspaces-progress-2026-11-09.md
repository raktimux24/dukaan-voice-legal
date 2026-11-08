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

Voice: native voice-feedback compared. Sale checkout and uncertain stock-outcome protections retained. Synthetic capture/review, animated recording indicator and edited quantity calculation checked; ten languages fit 320px. GST/voice regression tests, translations and TypeScript pass. No real microphone, STT/TTS or inventory mutation tested.

Follow-ups: native view and shared workflow compared. Existing snooze, history, reviewed channel launch and explicit contact recording retained. Responsive queue and settings checked with synthetic data; deselection disables reminder preparation. No messages sent or real contact records changed. Follow-up regression, TypeScript and translation checks pass.

Credit statements: shared contract/workflow/client/statement source matches mobile; native view compared. Reversed date range disables snapshot creation, verified with keyboard input. Existing PDF/CSV export retained; new live exports not generated. Translation and TypeScript checks pass.

Opening balances: ported current portable native view and optional skip callback into the web host. Existing staged review, owner confirmation, retained-request recovery and supplier settlement controls preserved. Ten-language mobile hub/editor checks and TypeScript, financial regression and translations pass. No balances applied or payments recorded.

GST overview/installations/numbers: native health, devices and allocation screens compared with server response. Added provider-history evidence to review counts, affected-document links, installation support references, current-browser recognition and explicit reason/confirmation before revocation. Unconfirmed ranges preserve gaps. Expanded fixture records fit all ten languages at 320px; cancellation leaves device active. No real revocations or allocation writes. TypeScript and translation checks pass.

GST checks/recovery: native monitor/recovery source reviewed. Web retains scoped original requests and uncertain-outcome protections; helper visibility is limited to sales while management can review other financial requests. Closure reasons no longer leak between rows and offline closure is blocked. Tamil button overflow fixed and rechecked. Financial regression and TypeScript pass. No original requests replayed or closed.

Saved receipt: original content/hash verification preserved. Synthetic ordinary receipt generated through production builder and verified through actual screen; amount and original timestamp retained. Existing fiscal document renderer reused. No server recovery, print or fiscal issuance performed.
