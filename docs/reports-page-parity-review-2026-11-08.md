# Reports page parity and design review — 8 November 2026

## Scope and evidence

Compared mobile `src/screens/reports-screen.tsx`, `src/screens/reports-entry.tsx`, `src/components/pos/sales-report.tsx`, `src/components/pos/stock-report.tsx`, `src/types/reports.ts`, report/history/analytics endpoints and sales aggregation source against the web Reports screen and detail components. Native parity is source-based; no simulator or physical-device report replay was performed. Browser checks used the local preview's explicitly synthetic data. No live records were modified, and these changes are not committed or deployed.

## Parity and changes

| Area | Result |
| --- | --- |
| Roles | Owner and Manager report access retained; Helpers and offline sessions cannot view reports. Export still requires Premium and authorized API access. |
| Periods | Sales: today, 7 days, 30 days, this month, last month. Stock: 7/30/90 days. Independent selections retained when switching tabs. Free requests explicitly use today/7 days; longer selected ranges explain the seven-day fallback. Unlike mobile's last-month top-product fallback, web keeps last month for report, ranking and CSV because the existing server supports it. |
| Sales overview | Revenue, bill count, average bill before returns, items sold, comparison, hourly/daily chart, payment mix and top sellers. Net daily-series note corrected from the previous misleading before-returns label after inspecting aggregation source. |
| Sales detail | Categories, weekday/hourly patterns, basket/discount statistics, returns/void counts and values, top returned items, input methods, cash flow and Cashbook link. |
| Premium detail | Profit/cost and purchase-cost corrections, run-rate comparison, customer insights and links, udhaar ageing, product margin, staff, daily payments and bought-together retained in accessible expandable sections. |
| Stock | Current stock separated from movement period; added incoming/sold/adjusted/net totals, potential margin, stock-value history, batch counts and expiry-product links. Current stock is never presented as historical stock for the chosen period. |
| Premium stock | Per-product/category movement, shrinkage, slow stock, fast movers, ageing, turnover, supplier purchases and CSV preserved. Product movement show-more retained. |
| Cost visibility | Requires explicit server `showCost`, role permission and visible-cost setting. Hidden-cost mode suppresses cost/profit/history displays. Monetary fields are not guessed from missing values. |
| Ask | Existing text/voice APIs retained; added all eleven mobile sample questions and Ask another. Errors remain near the question form. Existing web audio playback remains explicit; native auto-play was not replicated. |
| Session handling | Query keys include actor/shop/role/entitlement/cost context; workspace remount clears answers when context changes. Async replies ignored after unmount. CSV performs session checks and prevents concurrent downloads. |
| Charts | Signed values share a zero line; zero values are not drawn as fabricated minimum-height bars. Every chart offers a keyboard-accessible value table; wide tables scroll within their section. |
| Languages | 32 new report UI keys in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Corrected 13 report vocabulary keys in each language, prioritized exact report keys over ambiguous aliases, and corrected the Malayalam sales-return label. |

## Verification

- `npm run test:reports`: 7 passing tests for Free/Premium ranges, exact last-month and 90-day preservation, fractional/signed movement totals, negative/zero chart scaling, cost visibility and tab parsing.
- `npm run build:verified`: release checks, translation checks, TypeScript and production build passed.
- Translation suite: 1,784 web labels across nine translated languages plus English, including interpolation checks.
- Main layout: Sales and Stock × ten languages × 320/768/1135 widths = 60 checks, no document overflow or raw report translation keys.
- Expanded reports and chart tables: all ten languages at 320 px checked. A projected-total grid overflow was found and fixed; affected five Sales cases rechecked successfully. Detailed tables remain internally scrollable.
- Synthetic browser checks: separate tab periods; Free longer-range fallback; Manager access; Helper/offline denial; hidden cost; empty/loading/report-error/history-error states; text question answer/error; local CSV download and export-error retry.
- Downloaded fixture CSV was read back and contained only `Report,Value` / `Synthetic preview,28450`. Live CSV content and microphone/STT/TTS were not exercised.

Evidence directory: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/reports/` (`sales-overview.png`, `stock-overview.png`, `layout-checks.json`). The JSON records the final 60 main checks and 15 final expanded checks; the first five Stock expanded passes are recorded in browser tool output. The initial overlong expanded batch timed out and its in-memory results were not counted.
