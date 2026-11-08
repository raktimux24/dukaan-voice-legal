const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  { test } = require("node:test"),
  assert = require("node:assert/strict"),
  ts = require("typescript");
const { JSDOM } = require("jsdom");
const bootstrap = new JSDOM("<div/>");
global.window = bootstrap.window;
global.document = bootstrap.window.document;
const React = require("react"),
  { act } = React,
  { createRoot } = require("react-dom/client");
for (const ext of [".ts", ".tsx"])
  require.extensions[ext] = (m, f) =>
    m._compile(
      ts.transpileModule(fs.readFileSync(f, "utf8"), {
        fileName: f,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      }).outputText,
      f,
    );
const {
  validOrderLine,
  estimatedTotal,
  availableToOrder,
  suggestedPrice,
  filterOrders,
  receiptIssue,
} = require("../app/lib/shop/purchase-orders/presentation.ts");
const { poRemaining } = require("../app/lib/shop/purchase-orders/contract.ts");
const line = {
  id: "line",
  productId: "product",
  name: "Rice",
  quantity: "10",
  unit: "kg",
  price: "50",
  received: "2",
  rejected: "1",
  cancelled: "0",
};
const order = {
  id: "order",
  shopId: "shop",
  version: 1,
  number: "PO-1",
  status: "issued",
  supplierId: "supplier",
  supplier: { name: "Supplier" },
  expectedDate: "2026-11-12",
  notes: "",
  lines: [line],
  receipts: [],
  events: [],
};
const delivery = {
  lineId: "line",
  productId: "product",
  quantity: "3",
  rejected: "1",
  reason: "Damaged",
  cost: "50",
  batchNumber: "",
  expiryDate: "",
};
test("unknown demand starts at one; committed demand is not ordered twice", () => {
  assert.equal(availableToOrder({ quantity: null, committed: "0" }), 1);
  assert.equal(availableToOrder({ quantity: "10", committed: "7" }), 3);
  assert.equal(availableToOrder({ quantity: "10", committed: "12" }), 0);
});
test("draft precision and complete estimates match the server contract", () => {
  for (const q of ["0", "-1", "1e3", "1.0001", ""])
    assert.equal(validOrderLine({ ...line, quantity: q }), false, q);
  assert.equal(validOrderLine({ ...line, quantity: "0.125" }), true);
  assert.equal(estimatedTotal([{ ...line, price: "" }]), null);
  assert.equal(estimatedTotal([{ ...line, price: "0" }]), 0);
  assert.equal(estimatedTotal([line]), 500);
});
test("supplier cost suggestions use the selected supplier, including zero prices", () => {
  const options = {
    prices: [{ supplierId: "supplier", productId: "product", price: "0" }],
  };
  assert.equal(suggestedPrice(options, "supplier", "product", "50"), "0");
  assert.equal(suggestedPrice(options, "different", "product", "50"), "50");
});
test("receipt validation enforces remaining quantities, reasons, product match, costs and real dates", () => {
  assert.equal(receiptIssue(order, [delivery], "2026-11-09"), null);
  for (const [patch, expected] of [
    [{ quantity: "8" }, "remaining"],
    [{ reason: "" }, "reason"],
    [{ productId: "" }, "product"],
    [{ cost: "" }, "quantity"],
    [{ expiryDate: "2027-02-30" }, "expiry"],
    [{ expiryDate: "2027-99-99" }, "expiry"],
    [{ expiryDate: "2026-11-08" }, "expiry"],
  ])
    assert.equal(
      receiptIssue(order, [{ ...delivery, ...patch }], "2026-11-09"),
      expected,
    );
  assert.equal(
    receiptIssue(
      order,
      [{ ...delivery, quantity: "0", cost: "", productId: "" }],
      "2026-11-09",
    ),
    null,
  );
  assert.equal(
    poRemaining(line),
    8,
    "rejected goods remain due for replacement",
  );
});
test("list filters combine supplier, number and product with status without mutating source", () => {
  const rows = [order, { ...order, id: "draft", status: "draft" }];
  assert.equal(filterOrders(rows, "issued", " RICE ").length, 1);
  assert.equal(filterOrders(rows, "all", "supplier").length, 2);
  assert.equal(rows.length, 2);
});
async function harness({
  initial = order,
  allowed = true,
  pending = null,
  compose = false,
} = {}) {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://local.test/shop/purchase-orders",
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const calls = [],
    options = {
      suppliers: [{ id: "supplier", name: "Supplier" }],
      products: [{ id: "product", name: "Rice", unit: "kg", price: "50" }],
      buyList: [],
      prices: [{ supplierId: "supplier", productId: "product", price: "45" }],
    };
  const retail = require("../app/lib/shop/retail-locales.json").en,
    web = require("../app/lib/shop/gst-web-locales.json").en;
  const t = (key, vars) => {
    let text =
      web[key] ||
      retail[key] ||
      {
        "common.cancel": "Cancel",
        "common.back": "Back",
        "common.loading": "Loading",
        "common.retry": "Retry",
      }[key] ||
      key;
    for (const [k, v] of Object.entries(vars || {}))
      text = text.replaceAll("{{" + k + "}}", v);
    return text;
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(
      code,
      {
        module: m,
        exports: m.exports,
        window: dom.window,
        document: dom.window.document,
        Intl,
        Date,
        console,
        require(id) {
          if (id === "react") return React;
          if (id === "@tanstack/react-query")
            return { useQuery: () => ({ data: undefined }) };
          if (id.endsWith("/shop/context"))
            return {
              useShop: () => ({
                api: {},
                shop: { id: "shop" },
                prefs: { appLanguage: "en" },
              }),
            };
          if (id.endsWith("/product-image"))
            return { ProductImageById: () => null };
          if (id.endsWith("/gst-supplier"))
            return {
              SupplierPicker: ({ onChange }) =>
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      onChange({
                        id: "supplier",
                        identity: { name: "Supplier" },
                      }),
                  },
                  "Pick supplier",
                ),
            };
          if (id.endsWith("/shop/ui"))
            return {
              Button: ({ children, onClick, disabled, ...rest }) =>
                React.createElement("button", { onClick, disabled }, children),
              Field: ({ label, children }) =>
                React.createElement("label", null, label, children),
              Spinner: () => null,
              IllustratedEmpty: ({ title, action }) =>
                React.createElement("div", null, title, action),
            };
          if (id.startsWith(".")) {
            const f = path.resolve(path.dirname(file), id);
            return load([".ts", ".tsx"].map((e) => f + e).find(fs.existsSync));
          }
          return require(id);
        },
      },
      { filename: file },
    );
    return m.exports;
  }
  const { PurchaseOrdersView } = load(
    path.resolve("app/lib/shop/purchase-orders/view.tsx"),
  );
  function App() {
    const [p, setOrder] = React.useState(initial),
      [search, setSearch] = React.useState("");
    return React.createElement(PurchaseOrdersView, {
      w: {
        order: p,
        setOrder,
        search,
        setSearch,
        list: {
          data: { items: initial ? [initial] : [], more: false },
          refetch: async () => {},
        },
        options: { data: options, refetch: async () => {} },
        busy: false,
        ready: true,
        pending,
        allowed,
        offset: 0,
        setOffset() {},
        run: async (action) => {
          calls.push(action);
          if (action?.kind === "create")
            setOrder({ ...order, ...action.draft, status: "draft" });
          return true;
        },
      },
      t,
      uuid: () => "new-line",
      share: async () => {},
      invoice: async () => {},
      newProduct: () => {},
      openForm: compose,
      onCreate: () => {},
      onShowList: () => {},
      onOpen: () => {},
    });
  }
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(App)));
  const button = (text) =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === text,
    );
  const click = async (b) => {
    assert.ok(b, "button exists");
    await act(async () => b.click());
  };
  const fill = async (label, value) => {
    const node = [...document.querySelectorAll("label")]
      .find((l) => l.textContent.includes(label))
      ?.querySelector("input");
    assert.ok(node, label);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      ).set.call(node, value);
      node.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      node.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
  };
  return {
    calls,
    button,
    click,
    fill,
    stop: () => act(async () => root.unmount()),
  };
}
test("helper and offline boundaries hide order details and actions", async () => {
  const h = await harness({ allowed: false });
  assert.match(document.body.textContent, /owner or manager access/);
  assert.equal(h.button("Receive delivery"), undefined);
  assert.equal(document.querySelector(".po-detail-head"), null);
  await h.stop();
});
test("receipt review is required; over-receipt blocks submission and edits invalidate approval", async () => {
  const h = await harness();
  await h.click(h.button("Receive delivery"));
  assert.ok(h.button("Confirm delivery receipt").disabled);
  await h.fill("Accepted quantity now", "9");
  await act(async () => document.querySelector("input[type=checkbox]").click());
  assert.ok(h.button("Confirm delivery receipt").disabled);
  assert.match(document.body.textContent, /cannot exceed/);
  await h.fill("Accepted quantity now", "3");
  assert.equal(document.querySelector("input[type=checkbox]").checked, false);
  await act(async () => document.querySelector("input[type=checkbox]").click());
  assert.equal(h.button("Confirm delivery receipt").disabled, false);
  await h.click(h.button("Confirm delivery receipt"));
  assert.equal(h.calls[0].kind, "receive");
  assert.equal(h.calls[0].lines[0].quantity, "3");
  await h.stop();
});
test("draft cancellation requires a separate confirmation and pending recovery locks mutations", async () => {
  const h = await harness({ initial: { ...order, status: "draft" } });
  await h.click(h.button("Actions"));
  await h.click(h.button("Cancel draft"));
  assert.equal(h.calls.length, 0);
  await h.click([...document.querySelectorAll(".po-confirm button")][0]);
  assert.equal(h.calls[0].kind, "cancel");
  await h.stop();
  const locked = await harness({ pending: { clientId: "saved" } });
  await locked.click(locked.button("Actions"));
  assert.ok(locked.button("Receive delivery").disabled);
  assert.ok(locked.button("Share order").disabled);
  await locked.stop();
});
test("new order reviews supplier prices and items before saving", async () => {
  const h = await harness({ initial: null, compose: true });
  assert.ok(h.button("Continue →").disabled);
  await h.click(h.button("Pick supplier"));
  await h.click(h.button("Continue →"));
  await h.click(document.querySelector(".po-picker button"));
  assert.match(document.body.textContent, /Last recorded price/);
  await h.click(h.button("Continue →"));
  assert.match(document.body.textContent, /₹45.00/);
  assert.equal(h.calls.length, 0);
  await h.click(h.button("Save draft →"));
  assert.equal(h.calls[0].draft.lines[0].price, "45");
  assert.equal(h.calls[0].draft.supplierId, "supplier");
  await h.stop();
});
