import type { InventoryItem, Nudge, SaleItem } from "./types";
import type { SubscriptionEntitlement } from "../subscriptions";

export function homeBillProductId(
  items: Pick<SaleItem, "name" | "productId">[],
  name: string | null,
) {
  if (!name) return null;
  const ids = new Set(
    items.filter((item) => item.name === name).map((item) => item.productId),
  );
  // Two different products can share the same historical name. Keep the
  // placeholder in that case, or when the original product was removed.
  return ids.size === 1 ? ([...ids][0] ?? null) : null;
}

export function searchHomeCatalog(
  items: InventoryItem[] | undefined,
  value: string,
) {
  const query = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (!query) return [];
  return (items ?? [])
    .filter((item) => item.product.isActive !== false)
    .map((item) => {
      const p = item.product,
        name = p.name.toLowerCase(),
        code = p.shortCode?.toLowerCase();
      const barcodes = [p.barcode, ...(p.barcodeAliases ?? [])].filter(
        (v): v is string => !!v,
      );
      const score =
        code === query || barcodes.includes(value.trim())
          ? 100
          : name.startsWith(query)
            ? 80
            : name.split(" ").some((word) => word.startsWith(query))
              ? 60
              : name.includes(query)
                ? 40
                : code?.startsWith(query)
                  ? 30
                  : barcodes.some((barcode) =>
                        barcode.toLowerCase().includes(query),
                      )
                    ? 20
                    : 0;
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.product.name.localeCompare(b.item.product.name),
    )
    .slice(0, 8)
    .map((row) => row.item);
}

export type DemandTerm = {
  normalized: string;
  term: string;
  asks: number;
  people: number;
  last_asked: string;
};
export function matchHomeDemand(
  terms: DemandTerm[] | undefined,
  value: string,
) {
  const query = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!query) return null;
  return (
    terms?.find(({ normalized: term }) => {
      if (
        term === query ||
        (term.length >= 3 &&
          query.length >= 3 &&
          (term.startsWith(query + " ") || query.startsWith(term + " ")))
      )
        return true;
      if (Math.abs(term.length - query.length) > 2) return false;
      let row = Array.from({ length: term.length + 1 }, (_, i) => i);
      for (let i = 1; i <= query.length; i++) {
        const next = [i];
        for (let j = 1; j <= term.length; j++)
          next[j] = Math.min(
            next[j - 1] + 1,
            row[j] + 1,
            row[j - 1] + Number(query[i - 1] !== term[j - 1]),
          );
        row = next;
      }
      return row[term.length] <= 2;
    }) ?? null
  );
}

export function homeTrialNotice(
  entitlement: SubscriptionEntitlement | null,
  now = Date.now(),
) {
  if (!entitlement || entitlement.temporaryPremium) return null;
  const remaining =
    entitlement.daysLeftInTrial ??
    Math.max(
      0,
      Math.ceil((Date.parse(entitlement.trialEnd ?? "") - now) / 86400000),
    );
  if (
    entitlement.status === "trialing" &&
    entitlement.trialSource === "auto" &&
    remaining <= 3
  )
    return { ending: true, days: Math.max(0, remaining) };
  const age = now - Date.parse(entitlement.trialEnd ?? "");
  if (entitlement.status === "expired" && age >= 0 && age < 7 * 86400000)
    return { ending: false, days: 0 };
  return null;
}

export function homeNudgeLink(nudge: Nudge) {
  const p = nudge.action?.params ?? {},
    productId = p.productId ?? nudge.productId,
    customerId = p.customerId ?? nudge.customerId;
  switch (nudge.action?.type) {
    case "add_to_cart":
    case "open_product":
      return typeof productId === "string"
        ? `/shop/products/${encodeURIComponent(productId)}`
        : null;
    case "open_customer":
      return typeof customerId === "string"
        ? `/shop/customers/${encodeURIComponent(customerId)}`
        : null;
    case "remind_customer":
      return p.kind !== "lapsed" && typeof customerId === "string"
        ? `/shop/customers/followups?customerId=${encodeURIComponent(customerId)}`
        : null;
    case "add_product":
      return `/shop/products/new?name=${encodeURIComponent(typeof p.name === "string" ? p.name : "")}`;
    default:
      return null;
  }
}
