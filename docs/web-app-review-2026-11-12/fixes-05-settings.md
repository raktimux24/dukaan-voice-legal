# Fixes for 05 · Settings, GST, online store

Branch `cursor/webfix-settings`, from `origin/cursor/web-app-fixes-base`. 12 November 2026.

**Summary:** of the 44 findings, 27 are fixed or partly fixed (9 of them partly), 16 are skipped, and 1 (S11) was checked and needed no change. `npx tsc --noEmit -p .` passes. `npm run check:release` passes (exit 0), and it also passed before these changes. No test files were changed.

## Findings

| ID | Result | What changed, or why it was skipped |
|---|---|---|
| S1 | Skipped | Mobile Settings is one list that starts with language, voice and display. A card grid by job is a bigger structural decision that mobile doesn't answer. |
| S2 | Partly fixed | Customers is removed from the Settings › Shop list. It is already in the sidebar, and mobile doesn't list it in Settings. Cashbook, Purchases and Online store stay: mobile still lists Purchases and Online store in Settings, and Cashbook isn't in the web sidebar yet (chrome.tsx belongs to the shell agent). The filtering happens in `settings.tsx`, because `app/lib/shop/settings.ts` isn't in my area. |
| S3 | Fixed | Switching sections writes `?section=` to the address (`history.replaceState`). Back links now go to `/shop/settings?section=shop`: Shop profile, Payments, Subscription, Online store and GST records. Opening balances goes to `?section=data`, and Branding goes back to `/shop/settings/payments?tab=bills`. |
| S4 | Fixed | The 01–04 numbers are gone. In-app links show "→" instead of "↗", including Create/join shop, View plan, Branding, the Payments settings link and the GST "More reports" links. "↗" stays only on Privacy policy and Terms. |
| S5 | Fixed (CSS) | The identity strip is shorter: less padding, a smaller avatar and smaller name text. |
| S6 | Partly fixed | Shows "Saving…" while a preference saves. "Saved" still appears in the shared status line, not next to the control. |
| S7 | Skipped | Mobile shows Switch shop both in Settings and in Shop settings, so the web keeps both. |
| S8 | Skipped | Mobile keeps default unit and the low-stock toggles in Shop settings. The web matches that. |
| S9 | Fixed (CSS) | The Shop profile "Delete shop" control now uses the same red danger style as the Account section, with a warning mark. |
| S10 | Skipped | Mobile uses the same shared `DeletionView`: two steps, no typed name. Per the brief, the web matches mobile. The view also lives in `app/lib/shop/deletion/view.tsx`, outside my area. |
| S11 | Checked, no change | The web uses `samaan-bol@outlook.com`, which matches mobile's `SUPPORT_EMAIL` in `src/constants/support.ts`. The file is outside my area anyway. |
| S12 | Skipped | The save bar already sticks to the bottom of the screen (`position: sticky` in shop.css). An uploaded QR saving straight away is how it works today and on mobile, and I didn't change save behaviour. |
| S13 | Partly fixed | The Payments tab now says the QR prints on bills only after the Branding › Content switch is on, with a link to it. The switch is not turned on automatically: that would change saved settings, and mobile doesn't do it. |
| S14 | Partly fixed | Added a one-line hint: "After this many hours a bill can no longer be cancelled. 24 = one day, 168 = one week." The label keeps its existing translated key so other languages don't drop to English. It stays a number field because a dropdown would change which values can be entered. |
| S15 | Fixed | The tabs now use `role="tablist"`/`tab`/`tabpanel`, arrow keys, Home and End. The chosen tab is in the address as `?tab=bills` or `?tab=gst`. |
| S16 | Skipped | Large effort and it changes how bill fields are saved. One "Bill design" page needs a product decision first. |
| S17 | Skipped | `documents.uncertain` is a shared key, also used on mobile, translated in the locale files, and its fallback is in `en-fallback.ts` outside my area. |
| G1 | Fixed | GST records now has a "GST setup" row showing the current registration and GSTIN, or "Not set up yet", linking to `/shop/settings/payments?tab=gst`. The GST setup tab already linked back. |
| G2 | Fixed (mobile's numbers) | The page now opens on a month card: month name, ‹ › to change month, "Sales before GST", "GST collected", the CGST/SGST(/IGST) split, the count of bills / business bills / credit notes, an all-good or "N things need your attention" line, "Prepare report for your accountant" and "These are your recorded totals, not a filed GST return." This is the same endpoint (`GET /api/shops/{id}/pos-settings/gst-month/{month}`) and the same figures mobile shows. It is called through the existing `api.gst.get`. The server allows owners and managers, the same as the page's `canSeeReports` check. There is **no "net to pay" (GST on sales minus GST on purchases)**: mobile doesn't show one, and working it out would be new tax arithmetic. |
| G3 | Fixed | Month close (`periods?month=`) and Business turnover review are now linked from GST records. The "More reports" links on Reports are kept as a second way in. |
| G4 | Fixed | The page structure follows mobile: month card, Needs attention, then Bills & credit notes, Reports, Month close, GST setup and Review product GST. Invoice numbers, Billing devices, Sync & recovery, Providers (only when there are provider jobs), Rounding (only when available), Turnover and Run a full record check sit under a collapsed "Advanced · For your accountant or support" section. The installations list and provider counts are no longer embedded on the page. All existing URLs still work. |
| G5 | Partly fixed | Labels on GST records and the sub-page titles now use mobile's plain names: Invoice numbers, Billing devices, Sync & recovery, Reports. Wording deeper inside the sub-pages (for example "Unconfirmed positions") is unchanged. |
| G6 | Partly fixed | On Billing devices, the user ID and device ID are inside a collapsed "Support reference" section, as Invoice numbers already did. The heading is still the member's name, or "This device". No browser or OS name is shown, because the API doesn't return one. |
| G7 | Fixed (notice only) | When Regular or Composition is chosen, a line shows before Save: "After you save, the registration type, GSTIN, legal name, state and start date can only be changed by support. Check them now." Mobile has no extra confirmation step here, only the existing review checkbox, so I didn't add a blocking dialog. |
| G8 | Partly fixed | Each incomplete product in GST checks links to `/shop/products/{id}/gst`. "Review product GST in bulk" opens the list filtered to products missing tax details when there are any. The choice cards for price mode were skipped: that form is shared, `SettingsFields` in gst-ui. |
| G9 | Partly fixed | Added "All" / "Tax details missing · N" filter chips (`?filter=missing`), "Select shown (up to 100)", and an HSN hint. The JSON export stays, because removing an export is out of scope. |
| G10 | Fixed | "Keep any saved request and review recovery" now shows only when this browser holds a request that is still pending, or when that can't be checked. A plain failure shows just the error. |
| G11 | Fixed (where wired) | `useGstAction(successText)` takes an optional success line. It is used for revoking a device. Bulk product GST shows "GST saved for N products." Other callers, including other areas' screens, behave as before. |
| G12 | Fixed | Each page now has its own empty message: Invoice numbers, Billing devices, Sync & recovery, Saved reports, and the "missing" filter on bulk product GST. |
| G13 | Partly fixed | Reports opens on Prepare (`?tab=history` opens the history tab) and is titled "Reports", as on mobile. The month card's button links straight to a sales register for the selected month. There is no one-click zip "monthly pack": that would change what gets exported. |
| G14 | Fixed | Installations and providers are no longer embedded on the page. "Check details" shows only when there are problems, and then it is open. |
| G15 | Fixed | The revoke sheet now says it can't be undone, and that the person will have to sign in again and the browser or phone will be set up as a new device. |
| D1 | Skipped | Needs a period picker for the sales CSV and a new "Your data" page. Medium-sized change in how data is laid out, not covered by mobile. |
| O1 | Skipped | Mobile uses the same title (`opening.title`). The checklist text lives in the shared opening view and locale files. A tooltip for the disabled step 5 needs `t` inside `openingWebUi`. |
| B1 | Skipped | The repeated "Premium included for now", the "Current plan —" and the button prominence are all in `app/account/AccountClient.tsx`. That file is shared with the public /account page and isn't in my area. |
| B2 | Fixed | The page is titled "Subscription" (`subscription.section_title`), the same name as the sidebar, the Settings link and mobile. |
| C1 | Skipped | Sidebar and badges belong to the shell agent (`chrome.tsx`). |
| C2 | Fixed (CSS) | Online store tabs no longer break a word ("Produ/cts"): `min-width:min-content`, `overflow-wrap:normal`, in `fixes-settings.css`. |
| C3 | Skipped | The Store tab layout is in `app/lib/shop/commerce/view.tsx`, outside my area. |
| C4 | Skipped | Mobile unpublishes with one press and no confirmation, using the same shared view. Per the brief, the web matches mobile. The view is also outside my area. |
| C5 | Skipped | Order actions are in `commerce/view.tsx`, outside my area. |
| C6 | Skipped | Large effort: changes the order-to-bill flow. |
| A1 | Fixed (my pages) | New `app/components/shop/settings-tabs.tsx` (`TabList`) is used for: the Settings sections (vertical), the Payments tabs, the Branding tabs, the Reports and Sync & recovery tabs, and `openingWebUi.Tabs`, which also serves Online store, Estimates and Cashbook. Old styles are kept and `aria-selected` rules were added. |
| A2 | Skipped | Moving the settings CSS onto tokens means editing shop.css, which another agent owns. The new CSS uses tokens where they exist. |

## Files changed
- `app/components/shop/settings-tabs.tsx` (new: `TabList`, `syncQuery`)
- `app/components/shop/screens/settings.tsx`, `payments.tsx`, `document-branding.tsx`, `opening-balances.tsx`, `online-store.tsx`, `shop-settings.tsx`, `subscription.tsx`
- `app/components/shop/screens/gst-records.tsx`, `gst-reports.tsx`, `gst-products.tsx`
- `app/components/shop/gst-workspace.tsx`
- `app/components/shop/payment-gst.tsx`: **not on my list of files.** It is the GST setup tab inside Payments, and G7 and G8 couldn't be done without it. Nobody else's area uses it.
- `app/lib/shop/gst-web-locales.json`: lines added only (mobile's translations, see below)
- `app/shop/styles/fixes-settings.css`

## New translation keys

**Copied from mobile with all ten languages** (from `src/i18n/gst-records-ui-locales.json`, added to `gst-web-locales.json`):

`recordsUI.hub.` + monthSoFar, prevMonth, nextMonth, sales, gstCollected, split, splitInter, bills_one, bills_many, business, credits_one, credits_many, noBills, totalsFailed, allGood, attention_one, attention_many, checked, prepare, notFiled, needsAttention, att.records, att.month, att.portal, bills, billsSub, reports, reportsSub, close, closeSub, advanced, numbers, fullCheck, fullCheckSub, sync.

Mobile's versions of `att.unsynced`, `numbersSub`, `devicesSub` and `syncSub` say "this phone", so the web uses its own keys for these instead.

**New web keys, English fallback only.** They are not in any locale JSON, so other languages show the English text until they are translated:

| Key | English |
|---|---|
| `payweb.qr_on_bills` | To print this UPI QR on bills, also turn on “Print configured UPI payment details” in Branding & formats → Content. |
| `payweb.void_hours_hint` | After this many hours a bill can no longer be cancelled. 24 = one day, 168 = one week. |
| `payweb.gst_lock_warning` | After you save, the registration type, GSTIN, legal name, state and start date can only be changed by support. Check them now. |
| `gstweb.hub.unsynced` | Bills and requests saved in this browser, waiting to be confirmed |
| `gstweb.hub.setup_missing` | Not set up yet |
| `gstweb.hub.products_sub` | Give each product its HSN code and GST rate |
| `gstweb.hub.advanced_sub` | For your accountant or support |
| `gstweb.hub.numbers_sub` | Number blocks reserved by each browser or phone |
| `gstweb.hub.devices_sub` | Browsers and phones that can issue GST bills |
| `gstweb.hub.sync_sub` | Bills and requests saved in this browser |
| `gstweb.empty.numbers` | No invoice numbers yet. They are reserved when the first GST bill is made. |
| `gstweb.empty.devices` | No billing devices yet. A browser or phone appears here after it makes its first GST bill. |
| `gstweb.empty.recovery` | Nothing waiting. Every bill and request saved in this browser has been confirmed. |
| `gstweb.empty.reports` | No saved reports yet. Open Prepare to make this month’s sales register. |
| `gstweb.device_revoked` | Device revoked. It can no longer make GST bills. |
| `gstweb.revoke_permanent` | This can’t be undone. To bill again from this browser or phone, the person will have to sign in again and it will be set up as a new device. |
| `gstweb.select_shown` | Select shown (up to 100) |
| `gstweb.hsn_hint` | HSN is the tax code printed on your supplier’s bill for the same item. |
| `gstweb.bulk_saved` | GST saved for {n} products. |
| `gstweb.none_missing` | Every product has tax details. |

Existing keys reused in new places: `web.gst.gst_records` (the Settings link label and the page title, matching mobile's "GST records"), `subscription.section_title`, `recordsUI.devices`, `gst.health_unavailable_title`, `gst.registration.*`, `gst.bulk_title`, `common.saving`, `common.all`.

## What mobile does, for each decision
- **GST area:** mobile's `gst-health.tsx` shows the month card from `gst-month`, then Needs attention, then Bills / Reports / Month close, then Advanced (numbers, devices, sync, providers, rounding, full check). The web follows this. It also adds GST setup and Review product GST, which mobile keeps in Payments & bills, and Turnover, which mobile reaches from Reports.
- **GST total:** mobile shows "GST collected", not a net amount to pay. The web does the same.
- **Reports:** mobile's `gst-exports.tsx` is titled "Reports" and opens on preparing a register, with saved reports below. The web opens on Prepare.
- **Locking the GST profile:** mobile has the review checkbox and shows `gst.active_profile` after saving. There is no lock warning beforehand. The web adds a notice line only, not a blocking step.
- **Unpublishing the store:** mobile does it with one press and no confirmation. The web is unchanged.
- **Deleting the shop or account:** mobile uses the same shared `DeletionView`, two steps with no typed name. The web is unchanged.
- **Billing:** mobile calls it "Subscription" and shows no pricing in the app. The web title now says Subscription. Purchase paths and `AccountClient` are untouched.
- **Settings list:** mobile lists Staff, Switch shop, Shop settings, Payments & bills, GST records, Purchases and Online store. It does not list Customers or Cashbook.

## Please test by hand
1. **GST records month card.** Test against the live server with the Owner and Manager roles. Check that `gst-month` is deployed, that the figures match the mobile app for the same month, that ‹ › don't go past the current month, and that the "Prepare report" button opens Reports › Prepare with the correct from/through dates. If the endpoint is missing, the card should show "Couldn't load this month's totals" with Retry.
2. **The recovery link after a GST error (G10).** Make a financial GST action fail, for example a purchase or GST sale while offline, and check that the link still appears. A plain failure, such as revoking a device with no network, should show only the error.
3. **Tab keyboard behaviour.** Check arrow keys, Home and End, and visible focus on Settings, Payments, Branding, Reports, Online store, Estimates and Cashbook. Estimates and Cashbook belong to other areas but use `openingWebUi.Tabs`. Check that the Settings section and `?tab=` survive a reload and that back links land in the right section.
4. **Payments `?tab=gst` on first load.** The GST tab should load its readiness checks.
5. **Bulk product GST.** Check that the "Tax details missing" filter, "Select shown" (capped at 100) and the saved count are correct after applying.
6. **Online store tabs** at 1440px and at 375px: no word splitting and no sideways scrolling.
