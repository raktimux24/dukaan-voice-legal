# Web observation refinements — 31 October 2026

Bring the released mobile refinements to the existing dark web workspace. Reuse saffron actions, shared section controls, existing bill and estimate workflows, and all ten message dictionaries.

- Keep current payment status, total and original checkout method ahead of the document. Hide the duplicate legacy receipt when an issued presentation exists, retain a dark item list, and place fiscal documents in a labelled disclosure. Issued presentation, tax content, hashes and QA footer remain unchanged.
- Put PDF sharing/download and print actions before a compact paper thumbnail. A full preview supports Escape, focused close, keyboard focus containment, page controls and return to the same selected page. PDF/PNG exports use the same verified rendered sheets. Browsers with file sharing use the share sheet; other browsers download the PDF.
- Mark stock as current on-hand. Place date-period choices beside movement/history, retaining the same report query and CSV range.
- Keep estimate filters wrapping; format currency with Indian grouping and omit unnecessary zero paise. Editable fields and conversion/idempotency are unchanged.
- Use short Store/Products/Orders section controls. Show merchant/domain labels, copy the unchanged catalogue URL and put the complete URL in an optional disclosure.
- Empty Today sales can open Yesterday; other empty periods can open the last seven days. Reset stale searches and payment/status filters when using these shortcuts. Read failures are never described as empty registers.
- Bound follow-up reads at fifteen seconds, including auth/body stalls; forward abort to the web transport and prevent late requests after delayed token retrieval. Do not timeout/retry durable mutations. Keep translated error, Retry and saved queue recovery.

Shared modules also carry already released mobile cashbook non-cash-empty-state and opening-setup readability changes. Verify these existing pages retain their shared controls. No migration or accounting mutation is required.

## Validation

Run the repository release checks (GST, auth/session, reports, retention, translations, cashbook and follow-up recovery), TypeScript and production build. Publish through the existing Git/Netlify pipeline. Verify the exact live commit, then test the retained QA bill, full preview/return, PDF/PNG downloads, stock range, estimates list/detail/back, catalogue copy and sections, empty Sales recovery, and follow-up queue/customer/back on the authenticated QA GST shop. Check narrow layouts and a translated locale. Compare a fresh financial baseline after testing.

The QA shop had five existing bills before this pass, including the newer ₹66 UPI bill. Do not compare against the previous four-bill baseline or remove concurrent user data. Preview/download/copy and read-only navigation must not create a bill or payment.

Clerk's production-origin restriction blocks authenticated localhost in this environment. Local verification is the compiled/tested source; authenticated visible verification is performed on the published origin. Revert and redeploy the change if a production regression cannot be corrected promptly. No store submission or mobile OTA is part of this web deployment.
