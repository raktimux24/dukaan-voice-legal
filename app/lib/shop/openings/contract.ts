/** Shared opening-position contract. Money and quantities cross the wire as decimals. */
export const OPENING_VERSION = 1;
export const OPENING_SECTIONS = [
  "stock",
  "customer",
  "supplier",
  "cash",
] as const;
export type OpeningSection = (typeof OPENING_SECTIONS)[number];
export type OpeningMode = "cutover" | "current";
export type OpeningRow = {
  id: string;
  targetId: string;
  name: string;
  unit: string;
  amount: string;
  direction: "party_owes" | "shop_owes";
  quantity: string;
  unitCost: string;
  batchNumber: string;
  expiry: string;
  dueDate: string;
  correction: boolean;
  reason: string;
  source?: {
    kind: "stock" | "customer" | "supplier";
    importId: string;
    sourceRow: number;
    hash: string;
    filename: string;
  };
};
export type OpeningDraft = {
  mode: OpeningMode;
  asOf: string;
  reference: string;
  note: string;
  step: number;
  stock: OpeningRow[];
  customer: OpeningRow[];
  supplier: OpeningRow[];
  cash: OpeningRow[];
};
export type OpeningTarget = {
  id: string;
  name: string;
  unit?: string;
  quantity?: string;
  balance?: string;
  hash?: string;
  opening?: {
    ref: string;
    amount: string;
    quantity?: string;
    dueDate: string | null;
    asOf: string;
    remaining?: string;
    sessionId?: string;
  };
};
export type OpeningReviewedRow = {
  id: string;
  section: OpeningSection;
  targetId: string;
  name: string;
  unit?: string;
  before: string;
  after: string;
  delta: string;
  signedAmount: string | null;
  priorRef: string | null;
  targetHash: string;
  issues: string[];
  warnings: string[];
};
export type OpeningReview = {
  hash: string;
  effectiveAt: string;
  reviewedAt: string;
  issues: string[];
  devices: { id: string; name: string; lastSeenAt: string }[];
  deviceHash: string;
  rows: OpeningReviewedRow[];
  totals: {
    receivable: string;
    customerCredit: string;
    payable: string;
    supplierCredit: string;
    stockRows: number;
    knownStockValue: string;
    unknownCostRows: number;
    cash: string | null;
  };
};
export type OpeningSession = {
  version: number;
  id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  origin: "settings" | "onboarding";
  createdMode: OpeningMode;
  state: "draft" | "review" | "applying" | "complete";
  draft: OpeningDraft;
  review: OpeningReview | null;
  confirmedHash: string | null;
  outcomes: {
    rowId: string;
    section: OpeningSection;
    entryId: string;
    recordedAt: string;
  }[];
  sources: {
    kind: "stock" | "customer" | "supplier";
    importId: string;
    filename: string;
  }[];
};
export type OpeningEntry = {
  version: 1;
  id: string;
  sessionId: string;
  section: OpeningSection;
  targetId: string;
  type: "opening" | "correction" | "reversal" | "settlement";
  name: string;
  unit?: string;
  amount: string | null;
  quantity: string | null;
  delta: string;
  before: string;
  after: string;
  unitCost: string | null;
  dueDate: string | null;
  asOf: string;
  effectiveAt: string;
  reference: string;
  note: string;
  reason: string;
  replacesRef: string | null;
  source: OpeningRow["source"] | null;
  createdBy: string;
  recordedAt: string;
  ledgerId?: string;
  batches?: { batchId: string; quantity: string }[];
  method?: "cash" | "upi" | "bank" | "card";
};
export type OpeningHistory = { entry: OpeningEntry; hash: string };
export type OpeningMetadata = {
  available: boolean;
  version: 1;
  role: string;
  customerAvailable: boolean;
  setup: "not_started" | "skipped" | "in_progress" | "complete";
  sessions: Pick<
    OpeningSession,
    "id" | "state" | "createdAt" | "updatedAt" | "origin"
  >[];
};
export type OpeningConfirmation = {
  clientId: string;
  version: number;
  reviewHash: string;
  deviceIds: string[];
  workResolved: boolean;
  overlapReviewed: boolean;
  localPendingCount: number;
};
export type OpeningSupplierPayment = {
  sessionId: string;
  clientId: string;
  targetId: string;
  expectedHash: string;
  amount: string;
  method: "cash" | "upi" | "bank" | "card";
  occurredAt: string;
  reference: string;
  note: string;
};
export type OpeningPending = {
  sessionId: string;
  operation: "confirm" | "apply" | "supplier_settlement";
  payload:
    | OpeningConfirmation
    | { clientId: string; version: number; localPendingCount: number }
    | OpeningSupplierPayment;
};
export const openingToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function emptyOpeningDraft(mode: OpeningMode = "cutover"): OpeningDraft {
  const date = new Date(Date.now() - 86400000);
  return {
    mode,
    asOf: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date),
    reference: "",
    note: "",
    step: 0,
    stock: [],
    customer: [],
    supplier: [],
    cash: [],
  };
}
export function newOpeningRow(id: string, targetId: string): OpeningRow {
  return {
    id,
    targetId,
    name: "",
    unit: "",
    amount: "",
    direction: "party_owes",
    quantity: "",
    unitCost: "",
    batchNumber: "",
    expiry: "",
    dueDate: "",
    correction: false,
    reason: "",
  };
}
export function rowForOpeningTarget(
  id: string,
  section: OpeningSection,
  target: OpeningTarget,
): OpeningRow {
  const row = newOpeningRow(id, target.id);
  row.name = target.name;
  row.unit = target.unit ?? "";
  row.quantity = target.quantity ?? "";
  row.correction = !!target.opening;
  const amount =
    target.opening?.amount ?? (section === "cash" ? target.balance : undefined);
  if (amount !== undefined) {
    row.amount = amount.replace(/^-/, "");
    row.direction =
      section === "customer"
        ? amount.startsWith("-")
          ? "shop_owes"
          : "party_owes"
        : amount.startsWith("-")
          ? "party_owes"
          : "shop_owes";
  } else if (section === "supplier") row.direction = "shop_owes";
  row.dueDate = target.opening?.dueDate ?? "";
  return row;
}
export function openingProgress(s: OpeningSession) {
  return OPENING_SECTIONS.map((section) => {
    const total = s.draft[section].length,
      done = s.outcomes.filter((o) => o.section === section).length;
    return {
      section,
      total,
      done,
      state:
        total === 0
          ? "skipped"
          : done === total
            ? "complete"
            : done
              ? "partial"
              : "pending",
    };
  });
}
export function openingErrorKey(error: unknown) {
  const e = error as { code?: string; message?: string; status?: number };
  const code = String(e?.code || e?.message || "failed").replace(
    /^opening_/,
    "",
  );
  if (e?.status === 402) return "opening.error.premium";
  return (
    "opening.error." +
    ([
      "invalid",
      "not_allowed",
      "not_found",
      "stale",
      "resolve",
      "reference",
      "empty",
      "unavailable",
      "scope",
      "pending",
      "conflict",
      "already_started",
      "historical",
      "settlement",
      "premium",
      "storage",
      "closed",
      "offline",
      "failed",
    ].includes(code)
      ? code
      : "failed")
  );
}
