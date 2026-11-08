import type { BuyListItem } from "./types";
export const BUY_FILTERS = [
  "all",
  "pending",
  "stocked",
  "ai_suggested",
] as const;
export type BuyFilter = (typeof BUY_FILTERS)[number];
export const completedBuyItem = (item: BuyListItem) =>
  item.status === "stocked" || item.status === "purchased";
export function filterBuyItems(
  items: BuyListItem[],
  filter: BuyFilter,
  query = "",
) {
  const q = query.trim().toLocaleLowerCase();
  return items.filter(
    (i) =>
      (filter === "all" ||
        (filter === "stocked"
          ? completedBuyItem(i)
          : filter === "ai_suggested"
            ? i.isAiSuggested
            : i.status === "pending")) &&
      (!q ||
        [i.itemName, i.category, i.notes].some((v) =>
          v?.toLocaleLowerCase().includes(q),
        )),
  );
}
export function buyItemDestination(item: BuyListItem) {
  if (item.purchaseOrderId)
    return (
      "/shop/purchase-orders?" +
      new URLSearchParams({ orderId: item.purchaseOrderId })
    );
  if (completedBuyItem(item)) return null;
  const params = new URLSearchParams({
    buyListItemId: item.id,
    qty: String(item.quantity ?? ""),
  });
  if (item.productId) {
    params.set("batch", "1");
    return `/shop/products/${encodeURIComponent(item.productId)}?${params}`;
  }
  params.set("name", item.itemName);
  params.set("unit", item.unit ?? "kg");
  params.set("category", item.category ?? "");
  return "/shop/products/new?" + params;
}
export function buyQuantity(value: string) {
  return /^\d+(?:\.\d{1,3})?$/.test(value.trim()) &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0
    ? Number(value)
    : null;
}
