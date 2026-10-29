import type { Estimate, EstimateDraft } from "./contract";
export function draftFromCart(
  cart: {
    lines: {
      productId: string | null;
      name: string;
      unit: string;
      quantity: number;
      price: number;
      discount: number;
      rsp?: unknown;
    }[];
    billDiscount: number;
    note: string;
    customerId: string | null;
    customerName: string | null;
    customerPhone: string | null;
  },
  uuid: () => string,
): EstimateDraft {
  if (cart.lines.some((l) => !l.productId || l.rsp))
    throw Error("estimates_unsupported");
  return {
    validUntil: "",
    customerId: cart.customerId,
    customerName: cart.customerName ?? "",
    customerPhone: cart.customerPhone ?? "",
    note: cart.note,
    billDiscount: String(cart.billDiscount),
    lines: cart.lines.map((l) => ({
      id: uuid(),
      productId: l.productId!,
      name: l.name,
      unit: l.unit,
      quantity: String(l.quantity),
      price: l.price.toFixed(2),
      discount: l.discount.toFixed(2),
    })),
  };
}
export function cartFromEstimate(
  p: Estimate,
  catalog: {
    productId: string;
    quantity: number;
    product: {
      unit: string;
      trackStock?: boolean;
      mrp?: number | null;
      gstTaxSnapshot?: unknown;
      gstRspSnapshot?: unknown;
    };
  }[],
) {
  if (!p.intent || p.status !== "accepted")
    throw Error("estimates_in_progress");
  return {
    draftId: p.intent.source.saleClientId,
    estimateSource: p.intent.source,
    lines: p.lines.map((l) => {
      const item = catalog.find((x) => x.productId === l.productId);
      if (!item || item.product.unit !== l.unit)
        throw Error("estimates_products");
      return {
        key: l.id,
        productId: l.productId,
        name: l.name,
        unit: l.unit,
        quantity: Number(l.quantity),
        price: Number(l.price),
        listPrice: Number(l.price),
        discount: Number(l.discount),
        trackStock: item.product.trackStock !== false,
        available: item.product.trackStock === false ? null : item.quantity,
        mrp: item.product.mrp ?? null,
        gstConfig: l.tax,
        gstTaxSnapshot: item.product.gstTaxSnapshot,
        gstRspSnapshot: item.product.gstRspSnapshot,
      };
    }),
    billDiscount: Number(p.draft.billDiscount),
    note: p.draft.note,
    customerId: p.draft.customerId,
    customerName: p.draft.customerName || null,
    customerPhone: p.draft.customerPhone || null,
    customerClientId: null,
    inputMethod: "manual" as const,
  };
}
/** Validate retained commercial terms before a checkout is started or journalled. */
export function assertEstimateCart(
  p: Estimate,
  cart: {
    lines: {
      productId: string | null;
      quantity: number;
      price: number;
      discount: number;
      rsp?: unknown;
    }[];
    billDiscount: number;
    customerId: string | null;
    customerName: string | null;
    customerPhone: string | null;
  },
) {
  if (
    cart.lines.length !== p.lines.length ||
    cart.billDiscount !== Number(p.draft.billDiscount) ||
    cart.lines.some(
      (l, i) =>
        l.productId !== p.lines[i].productId ||
        l.quantity !== Number(p.lines[i].quantity) ||
        l.price !== Number(p.lines[i].price) ||
        l.discount !== Number(p.lines[i].discount) ||
        !!l.rsp,
    )
  )
    throw Error("estimates_changed");
  if (
    (p.draft.customerId && cart.customerId !== p.draft.customerId) ||
    (!p.draft.customerId &&
      p.draft.customerName &&
      ((cart.customerName ?? "").trim() !== p.draft.customerName ||
        (cart.customerPhone ?? "").replace(/^\+91|^91(?=\d{10}$)|\s/g, "") !==
          p.draft.customerPhone))
  )
    throw Error("estimates_customer");
}
