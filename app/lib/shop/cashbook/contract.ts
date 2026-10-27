/** Exact decimal amounts; one immutable movement per authoritative source record. */
export const CASH_CATEGORIES = [
  "rent",
  "wages",
  "transport",
  "petty_cash",
  "utilities",
  "packaging",
  "repairs",
  "supplies",
  "other",
] as const;
export const CASH_METHODS = ["cash", "upi", "card", "bank"] as const;
export type MoneyMethod = (typeof CASH_METHODS)[number];
export const cashDay = (at: Date | string | number = Date.now()) =>
  new Date(new Date(at).getTime() + 19800000).toISOString().slice(0, 10);
export const cashUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
export interface ExpensePayment {
  id: string;
  amount: string;
  method: MoneyMethod;
  date: string;
  reference: string;
  note: string;
  actor: string;
  recordedAt: string;
  reversesId?: string;
}
export interface Expense {
  id: string;
  version: number;
  shopId: string;
  category: string;
  amount: string;
  date: string;
  payee: string;
  note: string;
  reference: string;
  createdBy: string;
  createdAt: string;
  cancelled: boolean;
  payments: ExpensePayment[];
  history: { kind: string; actor: string; at: string; note: string }[];
  paid: string;
  due: string;
}
export interface CashMovement {
  id: string;
  kind: string;
  amount: string;
  method: string;
  effectiveAt: string;
  recordedAt: string;
  actor: string;
  reference: string;
  note: string;
  entityId: string | null;
  sourceKey: string;
  backfilled: boolean;
}
export interface CashAccount {
  startAt: string;
  opening: string;
  openingRef: string | null;
  reference: string;
}
export interface CashClose {
  version: number;
  event: "close" | "reopen";
  expected: string;
  counted: string;
  difference: string;
  hash: string;
  reason: string;
  actor: string;
  at: string;
}
export interface CashSummary {
  day: string;
  opening: string;
  receipts: string;
  payments: string;
  closing: string;
  methods: Record<MoneyMethod, { in: string; out: string; net: string }>;
  hash: string;
  status: "open" | "closed" | "needs_review";
  close: CashClose | null;
  history: CashClose[];
  events: CashMovement[];
  totalEvents: number;
  more: boolean;
  offset: number;
  openingChanged: boolean;
  coverageAt: string;
}
export interface CashbookState {
  actors: Record<string, string>;
  role: string;
  account: CashAccount | null;
  suggested: {
    id: string;
    amount: string;
    effectiveAt: string;
    reference: string;
  } | null;
  categories: { id: string; name: string; builtin: boolean }[];
  summary: CashSummary | null;
  expenses: Expense[];
  moreExpenses: boolean;
  expenseOffset: number;
}
export type CashAction =
  | {
      kind: "init";
      day: string;
      opening: string;
      openingRef: string | null;
      reference: string;
      reviewed: boolean;
    }
  | {
      kind: "expense";
      date: string;
      category: string;
      amount: string;
      payee: string;
      note: string;
      reference: string;
      paid: boolean;
      method: MoneyMethod;
    }
  | {
      kind: "pay";
      id: string;
      version: number;
      amount: string;
      method: MoneyMethod;
      date: string;
      reference: string;
      note: string;
    }
  | {
      kind: "reverse";
      id: string;
      version: number;
      paymentId: string;
      date: string;
      reason: string;
    }
  | { kind: "cancel"; id: string; version: number; reason: string }
  | {
      kind: "cash";
      direction: "in" | "out";
      type: "owner" | "adjustment";
      amount: string;
      date: string;
      reason: string;
      reference: string;
    }
  | {
      kind: "close";
      day: string;
      hash: string;
      counted: string;
      reason: string;
      reviewed: boolean;
    }
  | { kind: "reopen"; day: string; reason: string }
  | { kind: "category"; name: string }
  | { kind: "export"; day: string; language: string };
export interface CashRequest {
  clientId: string;
  action: CashAction;
}
export interface CashResult {
  status: "recorded";
  expenseId?: string;
  export?: { filename: string; content: string; hash: string };
}
