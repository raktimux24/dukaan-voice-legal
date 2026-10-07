import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  root = process.env.GST_TEST_BUILD;
if (!root) throw Error("Compile GST contracts and set GST_TEST_BUILD.");
const { calculateTax, returnTax } = require(root + "/gst-core/gst.js");
const { productPriceBreakdown, discountedBuyingPrice } = require(
  root + "/gst-core/product-gross-price.js",
);
const { reportPeriod } = require(root + "/gst-core/report-period.js");
const { fiscalTotalsConsistent } = require(
  root + "/gst-core/fiscal-totals-integrity.js",
);
const { verifyDocument } = require(root + "/gst-document.js");
const { canonicalJson } = require(root + "/gst-core/sale-request-canonical.js");
const crypto = await import("node:crypto");
const settings = {
  version: "084f9d89-5e6a-4973-9f3a-62787a97ca05",
  registration: "regular",
  gstin: "29AAAGM0289C1ZF",
  legalName: "Shop",
  address: "Bengaluru",
  stateCode: "29",
  priceMode: "exclusive",
  effectiveFrom: "2026-01-01",
  reviewed: true,
  eInvoiceRequired: false,
};
const tax = {
  version: settings.version,
  category: "taxable",
  codeType: "hsn",
  code: "1006",
  rate: 5,
  reviewed: true,
};
const context = { settings, priceMode: "exclusive", placeOfSupply: "29" };
const totals = calculateTax([{ quantity: 2, price: 100, tax }], 20, context);
assert.equal(totals.total, 189);
assert.equal(totals.tax, 9);
assert.equal(totals.cgst, 4.5);
assert.equal(totals.sgst, 4.5);
assert.ok(fiscalTotalsConsistent(totals));
assert.deepEqual(productPriceBreakdown("100", tax, settings), {
  net: 100,
  tax: 5,
  gross: 105,
});
assert.deepEqual(
  productPriceBreakdown("105", tax, { ...settings, priceMode: "inclusive" }),
  { net: 100, tax: 5, gross: 105 },
);
assert.equal(discountedBuyingPrice("80", "10"), 72);
assert.equal(discountedBuyingPrice("80", "101"), null);
assert.equal(productPriceBreakdown("100", null, settings), null);
assert.equal(
  calculateTax(
    [
      { quantity: 1, price: 100, tax },
      { quantity: 1, price: 50, tax: { ...tax, category: "exempt", rate: 0 } },
    ],
    0,
    context,
  ).total,
  155,
);
assert.equal(
  calculateTax([{ quantity: 0.5, price: 100, tax }], 0, context).total,
  52.5,
);
assert.deepEqual(reportPeriod("2026-10-01", "2026-10-07"), {
  from: "2026-10-01T00:00:00+05:30",
  to: "2026-10-08T00:00:00+05:30",
  calendarFrom: "2026-10-01",
  calendarTo: "2026-10-08",
});
assert.throws(() => reportPeriod("2026-02-30", "2026-03-01"));
assert.throws(() => reportPeriod("2026-10-07", "2026-10-01"));
assert.equal(fiscalTotalsConsistent({ ...totals, total: 190 }), false);
const doc = {
  id: crypto.randomUUID(),
  shopId: crypto.randomUUID(),
  saleId: crypto.randomUUID(),
  issuer: settings.gstin,
  financialYear: "2026-27",
  number: "26-1-001",
  type: "tax_invoice",
  issuedAt: "2026-10-07T10:00:00Z",
  originalNumber: null,
  payload: { renderVersion: "gst_bill_v2", context, totals, items:[{name:"Rice",unit:"kg",quantity:2,tax:totals.lines[0]}] },
  integrity: "verified",
  hashVersion: "fiscal_document_v2",
};
const {
  shopId,
  saleId,
  issuer,
  financialYear,
  number,
  type,
  originalNumber,
  payload,
} = doc;
doc.hash = crypto
  .createHash("sha256")
  .update(
    canonicalJson({
      shopId,
      saleId,
      issuer,
      financialYear,
      number,
      type,
      issuedAt: new Date(doc.issuedAt).toISOString(),
      originalNumber,
      payload,
    }),
  )
  .digest("hex");
await verifyDocument(doc, shopId, saleId);
await assert.rejects(() =>
  verifyDocument({ ...doc, number: "26-1-002" }, shopId, saleId),
);
await assert.rejects(() => verifyDocument(doc, crypto.randomUUID(), saleId));
await assert.rejects(() =>
  verifyDocument({ ...doc, integrity: "mismatch" }, shopId, saleId),
);
console.log(
  "GST contract tests passed: selling-price tax, buying discounts, fractional quantities, mixed rates, IST ranges and retained-document tampering.",
);
