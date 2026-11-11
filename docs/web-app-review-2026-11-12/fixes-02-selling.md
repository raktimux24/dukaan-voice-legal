# Selling fixes (02-selling.md)

Branch `cursor/webfix-selling`, from `origin/cursor/web-app-fixes-base`. 12 November 2026.

Totals: 10 fixed, 12 partly fixed, 16 skipped (38 findings).

Checks: `npx tsc --noEmit -p .` passes. `npm run check:release` passes (exit 0).

No money maths, rounding, GST calculation, invoice numbering, client ids, API request shapes or offline-safety checks were changed.

## Findings

| ID | Result | What was done, or why it was skipped |
|---|---|---|
| S01 | Partly fixed (message only) | The counter still locks while a bill is unconfirmed. On the web, checkout re-sends the saved request whenever one exists (`readPending` in checkout.tsx). If the cart unlocked, "charge" on a new cart would re-send the old bill. The app avoids this with an outbox queue that the web does not have. Unlocking needs that queue, so it was not attempted. The Sell banner now says in plain words that the last bill is not confirmed, warns against charging twice, and has one primary "Check the saved bill" button. |
| S02 | Fixed | The search box gets focus when the counter opens and when it becomes usable again. `/` or `F2` refocuses it from anywhere except text fields. The existing refocus after adding is kept. |
| S03 | Skipped | The USB scanner field accepts any code (`scannerCode`). The search box only treats input as a barcode when it is 4 or more digits, an `SB-` code or a cached alias. Removing the field could break alphanumeric Code 128 labels, and this can't be checked without real hardware. The Sell / Add stock switch matches the app's scanner, which has the same two tabs (`barcode-scanner.tsx`). |
| S04 | Skipped | The app does the same: an unknown code opens Add product (`router.replace` to add-product in `barcode-scanner.tsx`). An inline quick-add sheet would need a product-creation flow inside Sell. |
| S05 | Partly fixed | The added or changed line flashes once (700 ms; with reduced motion it gets a static accent bar instead) and scrolls into view. Screen readers hear "Added {name}". No beep and no pulse on the bill count. |
| S06 | Skipped (the app does the same) | The app blocks out-of-stock items and caps quantities at stock (`posStore.addProduct` returns null, `capped`). The web matches it. The cap also lives in `lib/shop/cart.ts`, outside this area. |
| S07 | Partly fixed | The label now reads "Total" (`pos.total`), as in the app. The pre-tax fallback number was not added: `lib/shop/sell.ts` deliberately never shows an untaxed amount as payable. |
| S08 | Skipped | The catalogue request depends on `coherentTax`, which comes from POS settings. Fetching both in parallel would change the request. |
| S09 | Skipped | Needs top-seller or pinned-item data and a new UI (M effort). |
| S10 | Partly fixed | Removed Refresh from the Sell header. Queries refetch on window focus, and the error banner keeps Try again. Estimates and + Add product stay. |
| S11 | Partly fixed | Quantity buttons are now 40×44 and Remove is 44×44 (grid widened to fit). "−" at the minimum still removes the line, because the app does the same (`dec` sets 0, and `setQuantity` filters the line out). No undo toast: `setNotice` takes text only. |
| S12 | Fixed | Clear bill and the low-stock warning use an in-app dialog with clear verbs ("Clear cart", "Charge anyway" / "Keep editing"). Both confirmations stay, as in the app (`Alert.alert` in the app's sell.tsx). |
| S13 | Skipped | New feature (line and % discounts). |
| S14 | Skipped | New feature (hold bills). The cart supports one draft per user and shop. |
| S15 | Skipped | Moving recovery out of GST settings touches another area's routes. Hiding the panel could hide pending journal rows that only `CounterStatus` reads. It stays collapsed by default. |
| S16 | Partly fixed | The dialog focuses its first field after it opens. When a search finds nothing, it says so and offers "Add '…' as new" (fills phone if digits, otherwise name). Not changed: helper access to customer search (an RBAC decision, since the customers list is Owner/Manager in the matrix), and phone before name. |
| S17 | Fixed | While tax snapshot, rounding policy or settings are still loading, the amount shows a waiting state and "Getting tax rates…", with no `role="alert"` box. The existing error and "Refresh billing details" appear if a read fails, or after 8 s. `canCharge` is unchanged, so charging stays blocked the same way. |
| S18 | Fixed | Cash chips use the app's `quickCashOptions` rule exactly: next ₹10/50/100/500/1,000/2,000 above the amount, skipping small steps on big bills, up to 4. "Exact" stays. |
| S19 | Partly fixed | "Cash received" gets focus once when it appears, unless focus is already elsewhere. Ctrl/Cmd+Enter confirms, but only when the confirm button itself is enabled; a hint shows next to Confirm. No number keys for methods: they would clash with typing amounts. |
| S20 | Fixed | "Review items & totals" opens by default for 5 lines or fewer. A line under the amount shows "Includes GST ₹X · Round off ₹Y" when either applies. It uses the totals checkout already computed. |
| S21 | Skipped (the app does the same) | The app's checkout lets any seller change price mode (`gst-controls.tsx`, no role check). The web matches it. |
| S22 | Partly fixed | If the QR fails to render, checkout shows the shop's saved QR (when there is one) and a real "Show QR again" button. The UPI confirm label was not changed. |
| S23 | Skipped | The wording lives in shared `counter.draft_*` locale keys used by other screens. Offering "charge anyway" when local saving fails would weaken an offline-safety check. |
| S24 | Fixed | When `?recorded=` is present, a success header shows "Paid ₹X" (or "Bill recorded · ₹X" for udhaar-only), the payment methods and the change given, Send on WhatsApp, and New sale (focused, so Enter starts the next bill). Refresh is hidden on that view. |
| S25 | Partly fixed | Ordinary bills get "Send on WhatsApp". It opens `wa.me` with the bill text, straight to the bill's mobile number when it is a valid Indian mobile, as the app's `sendBillOnWhatsApp` does; otherwise WhatsApp's own picker. If a pop-up blocker stops it, the share sheet opens instead. GST and branded bills still share through their verified document, as before. |
| S26 | Skipped | "Print after every sale" and receipt width are new shop settings (settings area, server). |
| S27 | Fixed | On the just-recorded view (`recorded=new`), stock provenance and cost & margin are not shown. They still show when the bill is opened later. |
| S28 | Partly fixed | Each returnable item has −/+ steppers (0 to the quantity left) and "All {qty}". The exact-quantity field stays. The "I have checked…" checkbox is removed, because the app's sale-return has none. The button still carries the amount. No Return button at the top of the bill or per item. Plan, payload and recovery are unchanged. |
| S29 | Skipped | Unifying GST and ordinary return flows is L effort and touches GST adjustment logic. |
| S30 | Fixed | Void is shown only when the bill is inside its window and settings have loaded, as in the app (`voidable` gate). The confirmation checkbox stays (the app confirms with an Alert). |
| S31 | Partly fixed | Search placeholder added ("Bill number, customer or item"). Row arrow `↗` became `›`. When a search finds nothing in the chosen period, a "Search all dates for '…'" button switches the period to All, using the existing filter. Search was not made all-dates by default, and the register and overview were not reordered. |
| S32 | Skipped | Row overflow actions and a Refunds tab are M effort and need share/print/return to run from the list. |
| S33 | Fixed | Refund rows no longer show the raw request UUID. The reason shows on its own line. |
| S34 | Skipped (the app does the same) | The app's checkout has the same "estimate reviewed" checkbox, and `estimateSource.reviewed` is part of the sale request. |
| S35 | Skipped | Reusing the Sell builder for estimates is M effort. |
| S36 | Fixed | The estimate list no longer repeats "Draft" in the meta line. The search has a placeholder. In the share dialog, "Choose app" (when the browser can share) or "Copy text" is the primary action, and the .txt download is secondary. |
| S37 | Partly fixed | Selling CSS only: bill-line targets are 44px, input-method links are 40px tall at 13px, and the tax summary and checkout step labels are 12px. New controls have visible focus rings. No shared `--focus-ring` token: that belongs to the shell or shared-tokens owner. |
| S38 | Skipped | The system-log messages are shared locale keys (`counter.outcome_unknown`, etc.) used across areas. Only new copy (the S01 banner) is written in plain words. |

## Behavioural decisions: what the app does

| Question | App | Web after this branch |
|---|---|---|
| Sell an item recorded as out of stock (S06) | Blocked with "out of stock" toast; quantities capped at stock | Unchanged; same as the app |
| Counter blocked while a bill waits to sync (S01) | Not blocked: completed sales queue in `outboxStore` and sync later | Still blocked. The web has a single pending request, not a queue, so it can't be unlocked safely. Message improved |
| Shortfall at checkout and Clear cart | Both confirmed with `Alert.alert` | Both confirmed with an in-app dialog |
| Return confirmation | No checkbox; one button with the amount | Checkbox removed; one button with the amount |
| Void confirmation and visibility | Shown only inside the void window; Alert confirmation | Shown only inside the window; checkbox confirmation kept |
| Estimate to bill | "Estimate reviewed" checkbox at checkout | Unchanged; same as the app |
| Who may switch GST included/added | Any seller at checkout | Unchanged; same as the app |
| Cash chips | `quickCashOptions` round-ups | Same rule |
| WhatsApp receipt | Opens WhatsApp with bill text, to the customer's mobile when valid | Same, via `wa.me` |
| "−" at minimum quantity | Removes the line | Unchanged; same as the app |
| Unknown barcode | Opens Add product | Unchanged; same as the app |

## Files changed

- `app/components/shop/screens/sell.tsx`
- `app/components/shop/screens/checkout.tsx`
- `app/components/shop/customer-attach.tsx`
- `app/components/shop/screens/sale-detail.tsx`
- `app/components/shop/sale-return-editor.tsx`
- `app/components/shop/screens/sales.tsx`
- `app/components/shop/counter-filters.tsx`
- `app/components/shop/screens/refunds.tsx`
- `app/components/shop/screens/estimate-workspace.tsx`
- `app/shop/styles/fixes-selling.css`
- `app/lib/shop/retail-locales.json` (one key, see below)
- Tests: `tests/sell-workspace.test.cjs`, `tests/checkout-workspace.test.cjs`, `tests/sales-workspace.test.cjs`

### Test changes (each for an intentional behaviour change)

- sell: the shortfall test uses the in-app dialog instead of `window.confirm`. New test: search has focus on open, and clearing asks in the app.
- checkout: new test for the app's cash chips, cash-field focus and Ctrl+Enter.
- sales:
  - The void test was split in two: void is hidden when settings fail, and it stays blocked offline inside its window.
  - The return tests no longer tick the removed confirmation checkbox.
  - New tests for the return steppers and the just-recorded success header (WhatsApp URL, focus, no Refresh, no cost detail).
  - The `share-bill` mock gained `billPlainText`, and `useSearchParams` reads a variable.

## New translation keys (English fallbacks in code)

| Key | English |
|---|---|
| `sellweb.pending_title` | The last bill is not confirmed yet |
| `sellweb.pending_help` | The internet may have dropped while it was saving. Open it and check it again before the next bill, so the customer is not charged twice. |
| `sellweb.pending_action` | Check the saved bill |
| `sellweb.added` | Added {{name}} |
| `sellweb.clear_body` | {{n}} items will be removed from this bill. |
| `sellweb.charge_anyway` | Charge anyway |
| `sellweb.keep_editing` | Keep editing |
| `checkoutweb.getting_tax` | Getting tax rates… |
| `checkoutweb.includes_gst` | Includes GST {{amount}} |
| `checkoutweb.round_off_line` | Round off {{amount}} |
| `checkoutweb.ctrl` | Ctrl |
| `checkoutweb.shortcut_confirm` | confirms |
| `checkoutweb.qr_failed` | The QR could not be shown. |
| `checkoutweb.qr_again` | Show QR again |
| `checkoutweb.no_customer_match` | No saved customer matches “{{q}}”. |
| `checkoutweb.add_typed_customer` | Add “{{q}}” as new |
| `salesweb.paid_amount` | Paid {{amount}} |
| `salesweb.recorded_amount` | Bill recorded · {{amount}} |
| `salesweb.change_given` | Change {{amount}} |
| `salesweb.return_all_of` | All {{quantity}} |
| `salesweb.search_all_dates` | Search all dates for “{{q}}” |
| `salesweb.search_placeholder` | Bill number, customer or item |
| `whatsapp_receipt.send` | Send on WhatsApp (same key and text as the app) |
| `estimates.web.search_placeholder` | Customer name or estimate number |

`tests/estimate-editor.mjs` requires every `estimates.*` key in every language of `retail-locales.json`. So `estimates.web.search_placeholder` was added to all 10 languages with the English text as a placeholder; it needs translating. The other keys use their in-code fallbacks and need adding to the translation catalogue.

Existing keys reused: `pos.total`, `pos.clear_cart`, `pos.clear_cart_title`, `pos.short_stock_title`, `pos.short_stock_body`, `checkoutweb.qr_alt`, `checkoutweb.static_qr`, `a11y.decrease`, `a11y.increase`, `sale_complete.new_sale`.

## Test by hand before release

1. **Ctrl/Cmd+Enter at checkout.** It charges whenever the confirm button is enabled, from any field on the page. Check that a cashier typing an amount cannot trigger it by accident.
2. **Returns without the checkbox.** A refund is now one click on "Refund ₹X", as in the app. The owner should confirm this is acceptable on the web.
3. **Void is hidden when POS settings fail to load or the window has passed.** Earlier it showed as disabled. Check that owners can still find it inside the window.
4. **Checkout loading on a GST-registered shop on a slow network.**
   - The amount should show "…" and "Getting tax rates…", with charging blocked.
   - After 8 s, or on a failed read, the old error and refresh button should appear.
   - Check the composition and unsupported-protocol paths still show "Unavailable" at once.
5. **Search focus with a real USB barcode gun.**
   - Check that the first scan lands in search after opening Sell, and after coming back from checkout.
   - Check that `/` and F2 do not interfere with the voice page or the sheets.
6. **WhatsApp from the bill page on Windows and Mac browsers.**
   - Check `wa.me` with and without a phone, and with a pop-up blocker (it should fall back to the share sheet).
   - The bill text, including the customer's number, goes to WhatsApp as on the app.
7. **New sale gets focus on the bill page after charging.** A second Enter press opens a new Sell page. That is harmless, since the sale is already recorded, but check the feel.
8. **Bill-line grid widths changed.** Qty column 148px and Remove 44px on desktop; 134px/44px at 900–1199px. Check 701–1199px and phone (≤700px) layouts with long names and price edits.
9. **Return steppers on weight items (0.25 kg step) and RSP items (step 1).** Check that the computed refund matches typing the same quantity.
