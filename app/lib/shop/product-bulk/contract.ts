/** Shared bulk-edit contract. Money is decimal text, never a binary float. */
export const BULK_BATCH_SIZE = 500;
export const BULK_SELECTION_LIMIT = 10000;
export type BulkFilter = {
  query: string;
  filter: "all" | "low_stock" | "out_of_stock" | "near_expiry" | "unpriced";
  category?: string;
  nativeSearch?: boolean;
};
export type BulkSelection = { ids: string[] } | { matching: BulkFilter };
export type PriceRule = {
  mode: "set" | "add" | "subtract" | "increase_percent" | "decrease_percent";
  value: string;
};
export type BulkChanges = {
  category?: { category: string; subcategory: string };
  sellingPrice?: PriceRule;
  mrp?: PriceRule;
  minStockLevel?: number;
  depletionOrder?: "expiry" | "fifo";
};
export type BulkValues = {
  category: string;
  subcategory: string | null;
  sellingPrice: string | null;
  mrp: string | null;
  minStockLevel: number;
  depletionOrder: string;
};
export type BulkRow = {
  id: string;
  name: string;
  before: BulkValues;
  after: BulkValues;
  fields: (keyof BulkValues)[];
  issues: string[];
  warnings: string[];
};
export type BulkJob = {
  id: string;
  createdAt: string;
  total: number;
  batch: number;
  batches: number;
  version: number;
  state: "selected" | "review" | "applied";
  rows: BulkRow[];
  summary: Partial<Record<keyof BulkValues, string | number | null>>;
  changes: BulkChanges;
  completed: { batch: number; changed: number; requestId: string }[];
  staleIds: string[];
};
export type BulkMetadata = {
  categories: { code: string; children: string[] }[];
  jobs: {
    id: string;
    createdAt: string;
    total: number;
    done: number;
    batches: number;
  }[];
  batchSize: number;
  selectionLimit: number;
};
export const BULK_PRICE_MODES = [
  "set",
  "add",
  "subtract",
  "increase_percent",
  "decrease_percent",
] as const;
export function bulkPaise(value: string): bigint {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) throw Error("invalid_price");
  const [w, f = ""] = value.split(".");
  const n = BigInt(w) * 100n + BigInt(f.padEnd(2, "0"));
  if (n > 100000000000n) throw Error("invalid_price");
  return n;
}
export function bulkMoney(n: bigint) {
  if (n < 0n || n > 100000000000n) throw Error("invalid_price");
  return `${n / 100n}.${String(n % 100n).padStart(2, "0")}`;
}
export function bulkPrice(before: string | null, rule: PriceRule) {
  const value = bulkPaise(rule.value);
  if (rule.mode === "set") return bulkMoney(value);
  if (before === null) throw Error("missing_price");
  const old = bulkPaise(before);
  let result: bigint;
  if (rule.mode === "add") result = old + value;
  else if (rule.mode === "subtract") result = old - value;
  else {
    if (value > 1000000n) throw Error("invalid_price");
    const factor =
      rule.mode === "increase_percent" ? 10000n + value : 10000n - value;
    if (factor < 0n) throw Error("invalid_price");
    result = (old * factor + 5000n) / 10000n;
  }
  return bulkMoney(result);
}
export function bulkCounts(job: BulkJob) {
  return {
    changed: job.rows.filter((r) => r.fields.length).length,
    errors: job.rows.filter((r) => r.issues.length).length,
  };
}
