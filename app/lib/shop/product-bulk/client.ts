import type {
  BulkSelection,
  BulkJob,
  BulkChanges,
  BulkMetadata,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindProductBulk(send: Send) {
  const path = (s: string) =>
      "/api/shops/" + encodeURIComponent(s) + "/product-bulk",
    post = <T>(url: string, input: unknown) =>
      send<T>(url, { method: "POST", body: JSON.stringify(input) });
  return {
    metadata: (s: string) => send<BulkMetadata>(path(s)),
    create: (
      s: string,
      input: { clientId: string; selection: BulkSelection },
    ) => post<BulkJob>(path(s), input),
    get: (s: string, id: string) =>
      send<BulkJob>(path(s) + "/" + encodeURIComponent(id)),
    review: (
      s: string,
      id: string,
      input: {
        version: number;
        changes: BulkChanges;
        batch: number;
        refresh?: boolean;
      },
    ) =>
      post<BulkJob>(path(s) + "/" + encodeURIComponent(id) + "/review", input),
    apply: (
      s: string,
      id: string,
      input: { version: number; clientId: string },
    ) =>
      post<BulkJob>(path(s) + "/" + encodeURIComponent(id) + "/apply", input),
  };
}
export type ProductBulkApi = ReturnType<typeof bindProductBulk>;
export const bulkErrorKey = (e: unknown) => {
  const code = String((e as { code?: string })?.code ?? "").replace(
    /^bulk_/,
    "",
  );
  return (
    "bulk.error." +
    ([
      "invalid_request",
      "no_fields",
      "invalid_price",
      "not_allowed",
      "not_found",
      "selection_changed",
      "request_conflict",
      "empty",
      "too_many",
      "stale_review",
      "already_applied",
      "resolve_errors",
      "nothing_changed",
      "unavailable",
    ].includes(code)
      ? code
      : "failed")
  );
};
