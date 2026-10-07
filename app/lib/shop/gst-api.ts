import { confirmedCollectionReview } from "./gst-core/collection-review-outcome";
import { confirmedSaleReturnReceipt } from "./gst-core/sale-return-outcome";
import { confirmedManualCredit } from "./gst-core/manual-credit-outcome";
import { confirmedDebitNote } from "./gst-core/debit-note-outcome";
import { confirmedDebitSettlement } from "./gst-core/debit-settlement-outcome";
import { confirmedPeriodEvent } from "./gst-core/period-outcome";
import { confirmedTurnoverReview } from "./gst-core/turnover-outcome";
import { confirmedTaxImport } from "./gst-core/tax-import-outcome";
import type {
  Buyer,
  ProductTax,
  PurchaseInput,
  GstSupplier,
  PurchaseInvoice,
  PurchaseDetail,
  PurchaseReconciliation,
  InputTaxReview,
  PurchaseReturnInput,
  PurchaseSettlementInput,
  SettlementReversalInput,
  GstHealth,
  GstMonitor,
  GstReport,
  GstPeriod,
  TurnoverHistory,
  TaxHistory,
  BillingParty,
  FiscalDocument,
  Allocation,
  AllocationRow,
  DeviceRow,
} from "./gst-types";
import {
  recordedSupplierResult,
  recordedPurchaseResult,
  recordedPurchaseSettlementResult,
  recordedPurchaseSettlementReversalResult,
  recordedPurchaseReturnResult,
  recordedInputTaxReviewResult,
} from "./gst-core/purchase-outcome";
import {
  assertScope,
  financialScope,
  retainRequest,
  retainedRequests,
  requestStatus,
  withFinancialLock,
  sha256,
  type RetainedRequest,
} from "./gst-storage";

type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindGstApi(
  send: Send,
  register?: (
    path: string,
  ) => Promise<{ content: string; id: string; hash: string }>,
) {
  const get = <T>(path: string) => send<T>(path);
  const post = <T>(path: string, body: unknown) =>
    send<T>(path, { method: "POST", body: JSON.stringify(body) });
  const base = (shop: string) => `/api/shops/${shop}`;
  async function financial<T>(
    shop: string,
    path: string,
    input: { clientId?: string; requestId?: string },
    verify: (value: unknown) => T | Promise<T>,
    outcomePath?: string,
    verification?: Record<string, unknown>,
  ) {
    const active = financialScope(shop);
    const id = input.clientId ?? input.requestId;
    if (!id) throw Error("A stable request identity is required.");
    return withFinancialLock(active, async () => {
      const pending = (await retainedRequests(active)).find(
        (r) => r.state === "pending" && r.path === path && r.id !== id,
      );
      if (pending)
        throw Error(
          "An earlier request in this workflow is unresolved. Recover the saved request before making another entry.",
        );
      const row: RetainedRequest = {
        ...active,
        id,
        path,
        outcomePath,
        verification,
        payload: structuredClone(input),
        createdAt: new Date().toISOString(),
        state: "pending",
      };
      await retainRequest(row);
      assertScope(active);
      try {
        let value: unknown;
        try {
          value = await post(path, input);
        } catch (original) {
          if (!outcomePath) throw original;
        }
        if (outcomePath) value = await post(outcomePath, input);
        assertScope(active);
        const result = await verify(value);
        assertScope(active);
        await requestStatus(id, {
          state: "confirmed",
          result,
          error: undefined,
        });
        return result;
      } catch (error) {
        await requestStatus(id, {
          error:
            error instanceof Error
              ? error.message
              : "Request outcome could not be confirmed.",
        });
        throw error;
      }
    });
  }
  return {
    get,
    post,
    financial,
    health: (s: string) => get<GstHealth>(`${base(s)}/pos-settings/gst-health`),
    readiness: (s: string) =>
      get<Record<string, unknown>>(`${base(s)}/pos-settings/gst-readiness`),
    monitor: (s: string) =>
      get<GstMonitor>(`${base(s)}/gst-exports/monitor?limit=100`),
    runChecks: (s: string) =>
      post<{ skipped: boolean }>(`${base(s)}/gst-exports/monitor`, {}),
    numbers: (s: string, before?: string) =>
      get<{ items: AllocationRow[]; nextCursor: string | null }>(
        `${base(s)}/pos-settings/gst-allocations${before ? "?before=" + encodeURIComponent(before) : ""}`,
      ),
    devices: (s: string, before?: string) =>
      get<{ items: DeviceRow[]; nextCursor: string | null }>(
        `${base(s)}/pos-settings/gst-devices/${before ? "?before=" + encodeURIComponent(before) : ""}`,
      ),
    revoke: (s: string, id: string, reason: string) =>
      post(`${base(s)}/pos-settings/gst-devices/${id}/revoke`, { reason }),
    provision: (s: string, body: { deviceEpoch: string; gstVersion: string }) =>
      post<Allocation>(`${base(s)}/pos-settings/gst-allocation`, body),
    parties: (s: string, q = "") =>
      get<BillingParty[]>(
        `${base(s)}/billing-parties?${new URLSearchParams({ q })}`,
      ),
    saveParty: (s: string, clientId: string, buyer: Buyer) =>
      post<BillingParty>(`${base(s)}/billing-parties`, { clientId, buyer }),
    updateParty: (s: string, id: string, buyer: Buyer) =>
      send<BillingParty>(`${base(s)}/billing-parties/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ buyer }),
      }),
    suppliers: (s: string, q = "", before?: string) =>
      get<{ items: GstSupplier[]; nextCursor: string | null }>(
        `${base(s)}/purchases/suppliers/directory?${new URLSearchParams({ q, ...(before ? { before } : {}) })}`,
      ),
    supplier: (s: string, id: string) =>
      get<GstSupplier>(`${base(s)}/purchases/suppliers/${id}`),
    saveSupplier: (s: string, input: { clientId: string; identity: Buyer }) =>
      financial(
        s,
        `${base(s)}/purchases/suppliers`,
        input,
        (v) => recordedSupplierResult(v, s, input),
        `${base(s)}/purchases/suppliers/request-outcome`,
      ),
    updateSupplier: (
      s: string,
      id: string,
      identity: Buyer,
      expectedUpdatedAt: string,
    ) =>
      send<GstSupplier>(`${base(s)}/purchases/suppliers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ identity, expectedUpdatedAt }),
      }),
    purchases: (
      s: string,
      from: string,
      to: string,
      supplierId = "",
      before?: string,
    ) =>
      get<{ items: PurchaseInvoice[]; nextCursor: string | null }>(
        `${base(s)}/purchases?${new URLSearchParams({ from, to, ...(supplierId ? { supplierId } : {}), ...(before ? { before } : {}) })}`,
      ),
    purchase: (s: string, id: string) =>
      get<PurchaseDetail>(`${base(s)}/purchases/${id}`),
    reconciliation: (s: string, from: string, to: string) =>
      get<PurchaseReconciliation>(
        `${base(s)}/purchases/reconciliation?${new URLSearchParams({ from, to })}`,
      ),
    createPurchase: (s: string, input: PurchaseInput) =>
      financial(
        s,
        `${base(s)}/purchases`,
        input,
        (v) => recordedPurchaseResult(v, s, input),
        `${base(s)}/purchases/request-outcome`,
      ),
    reviewItc: (s: string, id: string, input: InputTaxReview) =>
      financial(
        s,
        `${base(s)}/purchases/${id}/itc-review`,
        input,
        (v) => recordedInputTaxReviewResult(v, s, id, input),
        `${base(s)}/purchases/${id}/itc-review/request-outcome`,
      ),
    returnPurchase: (s: string, id: string, input: PurchaseReturnInput) =>
      financial(
        s,
        `${base(s)}/purchases/${id}/returns`,
        input,
        (v) => recordedPurchaseReturnResult(v, s, id, input),
        `${base(s)}/purchases/${id}/returns/request-outcome`,
      ),
    settle: (s: string, id: string, input: PurchaseSettlementInput) =>
      financial(
        s,
        `${base(s)}/purchases/${id}/settlements`,
        input,
        (v) => recordedPurchaseSettlementResult(v, s, id, input),
        `${base(s)}/purchases/${id}/settlements/request-outcome`,
      ),
    reverseSettlement: (
      s: string,
      id: string,
      input: SettlementReversalInput,
    ) =>
      financial(
        s,
        `${base(s)}/purchases/${id}/settlement-reversals`,
        input,
        (v) => recordedPurchaseSettlementReversalResult(v, s, id, input),
        `${base(s)}/purchases/${id}/settlement-reversals/request-outcome`,
      ),
    costPreview: (s: string, id: string, decision: string) =>
      get<{
        changes: {
          name: string;
          previousUnitCost: string;
          newUnitCost: string;
          inventoryAdjustment: string;
          consumedAdjustment: string;
        }[];
      }>(`${base(s)}/purchases/${id}/cost-preview?decision=${decision}`),
    history: (s: string, kind: string, before?: string) =>
      get<{ items: GstReport[]; nextCursor: string | null }>(
        `${base(s)}/gst-exports?${new URLSearchParams({ kind, ...(before ? { before } : {}) })}`,
      ),
    report: (s: string, id: string) =>
      get<string>(`${base(s)}/gst-exports/${id}`),
    async downloadReport(s: string, id: string, expectedHash: string) {
      const active = financialScope(s);
      const row = await this.report(s, id);
      if (
        !/^[a-f0-9]{64}$/.test(expectedHash) ||
        (await sha256(row)) !== expectedHash
      )
        throw Error("The saved report could not be verified.");
      assertScope(active);
      return row;
    },
    taxHistory: (s: string, id: string, before?: string) =>
      get<TaxHistory>(
        `${base(s)}/inventory/products/${id}/tax-history${before ? "?before=" + encodeURIComponent(before) : ""}`,
      ),
    bulkTax: (s: string, productIds: string[], config: ProductTax) =>
      post<{ reviewed: number; changed: number }>(
        `${base(s)}/inventory/tax-profiles/bulk`,
        { entries: productIds.map((productId) => ({ productId, config })) },
      ),
    exportTax: (s: string, format: string) =>
      get<{ content: string; count: number }>(
        `${base(s)}/inventory/tax-profiles/export?format=${format}`,
      ),
    period: (s: string, month: string) =>
      get<GstPeriod>(`${base(s)}/gst-exports/periods/${month}`),
    turnover: (s: string, year: string) =>
      get<TurnoverHistory>(`${base(s)}/gst-exports/turnover/${year}`),
    async createRegister(s: string, kind: string, from: string, to: string) {
      if (!register)
        throw Error("The report receipt transport is unavailable.");
      const active = financialScope(s),
        receipt = await register(
          `${base(s)}/${kind === "purchases" ? "purchases/register" : "sales/gst-register.csv"}?${new URLSearchParams({ from, to })}`,
        );
      assertScope(active);
      if (
        !/^[a-f0-9-]{36}$/i.test(receipt.id) ||
        !/^[a-f0-9]{64}$/.test(receipt.hash) ||
        (await sha256(receipt.content)) !== receipt.hash
      )
        throw Error("The saved report could not be verified.");
      return receipt;
    },
    numberReport: (s: string, requestId: string) =>
      post<GstReport>(`${base(s)}/gst-exports/numbering`, { requestId }),
    creditReport: (s: string, exclusiveThrough: string, requestId: string) =>
      post<GstReport>(`${base(s)}/gst-exports/mixed-credits`, {
        exclusiveThrough,
        requestId,
      }),
    changePeriod: (
      s: string,
      month: string,
      input: {
        clientId: string;
        action: "close" | "reopen";
        note: string;
        reviewed: true;
        expectedSequence: number;
        expectedSourceFingerprint: string;
      },
    ) =>
      financial(
        s,
        `${base(s)}/gst-exports/periods/${month}`,
        input,
        (v) =>
          confirmedPeriodEvent(v, s, financialScope(s).actorId, month, input),
        `${base(s)}/gst-exports/periods/${month}/request-outcome`,
      ),
    saveTurnover: (
      s: string,
      financialYear: string,
      input: {
        clientId: string;
        expectedSequence: number;
        amount: string;
        evidenceReference: string;
        reviewed: true;
      },
    ) =>
      financial(
        s,
        `${base(s)}/gst-exports/turnover/${financialYear}`,
        input,
        (v) =>
          confirmedTurnoverReview(
            v,
            s,
            financialScope(s).actorId,
            financialYear,
            input,
          ),
      ),
    async importTax(s: string, input: { clientId: string; content: string }) {
      const hash = await sha256(input.content);
      return financial(
        s,
        `${base(s)}/inventory/tax-profiles/import`,
        input,
        (v) =>
          confirmedTaxImport(
            v,
            s,
            financialScope(s).actorId,
            input.clientId,
            hash,
          ),
        `${base(s)}/inventory/tax-profiles/import/request-outcome`,
      );
    },
    returnCapacity: (s: string, id: string) =>
      get<{
        status: string;
        unpaidCredit: string;
        refundableMoney: string;
        unassignedCollections: string;
      }>(`${base(s)}/sales/${id}/return-settlement`),
    returnSale: (
      s: string,
      id: string,
      input: {
        requestId: string;
        items: { saleItemId: string; quantity: number; restock?: boolean }[];
        reason: string;
        settlement: {
          creditReduction: number;
          moneyRefund: number;
          method: string;
          evidenceReference?: string;
        };
      },
      total: number,
    ) =>
      financial(
        s,
        `${base(s)}/sales/${id}/returns`,
        input,
        async (v) =>
          confirmedSaleReturnReceipt(
            v,
            s,
            financialScope(s).actorId,
            id,
            input,
            total,
            sha256,
          ),
        `${base(s)}/sales/${id}/returns/request-outcome`,
        { returnTotal: total },
      ),
    previewCredit: (s: string, id: string, input: unknown) =>
      post<{
        plan: { totals: import("./gst-types").TaxTotals };
        capacity: { unpaidCredit: string; refundableMoney: string };
        requiresCollectionReview: boolean;
      }>(`${base(s)}/sales/${id}/manual-credits/preview`, input),
    manualCredit: (
      s: string,
      id: string,
      input: Parameters<typeof confirmedManualCredit>[4],
    ) =>
      financial(
        s,
        `${base(s)}/sales/${id}/manual-credits`,
        input,
        (v) =>
          confirmedManualCredit(v, s, financialScope(s).actorId, id, input),
        `${base(s)}/sales/${id}/manual-credits/request-outcome`,
      ),
    debitNote: (
      s: string,
      id: string,
      input: Parameters<typeof confirmedDebitNote>[4],
    ) =>
      financial(
        s,
        `${base(s)}/sales/${id}/debit-notes`,
        input,
        (v) => confirmedDebitNote(v, s, financialScope(s).actorId, id, input),
        `${base(s)}/sales/${id}/debit-notes/request-outcome`,
      ),
    debitBalance: (s: string, id: string) =>
      get<{
        integrity: string;
        remaining: string;
        collected: string;
        obligation: { saleId: string; grossAmount: string; customerId: string };
        events: {
          id: string;
          kind: string;
          amount: string;
          method: string;
          reversesId: string | null;
        }[];
      }>(`${base(s)}/adjustments/${id}`),
    debitSettlement: (
      s: string,
      id: string,
      input: Parameters<typeof confirmedDebitSettlement>[4],
    ) =>
      financial(
        s,
        `${base(s)}/adjustments/${id}/settlements`,
        input,
        (v) =>
          confirmedDebitSettlement(v, s, financialScope(s).actorId, id, input),
        `${base(s)}/adjustments/${id}/settlements/request-outcome`,
      ),
    collections: (s: string, id: string, before?: string) =>
      get<{
        items: {
          id: string;
          recordedAt: string;
          method: string | null;
          originalAmount: string;
          unassignedAmount: string;
        }[];
        nextCursor: string | null;
      }>(
        `${base(s)}/customers/${id}/unassigned-collections${before ? "?before=" + encodeURIComponent(before) : ""}`,
      ),
    creditInvoices: (s: string, id: string, before?: string) =>
      get<{
        items: {
          id: string;
          saleNumber: number;
          soldAt: string;
          remainingCredit: string;
        }[];
        nextCursor: string | null;
      }>(
        `${base(s)}/customers/${id}/credit-invoices${before ? "?before=" + encodeURIComponent(before) : ""}`,
      ),
    reviewCollection: (
      s: string,
      id: string,
      input: Parameters<typeof confirmedCollectionReview>[4],
    ) =>
      financial(
        s,
        `${base(s)}/customers/${id}/collection-reviews`,
        input,
        (v) =>
          confirmedCollectionReview(v, s, financialScope(s).actorId, id, input),
        `${base(s)}/customers/${id}/collection-reviews/request-outcome`,
      ),
    fiscalDocuments: (s: string, id: string) =>
      get<FiscalDocument[]>(
        `${base(s)}/sales/fiscal-documents?saleId=${encodeURIComponent(id)}`,
      ),
  };
}
