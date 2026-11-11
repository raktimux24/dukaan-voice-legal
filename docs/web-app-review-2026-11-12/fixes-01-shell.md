# Fixes for 01 — Shell, Home, Voice and cross-cutting

Branch: `cursor/webfix-shell` (from `cursor/web-app-fixes-base`). Checks: `npx tsc --noEmit -p .` passes; `npm run check:release` passes (exit 0).

Behaviour was checked against the mobile app (`dukaan_voice_mobile`) where a finding asked for a behaviour change.

## Findings

| ID | Status | What changed / why skipped |
|---|---|---|
| S1 | Fixed | Mic button (40px, saffron outline) in the top bar on every page except the counter, plus a `V` shortcut. The counter keeps its own voice button, which stays locked while a bill is being saved. |
| S2 | Skipped | A global search needs Home's search (catalog, bills, customers, suppliers, demand notes) lifted into the shell. That is a medium refactor of another flow, not a shell fix. The date stays in the top bar. |
| S3 | Skipped | Mobile signs out without a confirmation, so none was added. Removing the top-bar "Sign out" was also left alone: Clerk's own avatar-menu sign-out skips the app's cleanup (`signOutShop`: billing shell, offline shop, browser push). Needs a product decision. |
| S4 | Fixed (shell part) | One primary "New sale" (40px, leading + icon, `N` shortcut) in the top bar on every page except Sell. Home's duplicate is removed. **Sales still has its own page-level New sale: the Sales owner should remove it.** |
| S5 | Fixed | The shop card is one 44px row: name, or a shop switcher when there are several shops, plus the role pill. Group gap is 12px. The rail scrolls (children no longer shrink, thin scrollbar, tighter rows when the screen is shorter than 760px). "Join or create a shop" in the menu was not added: there is no web join flow from inside a shop. |
| S6 | Fixed | Added Estimates and Online store (Counter), Purchase orders and Supplier invoices (Stock), and Cashbook (Insights). Each uses the permission its page checks: Estimates `canSell`, Online store and Purchase orders `canEditProducts`, Supplier invoices `canSeeCost`, Cashbook `canSeeReports`. Supplier invoices links to `/shop/purchases?list=1` and is active on `/shop/purchases/*`. Notifications are not in the rail: the bell already goes there. |
| S7 | Fixed | Phone tabs are now Home, Sell, Sales, Products, **More**. More opens a sheet with every sidebar group plus Settings and Billing, filtered by permission. |
| S8 | Partly fixed | The bell is labelled "Alerts", and the Alerts page title is now "Alerts". The count is unchanged: mobile also shows `counts.total`. A different count needs a server/product decision. |
| S9 | Fixed | Rail group labels are #8a8a90 at 12px. "Skip to content" link targets `main#shop-main`. Navs are labelled "Main" and "Quick tabs". |
| S10 | Skipped | Moving to three breakpoints touches every screen's CSS (L effort), and four other agents are editing those screens now. |
| H1 | Fixed | The streak is a small pill next to the title. "Sold this month" moved below today's sales. |
| H2 | Fixed | The vs-yesterday delta is hidden until today has at least one bill. A same-time-yesterday comparison needs a server change, so it was not done. |
| H3 | Fixed | The voice command uses the mic glyph and a saffron tint. |
| H4 | Skipped | Merging Stock watch, the attention grid and alerts into one list with inline "Add to buy list" changes behaviour and needs a design (M effort). The arrows on these links are now →. |
| H5 | Fixed | The shop desk is deleted. Its two tasks, "Scan to bill" and "Add product", stay as a small shortcut row. Every desk destination is in the sidebar, or in More on a phone. |
| H6 | Fixed | New key `homeweb.on_hand_qty` makes the row read "2 piece in stock". |
| H7 | Skipped | A "2 of 4 done" setup card needs progress data for opening stock, customer dues and GST that Home does not load. |
| H8 | Partly fixed | The ✳ glyph is removed. The brief sentence comes from the server. |
| H9 | Fixed | Home meta text is at least 12px and meaningful labels at least 13px (`fixes-shell.css`). |
| V1 | Fixed | The mic button takes focus when the sheet opens, through `data-autofocus` plus focus on mount. Enter or Space starts and stops recording. Esc closes, as before. |
| V2 | Fixed | Step 1 now asks "Say what you sold, what came in, or ask about stock.", shows the voice language, and lists the same three example phrases as mobile in the voice language. The button reads mic + "Tap to speak". "Please verify the command" appears only on the review step. |
| V3 | Mostly fixed | Bars are grey at 30% while idle and saffron while recording. The voice language is shown. Microphone denied, missing or unsupported now shows its own message. A countdown ring and a "Change language" link were not added. |
| V4 | Fixed | Voice codes (`voice_busy`, `voice_upstream`, `voice_timeout`, `voice_failed`), plus 401, 429, 5xx and network failures, map to the existing `modal.voice.err.*` strings through the new `Notice` `messages`/`fallback` props. Only one message shows, and the modal stays open so the mic can be pressed again. |
| V5 | Partly fixed | The confidence percentage is removed; the High confidence / Please verify label stays. The compact row layout and the remove-line (×) button were not built: mobile has no way to remove a line either. |
| V6 | Fixed | Done (and Close) go back to the page voice was opened from, as `router.back()` does on mobile. The busy label is "Updating inventory..." for stock or "Processing..." for a sale. A toast with Undo would need an undo endpoint, so it was not added. |
| A1 | Fixed | Alerts uses the new underline `Tabs`, with counts on every tab. AI Insights uses `counts.ai` when Premium. |
| A2 | Fixed | Items already on the buy list show a "✓ On buy list" status link to the buy list, not a disabled "Added" button. The bulk bar reads "1 item is not on your buy list yet: {{name}}" or "{{n}} items are not on your buy list yet". |
| A3 | Skipped | Mobile uses the same 10 kg fallback and has no Undo for dismissing. |
| B1 | Fixed | The "Reports" kicker is removed. "Review stock" is the primary button and opens the low-stock filter. Listen is a secondary button with a speaker icon. History shows 3 entries with Show more / Show less. |
| O1 | Skipped | Mobile asks for the same fields (owner, name, type, phone, address, city) and the GST step. Cutting fields is a product decision. |
| O2 | Skipped | Mobile also goes straight to setup records / opening balances after creating a shop. |
| D1 | Partly fixed | Kickers removed on Home, Alerts and Brief. Other screens should drop their tagline kickers. |
| D2 | Not changed here | Back links belong to each screen. Alerts and Brief keep "← Home", which is their true parent. |
| D3 | Primitive added | `Button` now takes an `icon` prop (always leading) and a `shortcut` prop. Home and the shell use → for internal links. |
| D4 | Primitive added | `Tabs` and `SegmentedControl` in ui.tsx (`Chip` already covers filter chips). Used on Alerts. |
| D5 | Primitive added | `StatRow` in ui.tsx. |
| D6 | Skipped | Removing page Refresh buttons is cross-page, and `tests/home-dashboard.test.cjs` relies on Home's Refresh. |
| D7 | Primitive added | `Skeleton` (line / stat / row / card, `role="status"` with an sr-only label, no animation when reduced motion is on). Used on Home. |
| D8 | Primitive added | `EmptyState` (48px tinted icon, title, help line, one action). Used on Home. |
| D9 | Skipped | Page widths belong to each screen. |
| D10 | Skipped | Rounding summary money changes many screens' displays. Left for each owner, so no money output is changed here. |
| D11 | Fixed | `Button size="sm"` is at least 36px tall (shop.css). |

## Screens that should adopt the new pieces

- **Tabs**: Notifications is done. Cashbook (its segmented tabs wrap), Estimates (pill chips used as views), Reports, Activity, Customers, Buy list, Online store (the "Products" tab wraps), Supplier invoices (`.invoice-tabs`).
- **SegmentedControl**: Sell / Add stock style two- or three-way modes only.
- **StatRow**: Products, Customers, Staff, Cashbook, Reports, Buy list stat strips.
- **EmptyState**: every `shop-list-empty`, `IllustratedEmpty` and `Empty` use (Sales "No bills today", Products, Buy list, Suppliers…).
- **Skeleton**: every `Spinner` (about 35 files), for example Sell "Loading products…" and Sales "Period overview / Loading…".
- **Button `icon`**: "New sale +" on Sales, "Add item +" on Buy list, "Add customer +" on Customers, "Invite teammate +" on Staff, "+ Add" on Products and Sell.
- **Notice `messages` / `fallback`**: any area whose errors currently fall back to the GST "action failed" text.
- **Sales** must remove its page-level "New sale" now that the top bar has one (S4).

## Files changed

- `app/components/shop/ui.tsx`: new `Tabs`, `SegmentedControl`, `StatRow`, `EmptyState`, `Skeleton`; `Button` `icon`/`shortcut`; Glyphs `plus`, `speaker`, `more`, `close`, `check`, `chevron`; `Notice` `messages`/`fallback`. Existing exports and props are unchanged.
- `app/components/shop/chrome.tsx`: sidebar items, compact shop card, top-bar mic and New sale, shortcuts, skip link, nav labels, More sheet.
- `app/components/shop/voice-sheet.tsx`: focuses `[data-autofocus]` after opening.
- `app/components/shop/voice-capture.tsx`, `app/components/shop/screens/voice.tsx`: V1–V6.
- `app/components/shop/screens/home.tsx`, `alerts.tsx`, `brief.tsx`: H, A and B fixes.
- `app/shop/shop.css`: small edits only. Rail label colour, size and margin; tab, role-pill and bell-count text at 12px; `.is-sm` at 36px.
- `app/shop/styles/fixes-shell.css`: all new rules.
- `app/lib/shop/gst-web-locales.json`: new keys (below).
- `tests/home-dashboard.test.cjs`: the ui mock now includes `Skeleton` and `EmptyState`.

## New translation keys

All are in `app/lib/shop/gst-web-locales.json`, in every language. Unless marked, the other languages hold the **English text as a placeholder** and need translating.

| Key | English |
|---|---|
| `homeweb.skip_to_content` | Skip to content |
| `homeweb.nav_main` | Main |
| `homeweb.nav_quick` | Quick tabs |
| `homeweb.nav_more` | More (*translated: copied from `cashbook.more`*) |
| `homeweb.voice_tap_to_speak` | Tap to speak |
| `homeweb.voice_prompt` | Say what you sold, what came in, or ask about stock. |
| `homeweb.voice_try_saying` | Try saying (*translated: copied from mobile `voice.try_saying`*) |
| `homeweb.voice_not_understood_title` | Didn't catch a command (*translated: from mobile*) |
| `homeweb.voice_not_understood_body` | Say the item, how much, and what happened. (*translated: from mobile*) |
| `homeweb.voice_mic_blocked` | Allow microphone access for this site in your browser, then try again. |
| `homeweb.voice_mic_unsupported` | This browser cannot record audio. Try the latest Chrome or Edge. |
| `homeweb.on_hand_qty` | {{qty}} in stock |
| `homeweb.alerts_on_list` | On buy list |
| `homeweb.alerts_bulk_one` | 1 item is not on your buy list yet: {{name}} |
| `homeweb.alerts_bulk_other` | {{n}} items are not on your buy list yet |
| `homeweb.show_more` | Show more |

Sidebar labels reuse existing keys: `estimates.mobile.title_short`, `commerce.title`, `po.title`, `gst.ui.supplier_invoices_30bf2e`, `cashbook.title`, `a11y.voice`, `sale_complete.new_sale`, `modal.alerts.title`.

## Test by hand

1. **Shortcuts and scanners.** On Products or Home with nothing focused, scan a barcode that contains V or N. It must not open voice or Sell: the shortcut waits 90 ms and any following key cancels it. Shortcuts are off on `/shop/sell*`, while typing, and while any dialog is open. Check this with your real scanner's speed.
2. **Voice from the top bar** on a non-Home page (Products, Customers). It should open as a modal over the page (intercepted route), with focus on the mic. Close and Done should go back to that page. A spoken sale should still go to checkout.
3. **Voice errors**: deny the mic, use a browser without MediaRecorder, go offline mid-request, and have the server return `voice_busy`. Each should show one specific message.
4. **Sidebar as Manager and Helper**: Helper sees Estimates, but not Online store, Purchase orders, Supplier invoices, Cashbook, Suppliers, Customers or Reports. Manager sees all except Billing. Each page should open without a NoAccess screen.
5. **Short laptop screen** (about 1366×700): the rail scrolls to Settings and Billing.
6. **Phone width**: the More tab opens the sheet, links close it, and the More tab is highlighted on pages that are not tabs.
7. **Shops switcher** with two or more shops: the rail select switches shop.
8. **Home start of day** with 0 bills: no red "-100%".
