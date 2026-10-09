import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";
const { gstMonitorView: view, CORE_MONITOR_KINDS } = createRequire(
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
assert.ok(CORE_MONITOR_KINDS.has("missingProfiles"));
assert.ok(CORE_MONITOR_KINDS.has("integrityMismatch"));
assert.equal(CORE_MONITOR_KINDS.has("periodMutation"), false);
console.log(
  "GST check results: complete, issues, partial, failed/stale, never checked, unavailable and offline states passed.",
);
