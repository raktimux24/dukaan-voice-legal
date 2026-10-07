import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { indexedDB } from "fake-indexeddb";
const require = createRequire(import.meta.url);
const storage = require(`${process.env.GST_TEST_BUILD}/gst-storage.js`);
Object.defineProperty(globalThis, "indexedDB", { value: indexedDB });
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: {},
  configurable: true,
});
const scope = { actorId: "actor-a", shopId: "shop-a" };
storage.setFinancialScope(scope);
const row = {
  ...scope,
  id: "request-a",
  path: "/sales",
  payload: { total: 100 },
  createdAt: new Date().toISOString(),
  state: "pending",
};
await storage.retainRequest(row);
await assert.rejects(
  storage.retainRequest({ ...row, payload: { total: 200 } }),
);
await assert.rejects(storage.retainRequest({ ...row, shopId: "shop-b" }));
assert.deepEqual((await storage.retainedRequests(scope))[0].payload, {
  total: 100,
});
await storage.requestStatus(row.id, {
  state: "confirmed",
  result: { number: "26-1-001" },
});
await storage.retainRequest(row);
assert.equal((await storage.retainedRequests(scope))[0].state, "confirmed");
const reservation = { ...row, id: "request-b" };
await storage.reserveSale("allocation-a", { next: 2 }, reservation);
assert.equal((await storage.readState("allocation-a")).next, 2);
await assert.rejects(
  storage.reserveSale(
    "allocation-a",
    { next: 3 },
    { ...reservation, payload: { total: 999 } },
  ),
);
assert.equal((await storage.readState("allocation-a")).next, 2);
assert.deepEqual(
  (await storage.retainedRequests(scope)).find((r) => r.id === "request-b")
    .payload,
  reservation.payload,
);
assert.equal(
  (await storage.retainedRequests(scope)).find((r) => r.id === "request-b")
    .state,
  "pending",
);
let release;
let entered;
const inside = new Promise((resolve) => (entered = resolve));
const hold = new Promise((resolve) => (release = resolve));
const first = storage.withFinancialLock(scope, async () => {
  entered();
  await hold;
  return 1;
});
await inside;
await assert.rejects(
  storage.withFinancialLock(scope, async () => 2),
  /in progress/,
);
release();
assert.equal(await first, 1);
assert.equal(await storage.withFinancialLock(scope, async () => 3), 3);
storage.setFinancialScope({ ...scope, actorId: "actor-b" });
assert.throws(() => storage.assertScope(scope), /changed/);
assert.deepEqual(
  await storage.retainedRequests({ ...scope, actorId: "actor-b" }),
  [],
);
console.log(
  "Browser journal tests passed: immutable retries, scope isolation, confirmed retention, atomic reservations and concurrent locks.",
);
storage.setFinancialScope(scope);
const { bindGstApi } = require(`${process.env.GST_TEST_BUILD}/gst-api.js`);
let calls = [];
const api = bindGstApi(async (path, init) => {
  calls.push({ path, body: JSON.parse(init.body) });
  if (path.endsWith("/outcome")) return { id: "lost-response", total: 100 };
  throw Error("Response lost");
});
const input = { clientId: "lost-response", total: 100 };
const confirmed = await api.financial(
  scope.shopId,
  "/payments",
  input,
  (value) => {
    assert.deepEqual(value, { id: "lost-response", total: 100 });
    return value;
  },
  "/payments/outcome",
);
assert.equal(confirmed.total, 100);
assert.deepEqual(
  calls.map((c) => c.body),
  [input, input],
);
assert.equal(
  (await storage.retainedRequests(scope)).find((r) => r.id === "lost-response")
    .state,
  "confirmed",
);
const uncertain = bindGstApi(async () => ({ status: "unconfirmed" }));
await assert.rejects(
  uncertain.financial(
    scope.shopId,
    "/uncertain",
    { clientId: "uncertain-a" },
    () => {
      throw Error("No verified outcome");
    },
  ),
);
await assert.rejects(
  uncertain.financial(
    scope.shopId,
    "/uncertain",
    { clientId: "uncertain-b" },
    (v) => v,
  ),
  /earlier request/,
);
const rejected = bindGstApi(async (path) => {
  if (path.endsWith('/outcome')) return {status:'not_found'};
  throw Error('return_settlement_total_mismatch');
});
await assert.rejects(rejected.financial(scope.shopId,'/rejected-return',{clientId:'rejected-return'},v=>v,'/rejected-return/outcome'),/return_settlement_total_mismatch/);
assert.equal((await storage.retainedRequests(scope)).find(r=>r.id==='rejected-return').state,'pending');
const switched = bindGstApi(async () => {
  storage.setFinancialScope({ ...scope, actorId: "different-actor" });
  return { ok: true };
});
await assert.rejects(
  switched.financial(
    scope.shopId,
    "/switched",
    { clientId: "scope-switch" },
    (v) => v,
  ),
  /changed/,
);
assert.equal(
  (await storage.retainedRequests(scope)).find((r) => r.id === "scope-switch")
    .state,
  "pending",
);
console.log(
  "Financial outcome tests passed: lost response recovery, original identity replay, uncertain outcome retention and delayed account-switch rejection.",
);
