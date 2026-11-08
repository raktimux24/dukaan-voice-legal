# Live Purchase Orders mobile review — 9 November 2026

Production release: PR182/main `20b4dac`, published by Netlify. Review used the signed-in Owner account through the live web UI, with 320 × 844 and 390 × 844 responsive viewport overrides. This is browser viewport testing, not physical-device certification.

## Passed

- 80 live layout checks: English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam × two widths × populated list, completed-order details, completed-order actions and receipt history.
- No horizontal document overflow, clipped form controls or unresolved PO translation keys in those checks. Representative screenshots were visually reviewed.
- Search with no matching order, clear filters, issued-status filter and restoration of the full list behaved correctly.
- Ramesh Stores' existing completed order showed ordered 5, received 5, remaining 0 and its existing receipt/history. It correctly offered no Receive delivery action.
- Unsaved draft: existing supplier selection, product selection, zero-quantity blocking, corrected quantity, and review total worked in English. Draft was not saved.
- No browser console warnings/errors were returned during the multilingual review.
- Mina Sales' empty state displayed correctly.

## Authorized delivery-form follow-up

The user authorized creation and closure of one clearly labelled QA order in Ramesh Stores. PO-000002 (`e92fc97f-324c-46b4-8f3c-5fe4ffb32ee4`) contained one piece of Bingo Mad Angle Tomato Madness 58g at an estimated ₹20. Its notes explicitly said not to fulfil or share it. The order was saved, issued internally, and never shared with the supplier.

- 40 additional live delivery-form layout checks passed across all ten languages at 320 and 390 pixels: rejection validation and valid-but-unsubmitted review states. No horizontal overflow, clipped form controls or unresolved translation keys were detected.
- Each language passed seven checks: zero quantity blocked, excessive quantity blocked, edits reset review confirmation, missing accepted-item cost blocked, valid accepted quantity enabled confirmation, missing rejection reason blocked, and valid rejection enabled confirmation.
- Malayalam delivery inputs and sticky footer were visually reviewed; an evidence screenshot was saved.
- A past expiry date was accepted by the form in English. This is recorded behavior, not a claim that past-expiry blocking is required or implemented.
- The QA order was then closed with a clear QA reason. Live details showed ordered 1, received 0, remaining 0, remainder cancelled 1. History showed zero delivery receipts and the closure event.
- No receipt was submitted, no goods were added to stock, and no invoice or supplier communication was created. The QA order remains in order history as disclosed.
- Browser console warnings/errors were empty.

Combined review: 120 layout checks plus 70 multilingual delivery validation checks. This verifies the live delivery form up to confirmation, not a production receipt submission or its inventory effects. Earlier isolated component fixtures cover synthetic receipt submission separately.

## Restoration and artifacts

App language returned to English; voice language was not changed. Text size was medium and was not changed. Selected shop returned to Mina Sales, and the viewport override was reset. The original Sell tab was preserved.

Evidence directory: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/live-purchase-orders-2026-11-09/`.

- `completed-order-layouts.json`: 80 recorded checks and rendered copy.
- `review-summary.json`: review limits and write-free boundary.
- `malayalam-history-mobile.jpg`, `english-receipt-mobile.jpg`: representative live screenshots.

Follow-up artifacts:
- `delivery-validation.json`: all multilingual validation results and 40 layout checks.
- `qa-order.json`: final closed-order identifiers and zero-received quantities.
- `qa-order-closed-mobile.jpg`: closed order and zero-receipt history.
- `malayalam-delivery-mobile.jpg`: live localized mobile delivery inputs.
