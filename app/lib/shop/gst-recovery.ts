import type { ShopApi } from "./api";
import type { CreateSalePayload } from "./types";
import {
  assertScope,
  financialScope,
  requestStatus,
  retainedRequests,
  sha256,
  withFinancialLock,
  type RetainedRequest,
} from "./gst-storage";
import { issueSale } from "./gst-issuance";

/** Replay only the original, scoped request through the same receipt verifier as its form. */
export async function recoverFinancialRequest(
  api: ShopApi,
  shop: string,
  row: RetainedRequest,
) {
  const scope = financialScope(shop);
  if (
    row.actorId !== scope.actorId ||
    row.shopId !== shop ||
    row.state !== "pending"
  )
    throw Error("This request does not belong to the active account and shop.");
  const base = `/api/shops/${shop}`;
  if (!row.path.startsWith(base + "/"))
    throw Error("The saved request belongs to another shop.");
  const path = row.path.slice(base.length);
  const body = row.payload;
  const gst = api.gst;
  const invoke = async <T>(operation: Promise<T>) => {
    const result = await operation;
    assertScope(scope);
    return result;
  };
  if (path === "/sales")
    return invoke(issueSale(api, shop, body as CreateSalePayload));
  if (path === "/purchases/suppliers")
    return invoke(
      gst.saveSupplier(shop, body as Parameters<typeof gst.saveSupplier>[1]),
    );
  if (path === "/purchases")
    return invoke(
      gst.createPurchase(
        shop,
        body as Parameters<typeof gst.createPurchase>[1],
      ),
    );
  if (path === "/inventory/tax-profiles/import")
    return invoke(
      gst.importTax(shop, body as Parameters<typeof gst.importTax>[1]),
    );
  let match = path.match(
    /^\/purchases\/([^/]+)\/(itc-review|returns|settlements|settlement-reversals)$/,
  );
  if (match) {
    const id = match[1];
    switch (match[2]) {
      case "itc-review":
        return invoke(
          gst.reviewItc(shop, id, body as Parameters<typeof gst.reviewItc>[2]),
        );
      case "returns":
        return invoke(
          gst.returnPurchase(
            shop,
            id,
            body as Parameters<typeof gst.returnPurchase>[2],
          ),
        );
      case "settlements":
        return invoke(
          gst.settle(shop, id, body as Parameters<typeof gst.settle>[2]),
        );
      case "settlement-reversals":
        return invoke(
          gst.reverseSettlement(
            shop,
            id,
            body as Parameters<typeof gst.reverseSettlement>[2],
          ),
        );
    }
  }
  if (
    path === "/gst-exports/numbering" ||
    path === "/gst-exports/mixed-credits"
  ) {
    const input = body as { requestId: string; exclusiveThrough?: string };
    if (input.requestId !== row.id)
      throw Error("The saved report request identity is invalid.");
    const report = await invoke(
      path.endsWith("numbering")
        ? gst.numberReport(shop, input.requestId)
        : gst.creditReport(shop, input.exclusiveThrough!, input.requestId),
    );
    await invoke(gst.downloadReport(shop, report.id, report.contentHash));
    await requestStatus(row.id, {
      state: "confirmed",
      result: report,
      error: undefined,
    });
    return report;
  }
  match = path.match(/^\/gst-exports\/(periods|turnover)\/([^/]+)$/);
  if (match)
    return match[1] === "periods"
      ? invoke(
          gst.changePeriod(
            shop,
            match[2],
            body as Parameters<typeof gst.changePeriod>[2],
          ),
        )
      : invoke(
          gst.saveTurnover(
            shop,
            match[2],
            body as Parameters<typeof gst.saveTurnover>[2],
          ),
        );
  match = path.match(
    /^\/sales\/([^/]+)\/(manual-credits|debit-notes|returns)$/,
  );
  if (match) {
    if (match[2] === "manual-credits")
      return invoke(
        gst.manualCredit(
          shop,
          match[1],
          body as Parameters<typeof gst.manualCredit>[2],
        ),
      );
    if (match[2] === "debit-notes")
      return invoke(
        gst.debitNote(
          shop,
          match[1],
          body as Parameters<typeof gst.debitNote>[2],
        ),
      );
    const total = row.verification?.returnTotal;
    if (typeof total === "number" && Number.isFinite(total))
      return invoke(
        gst.returnSale(
          shop,
          match[1],
          body as Parameters<typeof gst.returnSale>[2],
          total,
        ),
      );
  }
  match = path.match(/^\/adjustments\/([^/]+)\/settlements$/);
  if (match)
    return invoke(
      gst.debitSettlement(
        shop,
        match[1],
        body as Parameters<typeof gst.debitSettlement>[2],
      ),
    );
  match = path.match(/^\/customers\/([^/]+)\/payments$/);
  if(match) return invoke(gst.recordCustomerPayment(shop,match[1],body as Parameters<typeof gst.recordCustomerPayment>[2]));
  match = path.match(/^\/customers\/([^/]+)\/collection-reviews$/);
  if (match)
    return invoke(
      gst.reviewCollection(
        shop,
        match[1],
        body as Parameters<typeof gst.reviewCollection>[2],
      ),
    );
  throw Error(
    "Keep this saved request and use its original workflow or ask support to confirm the outcome. No new request was sent.",
  );
}

/** Terminal closure is server confirmed, preserves evidence, and never deletes a request. */
export async function closeUnrecordedPurchase(
  api: ShopApi,
  shop: string,
  row: RetainedRequest,
  reason: string,
) {
  const scope = financialScope(shop);
  if (
    row.actorId !== scope.actorId ||
    row.shopId !== shop ||
    row.state !== "pending" ||
    !row.path.startsWith(`/api/shops/${shop}/purchases`)
  )
    throw Error("This saved request cannot be closed here.");
  const suffix = row.path.slice(`/api/shops/${shop}`.length);
  const match = suffix.match(
    /^\/purchases\/([^/]+)\/(itc-review|returns|settlements|settlement-reversals)$/,
  );
  const operation =
    suffix === "/purchases/suppliers"
      ? "supplier"
      : suffix === "/purchases"
        ? "invoice"
        : match
          ? (
              {
                "itc-review": "review",
                returns: "return",
                settlements: "settlement",
                "settlement-reversals": "settlement-reversal",
              } as Record<string, string>
            )[match[2]]
          : null;
  if (!operation || !reason.trim() || reason.length > 500)
    throw Error("Enter a reason and choose a supported purchase request.");
  return withFinancialLock(scope, async () => {
    const { canonicalJson } = await import("./gst-core/sale-request-canonical");
    const current = (await retainedRequests(scope)).find((entry) => entry.id === row.id);
    if (!current || current.state !== "pending" || current.path !== row.path ||
        canonicalJson(current.payload) !== canonicalJson(row.payload))
      throw Error("This saved request cannot be closed here.");
    const payload = current.payload as Record<string, unknown>;
    const receipt = await api.gst.post<{
      status: string;
      shopId: string;
      operation: string;
      clientId: string;
      invoiceId: string | null;
      requestHash: string;
      receiptId: string;
    }>(`/api/shops/${shop}/purchases/request-closure`, {
      operation,
      invoiceId: match?.[1],
      request: payload,
      reason,
    });
    assertScope(scope);
    if (
      receipt.status !== "closed" ||
      receipt.shopId !== shop ||
      receipt.operation !== operation ||
      receipt.clientId !== row.id ||
      receipt.invoiceId !== (match?.[1] ?? null) ||
      receipt.requestHash !== (await sha256(canonicalJson(payload))) ||
      !/^[a-f0-9-]{36}$/i.test(receipt.receiptId)
    )
      throw Error(
        "The closure receipt could not be verified. Keep the original request.",
      );
    await requestStatus(row.id, {
      state: "closed",
      result: receipt,
      error: undefined,
    });
    return receipt;
  });
}
