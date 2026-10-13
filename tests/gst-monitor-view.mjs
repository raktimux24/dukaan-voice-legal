import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";
const { gstMonitorView: view, gstMonitorReceiptConfirmed: confirmed, CORE_MONITOR_KINDS } = createRequire(
  import.meta.url,
)(path.join(process.env.GST_TEST_BUILD, "gst-monitor-view.js"));
const completed = {
  hasData: true,
  pending: false,
  fetchStatus: "idle",
  error: false,
  completed: true,
  truncated: false,
  issueCount: 0,
};
assert.equal(view(completed), "checked");
for (const condition of [{fetchStatus:"paused"},{enabled:false},{unconfirmed:true}]) {
  assert.equal(view({...completed,...condition}),"stale");
  assert.equal(view({...completed,issueCount:3,...condition}),"stale");
}
assert.equal(view({ ...completed, issueCount: 1 }), "attention");
assert.equal(view({ ...completed, truncated: true }), "partial");
assert.equal(view({ ...completed, error: true }), "stale");
assert.equal(
  view({ ...completed, error: true, issueCount: 0, truncated: false }),
  "stale",
);
assert.equal(view({ ...completed, completed: false }), "never_checked");
assert.equal(
  view({ ...completed, hasData: false, error: true }),
  "unavailable",
);
assert.equal(
  view({ ...completed, hasData: false, fetchStatus: "paused" }),
  "offline",
);
assert.equal(view({ ...completed, hasData: false, pending: true }), "loading");
assert.ok(CORE_MONITOR_KINDS.has("closedPeriodChanged"));
assert.ok(CORE_MONITOR_KINDS.has("missingProfiles"));
assert.ok(CORE_MONITOR_KINDS.has("integrityMismatch"));
assert.equal(CORE_MONITOR_KINDS.has("periodMutation"), false);
const run = { id: "new-check", status: "completed", scannedDocuments: 9 };
const receipt = { skipped: false, run };
assert.equal(confirmed(receipt, { runs: [run] }), true);
assert.equal(confirmed(receipt, { runs: [{ ...run, id: "previous-check" }] }), false);
assert.equal(confirmed(receipt, { runs: [{ ...run, status: "failed" }] }), false);
assert.equal(confirmed(receipt, { runs: [{ ...run, scannedDocuments: 8 }] }), false);
assert.equal(confirmed({ skipped: true, run }, { runs: [run] }), false);
assert.equal(confirmed({ skipped: false }, { runs: [run] }), false);
assert.equal(confirmed(receipt, null), false);
assert.equal(confirmed(receipt, { runs: [null, run] }), true);
assert.equal(confirmed({ skipped: false, run: { ...run, scannedDocuments: -1 } }, { runs: [run] }), false);
assert.equal(confirmed({ skipped: false, run: { ...run, scannedDocuments: 0 } }, { runs: [{ ...run, scannedDocuments: 0 }] }), true);
console.log(
  "GST check results: complete, issues, partial, failed/stale, never checked, unavailable and offline states passed.",
);
