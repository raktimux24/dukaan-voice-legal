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
    supplierCounts: async (s:string) => {
      type Page={items:PurchaseOrder[];more:boolean};
      const first=await send<Page|{counts:Record<string,number>}>(root(s)+'?summary=suppliers');
      if('counts' in first)return first.counts;
      const counts:Record<string,number>={},seen=new Set<string>();let page=first,offset=0;
      for(;;){const before=seen.size;for(const order of page.items){if(!seen.has(order.id))counts[order.supplierId]=(counts[order.supplierId]??0)+1;seen.add(order.id);}
        if(!page.more)return counts;if(seen.size===before)throw new Error('po_unavailable');offset+=page.items.length;page=await send<Page>(root(s)+'?offset='+offset);}
    },
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
