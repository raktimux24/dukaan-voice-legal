# Fixes for 04, second pass: money area

Branch `cursor/webfix2-money`, from `origin/cursor/web-app-second-pass`. This pass owns the files the first pass could not touch: the repayment form, the cashbook, follow-ups and credit views, `activity.ts`, the expense form and the screens that wire them.

Nothing was run in a browser (no dev server allowed). Checks: `npx tsc --noEmit -p .` passes, and `npm run check:release` passes (exit 0, every suite `fail 0`). No test files changed. The edited views were also rendered once with `react-dom/server` and sample data to check they don't throw.

No request payload, money calculation, idempotency or recovery logic changed. Every new number on screen (balance after payment, cash short/extra, note counter total) is a display-only preview worked out in whole paise. The server still decides what is saved.

## What mobile does (behaviour decisions)

| Question | Mobile app | Web after this pass |
|---|---|---|
| Repayment methods | `PaymentMethodChips` with `showCredit={false} showSplit={false}` and `showCard` off, so only Cash and UPI (`app/(modals)/customer-detail.tsx:262`). | Cash and UPI chips. Card shows only when a saved card payment from before is being finished, so the saved request can still be retried as it was. The request shape is unchanged. |
| Repayment amount | The amount box shows the balance as a placeholder, with a "Full" link. | Amount starts filled with the balance owed (F01 asks for this). "Full ₹X" puts it back if it was changed. After saving, the box stays empty so a second tap can't record the payment twice. |
| Repayment success | Toast `customers.payment_recorded` ("{{amount}} received"). | The same key and wording, shown as a status line in the form. The panel stays open after the balance reaches 0, so the message stays visible. |
| Follow-up notes | Server requires a note for "Mark as sent", contact notes, snooze and settings (`followup-store.ts` `note()` fails with `reason`). | Note is still required. One-tap note buttons fill it in ("Sent on WhatsApp", "Spoke on the phone", …); the owner can edit before saving. |
| Follow-up list default | Filter `due`. | Web opens on a new "Everyone who owes" choice: the server's `all` filter, keeping only balances above zero on the page. The other filters are unchanged. |
| Cashbook start (setup) | Server requires a starting reference and `reviewed: true` (`cashbook-store.ts:408-410`). | Unchanged (F24 skipped). |

## Findings

| ID | Result | Why |
|---|---|---|
| F01 (rest) | Fixed | Amount starts at the balance owed; Cash / UPI are large choice buttons (44px). "Full" now reads "Full ₹12,500.00" and only shows when the amount differs. |
| F02 | Fixed | Live line under the amount: "Balance after this payment: ₹X", "This clears the full balance." or "₹X will be kept as advance". |
| F03 | Fixed | "₹5,000.00 received" (mobile's `customers.payment_recorded`) after saving. Customer detail keeps the panel open after the payment so the message is seen. No WhatsApp receipt or Undo: undo would need a new server action. |
| F04 | Fixed | Card removed from repayments, matching mobile. Method is a chip choice, not a dropdown. |
| F11 | Partly | Opens on "Everyone who owes". The server pages 10 customers at a time in id order and filters inside each page, which is why an empty page appeared. The view now keeps loading pages (up to 10) until it finds someone, hides "Show more" under an empty list, and the "Due" empty state explains due dates with a one-tap "Everyone who owes". Not done: "highest first" needs a server sort. |
| F12 | Skipped | The server builds reminders only from bills with a due date. A full-balance reminder needs a server change. The empty text is reworded to point at setting a due date (see reworded keys). |
| F13 | Partly | Notes stay required (server rule). Quick note buttons fill them in one tap for Mark as sent (matches the channel used), contact notes, snooze, resume and settings. Not done: the "Did you send it? Yes / Not yet" prompt (the note rule still applies to "Yes"). |
| F14 | Fixed | One plain line on top: "We open WhatsApp with the message ready. You press send." The intro, queue help, preview, payment-link, share and sent caveats move into a "How reminders work" disclosure. |
| F15 | Partly | Row button reads "Remind Asha". In the preview the message comes first, then WhatsApp / SMS / Copy, then the details. Showing a drafted message on open would need "prepare" to run automatically, which saves a record on every visit: not done. |
| F17 | Fixed | Live coloured result while counting: "₹120.00 short" (red), "₹120.00 extra" (amber), "✓ Cash matches" (green). The saved close card shows the same chip. |
| F18 | Fixed | "Count notes and coins" disclosure: ₹500 / 200 / 100 / 50 / 20 / 10 counts plus coins fill the counted total. The total field stays editable. |
| F21 (rest) | Fixed | From 6 pm IST, or for an earlier day still open, "Close the day" becomes the first, primary action (owner only, as on mobile). CSV export moves to the bottom next to Refresh. "Owner cash movements" wording: see reworded keys. |
| F22 | Fixed | Previous day / Today / Next day buttons next to the date picker (next is off for future days), and the day shown as "Thu, 12 Nov". Expense rows, payment rows, late-entry notes, movement times and history use the same style, without seconds. The native date box itself still follows the browser's format. |
| F23 | Fixed | Status pill above the totals: "Open", "Closed at 9:12 pm", or "Changed after closing" (red). The "Day status: Open" line is gone. The coverage note sits in a "What this includes" disclosure. |
| F24 | Skipped | The server requires a starting reference and `reviewed: true` to start a cashbook. Wording reworded only (see keys). |
| F25 (labels) | Fixed (wording) | Needs the reworded `cashbook.cashbook` key below ("Day's cash"). "Today's cash" would be wrong when an earlier day is selected. |
| F26 | Fixed | Chips for Petty cash, Transport, Wages, Shop supplies, Other above the full list. The last category used is remembered per shop in this browser (`localStorage`, wrapped in try/catch); the first-ever default stays Rent, as on mobile. |
| F37 (rest) | Fixed | Opening-balance entries, recovered invoices, device reviews and supplier settlements now get their own label instead of "Record". Event titles get plain wording through the reworded keys below (for example "Day closed, cash counted"). |
| F40 (rest) | Partly | "Send on WhatsApp" is now the main button on a statement. It opens `wa.me` (to the customer's number when it is a valid Indian mobile) with a short summary: shop, customer, dates and balance. A `wa.me` link can't attach the PDF, so a hint says to download it. Making the statement and sending it are still two taps, because a pop-up opened after the save is blocked. Plainer `credit.*` wording: see reworded keys. |

Not done on purpose: F05, F19, F20, F38 and anything needing a server change.

## Files changed

- `app/components/shop/gst-customer-payment.tsx`
- `app/components/shop/cashbook-expense-form.tsx`
- `app/lib/shop/cashbook/view.tsx`
- `app/lib/shop/followups/view.tsx`
- `app/lib/shop/activity.ts`
- `app/components/shop/screens/customer-detail.tsx` (keeps the payment panel open after a payment)
- `app/components/shop/screens/cashbook.tsx` (`t` passes an English fallback; new `Status` primitive)
- `app/components/shop/screens/collection-followups.tsx` (`t` passes an English fallback)
- `app/components/shop/screens/customer-credit.tsx` (WhatsApp button)
- `app/components/shop/screens/activity.tsx` (`text` passes an English fallback)
- `app/shop/styles/fixes-money.css`

How new keys work in the views: the views' `t` type now takes an optional third argument, the English fallback (`t(key, vars, fallback)`). The web screens pass it to `translate(key, fallback ?? …, vars)`. Existing calls are unchanged.

## New translation keys (English fallback in code only)

None were added to any locale file. Every one shows English in all languages until translated.

| Key | English |
|---|---|
| `customerweb.balance_after_payment` | Balance after this payment: {{amount}} |
| `customerweb.payment_clears` | This clears the full balance. |
| `customerweb.payment_advance` | {{amount}} will be kept as advance |
| `customerweb.full_amount` | Full {{amount}} |
| `cashbookweb.short` | {{amount}} short |
| `cashbookweb.extra` | {{amount}} extra |
| `cashbookweb.matches` | Cash matches |
| `cashbookweb.prev_day` | Previous day |
| `cashbookweb.today` | Today |
| `cashbookweb.next_day` | Next day |
| `cashbookweb.closed_at` | Closed at {{time}} |
| `cashbookweb.coverage_link` | What this includes |
| `cashbookweb.count_notes` | Count notes and coins |
| `cashbookweb.count_notes_help` | Type how many of each note you have. The total fills in for you. |
| `cashbookweb.notes_of` | ₹{{value}} notes |
| `cashbookweb.coins` | Coins and other cash (₹) |
| `followupsweb.intro_short` | We open WhatsApp with the message ready. You press send. |
| `followupsweb.how` | How reminders work |
| `followupsweb.owing` | Everyone who owes |
| `followupsweb.open_row` | Remind {{name}} |
| `followupsweb.empty_owing` | Nobody here owes money. |
| `followupsweb.empty_help` | Only bills with a due date count as due. Choose "Everyone who owes" to see all udhaar. |
| `followupsweb.note_whatsapp` | Sent on WhatsApp |
| `followupsweb.note_sms` | Sent by SMS |
| `followupsweb.note_copied` | Copied and sent it myself |
| `followupsweb.note_called` | Spoke on the phone |
| `followupsweb.note_visit` | Spoke at the shop |
| `followupsweb.note_promise` | Promised to pay soon |
| `followupsweb.note_more_time` | Customer asked for more time |
| `followupsweb.note_resume` | Start reminders again |
| `followupsweb.note_owner` | Owner decision |
| `activityweb.opening` | Opening balances |
| `creditweb.whatsapp` | Send on WhatsApp |
| `creditweb.whatsapp_message` | {{shop}}: account statement for {{name}}, {{from}} to {{to}}. Balance: {{amount}}. |
| `creditweb.whatsapp_hint` | WhatsApp gets a short summary. Download the PDF to attach the full statement. |

Note: the `followupsweb.note_*` texts are saved as the follow-up note when tapped, in the language shown at the time.

## Reworded keys (please apply and translate)

These keys are shared with mobile catalogs; the new English is plain shop wording.

**Cashbook**

| Key | New English |
|---|---|
| `cashbook.cashbook` | Day's cash |
| `cashbook.cash_tools` | Cash in / out |
| `cashbook.count` | Close the day |
| `cashbook.close` | Close the day |
| `cashbook.close_saved` | Day closed, cash counted |
| `cashbook.counted_input` | Cash in the till now (₹) |
| `cashbook.count_help` | Count the cash in the till and enter the total. A difference is only noted. It does not add an expense or income. |
| `cashbook.count_review` | I counted all the cash and checked pending bills. |
| `cashbook.close_reason` | Note (why is it short or extra?) |
| `cashbook.status.needs_review` | Changed after closing. Check again. |
| `cashbook.coverage_help` | Counts money recorded from {{date}}. Earlier entries are not included. This is the cash expected in the till, not your bank balance. |
| `cashbook.reference_required` | Note for the starting cash (needed) |
| `cashbook.setup_review` | I checked the starting cash and date. |
| `cashbook.export` | Download the day's CSV |
| `cashbook.scheduled` | Future expense, not paid yet |
| `cashbook.event.close` | Day closed, cash counted |
| `cashbook.event.cash` | Cash in or out recorded |
| `cashbook.event.reverse` | Expense payment undone |
| `cashbook.event.reopen` | Day reopened |
| `cashbook.event.export` | Cashbook file downloaded |

**Follow-ups**

| Key | New English |
|---|---|
| `followups.intro` | Send reminders for bills that are due and keep a note of who you contacted. A bill shows as paid only when a payment is recorded and matched to it. |
| `followups.task_help` | Reminders due today show here. We never send WhatsApp or SMS on our own. |
| `followups.empty` | No customers match this filter. |
| `followups.more` | Look through more customers |
| `followups.note` | Short note (needed) |
| `followups.prepare` | Make reminder |
| `followups.preview_help` | Check the name, phone, bills and amount. Nothing is sent until you press send in WhatsApp or SMS. |
| `followups.share_help` | We open WhatsApp with the message. You check it and press send. No WhatsApp? Use SMS or copy the message. |
| `followups.sent_help` | Tap this after you have sent the message yourself. |
| `followups.history_help` | Shows what was prepared and noted here. It does not show whether the customer read it or paid. |
| `followups.payment_notice` | The UPI link opens your shop's payment page. Opening it does not mean the customer paid. |
| `followups.no_items` | No bills with a due date. Set a due date to send a reminder for it. |
| `followups.select_help` | Choose the bills to mention. Payments not matched to a bill need checking first. |
| `followups.event.launch_requested` | Reminder opened to send |
| `followups.event.composer_opened` | WhatsApp or SMS opened |
| `followups.event.unavailable` | Could not open WhatsApp or SMS |
| `followups.event.cancelled` | Reminder not sent |
| `followups.event.merchant_sent` | Marked as sent |
| `followups.event.contacted` | Contact noted |
| `followups.event.snoozed` | Reminders paused |
| `followups.event.unsnoozed` | Reminders restarted |
| `followups.event.settings` | Reminder settings changed |

**Activity**

| Key | New English |
|---|---|
| `activityweb.record` | Shop update |

**Statements and udhaar (`credit.*`)**

| Key | New English |
|---|---|
| `credit.title` | Statement & udhaar terms |
| `credit.intro` | Send a dated statement, see unpaid bills and set udhaar terms. A payment marks a bill paid only after it is matched to that bill. |
| `credit.create_statement` | Make statement |
| `credit.snapshot` | Account statement |
| `credit.export_help` | The statement keeps the customer, dates and entries as they were when you made it. |
| `credit.event.statement` | Statement made |
| `credit.exposure` | Total udhaar |
| `credit.resulting` | Total udhaar after this bill |
| `credit.unassigned` | Payments not matched to a bill |
| `credit.unassigned_help` | These payments already lower the balance but are not matched to a bill yet. Match them before you treat a bill as paid. |
| `credit.review_collections` | See payments and bills |
| `credit.obligations` | Bills and old udhaar |
| `credit.no_obligations` | No udhaar bills recorded. |
| `credit.kind.opening` | Old udhaar (from before the app) |
| `credit.ledger.opening_balance` | Old udhaar entry |
| `credit.paid` | Paid or reduced |
| `credit.debits` | New udhaar |
| `credit.credits` | Payments and returns |
| `credit.unreconciled` | Old balance difference |
| `credit.receipt` | Payment not matched yet |
| `credit.allocate` | Match a payment to old udhaar |
| `credit.allocation_amount` | Amount to match (₹) |
| `credit.allocation_help` | This matches money you already recorded to old udhaar. It does not collect money again or change the balance. |
| `credit.allocate_save` | Match payment |
| `credit.allocations` | Matched payments |
| `credit.reverse_allocation` | Undo match |
| `credit.reversal_help` | This removes only the match. The payment and the balance stay the same. |
| `credit.event.allocate_opening` | Payment matched to old udhaar |
| `credit.event.reverse_allocation` | Match undone |

## Test by hand

1. **Repayment**: open a customer who owes ₹X. The amount shows ₹X, the line says "This clears the full balance.", Cash is selected, Card is not offered. Change the amount to less and to more than ₹X and read the balance-after / advance line. Save once: "₹… received" shows, the panel stays open, the amount box is empty, and the balance above updates. Check only one payment is saved.
2. **Saved (pending) repayment**: with a payment stuck as pending (go offline mid-save), reload. The form restores the saved amount and method, and Retry finishes it. A saved card payment from before this change shows a Card chip.
3. **Count & close (owner)** after 6 pm IST: "Close the day" is first and primary. Before 6 pm "Add expense" is primary. Open the note counter, enter counts, check the total and the short / extra / matches chip, then type over the total by hand. Manager: no close button, as before.
4. **Cashbook dates**: Previous / Today / Next day buttons, Next disabled on today; the dates in rows read "Thu, 12 Nov"; Hindi and Tamil date text.
5. **Expense form**: chips pick the category; reload and open the form again: the last category is selected; a custom category that was deleted falls back to the list.
6. **Follow-ups**: opens on "Everyone who owes" and lists owing customers even when the first pages had none; switch to "Due today or earlier" with no due dates: the help text and "Everyone who owes" button. Watch the network panel: the list loads at most 10 pages on its own. Mark as sent with a quick note.
7. **Statement**: make a statement, "Send on WhatsApp" opens wa.me with the summary (customer number when valid); PDF and CSV still download.
8. **Activity**: an opening-balance entry shows "Opening balances" as its label.
