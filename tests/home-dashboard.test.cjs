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
  url: "https://fixture.invalid/shop",
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react"),
  { act } = React,
  { createRoot } = require("react-dom/client"),
  { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const { permissionsFor } = require("../app/lib/shop/permissions.ts");
const {
  searchHomeCatalog,
  homeTrialNotice,
  homeNudgeLink,
  homeBillProductId,
} = require("../app/lib/shop/home.ts");
let context, reads, calls, notice;
let imageObservers = [];
global.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) { this.target = target; imageObservers.push(this); }
  disconnect() { imageObservers = imageObservers.filter((value) => value !== this); }
};
const shell = ({ children }) => React.createElement("div", null, children),
  link = ({ children, href, ...p }) =>
    React.createElement("a", { href, ...p }, children);
const ui = {
  Card: shell,
  Glyph: () => null,
  Pill: shell,
  SectionHead: ({ title }) => React.createElement("h2", null, title),
  Notice: ({ error }) =>
    error ? React.createElement("p", { role: "alert" }, error.message) : null,
  Spinner: ({ label }) => React.createElement("p", { role: "status" }, label),
  PremiumLock: () => React.createElement("p", null, "Premium"),
  isPremiumError: (error) => error?.status === 402 || error?.code === "premium_required",
  Button: ({ children, onClick, disabled, href }) =>
    href
      ? React.createElement("a", { href }, children)
      : React.createElement("button", { onClick, disabled }, children),
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/link") return { __esModule: true, default: link };
  if (request === "next/navigation")
    return {
      useRouter: () => ({ push: (url) => calls.push(["navigate", url]) }),
    };
  const file =
    request.startsWith(".") && parent
      ? path.resolve(path.dirname(parent.filename), request)
      : "";
  if (file.endsWith("/shop/context")) return { useShop: () => context };
  if (file.endsWith("/shop/gst-ui"))
    return { useGstText: () => (value) => value };
  if (file.endsWith("/shop/ui")) return ui;
  if (file.endsWith("/shop/product-image")) return {
    ProductImage: () => null,
    ProductImageById: ({ productId, name }) => React.createElement("span", {
      "data-product-photo": productId ?? "fallback",
      "aria-hidden": true,
    }, name.charAt(0)),
  };
  if (file.endsWith("/shop/counter-scanner"))
    return {
      CounterCamera: ({ onCode }) =>
        React.createElement(
          "button",
          { onClick: () => onCode("ALT-001") },
          "Synthetic barcode",
        ),
    };
  if (file.endsWith("/shop/voice-sheet"))
    return {
      VoiceSheet: ({ children, title, onClose }) =>
        React.createElement(
          "div",
          { role: "dialog" },
          title,
          children,
          React.createElement("button", { onClick: onClose }, "Close dialog"),
        ),
    };
  if (file.endsWith("/shop/use-shop-dates"))
    return { useShopDates: () => ({ formatTime: () => "10:30" }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { HomeScreen } = require("../app/components/shop/screens/home.tsx");
Module._load = originalLoad;
const item = {
  id: "i1",
  productId: "p1",
  quantity: 2,
  unit: "kg",
  stockStatus: "LOW",
  product: {
    name: "Basmati rice",
    shortCode: "R1",
    barcode: "89001",
    barcodeAliases: ["ALT-001"],
    isActive: true,
    sellingPrice: 50,
    trackStock: true,
    minStockLevel: 5,
  },
};
const bill = {
  id: "b1",
  saleNumber: 18,
  firstItem: "Rice",
  itemCount: 1,
  total: 100,
  methods: ["cash"],
  status: "completed",
  soldAt: "2026-11-07T04:30:00Z",
};
const nudge = (type, params = {}) => ({
  id: "n1",
  kind: "margin",
  status: "open",
  title: "Review rice",
  body: "Synthetic suggestion",
  action: { type, params },
  productId: "p1",
  customerId: null,
});
function setup(role = "OWNER") {
  calls = [];
  imageObservers = [];
  notice = null;
  reads = {
    catalog: [item],
    stats: { total: 1, lowStock: 1, outOfStock: 0, nearExpiry: 0 },
    sales: { sales: [bill] },
    sale: { id: "b1", shopId: "s1", items: [{ name: "Rice", productId: "p1" }] },
    summary: {
      revenue: 100,
      bills: 1,
      avgBill: 100,
      discounts: 0,
      byMethod: { cash: 100 },
      udhaar: null,
    },
    brief: { today: null, items: [] },
    nudges: { nudges: [] },
    search: { sales: [], customers: [], suppliers: [] },
    demand: { terms: [] },
  };
  const read = async (k) => {
    calls.push(["read", k]);
    const value = reads[k];
    if (value instanceof Error) throw value;
    return typeof value === "function" ? value() : value;
  };
  const api = {
    openings: { metadata: async () => ({ setup: "completed" }) },
    getInventoryStats: () => read("stats"),
    getAllInventory: () => read("catalog"),
    getSalesSummary: () => read("summary"),
    getSales: () => read("sales"),
    getSale: () => read("sale"),
    getBrief: (shop, language) => { calls.push(["brief-language", shop, language]); return read("brief"); },
    getNudges: () => read("nudges"),
    getAlerts: async () => ({ counts: { total: 0 } }),
    getStreak: async () => ({ current: 2, lastActiveAt: null, activeToday: true }),
    getStockMoved: async () => ({ amount: 100, currency: "INR", period: "month", itemCount: 1, removeCount: 1 }),
    getCustomerSummary: async () => ({ customerCount: 2 }),
    search: () => read("search"),
    getDemandTerms: () => read("demand"),
    postDemand: async (s, q) => {
      calls.push(["demand", s, q]);
      if (reads.postError) throw reads.postError;
      return { ok: true };
    },
    nudgeEvent: async (s, id, e) => calls.push(["event", e]),
    actNudge: async (s, id, body) => {
      calls.push(["act", body]);
      return { ok: true };
    },
    lookupBarcode: async () => ({ found: true, item }),
  };
  context = {
    api,
    shop: { id: "s1", name: "Fixture shop" },
    userId: "u1",
    role,
    perms: permissionsFor(role),
    premium: true,
    offline: false,
    entitlement: null,
    prefs: { appLanguage: "en" },
    setNotice: (v) => {
      notice = v;
    },
    t: (k, f, v) =>
      Object.entries(v ?? {}).reduce(
        (s, [k, x]) => s.replaceAll("{{" + k + "}}", String(x)),
        f,
      ),
  };
}
const settle = async (ms = 20) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
async function mount(t) {
  document.body.innerHTML = '<div id="root"></div>';
  const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    }),
    root = createRoot(document.getElementById("root"));
  await act(async () =>
    root.render(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(HomeScreen),
      ),
    ),
  );
  await settle();
  t.after(async () => {
    await act(async () => root.unmount());
    client.clear();
  });
  return { client, root };
}
const button = (text) =>
  [...document.querySelectorAll("button")].find((b) => b.textContent === text);
async function fill(value) {
  await act(async () => {
    const input = document.querySelector("input[type=search]");
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  await settle(330);
  await settle();
}

test("bill thumbnails use the billed identity and fall back for ambiguous or deleted items", () => {
  const rice = { name: "Rice", productId: "p1" };
  assert.equal(homeBillProductId([{ name: "Oil", productId: "p2" }, rice], "Rice"), "p1");
  assert.equal(homeBillProductId([rice, rice], "Rice"), "p1");
  assert.equal(homeBillProductId([rice, { ...rice, productId: "p2" }], "Rice"), null);
  assert.equal(homeBillProductId([rice, { ...rice, productId: null }], "Rice"), null);
  assert.equal(homeBillProductId([{ ...rice, productId: null }], "Rice"), null);
  assert.equal(homeBillProductId([rice], "Renamed rice"), null);
});
test("recent bill thumbnails load only near the viewport and retain the bill number", async (t) => {
  setup();
  await mount(t);
  assert.equal(document.querySelector("[data-product-photo]").dataset.productPhoto, "fallback");
  assert.equal(calls.some((call) => call[1] === "sale"), false);
  await act(async () => imageObservers.slice().forEach((observer) => observer.callback([{ isIntersecting: true, target: observer.target }])));
  await settle();
  assert.equal(document.querySelector("[data-product-photo]").dataset.productPhoto, "p1");
  assert.match(document.querySelector(".home-ledger-list").textContent, /#18 · 10:30/);
});
test("offline recent bills keep their image slot without requesting details", async (t) => {
  setup();
  context.offline = true;
  await mount(t);
  await act(async () => imageObservers.slice().forEach((observer) => observer.callback([{ isIntersecting: true, target: observer.target }])));
  await settle();
  assert.equal(document.querySelector("[data-product-photo]").dataset.productPhoto, "fallback");
  assert.equal(calls.some((call) => call[1] === "sale"), false);
});
test("a failed bill detail request leaves a stable thumbnail fallback", async (t) => {
  setup();
  reads.sale = new Error("Synthetic unavailable bill");
  await mount(t);
  await act(async () => imageObservers.slice().forEach((observer) => observer.callback([{ isIntersecting: true, target: observer.target }])));
  await settle();
  assert.equal(document.querySelector("[data-product-photo]").dataset.productPhoto, "fallback");
  assert.match(document.querySelector(".home-ledger-list").textContent, /#18/);
});

test("home searches short codes and barcode aliases ahead of name matches and excludes inactive items", () => {
  const inactive = {
    ...item,
    id: "dead",
    product: { ...item.product, isActive: false },
  };
  assert.equal(searchHomeCatalog([inactive, item], "ALT-001")[0].id, "i1");
  assert.equal(searchHomeCatalog([item], "R1")[0].id, "i1");
  assert.equal(searchHomeCatalog([item], "rice")[0].id, "i1");
  assert.equal(searchHomeCatalog([inactive], "rice").length, 0);
});
test("trial warning is restricted to the last three automatic-trial days and seven days after expiry", () => {
  const now = Date.parse("2026-11-07T00:00:00Z"),
    ent = { status: "trialing", trialSource: "auto", daysLeftInTrial: 2 };
  assert.deepEqual(homeTrialNotice(ent, now), { ending: true, days: 2 });
  assert.equal(homeTrialNotice({ ...ent, daysLeftInTrial: 4 }, now), null);
  assert.equal(homeTrialNotice({ ...ent, trialSource: "razorpay" }, now), null);
  assert.equal(homeTrialNotice({ ...ent, temporaryPremium: true }, now), null);
  assert.deepEqual(
    homeTrialNotice({ status: "expired", trialEnd: "2026-11-06" }, now),
    { ending: false, days: 0 },
  );
  assert.equal(
    homeTrialNotice({ status: "expired", trialEnd: "2026-10-30" }, now),
    null,
  );
});
test("navigational suggestions open the appropriate workflow without implying a cart mutation", () => {
  assert.equal(homeNudgeLink(nudge("add_to_cart")), "/shop/products/p1");
  assert.equal(
    homeNudgeLink(nudge("add_product", { name: "Rice & dal" })),
    "/shop/products/new?name=Rice%20%26%20dal",
  );
  assert.equal(
    homeNudgeLink(nudge("remind_customer", { customerId: "c1" })),
    "/shop/customers/followups?customerId=c1",
  );
});
test("helper sees their own bill search and counter shortcuts without management summaries or actions", async (t) => {
  setup("HELPER");
  reads.search = {
    sales: [bill],
    customers: [{ id: "private", name: "Private customer" }],
    suppliers: [{ name: "Private supplier" }],
  };
  await mount(t);
  await fill("18");
  assert(document.querySelector('a[href="/shop/sales/b1"]'));
  assert(!document.body.textContent.includes("Private customer"));
  assert(!document.body.textContent.includes("Private supplier"));
  assert(
    !calls.some(
      (c) => c[0] === "read" && ["summary", "brief", "nudges"].includes(c[1]),
    ),
  );
  await fill("");
  assert(document.querySelector('a[href="/shop/sell?scan=1"]'));
  assert(!document.querySelector('a[href="/shop/cashbook"]'));
  assert(!document.querySelector('a[href="/shop/products/new"]'));
});
test("failed reads show retry and never claim zero sales or healthy/empty stock", async (t) => {
  setup();
  reads.summary =
    reads.catalog =
    reads.sales =
    reads.stats =
      Error("Synthetic failure");
  await mount(t);
  assert(document.querySelectorAll("[role=alert]").length >= 3);
  assert(!document.body.textContent.includes("Stock looks healthy"));
  assert(!document.body.textContent.includes("No bills yet today"));
  assert(!document.body.textContent.includes("No products yet"));
  reads.catalog = [item];
  await act(async () =>
    [...document.querySelectorAll("button")]
      .filter((b) => b.textContent === "Try again")
      .forEach((b) => b.click()),
  );
  await settle();
  assert(document.querySelector('a[href="/shop/products/p1"]'));
});
test("unstocked requests wait for the current search; save failure retains retry and never reports success", async (t) => {
  setup();
  let resolve;
  reads.search = () =>
    new Promise((r) => {
      resolve = r;
    });
  await mount(t);
  await fill("unstocked");
  assert(!button("Not in stock? Note it"));
  await act(async () => resolve({ sales: [], customers: [], suppliers: [] }));
  await settle();
  assert(button("Not in stock? Note it"));
  reads.postError = Error("Synthetic save failed");
  await act(async () => button("Not in stock? Note it").click());
  await settle();
  assert.equal(notice, null);
  assert(document.body.textContent.includes("Synthetic save failed"));
  assert.equal(document.querySelector("input").value, "unstocked");
  reads.postError = null;
  await act(async () => button("Not in stock? Note it").click());
  await settle();
  assert(notice);
  assert(!button("Not in stock? Note it"));
});
test("remote search failure never offers to record a supposedly missing product", async (t) => {
  setup();
  reads.search = Error("Search unavailable");
  await mount(t);
  await fill("missing");
  assert(!button("Not in stock? Note it"));
  assert(document.querySelector("[role=alert]"));
});
test("price suggestions require a separate confirmation and cancel performs no mutation", async (t) => {
  setup();
  reads.nudges = { nudges: [nudge("set_price", { sellingPrice: 55 })] };
  await mount(t);
  await act(async () => button("Set price ₹55.00").click());
  assert(document.querySelector("[role=dialog]"));
  assert(!calls.some((c) => c[0] === "act"));
  await act(async () => button("Cancel").click());
  assert(!calls.some((c) => c[0] === "act"));
  await act(async () => button("Set price ₹55.00").click());
  await act(async () => button("Confirm").click());
  await settle();
  assert.equal(calls.filter((c) => c[0] === "act").length, 1);
  assert.match(notice, /55/);
});
test("dismissal records dismissal, and unknown actions never call the action endpoint", async (t) => {
  setup();
  reads.nudges = { nudges: [nudge("unsupported_action")] };
  await mount(t);
  assert(!button("Do this"));
  await act(async () =>
    document.querySelector('button[aria-label="Dismiss suggestion"]').click(),
  );
  await settle();
  assert(calls.some((c) => c[0] === "event" && c[1] === "dismissed"));
  assert(!calls.some((c) => c[0] === "act"));
});
test("share-offer prepares a reviewable draft without applying a selling price", async (t) => {
  setup();
  reads.nudges = { nudges: [nudge("share_offer")] };
  context.api.actNudge = async (s, id, body) => {
    calls.push(["act", body]);
    return { ok: true, message: "Synthetic draft for review" };
  };
  await mount(t);
  await act(async () => button("Review offer").click());
  await settle();
  assert.deepEqual(calls.find((c) => c[0] === "act")[1], { applyPrice: false });
  assert(document.querySelector("[role=dialog]"));
  assert(document.body.textContent.includes("Synthetic draft for review"));
});
test("inventory scanning opens the matched product; helper refresh does not fetch restricted data", async (t) => {
  setup("HELPER");
  await mount(t);
  await act(async () => button("Find by barcode").click());
  await act(async () => button("Synthetic barcode").click());
  await settle();
  assert(
    calls.some((c) => c[0] === "navigate" && c[1] === "/shop/products/p1"),
  );
  await act(async () => button("Refresh").click());
  await settle();
  assert(
    !calls.some(
      (c) => c[0] === "read" && ["summary", "brief", "nudges"].includes(c[1]),
    ),
  );
});
test("refund-only payment totals remain visible instead of claiming there are no payments", async (t) => {
  setup();
  reads.summary = {
    ...reads.summary,
    revenue: -100,
    byMethod: { cash: -100, upi: 0, credit: 0 },
  };
  await mount(t);
  assert(document.body.textContent.includes("-₹100.00"));
  assert(!document.body.textContent.includes("No payments yet today"));
});

test("home requests the brief in the viewer's selected language", async (t) => {
  setup(); context.prefs.appLanguage = "hinglish"; await mount(t);
  assert(calls.some((c) => c[0] === "brief-language" && c[1] === "s1" && c[2] === "hinglish"));
});
