export const BARCODE_BATCH_LIMIT = 100;
export type BarcodeItem = {
  id: string;
  name: string;
  value: string | null;
  active: boolean;
  aliases: string[];
  internal: boolean;
  conflict: boolean;
};
export type BarcodeMetadata = {
  items: BarcodeItem[];
  limit: number;
  conflicts: {
    value: string;
    products: { id: string; name: string; active: boolean }[];
  }[];
};
export type BarcodeProduct = { item: BarcodeItem };
export type BarcodePng = {
  filename: string;
  mime: "image/png";
  base64: string;
  value: string;
  width: number;
  height: number;
};
export type BarcodeRequest =
  | { clientId: string; kind: "generate"; productIds: string[] }
  | {
      clientId: string;
      kind: "replace";
      productId: string;
      expectedBarcode: string;
      value: string;
      reason: string;
    };
export type BarcodeOutcome = {
  id: string;
  generated: number;
  preserved: number;
  replaced: number;
  items: { id: string; name: string; value: string; generated: boolean }[];
};
/** Exact text only: never discard letters, leading zeros or scanner prefixes. */
export function cachedBarcodeMatches<
  T extends {
    productId: string;
    product: {
      barcode?: string | null;
      barcodeAliases?: string[];
      isActive?: boolean;
    };
  },
>(items: T[] | undefined, value: string): T[] {
  return (items ?? []).filter(
    (i) =>
      i.product.isActive !== false &&
      (i.product.barcode === value ||
        i.product.barcodeAliases?.includes(value)),
  );
}
export function isBarcodeQuery(value: string) {
  return /^SB-[A-F0-9]{20}$/.test(value) || /^\d{6,100}$/.test(value);
}
