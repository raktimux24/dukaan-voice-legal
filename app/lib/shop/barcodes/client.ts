import type {
  BarcodeMetadata,
  BarcodeProduct,
  BarcodePng,
  BarcodeRequest,
  BarcodeOutcome,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindBarcodes(send: Send) {
  const path = (shop: string) =>
    "/api/shops/" + encodeURIComponent(shop) + "/barcodes";
  return {
    metadata: (shop: string) => send<BarcodeMetadata>(path(shop)),
    product: (shop: string, id: string) =>
      send<BarcodeProduct>(path(shop) + "/products/" + encodeURIComponent(id)),
    png: (shop: string, id: string) =>
      send<BarcodePng>(
        path(shop) + "/products/" + encodeURIComponent(id) + "/png",
      ),
    apply: (shop: string, input: BarcodeRequest) =>
      send<BarcodeOutcome>(path(shop) + "/apply", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    outcome: (shop: string, id: string) =>
      send<BarcodeOutcome>(path(shop) + "/requests/" + encodeURIComponent(id)),
  };
}
export type BarcodesApi = ReturnType<typeof bindBarcodes>;
export function barcodeErrorKey(error: unknown) {
  const code = String((error as { code?: string })?.code ?? "").replace(
    /^barcode_/,
    "",
  );
  return (
    "barcodes.error." +
    ([
      "invalid",
      "not_allowed",
      "not_found",
      "archived",
      "ambiguous",
      "conflict",
      "reserved",
      "replace_required",
      "invalid_request",
      "request_conflict",
      "request_missing",
      "missing",
      "stale",
      "unavailable",
      "unprintable",
    ].includes(code)
      ? code
      : "failed")
  );
}
