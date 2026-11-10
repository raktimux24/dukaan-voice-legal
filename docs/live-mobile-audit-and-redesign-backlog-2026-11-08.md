# Live mobile web audit and remaining redesign inventory

Date: 8 November 2026 (Asia/Kolkata)

## Outcome

The redesigned core pages generally fit the tested mobile widths, but this is **not an unconditional mobile acceptance pass**. Two layout follow-ups remain: a product price splits inside the monetary amount at 320px, and the GST document table is cumbersome to read on a narrow screen. Sampled navigation and non-destructive interactions worked. No application code or production deployment was changed during this audit.

## Production and scope

- Live application: https://samaanbol.space/shop
- Release under review: main merge `53b161268bb9c50cc31f1ac785845fac7c31d598`, PR https://github.com/raktimux24/dukaan-voice-legal/pull/178.
- Production Netlify deploy previously verified ready: `6af05f8817abd9d5286f342a`.
- Browser: Chromium responsive viewport, 390 × 844 and 320 × 844. This is **not physical iOS/Android Safari/Chrome acceptance**.
- Signed-in shop: Mina Sales; role: Owner; temporary Premium access. Original Small text preference and normal contrast retained.
- Application languages: English, Hindi, Tamil, Malayalam, Telugu, Bengali, Marathi, Kannada, Gujarati and Hinglish. These are the ten app choices; the marketing website has a different language set.
- 18 route types × 10 languages × 2 widths = **360 structural layout cases**, excluding repeated checks. Main routes were traversed with translated headings and page-width checks; representative pages also received visual inspection and interaction checks. This count does not mean every control, record state or dialog was exercised in every language.
- Existing product/customer names and historic activity content are stored data and were not treated as untranslated interface labels.

### Redesigned routes covered

| Page | Route |
| --- | --- |
| Home | `/shop` |
| Sell | `/shop/sell` |
| Checkout | `/shop/sell/checkout` |
| Sales | `/shop/sales` |
| Products | `/shop/products` |
| Buy list | `/shop/buy-list` |
| Suppliers | `/shop/suppliers` |
| Customers | `/shop/customers` |
| Staff | `/shop/settings/staff` |
| Reports | `/shop/reports` |
| Activity | `/shop/activity` |
| Settings | `/shop/settings` |
| Billing | `/shop/settings/subscription` |
| Bill detail | `/shop/sales/[id]` |
| Product detail | `/shop/products/[id]` |
| Customer detail | `/shop/customers/[id]` |
| Supplier identity detail | `/shop/suppliers/records/[id]` |
| Supplier receipt-history detail | `/shop/suppliers/[name]` |

No page-level horizontal overflow was found in the tested default/main states. That is narrower than saying there were no visual defects: the price defect below occurs without overflow, and the GST table scrolls within its own container.

## Findings

### 1. Product summary breaks monetary amounts at 320px — fix first

**Observed:** a selling price of ₹24,900.00 rendered as “₹24,90” followed by “0.00”. The photo and two metric columns squeeze the price into a narrow area. This undermines quick price recognition even though the overall page does not overflow.

**Owning source:** `app/components/shop/screens/product-detail.tsx` (`product-summary`) and `app/shop/shop.css` (`product-summary-metrics`; mobile product-summary rules). The metric uses `overflow-wrap:anywhere`, while the mobile summary retains an 80px photo column alongside two metric columns.

**Recommended correction:** put metrics across the full width below the photo/status on narrow screens, or give the price its own row; keep the amount together. Recheck long names, five/six-digit prices and all app languages. Do not rely only on reducing font size.

Evidence saved locally: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/live-mobile-audit-2026-11-08/product-price-320.jpg`.

### 2. GST verified-document table needs a mobile reading view

**Observed:** the bill's main item summary stacks appropriately, but its expanded verified GST document retains a wide seven-column table. At 320px and 390px, the user must pan horizontally to relate item, HSN, taxable value, GST and total. The container contains the overflow; this is a reading/UX issue rather than a broken page.

**Recommended correction:** provide a stacked mobile document summary or an explicit document viewer. Preserve the full legal/print table and all tax fields. The redesigned sale-detail shell does not by itself make this embedded document mobile-friendly.

## Interaction checks actually completed

- Sell: opened mobile product browsing, added one item to a local draft, entered checkout; did not issue a sale.
- Checkout: reviewed GST breakdown and cash change calculation. ₹500 tender against ₹234.82 produced ₹265.18 change. Did not confirm payment.
- Sales: changed period to Last 7 days and loaded populated bills; opened bill detail.
- Products: opened an existing product and its stock-adjustment panel, then closed without applying changes.
- Customers: switched Ledger/Details tabs; opened and cancelled the edit dialog without saving.
- Suppliers: opened Compare prices, searched and received the appropriate empty comparison result for this shop; inspected both detail variants.
- Staff: opened an existing member's detail view and read role information.
- Reports: changed to Stock and 7-day period; viewed loaded stock/expiry data and chart.
- Activity: changed to the Stock filter and loaded entries.
- Buy list: opened the Add Item sheet at 320px; inventory choices, quantity/unit controls and submission button fit; closed without adding anything.
- Settings: switched through all ten app languages and restored English.
- Billing: inspected loaded temporary-Premium presentation; no subscription or billing mutation was attempted.
- The audit draft item was removed afterward; Sell showed Bill 0, “Nothing on the bill yet”, and ₹0.00. Browser viewport override was reset.

Rapid audit navigation hit one API rate-limit error; Try Again recovered. There was also a browser network-change interruption recovered in a fresh tab. These were recorded as review interruptions, not established persistent application defects.

### Translation validation

`npm run test:translations` passed: **1966 web labels across 9 translated languages, mobile catalogs and interpolation**. English is the baseline. Live checks confirmed language switching and structural rendering. This is not a native-speaker editorial review of every translated sentence; English domain terms and stored record text may remain.

### Remaining acceptance limits

- Only the current Owner/temporary-Premium shop was replayed live. Manager, Helper, Free, paid, expired and denied-permission states were not all re-tested in production.
- Large/extra-large text, high contrast, physical device keyboard and browser-specific behavior remain unverified in this pass.
- No live camera/USB scanner/microphone permission flow or STT/TTS round trip was performed.
- No real sale, payment, refund, stock adjustment, invite, import, export, subscription purchase or cancellation was submitted. Existing records were not altered.
- Not every populated/empty/error state, nested modal or long record was tested in every language.

## Remaining redesign inventory

The source inventory contains **59 user-facing shop routes** after excluding the empty SSO callback and voice interception/catch-all plumbing. Eighteen route types map to the redesigned screens above; **41 routes remain outside the dedicated redesign pass**.

“Remaining” means not yet brought through this new workspace design pass. It does **not** mean the screen has never been designed or that its functionality is broken. Several already have specialist layouts worth retaining and aligning. Shared header/CSS changes alone do not count as a dedicated screen redesign. Product add/edit received preference-prefill changes, not a layout redesign.

### Suggested order

| Order | Area | Routes | Approach |
| --- | --- | ---: | --- |
| 1 | Product creation/editing and bulk tools | 4 | Complete the everyday product journey |
| 2 | Purchase orders and supplier invoices | 5 | Connect buy list, ordering and receiving coherently |
| 3 | Shop/payment/document settings | 3 | Complete the Settings drill-downs |
| 4 | Alerts, daily brief and voice | 3 | Align frequent entry points from Home/Sell |
| 5 | Cashbook, refunds and customer credit/follow-ups | 4 | Align money and collection workflows |
| 6 | Imports and opening balances | 4 | Preserve useful step-based review flows |
| 7 | GST workspace | 15 | Design as a connected specialist workspace |
| 8 | Estimates, online store and onboarding | 3 | Align their specialist workflows |
| | **Total** | **41** | |

### Complete route list

| Area | Remaining route | Owning screen/module |
| --- | --- | --- |
| Products | `/shop/products/new` | `product-form` |
| Products | `/shop/products/[id]/edit` | `product-form` |
| Products | `/shop/products/bulk` | `product-bulk` |
| Products | `/shop/products/barcodes` | `product-barcodes` |
| Purchasing | `/shop/purchase-orders` | `purchase-orders` |
| Purchasing | `/shop/purchase-orders/new` | `purchase-orders` compose variant |
| Purchasing | `/shop/purchases` | `purchases` list variant (`list=1`; otherwise redirects to new) |
| Purchasing | `/shop/purchases/new` | `purchase-new` |
| Purchasing | `/shop/purchases/[id]` | `purchase-detail` |
| Settings | `/shop/settings/shop` | `shop-settings` |
| Settings | `/shop/settings/payments` | `payments` |
| Settings | `/shop/settings/payments/branding` | `document-branding` |
| Daily tools | `/shop/alerts` | `alerts` |
| Daily tools | `/shop/brief` | `brief` |
| Daily tools | `/shop/voice` | `voice` |
| Money | `/shop/cashbook` | `cashbook` |
| Money | `/shop/sales/refunds` | `refunds` |
| Customer credit | `/shop/customers/[id]/statement` | `customer-credit` |
| Customer credit | `/shop/customers/followups` | `collection-followups` |
| Setup/import | `/shop/products/import` | `inventory-import` |
| Setup/import | `/shop/customers/import` | `party-import`, customer variant |
| Setup/import | `/shop/suppliers/import` | `party-import`, supplier variant |
| Setup/import | `/shop/settings/opening-balances` | `opening-balances` |
| GST | `/shop/settings/gst` | `gst-records` |
| GST | `/shop/settings/gst/checks` | `gst-records` |
| GST | `/shop/settings/gst/devices` | `gst-records` |
| GST | `/shop/settings/gst/numbers` | `gst-records` |
| GST | `/shop/settings/gst/recovery` | `gst-records` |
| GST | `/shop/settings/gst/recovery/[requestId]` | `local-fiscal-receipt` |
| GST | `/shop/settings/gst/exports` | `gst-reports` |
| GST | `/shop/settings/gst/periods` | `gst-reports` |
| GST | `/shop/settings/gst/turnover` | `gst-reports` |
| GST | `/shop/settings/gst/providers` | `gst-tools` |
| GST | `/shop/settings/gst/rounding` | `gst-tools` |
| GST | `/shop/products/gst` | `gst-products` |
| GST | `/shop/products/[id]/gst` | `gst-products` history variant |
| GST | `/shop/products/[id]/gst/rsp` | `gst-rsp` |
| GST | `/shop/adjustments/[id]` | `gst-adjustment` |
| Other journeys | `/shop/estimates` | `estimates` |
| Other journeys | `/shop/online-store` | `online-store` |
| Other journeys | `/shop/onboarding` | `onboarding` |

### Existing specialist layouts to align rather than discard

- Cashbook, customer credit, follow-ups, online store and purchase orders already use the shared retail workspace/domain views.
- Inventory and party imports have dedicated upload, mapping and review stages.
- Estimates and opening balances have their own workspace structures.
- GST views need a coordinated information hierarchy and mobile document strategy, not fifteen unrelated page treatments.

The backlog is source-audited. It is not a claim that all 41 older routes received the same live ten-language mobile test as the redesigned core.

### Adjacent public/utility surfaces outside the 59 shop routes

Review these separately for consistency: `/store/[storeId]`, `/store/[storeId]/p/[itemId]`, `/store/[storeId]/orders/[orderId]`, `/subscription/return` and `/delete-account`.

The marketing homepage/pricing and authentication screens were previously redesigned and are outside this shop-workspace inventory. Account/Billing surfaces share updated components and should not be labelled untouched solely because they live outside `/shop`.
