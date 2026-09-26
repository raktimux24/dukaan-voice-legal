import catalogJson from "./catalog-taxonomy.json";

export type CatalogItemType = "physical" | "service";

export interface CatalogL2 {
  code: string;
  label: string;
  itemType: CatalogItemType;
}
export interface CatalogL1 {
  code: string;
  label: string;
  l2: CatalogL2[];
}
export interface CatalogSubtype {
  code: string;
  label: string;
}
export interface CatalogShopType {
  code: string;
  label: string;
  helper: string;
  subtypes: CatalogSubtype[];
  coreL1: string[];
  extraL1BySubtype: Record<string, string[]>;
}

export const CATALOG = catalogJson as {
  shopTypes: CatalogShopType[];
  l1: CatalogL1[];
};

export const SHOP_CATEGORY_CODES = CATALOG.shopTypes.map((s) => s.code);
export type ShopCategoryCode = (typeof SHOP_CATEGORY_CODES)[number];

const L1_BY_CODE = new Map(CATALOG.l1.map((l) => [l.code, l]));
const SHOP_BY_CODE = new Map(CATALOG.shopTypes.map((s) => [s.code, s]));

const LEGACY_SHOP: Record<string, { category: string; subtype: string }> = {
  kirana: { category: "general", subtype: "kirana" },
  grocery: { category: "general", subtype: "grocery" },
  wholesale: { category: "general", subtype: "kirana" },
  other: { category: "general", subtype: "kirana" },
  restaurant: { category: "food", subtype: "restaurant" },
  medical: { category: "medical", subtype: "chemist" },
};

const LEGACY_PRODUCT_L1: Record<string, string> = {
  grains: "staples",
  personal_care: "personal-care",
  other: "staples",
};

export function remapShopCategory(raw: string | null | undefined): string {
  if (!raw) return "general";
  if (SHOP_BY_CODE.has(raw)) return raw;
  return LEGACY_SHOP[raw]?.category ?? "general";
}

export function remapShopSubtype(rawCategory: string | null | undefined, subtype: string | null | undefined): string {
  const shop = SHOP_BY_CODE.get(remapShopCategory(rawCategory));
  if (subtype && shop?.subtypes.some((s) => s.code === subtype)) return subtype;
  if (rawCategory && LEGACY_SHOP[rawCategory]) return LEGACY_SHOP[rawCategory].subtype;
  return shop?.subtypes[0]?.code ?? "kirana";
}

export function remapProductL1(raw: string | null | undefined): string {
  if (!raw) return "staples";
  if (L1_BY_CODE.has(raw)) return raw;
  return LEGACY_PRODUCT_L1[raw] ?? raw;
}

export function shopType(code: string | null | undefined): CatalogShopType {
  return SHOP_BY_CODE.get(remapShopCategory(code)) ?? CATALOG.shopTypes[0];
}

export function enabledL1Codes(category: string | null | undefined, subtype?: string | null): string[] {
  const shop = shopType(category);
  const extra = shop.extraL1BySubtype[remapShopSubtype(category, subtype)] ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of [...shop.coreL1, ...extra]) {
    if (!seen.has(c) && L1_BY_CODE.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

export function enabledL1(category: string | null | undefined, subtype?: string | null): CatalogL1[] {
  return enabledL1Codes(category, subtype).map((c) => L1_BY_CODE.get(c)!);
}

export function l1ByCode(code: string | null | undefined): CatalogL1 | undefined {
  return L1_BY_CODE.get(remapProductL1(code));
}

export function l2ForL1(l1Code: string | null | undefined): CatalogL2[] {
  return l1ByCode(l1Code)?.l2 ?? [];
}

export function l2ByCode(l1Code: string | null | undefined, l2Code: string | null | undefined): CatalogL2 | undefined {
  if (!l2Code) return undefined;
  return l2ForL1(l1Code).find((l) => l.code === l2Code);
}

export function isAllowedL2(
  shopCategory: string | null | undefined,
  subtype: string | null | undefined,
  l1: string | null | undefined,
  l2: string | null | undefined
): boolean {
  if (!l1 || !l2) return false;
  const enabled = enabledL1Codes(shopCategory, subtype);
  if (!enabled.includes(remapProductL1(l1))) return false;
  return l2ForL1(l1).some((row) => row.code === l2);
}

export function catalogL1Label(code: string | null | undefined): string {
  return l1ByCode(code)?.label ?? code ?? "";
}

export function catalogL2Label(l1: string | null | undefined, l2: string | null | undefined): string {
  return l2ByCode(l1, l2)?.label ?? l2 ?? "";
}

export function catalogShopLabel(code: string | null | undefined): string {
  return shopType(code).label;
}

export function catalogSubtypeLabel(category: string | null | undefined, subtype: string | null | undefined): string {
  const shop = shopType(category);
  const code = remapShopSubtype(category, subtype);
  return shop.subtypes.find((s) => s.code === code)?.label ?? code;
}

/** Prefer i18n; fall back to catalog English, then the raw code. */
export function labeledL1(code: string | null | undefined, t?: (key: string) => string): string {
  const mapped = remapProductL1(code);
  if (t) {
    const key = `catalog.l1.${mapped}`;
    const v = t(key);
    if (v && v !== key) return v;
    if (code) {
      const legacy = t(`category.${code}`);
      if (legacy && legacy !== `category.${code}`) return legacy;
    }
  }
  return catalogL1Label(mapped);
}

export function labeledL2(l1: string | null | undefined, l2: string | null | undefined, t?: (key: string) => string): string {
  if (t && l2) {
    const key = `catalog.l2.${l2}`;
    const v = t(key);
    if (v && v !== key) return v;
  }
  return catalogL2Label(l1, l2);
}

export function labeledShop(code: string | null | undefined, t?: (key: string) => string): string {
  const mapped = remapShopCategory(code);
  if (t) {
    const key = `catalog.shop.${mapped}`;
    const v = t(key);
    if (v && v !== key) return v;
    if (code) {
      const legacy = t(`category.${code}`);
      if (legacy && legacy !== `category.${code}`) return legacy;
    }
  }
  return catalogShopLabel(mapped);
}

export function labeledSubtype(category: string | null | undefined, subtype: string | null | undefined, t?: (key: string) => string): string {
  const code = remapShopSubtype(category, subtype);
  if (t) {
    const key = `catalog.subtype.${code}`;
    const v = t(key);
    if (v && v !== key) return v;
  }
  return catalogSubtypeLabel(category, subtype);
}

export function l2ItemType(l1: string | null | undefined, l2: string | null | undefined): CatalogItemType {
  return l2ByCode(l1, l2)?.itemType ?? "physical";
}
