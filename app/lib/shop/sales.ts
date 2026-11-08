import type { Sale } from "./types";
import type { CounterFilters } from "./counter/query";
/** Summary API accepts dates only, not ledger search/status/payment filters. */
export function salesSummaryParams(f: CounterFilters): Record<string, string> {
  return f.period === "custom"
    ? { from: f.from, to: f.to }
    : { period: f.period };
}
export function salesRangeReady(f: CounterFilters) {
  return f.period !== "custom" || (!!f.from && !!f.to && f.from <= f.to);
}
export function salesVoidAllowed(
  sale: Sale,
  hours: number | undefined,
  now = Date.now(),
) {
  const age = now - Date.parse(sale.soldAt);
  return (
    sale.status === "completed" &&
    !sale.gstSnapshot &&
    !sale.mixedGstSnapshot &&
    hours != null &&
    Number.isFinite(hours) &&
    hours >= 0 &&
    Number.isFinite(age) &&
    age >= 0 &&
    age <= hours * 3600000
  );
}
export function ordinaryReturnPlan(
  sale: Sale,
  quantities: Record<string, string>,
  restock: Record<string, boolean>,
  override: string,
) {
  if (
    sale.status !== "completed" ||
    sale.gstSnapshot ||
    sale.mixedGstSnapshot ||
    sale.roundingEvidence ||
    sale.returnPlanningError
  )
    throw Error("return_plan_unavailable");
  const items = sale.items.flatMap((item) => {
    const text = (quantities[item.id] ?? "").trim();
    if (!text) return [];
    if (!/^\d+(?:\.\d{1,3})?$/.test(text))
      throw Error("return_quantity_invalid");
    const quantity = Number(text),
      left = Math.round((item.quantity - item.returnedQuantity) * 1000) / 1000;
    if (
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      quantity > left ||
      (item.rspSnapshot && !Number.isInteger(quantity))
    )
      throw Error("return_quantity_invalid");
    return quantity > 0
      ? [
          {
            saleItemId: item.id,
            quantity,
            restock: !!item.productId && restock[item.id] !== false,
          },
        ]
      : [];
  });
  const computed =
    Math.round(
      items.reduce((sum, row) => {
        const item = sale.items.find((i) => i.id === row.saleItemId)!;
        return sum + (item.lineTotal / item.quantity) * row.quantity;
      }, 0) * 100,
    ) / 100;
  const custom = sale.creditTotal === 0 && override.trim() !== "";
  if (custom && !/^\d+(?:\.\d{1,2})?$/.test(override.trim()))
    throw Error("return_amount_invalid");
  const total = custom ? Number(override) : computed;
  if (
    !Number.isFinite(total) ||
    total < 0 ||
    !Number.isSafeInteger(Math.round(total * 100))
  )
    throw Error("return_amount_invalid");
  return { items, total, refundAmount: custom ? total : null };
}
