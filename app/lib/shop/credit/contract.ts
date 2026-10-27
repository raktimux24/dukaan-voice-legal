export const creditDay = (at: Date | string | number = Date.now()) =>
  new Date(new Date(at).getTime() + 19800000).toISOString().slice(0, 10);
export interface CreditPolicy {
  enabled: boolean;
  limit: string | null;
  termDays: number | null;
  mode: "warn" | "block";
  allowOverride: boolean;
}
export const DEFAULT_CREDIT_POLICY: CreditPolicy = {
  enabled: true,
  limit: null,
  termDays: null,
  mode: "warn",
  allowOverride: false,
};
export interface CreditTerms {
  dueDate: string | null;
  acknowledged: boolean;
  overrideReason?: string;
}
export interface CreditObligation {
  key: string;
  kind: "sale" | "opening" | "adjustment";
  reference: string;
  original: string;
  remaining: string;
  paid: string;
  status: "paid" | "partial" | "unpaid";
  dueDate: string | null;
  date: string;
  history: {
    dueDate: string | null;
    reason: string;
    actor: string;
    at: string;
  }[];
}
export interface CreditState {
  allocations: {
    id: string;
    amount: string;
    reason: string;
    reversed: boolean;
  }[];
  customer: { id: string; name: string; phone: string | null };
  role: string;
  policy: CreditPolicy;
  shopPolicy: CreditPolicy;
  customPolicy: boolean;
  balance: string;
  exposure: string;
  overdue: string;
  unknownDue: string;
  unassigned: string;
  obligations: CreditObligation[];
  receipts: { id: string; amount: string; date: string }[];
  history: { kind: string; actor: string; at: string; reason: string }[];
  statements: { id: string; from: string; to: string; createdAt: string }[];
}
export interface CreditCheck {
  balance: string;
  exposure: string;
  overdue: string;
  unknownDue: string;
  unassigned: string;
  proposed: string;
  resulting: string;
  limit: string | null;
  dueDate: string | null;
  warnings: string[];
  blocked: boolean;
  canOverride: boolean;
  policy: CreditPolicy;
}
export interface StatementLine {
  id: string;
  date: string;
  recordedAt: string;
  kind: string;
  reference: string;
  debit: string;
  credit: string;
  balance: string;
  note: string;
}
export interface CreditStatement {
  id: string;
  version: 1;
  shop: { name: string; phone: string | null; address: string | null };
  customer: { id: string; name: string; phone: string | null };
  from: string;
  to: string;
  opening: string;
  debits: string;
  credits: string;
  closing: string;
  unreconciled: string;
  unassigned: string;
  lines: StatementLine[];
  obligations: CreditObligation[];
  labels: Record<string, string>;
  language: string;
  createdAt: string;
  actor: string;
  hash: string;
}
export type CreditAction =
  | {
      kind: "policy";
      target: "shop" | "customer";
      policy: CreditPolicy | null;
      reason: string;
    }
  | { kind: "due"; sourceKey: string; dueDate: string | null; reason: string }
  | {
      kind: "allocate_opening";
      ledgerId: string;
      amount: string;
      reason: string;
    }
  | { kind: "reverse_allocation"; allocationId: string; reason: string }
  | { kind: "statement"; from: string; to: string; language: string };
export interface CreditRequest {
  clientId: string;
  action: CreditAction;
}
export interface CreditResult {
  status: "recorded";
  statement?: CreditStatement;
}

export function creditDisplayDate(
  value: string,
  language = "en",
  time = false,
) {
  const locale: Record<string, string> = {
    en: "en-IN",
    hinglish: "en-IN",
    hi: "hi-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    gu: "gu-IN",
    ml: "ml-IN",
  };
  const d = new Date(value.length === 10 ? value + "T00:00:00+05:30" : value);
  return d.toLocaleString(locale[language] ?? "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
