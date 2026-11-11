# Fixes: stock and buying (03)

Branch `cursor/webfix-stock`, based on `origin/cursor/web-app-fixes-base`. Source review: [03-stock-buying.md](03-stock-buying.md).

**Result: 20 fixed (6 of them partly: S4, S11, S18, S19, S37, S38), 19 skipped.** `npx tsc --noEmit -p .` passes. `npm run check:release` passes (exit 0, every suite `fail 0`).

## Findings

| ID | Status | What changed / why skipped |
|---|---|---|
| S1 | Skipped | The sidebar is in `chrome.tsx`, which another agent owns (they are adding Purchase orders and Supplier bills). |
| S2 | **Fixed** | `app/shop/purchases/page.tsx` now always shows the recorded-invoices list. The `list=1` redirect is gone, so `?supplierId=` is kept and the list starts filtered by it. `/shop/purchases/new` is still the form. The invoice form's duplicate "Recorded invoices" button (it was the only `?list=1` link) is removed. Every other link was already correct: Settings → `/shop/purchases`, supplier → `/shop/purchases?supplierId=`, record → `/shop/purchases/new…`, detail back link → `/shop/purchases`. |
| S3 | **Fixed** | A new product's low-stock alert now defaults to **5**, the same as mobile (`add-product.tsx`: `minStock ?? 5`). Editing a product still shows its saved value. |
| S4 | Partly fixed | Now matches mobile: an invoice line defaults to "Receive new stock" when the product is tracked and **out of stock** (quantity ≤ 0). Otherwise it defaults to invoice-only, as mobile does. The web form now also shows mobile's summary above the review tick: "Stock to add: … Linked receipts: … Invoice-only lines: …" (`gst.purchase_stock_summary`). Option labels are unchanged, because they are keyed by their English text in the GST catalogue. |
| S5 | Skipped | Mobile requires the same "ordinary domestic forward-charge" tick (`purchase.ordinary_supply`) and blocks saving without it. This is a legal/tax confirmation, so it stays and the wording is unchanged. |
| S6 | Skipped | Ordering several buy-list items at once needs the PO compose view (`app/lib/shop/purchase-orders/view.tsx`), which is not in my area. Mobile also orders one buy-list item at a time. |
| S7 | **Fixed** | On the Products **Low stock** and **Out of stock** views, owners and managers get "Add N item(s) to Buy List". It adds every shown tracked product that isn't already pending on the buy list, using the same request as the product page. This mirrors the mobile alerts screen's "Add all to Buy List": quantity is the reorder level (or 1 when it is 0), items already pending are skipped, and failures don't stop the loop. The reviewer's "reorder × 2 − on hand" quantity was not used, because mobile doesn't use it. The Home alert is not mine. |
| S8 | Skipped | Mobile has the same "issue review" tick and the Issue step (`po.issue_review`). The code is in `view.tsx`, outside my area. |
| S9 | **Fixed** | When the browser has no share sheet, "Share order" now copies the order text to the clipboard and shows a notice. It falls back to the old `.txt` download only when the clipboard isn't available. The native share sheet is unchanged. |
| S10 | Skipped | The receive success panel is in `view.tsx` (not mine). Prefilling the invoice total would change the declared-total check. |
| S11 | Partly fixed | "Add Batch" is now **Add stock** (existing key `scanner.tab_stock`, already translated in all 10 languages) on the buy-list row, the product page button and the stock editor title. "Receive delivery" (PO, in `view.tsx`) and "Receive new stock" (invoice option, GST catalogue) are unchanged. |
| S12 | **Fixed** | The Buy list and Suppliers kicker is now **Purchasing** (`poweb.kicker`, as on the PO and invoice pages) instead of "Stock on hand". |
| S13 | **Fixed** | The section index no longer shows 01–04 stepper numbers. It now has the fifth section (Short code · Buy in packs, anchor `#product-form-more`) and a visible focus ring. |
| S14 | **Fixed** | A new product's category is guessed the same way as on mobile: from the most similar product name in the shop, else the shop's most used category, else the first **stockable** category. The guess updates as the name is typed, until the user picks a category. A `?category=` link still wins. |
| S15 | **Fixed** | The "No barcode? Generate one" checkbox now sits under the Barcode field. The Camera button didn't move. |
| S16 | **Fixed** | Save is no longer disabled for a missing name or sub-category. The browser's own validation focuses the first missing field, and an inline message linked with `aria-invalid` / `aria-describedby` appears under it. The footer hint is removed. Edits still need a change before saving. |
| S17 | **Fixed** | Prices & GST order is now Selling price → MRP (with auto-calculate) → Buying price / discount → GST fields and preview. No maths changed. |
| S18 | Partly fixed | The product summary and stock actions now come first, and Stock history is below them, above Batches. The manual "Save today's snapshot" button is kept, because removing it would remove a capability. |
| S19 | Partly fixed | "Import products" is a visible header button for owners and managers, and it was removed from the tools disclosure. Select, Barcodes, Export and Bulk history stay in "Product tools". |
| S20 | **Fixed** | A shop with no products now sees "No products yet" with **Add Product** and **Import products** (existing keys). There is no Scan card: no fitting existing page or string. |
| S21 | **Fixed** | Product, supplier, buy-list and invoice rows use "›" instead of "↗". The header button says "Add Product" (`modal.add_product.title`). Refresh is a quiet button. |
| S22 | Skipped | Mobile does the same as web. Save is disabled while any row has errors (`counts.errors>0`), and rows are skipped one at a time. Mobile also has the issue filter and the issue-report download, which web already has. |
| S23 | Skipped | One mode per file is part of the server import contract (`options.mode`). Mobile works the same way. |
| S24 | Skipped | Large redesign (L). It is not a fix. |
| S25 | **Fixed** | The upload card is a drop target, with a dashed saffron outline while dragging (no transition under reduced motion). A dropped file must be .xlsx or .csv. Managers see the existing "Only the owner can import stock…" note on the review step. |
| S26 | Skipped | `view.tsx` is outside my area. |
| S27 | Skipped | `view.tsx` is outside my area. |
| S28 | Skipped | The copy is in `retail-locales.json`, a shared translation file. |
| S29 | Skipped | The field labels are keyed by their English text in the GST catalogue, so renaming them breaks the translations. "Original invoice total" is a data-safety check (the total must match), and mobile asks for the same evidence reference. |
| S30 | Skipped | Large redesign (L). |
| S31 | Skipped | "Quick add" side sheet (M). It would need a new product-creation path. |
| S32 | **Fixed** | There is one "Recorded invoices" link (the back link). The step summary reads "Products · N" (it was a lowercase "N products"). The footer is right-aligned, with Back to the left of the primary button. |
| S33 | Skipped | Merging suppliers needs a data-model and server change. |
| S34 | Skipped | Supplier rows are links. Row actions need a layout change and a payable balance that isn't in the list response. |
| S35 | Skipped | Printing label sheets is a new feature (M). |
| S36 | Skipped | `Spinner` / `EmptyState` are in `ui.tsx`, owned by another agent. |
| S37 | Partly fixed | Batch Active/All toggles have `aria-pressed`. Products, buy-list, supplier and import meta text is now 13px (pills 12px). Product rows, filter tiles and buy-list filters share one focus outline (`--color-saffron`). No table semantics were added. |
| S38 | Partly fixed | Paired with S16: the product Save button is no longer disabled for missing fields. The global disabled style is in `shop.css` (not mine). |
| S39 | Skipped | The mobile tab bar is in `chrome.tsx` (not mine). |

Supplier import (`party-import.tsx`): the review didn't cover it, and the file is shared with Customers and owned by another agent. Not touched.

## Files changed

- `app/shop/purchases/page.tsx`
- `app/components/shop/screens/purchase-new.tsx`, `purchases.tsx`, `purchase-orders.tsx`
- `app/components/shop/screens/product-form.tsx`, `products.tsx`, `product-detail.tsx`, `inventory-import.tsx`
- `app/components/shop/screens/buy-list.tsx`, `suppliers.tsx`, `supplier-detail.tsx`, `gst-supplier-detail.tsx` (arrow glyph and kicker only)
- `app/components/shop/product-stock-editor.tsx` (title label)
- `app/shop/styles/fixes-stock.css`
- `tests/products-workspace.test.cjs`: the Helper test now asserts there is no "Add stock" button, where it used to check "Add Batch". This changed because the label was renamed on purpose (S11).

## New translation keys

Only one new key. Every other string reuses an existing key.

| Key | English fallback |
|---|---|
| `poweb.share_copied` | Order copied. Paste it into WhatsApp or email to send it to the supplier. |

It isn't added to any locale JSON: no test requires it, and other languages fall back to the English text.

Existing keys reused: `scanner.tab_stock`, `poweb.kicker`, `modal.add_product.title`, `imports.title`, `imports.stock_help`, `home.empty_title`, `home.empty_subtitle`, `modal.alerts.add_to_buy_list`, `modal.alerts.dialog_added_message`, `modal.alerts.toast_buy_list_fail`, `gst.purchase_stock_summary`, `gst.ui.none_6eef66`, `products.title`, `buy_list.title`, `modal.add_product.alert_name_required`, `modal.add_product.subcategory_placeholder`, `modal.add_product.short_code_label`, `modal.add_product.packs_label`.

## What mobile does (behaviour decisions)

| Decision | Mobile (source) | Web now |
|---|---|---|
| Default low-stock level for a new product | 5 (`app/(modals)/add-product.tsx`, `minStock … ?? 5`) | 5 (it was 0) |
| Default category | Guessed from similar product names → most used → first stockable category (same file) | Same logic (it used to take the first enabled category) |
| Invoice without an order adds stock? | Only when the product is out of stock (`receiveStock: out`). Otherwise invoice-only (`purchase-new.tsx`) | Same (it was always invoice-only) |
| Confirmations to save an invoice | "Ordinary supply" tick, goods-movement tick when states differ, and "I checked these amounts…" tick, all required | Unchanged: the same three |
| Confirmations to issue a PO / receive a delivery | "Issue review" tick, and a receipt check before "Confirm receipt" (`src/lib/purchase-orders/view*.tsx`) | Unchanged (in `view.tsx`) |
| Import with some failing rows | Blocked until every failing row is fixed or skipped one by one. A confirm dialog appears before saving (`inventory-import.tsx`) | Unchanged: the same rule, with a checkbox instead of the dialog |
| "Add all" low stock to buy list | Alerts screen: quantity = reorder level, already-listed items skipped | Same, on the Products Low/Out views |

## What to test by hand (risky)

1. **Invoice stock default.** Record a supplier invoice for a product with 0 stock. The line should start as "Receive new stock", and saving should add the stock once. Then try a product that has stock: it should start as invoice-only. Check the summary line before you tick review. A receipt linked to an order (`poReceiptId`) must stay locked to its linked batch.
2. **/shop/purchases.** Open it from Settings → Supplier invoices, and from a GST supplier → "View this supplier's invoices". The list should show, and the supplier filter should be preselected. Also try a supplier that isn't in the first page of the supplier dropdown.
3. **Product form.** With an empty name, click Save: focus should move to Name and the inline error should appear. "Save and add another" should clear that error. Check that the category guess follows the typed name until you pick a category. Edit an existing product and confirm Save is still disabled until you change something. New products now load the catalogue (one extra request, usually cached).
4. **Add all to buy list.** On the Low stock view with several items, click the button once. The buy list should get one entry per item and no duplicates. The button should disappear after the list refreshes.
5. **Share order on desktop.** Clipboard permission may be denied (for example, on an http origin). The order view should then show "Sharing was cancelled…" and nothing else should break.
6. **Import drop.** Drop an .xlsx file, then a .pdf. The .pdf should show the file-type error. Then sign in as a manager and check that the review step shows the owner-only stock note.
7. Check text sizes and focus outlines in the Products, Buy list and Suppliers lists at 1440px and on a phone.
