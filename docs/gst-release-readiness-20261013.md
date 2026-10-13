# GST Core release preparation

This branch reconciles the deployed acquisition/UX branch with GST main at
`36040a1c066f843dc5ca2c75713df1058454ad58`. Account/session transport guards,
exact-request return recovery, fiscal renderers, offline scope boundaries and
the 64 shared fiscal contracts come from the reviewed main implementation.
Recent customer/supplier, date-filter and inline purchase-product UX is retained.

New tests exercise actual credit rendering, untracked return receipts and
inline product handoff. Incomplete historical product identity blocks fiscal
rendering and remains available as support evidence; it is not invented from
current product settings. Current backend returns already retain name/unit.

## Local gate

Commit source in both checkouts, then run:

```sh
GST_SOURCE_ROOT=/absolute/path/to/reviewed/mobile npm run release:gst
```

This verifies the actual shared source and vendored bytes, native/backend
TypeScript, web GST tests, translated labels and production build. Independently
run backend database/integration tests using isolated fixtures, never a live
database URL. `npm run build:verified` is now the Netlify source build command;
it gates standalone builds with GST regressions and translation checks. The
normal provider build does not require a second checkout.

The build writes `/release.json` with web Git identity, dirty-source status,
contract-manifest SHA256/count and, when supplied, reviewed mobile Git identity.
It contains no environment values or credentials. After an approved deployment,
read the served marker and compare exact expected identity/fingerprint; also
verify authenticated critical flows and rendered asset hashes. A successful
local gate does not deploy anything or certify a store release.

## Retention and shared-device boundary

Pending/uncertain financial records survive signout for recovery. Account/shop
and session checks hide them from other ordinary sessions. Web IndexedDB and
some native AsyncStorage journals have no additional app encryption; hashes
are integrity evidence, not confidentiality. Native SecureStore protects
allocation reservations but does not encrypt every retained journal. Use a
private device. Recovery UI now explains that signing out does not remove bills.

Do not prune uncertain journals or introduce automatic encryption until a
reviewed retention/key-recovery design can demonstrate preservation through
logout, account switching, reinstall and lost-response recovery. A cleanup
feature and stricter shared-device confidentiality remain explicit design work.

## Release gates still requiring external action

- Review local changes and authorize remote pushes/PR updates and deployment.
- Deploy the sanitized backend error handler and the reconciled web build, then
  verify served source identity and authenticated GST Core fixtures.
- Verify packaged physical iOS/Android launch, account switching, offline cold
  restart, issuance and reconnect recovery after the auth OTA correction.
- Obtain actual App Store Connect and Play Console access; independently verify
  upload processing/testing, review and live statuses. Do not infer public release
  from EAS finished packages or internal testing submission.

IRP/e-invoice, statutory filing, general interstate sales and advanced tax rules
remain outside Core or explicitly blocked. No scope expansion is included.
