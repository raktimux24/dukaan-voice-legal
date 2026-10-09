import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { purchaseDraftTax, purchaseLineForRequest } = require(
  `${process.env.GST_TEST_BUILD}/purchase-draft.js`,
);
const { purchaseReviewSignature } = require(
  `${process.env.GST_TEST_BUILD}/gst-core/purchase-review-draft.js`,
);
const context = purchaseReviewSignature({
  supplierId: "supplier-a",
  supplierIdentity: { name: "Supplier", address: "Original address" },
  recipient: { name: "Shop", address: "Original shop address" },
});
const line = {
  key: "draft-only",
  name: "Test",
  productId: "product-a",
  trackStock: false,
  quantity: 1,
  price: 10,
  discount: 0,
  tax: {
    category: "taxable",
    codeType: "hsn",
    code: "4820",
    rate: 5,
    reviewed: true,
    version: "test",
  },
  taxReviewContext: context,
  stockMode: "invoice_only",
  receiveStock: false,
};
assert.equal(purchaseDraftTax(line, context).reviewed, true);
for (const changed of [
  {
    supplierId: "supplier-a",
    supplierIdentity: { name: "Supplier", address: "Changed address" },
    recipient: { name: "Shop", address: "Original shop address" },
  },
  {
    supplierId: "supplier-a",
    supplierIdentity: { name: "Supplier", address: "Original address" },
    recipient: { name: "Shop", address: "Changed shop address" },
  },
])
  assert.equal(
    purchaseDraftTax(line, purchaseReviewSignature(changed)).reviewed,
    false,
  );
assert.equal(
  line.tax.reviewed,
  true,
  "Rendering a changed context does not mutate original draft evidence",
);
const request = purchaseLineForRequest(line, context);
assert.equal(request.receiveStock, false);
for (const key of [
  "key",
  "name",
  "trackStock",
  "stockMode",
  "taxReviewContext",
])
  assert.equal(key in request, false);
for (const patch of [
  { receiveStock: true, stockMode: "receive" },
  { existingBatchId: "batch-a", stockMode: "link" },
]) {
  assert.throws(
    () => purchaseLineForRequest({ ...line, ...patch }, context),
    (error) => error.code === "service_stock_receipt_not_allowed",
  );
  assert.doesNotThrow(() =>
    purchaseLineForRequest({ ...line, ...patch, trackStock: true }, context),
  );
}
console.log(
  "Purchase drafts: refreshed identity invalidation, immutable review evidence, invoice-only services and request metadata isolation passed.",
);
