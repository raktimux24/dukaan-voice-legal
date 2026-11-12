# Second pass: shared pieces and cross-page fixes

Branch `cursor/webfix2-shell`, from `origin/cursor/web-app-second-pass`. 12 November 2026.

Checks: `npx tsc --noEmit -p .` passes. `npm run check:release` passes (exit 0, every suite `fail 0`).

No server, request payload, money, stock, idempotency, recovery or counter-lock logic was changed.

## Results

Totals: 11 fixed, 3 partly fixed (the three wording items, which need the locale files), 1 skipped.

| Item | Result | What was done, or why not |
|---|---|---|
| D6 / F41 / selling S10: page Refresh buttons | Fixed | Removed from 14 pages. Each keeps fresh through the app-wide query default (`refetchOnWindowFocus: true`, 15 s `staleTime`, in `providers.tsx`) plus the extras listed below. Every error state keeps or gains a "Try again". Buttons that start a job or sit next to a form or recovery flow were kept (list below). |
| F44 / stock S36: loading and empty states | Fixed | `Spinner` now draws a one-line skeleton bar (label kept for screen readers), so every remaining "Loading…" text in the app is gone at once. Lists use `Skeleton` rows or cards with their final shape. Ad-hoc empty blocks use `EmptyState` (list below). Customers summary tiles show a skeleton while loading instead of "—". |
| D1 (rest): tagline kickers | Fixed | Removed "Make it yours" (Settings), "Shop journal" (Activity), "Stock on hand" (Products), "Purchasing" (Buy list, Suppliers, Supplier invoices, Record supplier invoice), "Catalog" (product form), and the "Settings" parent kicker on Shop profile, Payments & bills and Bill design (their back link already says Settings). Rail-group kickers stay (Counter on Sales, People on Customers and Staff, Insights on Reports). Detail-page labels stay (product category, invoice number, "Customer", supplier "Inventory receipts" / "Business details"). Billing and Purchase orders were not touched (wiring screens owned by others). |
| Shell S4 (rest): Sales "New sale" | Fixed | The page-level "New sale ＋" on Sales is gone; the top bar's New sale (Alt+N) is the one entry. |
| Settings S2 (rest): Cashbook in Settings | Fixed | `settingsLinks` no longer lists Cashbook or Customers (both are in the sidebar). The Customers filter in `settings.tsx` is removed because the list itself is now right. Purchases and Online store stay, as on mobile. |
| Stock S38 (rest): disabled buttons | Fixed | `.shop-btn:disabled` is now neutral grey (#1b1b22 background, #8a8a90 text, line-colour border, full opacity) instead of 45% faded saffron. Quiet buttons stay transparent when disabled. Per-screen "why is this disabled" reasons were not added. |
| Selling S37 (rest) / settings A2: focus ring and tokens | Fixed | New `--focus-ring-color` (#ff9854) and `--focus-ring` on `.shop-root`, a lighter ring in high-contrast mode, used by the global focus style and by all 15 per-area focus outlines in `shop.css` plus the two in `fixes-selling.css` (they used five slightly different oranges). Plain brand saffron `#ff6b00` is now `var(--color-saffron)` in `shop.css` (76 places) and the shell CSS. Other saffron tints (#ff9857, #ff8a33…) and the settings greys have no matching token, so they were left as they are. |
| Stock S39: phone tab bar | Fixed (checked) | The More tab from the first pass lists every sidebar group, including the whole Stock group (Buy list, Purchase orders, Supplier invoices, Suppliers), plus Settings and Billing. That is the review's "More sheet" option. Alerts and voice stay in the phone top bar. No change needed. |
| Settings C1: new-order signal | Skipped | No client query returns a count of new orders. The online-store orders read returns a page of orders, only on that page, and Alerts counts only stock, expiry and AI. A badge would need a new read in the shell or a server count. |
| Selling S31 (rest): register before overview | Fixed | The Sales register now comes first and the period overview sits under it. Layout only. When totals fail, the overview shows a short message with "Try again" (it used to say "Your bill list is below", which is no longer true). |
| Selling S11 (rest): undo a removed line | Fixed | Removing a line (× or "−" down to zero) shows "Removed {name} · Undo" for 6 s. Undo puts the same line back in the same place through the existing `cartApi.patch`. It does nothing if the cart is locked, or if that product is already back on the bill. `lib/shop/cart.ts` is unchanged. Clearing the bill drops the undo. Mobile has no undo; this was asked for explicitly. |
| Nit: "1 items will be removed" | Fixed | Clear-bill dialog uses `sellweb.clear_body_one` for one item, the same one/other pattern as `homeweb.alerts_bulk_one/_other`. |
| Selling S38: counter system-log wording | Partly | Wording proposed below; locale JSON not edited. |
| Selling S23: draft wording | Partly | Wording proposed below; no "charge anyway" path. |
| Settings S17: `documents.uncertain` | Partly | Wording proposed below. |

### Refresh buttons: page by page

| Page | Refresh | What keeps it fresh now | Error retry |
|---|---|---|---|
| Home | Removed | Focus refetch, plus `refetchInterval` 30 s on stats, today's sales, recent bills and alerts | Each section's "Try again" (unchanged) |
| Sales | Removed ("Refresh register") | Focus refetch on bills and totals; the recovery journal polls every 10 s | "Reset pages" for the list (unchanged); new "Try again" for totals |
| Bill (sale detail) | Removed | Focus refetch on the bill, settings and saved-return check; after void/return the page still refreshes itself | "Try again" (unchanged) |
| Products | Removed | Focus refetch on the catalogue | New "Try again" under the error |
| Product detail | Removed | Focus refetch on catalogue, batches, history, sales; after each stock action the page still refreshes itself | "Retry" (unchanged) |
| Buy list | Removed | Focus refetch; every add/edit still invalidates the list | "Retry" (unchanged) |
| Suppliers | Removed | Focus refetch on directory, receipts and order counts (compare tab too) | New "Try again" for the list and for compare |
| Supplier (receipts) detail | Removed | Focus refetch | New "Try again" |
| Supplier (saved) detail | Removed | Focus refetch | `ReadState` "Retry" (unchanged); new "Try again" for orders/receipts |
| Supplier invoices | Removed ("Refresh records & totals") | Focus refetch on settings, invoices, totals and suppliers | `ReadState` "Retry" (unchanged) |
| Customers | Removed | Focus refetch on list and summary | New "Try again" |
| Customer detail | Removed | Focus refetch | New "Try again" |
| Staff | Removed | Focus refetch on members and tax permissions | New "Try again" for members and for missing permission details |
| Reports | Removed | Focus refetch on the active report, top products and history | "Try again" (unchanged) |
| Activity | Removed | Focus refetch with `staleTime: 0` | "Try again" (unchanged) |
| Sell | Already removed in the first pass | | |
| Daily brief | **Kept** | It runs `runBrief` on the server (a job), not a re-read | |
| Alerts "Refresh predictions" | **Kept** | It runs `generatePredictions` (a paid job), as D6 allows | |
| Payments & bills, Bill design | **Kept** | These forms turn focus refetch off on purpose so an open edit is not overwritten; the button is the only way to reload | |
| Supplier invoice detail | **Kept** | Sits next to the unconfirmed-save recovery card for that invoice | |
| GST records, reports, tools, RSP, product tax | **Kept** | "Refresh report" / "Refresh saved results" are part of confirming a GST run or recovery, not a plain re-read | |
| Checkout "Refresh billing details" | **Kept** | It is the error-state retry | |

### Empty and loading states moved to the shared pieces

- `EmptyState`: Sales (no bills), Products (no products, nothing in this view), Buy list, Customers, Customer ledger, Staff (no match, member not found), Suppliers (list, compare), Activity, Alerts (4 states), Daily brief, Refunds.
- `Skeleton`: Sales list and totals, Products, Buy list, Customers list and tiles, Customer detail, Staff, Suppliers, Supplier detail, Reports, Activity.
- Everything else that still uses `Spinner` now shows a skeleton bar.
- Not converted: Sell's empty bill and no-match panel (designed counter states with their own actions), estimate empties, product-detail sub-lists, and views owned by other agents.

## Files changed

- `app/components/shop/ui.tsx`: `Spinner` draws a skeleton bar; `EmptyState` takes an optional `className`.
- `app/lib/shop/settings.ts`: Customers and Cashbook removed from Settings links.
- `app/shop/shop.css`: focus-ring tokens and high-contrast ring, neutral disabled buttons, per-area focus outlines on the token, `#ff6b00` to `var(--color-saffron)`.
- `app/shop/styles/fixes-shell.css`: spinner, empty-state actions, token swaps.
- `app/shop/styles/fixes-selling.css`: undo bar, Sales totals error row, focus outlines on the token.
- Screens: `activity`, `alerts`, `brief`, `buy-list`, `customer-detail`, `customers`, `document-branding`, `gst-supplier-detail`, `home`, `payments`, `product-detail`, `product-form`, `products`, `purchase-new`, `purchases`, `refunds`, `reports`, `sale-detail`, `sales`, `sell`, `settings`, `shop-settings`, `staff`, `supplier-detail`, `suppliers`.
- Tests:
  - `tests/home-dashboard.test.cjs`: the helper test clicked Home's Refresh. It now checks that Home has no Refresh button and that a helper's Home still never reads restricted data. Changed on purpose, because the button was removed.
  - `tests/sales-workspace.test.cjs`: the ui mock gained `Skeleton` and `EmptyState` so the Sales screen can render. No assertion changed.

## New translation keys (English fallback in code)

| Key | English |
|---|---|
| `sellweb.clear_body_one` | 1 item will be removed from this bill. |
| `sellweb.line_removed` | Removed {{name}} |
| `sellweb.undo` | Undo |
| `salesweb.summary_totals_unavailable` | Period totals could not be loaded. |

Existing keys reused: `common.retry`, `common.loading`.

Keys no longer used by the web app (safe to leave; remove later if wanted): `homeweb.refresh`, `homeweb.refreshing`, `settingsweb.kicker`, `activityweb.journal`, `salesweb.summary_unavailable`, `counter.refresh`, `settings.customers_udhaar`.

## Reworded keys (please apply to the locale files and translate)

| Key | New English |
|---|---|
| `activityweb.empty_hint` | Try another filter. New changes show up here on their own. (fallback in code already updated; it mentioned the removed Refresh) |
| `counter.outcome_unknown` | The internet dropped while this bill was saving, so we can't tell if it went through. Don't charge again. Open the saved bill when you're back online and check it. |
| `counter.pending_outcomes` | {{n}} bills are not confirmed yet. Check them before you charge again. |
| `counter.recovery` | Bills not confirmed yet |
| `counter.recovery_storage_error` | We couldn't read the bills saved on this computer. Check them before you start another bill. |
| `counter.draft_saving` | Saving this bill on this computer… |
| `counter.draft_saved` | Bill saved on this computer |
| `counter.draft_error` | This bill couldn't be saved on this computer. Keep this page open and press Save again before you charge. |
| `counter.draft_retry` | Save again |
| `counter.draft_changed` | This bill was changed in another tab. Check the items before you charge. |
| `documents.uncertain` | We couldn't confirm your last save. Press Check to see if it went through before you change anything else. |
| `documents.check_result` (optional, the button next to it) | Check last save |

## Test by hand

1. **Data stays fresh without Refresh.** On Sales, Products, Customers, Staff, Reports and Activity, make a change in another tab (or on the phone), come back to this tab, and check the page updates within a second. Home should also update on its own within 30 s while the tab stays open.
2. **Errors still offer a way out.** Go offline or block the API, open each page above, and check there is a "Try again" next to the error, and that it works once back online.
3. **Sales layout.** The register is first, the period overview below it. Long lists with "Load more" push the overview down; check that is acceptable. Break the totals read and check the "Try again" under "Period overview".
4. **Undo on the bill.** Add three items, remove the middle one with ×, press Undo: it returns to the middle. Repeat with "−" down to zero. Check Undo disappears after about 6 s, after Clear bill, and while a bill is unconfirmed (counter locked). Add the same product again before pressing Undo: Undo should do nothing.
5. **Clear bill with one item** reads "1 item will be removed from this bill."
6. **Disabled buttons.** Look at a disabled primary button (for example Save Product while saving, or Review & charge with an empty bill): grey, readable, not muddy orange. Check quiet buttons and danger buttons when disabled.
7. **Focus ring.** Tab through the shell, Home, Sell, Checkout, Sales, Reports, Activity, Settings and Billing: one light-orange ring everywhere. Turn on high contrast in Settings and check the ring is lighter.
8. **Loading states.** On a slow network (DevTools "Slow 3G"), open Products, Sales, Customers and Reports: grey skeleton blocks instead of "Loading…" text, and the animation stops with reduced motion on.
9. **Settings › Shop list.** No Cashbook or Customers entries; Purchases and Online store still there for owners and managers.
10. **Saffron swap.** Spot-check a few saffron elements (primary buttons, active tabs, progress bars) look the same as before.
