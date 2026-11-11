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
  url: "https://fixture.invalid/shop/sales",
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
const React = require("react"),
  { act } = React,
  { createRoot } = require("react-dom/client"),
  { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const { EN_FALLBACK } = require("../app/lib/shop/en-fallback.ts");
const copy = {
  ...EN_FALLBACK,
  ...require("../app/lib/shop/gst-web-locales.json").en,
};
let context,
  calls,
  retained = [],
  storageError = false,
  returnError = false,
  filters,
  rootComponent;
const plain =
  (tag) =>
  ({ children, ...p }) =>
    React.createElement(tag, p, children);
const button = ({
  children,
  onClick,
  disabled,
  href,
  type = "button",
  className,
}) =>
  React.createElement(
    href ? "a" : "button",
    { href, onClick, disabled, type, className },
    children,
  );
let searchQuery = "returnTo=%2Fshop%2Fsales%3Fperiod%3D7d";
const original = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/link") return { __esModule: true, default: plain("a") };
  if (request === "next/navigation")
    return {
      useSearchParams: () => new URLSearchParams(searchQuery),
      useRouter: () => ({ replace: (url) => calls.push(["navigate", url]) }),
    };
  const file =
    request.startsWith(".") && parent
      ? path.resolve(path.dirname(parent.filename), request)
      : "";
  if (file.endsWith("/shop/context")) return { useShop: () => context };
  if (file.endsWith("/shop/cart"))
    return { useCart: () => ({ pending: null }) };
  if (file.endsWith("/shop/counter-filters"))
    return {
      useCounterFilters: () => ({
        filters,
        params: require("../app/lib/shop/counter/query.ts").counterQuery(
          filters,
        ),
        href: "/shop/sales?period=7d",
        change: () => {},
      }),
      CounterFiltersView: () => null,
      CounterNotice: ({ error }) =>
        error
          ? React.createElement("p", { role: "alert" }, error.message)
          : null,
    };
  if (file.endsWith("/shop/gst-storage"))
    return {
      financialScope: () => ({}),
      assertScope() {},
      retainedRequests: async () => {
        if (storageError) throw Error("storage failed");
        return retained;
      },
    };
  if (file.endsWith("/shop/gst-recovery"))
    return {
      recoverFinancialRequest: async (_api, _shop, row) => {
        calls.push(["recover", structuredClone(row)]);
        retained = [];
      },
    };
  if (file.endsWith("/shop/gst-ui"))
    return { useGstText: () => (s) => s, useFiscalDate: () => (s) => s };
  if (file.endsWith("/shop/product-image"))
    return {
      ProductImageById: () =>
        React.createElement("span", { "data-current-photo": true }),
    };
  if (file.endsWith("/shop/document-preview"))
    return {
      IssuedDocumentButton: () =>
        React.createElement("button", null, "Verified document"),
    };
  if (file.endsWith("/shop/gst-documents"))
    return {
      GstDocuments: () =>
        React.createElement("div", null, "Verified fiscal documents"),
    };
  if (file.endsWith("/shop/gst-sale-adjustments"))
    return {
      GstSaleAdjustments: () =>
        React.createElement("div", null, "Verified fiscal adjustments"),
    };
  if (file.endsWith("/shop/sale-adjustment-history"))
    return { SaleAdjustmentHistory: () => null };
  if (file.endsWith("/shop/share-bill"))
    return {
      billPlainText: (p) => "Bill #" + p.saleNumber,
      shareBill: async (p) => {
        calls.push(["share", p]);
        return "downloaded";
      },
    };
  if (file.endsWith("/shop/ui"))
    return {
      Button: button,
      Card: plain("section"),
      Field: ({ children, label, hint }) =>
        React.createElement("label", null, label, children, hint),
      Notice: ({ error }) =>
        error
          ? React.createElement("p", { role: "alert" }, error.message)
          : null,
      PageHeader: ({ title, back, actions, description }) =>
        React.createElement(
          "header",
          null,
          back
            ? React.createElement("a", { href: back.href }, back.label)
            : null,
          React.createElement("h1", null, title),
          description,
          actions,
        ),
      Pill: plain("span"),
      Spinner: ({ label }) => React.createElement("p", null, label),
      NoAccess: () => React.createElement("p", null, "No access"),
      PremiumLock: () => null,
      isDenied: (e) => e?.status === 403,
      isPremiumError: () => false,
      inputClass: "input",
    };
  return original.call(this, request, parent, isMain);
};
const { SalesScreen } = require("../app/components/shop/screens/sales.tsx"),
  {
    SaleDetailScreen,
  } = require("../app/components/shop/screens/sale-detail.tsx"),
  {
    SaleReturnEditor,
  } = require("../app/components/shop/sale-return-editor.tsx");
Module._load = original;
const {
    salesSummaryParams,
    salesRangeReady,
    salesVoidAllowed,
    ordinaryReturnPlan,
  } = require("../app/lib/shop/sales.ts"),
  { verifiedSaleBalance } = require("../app/lib/shop/sale-balance.ts"),
  { permissionsFor } = require("../app/lib/shop/permissions.ts");
function sale(overrides = {}) {
  return {
    id: "sale-1",
    shopId: "shop-1",
    saleNumber: 42,
    soldAt: new Date().toISOString(),
    status: "completed",
    customerId: null,
    customer: null,
    total: 200,
    subtotal: 200,
    discountAmount: 0,
    creditTotal: 0,
    paidTotal: 200,
    showCost: true,
    costTotal: 100,
    collection: {
      status: "paid",
      remainingCredit: "0.00",
      allocatedCollections: "0.00",
      creditReduced: "0.00",
    },
    items: [
      {
        id: "line-1",
        productId: "product-1",
        name: "Rice",
        unit: "kg",
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
        discountAmount: 0,
        returnedQuantity: 0,
        costTotal: 100,
        batches: [
          {
            batchId: "batch",
            batchNumber: "ABC",
            quantity: 2,
            purchasePrice: 50,
            supplier: "Fixture supplier",
          },
        ],
      },
    ],
    payments: [
      {
        id: "pay",
        method: "cash",
        kind: "payment",
        amount: 200,
        tendered: 500,
        changeGiven: 300,
      },
    ],
    returns: [],
    ...overrides,
  };
}
function balance() {
  return {
    saleId: "sale-1",
    customerId: "customer-1",
    originalCredit: "100.00",
    originalPaid: "100.00",
    allocatedCollections: "20.00",
    creditReduced: "0.00",
    moneyRefunded: "0.00",
    unpaidCredit: "80.00",
    refundableMoney: "120.00",
    remainingGross: "200.00",
    unassignedCollections: "0.00",
    status: "ready",
  };
}
function setup(options = {}) {
  calls = [];
  retained = [];
  storageError = false;
  returnError = false;
  filters = {
    period: "7d",
    from: "",
    to: "",
    q: "Rice",
    status: "completed",
    desk: "all",
    method: "cash",
  };
  const bill = sale(options);
  context = {
    shop: { id: "shop-1", name: "Fixture" },
    userId: "owner",
    perms: permissionsFor("OWNER"),
    premium: true,
    offline: false,
    hideCost: false,
    prefs: { appLanguage: "en" },
    t: (k, f, v) =>
      Object.entries(v ?? {}).reduce(
        (s, [key, x]) => s.replaceAll("{{" + key + "}}", String(x)),
        copy[k] ?? f,
      ),
    setNotice() {},
    api: {
      assertSession() {},
      getPosSettings: async () => ({ voidWindowHours: 24 }),
      getSale: async () => bill,
      getSales: async (_s, p) => {
        calls.push(["list", p]);
        return {
          sales: [
            {
              ...bill,
              firstItem: "Rice",
              itemCount: 1,
              methods: ["cash"],
              returnCount: 0,
            },
          ],
          total: 1,
          nextCursor: null,
        };
      },
      getSalesSummary: async (_s, p) => {
        calls.push(["summary", p]);
        return { bills: 1, revenue: 200, avgBill: 200, returns: 0 };
      },
      voidSale: async (...args) => {
        calls.push(["void", args]);
        return bill;
      },
      gst: {
        returnCapacity: async () => balance(),
        returnSale: async (_s, _id, body, total) => {
          calls.push(["return", structuredClone(body), total]);
          if (returnError) {
            retained = [
              {
                state: "pending",
                path: "/api/shops/shop-1/sales/sale-1/returns",
                body: structuredClone(body),
                total,
              },
            ];
            throw Error("Synthetic response lost");
          }
          return bill;
        },
      },
    },
  };
  return bill;
}
const settle = async (ms = 40) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
async function mount(t, element) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  document.body.innerHTML = '<div id="root"></div>';
  const root = createRoot(document.getElementById("root"));
  await act(async () =>
    root.render(React.createElement(QueryClientProvider, { client }, element)),
  );
  await settle(80);
  t.after(async () => {
    await act(async () => root.unmount());
    client.clear();
  });
  return client;
}
const btn = (text) =>
  [...document.querySelectorAll("button")].find(
    (e) => e.textContent.trim() === text,
  );
async function click(el) {
  assert(el);
  await act(async () => el.click());
  await settle();
}
async function fill(el, value) {
  assert(el);
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(el, value);
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  await settle();
}
const returnButton = () =>
  document.querySelector(".sale-return-editor fieldset>button");

test("summary queries only period, and custom range requires ordered dates", () => {
  const f = { period: "7d", q: "Rice", status: "voided", method: "upi" };
  assert.deepEqual(salesSummaryParams(f), { period: "7d" });
  assert.equal(
    salesRangeReady({
      ...f,
      period: "custom",
      from: "2026-11-08",
      to: "2026-11-07",
    }),
    false,
  );
  assert.deepEqual(
    salesSummaryParams({
      ...f,
      period: "custom",
      from: "2026-11-01",
      to: "2026-11-08",
    }),
    { from: "2026-11-01", to: "2026-11-08" },
  );
});
test("ledger keeps server filters and return link while summary stays period-wide", async (t) => {
  setup();
  await mount(t, React.createElement(SalesScreen));
  assert.deepEqual(calls.find((c) => c[0] === "summary")[1], { period: "7d" });
  assert.equal(calls.find((c) => c[0] === "list")[1].q, "Rice");
  assert(
    document
      .querySelector(".sales-entry")
      .href.includes("returnTo=%2Fshop%2Fsales%3Fperiod%3D7d"),
  );
  assert(
    document
      .querySelector(".sales-period")
      .textContent.includes("Period totals include all bills"),
  );
});
test("invalid custom range never requests ledger or totals", async (t) => {
  setup();
  filters = {
    ...filters,
    period: "custom",
    from: "2026-11-08",
    to: "2026-11-01",
  };
  await mount(t, React.createElement(SalesScreen));
  assert(!calls.some((c) => c[0] === "summary" || c[0] === "list"));
});
test("helper cannot see export or refunds links", async (t) => {
  setup();
  context.perms = permissionsFor("HELPER");
  await mount(t, React.createElement(SalesScreen));
  assert(
    ![...document.querySelectorAll("a")].some((e) =>
      e.href.includes("/refunds"),
    ),
  );
  assert(!document.body.textContent.includes(copy["counter.export_register"]));
});
test("missing settings, expired window and fiscal bills cannot be voided", () => {
  const bill = sale();
  assert.equal(salesVoidAllowed(bill, undefined), false);
  assert.equal(salesVoidAllowed({ ...bill, soldAt: "2020-01-01" }, 24), false);
  assert.equal(salesVoidAllowed({ ...bill, gstSnapshot: {} }, 24), false);
  assert.equal(salesVoidAllowed(bill, 24), true);
});
test("bill details show current photos outside the printable receipt and payment change", async (t) => {
  setup();
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  assert(document.querySelector(".sale-detail-items [data-current-photo]"));
  assert(!document.querySelector(".receipt [data-current-photo]"));
  assert(
    document
      .querySelector(".sale-detail-payments")
      .textContent.includes("₹300.00"),
  );
  assert(
    document.querySelector(".sale-provenance").textContent.includes("ABC"),
  );
});
test("a just-recorded bill leads with the paid amount and the next sale, not audit detail", async (t) => {
  setup({ customer: { id: "customer-1", name: "Asha", phone: "9876543210" } });
  searchQuery = "recorded=new";
  t.after(() => {
    searchQuery = "returnTo=%2Fshop%2Fsales%3Fperiod%3D7d";
  });
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  const success = document.querySelector(".sale-success");
  assert(success);
  assert.match(success.querySelector("h2").textContent, /^Paid /);
  assert.equal(document.activeElement, success.querySelector('a[href="/shop/sell"]'));
  assert(![...document.querySelectorAll("button")].some((b) => b.textContent === "Refresh"));
  assert(!document.querySelector(".sale-provenance"));
  assert(!document.body.textContent.includes("Cost & margin"));
  let opened = null;
  window.open = (url) => {
    opened = url;
    return {};
  };
  await click([...success.querySelectorAll("button")].find((b) => b.textContent.includes("WhatsApp")));
  assert(opened.startsWith("https://wa.me/919876543210?text="));
});
test("helper never sees costs, customer account or management actions", async (t) => {
  setup({
    customerId: "customer-1",
    customer: { id: "customer-1", name: "Asha" },
  });
  context.perms = permissionsFor("HELPER");
  context.hideCost = true;
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  assert(!document.querySelector(".sale-management"));
  assert(!document.body.textContent.includes("Cost & margin"));
  assert(!document.querySelector('a[href="/shop/customers/customer-1"]'));
  assert(!document.querySelector(".receipt-cost"));
});
test("void requires explicit confirmation and remains blocked offline", async (t) => {
  setup();
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  const area = document.querySelector(".sale-void"),
    confirm = area.querySelector("button");
  assert(confirm.disabled);
  await click(area.querySelector("input[type=checkbox]"));
  assert.equal(confirm.disabled, false);
  await click(confirm);
  assert.equal(calls.filter((c) => c[0] === "void").length, 1);
});
test("void is hidden when its window cannot be checked, and blocked offline", async (t) => {
  setup();
  context.api.getPosSettings = async () => {
    throw Error("settings unavailable");
  };
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  assert.equal(document.querySelector(".sale-void"), null);
});
test("void stays blocked offline even inside its window", async (t) => {
  setup();
  context.offline = true;
  await mount(t, React.createElement(SaleDetailScreen, { saleId: "sale-1" }));
  await click(document.querySelector(".sale-void input[type=checkbox]"));
  assert(document.querySelector(".sale-void button").disabled);
  assert(!calls.some((c) => c[0] === "void"));
});
test("ordinary return validates exact quantities, availability and decimal money", () => {
  const bill = sale();
  for (const value of ["1e0", "-1", "2.001", "1.0001"])
    assert.throws(() => ordinaryReturnPlan(bill, { "line-1": value }, {}, ""));
  assert.throws(() => ordinaryReturnPlan(bill, { "line-1": "1" }, {}, "1e2"));
  assert.deepEqual(
    ordinaryReturnPlan(bill, { "line-1": "0.5" }, { "line-1": false }, "45.25"),
    {
      items: [{ saleItemId: "line-1", quantity: 0.5, restock: false }],
      total: 45.25,
      refundAmount: 45.25,
    },
  );
  assert.throws(() =>
    ordinaryReturnPlan(
      { ...bill, returnPlanningError: "review" },
      { "line-1": "1" },
      {},
      "",
    ),
  );
});
test("return payload includes per-item restock and reviewed override", async (t) => {
  const bill = setup();
  await mount(
    t,
    React.createElement(SaleReturnEditor, {
      sale: bill,
      onDone: async () => {},
    }),
  );
  await fill(
    document.querySelector(".sale-return-line input[inputmode]"),
    "0.5",
  );
  await click(document.querySelector(".sale-return-line input[type=checkbox]"));
  await fill(
    document.querySelector(".sale-return-editor fieldset>label input"),
    "45.25",
  );
  assert.equal(returnButton().disabled, false);
  await click(returnButton());
  const sent = calls.find((c) => c[0] === "return");
  assert.equal(sent[1].items[0].restock, false);
  assert.equal(sent[1].refundAmount, 45.25);
  assert.equal(sent[2], 45.25);
});
test("return steppers stay between nothing and what is left, with one tap for all", async (t) => {
  const bill = setup();
  await mount(
    t,
    React.createElement(SaleReturnEditor, {
      sale: bill,
      onDone: async () => {},
    }),
  );
  const quantity = document.querySelector(".sale-return-line input[inputmode]");
  const [less, more, all] = document.querySelectorAll(".sale-return-stepper button");
  assert(less.disabled);
  assert(returnButton().disabled);
  await click(more);
  assert.equal(quantity.value, "0.25");
  assert.equal(returnButton().disabled, false);
  await click(all);
  assert.equal(quantity.value, "2");
  assert(more.disabled);
  await fill(quantity, "0.25");
  await click(less);
  assert.equal(quantity.value, "");
  assert(returnButton().disabled);
});
test("credit balance must match invoice identity and reconcile allocated money", () => {
  const bill = sale({
    customerId: "customer-1",
    creditTotal: 100,
    paidTotal: 100,
  });
  assert.equal(verifiedSaleBalance(balance(), bill).unpaidCredit, "80.00");
  assert.throws(() =>
    verifiedSaleBalance({ ...balance(), saleId: "other" }, bill),
  );
  assert.throws(() =>
    verifiedSaleBalance({ ...balance(), unpaidCredit: "100.00" }, bill),
  );
});
test("credit return blocks unverified allocation and requires evidence for money refund", async (t) => {
  const bill = setup({
    customerId: "customer-1",
    creditTotal: 100,
    paidTotal: 100,
  });
  await mount(
    t,
    React.createElement(SaleReturnEditor, {
      sale: bill,
      onDone: async () => {},
    }),
  );
  await fill(document.querySelector(".sale-return-line input[inputmode]"), "1");
  const fields = document.querySelectorAll(".sale-credit-return input");
  await fill(fields[0], "80");
  assert(returnButton().disabled);
  await fill(fields[1], "SYNTHETIC-REFUND");
  assert.equal(returnButton().disabled, false);
  await click(returnButton());
  assert.deepEqual(calls.find((c) => c[0] === "return")[1].settlement, {
    creditReduction: 80,
    moneyRefund: 20,
    method: "cash",
    evidenceReference: "SYNTHETIC-REFUND",
  });
});
test("uncertain return locks editing and recovers the identical retained payload", async (t) => {
  const bill = setup();
  returnError = true;
  await mount(
    t,
    React.createElement(SaleReturnEditor, {
      sale: bill,
      onDone: async () => {},
    }),
  );
  await fill(document.querySelector(".sale-return-line input[inputmode]"), "1");
  await click(returnButton());
  assert(document.querySelector("fieldset").disabled);
  const sent = calls.find((c) => c[0] === "return")[1];
  await click(btn(copy["purchase.retry"]));
  assert.deepEqual(calls.find((c) => c[0] === "recover")[1].body, sent);
  assert.equal(calls.filter((c) => c[0] === "return").length, 1);
});
test("local recovery storage failure disables new returns", async (t) => {
  const bill = setup();
  storageError = true;
  await mount(
    t,
    React.createElement(SaleReturnEditor, {
      sale: bill,
      onDone: async () => {},
    }),
  );
  assert(document.querySelector("fieldset").disabled);
  assert(returnButton().disabled);
  assert(document.querySelector("[role=alert]"));
});

test("ledger follows the server cursor without losing filters", async (t) => {
  setup();
  context.api.getSales = async (_s, p) => {
    calls.push(["list", p]);
    return {
      sales: [
        {
          ...sale(),
          id: p.cursor ? "sale-2" : "sale-1",
          firstItem: "Rice",
          itemCount: 1,
          methods: ["cash"],
          returnCount: 0,
        },
      ],
      total: 2,
      nextCursor: p.cursor ? null : "opaque-cursor",
    };
  };
  await mount(t, React.createElement(SalesScreen));
  await click(btn(copy["counter.more"]));
  assert.equal(document.querySelectorAll(".sales-entry").length, 2);
  assert.equal(
    calls.filter((c) => c[0] === "list").at(-1)[1].cursor,
    "opaque-cursor",
  );
  assert.equal(calls.filter((c) => c[0] === "list").at(-1)[1].q, "Rice");
});

// Exercise the real fiscal editor's changed selection/restock controls; tax
// calculation and retained outcome verification are covered by test:gst.
let FiscalEditor;
function loadFiscalEditor() {
  if (FiscalEditor) return FiscalEditor;
  Module._load = function (request, parent, isMain) {
    const file =
      request.startsWith(".") && parent
        ? path.resolve(path.dirname(parent.filename), request)
        : "";
    if (file.endsWith("/shop/context")) return { useShop: () => context };
    if (file.endsWith("/shop/product-image"))
      return { ProductImageById: () => null };
    if (file.endsWith("/shop/gst-ui"))
      return {
        useGstText: () => (s) => s,
        Section: ({ children, title }) =>
          React.createElement("section", null, title, children),
        TextField: ({ label, value, onChange }) =>
          React.createElement(
            "label",
            null,
            label,
            React.createElement("input", {
              value,
              onChange: (e) => onChange(e.target.value),
            }),
          ),
        SelectField: () => null,
        Check: ({ label, checked, onChange }) =>
          React.createElement(
            "label",
            null,
            React.createElement("input", {
              type: "checkbox",
              checked,
              onChange: (e) => onChange(e.target.checked),
            }),
            label,
          ),
        Stats: () => null,
      };
    if (file.endsWith("/shop/gst-workspace"))
      return {
        useGstQuery: () => ({
          data: {
            status: "ready",
            unpaidCredit: "0.00",
            refundableMoney: "200.00",
          },
          isError: false,
        }),
        useGstAction: () => ({ busy: false, run: (fn) => fn(), notice: null }),
        ReadState: ({ children }) => children,
      };
    if (file.endsWith("/shop/ui"))
      return { Button: button, Card: plain("section"), Pill: plain("span") };
    return original.call(this, request, parent, isMain);
  };
  FiscalEditor =
    require("../app/components/shop/gst-sale-adjustments.tsx").GstSaleAdjustments;
  Module._load = original;
  return FiscalEditor;
}
test("GST return keeps line restock choice, blocks over-return and refreshes after recording", async (t) => {
  const bill = setup();
  bill.gstIntegrity = "verified";
  bill.gstSnapshot = { context: { priceMode: "inclusive" } };
  bill.items[0].taxSnapshot = {
    category: "exempt",
    codeType: "hsn",
    code: "1006",
    rate: 0,
    gross: 200,
    discount: 0,
    billDiscount: 0,
    net: 200,
    taxable: 0,
    cgst: 0,
    sgst: 0,
    utgst: 0,
    igst: 0,
    tax: 0,
    total: 200,
  };
  let refreshed = 0;
  await mount(
    t,
    React.createElement(loadFiscalEditor(), {
      sale: bill,
      onDone: async () => {
        refreshed++;
      },
    }),
  );
  const inputs = [...document.querySelectorAll("input:not([type=checkbox])")],
    checkboxes = [...document.querySelectorAll("input[type=checkbox]")];
  await fill(inputs[0], "Damaged packet");
  await fill(inputs[1], "3");
  await fill(inputs.at(-1), "SYNTHETIC-REFUND");
  await click(checkboxes.at(-1));
  assert(btn("Record reviewed adjustment").disabled);
  await fill(inputs[1], "1");
  await click(checkboxes[0]);
  await click(checkboxes.at(-1));
  assert.equal(btn("Record reviewed adjustment").disabled, false);
  await click(btn("Record reviewed adjustment"));
  assert.equal(calls.find((c) => c[0] === "return")[1].items[0].restock, false);
  assert.equal(refreshed, 1);
});
