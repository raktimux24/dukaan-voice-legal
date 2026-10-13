import type { PurchaseLineInput } from "./gst-types";
import { GstError } from "./gst-core/gst";
import { purchaseLineTaxForContext } from "./gst-core/purchase-review-draft";

export type PurchaseDraftLine = PurchaseLineInput & {
  key: string;
  name: string;
  trackStock: boolean;
  priceText?: string;
  taxReviewContext?: string;
  stockMode: "invoice_only" | "receive" | "link";
};

export function purchaseDraftHasPrice(line: PurchaseDraftLine): boolean {
  return (line.priceText ?? String(line.price)).trim() !== "";
}

export function purchaseDraftTax(line: PurchaseDraftLine, context: string) {
  return purchaseLineTaxForContext(
    {
      ...line,
      quantity: String(line.quantity),
      price: line.priceText ?? String(line.price),
      discount: String(line.discount ?? 0),
    },
    context,
  )!;
}

export function purchaseLineForRequest(
  line: PurchaseDraftLine,
  context: string,
): PurchaseLineInput {
  if (
    !line.trackStock &&
    (line.stockMode !== "invoice_only" ||
      line.receiveStock ||
      line.existingBatchId)
  )
    throw new GstError("service_stock_receipt_not_allowed");
  const {
    key, name, trackStock, stockMode, taxReviewContext, priceText, ...input
  } = line;
  return {
    ...input,
    tax: {
      ...purchaseDraftTax(line, context),
      version: line.tax.version || "purchase-manual-v1",
    },
  };
}
