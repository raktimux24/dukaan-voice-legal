import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { indexedDB } from "fake-indexeddb";
const require = createRequire(import.meta.url);
const storage = require(`${process.env.GST_TEST_BUILD}/gst-storage.js`);
const {
  reportReviewDefaults,
  reportReviewPath,
  pendingReportReviews,
  checkRecordedPeriod,
} = require(`${process.env.GST_TEST_BUILD}/report-review.js`);
const { gstExportReview, gstExportReviewItems } = require(
  `${process.env.GST_TEST_BUILD}/gst-core/gst-export-review.js`,
);
Object.defineProperty(globalThis, "indexedDB", { value: indexedDB });
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: {},
  configurable: true,
});
assert.deepEqual(reportReviewDefaults(new Date("2026-03-31T18:29:59Z")), {
  month: "2026-02",
  year: "2024-25",
});
assert.deepEqual(reportReviewDefaults(new Date("2026-03-31T18:30:00Z")), {
  month: "2026-03",
  year: "2025-26",
});
assert.deepEqual(reportReviewDefaults(new Date("2026-01-31T18:30:00Z")), {
  month: "2026-01",
  year: "2024-25",
});
assert.throws(() => reportReviewPath("shop", "turnover", "2025-27"));
assert.throws(() => reportReviewPath("shop", "periods", "2026-13"));
const shopId = crypto.randomUUID(),
  scope = { actorId: "owner-a", shopId },
  month = "2026-09";
storage.setFinancialScope(scope);
const makeRow = async (action = "close") => {
  const id = crypto.randomUUID();
  const row = {
    ...scope,
    id,
    path: reportReviewPath(shopId, "periods", month),
    payload: {
      clientId: id,
      action,
      note: " Synthetic review ",
      reviewed: true,
      expectedSequence: 0,
      expectedSourceFingerprint: "a".repeat(64),
    },
    state: "pending",
    createdAt: new Date().toISOString(),
  };
  await storage.retainRequest(row);
  return row;
};
const receipt = (row) => ({
  status: "recorded",
  event: {
    id: crypto.randomUUID(),
    shopId,
    createdBy: scope.actorId,
    clientId: row.id,
    month,
    action: row.payload.action,
    note: row.payload.note.trim(),
    sequence: 1,
    createdAt: new Date().toISOString(),
    sourceFingerprint:
      row.payload.action === "close"
        ? row.payload.expectedSourceFingerprint
        : null,
    salesExportId: row.payload.action === "close" ? crypto.randomUUID() : null,
    purchaseExportId:
      row.payload.action === "close" ? crypto.randomUUID() : null,
  },
});
for (const action of ["close", "reopen"]) {
  const row = await makeRow(action);
  let sent;
  const api = {
    gst: {
      post: async (path, body) => {
        sent = { path, body };
        return receipt(row);
      },
    },
  };
  // Restoring the journal must preserve the exact input, including whitespace.
  const restored = (await pendingReportReviews(shopId, "periods", month)).find(
    (x) => x.id === row.id,
  );
  assert.deepEqual(restored.payload, row.payload);
  await checkRecordedPeriod(api, shopId, restored);
  assert.equal(sent.path, row.path + "/request-outcome");
  assert.deepEqual(sent.body, row.payload);
  assert.equal(
    (await storage.retainedRequests(scope)).find((x) => x.id === row.id).state,
    "confirmed",
  );
  await assert.rejects(checkRecordedPeriod(api, shopId, row));
}
for (const failure of [
  "notfound",
  "network",
  "actor",
  "fingerprint",
  "sequence",
]) {
  const row = await makeRow();
  const api = {
    gst: {
      post: async () => {
        if (failure === "network") throw Error("connection_lost");
        if (failure === "notfound") return { status: "not_found" };
        const result = receipt(row);
        if (failure === "actor")
          storage.setFinancialScope({ actorId: "owner-b", shopId });
        if (failure === "fingerprint")
          result.event.sourceFingerprint = "b".repeat(64);
        if (failure === "sequence") result.event.sequence = 3;
        return result;
      },
    },
  };
  await assert.rejects(checkRecordedPeriod(api, shopId, row));
  storage.setFinancialScope(scope);
  const preserved = (await storage.retainedRequests(scope)).find(
    (x) => x.id === row.id,
  );
  assert.equal(preserved.state, "pending");
  assert.deepEqual(preserved.payload, row.payload);
}
let sends = 0;
const noSend = {
  gst: {
    post: async () => {
      sends++;
      throw Error("must not send");
    },
  },
};
const row = await makeRow();
await assert.rejects(
  checkRecordedPeriod(noSend, shopId, {
    ...row,
    payload: { ...row.payload, note: "altered" },
  }),
);
await assert.rejects(
  checkRecordedPeriod(noSend, shopId, { ...row, actorId: "wrong" }),
);
assert.equal(sends, 0);
const turnoverId = crypto.randomUUID(),
  turnover = {
    ...scope,
    id: turnoverId,
    path: reportReviewPath(shopId, "turnover", "2025-26"),
    payload: {
      clientId: turnoverId,
      amount: "00010.0",
      evidenceReference: " Original reference ",
      reviewed: true,
      expectedSequence: 0,
    },
    state: "pending",
    createdAt: new Date().toISOString(),
  };
await storage.retainRequest(turnover);
assert.deepEqual(
  (await pendingReportReviews(shopId, "turnover", "2025-26"))[0].payload,
  turnover.payload,
);
assert.deepEqual(await pendingReportReviews(shopId, "turnover", "2024-25"), []);
const summary = {
  afterCredits: { net: "0", tax: "0", gross: "0" },
  discrepancies: [],
  extendedFilingLines: [],
  hsnPreparation: [],
  turnoverPreparation: [],
};
assert.equal(gstExportReview(summary).status, "checked");
assert.equal(
  gstExportReview({ afterCredits: summary.afterCredits, discrepancies: [] })
    .status,
  "unavailable",
);
const affected = {
  ...summary,
  extendedFilingLines: [
    {
      id: "doc",
      number: "26-1-001",
      section: "review_required",
      review: ["recipient_gstin_missing"],
    },
  ],
  turnoverPreparation: [
    {
      shortCodes: ["HSN 1006"],
      review: ["classification_length_review_required"],
      minimumCodeDigits: 6,
      reportingFinancialYear: "2026-27",
      previousFinancialYear: "2025-26",
    },
  ],
};
assert.equal(gstExportReview(affected).status, "review");
assert.deepEqual(gstExportReviewItems(affected), [
  { reference: "26-1-001", reason: "identity" },
  { reference: "HSN 1006", reason: "code_length", digits: 6 },
]);
console.log(
  "Period recovery checks outcomes only, preserves pending evidence on failure, and rejects stale or cross-account requests. Review defaults and preparation details match native.",
);
