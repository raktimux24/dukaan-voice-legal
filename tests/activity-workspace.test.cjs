const fs = require("node:fs"),
  ts = require("typescript"),
  { test } = require("node:test"),
  assert = require("node:assert/strict");
require.extensions[".ts"] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    f,
  );
const a = require("../app/lib/shop/activity.ts");
const catalog = {
  ...require("../app/lib/shop/retail-locales.json").en,
  ...require("../app/lib/shop/locales/en.json"),
  ...require("../app/lib/shop/gst-web-locales.json").en,
};
const t = (key, vars = {}) =>
  (catalog[key] || key).replace(/\{\{(\w+)\}\}/g, (_, k) =>
    String(vars[k] ?? ""),
  );
const log = (overrides = {}) => ({
  id: "one",
  shopId: "shop",
  userId: "user",
  userName: "Asha",
  actionType: "add",
  inputMethod: "manual",
  description: "",
  payload: { quantity: 0, unit: "kg", productName: "Rice" },
  createdAt: "2026-11-08T12:00:00Z",
  ...overrides,
});
test("pagination uses raw page length and stops on an empty page", () => {
  assert.equal(
    a.nextActivityPage({ logs: [log(), log()], hasMore: true }, 50),
    52,
  );
  assert.equal(a.nextActivityPage({ logs: [], hasMore: true }, 50), undefined);
  assert.equal(
    a.nextActivityPage({ logs: [log()], hasMore: false }, 50),
    undefined,
  );
  assert.equal(
    a.uniqueActivity([{ logs: [log()] }, { logs: [log(), log({ id: "two" })] }])
      .length,
    2,
  );
});
test("IST midnight groups records independently from device timezone", () => {
  assert.equal(a.activityDay("2026-11-07T18:29:59Z"), "2026-11-07");
  assert.equal(a.activityDay("2026-11-07T18:30:00Z"), "2026-11-08");
  assert.equal(a.activityDay("bad"), "unknown");
  assert.equal(a.activityGroups([log(), log({ id: "two" })]).length, 1);
});
test("voice filter is supported and invalid deep links default safely", () => {
  assert.equal(a.activityFilter("voice"), "voice");
  assert.equal(a.activityFilter("bogus"), "all");
  assert.equal(a.activityFilter(null), "all");
});
test("zero quantity remains visible and returns do not assert a cash refund", () => {
  assert.match(a.activityDescription(log(), t), /0/);
  const desc = a.activityDescription(
    log({
      actionType: "sale_return",
      payload: { saleNumber: 12, refundAmount: 250 },
    }),
    t,
  );
  assert.match(desc, /12/);
  assert.match(desc, /250/);
  assert.doesNotMatch(desc, /refund/i);
});
test("related routes encode identifiers and respect cashbook permissions", () => {
  assert.equal(
    a.activityTarget(log({ payload: { saleId: "a/b" } }), false).href,
    "/shop/sales/a%2Fb",
  );
  assert.equal(a.activityTarget(log({ actionType: "cashbook" }), false), null);
  assert.equal(
    a.activityTarget(log({ actionType: "cashbook" }), true).href,
    "/shop/cashbook",
  );
  assert.equal(
    a.activityTarget(
      log({ actionType: "estimate", payload: { estimateId: "a&b" } }),
      true,
    ).href,
    "/shop/estimates?id=a%26b",
  );
});
test("photo descriptions expose counts rather than stored media references", () => {
  const s = a.activityDescription(
    log({
      actionType: "product_images_updated",
      payload: {
        productName: "Rice",
        beforeCount: 1,
        afterCount: 2,
        coverChanged: true,
        secret: "private-image-url",
      },
    }),
    t,
  );
  assert.match(s, /Rice/);
  assert.doesNotMatch(s, /private-image-url/);
});
test("CSV escapes quotes, preserves multiline text and neutralizes formulas without exporting payload", () => {
  const csv = a.activityCsv(
    [
      log({
        userName: ' =HYPERLINK("bad")',
        actionType: "future",
        description: 'line 1\n"line 2"',
        payload: { secret: "DO_NOT_EXPORT" },
      }),
    ],
    t,
  );
  assert.ok(csv.startsWith("\ufeff"));
  assert.ok(csv.includes("' =HYPERLINK"));
  assert.ok(csv.includes('""line 2""'));
  assert.doesNotMatch(csv, /DO_NOT_EXPORT/);
});
