import type { AuditLogEntry } from "./types";
import { productPhotoActivity } from "./product-images/activity";
import { formatINR, formatWhen } from "./money";

export const ACTIVITY_FILTERS = [
  "all",
  "sales",
  "stock",
  "voice",
  "today",
] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];
export type AuditPage = {
  logs: AuditLogEntry[];
  total: number;
  hasMore: boolean;
  limitedToDays?: number | null;
};
export type ActivityText = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
export function activityFilter(value: string | null): ActivityFilter {
  return ACTIVITY_FILTERS.includes(value as ActivityFilter)
    ? (value as ActivityFilter)
    : "all";
}
export function nextActivityPage(page: AuditPage, offset: number) {
  return page.hasMore && page.logs.length
    ? offset + page.logs.length
    : undefined;
}
export function uniqueActivity(pages: AuditPage[]) {
  const seen = new Set<string>();
  return pages
    .flatMap((page) => page.logs)
    .filter((log) => {
      if (seen.has(log.id)) return false;
      seen.add(log.id);
      return true;
    });
}
export function activityDay(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "unknown"
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
}
export function activityGroups(logs: AuditLogEntry[]) {
  const days = new Map<string, AuditLogEntry[]>();
  for (const log of logs) {
    const key = activityDay(log.createdAt);
    const rows = days.get(key) ?? [];
    rows.push(log);
    days.set(key, rows);
  }
  return Array.from(days, ([day, logs]) => ({ day, logs }));
}
const string = (v: unknown) => (typeof v === "string" ? v : "");
const value = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v)
    ? v
    : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))
      ? Number(v)
      : undefined;
const money = (v: unknown) => formatINR(value(v));
const aliases: Record<string, string> = {
  sale_created: "sale",
  sale_voided: "sale_void",
  sale_returned: "sale_return",
  stock_adjusted: "adjustment",
};
export function normalizedActivityAction(action: string) {
  return aliases[action] ?? action;
}
export function activityLabel(action: string, t: ActivityText) {
  const type = normalizedActivityAction(action);
  const keys: Record<string, string> = {
    add: "badge.add",
    remove: "badge.remove",
    update: "badge.update",
    adjustment: "badge.adjustment",
    sale: "badge.sale",
    sale_void: "badge.sale_void",
    sale_return: "badge.sale_return",
    member_role_changed: "badge.member_role_changed",
    member_removed: "badge.member_removed",
    product_images_updated: "product_images.title",
    product_bulk_edit: "bulk.title",
    barcode_generated: "barcodes.title",
    barcode_replaced: "barcodes.title",
    party_import: "imports.source",
    inventory_import: "imports.source",
    purchase_order: "po.title",
    cashbook: "cashbook.title",
    estimate: "estimates.title",
    collection_followup: "followups.title",
    document_branding_updated: "documents.title",
  };
  return t(keys[type] ?? "activityweb.record");
}
export function activitySource(method: string, t: ActivityText) {
  return t(
    (
      {
        manual: "activity.filter_manual",
        voice: "activity.filter_voice",
        scan: "activityweb.scan",
        import: "imports.source",
        system: "activityweb.system",
      } as Record<string, string>
    )[method] ?? "activityweb.other_source",
  );
}
export function activityDescription(
  log: AuditLogEntry,
  t: ActivityText,
  language?: string,
) {
  const p = log.payload ?? {},
    type = normalizedActivityAction(log.actionType),
    name = string(p.productName),
    quantity = value(p.quantity),
    unit = string(p.unit),
    batch = string(p.batchNumber),
    desc = log.description || "";
  if (type === "product_images_updated") return productPhotoActivity(p, t);
  if (type === "collection_followup")
    return t("followups.event." + String(p.kind ?? "prepared"));
  if (type === "cashbook")
    return t("cashbook.event." + String(p.operation ?? "expense"));
  if (type === "estimate" || type === "purchase_order")
    return (
      t(
        (type === "estimate" ? "estimates" : "po") +
          ".event." +
          String(p.operation ?? "create"),
      ) + (p.number != null ? " · " + String(p.number) : "")
    );
  if (type.startsWith("opening_")) return t("activity." + type);
  if (type === "document_branding_updated")
    return t("documents.activity", {
      layout: t("documents." + String(p.layout ?? "receipt")),
    });
  if (type === "product_bulk_edit")
    return t("bulk.activity", { name, batch: value(p.batch) ?? 1 });
  if (type === "barcode_generated" || type === "barcode_replaced")
    return t(
      type === "barcode_generated"
        ? "barcodes.activity_generated"
        : "barcodes.activity_replaced",
      { name },
    );
  if (
    ["party_import", "inventory_import"].includes(type) ||
    (log.inputMethod === "import" && p.importId)
  )
    return t("imports.activity", {
      name:
        name ||
        string(p.partyName) ||
        string((p.identity as { name?: unknown } | undefined)?.name),
      row: value(p.sourceRow) ?? 0,
    });
  for (const [prefix, key] of [
    ["Added new product:", "added_product"],
    ["Updated product:", "updated_product"],
    ["Deleted product:", "deleted_product"],
  ])
    if (desc.startsWith(prefix))
      return t("activity.desc." + key, {
        name: name || desc.slice(prefix.length).trim(),
      });
  if (desc.startsWith("Added batch of"))
    return t(
      batch ? "activity.desc.added_batch_num" : "activity.desc.added_batch",
      { name, quantity: quantity ?? "—", batchNumber: batch },
    );
  if ((type === "add" || type === "remove") && quantity != null)
    return t(
      "activity.desc." + (type === "add" ? "added_qty" : "removed_qty"),
      { name, quantity, unit },
    );
  if (type === "adjustment" && quantity != null)
    return t("activity.desc.adjusted_qty", {
      name,
      quantity,
      unit,
      reason: t("adjust.reason." + String(p.reason ?? "other")),
    });
  if (type === "sale") {
    const items = Array.isArray(p.items) ? p.items : [],
      first =
        items[0] && typeof items[0] === "object"
          ? string(items[0].productName)
          : "";
    return t(
      value(p.itemCount) === 1 && first
        ? "activity.desc.sale_single"
        : "activity.desc.sale_multi",
      {
        n: value(p.saleNumber) ?? "—",
        total: money(p.total),
        name: first,
        count: value(p.itemCount) ?? "—",
      },
    );
  }
  if (type === "sale_void")
    return t("activity.desc.sale_void", {
      n: value(p.saleNumber) ?? "—",
      total: money(p.total),
    });
  // A return may reduce udhaar rather than refund money. Do not call the entire value cash refunded.
  if (type === "sale_return")
    return t("activityweb.return_description", {
      n: value(p.saleNumber) ?? "—",
      amount: money(p.refundAmount),
    });
  if (type === "member_role_changed")
    return t("activity.desc.member_role_changed", {
      name: string(p.name),
      from: t("role." + String(p.from ?? "helper").toLowerCase()),
      to: t("role." + String(p.to ?? "helper").toLowerCase()),
    });
  if (type === "member_removed")
    return t("activity.desc.member_removed", {
      name: string(p.name),
      role: t("role." + String(p.role ?? "helper").toLowerCase()),
    });
  if (type === "gst_invoice_recovered")
    return t("activity.desc.gst_invoice_recovered", {
      number: string(p.invoiceNumber),
      date: formatWhen(string(p.originalIssuedAt), language),
    });
  if (type === "gst_device_reconciliation_required")
    return t("activity.desc.gst_device_reconciliation_required", {
      number: string(p.invoiceNumber),
    });
  if (type === "purchase_settlement_recorded")
    return t(
      ["payment_reversal", "supplier_refund_reversal"].includes(String(p.kind))
        ? "activity.desc.supplier_settlement_correction"
        : p.kind === "supplier_refund"
          ? "activity.desc.supplier_refund"
          : "activity.desc.supplier_payment",
      { amount: money(p.amount) },
    );
  return desc || t("activityweb.recorded");
}
export function activityTarget(
  log: AuditLogEntry,
  canManage: boolean,
): { href: string; label: string } | null {
  const p = log.payload ?? {};
  const type = normalizedActivityAction(log.actionType);
  if (type === "cashbook")
    return canManage
      ? { href: "/shop/cashbook", label: "activityweb.open_cashbook" }
      : null;
  if (type === "estimate" && string(p.estimateId))
    return {
      href: "/shop/estimates?id=" + encodeURIComponent(string(p.estimateId)),
      label: "activityweb.open_estimate",
    };
  if (string(p.saleId))
    return {
      href: "/shop/sales/" + encodeURIComponent(string(p.saleId)),
      label: "activityweb.open_bill",
    };
  if (string(p.productId))
    return {
      href: "/shop/products/" + encodeURIComponent(string(p.productId)),
      label: "activityweb.open_product",
    };
  return null;
}
/** Preserve arbitrary names as text, never as spreadsheet formulas. Export no raw payload or media references. */
export function activityCsv(
  logs: AuditLogEntry[],
  t: ActivityText,
  language?: string,
) {
  const cell = (v: unknown) => {
    let text = String(v ?? "");
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const header = [
    "activityweb.date",
    "activityweb.actor",
    "activityweb.event",
    "activityweb.source",
    "activityweb.description",
    "activityweb.event_id",
  ].map((k) => t(k));
  const rows = logs.map((log) => [
    formatWhen(log.createdAt, language),
    log.userName,
    activityLabel(log.actionType, t),
    activitySource(log.inputMethod, t),
    activityDescription(log, t, language),
    log.id,
  ]);
  return (
    "\ufeff" +
    [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
  );
}
