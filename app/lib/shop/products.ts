import type { InventoryItem, Nudge } from "./types";
import { searchSellCatalog } from "./sell";
export const PRODUCT_FILTERS = [
  "all",
  "low_stock",
  "out_of_stock",
  "near_expiry",
  "unpriced",
] as const;
export const PRODUCT_SORTS = ["name", "recent", "stock"] as const;
export type ProductFilters = {
  q: string;
  filter: (typeof PRODUCT_FILTERS)[number];
  category: string;
  sort: (typeof PRODUCT_SORTS)[number];
};
export function productFilters(params: URLSearchParams): ProductFilters {
  return {
    q: (params.get("q") ?? "").slice(0, 200),
    filter: PRODUCT_FILTERS.includes(params.get("filter") as any)
      ? (params.get("filter") as ProductFilters["filter"])
      : "all",
    category: params.get("category") ?? "all",
    sort: PRODUCT_SORTS.includes(params.get("sort") as any)
      ? (params.get("sort") as ProductFilters["sort"])
      : "name",
  };
}
export function productListUrl(f: ProductFilters) {
  return "/shop/products?" + new URLSearchParams(f).toString();
}
export function productReturn(value: string | null) {
  try {
    const u = new URL(value ?? "/shop/products", "https://samaan.invalid");
    return u.origin === "https://samaan.invalid" &&
      u.pathname === "/shop/products"
      ? productListUrl(productFilters(u.searchParams))
      : "/shop/products";
  } catch {
    return "/shop/products";
  }
}
export function productExpiry(value: string | undefined, now = Date.now()) {
  if (!value) return null;
  const days = Math.ceil((Date.parse(value) - now) / 86400000);
  return Number.isFinite(days) && days <= 60
    ? { days, expired: days < 0 }
    : null;
}
export function matchesProduct(item: InventoryItem, filter: string) {
  if (item.product.isActive === false) return false;
  if (
    item.product.trackStock === false &&
    ["low_stock", "out_of_stock", "near_expiry"].includes(filter)
  )
    return false;
  return filter === "low_stock"
    ? item.stockStatus === "LOW"
    : filter === "out_of_stock"
      ? item.stockStatus === "OUT"
      : filter === "near_expiry"
        ? !!productExpiry(item.nearestExpiryDate)
        : filter === "unpriced"
          ? item.product.sellingPrice == null
          : true;
}
export function filterProducts(items: InventoryItem[], f: ProductFilters) {
  return searchSellCatalog(items, f.q, f.category)
    .filter((i) => matchesProduct(i, f.filter))
    .sort((a, b) => {
      if (f.sort === "recent")
        return (
          Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
          a.id.localeCompare(b.id)
        );
      if (f.sort === "stock") {
        const rank = (i: InventoryItem) =>
          i.product.trackStock === false
            ? 3
            : i.stockStatus === "OUT"
              ? 0
              : i.stockStatus === "LOW"
                ? 1
                : 2;
        return (
          rank(a) - rank(b) ||
          (a.product.trackStock === false && b.product.trackStock === false
            ? 0
            : a.quantity - b.quantity) ||
          a.product.name.localeCompare(b.product.name) ||
          a.id.localeCompare(b.id)
        );
      }
      return (
        a.product.name.localeCompare(b.product.name) || a.id.localeCompare(b.id)
      );
    });
}
export function stockNumber(value: string, decimals = 3) {
  if (!new RegExp("^\\d+(?:\\.\\d{1," + decimals + "})?$").test(value.trim()))
    return null;
  const n = Number(value);
  return Number.isFinite(n) &&
    n >= 0 &&
    Number.isSafeInteger(Math.round(n * 10 ** decimals))
    ? n
    : null;
}
export function receiveValues(
  quantity: string,
  cost: string,
  packSize: number | null,
  mode: "unit" | "pack",
  lastCost?: number,
) {
  const n = stockNumber(quantity),
    price = cost.trim() ? stockNumber(cost, 2) : null;
  if (
    n == null ||
    n <= 0 ||
    (cost.trim() && price == null) ||
    (mode === "pack" && !(packSize && packSize > 0))
  )
    return null;
  const amount =
    Math.round(n * (mode === "pack" ? packSize! : 1) * 1000) / 1000;
  if (!Number.isSafeInteger(Math.round(amount * 1000))) return null;
  return {
    quantity: amount,
    purchasePrice:
      price == null
        ? mode === "pack"
          ? lastCost
          : undefined
        : mode === "pack"
          ? Math.round((price / packSize!) * 100) / 100
          : price,
  };
}
export function productPairs(
  nudges: Nudge[],
  productId: string,
  items: InventoryItem[],
) {
  const seen = new Set<string>();
  return nudges
    .filter(
      (n) =>
        n.status === "open" &&
        n.kind === "attach" &&
        n.evidence?.anchorProductId === productId &&
        n.productId !== productId,
    )
    .sort(
      (a, b) => (b.evidence?.supportPct ?? 0) - (a.evidence?.supportPct ?? 0),
    )
    .filter((n) => {
      if (
        !n.productId ||
        seen.has(n.productId) ||
        !items.some(
          (i) => i.productId === n.productId && i.product.isActive !== false,
        )
      )
        return false;
      seen.add(n.productId);
      return true;
    })
    .slice(0, 4);
}
