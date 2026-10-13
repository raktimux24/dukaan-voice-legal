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

## Production and live acceptance — 10 October

PR67 merged to main c799dde5074364697090fed51329d7d454b8131f. Netlify production deploy 6ac9476e9dcb990008d22660 is ready/published at 2026-10-09T19:59:38.498Z, verified against its exact commit.

In approved Suresh Stationary Store, September 2026 initially had Open state and zero sales/purchases. A clearly labeled synthetic review closed it; full reload retained Closed and the close-history reason with saved sales/purchase links. Reopening with a synthetic restoration reason returned it to Open and retained both history events. No filing, money transfer, stock movement or registration change occurred. This accepts successful web close/reopen and reload, not conflict/failure or cross-client cases.

Both close snapshots downloaded through the hash-verifying controls. Sales report d0bdb9df-6d63-4888-9c2a-1565ff25351b is 2584 bytes, SHA256 00701a870c34a266e8abdc92289e39146aafe890c045db344d77a447f0c52a67. Purchase report 9c1890c7-1899-4f0e-8102-49008d0ade2a is 1897 bytes, SHA256 b93fb727177eeb9388775e135c8111cdd9c1bbef321e3c4f6a0bb799deb57cd0. Sales metadata contains the exact September IST boundaries. Purchase snapshot remained downloadable after reopening. Evidence: /private/tmp/web-period-close-20261010.jpg and /private/tmp/web-period-reopen-20261010.jpg.

Turnover defaulted to 2025-26 with no existing review. Synthetic fixture WQA-TURN-1010 saved amount 0.00 with explicit test-only/no-filing evidence. The page displayed the server's minimum reporting code length of four digits. Full reload retained the amount, timestamp, evidence and history. Evidence: /private/tmp/web-turnover-reload-20261010.jpg. This accepts successful web turnover persistence, not business evidence correctness, conflicts, lost-response recovery or native readback.

Simulator screenshot rendering recovered, but coordinate input reported no available window and a rebound AX Settings click left Home unchanged. Native period/turnover readback and native picker acceptance remain open; source checks are not substituted for that observation.
