# Second pass: buying, billing, online store, opening balances

Branch `cursor/webfix2-buying`, from `origin/cursor/web-app-second-pass`. Sources: [03-stock-buying.md](03-stock-buying.md) and [05-settings-gst-store.md](05-settings-gst-store.md). This pass covers the findings that the first pass ([fixes-03-stock.md](fixes-03-stock.md), [fixes-05-settings.md](fixes-05-settings.md)) skipped because the code was in files it did not own.

**Result: 7 fixed, 3 partly fixed (S6, S11, O1), 0 skipped** (10 findings). `npm run check:release` passes (exit 0, every suite `fail 0`, `tsc --noEmit` clean). No test files were changed. There were no server changes, and no request payload, money or stock calculation, or recovery logic was changed.

## Findings

| ID | Status | What changed, or why not all of it |
|---|---|---|
| S6 | Partly fixed | The order form now takes several buy-list items at once. `/shop/purchase-orders?buyListItemIds=a,b,c` opens the form with one line for each item, using the same line shape as picking them one by one (up to 100). On the Items step, **"Add all N buy-list items"** adds every buy-list item still to order in one click, with the note "Remove any you don't want from this supplier." No server change was needed. Not done: checkboxes and a "Order N selected" bar on the Buy list page itself, which is in `buy-list.tsx`, another agent's file. That page can link to the new `buyListItemIds` handoff. Automatic grouping by supplier needs supplier history per item, which the API does not return. |
| S10 | Fixed | After **Confirm delivery receipt** succeeds, a green panel appears above the order tabs: "Stock received. The accepted goods are now in stock. Next, record the supplier's invoice when you have it." It has **Record / open supplier invoice →** (the same handoff as the History tab) and **Later**. If nothing was accepted (rejections only), it says nothing was added to stock and shows only **OK**. The invoice total is **not** prefilled. |
| S11 | Partly fixed | All the PO labels for goods arriving are retail-locale keys, not GST-catalogue English text, so they can be renamed. The rewordings to **Receive stock** are listed below for you to apply. The new success panel already uses "Stock received". The invoice option "Receive new stock" is still keyed by English text in the GST catalogue, so it stays as it is. |
| S26 | Fixed | When a shop has no orders yet, the list shows only the empty state and its one **New purchase order** button. The header button, the "Orders on this page 0" count, the six zero status counters, search, filters and the paging bar are hidden. The paging note ("Filters and counts apply to this page…") and Previous/More now appear only when there is more than one page. List rows end in "›" instead of "↗". |
| S27 | Fixed | The item picker now has sections: **On your buy list**, then **Low or out of stock** (quantity at or below the product's low-stock level, up to 30), then **Other products** (up to 20). Below the list: "Type a name to search N more products." When the user searches, matches show under **Products** (up to 50), with "N more products match. Keep typing…". Products already shown as buy-list rows are not listed twice. Headings stay at the top of the scroll box while you scroll. |
| S28 | Fixed (copy listed) | The plain-language rewordings are listed below. I did not edit any locale file. |
| B1 | Fixed | Only on the Subscription page inside `/shop` (the `embedded` dashboard): the big heading is now the plan or status ("Premium included for now", "Premium · Monthly", "12 trial days left"…), not the shop name, which is already in the page kicker. The status badge is gone there because the heading replaces it. "Current plan" never shows "—" any more. It shows the plan name, or **Premium (temporary)**, **Premium trial**, the grandfathered label, or **Free**. "Premium included for now" appears once: the callout no longer repeats it as a title when the heading already says it. This applies to `/account` too. **Refresh status** is now a quiet underlined link under the summary, not the most prominent button. On the public `/account` page, layout and buttons are unchanged apart from the callout title. No pricing, purchase or subscribe path was touched. |
| C3 | Fixed | The Store tab now shows the full store link in a box you can select. Under it: **Copy catalogue link**, **Share on WhatsApp** (primary; opens `wa.me` with the shop name and link) and **Open public store**. Share and Open show only when the store is published. Open moved up from the bottom of the tab. When the store is a draft, a line says customers can open the link after you publish. The "View link details" disclosure is removed. Not done: a downloadable store-level QR, because there is only a per-product QR endpoint. |
| C5 | Fixed | Each order state shows one primary next-step button: Accept → Start preparing → Mark ready → Send for delivery / **Create bill & collect payment** → Mark fulfilled. Reject and Cancel are on a separate row. The always-visible "Reason" box is gone: choosing Reject or Cancel opens a small panel with the reason field, a confirm button (disabled until a reason is typed) and Back. When "Mark fulfilled" is disabled because there is no bill yet, the reason is shown under it (the existing `commerce.error.unpaid` text). The same request is sent (`kind: "order"`, same `state` and `note`). Back clears the reason, so a typed reason can't ride along on Accept. |
| O1 | Partly fixed | Step 5 (Review) in the opening-balances step bar now shows a lock icon. A visible line explains why it can't be picked: "Review opens when you tap "Refresh & review changes" on step 4." The line is linked to the button with `aria-describedby` and repeated as a tooltip. The retitle and the checklist rewording are suggested below, not applied: mobile uses the same title, and the brief limits me to the reason for step 5. |

## Files changed

- `app/lib/shop/purchase-orders/view.tsx`: S6, S10, S26, S27, list arrow
- `app/components/shop/screens/purchase-orders.tsx` (wiring): `buyListItemIds` handoff; header button hidden when there are no orders (S26)
- `app/lib/shop/commerce/view.tsx`: C3, C5
- `app/lib/shop/openings/view.tsx`: optional `lockedHint` on the `Steps` primitive; passes the step-5 reason (O1)
- `app/components/shop/screens/opening-balances.tsx` (wiring): `Steps` renders the lock, hint, `aria-describedby` and tooltip (O1)
- `app/account/AccountClient.tsx`: B1
- `app/shop/styles/fixes-stock.css`: picker sections, Add all, received panel
- `app/shop/styles/fixes-settings.css`: billing heading and refresh link, store link box, step-5 hint

New controls are at least 44px tall and have a visible focus ring. New text is 13px or larger.

## New translation keys (English fallback in code, not in any locale file)

Each view gets them through a small `tx(key, fallback)` helper (the same idea as `unitLabel` in the PO view): it uses the translation when there is one, otherwise the English below. Before you add them to `gst-web-locales.json`, note that `test:translations` requires every `web.en` key to exist in all nine other languages.

| Key | English |
|---|---|
| `poweb.add_all_buy_list` | Add all {{count}} buy-list items |
| `poweb.add_all_help` | Remove any you don't want from this supplier. |
| `poweb.section_buy_list` | On your buy list |
| `poweb.section_low` | Low or out of stock |
| `poweb.section_other` | Other products |
| `poweb.section_products` | Products |
| `poweb.type_to_search` | Type a name to search {{count}} more products. |
| `poweb.more_matches` | {{count}} more products match. Keep typing to narrow the list. |
| `poweb.received_title` | Stock received |
| `poweb.received_body` | The accepted goods are now in stock. Next, record the supplier's invoice when you have it. |
| `poweb.received_body_rejected` | Nothing was added to stock. Rejected goods are still due from the supplier. |
| `poweb.later` | Later |
| `poweb.dismiss` | OK |
| `commerce.share_whatsapp` | Share on WhatsApp |
| `commerce.link_after_publish` | Customers can open this link after you publish the store. |
| `billingweb.plan_temporary` | Premium (temporary) |
| `billingweb.plan_trial` | Premium trial |
| `billingweb.plan_free` | Free |
| `openingweb.review_locked` | Review opens when you tap “{{action}}” on step 4. ({{action}} = the `opening.review` label) |

Existing keys reused: `po.record_invoice`, `po.invoice_unavailable`, `commerce.error.unpaid`, `commerce.action_rejected`, `commerce.cancel`, `commerce.reason`, `commerce.open_store`, `common.back`, `billingweb.temporary_title`, `billingweb.refresh`.

## Reworded keys (please apply and translate)

**S11: one name, "Receive stock", for goods arriving on an order**

| Key | New English |
|---|---|
| `po.receive` | Receive stock |
| `po.confirm_receipt` | Confirm and add to stock |
| `po.receipt_history` | Stock received |
| `po.event.receive` | Stock received |
| `poweb.no_receipts` | No stock received yet. |
| `poweb.completed_help` | This order is complete. See History for the stock received and any supplier invoices. |

⚠ `tests/purchase-orders-workspace.test.cjs` finds buttons by the English text "Receive delivery" and "Confirm delivery receipt", read from `retail-locales.json`. When you apply the first two rewordings, update those literals in the test.

**S28: plain language for purchase orders**

| Key | New English |
|---|---|
| `po.intro` | Order from a supplier, then receive the stock when it arrives. Ordering doesn't add stock or record money owed. Record the supplier invoice when it comes. |
| `po.draft_help` | Ordering doesn't add stock. Stock goes up when you receive it. Enter quantities in the product's base unit (packs are not converted). |
| `po.receipt_help` | Enter only what you accept now, with its cost per unit including tax. You can correct the cost when you record the supplier invoice. Rejected goods don't go into stock and stay due from the supplier. |
| `po.map_help` | This item isn't linked to a product yet. Pick the product it matches (same unit). If you create a new product, keep its opening stock at 0. |
| `po.not_invoice` | Purchase order (not a supplier invoice) |
| `po.issue_review` | I checked the supplier, items, quantities and prices. |
| `po.receipt_review` | I checked what I'm accepting, the products and the costs. Only accepted goods go into stock. |
| `po.cost` | Cost per unit, including tax (₹) |
| `po.create_product` | Create missing product (opening stock 0) |
| `po.close_help` | Cancel what is still due. Goods already received stay in stock. |
| `po.share_help` | Order ready to send. This doesn't mean the supplier has accepted it. |
| `po.record_invoice` | Record supplier invoice |
| `po.empty` | No purchase orders yet. Start one from your buy list or your products. |
| `poweb.estimate_help` | These are estimates. Check the real prices and tax when the supplier invoice comes. |
| `poweb.page_help` | Counts and filters cover this page only. Use More orders to see older ones. |

(`po.not_invoice` currently contains an em dash.)

**B1, C3, C5**

| Key | New English |
|---|---|
| `billingweb.temporary_body` | No payment needed. This doesn't start a subscription or take any money. |
| `commerce.catalogue_link` | Your store link |
| `commerce.reason` | Reason (the customer will see this) |
| `commerce.bill_help` | This opens an estimate with the order's items. Tap Convert to bill, then take cash or UPI at checkout. The order isn't marked fulfilled until you do. |

`commerce.link_details` ("View link details") is no longer used.

**O1 (optional, not applied: mobile uses the same title)**

| Key | New English |
|---|---|
| `opening.title` | Starting stock, dues & cash |
| `opening.work_check` | Billing and stock changes are stopped on every counter and phone, and nothing is waiting to sync. |
| `opening.confirm_help` | Stop billing and stock changes on every counter until this setup is done. Saved entries stay traceable; any corrections are added as new entries. |

## Please test by hand

1. **PO handoff (S6).** Open `/shop/purchase-orders?buyListItemIds=<id1>,<id2>` with two pending buy-list ids: the form should open with both lines. Pick a supplier and check that prices fill in. Single `?buyListItemId=` from the Buy list "Order" button should behave as before. On the Items step, "Add all N buy-list items" should add each item once, and the button should disappear when none are left.
2. **Picker (S27).** In a shop with more than 20 products and a few low or out-of-stock ones, check the three sections, the sticky headings, the "Type a name to search N more" line, and search (headings change to "Products").
3. **Receive (S10).** Receive part of an order. The green panel should appear, and **Record / open supplier invoice** should open the invoice form linked to that receipt, with the total empty. Try a delivery with only rejected goods: there should be no invoice button. Open another order: the panel should not follow.
4. **PO list (S26).** In a shop with no orders: only the empty state and one button. With more than 30 orders: paging and the paging note appear.
5. **Online store (C3/C5).** As owner on a published store: Share on WhatsApp opens WhatsApp Web or the app with the link. For an order, step through Accept → Preparing → Ready → Create bill. Reject or Cancel should ask for a reason and send it. Back should clear it. Check delivery orders (Send for delivery + Mark fulfilled) and the unpaid reason under "Mark fulfilled".
6. **Subscription (B1).** Check the heading and "Current plan" for: temporary Premium, an automatic trial, active monthly or annual, past due (warning colour), and Free (none, expired or cancelled). Refresh status should still work and disable while busy. Check that `/account` (public) still looks right.
7. **Opening balances (O1).** On steps 1 to 4, step 5 should show a lock and the hint line. A screen reader should read the hint on the step-5 button.

## Risks and notes

- **Pricing inside `/shop`: already there, not changed.** The brief says `/shop` must never show pricing or a Subscribe button. The embedded `AccountDashboard` on `/shop/settings/subscription` already shows the monthly/annual price toggle and the Subscribe / "Switch to Annual · ₹…" buttons to owners when `billingActions` allows it, and `tests/billing-interactions.test.cjs` asserts the "Switch to Annual — ₹3,999/year" button in embedded mode. I left all purchase paths as they were. If `/shop` must not show prices, this needs a separate decision. It may only apply to the native app, which uses `managementOnly`.
- The picker now hides products past the first 20 (plus 30 low-stock) until the user types. A shop that used to scroll the full list now has to search.
- C5 makes Reject and Cancel two steps instead of one. The payload is identical.
- The S10 panel uses the newest receipt on the order the server returns after receiving.
