# Sell page: mobile parity and web counter design

## Evidence and scope

Compared the installed iOS Sell screen and authenticated production web Sell in Mina Sales with their current source: native `app/(tabs)/sell.tsx`, `app/(modals)/checkout.tsx`, web `screens/sell.tsx`, `screens/checkout.tsx`, both cart implementations and server sales authorization. The product catalogue was observed on both platforms. Checkout/payment cases below are source-backed unless explicitly marked as exercised with synthetic fixtures. No live sale or product edit is needed for the review.

## Feature map and implemented changes

| Capability | Finding / action |
| --- | --- |
| Search name, short code, barcode and aliases | Present on both; align web ranking and prefix matching, preserve category filters, allow loading beyond the first 60 results. |
| Quick add | Mobile adds countable items immediately. Web opens a picker every time. Use one-click add for countable items, quantity review for weight/volume and packs. |
| Quantity and unit controls | Both have fractional quantities and presets; add direct quantity entry to the web picker, retain unit conversion and stock caps. |
| Product photos | Present in both catalogue and cart; retain private photo loading and fallbacks. |
| Unpriced products | Mobile has a count/link; add web notice. Catalogue price creation remains Owner/Manager-only. Reject blank/invalid price drafts. |
| Bill-only prices | Native supports price editing for sellers, while web requires catalogue-edit permission. Server accepts seller-entered bill prices; align web bill editing with `canSell`. This does not grant catalogue price editing. |
| Demand requests | Mobile offers Note it and repeat-request hints. Web silently logs unmatched searches. Replace with explicit successful-save feedback and retry on failure; category filtering and failed catalogue reads must not create false demand. |
| GST preview | Mobile computes tax-aware totals on Sell. Web previously called `computeTotals` without the shop GST context. Show tax-aware estimates when valid; otherwise require tax review. Checkout retains authoritative refresh, rounding, MRP, package and issuance checks. |
| Stock shortfalls | Native displays a line warning and confirms before checkout. Add visible web warnings and the confirmation using the current catalogue. |
| Cart review on phones | The bill is now the main workspace on every screen size. Product selection is on demand; bill rows remain editable in one continuous page, with checkout kept within reach. |
| Customer, notes, bill discounts | Already available in the web bill/checkout flow. Keep customer attachment and a clear checkout handoff for notes and discounts. |
| Estimates | Existing browse/save-cart handoffs retained. |
| Voice | Existing web voice route retained, with its Premium/connectivity checks. No claim that native microphone/camera hardware behavior was retested. |
| Cash, UPI QR/reference, configured card, Premium credit and split | Implemented in both checkout screens; preserve existing payment confirmation, permissions and customer-credit checks. |
| Offline draft and uncertain outcome recovery | Both have recovery flows. Preserve web counter status/recovery links; lock Sell edits while a submitted bill is unresolved. |

## Revised layout after user review

The first split layout squeezed bill rows when the customer form expanded and required scrolling two separate regions. That iteration has been replaced by a single bill workspace.

- Search and camera/USB/voice entry sit above the bill. Search results appear only while searching. Keyboard addition returns focus to search.
- Browse products opens a dedicated, searchable picker with category filters, stock/price information and an updating bill count/total. Countable products can be added repeatedly; weighted products open quantity review.
- The full-width bill has clear Item, Quantity, Unit price and Amount columns. Phones retain visible field labels. Bill rows use normal page scrolling, with no fixed-height bill scroller.
- Customer lookup/new-customer entry opens in a dialog on Sell. Selecting or closing it preserves the bill layout. Checkout retains the existing inline customer form.
- A sticky total/checkout footer remains within reach. Draft/recovery help sits below the working area; unresolved requests and save errors remain surfaced.
- The empty bill explains search, scan and browse, with a direct browse action. The existing charcoal, DM Sans/Inter and saffron styling is retained.

The initial [Shopify split-screen reference](https://changelog.shopify.com/posts/shopify-pos-split-screen-home-layout-for-tablet) informed the first iteration; the user's review showed its drawbacks in this web shell. The revised layout follows the familiar bill-entry sequence instead. [Square's cart flow](https://squareup.com/help/us/en/article/8238-build-your-customer-s-cart-in-the-square-retail-pos-app) remains a reference for direct product/scan addition rather than a visual template.

## Verification

The actual Sell component and shared helpers are updated in the web worktree. New controls and accessible labels are localized across English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam.

- `npm run build:verified` passed the release gate and production build. The focused Sell suite has 10 passing tests; translation coverage includes all ten app languages.
- The Sell suite exercises the real component/cart with synthetic API fixtures: quick add, weighted/custom quantities, barcode lookup outside the loaded catalogue, reserved-stock caps, seller bill-price permissions, demand retries, read failures, GST estimates and stale tax evidence, shortfall confirmation and immutable unresolved requests. Existing tests were adapted to enter the dedicated product picker.
- Browser interaction verified countable addition from the picker, short-code + Enter entry and search focus, direct quantity/unit-price edits, grams-to-kilograms conversion, customer lookup/selection/removal, and the Add items handoff. The empty-bill state was also visually reviewed.
- All ten languages were checked at actual viewport sizes 320×740, 390×844, 768×1024 and 1135×853. This covered 40 bill views and 20 product/customer dialogs, without horizontal overflow, clipped action labels or overlapping quantity/price fields. This is layout verification, not native-language editorial certification.
- Current evidence is saved under `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/sell/revision-2/`, including the desktop bill, customer/product dialogs, empty bill, phone view and `layout-checks.json`. The parent directory retains the previous iteration for comparison.

The local preview at `http://127.0.0.1:8010/?screen=sell&lang=en` renders the actual Sell component against sample data. Product thumbnails use the real component with initials when the fixture has no photo. No production sale, payment or catalogue mutation was submitted. Existing production payment, microphone/camera hardware, printer and offline issuance flows were reviewed in source rather than replayed end-to-end on devices. Production has not been changed.
