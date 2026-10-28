export interface EstimateLine {
  id: string;
  productId: string;
  name: string;
  unit: string;
  quantity: string;
  price: string;
  discount: string;
  tax: unknown | null;
}
export interface EstimateDraft {
  validUntil: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  note: string;
  billDiscount: string;
  lines: Omit<EstimateLine, "tax">[];
}
export interface EstimateSource {
  collectionConfirmed?:boolean;
  commerceOrderId?:string;
  estimateId: string;
  intentId: string;
  deviceId: string;
  saleClientId: string;
  termsHash: string;
  number: string;
  reviewed?: boolean;
}
export interface EstimateTaxIssue {
  phase: "issue" | "billing";
  code: "missing" | "invalid" | "unsupported" | "settings";
  productId?: string;
  name?: string;
}
export interface Estimate {
  commerceOrderId?:string;
  id: string;
  shopId: string;
  createdBy: string;
  version: number;
  number: string;
  status:
    | "draft"
    | "issued"
    | "accepted"
    | "declined"
    | "cancelled"
    | "revised"
    | "converted";
  shopName: string;
  draft: EstimateDraft;
  lines: EstimateLine[];
  registration: string;
  priceMode: "inclusive" | "exclusive";
  settingsVersion: string;
  supported?: boolean;
  taxIssues?: EstimateTaxIssue[];
  tax: string;
  net: string;
  total: string;
  termsHash: string;
  documentRef?: { version: 1; id: string; hash: string };
  replacesId?: string;
  intent?: {
    source: EstimateSource;
    actor: string;
    phase: "reserved" | "started";
    at: string;
  };
  saleId?: string;
  events: { kind: string; actor: string; at: string; note: string }[];
  createdAt: string;
  updatedAt: string;
}
export interface EstimateOptions {
  products: {
    id: string;
    name: string;
    unit: string;
    price: string;
    available: string;
    mrp: string | null;
  }[];
  more: boolean;
}
export type EstimateAction =
  | { kind: "create"; draft: EstimateDraft }
  | { kind: "save"; id: string; version: number; draft: EstimateDraft }
  | {
      kind:
        | "issue"
        | "share"
        | "accept"
        | "decline"
        | "cancel"
        | "revise"
        | "release";
      id: string;
      version: number;
      note?: string;
    }
  | { kind: "reserve"; id: string; version: number; deviceId: string };
export const estimateToday = () =>
  new Date(Date.now() + 19800000).toISOString().slice(0, 10);
export const estimateExpired = (p: Estimate) =>
  !!p.draft.validUntil && p.draft.validUntil < estimateToday();
export const emptyEstimate = (): EstimateDraft => ({
  validUntil: "",
  customerId: null,
  customerName: "",
  customerPhone: "",
  note: "",
  billDiscount: "0",
  lines: [],
});
export function estimateText(
  p: Estimate,
  t: (k: string, v?: Record<string, string | number>) => string,
) {
  return [
    p.shopName,
    t("estimates.title") + " " + p.number,
    t("estimates.not_invoice"),
    ...(p.draft.customerName
      ? [t("estimates.customer") + ": " + p.draft.customerName]
      : []),
    ...p.lines.map(
      (l) =>
        `${l.name} · ${l.quantity} ${l.unit} × ₹${l.price}${Number(l.discount) ? " · " + t("estimates.discount") + " ₹" + l.discount : ""}`,
    ),
    t("estimates.tax") + ": ₹" + p.tax,
    t("estimates.total") + ": ₹" + p.total,
    ...(p.draft.validUntil
      ? [t("estimates.valid_until") + ": " + p.draft.validUntil]
      : []),
    p.draft.note,
    t("estimates.share_disclaimer"),
  ]
    .filter(Boolean)
    .join("\n");
}

export interface EstimateRequest {
  clientId: string;
  action: EstimateAction;
}

export const estimateUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
