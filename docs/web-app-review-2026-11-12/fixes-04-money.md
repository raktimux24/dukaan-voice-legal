# Fixes for 04 — people, money and reports

Branch `cursor/webfix-money`, from `origin/cursor/web-app-fixes-base`. Nothing here was run in a browser: no dev server or build was allowed, so every change was checked by reading code, `tsc` and `npm run check:release`.

**Totals:** 22 of 44 findings fixed in full or in part. 22 skipped. Most skips are findings whose code lives in files this branch does not own. Those files are `app/components/shop/gst-customer-payment.tsx`, `gst-workspace.tsx`, `app/lib/shop/cashbook/view.tsx`, `app/lib/shop/followups/view.tsx`, `app/lib/shop/credit/view.tsx`, `app/lib/shop/activity.ts` and the shared `ui.tsx`/`shop.css`. The `app/lib/shop/*/view.tsx` files are copies of the mobile app's files, so changing them on the web alone would make the two apps drift apart.

**Checks:** `npx tsc --noEmit -p .` passes. `npm run check:release` passes (exit 0, every suite `fail 0`). One failure came up during the work and is fixed: the translation test caught a hard-coded "· Premium" text in `reports.tsx`, which now uses the translated key `subscription.status.active`. No test files were changed.

## What mobile does (behaviour decisions)

| Decision | Mobile app | Web after this branch |
|---|---|---|
| Who may count & close the day | Owner only (`src/lib/cashbook/view.tsx`: `owner = d?.role === "OWNER"` gates Cash tools, Count & close and Reopen) | Unchanged, same as mobile (F19 skipped). Whether a Manager should close is still an open question for the owner (00-improvement-plan). |
| Closing confirmations / notes | Count form needs the counted amount and the "count_review" checkbox. The close reason is optional. | Same as mobile, unchanged (F20 skipped). |
| Repayment confirmations / notes | Amount required. Note is not offered. Bill matching is optional. A success toast says "payment recorded". | Web asks for an optional note and shows no success message (F03 not fixed, file not owned). |
| Card for repayments | **Not offered.** `PaymentMethodChips` is used with `showCard` defaulting to false, so only Cash and UPI. | **Web still offers Card** (`gst-customer-payment.tsx:42`, not owned). This is a real mismatch with mobile; the owner of that file should remove `card` (F04). |
| Who follow-ups list | Default filter `due`. A reminder can only include bills with a due date (`o.remaining!=='0.00'&&o.dueDate`). "Mark as sent" needs a note. | Same as mobile, unchanged (F11–F13 skipped). Changing it needs both apps to change together, and possibly the server. |
| Report export Premium gate | The CSV button shows only when `premium && canExport` (Owner/Manager). Free users see no export button and no upsell in its place. | Same as mobile now. Free users no longer see the "Export CSV · Premium ↗" link (F30). |
| Report default period | `useState("7d")`, period chips, locked ranges marked with 🔒 | Same as mobile now (F27, F28). |
| Top products ranking | By quantity by default, with the unit shown | Same as mobile, unchanged (F33 skipped) |

## Findings

| ID | Result | Notes |
|---|---|---|
| F01 | Fixed (partly) | The payment panel on customer detail is now open by default when the customer owes money, and its heading stands out more. It is still a `<details>` element: switching to another element would remount the payment form (`GstCustomerPayment`) mid-save when the balance hits 0. `?receive=1` scrolls to the panel and focuses the amount field (respects reduced motion). Pre-filling the amount and Cash/UPI chips are inside `gst-customer-payment.tsx`: skipped, not owned. |
| F02 | Skipped | Needs a "balance after" line inside `gst-customer-payment.tsx` (not owned). |
| F03 | Skipped | The success message belongs in `gst-customer-payment.tsx` / `useGstAction` (not owned). Mobile shows a toast, so the web should copy that. |
| F04 | Skipped | Not owned. Mobile hides Card, so the web should remove it too (see the table above). |
| F05 | Skipped | Not owned. It also changes how payments are matched to bills, which this branch must not touch. |
| F06 | Fixed | Owing rows get "Record payment" (goes to detail `?receive=1`) and "Text reminder" links under the row. They are sibling links, not nested inside the row link, and have names that include the customer's name. They are always visible, so they work on touch screens, and hidden when offline. |
| F07 | Fixed (partly) | The server already sorts by `balance desc, lastSaleAt desc` (`server/src/routes/customers.ts:72`), so the list now says "Highest balance owed first." A sort control needs a server parameter: skipped. |
| F08 | Fixed | Placeholder "Name or phone" and a 300 ms debounce. The field stays below the tabs: moving it into the tab row is a layout change in `shop.css`. |
| F09 | Fixed | The month figure drops to 15px in a muted colour; the balance stays the main figure. Small text in rows goes up to 13px. |
| F10 | Fixed | Tabs are now "Account", "Returns & notes", "Profile". "Account statement" and "Text reminder" (only when owing) moved into the page header. |
| F11–F15 | Skipped | All in `app/lib/shop/followups/view.tsx` (not owned, shared with mobile). Mobile behaves the same way today. |
| F16 | Fixed (partly) | The misleading "← Reports" back link is removed from Cashbook. The sidebar item belongs to the shell agent. |
| F17, F18 | Skipped | Count form is in `cashbook/view.tsx` (not owned). |
| F19, F20 | Skipped | Mobile does the same thing (Owner only, review checkbox), so per the rules this is left as it is. |
| F21 | Fixed (partly) | CSV export now uses the quiet button style, so it no longer carries the same weight as Count & close. Reordering the actions, the after-6pm primary and the overflow menu are in `view.tsx` (not owned). |
| F22–F24 | Skipped | Dates, status pill and setup are in `cashbook/view.tsx` (not owned). |
| F25 | Fixed (partly) | Cashbook tabs use the underline style and never wrap (they scroll sideways if a translation is too long). The labels are unchanged because they come from `view.tsx` keys. |
| F26 | Skipped | The default category is set in `view.tsx`. Chips plus remembering the last category would need state the form doesn't own. Low impact. |
| F27 | Fixed | Opens on 7 days (as on mobile). Today's hourly chart shows "No sales yet today. The first bill will show here." Every chart with no values now shows a message instead of an empty plot. Remembering the last choice: not done (mobile doesn't). |
| F28 | Fixed | Period chips (pressed state, keyboard-reachable buttons), with a 🔒 icon and a screen-reader "· Premium" on locked ranges. |
| F29 | Fixed | Top products is the first panel after the summary tiles. |
| F30 | Fixed | Matches mobile: export appears only for Premium. The wrong `subscription.status.active` label in the header is gone. Entitlement check: export uses the context `premium`, while "Sales by hour" uses the server's `report.premium`. Those two can disagree for a moment while the entitlement loads. Not changed; worth a manual look. |
| F31 | Skipped | These labels are accurate accounting distinctions ("before returns", "not the sales total"). Simplifying them changes their meaning, which is a product decision. |
| F32 | Fixed (partly) | Single-series charts show "Highest: {label} · {value}" above the plot, readable without hovering. Keyboard-focusable bars with tooltips: not done (M effort). The values table remains. |
| F33 | Skipped | Mobile ranks by quantity and shows the unit. The web already shows the unit too. |
| F34 | Fixed | No back link. Role counts are one line ("Owner 1 · Manager 0 · Helper 0", using existing translated role names). Role shown as a pill on each row. |
| F35 | Fixed (partly) | "Send on WhatsApp" (`wa.me/?text=` with the existing invite message, new tab). It is shown only when a code exists, which is the same rule as Share. The existing hint already says the link opens the phone app. A pending-invites list needs a server endpoint: skipped. |
| F36 | Fixed | Member detail is now `?member=id` via `history.pushState`. Browser Back returns to the list. "Back to team" goes back in history, or replaces the URL if the page was opened directly from a link. |
| F37 | Fixed (partly) | "N entries" day count. The source badge is hidden for manual entries (only Voice/Scan/Import/System shown). Details text goes to 13px with a 40px summary target. Rewording the event titles needs `app/lib/shop/activity.ts` and the locale files (not owned). |
| F38 | Skipped | A person filter and search need server query parameters. |
| F39 | Fixed | "Skip all rows with problems (N)" adds every non-skipped row that has issues to `skipRows` and re-runs the same `review` request. The confirmation checkbox is reset, so the owner still confirms before saving. |
| F40 | Fixed (partly) | The statement card heading is now "Account statement". The buttons say "Download CSV" / "Download PDF", because they only download. One-step WhatsApp sharing and the `credit.*` wording are in `credit/view.tsx` (not owned). |
| F41 | Skipped | Replacing Refresh buttons is a shared Phase 2 change across every page. |
| F42 | Fixed (in owned files) | In-app links in Customers, customer detail, Staff, Reports and Activity use "→". "↗" stays on WhatsApp, `tel:` links and the cashbook `Link` primitive (which `view.tsx` uses for its own targets). |
| F43 | Fixed (in owned areas) | 11–12px informational text in customer rows, activity day counts, sources and details goes up to 12–13px. |
| F44 | Skipped | Skeletons are a shared Phase 2 component. |

## Files changed

- `app/components/shop/screens/customers.tsx`
- `app/components/shop/screens/customer-detail.tsx`
- `app/components/shop/screens/customer-credit.tsx`
- `app/components/shop/screens/party-import.tsx`
- `app/components/shop/screens/staff.tsx`
- `app/components/shop/screens/activity.tsx`
- `app/components/shop/screens/reports.tsx`
- `app/components/shop/report-chart.tsx`
- `app/components/shop/screens/cashbook.tsx`
- `app/shop/styles/fixes-money.css`

## New translation keys (English fallback only)

None of these were added to `gst-web-locales.json` or the locale files. Those files aren't owned by this branch and other agents are editing them. Every key renders its English fallback in all languages until it is translated.

| Key | English |
|---|---|
| `customerweb.search_placeholder` | Name or phone |
| `customerweb.sort_note` | Highest balance owed first. |
| `customerweb.record_payment_for` | Record payment for {{name}} (aria-label) |
| `customerweb.remind_name` | Send reminder to {{name}} (aria-label) |
| `customerweb.statement` | Account statement |
| `customerweb.tab_account` | Account |
| `customerweb.tab_notes` | Returns & notes |
| `customerweb.tab_profile` | Profile |
| `creditweb.download_csv` | Download CSV |
| `creditweb.download_pdf` | Download PDF |
| `partiesImport.skip_all_issues` | Skip all rows with problems ({{n}}) |
| `staffweb.whatsapp` | Send on WhatsApp |
| `activityweb.day_count` | {{n}} entries |
| `reportweb.today_empty` | No sales yet today. The first bill will show here. |
| `reportweb.chart_empty` | Nothing recorded in this period yet. |
| `reportweb.peak` | Highest: {{label}} · {{value}} |

**Translation regression to fix:** some labels that were already translated now use new English-only keys. These are the customer-detail tabs (were `customers.ledger`, `customerweb.actions`, `customerweb.details`) and the statement card labels (were `credit.snapshot`, `credit.csv`, `credit.pdf`). Until these keys are added to `gst-web-locales.json` for all 10 languages, Hindi, Tamil and other non-English users will see English there. Reused keys (`customers.record_payment`, `customers.remind`, role names, `subscription.status.active`) stay translated.

## Test by hand (risky spots)

1. **Record a repayment** from a Customers row ("Record payment" → detail opens, scrolls, amount focused). Check the payment saves once, the panel stays mounted while it saves, and it collapses when the balance reaches 0. This touches the money path only through layout, but it needs checking.
2. **Customer import, "Skip all rows with problems"**: check the skipped count, that the error count drops to 0, that Save then enables only after the confirmation tick, and that the skipped rows really aren't imported.
3. **Staff Back button**: open a member, use browser Back; open from a shared `?member=` link, then "Back to team"; remove a member; change role. Check that nothing leaves the Staff page unexpectedly.
4. **Reports as a free user**: there is no export button. 30 days / This month / Last month chips show 🔒 and the "range is Premium" note, and the data stays on 7 days. As Premium: export works for the selected chip.
5. **Cashbook tabs** at 1440px and 375px in Tamil/Malayalam (long labels): no wrapping, sideways scroll if needed, and the sticky header still has a background.
6. **WhatsApp invite** on desktop and on a phone: opens wa.me with the code. Manager sees only the Helper code.
7. Owing-row action links on a narrow phone width (layout was only checked from CSS).
