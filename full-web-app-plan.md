# Samaan-Bol web app — feature parity plan

The web app becomes a second client of the mobile API. Billing stays on `/account`. Voice stays on the phone. This document is the build sequence, the rules the API already enforces, and the cases to test before calling a phase done.

The mobile product lives in [raktimux24/inventory-mobile](https://github.com/raktimux24/inventory-mobile). This repo (`dukaan-voice-legal`) is the Next.js site on `samaanbol.space`.

## Outcome

A shop owner signs in on `samaanbol.space` with the same Clerk account as the phone, picks a shop, and can run the counter, catalog, sales desk, customers, and reports. A sale made on the laptop shows up in the phone’s sales list, and the reverse is true. `/account`, `/pricing`, and the legal pages keep working, including the iOS handoff at `/subscription/return`.

The Hono API in `inventory-mobile` stays the source of truth. This repo does not get a database, and it does not reimplement stock, FIFO, roles, or Razorpay.

## What exists today

### This repo

`dukaan-voice-legal` is a Next.js 16 marketing and billing site.

- Public marketing, legal, pricing, contact, refund policy
- `/account` — shop billing, Razorpay checkout, cancel, plan switch, invoices
- `/subscription/return` — post-checkout handoff back to the iOS app
- Clerk is wired. Signed-in pages call the mobile API with a bearer token (`app/lib/subscriptions.ts`)
- Styling is custom CSS (saffron on near-black). Marketing copy is HTML strings with its own locale system

There is no inventory, POS, or shop workspace.

### The mobile app

Expo screens call a Hono API on Render, which owns Neon, Clerk JWT checks, roles, and Razorpay. CORS is already open (`origin: "*"`), so a browser on `samaanbol.space` can call that API the same way the phone does.

The current phone app, from the live screens:

| Area | What it does |
|---|---|
| Home | Today’s sales, attention counts (low stock, out of stock, near expiry, unpriced), daily brief, nudges, shop search |
| Sell | Search or scan, cart, weight/volume quantities, price-on-the-spot, charge |
| Checkout | Cash with change, UPI QR, udhaar, split tender, bill discount, customer attach |
| Sales | Bill list, detail, void, returns, CSV |
| Products | Catalog, batches, expiry, min stock, barcode, adjust with a reason |
| Buy list | Pending → stocked, including AI suggestions |
| Customers | Profiles and udhaar ledger |
| Suppliers | Purchase history and price compare |
| Reports | Sales and stock reports, text “ask” |
| Activity | Audit log of stock, sales, voids, staff changes |
| Settings | Language, contrast, text size, staff, shop, UPI/bill settings, exports, delete account |
| Onboarding | Create shop, join with invite code, switch shop |

Older docs in the mobile repo (voice-first home, a Scan tab, invoice OCR) do not match the current screens. Build against the routes and API, not those docs.

## Workspace shape

Use `/shop` as the product root. The Next.js source folder is already `app/`, so a route named `/app` becomes the confusing path `app/app`. Billing URLs do not move.

| URL | Purpose |
|---|---|
| `/shop` | Home: today’s sales, attention counts, brief, nudges, search |
| `/shop/sell`, `/shop/sell/checkout` | Counter and payment |
| `/shop/sales`, `/shop/sales/[id]` | Bills, void, return |
| `/shop/products`, `/shop/products/[id]` | Catalog, batches, adjust |
| `/shop/buy-list` | Buy list |
| `/shop/customers`, `/shop/customers/[id]` | Customers and udhaar |
| `/shop/suppliers`, `/shop/suppliers/[name]` | Suppliers |
| `/shop/reports` | Sales report, stock report, text ask |
| `/shop/activity` | Audit log |
| `/shop/alerts`, `/shop/brief` | Alerts and daily brief |
| `/shop/settings` | Language, display, exports, delete account |
| `/shop/settings/staff` | Members and invite codes |
| `/shop/settings/shop` | Shop profile |
| `/shop/settings/payments` | UPI, QR, void window, default tender |
| `/shop/onboarding` | Create shop or join with a code |
| `/account`, `/subscription/return` | Unchanged billing portal |

Desktop and tablet use a left rail: Home, Sell, Sales, Activity, Settings. Products, buy list, customers, suppliers, and reports open from Home, matching the phone hub. A phone browser uses those same five tabs. Sell is a counter: the search field is focused, a barcode wedge types into it, and Charge is always visible.

`/shop` and everything under it is `noindex` and omitted from the sitemap, same as `/account`.

## Shared rules

### Auth

Same Clerk instance as the phone. The browser calls `NEXT_PUBLIC_API_BASE_URL` with `Authorization: Bearer <session token>`, which `/account` already does.

Persist the selected shop in `localStorage`, keyed by Clerk user id. The phone keeps its own selection in memory. Switching shops on the web must not write `activeShopId` on the server, because the phone’s switch does not either. On first visit, start from the shop the API marks active, then let the local choice win.

### Roles

Copy `permissionsFor` from the mobile app (`src/hooks/usePermissions.ts`).

| Action | Owner | Manager | Helper |
|---|---|---|---|
| Sell, scan, stock remove with a reason | yes | yes | yes |
| Create, edit, delete products; add or edit batches; set quantity | yes | yes | no |
| See cost, margin, suppliers | yes | yes | no |
| Customers, buy list, reports, void, return | yes | yes | no |
| Staff, shop settings, payments, delete shop, billing | yes | no | no |
| Leave shop | no — must delete the shop | yes | yes |

Helpers only see their own bills. The API forces `soldBy` to their user id. A helper who opens someone else’s sale id gets 403.

The server is the authority. Hiding a control is not enough. Helpers must not receive cost or margin in the HTML. If a list endpoint still returns purchase price for a helper, fix that in the Hono API before shipping the web catalog.

### HTTP meanings

| Status | UI |
|---|---|
| 401 | Send the user through Clerk sign-in again. Keep the cart. |
| 402 `premium_required` | Lock card. The button goes to `/account?shopId=`. |
| 403 | “You don’t have access.” Do not show a subscribe button. |
| 409 | Conflict copy: already a member, bill already voided. |
| 422 | Field error: void window closed, return quantity too high, price missing, archived product. |
| 5xx or timeout | Retry only when the operation is idempotent. |

### Premium

`isPremium` is true for `legacy_free`, an active trial, and an active subscription. Anything else gets the lock.

Known gates:

- Udhaar (`udhaar`)
- POS reports, sales CSV, top products by revenue, stock-movement CSV (`pos_reports`)
- AI buy-list rows (`buy_list_ai`)
- Brief audio (skipped; text brief is not premium-gated)
- Predictions, history, multi-shop

The text daily brief is available to owners and managers without premium. Brief audio is premium and is not built. Any new 402 uses the same lock component. The feature name comes from the response.

### Money

The server rounds to paise and requires payments to match the total within ₹0.01 (`payments_mismatch`). Use one `roundPaise` helper for cart totals, discounts, split tender, and change. Send `inputMethod: "manual"` on every web sale.

### Idempotency

Create one `clientId` (UUID) when Charge is pressed. Retries of that request reuse it. The server returns the original sale for a repeated `clientId`. A new id on retry creates a second bill and depletes stock again.

### Oversell

If the shelf changed, the sale still commits. The response lists a shortfall per line. The completion screen shows that warning. The web app does not roll the bill back.

## Left on the phone

- Voice process, confirm, TTS, the mic, voice language, and voice feedback
- Brief audio and `/analytics/ask-voice`
- Expo push registration and over-the-air app updates
- The offline sales outbox

The web counter is online: one `clientId`, a disabled Charge button while the request is in flight, and a retry of that same id if the network drops. Bills print or download. A USB or Bluetooth scanner is the barcode path; the laptop camera is a fallback.

The daily-recap preference can remain. It still drives phone notifications. The website does not need its own push channel in the first release.

## Implementation plan

Work in this repo only. Add Tailwind for `/shop`, using the existing tokens (`#FF6B00`, `#0A0A0F`, `#15151C`). Leave marketing CSS and the HTML-string locales alone. In-app language comes from `GET /api/translations/:lang`.

Suggested files:

- `app/lib/api/client.ts` — bearer fetch, timeout, typed errors (`status`, `code`, `feature`)
- `app/lib/api/` — modules mirrored from `inventory-mobile/src/api`, excluding `voice.ts`
- `app/lib/permissions.ts` and `app/lib/entitlement.ts` — copies of the mobile helpers
- `app/lib/money.ts` — `roundPaise`
- `app/shop/layout.tsx` — Clerk gate, shop provider, shell
- Shop provider — load shops, restore the last shop, expose role and entitlement

### Phase 0 — Client foundation

Add the API client, permission and entitlement helpers, the `/shop` layout, and the shop provider.

Done when a production mobile user can sign in, see their shop name and role, and a user with no shop lands on onboarding.

### Phase 1 — Shop access

Screens: create shop, join with code, switcher, staff list, invite, leave, delete.

Create shop calls `POST /api/shops` (name, category, contact). The API adds the creator as owner and grants the auto trial. Join uses `POST /api/shops/join`. Staff changes are owner-only.

Done when an owner can create a shop, a second account can join with the helper code, and the owner can promote, remove, and delete.

### Phase 2 — Catalog

Product list with filters: all, low stock, out of stock, near expiry, unpriced. Detail, create, edit, archive/delete, batches, barcode lookup, adjust.

Helpers can open the list and submit a stock removal with a reason. They cannot open create or edit. Cost fields are absent from the request and from the DOM for helpers.

Done when a product created on the web appears on the phone, and a batch added on the phone appears on the web.

### Phase 3 — Counter

This is the phase that makes the web app useful.

Sell:

- Search the catalog and add lines
- Fractional quantity for weight and volume
- Block add when selling price is null, and offer a one-time price save for owners and managers
- Helpers see “ask a manager to set the price”
- Cap quantity at on-hand for tracked items and show the cap
- Untracked items (`trackStock: false`) do not cap

Checkout:

- Cash, with tendered amount and change, including the quick amounts the phone uses
- UPI, showing the shop VPA QR from POS settings, plus an optional reference
- Split across cash, UPI, and credit
- Bill discount and note
- Customer attach, or create-by-name for a credit sale
- Credit requires a customer (`credit_requires_customer`)
- Default tender is the shop’s `defaultPaymentMethod`, then the last method used in this browser

Charge posts `POST /api/shops/:shopId/sales` once. The completion screen shows the bill number, total, tender, and any oversell lines, with Print.

Cart state lives in `localStorage` per shop so a refresh does not lose it. Charge clears it only after a 2xx response.

Done when a cash sale and a UPI sale on the web show up in the phone’s sales list with stock reduced, and a double-clicked Charge creates one bill.

### Phase 4 — Sales desk

List, detail, void, partial return, sales CSV.

Helpers see only their bills and cannot void or return. Void is allowed only inside `voidWindowHours` from POS settings (owner-set, 1–720 hours). After that the API returns `void_window_passed`. A second void returns `already_voided`. A return cannot exceed the remaining quantity (`return_quantity_exceeds`). Void and return put stock back through the same batch refs the sale depleted.

CSV is owner/manager and premium (`pos_reports`). A free shop sees the lock, not a broken download.

Done when a void and a partial return on the web restore stock on the phone, and a helper cannot open another helper’s bill.

### Phase 5 — Customers, suppliers, buy list

Customers and udhaar are premium (`udhaar`). Creating a customer and editing one are owner/manager. Phone numbers use the API’s Indian-mobile check (`invalid_phone`). A payment amount must be greater than zero. The customer page shows the ledger and udhaar risk that checkout already uses.

Suppliers are owner/manager: list, detail, and price compare. There is no separate supplier create form. Suppliers come from batch purchase data.

Buy list is owner/manager. Status moves pending → stocked. Stocking an item that already has a product opens add-batch with the quantity filled in. An item with no product opens add-product. AI-suggested rows require premium (`buy_list_ai`). A 402 on that flag hides the suggestion actions behind the lock and still shows manual rows.

Done when a credit sale increases udhaar, a payment reduces it, and stocking a buy-list row creates a batch.

### Phase 6 — Home, alerts, brief, reports, activity

Home shows today’s sales from `GET .../sales/summary?period=today`. Use that payload. Do not recompute “today” in the browser timezone.

Attention counts link into the product filters. Search uses `GET .../search` plus the local catalog, and hides customer hits from helpers and supplier hits from anyone who cannot see cost.

Alerts, nudges, and the text brief respect role. Nudge actions that set a price or change stock are owner/manager, matching `/nudges/:id/act`. Reports call `/api/shops/:shopId/reports/sales` and `/reports/stock`. The movement CSV is premium. The ask box posts to `/analytics/ask` only. If that returns 402, show the lock.

Activity renders the audit types the phone already labels: product add/update/delete, batch, remove, adjustment, sale, void, return, member role change, member removed.

Done when the home figures match the phone for the same shop on the same day.

### Phase 7 — Settings and billing link

Shop profile (owner): name, category, contact. Empty name is rejected.

Payments (owner): UPI VPA format, phone, default method `cash` or `upi` only, void window 1–720 hours, QR image upload. Oversized images return 413 `image_too_large`. A failed decode returns 422 `decode_failed`.

Preferences: app language, high contrast, text size, and the daily-recap toggle for owners. Voice language and voice-feedback controls are omitted.

Exports: inventory CSV and activity CSV for members; sales CSV under the phase 4 rule.

Delete account calls `DELETE /api/account`. Copy the phone’s confirmation. Deleting a shop calls `DELETE /api/shops/:id`, which cancels the Razorpay subscription first. If that cancel fails, the API returns `subscription_cancel_failed` and the shop remains. Show that error and do not pretend the shop is gone.

Settings includes a subscription row that links to `/account?shopId=`. The billing UI is not rebuilt.

Done when an owner can change the UPI ID on the web and see it on the next phone checkout, and `/account` still completes a test checkout.

Phases 0 through 3 are the release that matters: sign-in, a shop, the catalog, and a counter that cannot double-charge. Phases 4 through 7 fill in the rest of the phone except voice. Do not start the counter before the API client maps 401, 402, 403, and `clientId` retries. Do not rebuild `/account` while doing it.

## Edge cases to handle in the UI

### Session and shop

- Signed out on any `/shop` URL returns to Clerk, then back to that URL.
- Token expires on the checkout screen: sign in again, cart still in `localStorage`.
- User belongs to no shop: onboarding only. No empty counter.
- User is removed from the shop while a tab is open: the next API call returns 403 “Not a member of this shop”. Clear that shop from local state and switch to another, or onboarding.
- Two shops: the switcher lists both. A sale posts to the shop id in the provider, not to a shop id captured when the page first loaded.
- Multi-shop beyond the free tier: if switch or create returns 402 `multi_shop`, show the lock.
- Owner tries to leave: show “Delete the shop instead.” The API returns that 400.
- Owner tries to change or remove their own owner row: disabled. The API rejects it.
- Invite code reused by someone who is already a member: 409, with the shop name.
- Invalid code: 404 “Invalid invite code.”
- Manager can see and share the helper code. Only the owner sees the manager code. The list endpoint already nulls the manager code for non-owners.
- Delete shop with an active subscription: success only after Razorpay cancel. On `subscription_cancel_failed`, stay on the shop and tell the owner to retry.

### Catalog

- Name required. Category and sub-category required, and the pair must belong to that shop’s catalog (`That category is not available for this shop`).
- Create, edit, delete, add batch, and absolute quantity are 403 for helpers.
- Quantity on add-batch and remove must be greater than zero. Weight and volume accept decimals. Piece units step by whole numbers, using the same unit steps as `src/lib/units.ts` in the mobile repo.
- Remove allows any member and requires a reason. The activity row uses that reason.
- Barcode miss: owner/manager gets “Add this product.” Helper gets a toast only.
- Archived product (`product_archived`) cannot be sold. Hide it from search results when `isActive` is false. If a stale cart hits it, drop the line with an explanation.
- Unpriced product: do not add a line at ₹0. Owners and managers must save a selling price first.
- Deleting a product that is in an open cart removes that line.
- Two people edit the same product: last successful PATCH wins. Refetch on focus.
- Batch edit with an empty body: 400 “No fields to update.” Disable save until something changed.
- Near-expiry and low-stock filters must match the stats endpoint, so the home count and the filtered list agree.

### Counter and payments

- Empty cart cannot open checkout.
- Double click, Enter repeat, and a second tab: one in-flight `clientId`. The button stays disabled until the response. A retry reuses that id.
- Refresh after a successful sale and before the cart clears: the retry returns the original sale. Show that bill. Do not create another.
- Payments that do not match the total within one paisa: block submit client-side, and still show `payments_mismatch` if the server disagrees.
- Discount larger than subtotal: the server clamps the discount to the subtotal. Show the clamped total before Charge.
- Split tender: the three parts must sum to the total. Show the remainder. Zero-amount parts are omitted from the payload.
- Credit with no customer: block submit.
- New customer typed at checkout with a bad phone: `invalid_phone` inline.
- Cash tendered below the total: change stays blank and Charge stays disabled until tendered covers the cash portion.
- UPI with no VPA configured: still allow the sale, and show a note that no QR is on file, with a link to payments settings for the owner.
- Product goes out of stock between add and charge: the sale can still succeed and return a shortfall. Show it on the receipt. If the API rejects the line, refresh the catalog and mark the line.
- `sold_at_too_old`: only matters if the tab slept for more than 60 days. On that 422, stamp a new time and a new `clientId` only after the user confirms, because the previous id might still land.
- `price_required` and `product_not_found` name the line.
- Last payment method is per shop in this browser. It must not override an explicit choice on the current bill.
- Helper on a premium shop can sell. Helper on a free shop can sell cash and UPI. Udhaar controls return 402. Hide credit for non-premium shops for every role.
- Cart from shop A is invisible after switching to shop B.

### Sales desk

- Helper list is only their bills, even if they edit the query string.
- Helper detail of another seller’s id: 403 page, not the bill.
- Void inside the window restores stock. Void outside it shows the window length from POS settings.
- Void of a voided bill: “Already voided.” Refresh the detail.
- Partial return, then a second return of the remainder, then a third that exceeds it: the third shows the max remaining.
- Return on a voided sale: `sale_voided`.
- Credit refund on a sale that has no customer: `credit_refund_requires_customer`. Offer cash or UPI refund instead.
- CSV on a free shop: lock, not a file of an error JSON.
- Date range the API rejects (`invalid_range`): keep the previous range and show the message.

### Customers, suppliers, buy list

- Customer name required. Show whatever duplicate-phone message the API returns, on the form.
- Payment of 0 or a negative amount: `invalid_amount`.
- Customer deleted or missing: `customer_not_found` on the detail page.
- Free shop opening customers, customer detail, or a credit payment: lock, including for the owner.
- Helper does not get customer or supplier navigation. If they hit the URL, the page shows no access. Do not fire the customer list request for a helper if the mobile client hides it.
- Supplier name missing: `name_required`.
- Buy list invalid status: 400. Only offer the statuses the phone uses.
- Stocking a buy-list row whose product was deleted: fall through to add-product.
- AI suggestion on a free shop: the row can be visible from a previous premium period. Acting on the AI flag can 402. Manual add still works.

### Home and reports

- Summary still loading: show a loading figure, not ₹0.
- Helper home: no today’s-sales card, no reports tile, no brief. They still get products and sell.
- Brief with zero actions still opens.
- Nudge for the wrong role never arrives (`ROLE_AUDIENCE`). If it does, ignore actions the role cannot perform.
- Ask box empty: do not POST.
- Reports for a helper: 403 page.
- Movement CSV for a free shop: 402 lock.

### Settings and account

- Shop name cleared: “Shop name cannot be empty.”
- VPA that fails `^[a-z0-9._-]{2,}@[a-z0-9.-]{2,}$`: inline `invalid_vpa`.
- Default method `credit` is not allowed.
- QR above the server byte limit: name the limit in the error.
- Language with no translation payload: fall back to English keys, same as the phone.
- Delete account is confirmed twice, matching the phone. While it runs, the button stays disabled.
- High contrast and text size apply inside `/shop` only. They do not restyle the marketing site.

### Billing pages that must keep working

These already exist. The new shell must not take their routes.

- Signed-out `/account` shows Clerk sign-in.
- Signed-in owner can start checkout, change plan, update the payment method, and cancel.
- A non-owner hitting billing actions sees “Only the shop owner can change billing.”
- `/subscription/return` still polls and still offers “Open in app.”
- `/pricing` still links to `/account`.
- Marketing locales (`/hi/...` and the rest) still render.

## Risks and how to test them

Run the role matrix once per phase on three Clerk users in one shop: owner, manager, helper. Repeat the premium rows on a shop in `expired` or `none`, and on a shop in `trialing`.

| Risk | What goes wrong | Test |
|---|---|---|
| Double bill | New `clientId` on every retry | Double-click Charge, then retry after a forced network failure. Expect one sale id. |
| Paise drift | UI total and server total differ by ₹0.01 | Bills with fractional kg, a line discount, and a bill discount. Submit must not return `payments_mismatch`. |
| Helper sees cost | Purchase price in the HTML or the JSON | Sign in as a helper, view source on the product list and sale detail. Price and margin absent. |
| Helper sees others’ sales | Query string `soldBy` | As a helper, request the list and open another sale id. List is only theirs; detail is 403. |
| Premium leak | Free shop downloads CSV or records udhaar | Expired shop: customers, credit tender, sales CSV, stock CSV, revenue ranking. Each shows the lock or a 402, and no data file. |
| Role leak | Manager opens staff role edit or shop delete | Direct URL to staff actions and shop delete. 403, controls not rendered. |
| Shop switch mix-up | Cart and sale post to the previous shop | Add a line in shop A, switch to shop B, charge. The line is not in B’s cart. A sale in B does not change A’s stock. |
| Stale membership | Removed user keeps selling | Remove the member on the phone, then charge on the web. 403, shop cleared. |
| Void window | Void after the configured hours | Set the window to 1 hour on a test shop, or use an old bill. Expect `void_window_passed` and unchanged stock. |
| Partial return | Returned quantity restored twice | Return half, check stock, return half, fail a third. Stock matches the original minus what is still sold. |
| Oversell | UI treats shortfall as a failed sale | Sell more than on-hand from two browsers at once. One or both receipts show the shortfall, and both bills exist. |
| Subscription cancel on delete | Shop deleted while Razorpay still charges | Delete a shop with a test subscription. On success, entitlement is gone. On a forced Razorpay failure, the shop still exists and the error is visible. |
| Billing regression | New layout or Clerk changes break `/account` | Walk pricing → account → checkout → return → cancel on a test shop after phases 0 and 7. |
| Invite exposure | Manager code shown to a manager or helper | Fetch the shop as each role. Manager code is null unless the caller is the owner. |
| Barcode wedge | Scanner’s trailing Enter submits the wrong form | A scan ending in Enter adds the product and does not press Charge. |
| Two tabs | Both tabs charge the same cart | Start Charge in tab 1. Tab 2’s button is disabled or posts the same `clientId`. One bill. |
| Session loss | Cart disappears after Clerk redirect | Start checkout, delete the Clerk cookie, sign in again. Cart and typed tender remain. |
| Account page shop context | Billing changes the wrong shop | From settings, open `/account?shopId=` for shop B while shop A was last used on the phone. The account page acts on B. |
| i18n | Missing key shows the raw key, or a long label breaks the counter | Switch to Hindi and Tamil. Charge, totals, and the rail still fit. Missing keys fall back to English. |
| Large catalog | The sell search janks | A shop with 1,000+ products: search stays on the server or a local index, and the list is virtualized. |
| Rate limit | Checkout polling or search spam returns 429 | Sales post is under the global 120/minute. Do not poll entitlement inside the counter. CSV stays within 5/minute. |
| Print | Receipt shows cost to a helper | Print preview as a helper contains no purchase price. |
| Marketing collision | `/shop` inherits the marketing nav or gets indexed | View source: no marketing HTML locale injection, `noindex` present, sitemap has no `/shop` URLs. |

### Cross-device checks

These define parity. Run them after the phase that owns the feature.

- Product, batch, and price edited on the web, visible on the phone after pull-to-refresh
- Sale on the web, stock and bill on the phone
- Void on the phone, stock restored on the web
- Udhaar payment on the web, balance on the phone
- UPI VPA edited on the web, QR on the phone checkout
- Subscription started on `/account`, premium gates unlock on both clients after entitlement refresh

## Decisions already settled

- Same Clerk project and same `NEXT_PUBLIC_API_BASE_URL` as production mobile. A shop created on the phone shows up on the web immediately.
- Billing UI is not rebuilt. `/account` remains the only place that starts Razorpay checkout.
- The server remains the source of truth for stock, FIFO batches, roles, and premium. The web app does not write to Neon itself.
- Marketing pages and `/shop` do not share a layout. The workspace gets its own chrome and is excluded from the sitemap.
- CORS can stay open for the first release. Restricting it to `samaanbol.space` and localhost is a small follow-up in the mobile server, not a blocker.
- Active shop selection is per client. The web stores its choice in `localStorage` and does not PATCH the user’s server `activeShopId` on switch.

## API error codes to map

Handle these in the shared client so screens do not invent their own copy.

| Code | Where it comes from |
|---|---|
| `Not a member of this shop` | Any shop-scoped route |
| `Insufficient permissions` | Role checks |
| `premium_required` | Udhaar, reports, CSV, AI buy list, and other gates. Includes `feature`. |
| `payments_mismatch` | Sale create. Payments must match total within ₹0.01. |
| `credit_requires_customer` | Sale create |
| `empty_cart`, `missing_payments`, `missing_client_id` | Sale create |
| `invalid_payment_method`, `invalid_payment_amount` | Sale create |
| `price_required`, `product_not_found`, `product_archived` | Sale create |
| `invalid_quantity`, `sold_at_too_old` | Sale create |
| `already_voided`, `void_window_passed`, `sale_not_found` | Void |
| `sale_voided`, `return_quantity_exceeds`, `sale_item_not_found` | Return |
| `credit_refund_requires_customer`, `invalid_refund_method` | Return |
| `invalid_range` | Sales list, summary, CSV |
| `name_required`, `invalid_phone`, `invalid_amount`, `customer_not_found` | Customers |
| `Invalid invite code`, `Already a member of this shop` | Join |
| `Owner cannot leave — delete the shop instead` | Leave |
| `Cannot change the owner's role`, `Cannot remove the shop owner` | Staff |
| `subscription_cancel_failed` | Delete shop |
| `invalid_vpa`, `invalid_default_method`, `invalid_void_window` | POS settings |
| `image_required`, `image_too_large`, `decode_failed` | UPI QR upload |
| `Shop name is required`, `Shop name cannot be empty` | Shop create and update |
| `That category is not available for this shop` | Product create and update |
| `Product name is required`, `Category and sub-category are required` | Product create |
| `Quantity must be greater than 0`, `Valid quantity is required` | Batches and adjust |
| Billing codes already mapped in `app/lib/subscriptions.ts` | Checkout, cancel, plan switch |

Sale create can also succeed with an `oversold` shortfall list. That is a successful bill, not an error.
