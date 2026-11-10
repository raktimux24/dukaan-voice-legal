/** Presentation is retained independently of fiscal hashes and calculations. */
export const DOCUMENT_FONT_SET = "noto-20261027-v1" as const;
export const DOCUMENT_VERSION = 1 as const;
export const DOCUMENT_RENDERER = "samaan_documents_v1" as const;
export const DOCUMENT_LAYOUTS = ["receipt", "a4", "a5"] as const;
export type DocumentLayout = (typeof DOCUMENT_LAYOUTS)[number];
export type BrandingDraft = {
  layout: DocumentLayout;
  language: string;
  logoId: string | null;
  logoFit: "contain" | "cover";
  signatureId: string | null;
  showSignature: boolean;
  showPayment: boolean;
  terms: string;
};
export type DocumentContextRef = { version: 1; id: string; hash: string };
export type DocumentContextPayload = {
  version: 1;
  renderer: typeof DOCUMENT_RENDERER;
  fontSet: typeof DOCUMENT_FONT_SET;
  shopId: string;
  profileVersion: string;
  config: BrandingDraft;
  identity: { name: string; address: string | null; phone: string | null };
  payment: { vpa: string | null; payee: string | null; qr: string | null };
  messages: Record<string, string>;
  logoHash: string | null;
  signatureHash: string | null;
};
export type DocumentContextView = {
  ref: DocumentContextRef;
  payload: DocumentContextPayload;
  assets: Record<string, string>;
};
export type DocumentRow = { label: string; value: string; emphasis?: boolean };
export type PrintableDocument = {
  version: 1;
  source: {
    kind: "sale" | "fiscal" | "return" | "sample" | "estimate";
    id: string;
    hash?: string;
  };
  title: string;
  number: string;
  date: string;
  identity: { name: string; address: string | null; phone: string | null };
  identityLines: string[];
  customer: string | null;
  items: {
    id: string;
    name: string;
    quantity: string;
    amount: string;
    details: string[];
  }[];
  groups: string[];
  summary: DocumentRow[];
  footnotes: string[];
  status?: string | null;
  sample?: boolean;
};
export type IssuedDocument = {
  version: 1;
  context: DocumentContextRef;
  model: PrintableDocument;
  hash: string;
};
export type BrandingMetadata = {
  available: true;
  current: { id: string; draft: BrandingDraft; createdAt: string } | null;
  context: DocumentContextView | null;
};
export const defaultBranding = (language = "en"): BrandingDraft => ({
  layout: "receipt",
  language,
  logoId: null,
  logoFit: "contain",
  signatureId: null,
  showSignature: false,
  showPayment: true,
  terms: "",
});
export const DOCUMENT_PAPER = {
  receipt: { widthMm: 80, heightMm: 210, marginMm: 4 },
  a4: { widthMm: 210, heightMm: 297, marginMm: 10 },
  a5: { widthMm: 148, heightMm: 210, marginMm: 8 },
} as const;
export const documentPaper = (layout: DocumentLayout) => {
  const p = DOCUMENT_PAPER[layout];
  return {
    ...p,
    width: (p.widthMm * 96) / 25.4,
    height: (p.heightMm * 96) / 25.4,
    margin: (p.marginMm * 96) / 25.4,
  };
};
export const documentMessage = (
  messages: Record<string, string>,
  key: string,
  vars: Record<string, string | number> = {},
) =>
  (messages[key] ?? key).replace(/\{\{(\w+)\}\}/g, (all, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : all,
  );
export function presentationRef(raw: unknown): DocumentContextRef {
  const v = raw as DocumentContextRef;
  if (
    !v ||
    typeof v !== "object" ||
    Object.keys(v).some((k) => !["version", "id", "hash"].includes(k)) ||
    v.version !== 1 ||
    typeof v.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      v.id,
    ) ||
    typeof v.hash !== "string" ||
    !/^[0-9a-f]{64}$/.test(v.hash)
  )
    throw Error("document_invalid_context");
  return { version: 1, id: v.id, hash: v.hash };
}

export function documentCanonical(value: unknown): string {
  if (Array.isArray(value))
    return "[" + value.map(documentCanonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(
          (k) =>
            JSON.stringify(k) +
            ":" +
            documentCanonical((value as Record<string, unknown>)[k]),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
