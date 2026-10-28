import type { EstimateDraft } from "./contract";
import { normalizeIndianMobile } from "../phone";

const decimal = (value: string, scale = 2) =>
  new RegExp(`^\\d{1,8}(?:\\.\\d{1,${scale}})?$`).test(value);
const money = (value: number) => Math.round(value * 100) / 100;
/** Local guidance only. The saved server preview remains authoritative for tax and totals. */
export function estimateItemsReview(draft: EstimateDraft) {
  const invalid = new Set<string>();
  let subtotal = 0;
  for (const line of draft.lines) {
    const gross = money(Number(line.quantity) * Number(line.price));
    if (
      !decimal(line.quantity, 3) ||
      Number(line.quantity) <= 0 ||
      !decimal(line.price) ||
      !decimal(line.discount) ||
      Number(line.discount) > gross
    ) {
      invalid.add(line.id);
    } else subtotal += gross - Number(line.discount);
  }
  const billDiscountValid =
    decimal(draft.billDiscount) &&
    Number(draft.billDiscount) <= money(subtotal);
  return {
    invalid,
    billDiscountValid,
    subtotal: invalid.size ? null : money(subtotal),
    valid:
      draft.lines.length > 0 &&
      draft.lines.length <= 100 &&
      !invalid.size &&
      billDiscountValid,
  };
}
export function estimateCustomerIssue(draft: EstimateDraft): string | null {
  if (!draft.customerPhone.trim()) return null;
  if (!draft.customerName.trim()) return "estimates.error.customer";
  return normalizeIndianMobile(draft.customerPhone) === "invalid"
    ? "estimates.error.phone"
    : null;
}
