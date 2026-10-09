# GST period and turnover follow-up — 10 October 2026

Compared native gst-periods.tsx and gst-turnover.tsx with web gst-reports.tsx after PR66. This is source evidence, not live close/reopen acceptance.

## Confirmed remaining experience gaps

- Native period page exposes sales and purchase summaries, discrepancies, period-bound preview exports, and exact retained sales/purchase reports linked from each close-history event. Web displays only open/closed state, a generic reports link, and action/date/note history. Its GstPeriod type also omits history report IDs/hashes. Port these missing functions using authoritative summary/report contracts.
- Native period requests restore their original drafts in place after reload and allow outcome checking. Web financial() durably retains them and generic device recovery can recover them, so data is not lost. However, the period page uses only an in-memory pending ref: reload loses its inline locked/retry view and may allow a fresh draft until the API blocks it against the persisted request. Read the scoped journal, block fresh requests when storage is unresolved, and offer recovery in this workflow using the exact original payload.
- Turnover similarly has durable API retention/generic recovery but no inline journal restoration. Preserve original amount/reference/sequence and block fresh drafts until outcome resolves. Native also exposes minimum code digits after review; inspect the server contract and restore the same explanation on web.
- Web defaults period/month and financial year to current values; native defaults to previous period/year. Align the intended reviewed-period entry flow and retain explicit selected periods.
- Confirmation must clear when period source fingerprint changes, as native does. Web currently clears only when note/month changes.
- Guard drafts and asynchronous updates against actor/shop changes; existing API financial lock remains authoritative and must not be replaced.

## Acceptance required

Test successful close and reopen, retained report downloads, exact snapshot content hashes, source fingerprint/sequence conflicts, storage failure, response loss/reload/retry without duplicate events, actor/shop switch and denied roles. Current approved test shop is Composition; do not change its registration for these tests. No period or turnover write has been performed in this follow-up.

## Other current evidence

PR66 production deploy 6ac9414115dedb0008abb3f0 is ready/published for main 8bfd203. Native/server PR12 merged synchronized fiscal date/time catalogs. Updated combined browser-push server branch passed 760/760 isolated tests; web draft passed production build, GST suite, 60 contracts and 1136 translated labels. Notification branches remain draft/undeployed pending server configuration and real delivery acceptance.

## Implemented follow-up

The web period page now shows the authoritative sales/purchase totals and discrepancies, the same preparation assessment/reason mapping used by mobile, period-bound preview exports, and verified retained report downloads from close-history events. Turnover shows the server's minimum reporting code length. Defaults match native's previous month and previous financial year.

Both pages read the actor/shop-scoped durable journal, restore original draft values and block fresh submissions while storage is unavailable or a request is pending. Retry reuses the original retained payload. Period recovery also offers an outcome-only lookup; a missing, failed, mismatched or cross-account result preserves the pending request. Reviewed confirmation resets when the source changes. Fresh writes remain owner-only, with server concurrency and receipt verification authoritative.

Validation: TypeScript, production build, translation coverage (1127 labels across nine translated languages), GST regression suite and 61 vendored contract checks passed. New regressions cover IST month/financial-year boundaries, exact restored input, close/reopen outcome receipts, missing outcomes, response failure, actor change, fingerprint/sequence mismatch, altered payload rejection and native preparation reason mapping. These are automated checks; live close/reopen, turnover writes/conflicts, storage-failure runtime and cross-client acceptance remain open until independently observed.
