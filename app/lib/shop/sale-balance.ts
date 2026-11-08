import type { SaleReturnCapacity, Sale } from "./types";
const cents = (value: unknown): bigint => {
  if (typeof value !== "string" || !/^\d+\.\d{2}$/.test(value))
    throw Error("sale_balance_unverified");
  return BigInt(value.replace(".", ""));
};
const original = (value: number) => {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 1e-5
  )
    throw Error("sale_balance_unverified");
  return BigInt(Math.round(value * 100));
};
/** Current invoice debt comes from allocated movements, never its original credit tender. */
export function verifiedSaleBalance(
  value: SaleReturnCapacity,
  sale: Pick<
    Sale,
    "id" | "customerId" | "total" | "paidTotal" | "creditTotal" | "status"
  >,
): SaleReturnCapacity {
  const result = structuredClone(value);
  if (
    sale.status !== "completed" ||
    result.saleId !== sale.id ||
    result.customerId !== sale.customerId ||
    !["ready", "unassigned_collections"].includes(result.status)
  )
    throw Error("sale_balance_unverified");
  const credit = cents(result.originalCredit),
    paid = cents(result.originalPaid),
    allocated = cents(result.allocatedCollections),
    reduced = cents(result.creditReduced),
    refunded = cents(result.moneyRefunded),
    unpaid = cents(result.unpaidCredit),
    money = cents(result.refundableMoney),
    remaining = cents(result.remainingGross),
    unassigned = cents(result.unassignedCollections);
  if (
    credit !== original(sale.creditTotal) ||
    paid !== original(sale.paidTotal) ||
    credit + paid !== original(sale.total) ||
    credit - allocated - reduced !== unpaid ||
    paid + allocated - refunded !== money ||
    unpaid + money !== remaining ||
    reduced + refunded + remaining !== credit + paid ||
    (result.status === "ready" ? unassigned !== 0n : unassigned === 0n)
  )
    throw Error("sale_balance_unverified");
  return result;
}
