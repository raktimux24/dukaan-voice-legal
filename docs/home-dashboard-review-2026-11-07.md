# Home dashboard parity and design review

## Scope and evidence

Compared the installed iOS Home screen, its current source, the signed-in production web Home screen, and the web implementation. The simulator and production browser were in different shops, so this is a functionality comparison, not a reconciliation of their totals. The retained simulator session was preserved; no app data was reset.

The changes are in the authenticated Next.js dashboard and its responsive phone layout. The native Home implementation is unchanged. The local design preview imports the actual updated components with a synthetic API/context, outside the production source tree. It does not bypass production authentication or mutate live shop records.

## Parity findings and implementation

| Home capability | Previous web behavior | Updated web behavior |
| --- | --- | --- |
| Today's sales and payment methods | Available, but errors could resemble zero activity | Preserved with retry states; net sales distinguished from payment-method totals, which include collections and refunds |
| Brief | Available; full body crowded the overview | Short day summary when supplied; full brief remains linked |
| Stock attention filters | Available | Compact linked counts for low, out, expiring and unpriced stock |
| Shop desk | Destinations spread across sidebar and large banners | Grouped product, buy-list, purchase-order, supplier, cashbook, customer, report and sales shortcuts, with role gates and available counts |
| Sell / scan to bill / add product | Scan required navigating into Sell | Direct desk actions; scan-to-bill opens the existing counter camera |
| Inventory barcode lookup | Missing on Home | Home camera lookup opens the matched product; unknown codes return to search |
| Voice | Available | Kept next to search, using the existing voice flow and its access conditions |
| Product search | Name and primary barcode only | Ranked name, short-code and barcode-alias matches; inactive products excluded |
| Recent bill photos | Bill number occupied the image slot | Product thumbnail slot matching Stock watch; bill number retained in metadata. Visible rows resolve the billed product from cached/lazy-loaded bill details, with initials for missing, unavailable or ambiguous photos |
| Helper bill search | Hidden by report permission | Displays the server-scoped bill results; customer/supplier results remain restricted |
| Unstocked requests | Missing explicit Home action | “Note it” after a completed, successful no-match search; deduplication hint and retry on failed save |
| Suggestions | Generic action, silent errors; no dismissal or price review | Named actions, correct navigation, dismissal, explicit price confirmation, and reviewable message drafts |
| Trial reminder | Missing | Owner-only reminder for an automatic trial's last three days and recent expiry, with dismissal |
| Refresh | Focus-driven query refresh only | Manual refresh and 30-second foreground polling for changing headline data |
| Languages | Older search strings could fall back to English | New dashboard copy and search labels bundled for English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam |

## Visual direction

A restrained shop desk: charcoal surfaces, saffron actions, DM Sans/Inter, aligned figures, fine separators and compact grouped destinations. A sales overview and daily brief establish priority; actionable stock counts and desk shortcuts follow. Recent bills and stock watch retain useful detail. Desktop's duplicate New sale control is removed on Home. The responsive layout stacks without hiding the desk.

Research reference: [Shopify POS smart grid](https://help.shopify.com/en/manual/sell-in-person/getting-started/smart-grid), for grouping frequent retail actions. This is an independent Samaan Bol design, not a copy of Shopify's UI.

## Verification

- `npm run build:verified` passed, including release regression suites, translations, type checking and the production build.
- 16 Home tests cover search matching, trial timing, navigation, Helper restrictions, failed reads, demand save/retry, price confirmation, dismissal, draft-only offers, barcode routing, restricted refresh, negative/refund-only payment totals, bill-photo identity, lazy loading and offline/error fallbacks.
- Browser layout checks: all 10 languages at 320, 390, 768 and 1440 px; no document overflow or clipped dashboard controls after correcting a long Tamil suggestion label.
- Browser interaction checks use the synthetic preview: price confirmation/cancel, Helper bill search and request-error states.
- Follow-up browser checks confirmed typed search text uses `#eaeae6` with a saffron caret, and five consistent 48 px recent-bill photo slots. Desktop, 390 px English and 320 px Tamil layouts had no overflow or clipped ledger content. The synthetic preview has no uploaded product photos and therefore demonstrates the initial fallback. `npm run test:home` and `npx tsc --noEmit` passed after this follow-up.
- Live camera decoding, real reminder delivery and live write operations were not exercised. Barcode routing and mutation boundaries were verified with deterministic fixtures. Native-language editorial review is still separate from translation coverage and layout checks.

## Release state

Local implementation on `codex/web-home-parity-design-20261107`. No production deployment was requested or performed for this dashboard change.
