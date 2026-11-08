# Billing parity and redesign — 8 November 2026

## Scope and evidence

Compared the native subscription screen (`app/(modals)/subscription.tsx`), subscription API, entitlement helpers and server entitlement source in `dukaan_voice_mobile` with the web `AccountDashboard`, subscription screen and subscription client.

This is a source-backed mobile parity review and synthetic web verification. No native simulator replay, live payment, mandate authorization, subscription cancellation or production deployment was performed. Existing earlier screen updates remain in the worktree.

## Parity and behavior

| Capability | Result |
| --- | --- |
| Current access and billing status | Distinguishes automatic trials, mandate-backed trials, active plans, unfinished authorization, failed payments, expired/cancelled plans and grandfathered access. Dates follow the app language. |
| Temporary Premium | Added explicit access-grant messaging. Temporary access does not create or cancel a mandate; existing mandate management remains available. A grant no longer prompts a new subscription. |
| Trial duration | Uses server-provided remaining days and trial-end dates. Does not promise a new seven-day trial to an existing/ineligible shop. |
| Refresh/retry | Added explicit status refresh. It retries invoice loading, including when the billing-period date has not changed. |
| Owner permissions | Only owners can start checkout, change plans, update payment methods or cancel. Non-owners see the owner-management explanation and no invoices. |
| Pending changes | Preserves authorization resumption, eligible cancellation of a pending switch and whole-subscription cancellation. Blocks duplicate plan/payment setup while a replacement exists or status is unresolved. |
| Cancellation | Uses an in-page modal with a clear consequence, safe dismissal, keyboard cancellation and focus restoration. A pending backend cancellation is described as pending, not completed. |
| Payment history | Preserves invoice retrieval and links, with separate loading, empty and error states. Localized dates, amounts and invoice statuses. Unknown statuses are not labeled paid. Links require HTTPS. |
| Native companion | The purchase-free mobile companion portal remains purchase-free. Its paid-invoice restriction and cancellation access are retained and tested. The normal web app keeps Razorpay checkout. |
| Shop/account boundaries | A locked shop missing from the accessible shop list no longer falls back to another shop. Embedded content remounts for account/shop/role changes. Late checkout responses cannot open checkout after unmount. |

The existing shared checkout implementation, server verification, plan-change endpoints and payment provider remain in use. Displayed prices reuse the existing web plan configuration (₹499 monthly / ₹3,999 annually); provider configuration and live charging were not revalidated in this task.

## Design and localization

The new screen follows the newer shop UI: dark surfaces, saffron rules, a compact access summary, a separate management section and a payment ledger. Monthly/annual choices show their prices directly. On narrow screens the invoice table becomes labeled rows and action buttons stack.

Added 65 explicit Billing labels across English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Existing localized subscription headings/actions are reused, with a distinct Hinglish adapter. New account-state explanations are localized in the embedded web app rather than inheriting the older English-only account copy. Public account-page copy outside the embedded shop was not comprehensively rewritten.

## Verification

- `npm run build:verified` — passed after final changes, including the existing release checks and Next production build.
- New Billing tests — 13 passed: action eligibility, trial/temporary/pending states, owner permissions, native purchase restrictions, dates/URLs, confirmation behavior, duplicate clicks, unmounted checkout, invoice retry and locked-shop isolation.
- Existing mobile-account tests — 2 passed.
- Translation coverage — passed for all ten app languages.
- `git diff --check` — passed.
- Browser: 120 layout checks covering all ten languages at 320, 768 and 1135px, across active, trial, pending-switch and temporary-access states. No horizontal overflow or raw translation placeholders.
- Browser: 54 role/state combinations (18 states × Owner/Manager/Helper); non-owners had no billing mutations or invoices.
- Browser: plan selection and synthetic checkout dismissal passed. An earlier browser interaction stalled; the user reported no visible confirmation prompt, so a native-prompt cause was not established. On reconnect, the remaining interaction checks passed: confirmation dismissal, synthetic subscription cancellation, pending-plan cancellation, entitlement retry and invoice retry. Escape dismisses the new in-page dialog and restores trigger focus.
- Follow-up visual review corrected modal centering and checked all ten languages at 320px and 1135px: 20 dialogs were centered, contained within the viewport, and free of raw translation placeholders. Preview assets now use content hashes to avoid stale CSS during local review.

All fixture billing endpoints and checkout UI were synthetic. Invoice destinations in the preview are example URLs. No real billing action or provider checkout was used.

Evidence:
`/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/billing/`

Files: `billing-desktop.png`, `billing-hindi-mobile.png`, `checks.json`, `billing-confirmation.png`, `billing-confirmation-tamil-mobile.png`, `interaction-checks.json`.

Preview: `http://127.0.0.1:8010/?screen=billing&lang=en&role=OWNER&mode=active`.
