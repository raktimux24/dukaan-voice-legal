import type { GstSupplier } from "./gst-types";
import type {
  SupplierRow,
  SupplierCompareProduct,
  SupplierItem,
} from "./types";
export function supplierDirectory(
  saved: GstSupplier[],
  receipts: SupplierRow[],
  query: string,
) {
  const linked = new Set(
    saved.map((s) => s.identity.inventorySupplierName).filter(Boolean),
  );
  const q = query.trim().toLocaleLowerCase();
  return {
    saved: saved.filter((s) =>
      [
        s.identity.name,
        s.identity.gstin,
        s.identity.address,
        s.identity.inventorySupplierName,
      ].some((v) => v?.toLocaleLowerCase().includes(q)),
    ),
    history: receipts.filter(
      (r) => !linked.has(r.name) && r.name.toLocaleLowerCase().includes(q),
    ),
  };
}
export const supplierHistoryUrl = (name: string, id?: string) =>
  "/shop/suppliers/" +
  encodeURIComponent(name) +
  (id ? "?supplierId=" + encodeURIComponent(id) : "");
export function supplierComparisons(rows: SupplierCompareProduct[], q: string) {
  const needle = q.trim().toLocaleLowerCase();
  return rows
    .filter(
      (r) =>
        r.name.toLocaleLowerCase().includes(needle) ||
        r.suppliers.some((s) => s.name.toLocaleLowerCase().includes(needle)),
    )
    .map((r) => ({
      ...r,
      suppliers: [...r.suppliers].sort((a, b) => a.price - b.price),
    }));
}
export const cheaperSupplierCount = (items: SupplierItem[]) =>
  items.filter(
    (i) => i.alt && i.lastPrice != null && i.alt.price < i.lastPrice * 0.95,
  ).length;
