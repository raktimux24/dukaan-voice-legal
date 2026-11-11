const fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  ts = require("typescript");
const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  { JSDOM } = require("jsdom");
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
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://fixture.invalid/shop/products",
});
global.window = dom.window;
global.document = dom.window.document;
global.sessionStorage = dom.window.sessionStorage;
global.IS_REACT_ACT_ENVIRONMENT = true;
global.requestAnimationFrame = (fn) => fn();
window.scrollTo = () => {};
const React = require("react"),
  { act } = React,
  { createRoot } = require("react-dom/client"),
  { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const copy = {
  ...require("../app/lib/shop/en-fallback.ts").EN_FALLBACK,
  ...require("../app/lib/shop/gst-web-locales.json").en,
};
const tr = (key, fallback, vars) =>
  Object.entries(vars ?? {}).reduce(
    (s, [k, v]) => s.replaceAll("{{" + k + "}}", String(v)),
    copy[key] ?? fallback,
  );
const plain =
  (tag) =>
  ({ children, ...props }) =>
    React.createElement(tag, props, children);
let context, calls, params, bulk;
const MockContext = React.createContext(null);
const original = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/link") return { __esModule: true, default: plain("a") };
  if (request === "next/navigation")
    return {
      useSearchParams: () => params,
      useRouter: () => ({
        push: (url) => calls.push(["navigate", url]),
        replace: (url) => {
          calls.push(["replace", url]);
          params = new URL(url, "https://fixture.invalid").searchParams;
        },
      }),
    };
  const file =
    request.startsWith(".") && parent
      ? path.resolve(path.dirname(parent.filename), request)
      : "";
  if (file.endsWith("/shop/context"))
    return { useShop: () => context, ShopContext: MockContext };
  if (file.endsWith("/shop/gst-ui")) return { useGstText: () => (x) => x };
  if (file.endsWith("/shop/use-shop-dates"))
    return {
      useShopDates: () => ({
        formatDay: (x) => x ?? "—",
        formatWhen: (x) => x ?? "—",
      }),
    };
  if (file.endsWith("/shop/product-bulk/workflow"))
    return { useProductBulk: () => bulk };
  if (file.endsWith("/shop/product-image"))
    return {
      ProductImage: ({ name }) =>
        React.createElement("span", { "data-photo": name }),
    };
  if (file.endsWith("/shop/product-gallery"))
    return { ProductGallery: () => null };
  if (file.endsWith("/shop/product-barcode"))
    return { ProductBarcodeCard: () => null };
  if (file.endsWith("/shop/product-tax-history"))
    return { ProductTaxHistory: () => null };
  if (file.endsWith("/shop/home-nudge")) return { HomeNudge: () => null };
  if (file.endsWith("/shop/supplier-field"))
    return {
      SupplierField: ({ value, onChange }) =>
        React.createElement(
          "label",
          null,
          "Supplier",
          React.createElement("input", {
            value,
            onChange: (e) => onChange(e.target.value),
          }),
        ),
    };
  if (file.endsWith("/shop/cart"))
    return {
      useCart: () => ({
        addProduct: (_i, q) => {
          calls.push(["cart", q]);
          return { ok: true };
        },
        dropProduct: () => {},
      }),
    };
  return original.call(this, request, parent, isMain);
};
const {
    ProductsScreen,
  } = require("../app/components/shop/screens/products.tsx"),
  {
    ProductDetailScreen,
  } = require("../app/components/shop/screens/product-detail.tsx"),
  {
    ProductStockEditor,
    ProductBatchEditor,
  } = require("../app/components/shop/product-stock-editor.tsx");
const {
  filterProducts,
  productFilters,
  productReturn,
  productExpiry,
  receiveValues,
  stockNumber,
  productPairs,
} = require("../app/lib/shop/products.ts");
Module._load = original;
const item = (id, name, patch = {}) => ({
  id: "i" + id,
  productId: id,
  shopId: "s",
  quantity: 4,
  unit: "kg",
  stockStatus: "LOW",
  updatedAt: "2026-11-01",
  updatedByName: "Asha",
  product: {
    id,
    shopId: "s",
    name,
    unit: "kg",
    category: "staples",
    shortCode: id,
    barcode: "123" + id,
    barcodeAliases: ["alias" + id],
    minStockLevel: 5,
    sellingPrice: 80,
    purchasePrice: 50,
    trackStock: true,
    isActive: true,
    ...patch,
  },
});
const rows = [
  item("r", "Rice", { packSize: 20, packLabel: "bag" }),
  item("s", "Salt"),
  { ...item("o", "Oil"), quantity: 0, stockStatus: "OUT" },
  {
    ...item("d", "Delivery", { trackStock: false, category: "services" }),
    quantity: 0,
    stockStatus: "OUT",
  },
  item("a", "Archived", { isActive: false }),
];
let root, client;
const tick = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 12));
  });
async function mount(t, component, props = {}, options = {}) {
  params = new URLSearchParams(options.params ?? "");
  calls = [];
  sessionStorage.clear();
  bulk = {
    busy: false,
    pending: null,
    job: null,
    start: async (x) => calls.push(["bulk", x]),
  };
  context = {
    shop: { id: "s", name: "Shop" },
    userId: "u",
    hideCost: false,
    offline: false,
    premium: true,
    prefs: { appLanguage: "en" },
    perms: {
      canEditProducts: true,
      canAdjustStock: true,
      canSell: true,
      canSeeReports: true,
    },
    t: tr,
    setNotice: () => {},
    api: {
      assertSession() {},
      getAllInventory: async () => rows,
      getBatches: async () => [],
      getProductSales: async () => ({
        days: 30,
        units: 2,
        revenue: 160,
        bills: 2,
        daysOfCover: 60,
        lastSoldAt: null,
      }),
      getAudit: async () => ({ logs: [] }),
      getBuyList: async () => [],
      getNudges: async () => ({ nudges: [] }),
      getProductHistory: async () => ({ snapshots: [] }),
      captureHistory: async () => ({ productSnapshots: 0, shopStats: true }),
      addBatch: async (_s, id, p) => calls.push(["batch", id, p]),
      updateProduct: async (_s, id, p) => calls.push(["price", id, p]),
      updateBuyList: async (_s, id, p) => calls.push(["stocked", id, p]),
      removeStock: async (_s, id, q, r) => calls.push(["remove", q, r]),
      updateQuantity: async (_s, id, q) => calls.push(["absolute", q]),
    },
  };
  Object.assign(context, options.context ?? {});
  if (options.api) Object.assign(context.api, options.api);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  root = createRoot(document.getElementById("root"));
  t.after(async () => {
    await act(async () => root.unmount());
    client.clear();
  });
  await act(async () =>
    root.render(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(component, props),
      ),
    ),
  );
  await tick();
}
const field = (label) =>
  [...document.querySelectorAll("label")]
    .find((l) => l.textContent.includes(label))
    ?.querySelector("input,select");
async function fill(el, value) {
  assert(el);
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      el.tagName === "SELECT"
        ? window.HTMLSelectElement.prototype
        : window.HTMLInputElement.prototype,
      "value",
    ).set.call(el, value);
    el.dispatchEvent(
      new window.Event(el.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
  await tick();
}
const btn = (text) =>
  [...document.querySelectorAll("button")].find((b) =>
    b.textContent.includes(text),
  );
const click = async (b) => {
  assert(b);
  await act(async () => b.click());
  await tick();
};

test("catalogue search, category and deterministic stock ordering match the mobile choices", () => {
  const f = { q: "", category: "all", filter: "all", sort: "name" };
  assert.deepEqual(
    filterProducts(rows, { ...f, q: "aliasr" }).map((i) => i.productId),
    ["r"],
  );
  assert.deepEqual(
    filterProducts(rows, { ...f, q: "r" }).map((i) => i.productId),
    ["d", "r"],
  );
  assert.deepEqual(
    filterProducts(rows, { ...f, category: "services" }).map(
      (i) => i.productId,
    ),
    ["d"],
  );
  assert.deepEqual(
    filterProducts(rows, { ...f, filter: "out_of_stock" }).map(
      (i) => i.productId,
    ),
    ["o"],
  );
  assert.deepEqual(
    filterProducts(rows, { ...f, sort: "stock" }).map((i) => i.productId),
    ["o", "r", "s", "d"],
  );
  assert.equal(productExpiry("2026-11-10", Date.parse("2026-11-08")).days, 2);
  assert.equal(productExpiry("not-date"), null);
});
test("filters and local return links reject unknown sort and outside destinations", () => {
  assert.equal(
    productFilters(new URLSearchParams("sort=bad&filter=bad")).sort,
    "name",
  );
  assert.equal(
    productReturn("https://other.invalid/shop/products"),
    "/shop/products",
  );
  assert.match(
    productReturn("/shop/products?q=rice&sort=stock"),
    /q=rice.*sort=stock/,
  );
});
test("receive math preserves pack conversions, zero cost and strict input precision", () => {
  assert.deepEqual(receiveValues("2.5", "1200", 20, "pack", 40), {
    quantity: 50,
    purchasePrice: 60,
  });
  assert.deepEqual(receiveValues("1", "0", 20, "pack", 40), {
    quantity: 20,
    purchasePrice: 0,
  });
  assert.equal(receiveValues("1", "-1", 20, "pack"), null);
  assert.equal(receiveValues("1.2345", "", 20, "unit"), null);
  assert.equal(stockNumber("1e3"), null);
  assert.equal(stockNumber(""), null);
  assert.equal(stockNumber("0"), 0);
});
test("related products use strongest unique open evidence and omit archived or missing products", () => {
  const n = (id, p, s) => ({
    id,
    productId: p,
    kind: "attach",
    status: "open",
    evidence: { anchorProductId: "r", supportPct: s },
  });
  assert.deepEqual(
    productPairs(
      [
        n("1", "s", 20),
        n("2", "s", 50),
        n("3", "a", 99),
        n("4", "missing", 100),
      ],
      "r",
      rows,
    ).map((n) => n.id),
    ["2"],
  );
});
test("real catalogue preserves query/category/sort in detail links and bulk selection", async (t) => {
  await mount(
    t,
    ProductsScreen,
    {},
    { params: "q=Rice&category=staples&sort=recent" },
  );
  assert.equal(document.querySelectorAll(".products-row").length, 1);
  assert.match(
    document.querySelector(".products-row").href,
    /returnTo=.*sort%3Drecent/,
  );
  await click(btn("Select"));
  await click(btn("Select all matching"));
  assert.deepEqual(calls.find((c) => c[0] === "bulk")[1], {
    matching: {
      query: "Rice",
      filter: "all",
      category: "staples",
      nativeSearch: true,
    },
  });
});
test("catalogue distinguishes failed load from an empty result", async (t) => {
  await mount(
    t,
    ProductsScreen,
    {},
    {
      api: {
        getAllInventory: async () => {
          throw Error("Unavailable");
        },
      },
    },
  );
  assert.match(document.body.textContent, /Unavailable/);
  assert.equal(document.querySelector(".products-empty"), null);
});
test("Helper catalogue has no import, selection or bulk controls", async (t) => {
  await mount(
    t,
    ProductsScreen,
    {},
    {
      context: {
        hideCost: true,
        perms: { canEditProducts: false, canSell: true },
      },
    },
  );
  assert(!btn("Select"));
  assert(
    ![...document.querySelectorAll("a")].some((a) =>
      a.href.includes("/import"),
    ),
  );
});
test("receiving in packs sends batch metadata and then price/buy-list updates once", async (t) => {
  let done = 0;
  await mount(t, ProductStockEditor, {
    item: rows[0],
    mode: "batch",
    buyListItemId: "buy",
    onDone: async () => done++,
    onSell: () => {},
  });
  await fill(field("Quantity"), "2");
  await fill(field("Purchase Price"), "1200");
  await fill(field("Batch Number"), "B-99");
  await fill(field("New selling price"), "90");
  await click(btn("Confirm stock received"));
  assert.deepEqual(
    calls
      .filter((c) => ["batch", "price", "stocked"].includes(c[0]))
      .map((c) => c[0]),
    ["batch", "price", "stocked"],
  );
  assert.equal(calls[0][2].quantity, 40);
  assert.equal(calls[0][2].purchasePrice, 60);
  assert.equal(calls[0][2].batchNumber, "B-99");
  assert.equal(done, 1);
});
test("a failed follow-up retries only remaining work, never the known received stock", async (t) => {
  let fail = true;
  await mount(
    t,
    ProductStockEditor,
    { item: rows[0], mode: "batch", onDone: async () => {}, onSell: () => {} },
    {
      api: {
        updateProduct: async () => {
          calls.push(["price"]);
          if (fail) throw Error("Price update failed");
        },
      },
    },
  );
  await fill(field("Quantity"), "1");
  await fill(field("New selling price"), "90");
  await click(btn("Confirm stock received"));
  assert.match(document.body.textContent, /Stock has been received/);
  fail = false;
  await click(btn("Finish remaining updates"));
  assert.equal(calls.filter((c) => c[0] === "batch").length, 1);
  assert.equal(calls.filter((c) => c[0] === "price").length, 2);
});
test("uncertain receipt prevents a blind repeat and invalid quantities never submit", async (t) => {
  await mount(
    t,
    ProductStockEditor,
    { item: rows[0], mode: "batch", onDone: async () => {}, onSell: () => {} },
    {
      api: {
        addBatch: async () => {
          calls.push(["batch"]);
          throw Error("Timeout");
        },
      },
    },
  );
  await fill(field("Quantity"), "1e2");
  assert(btn("Confirm stock received").disabled);
  await fill(field("Quantity"), "1");
  await click(btn("Confirm stock received"));
  assert(btn("Confirm stock received").disabled);
  assert.match(document.body.textContent, /Refresh and check stock/);
  assert.equal(calls.filter((c) => c[0] === "batch").length, 1);
});
test("removal requires a reason and bounded quantity; absolute zero is valid for managers", async (t) => {
  await mount(t, ProductStockEditor, {
    item: rows[0],
    mode: "adjust",
    onDone: async () => {},
    onSell: () => {},
  });
  await fill(field("Remove from stock"), "5");
  await fill(field("Why?"), "damaged");
  assert(btn("Remove 5").disabled);
  await fill(field("Remove from stock"), "0.5");
  assert(!btn("Remove 0.5").disabled);
  await fill(field("Counted quantity"), "0");
  await click(btn("Save"));
  assert(calls.some((c) => c[0] === "absolute" && c[1] === 0));
});
test("offline receiving is disabled", async (t) => {
  await mount(
    t,
    ProductStockEditor,
    { item: rows[0], mode: "batch", onDone: async () => {}, onSell: () => {} },
    { context: { offline: true } },
  );
  assert(btn("Confirm stock received").disabled);
});
test("batch edits send supported metadata and never an ignored quantity patch", async (t) => {
  await mount(t, ProductBatchEditor, {
    batch: { id: "b", quantity: 8, purchasePrice: 50 },
    disabled: false,
    onSave: async (body) => calls.push(["edit", body]),
  });
  assert(!field("Quantity"));
  await fill(field("Batch Number"), "B-2");
  await click(btn("Save batch details"));
  assert.deepEqual(calls[0], ["edit", { batchNumber: "B-2" }]);
  assert.match(document.body.textContent, /Use Adjust stock/);
});
test("details suppress sparse stock-cover predictions and preserve the list return context", async (t) => {
  await mount(
    t,
    ProductDetailScreen,
    { productId: "r" },
    { params: "returnTo=%2Fshop%2Fproducts%3Fq%3Drice%26sort%3Dstock" },
  );
  assert(document.querySelector('a[href*="q=rice"]'));
  assert.doesNotMatch(document.body.textContent, /≈ 60/);
  assert.match(
    document.body.textContent,
    /More sales|Not enough|enough sales/i,
  );
});
test("Helper detail hides costs, reports and product management while allowing explicit stock removal", async (t) => {
  await mount(
    t,
    ProductDetailScreen,
    { productId: "r" },
    {
      context: {
        hideCost: true,
        perms: {
          canEditProducts: false,
          canAdjustStock: true,
          canSell: true,
          canSeeReports: false,
        },
      },
    },
  );
  assert(!btn("Add stock"));
  assert(btn("Adjust stock"));
  assert(!document.body.textContent.includes("Margin"));
  assert(!document.body.textContent.includes("Manage product"));
  assert(!document.body.textContent.includes("₹50.00"));
});
