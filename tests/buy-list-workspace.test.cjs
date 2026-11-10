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
  filterBuyItems,
  buyItemDestination,
  buyQuantity,
} = require("../app/lib/shop/buy-list.ts");
const rows = [
  {
    id: "1",
    itemName: "Rice",
    status: "pending",
    quantity: 2.5,
    unit: "kg",
    productId: "p1",
    isAiSuggested: true,
  },
  { id: "2", itemName: "Oil", status: "purchased" },
  { id: "3", itemName: "Salt", status: "stocked", purchaseOrderId: "po1" },
  {
    id: "4",
    itemName: "Tea & sugar",
    status: "pending",
    unit: "g",
    category: "staples",
    quantity: 500,
  },
];
test("completed filter includes legacy purchased; pending and suggestions are independent", () => {
  assert.equal(filterBuyItems(rows, "stocked").length, 2);
  assert.equal(filterBuyItems(rows, "pending").length, 2);
  assert.equal(filterBuyItems(rows, "ai_suggested").length, 1);
  assert.equal(filterBuyItems(rows, "all", " RICE ")[0].id, "1");
});
test("completed items never route to another receipt but linked orders remain available", () => {
  assert.equal(buyItemDestination(rows[1]), null);
  assert.match(buyItemDestination(rows[2]), /orderId=po1/);
});
test("linked receipts retain product, quantity and buy-list identity", () => {
  let u = new URL(buyItemDestination(rows[0]), "https://example.test");
  assert.equal(u.pathname, "/shop/products/p1");
  assert.equal(u.searchParams.get("qty"), "2.5");
  assert.equal(u.searchParams.get("batch"), "1");
  assert.equal(u.searchParams.get("buyListItemId"), "1");
});
test("new product handoff retains name, unit and category with safe encoding", () => {
  let u = new URL(buyItemDestination(rows[3]), "https://example.test");
  assert.equal(u.searchParams.get("name"), "Tea & sugar");
  assert.equal(u.searchParams.get("unit"), "g");
  assert.equal(u.searchParams.get("category"), "staples");
});
test("quantity rejects empty, negative, zero, exponent and overprecision", () => {
  for (const q of ["", "0", "-1", "1e3", "1.0001", "NaN", "Infinity"])
    assert.equal(buyQuantity(q), null, q);
  assert.equal(buyQuantity(" 1.125 "), 1.125);
});
