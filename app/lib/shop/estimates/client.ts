import type {
  Estimate,
  EstimateOptions,
  EstimateRequest,
  EstimateSource,
} from "./contract";
import type {
  DocumentContextView,
  PrintableDocument,
  IssuedDocument,
} from "../documents/contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindEstimates(send: Send) {
  const root = (s: string) =>
      "/api/shops/" + encodeURIComponent(s) + "/estimates",
    post = <T>(p: string, b: unknown) =>
      send<T>(p, { method: "POST", body: JSON.stringify(b) });
  return {
    list: (s: string, offset = 0) =>
      send<{ items: Estimate[]; more: boolean }>(root(s) + "?offset=" + offset),
    get: (s: string, id: string) =>
      send<Estimate>(root(s) + "/" + encodeURIComponent(id)),
    options: (s: string, q = "") =>
      send<EstimateOptions>(root(s) + "/options?q=" + encodeURIComponent(q)),
    action: (s: string, r: EstimateRequest) =>
      post<Estimate>(root(s) + "/actions", r),
    start: (s: string, source: EstimateSource) =>
      post<Estimate>(root(s) + "/start", { source }),
    readiness: (s: string, id: string) =>
      send<{
        blocked: boolean;
        changes: {
          kind: string;
          name: string;
          agreed?: string;
          current?: string;
        }[];
      }>(root(s) + "/" + encodeURIComponent(id) + "/readiness"),
    document: (s: string, id: string) =>
      send<{
        context: DocumentContextView;
        model: PrintableDocument;
        issued: IssuedDocument;
      }>(root(s) + "/" + encodeURIComponent(id) + "/document"),
  };
}
