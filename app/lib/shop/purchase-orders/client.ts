import type { PurchaseOrder, PoOptions, PoRequest } from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindPurchaseOrders(send: Send) {
  const root = (s: string) =>
    "/api/shops/" + encodeURIComponent(s) + "/purchase-orders";
  return {
    list: (s: string, offset = 0) =>
      send<{ items: PurchaseOrder[]; more: boolean }>(
        root(s) + "?offset=" + offset,
      ),
    get: (s: string, id: string) =>
      send<PurchaseOrder>(root(s) + "/" + encodeURIComponent(id)),
    options: (s: string, q = "") =>
      send<PoOptions>(root(s) + "/options?q=" + encodeURIComponent(q)),
    action: (s: string, r: PoRequest) =>
      send<PurchaseOrder>(root(s) + "/actions", {
        method: "POST",
        body: JSON.stringify(r),
      }),
    invoice: (s: string, id: string, receipt: string) =>
      send<{
        invoiceIds: string[];
        supplierId: string;
        orderId: string;
        receiptId: string;
        lines: {
          productId: string;
          name: string;
          unit: string;
          quantity: string;
          price: string;
          batchId: string;
          gstConfig: unknown;
        }[];
      }>(
        root(s) +
          "/" +
          encodeURIComponent(id) +
          "/receipts/" +
          encodeURIComponent(receipt) +
          "/invoice",
      ),
  };
}
