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
const {
  supplierDirectory,
  supplierHistoryUrl,
  supplierComparisons,
  cheaperSupplierCount,
} = require("../app/lib/shop/suppliers.ts");
const {
  bindPurchaseOrders,
} = require("../app/lib/shop/purchase-orders/client.ts");
test("deduplicate only explicitly linked receipt names, never similar supplier names", () => {
  const s = [
      {
        id: "1",
        identity: { name: "Acme", inventorySupplierName: "Acme stock" },
      },
      { id: "2", identity: { name: "West" } },
    ],
    r = [{ name: "Acme stock" }, { name: "Acme" }, { name: "West" }];
  assert.deepEqual(
    supplierDirectory(s, r, "").history.map((r) => r.name),
    ["Acme", "West"],
  );
  assert.equal(supplierDirectory(s, r, "STOCK").saved.length, 1);
});
test("history links preserve percent, slash, unicode and supplier identity", () => {
  const u = new URL(
    supplierHistoryUrl("50% / दुकान", "a&b"),
    "https://example.test",
  );
  assert.equal(decodeURIComponent(u.pathname.split("/").pop()), "50% / दुकान");
  assert.equal(u.searchParams.get("supplierId"), "a&b");
});
test("comparison searches supplier names and sorts recorded prices without mutating inputs", () => {
  const r = {
    name: "Rice",
    suppliers: [
      { name: "B", price: 80 },
      { name: "A", price: 60 },
    ],
  };
  const v = supplierComparisons([r], " a ");
  assert.equal(v[0].suppliers[0].name, "A");
  assert.equal(r.suppliers[0].name, "B");
});
test("cheaper count excludes missing prices and requires more than five percent difference", () => {
  assert.equal(
    cheaperSupplierCount([
      { lastPrice: null, alt: { price: 1 } },
      { lastPrice: 100, alt: { price: 95 } },
      { lastPrice: 100, alt: { price: 94 } },
    ]),
    1,
  );
});
test("order counts use server summary when present", async () => {
  const api = bindPurchaseOrders(async (path) => {
    assert.match(path, /summary=suppliers/);
    return { counts: { s: 3 } };
  });
  assert.deepEqual(await api.supplierCounts("shop"), { s: 3 });
});
test("legacy order counts paginate and deduplicate overlapping pages", async () => {
  let calls = [];
  const api = bindPurchaseOrders(async (path) => {
    calls.push(path);
    return calls.length === 1
      ? { items: [{ id: "1", supplierId: "s" }], more: true }
      : {
          items: [
            { id: "1", supplierId: "s" },
            { id: "2", supplierId: "t" },
          ],
          more: false,
        };
  });
  assert.deepEqual(await api.supplierCounts("shop"), { s: 1, t: 1 });
  assert.match(calls[1], /offset=1/);
});
test("legacy counts stop on a repeated page instead of looping", async () => {
  const api = bindPurchaseOrders(async () => ({
    items: [{ id: "1", supplierId: "s" }],
    more: true,
  }));
  await assert.rejects(api.supplierCounts("shop"), /po_unavailable/);
});
