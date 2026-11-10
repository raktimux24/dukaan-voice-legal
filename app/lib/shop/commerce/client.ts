import type {
  OnlineStore,
  OnlineListing,
  OnlineOrder,
  CommerceRequest,
  CommerceResult,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindCommerce(send: Send) {
  const root = (s: string) =>
    "/api/shops/" + encodeURIComponent(s) + "/online-store";
  return {
    store: (s: string, q = "", offset = 0) =>
      send<{
        store: OnlineStore;
        items: OnlineListing[];
        more: boolean;
        orderingAvailable?: boolean;
      }>(root(s) + "?q=" + encodeURIComponent(q) + "&offset=" + offset),
    orders: (s: string, offset = 0) =>
      send<{ items: OnlineOrder[]; more: boolean }>(
        root(s) + "/orders?offset=" + offset,
      ),
    order: (s: string, id: string) =>
      send<OnlineOrder>(root(s) + "/orders/" + encodeURIComponent(id)),
    action: (s: string, r: CommerceRequest) =>
      send<CommerceResult>(root(s) + "/actions", {
        method: "POST",
        body: JSON.stringify(r),
      }),
    qr: (s: string, id: string) =>
      send<{
        id: string;
        uri: string;
        filename: string;
        mime: string;
        base64: string;
      }>(root(s) + "/products/" + encodeURIComponent(id) + "/qr"),
  };
}
