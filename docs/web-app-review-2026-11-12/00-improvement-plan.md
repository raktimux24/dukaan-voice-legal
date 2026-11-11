# Web app improvement plan

12 November 2026. Combined from five area reviews (201 findings) in this folder:

| Report | Area | Findings |
|---|---|---|
| [01-shell-home-voice.md](01-shell-home-voice.md) | Shell, Home, voice, alerts, brief, onboarding, consistency | 40 |
| [02-selling.md](02-selling.md) | Sell, checkout, bill, sales register, returns, estimates | 38 |
| [03-stock-buying.md](03-stock-buying.md) | Products, import, buy list, suppliers, orders, supplier invoices | 39 |
| [04-people-money-reports.md](04-people-money-reports.md) | Customers, udhaar, follow-ups, staff, cashbook, reports, activity | 44 |
| [05-settings-gst-store.md](05-settings-gst-store.md) | Settings, shop profile, payments, GST, billing, online store | 40 |

## How this was done, and its limits

- Each reviewer read the screen code plus 26 screenshots of the live app (`screens/`), taken at 1440px wide as an Owner, showing only the top of each page.
- Nothing was clicked through. Anything below the fold, inside a dialog, on a phone, or in a Manager/Helper role was judged from code. Findings marked "(from code)" in the reports need a real check before work starts.
- Spot-checked against code by the manager: the supplier-invoice redirect, the low-stock default of 0, and the pages missing from the sidebar are confirmed. The Sell search focus and the voice window focus look right from code but were not seen live.

## The five themes

1. **Voice-first in name, not yet in use.** The mic is only on Home and Sell; the voice window opens focused on Close and says "Please verify the command" before anything is said.
2. **Daily jobs are hidden.** Cashbook, purchase orders, supplier invoices, estimates and the online store are not in the sidebar. Taking a repayment sits in a collapsed panel. Payment follow-ups show nobody while 14 customers owe ₹75,591.50.
3. **Too many confirmations and too much system language.** "I have checked…" checkboxes, required notes, "Retain count & close day", "installation identity", a 40-word GST-law statement to save a supplier invoice.
4. **Pages built one at a time.** 5 tab styles, 4 stat-row styles, 4 empty-state styles, text-only "Loading…", a Refresh button on almost every page, about 25 breakpoints and 7 saffron shades.
5. **Defaults and dead ends that cost the shop.** A new product never shows as low stock (alert level 0). A supplier invoice without an order does not add stock. Out-of-stock items cannot be sold. A dropped connection may lock the counter.

## Plan

### Phase 0 — Fix what is broken (small, do first)
- Supplier invoice links land on a blank new-invoice form (`app/shop/purchases/page.tsx` redirects unless `?list=1`; the supplier-page link omits it).
- "Products" tab wraps mid-word on Online store; "Daily cashbook" tab wraps on Cashbook.
- Billing shows "Current plan —" and repeats "Premium included for now".
- New product low-stock alert defaults to 0.
- Voice window: focus the main button, not Close; fix the first-screen wording; stop showing a GST recovery message for voice errors.
- Sell: focus the search box on open so the first scan is not lost.
- Back links that point to the wrong parent ("← Settings" on Staff).
- Reports: an empty message for a blank chart.

### Phase 1 — Navigation and the shell
- Sidebar: scroll when the screen is short; add a **Restock** group (Buy list, Purchase orders, Supplier bills, Suppliers) and a **Money** group (Cashbook, Customers); add Online store and Estimates.
- Top bar on every page: search, mic, one "New sale" button, with keyboard shortcuts.
- One account menu with sign-out confirmation; shop name shown once.

### Phase 2 — One set of shared pieces
- One tab component, one stat row, one empty state, one page header, skeleton loading in place of "Loading…".
- Tokens: one saffron scale, a type scale with nothing under 12px, three radii, three breakpoints. Fix sidebar label contrast (about 2.9:1 today).
- Replace per-page Refresh buttons with automatic refresh.

### Phase 3 — Home and voice
- Home: today's sales first, then search / scan / voice, then one "Needs attention" list where each row can be acted on. Drop the streak card from the top slot and the tiles that repeat the sidebar.
- Voice: a clear idle → listening → review → done sequence, returning to where it was opened.

### Phase 4 — Selling
- Scan feedback (sound or flash) and a single scan mode.
- Let the cashier keep selling when one bill is waiting to sync (check on a real shop first).
- Allow selling an item recorded as out of stock, with a warning.
- Checkout: keyboard path, sensible cash buttons, calm loading for GST rates.
- After the sale: a clear success screen with WhatsApp to the customer's number and print.
- Sales search across all dates, not only the selected period.
- Returns: fewer steps, same flow for GST and non-GST bills.

### Phase 5 — Customers and money
- "Receive payment" as the main action on a customer, with the balance after payment.
- Follow-ups rebuilt around "who owes most", no due date needed.
- Guided count-and-close for the day, available to managers, with short/extra shown in words and colour.
- Reports open on this week with top sellers near the top.
- Plain shop wording in Activity and Cashbook.

### Phase 6 — Restocking and import
- One guided path: low stock → buy list → order → receive → supplier bill, with one name for "stock arriving".
- Buy list: select several items and order them together; "add all low stock".
- Supplier invoice adds stock by default; shorten the GST statement.
- Import saves the good rows and lists the bad ones.

### Phase 7 — Settings, GST and the online store
- Settings organised by job; move daily work (Customers, Cashbook, Purchases) out of it.
- GST: three owner views (Setup, This month's summary and files, Products missing GST) with a net amount to pay; everything else under Advanced.
- Enter the shop address and phone once.
- Warn before actions that cannot be undone (locking the GST profile, unpublishing the store, deleting the shop).
- Online store: in the sidebar, with a signal for new orders and a shorter order-to-bill path.

## Open questions for the owner
- Should a Manager be able to close the day?
- Should out-of-stock items be sellable with a warning?
- Which confirmations are legally required and must stay?
