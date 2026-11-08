# Activity page parity and design review — 8 November 2026

## Evidence and scope

Compared the native `app/(tabs)/activity.tsx`, `src/api/audit-log.ts`, `src/hooks/useAuditLog.ts`, and product-photo activity formatter in the mobile repository with the web Activity screen and `server/src/routes/audit-log.ts`. Source review establishes implemented behavior; this task did not replay the native simulator or validate production records. All browser checks used synthetic data and actual web components in the local fixture preview.

## Parity and changes

| Capability | Web outcome |
| --- | --- |
| All, Sales, Stock, Voice, Today | Added missing Voice filter; same API filter contract as native. |
| Older history | Replaced first-page-only query with paginated Load more; raw-page offsets, duplicate ID suppression and empty-page stop guard. |
| Refresh | Retained explicit refresh; refreshes loaded pages through TanStack Query. |
| Date groups | IST day grouping with localized date/time labels and explicit time-zone guidance. |
| Record navigation | Bill, estimate and management-only cashbook links; additionally offers product detail links when productId exists. |
| Event descriptions | Ported mobile's structured descriptions for sales, stock, product changes, photo changes, team changes, imports, opening balances, estimates, purchase orders, cashbook, GST recovery and supplier settlement events. Unknown server descriptions remain readable. |
| Return meaning | Describes return value without claiming the full amount was refunded as cash; returns can reduce outstanding credit. |
| Product image | Uses existing session-scoped ProductImageById for events with a productId; otherwise a small action symbol. No raw media payload displayed/exported. |
| Free history | Displays the server-returned history window and plans link. Backend seven-day entitlement rules remain authoritative. |
| Roles | All shop members can read Activity; backend Helper restrictions preserved. Cashbook destination suppressed for Helper. Query cache scoped to shop, account, role and entitlement. |
| Export | Selected filter applies to all permitted pages, not just visible entries. Existing Settings caller defaults to All. Localized column headings, BOM, quoted cells and spreadsheet formula neutralization; no raw payload export. |
| Error handling | Separate initial-loading, empty, fetch-error, pagination-error, export-error and offline states. Previous entries remain visible if next-page fetch fails. |

## Design

Replaced stacked generic cards with a ruled activity journal. Date labels occupy a small desktop gutter; connected event markers, concise descriptions, actor/source attribution and explicit destination links make each entry scannable. Technical entry identifiers are behind native details disclosures. On phones the date heading becomes a full-width divider; filters wrap and actions retain usable tap targets. Existing dark palette, saffron accents and typography remain intact.

## Languages

Added 36 Activity-specific strings plus 27 explicit Activity overrides in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam (63 keys per language). Corrected inherited Stock-as-financial-shares and Manual-as-handbook translations, team and supplier settlement English fallbacks, and Activity sentences written in Devanagari in the Hinglish catalog. Existing localized domain descriptions are reused. Names and other stored shop content are not translated. These were code and layout reviews, not independent native-speaker certification.

## Verification

- `npm run build:verified` passed: release checks, translation checks, TypeScript and optimized Next build.
- Seven Activity tests cover pagination, deduplication, IST boundaries, filter validation, zero quantities, return semantics, role-aware encoded destinations, photo payload privacy and safe CSV encoding.
- Translation suite validates all 1,847 web labels in nine translated languages plus English, placeholders, script consistency, and exact Activity key precedence.
- 30 browser layout checks: ten languages at 320, 768 and 1135 px, with an entry disclosure expanded. No horizontal overflow, raw Activity keys or empty event headings.
- Synthetic browser checks: 50 → 63 entries; refresh; Voice/Sales/Stock/Today filtering; Owner and Manager access; Helper has no restricted supplier-payment events or cashbook links; Free seven-day notice; empty/loading/error/offline; next-page failure retains 50 entries and offers retry; export failure restores export action.
- Downloaded Voice CSV read back: 21 data rows, all Source=Voice, six localized columns.
- Followed actual fixture links from Activity into bill #126 and product details. Estimate and cashbook route construction checked in source/unit tests; their destination screens were not replayed in this task.

Evidence: local `dashboard-review/activity/activity-journal.png`, `mobile-hindi.png`, and `layout-checks.json` under the existing visualization workspace. Fixture is outside the production repository.

## Limits and follow-up

The backend Today filter uses the server's local midnight, whereas displayed date groups use IST. This behavior is shared with native; an explicit IST backend boundary would require a separate server change and deployment. Offset pagination is not a historical snapshot: concurrent new events can cause overlap (deduplicated here), and deletions can shift offsets. Refresh reconciles the view.

No backend/mobile release, production data write, commit, push, merge or deployment was performed for this task. All prior uncommitted screen redesigns remain preserved.
