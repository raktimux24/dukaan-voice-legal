export type PoStatus =
  | "draft"
  | "issued"
  | "part_received"
  | "received"
  | "cancelled"
  | "closed";
export interface PoLine {
  id: string;
  buyListItemId?: string;
  productId?: string;
  name: string;
  unit: string;
  quantity: string;
  price: string;
  received: string;
  rejected: string;
  cancelled: string;
}
export interface PoReceiptLine {
  lineId: string;
  productId: string;
  quantity: string;
  rejected: string;
  reason: string;
  cost: string;
  batchId?: string;
  batchNumber: string;
  expiryDate: string;
}
export interface PoReceipt {
  id: string;
  actor: string;
  at: string;
  reference: string;
  lines: PoReceiptLine[];
}
export interface PurchaseOrder {
  id: string;
  shopId: string;
  version: number;
  number: string;
  status: PoStatus;
  supplierId: string;
  supplier: {
    name: string;
    gstin?: string;
    address?: string;
    inventorySupplierName?: string;
  };
  expectedDate: string;
  notes: string;
  lines: PoLine[];
  receipts: PoReceipt[];
  events: { at: string; actor: string; kind: string; note: string }[];
  createdAt: string;
  updatedAt: string;
}
export interface PoDraft {
  supplierId: string;
  expectedDate: string;
  notes: string;
  lines: {
    id: string;
    buyListItemId?: string;
    productId?: string;
    name: string;
    unit: string;
    quantity: string;
    price: string;
  }[];
}
export interface PoOptions {
  suppliers: { id: string; name: string }[];
  products: { id: string; name: string; unit: string; price: string }[];
  buyList: {
    id: string;
    name: string;
    productId: string | null;
    unit: string | null;
    quantity: string | null;
    committed: string;
  }[];
  more: boolean;
}
export type PoAction =
  | { kind: "create"; draft: PoDraft }
  | { kind: "save"; id: string; version: number; draft: PoDraft }
  | {
      kind: "issue" | "cancel" | "close" | "share";
      id: string;
      version: number;
      note?: string;
    }
  | {
      kind: "receive";
      id: string;
      version: number;
      reference: string;
      lines: Omit<PoReceiptLine, "batchId">[];
    };
export interface PoRequest {
  clientId: string;
  action: PoAction;
}
export const poRemaining = (l: PoLine) =>
  Math.max(
    0,
    Math.round(
      (Number(l.quantity) - Number(l.received) - Number(l.cancelled)) * 1000,
    ) / 1000,
  );
export const poUnits = (n: number) => String(Math.round(n * 1000) / 1000);
export function poShareText(
  p: PurchaseOrder,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  return [
    t("po.title") + " " + p.number,
    t("po.not_invoice"),
    t("po.supplier") + ": " + p.supplier.name,
    ...p.lines.map(
      (l) =>
        `${l.name} · ${l.quantity} ${l.unit}${l.price ? " · " + t("po.estimate") + " ₹" + l.price : ""}`,
    ),
    ...(p.expectedDate ? [t("po.expected") + ": " + p.expectedDate] : []),
    p.notes,
  ]
    .filter(Boolean)
    .join("\n");
}
