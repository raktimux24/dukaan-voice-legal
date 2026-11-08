# Supplier Invoices: parity and responsive redesign

Date: 9 November 2026. Branch: `codex/supplier-invoices-parity-design`.

## Scope and evidence

Compared the mobile invoice list, detail and entry screens with their web equivalents. Mobile sources: `app/(modals)/purchases.tsx`, `purchase-detail.tsx`, `purchase-new.tsx`, `src/components/pos/purchase-invoice-detail.tsx`, `recorded-invoice-sections.tsx`, and `src/lib/pos/purchase-capability.ts` in the mobile repository. Web changes are under `app/components/shop/screens/purchase*.tsx` and the shared invoice presentation components.

This was a source parity audit and local browser review of the actual web components with synthetic API responses. It was not a production financial-ledger acceptance run or a physical-device test. No live invoice, payment, return or tax decision was recorded. No deployment was requested for this iteration.

## Parity findings and implementation

| Workflow | Previous web behavior | Result |
| --- | --- | --- |
| Invoice list and reporting | Combined into one lengthy screen | Separate Recorded invoices and Reports & exports, matching the mobile organization. Period links, supplier filter, refresh and pagination retained. Added explicitly scoped search of loaded invoice numbers and supplier names. |
| Server capability | Creation availability could obscure access to existing records | Compatible protocol with recording disabled retains read access. Unknown/incompatible capability blocks new records; retry is available. |
| Invoice overview | Long details block; no reviewed-credit balance | Clear invoice total, owed/recoverable balances, purchase tax and signed reviewed-credit balance. Product rows include image slots, localized units and stock action. Snapshot details remain expandable. |
| Detail navigation | Overview and operational forms shared one long page | Details, Actions and History tabs. Draft action fields survive tab switches; user/shop/invoice changes reset local form state. |
| History | Reviews, credits and cost changes; incomplete payment visibility | Added payment/refund/reversal entries and the relevant dates, notes and evidence references. Credit dates/evidence are visible. |
| Record invoice | Existing supplier → invoice → products flow | Preserved the three-step flow, original invoice matching, tax confirmation and stock choices; added responsive styling and a sticky action area above mobile navigation. |
| Purchase-order receipt source | Existing receipt/batch linking | Preserved source loading and existing-stock linking; quantity/stock protections remain. Not separately replayed against a live receipt in this review. |
| Payments and refunds | Existing operations and balance validation | Retained, with balances next to the action. Corrections keep original entries and evidence. These actions record ledger entries; they do not transfer money. |
| Credits and returns | Existing quantity checks and stock removal options | Retained, including duplicate document protection, returned-quantity limits and localized quantity labels. |
| Input tax review | Existing conditions, preview and cost movements | Retained. Cost preview loads when its action section is opened. Recorded review is not a filed claim. |
| Recovery and exports | Existing retained requests and purchase register paths | Preserved recovery controls and export routes. Detailed accounting reconciliation remains accessible on Reports & exports. |
| Permissions | Cost-bearing screens restricted to management | Restricted queries and forms for users without cost permission. Existing offline policy reduces permissions and blocks this screen. Server authorization remains authoritative. |

## Design and localization

The list uses supplier-first rows rather than a wide table. Saffron rules, restrained dark surfaces and typography follow the recent web screens. Details prioritize balances and products; infrequent accounting information uses disclosures. Forms and action buttons wrap on narrow screens.

Added ten explicit labels in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Existing shared translations remain in use for financial operations. Supplier balances now have an explicit label, preventing the generic Outstanding alias from resolving to customer udhaar. Reports & exports is explicitly translated. Product quantities use the shared unit labels.

## Verification

- Full `npm run build:verified` passed during implementation, including the existing release suite.
- Final `npm run test:purchases`: 5 passed, covering capability gating, invoice search, inclusive/invalid period links, signed reviewed-credit movements and localized supplier balance labels.
- Final translation check passed: 2,095 web labels across nine translated languages plus English; interpolation and mobile catalogs checked.
- Final production build and TypeScript check passed. `git diff --check` passed.
- Browser: 160 checks at 320px and 390px across all ten languages. Covered list, expanded reports, expanded details, expanded actions, history, and all three entry steps with a product selected. No document overflow, clipped controls or unresolved translation keys found in the final runs.
- List and details checked at 768px, 1024px and 1440px. English desktop/mobile and Malayalam history screenshots saved. No console errors observed on the final detail view.
- Empty, loading, failed capability, unsupported capability and read-only states inspected. Helper and offline modes blocked cost access; Manager loaded the ledger. These tests use the shared permission model and synthetic settings.
- Search no-match/clear, next-page loading and searching a newly loaded invoice passed. Purchase-register link preserved the selected inclusive dates.
- Local synthetic mutations exercised: an over-balance payment was rejected; a valid payment and payment correction emitted the expected requests; duplicate credit number was blocked; an excessive return quantity was rejected and a valid return emitted the expected request; deferred input-tax review submitted; invoice creation succeeded after valid totals and confirmations. Editing price invalidated the prior review and blocked a mismatched total.

Production API behavior, export file contents, pending-request network interruption recovery and a physical handset were not replayed in this iteration. Existing tests and unchanged implementation provide coverage for retained operations; that is distinct from live acceptance.

## Review artifacts

Local preview: `http://127.0.0.1:8010/?screen=invoices&lang=en&role=OWNER&review=invoice-v2` (synthetic data).

Evidence directory:
`/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/supplier-invoices-review-2026-11-09/`

Contains `layouts-first.json`, `layouts-second.json`, `compose-first.json`, `compose-second.json`, `wide-layouts.json`, `access-states.json` and representative screenshots. Build logs: `/tmp/invoice-build.log` and `/tmp/invoice-final-build.log`.
