# Sales and bill details parity — 8 November 2026

## Scope and evidence

Compared the current native Sales, sale-detail and sale-return screens, their API/types, verified sale-balance helper and server contracts with the web implementation. Native source references include `app/(tabs)/sales.tsx`, `app/(modals)/sale-detail.tsx`, `app/(modals)/sale-return.tsx`, `src/lib/pos/sale-balance.ts`, `src/api/sales.ts` and `src/api/fiscal-adjustments.ts` in the mobile repository.

This is source-based mobile comparison, actual web-component testing and local browser verification with synthetic data. The native flow was not replayed in a simulator during this revision. No live sale, refund, void, payment or inventory change was made. Changes remain local in `codex/web-home-parity-design-20261107` with the existing Home, Sell and checkout work.

## Parity and implementation

| Area | Result |
| --- | --- |
| Period summary | Added revenue, bill count, average bill before returns and returned value. The summary API accepts dates only, so visible copy distinguishes period totals from filtered ledger results. |
| Search and filtering | Retains date presets/custom dates, search, status, payment and udhaar filters. Pagination keeps the current filters; opening and leaving a bill preserves the ledger URL. Invalid custom ranges do not request data. |
| Register tools | Estimates, saved-request recovery, pending checkout, refunds and Premium CSV export remain accessible. Recovery is scoped to the current user and shop. Export and management links respect permissions. |
| Role and history limits | Helper restrictions and limited-history/Premium states remain. Server-side visibility remains authoritative; cost, margin and customer-account actions are gated. |
| Bill identity and items | Shows bill/invoice identity, customer, seller, payment status and total in a continuous bill sheet. Item rows include current private-product image slots, batch provenance and cost/margin where permitted. Current photos remain outside the immutable receipt. |
| Customer balance | Added the native balance verification logic: identity and original/allocated/refunded/reduced/remaining arithmetic must reconcile before a current invoice balance is displayed as verified. |
| Payments and returns | Shows original payment methods, references, cash tender/change, return items, restock disposition and refund/credit-reduction settlement. Credit is not presented as money already collected. |
| Financial documents | Preserves verified GST/mixed/rounded issued-document preview, sharing and printing. Fiscal tax breakdown remains in the verified document rather than being reconstructed from generic subtotal fields. Adds cursor-based debit/manual-credit history and links to the existing adjustment/document surfaces. |
| Ordinary returns | Added per-item quantities and restocking, strict decimal validation, ordinary non-credit refund override, permitted refund methods, verified credit capacity/evidence and explicit review confirmation. Uses the existing retained financial transport. |
| GST returns | Added per-item restocking and quantity/range/whole-package guards to the existing verified planner/editor. Successful new or recovered adjustments refresh the bill and related lists. |
| Return recovery | An uncertain submission locks editing and retries the original retained payload. Storage failure blocks a new return. Pending fiscal requests expose recovery instead of allowing a competing submission. |
| Void | Requires a completed non-fiscal bill, known valid shop settings, an unexpired configured void window, connectivity, permissions and explicit confirmation. The age is checked again at submission. |
| Languages | New and newly exposed copy is explicit in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Translation checks cover placeholders and explicit web-label precedence. |

## Layout

The Sales screen has a compact period overview followed by one searchable ledger. Bill rows keep identity, customer/item context, collection state and amount together, with a readable stacked treatment on small screens. Register tools sit in a disclosure.

Bill details use one full-width sheet with a saffron rule, prominent total, share/print actions, item rows, payment information and return history. Management actions and receipt preview expand on demand. The page uses ordinary document scrolling and the same charcoal, cream and saffron treatment as Sell and checkout.

## Validation

- `npm run build:verified` passed the existing financial/GST/recovery, translation, billing, cashbook, account, follow-up, auth, Home, Sell, checkout and photo-session checks, plus TypeScript and the Next production build.
- `npm run test:sales`: 17 passing checks exercise actual components and financial helpers. Coverage includes date-only summary scope, filters and return navigation, cursor pagination, Helper restrictions, void readiness/confirmation, photos outside the receipt, verified balance arithmetic, strict return decimals, restock/refund payloads, credit allocation and evidence, retained retries, storage failures and the actual GST editor's per-line restocking and refresh callback.
- Translation coverage passed for 1,355 web labels across nine translated languages plus English.
- Browser layout matrix: Sales and bill details with the return editor expanded, in all ten languages at 320, 768 and 1135 px (60 cases). No document horizontal overflow, blank headings or return-editor overflow was observed.
- Additional browser checks covered search, filter preservation through a bill and back, custom dates, empty/error states, Helper restrictions and decimal return input. No financial operation was submitted.
- Final TypeScript and focused Sales checks passed after finishing changes. The final production build passed after the last layout and fiscal-summary changes.

Evidence: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/sales/`, including the layout matrix and desktop/mobile screenshots.

## Limits

Native OS sharing and browser sharing/Print-to-PDF remain platform-specific. Native outbox storage and retained browser requests are separate device-local recovery systems. This revision does not establish physical printing, native share-sheet, live financial-operation, production offline or human native-language editorial acceptance. Existing verified-document navigation is retained; not every native per-document deep link has been duplicated.
