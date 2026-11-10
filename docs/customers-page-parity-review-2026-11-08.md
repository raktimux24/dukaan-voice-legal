# Customers review — 8 November 2026

Compared native `customers`, `customer-detail`, `customer-credit-notes`, `customer-debit-notes`, customer API/types, udhaar risk/nudges and backend customer/fiscal-list contracts with the web screens. Native comparison is source-based; no new simulator or physical-device acceptance was performed.

## Changes and parity

| Capability | Web outcome |
| --- | --- |
| Customer directory | Server-side name/phone search, explicit 50-row load-more pagination and All / Open balances filter. Backend `withBalance=1` includes both positive debt and negative advances; the new label accurately reflects that. |
| Overview | Outstanding positive debt, debtor count and active customer count. Missing/error data stays unknown rather than becoming zero. |
| Purchase context | Monthly purchase totals and last purchase dates in list and detail. Positive, settled and advance balances have distinct labels; advances display an absolute amount. |
| Create/edit | Focused shared form with Indian phone normalization. Both fields initialize from the customer. A name-only edit cannot blank the untouched phone (or vice versa). Create retries retain the same client ID and payload while the form remains mounted. |
| Ledger | Types, effective/recorded date, signed movement, note, method and resulting balance. Actual sale IDs link to bill details. The latest-entry scope and full-statement route are explicit. |
| Payments | Existing validated payment/allocation and retained-request recovery component preserved. Added full-balance shortcut; payment completion invalidates the summary too. Payment form stays mounted when collapsed or changing account tabs. |
| Actions | Statements/credit controls, payment follow-ups, paginated manual credit/debit note history, original-bill links and existing collection-allocation review. Native dedicated note routes are represented by the web's existing bill adjustment panels. |
| Details | Phone link, notes, existing import/opening profile, customer-specific nudges, edit and archive with explicit confirmation. Archiving keeps historical records. |
| Boundaries | Existing Owner/Manager and Premium gates retained. Existing offline permission downgrade retained, with a clearer reconnect explanation. Shop/user/customer switches remount local editor state; writes assert the active session. |

## Design

Uses the shared dark/saffron working-ledger style: restrained rows, strong account totals, focused create/edit sheet and Ledger / Actions / Details navigation. Financial entry is an expandable task rather than a permanently dominant form. At narrow widths the summary changes to readable label/value rows and the account navigation stays on one row. No new decorative imagery was needed for this data-heavy workflow.

English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam have explicit new customer copy, corrected balance/archive labels and translated payment-matching guidance. Existing shared GST, statement and import translations remain reused. Native-language human proofreading was not performed.

## Verification

- Seven focused tests passed: name-only edit, phone-only edit/normalization, clearing phone/no-op edit, invalid inputs, balance semantics, bill identity links, and page offsets/termination.
- `npm run build:verified` passed, including the existing financial, auth, previous page, product-photo/session and translation checks, TypeScript and production build. Final translation/type checks also passed after the reconnect copy adjustment.
- Translation coverage: 1,677 web labels across English and nine translated languages; placeholder checks passed.
- Browser: 120 directory/detail-tab layout combinations (ten languages × three widths, 320/768/1135), ten phone payment forms, and twenty final compact-detail/editor cases. No page/form horizontal overflow. A narrow-phone currency wrap was found visually and corrected; final account tabs stay on one row in all ten languages.
- Browser interactions: open-balance filter includes advances and excludes settled customers; combined name search; name-only synthetic edit preserves phone; full-balance shortcut; excess-decimal payment rejection; archive confirmation/cancel. Empty/error/loading, Premium and Helper gates checked. Offline follows the existing restricted-access model.
- No real customer creation/edit/archive, payment, collection allocation or fiscal-note mutation was submitted. Financial recovery code was preserved and included in existing regression checks; no new live financial recovery acceptance is claimed.

Evidence: task visualization directory `dashboard-review/customers/` contains customer list/detail and Hindi phone screenshots plus layout/state results. Preview runs actual screen components against local synthetic fixtures. Dedicated import, statement, follow-up and bill adjustment workflows retain their existing screens. Create-form retry retention is in memory only; it is not a cross-reload recovery journal. Changes remain local and are not deployed.
