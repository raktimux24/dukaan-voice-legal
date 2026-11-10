import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { estimateItemsReview, estimateCustomerIssue } = require(
  process.env.GST_TEST_BUILD + "/estimates/editor.js",
);
const { emptyEstimate, estimateText } = require(
  process.env.GST_TEST_BUILD + "/estimates/contract.js",
);
const draft = () => ({
  ...emptyEstimate(),
  lines: [
    {
      id: "line",
      productId: "product",
      name: "Rice",
      unit: "kg",
      quantity: "1.125",
      price: "100.25",
      discount: "2.50",
    },
  ],
});
const d = draft();
d.billDiscount = "10";
assert.equal(estimateItemsReview(d).subtotal, 110.28);
assert.equal(estimateItemsReview(d).valid, true);
assert.equal(
  estimateItemsReview({ ...d, billDiscount: "110.29" }).valid,
  false,
);
assert.equal(estimateItemsReview(emptyEstimate()).valid, false);
for (const change of [
  { quantity: "0" },
  { quantity: "1.0001" },
  { quantity: "1e3" },
  { price: "" },
  { price: "1.234" },
  { discount: "1000" },
]) {
  const x = draft();
  Object.assign(x.lines[0], change);
  const before = JSON.stringify(x);
  assert.equal(estimateItemsReview(x).valid, false);
  assert.equal(JSON.stringify(x), before);
}
for (const phone of ["+91 98765 43210", "09876543210", "9876543210"])
  assert.equal(
    estimateCustomerIssue({ ...d, customerName: "QA", customerPhone: phone }),
    null,
  );
assert.equal(
  estimateCustomerIssue({ ...d, customerPhone: "123" }),
  "estimates.error.customer",
);
assert.equal(
  estimateCustomerIssue({ ...d, customerName: "QA", customerPhone: "123" }),
  "estimates.error.phone",
);
const locales = JSON.parse(
  readFileSync("app/lib/shop/retail-locales.json", "utf8"),
);
const files = [
  "app/components/shop/screens/estimates.tsx",
  "app/components/shop/screens/estimate-workspace.tsx",
];
const keys = [
  ...new Set(
    files.flatMap((f) =>
      [
        ...readFileSync(f, "utf8").matchAll(
          /['"](estimates\.[a-z_]+(?:\.[a-z_]+)?)['"]/g,
        ),
      ].map((x) => x[1]),
    ),
  ),
].filter((k) => !k.endsWith(".") && !k.endsWith("_"));
for (const [language, messages] of Object.entries(locales)) {
  for (const key of keys)
    assert.ok(messages[key]?.trim(), language + ":" + key);
  const t = (k) => messages[k] ?? k;
  const text = estimateText(
    {
      shopName: "QA",
      number: "EST-123",
      draft: d,
      lines: d.lines,
      tax: "0",
      total: "100.28",
    },
    t,
  );
  assert.ok(text.includes(t("estimates.not_invoice")));
  assert.ok(text.includes(t("estimates.share_disclaimer")));
  assert.ok(text.includes("EST-123"));
  assert.ok(!text.includes("undefined"));
}
console.log(
  "Estimate editor: fractional rounding, invalid input preservation, discounts, Indian phones, ten-language UI and shared text passed.",
);
