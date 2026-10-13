import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";
const {
  beginPushSession,
  pushSession,
  assertPushSession,
  withPushSession,
  pushKeyMatches,
  bindPushOwner,
  pushWorkerReady,
} = createRequire(import.meta.url)(
  path.join(process.env.GST_TEST_BUILD, "browser-push-session.js"),
);
const a = beginPushSession("a");
assert.equal(pushSession("a").generation, a.generation);
let release;
const gate = new Promise((resolve) => (release = resolve));
const mutations = [];
const old = withPushSession(a, async (check) => {
  await gate;
  check();
  mutations.push("old unsubscribe");
});
await new Promise((resolve) => setImmediate(resolve));
const b = beginPushSession("b");
const newer = withPushSession(b, async (check) => {
  check();
  mutations.push("new subscription");
});
release();
await assert.rejects(old, /account changed/);
await newer;
assert.deepEqual(mutations, ["new subscription"]);
assert.throws(() => assertPushSession(a), /account changed/);
assert.throws(() => pushSession("a"), /account changed/);
const failed = withPushSession(b, async () => {
  throw Error("provider failed");
});
await assert.rejects(failed, /provider failed/);
await withPushSession(b, async (check) => {
  check();
  mutations.push("retry");
});
assert.equal(mutations.at(-1), "retry");
const bytes = Uint8Array.from([4, 1, 255, 254]);
const encoded = Buffer.from(bytes).toString("base64url");
assert.equal(pushKeyMatches(bytes.buffer, encoded), true);
assert.equal(
  pushKeyMatches(Uint8Array.from([4, 1, 255, 253]).buffer, encoded),
  false,
);
assert.equal(pushKeyMatches(null, encoded), false);
assert.equal(pushKeyMatches(bytes.buffer, "!!!"), false);
const worker = (result) => ({
  postMessage(_message, ports) {
    ports[0].postMessage(result);
  },
});
await bindPushOwner(worker({ ok: true, actorId: "b" }), "b");
await assert.rejects(
  bindPushOwner(worker({ ok: false }), "b"),
  /could not be saved/,
);
await assert.rejects(
  bindPushOwner(worker({ ok: true, actorId: "a" }), "b"),
  /could not be saved/,
);
await assert.rejects(bindPushOwner(null, "b"), /not active/);
await assert.rejects(
  bindPushOwner({ postMessage() {} }, "b", 10),
  /did not confirm/,
);
await assert.rejects(
  bindPushOwner(
    {
      postMessage() {
        throw Error("transport");
      },
    },
    "b",
  ),
  /could not be reached/,
);
console.log(
  "Browser push sessions: stale work isolation, serialized account switches, retries, rotated keys and worker acknowledgement failure/timeout passed.",
);

const registration = { active: {} };
assert.equal(
  await pushWorkerReady(Promise.resolve(registration)),
  registration,
);
await assert.rejects(
  pushWorkerReady(Promise.reject(Error("activation failed"))),
  /activation failed/,
);
await assert.rejects(
  pushWorkerReady(new Promise(() => {}), 10),
  /did not become active/,
);
