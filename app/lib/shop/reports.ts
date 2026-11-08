import type { MovementDay } from "./types";
export const SALES_PERIODS = [
  "today",
  "7d",
  "30d",
  "month",
  "last_month",
] as const;
export const STOCK_PERIODS = ["7d", "30d", "90d"] as const;
export type SalesPeriod = (typeof SALES_PERIODS)[number];
export type StockPeriod = (typeof STOCK_PERIODS)[number];
export function effectiveReportPeriod(period: string, premium: boolean) {
  return premium || period === "today" || period === "7d" ? period : "7d";
}
export function reportTab(value: string | null): "sales" | "stock" {
  return value === "stock" ? "stock" : "sales";
}
export function stockMovementTotals(rows: MovementDay[]) {
  const totals = rows.reduce(
    (sum, row) => ({
      incoming: sum.incoming + row.unitsIn,
      sold: sum.sold + row.unitsSold,
      adjusted: sum.adjusted + row.unitsAdjusted,
    }),
    { incoming: 0, sold: 0, adjusted: 0 },
  );
  return { ...totals, net: totals.incoming - totals.sold - totals.adjusted };
}
/** Zero stays zero; signed values use a common zero line and retain their sign. */
export function reportChartScale(values: number[]) {
  const finite = values.filter(Number.isFinite);
  const high = Math.max(0, ...finite),
    low = Math.min(0, ...finite),
    range = high - low || 1;
  return {
    zero: low < 0 ? (-low / range) * 100 : 0,
    height: (value: number) =>
      Number.isFinite(value) ? (Math.abs(value) / range) * 100 : 0,
  };
}
export function reportCostVisible(
  serverAllows: boolean | undefined,
  canSeeCost: boolean,
  hidden: boolean,
) {
  return serverAllows === true && canSeeCost && !hidden;
}
