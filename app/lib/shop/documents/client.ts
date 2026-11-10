import type {
  BrandingDraft,
  BrandingMetadata,
  DocumentContextView,
  PrintableDocument,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export type BrandingResult = BrandingMetadata & {
  previews?: Record<string, string>;
  savedVersion?: string;
};
export type BrandingSave = {
  clientId: string;
  expectedVersion: string | null;
  draft: BrandingDraft;
};
export function bindDocuments(send: Send) {
  const path = (s: string) =>
      "/api/shops/" + encodeURIComponent(s) + "/document-branding",
    post = <T>(p: string, v: unknown) =>
      send<T>(p, { method: "POST", body: JSON.stringify(v) });
  return {
    get: (s: string) => send<BrandingResult>(path(s)),
    save: (s: string, v: BrandingSave) => post<BrandingResult>(path(s), v),
    upload: (s: string, kind: "logo" | "signature", base64: string) =>
      post<{ id: string; dataUrl: string }>(path(s) + "/assets", {
        kind,
        base64,
      }),
    preview: (s: string, draft: BrandingDraft, count: number) =>
      post<{ context: DocumentContextView; model: PrintableDocument }>(
        path(s) + "/preview",
        { draft, count },
      ),
    context: (s: string, id: string) =>
      send<DocumentContextView>(
        path(s) + "/contexts/" + encodeURIComponent(id),
      ),
  };
}
export type DocumentsApi = ReturnType<typeof bindDocuments>;
export function documentErrorKey(error: unknown) {
  const code = String(
    (error as { code?: string; message?: string })?.code ||
      (error as Error)?.message ||
      "",
  ).replace(/^document_/, "");
  if (code === "unsupported") return "documents.error.update";
  return (
    "documents.error." +
    ([
      "invalid",
      "not_allowed",
      "not_found",
      "stale",
      "request_conflict",
      "image_invalid",
      "image_size",
      "image_dimensions",
      "signature_required",
      "asset_missing",
      "invalid_context",
      "context_missing",
      "integrity",
      "unavailable",
      "update",
      "render",
      "scope",
    ].includes(code)
      ? code
      : "failed")
  );
}
