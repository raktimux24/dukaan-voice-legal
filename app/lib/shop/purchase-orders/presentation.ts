import {
  poRemaining,
  type PoDraft,
  type PoReceiptLine,
  type PurchaseOrder,
  type PoOptions,
} from "./contract";
export const orderStatuses = [
  "draft",
  "issued",
  "part_received",
  "received",
  "closed",
  "cancelled",
] as const;
export const validQuantity = (v: string) => /^\d{1,8}(?:\.\d{1,3})?$/.test(v);
export const validPrice = (v: string) => /^\d{1,8}(?:\.\d{1,2})?$/.test(v);
export const validOrderLine = (l: PoDraft["lines"][number]) =>
  !!l.unit.trim() &&
  validQuantity(l.quantity) &&
  Number(l.quantity) > 0 &&
  (l.price === "" || validPrice(l.price));
export const estimatedTotal = (lines: PoDraft["lines"]) =>
  lines.length && lines.every((l) => validOrderLine(l) && l.price !== "")
    ? lines.reduce((sum, l) => sum + Number(l.quantity) * Number(l.price), 0)
    : null;
export function availableToOrder(item: PoOptions["buyList"][number]) {
  return Number(item.quantity) > 0
    ? Math.max(0, Number(item.quantity) - Number(item.committed))
    : 1;
}
export function suggestedPrice(
  options: PoOptions | undefined,
  supplier: string,
  product: string | undefined,
  fallback = "",
) {
  return (
    options?.prices?.find(
      (p) => p.supplierId === supplier && p.productId === product,
    )?.price ?? fallback
  );
}
export function filterOrders(
  orders: PurchaseOrder[],
  status: string,
  query: string,
) {
  const q = query.trim().toLocaleLowerCase();
  return orders.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      [p.number, p.supplier.name, ...p.lines.map((l) => l.name)].some((s) =>
        s.toLocaleLowerCase().includes(q),
      ),
  );
}
export function receiptIssue(
  order: PurchaseOrder,
  rows: Omit<PoReceiptLine, "batchId">[],
  today: string,
) {
  let any = false;
  for (const r of rows) {
    if (!validQuantity(r.quantity) || !validQuantity(r.rejected))
      return "quantity";
    const qty = Number(r.quantity),
      rejected = Number(r.rejected);
    if (!qty && !rejected) continue;
    any = true;
    const line = order.lines.find((l) => l.id === r.lineId);
    if (!line || qty + rejected > poRemaining(line) + 0.0001)
      return "remaining";
    if (rejected && !r.reason.trim()) return "reason";
    if (qty && !r.productId) return "product";
    if (qty && !validPrice(r.cost)) return "quantity";
    if (
      qty &&
      r.expiryDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(r.expiryDate) ||
        r.expiryDate < today ||
        !Number.isFinite(Date.parse(r.expiryDate)) ||
        new Date(r.expiryDate).toISOString().slice(0, 10) !== r.expiryDate)
    )
      return "expiry";
  }
  return any ? null : "quantity";
}
