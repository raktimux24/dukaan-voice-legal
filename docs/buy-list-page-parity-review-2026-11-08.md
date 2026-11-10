# Buy list review — 8 November 2026

Compared the native Buy list, Add buy-list item and BuyListIntel components with the web page and server buy-list/nudge routes. This is source parity review, not fresh native simulator acceptance.

## Delivered

- Restocking ledger with product thumbnails, category, status, quantity, expandable reasons/notes/ordered quantity and explicit receiving/order actions. Pending is the initial view; All, Stocked and AI suggested remain available with counts and search.
- Stocked includes legacy purchased records. Completed records do not offer another receipt; linked purchase orders remain accessible.
- Focused add dialog supports existing tracked products and new items, product search, category/product identity, base unit and fractional quantities. Strict positive quantities, synchronous submission lock, offline blocking and session assertions protect writes.
- Existing-product receiving preserves buy-list ID and quantity. New-product handoff now preserves unit and valid category as well as name/quantity.
- Suggestions reuse the existing nudge action/review component with buy_list surface tracking. Reorder, unstocked and supplier-price groups use server results. Customer demand supports manual notes, add-product handoff and confirmed removal. Server Premium filtering and owner/manager restrictions remain authoritative.
- Removal requires confirmation. Loading, errors, retries, empty filters and no picker matches have distinct UI.
- All ten web app languages updated. Corrected inherited wrong-script Bengali quantity/price text and Devanagari strings in Hinglish. Shared buttons now forward accessible action labels.

## Validation

- Five automated checks: completed/AI filtering and search, completed/order routing, receiving context, encoded new-product context, strict quantities.
- Existing release check suite and production build passed. Final build passed after finishing changes.
- Translation coverage: 1,579 labels across English and nine translated languages, with script/interpolation checks.
- Local browser fixtures: 30 list layouts (ten languages × 320/768/1135px), ten narrow add dialogs and ten narrow Suggestions layouts. No horizontal overflow.
- Browser interaction: linked product added at 2.5 kg, customer request added, completed records and search checked, removal dialog opened/cancelled, Helper denied access. These used synthetic in-memory data, not live inventory.

Evidence: dashboard-review/buy-list within the task visualization directory; desktop.png and layout-checks.json.

## Scope and limits

No production changes or live purchasing mutations. Dedicated purchase-order and receiving workflows retain their existing screens. Product-photo transport was reused, with no repeated physical-device photo acceptance. Nudge fixture text remains synthetic English; the production server supplies its localized content. No human native-language editorial review was performed. Stock quantities are displayed in base units; existing receiving supports pack conversion.
