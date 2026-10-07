import {
  financialYear,
  allocationNumber,
  validateContext,
  calculateTax,
  type GstSettings,
} from "./gst-core/gst";
import {
  canonicalJson,
  canonicalSaleRequest,
} from "./gst-core/sale-request-canonical";
import { FISCAL_RENDER_VERSION } from "./gst-core/fiscal-render-version";
import {
  reserveSale,
  assertScope,
  readState,
  writeState,
  retainRequest,
  requestStatus,
  retainedRequests,
  financialScope,
  withFinancialLock,
  sha256,
  type Scope,
  type RetainedRequest,
} from "./gst-storage";
import { readPending } from "./cart";
import type { ShopApi } from "./api";
import type { Allocation } from "./gst-types";
import type { CreateSalePayload, Sale } from "./types";

export async function issueSale(
  api: ShopApi,
  shopId: string,
  body: CreateSalePayload,
) {
  const active = financialScope(shopId);
  return withFinancialLock(active, async () => {
    await recoverReservedSales(active);
    // The original request survives response loss and browser restart.
    const journal = await retainedRequests(active);
    const saved = journal.find((r) => r.id === body.clientId);
    if (
      !saved &&
      journal.some(
        (r) => r.state === "pending" && r.path === `/api/shops/${shopId}/sales`,
      )
    )
      throw Error(
        "A previous bill needs recovery. Open GST recovery before starting another bill.",
      );
    let payload = saved
      ? (structuredClone(saved.payload) as CreateSalePayload)
      : structuredClone(body);
    if (
      !saved &&
      payload.gstContext &&
      ["regular", "composition"].includes(
        payload.gstContext.settings.registration,
      )
    ) {
      const context = payload.gstContext;
      validateContext(
        context,
        calculateTax(
          payload.items.map((i) => ({
            quantity: i.quantity,
            price: i.price ?? 0,
            listPrice: i.listPrice,
            discount: i.discount,
            tax: i.gstConfig,
          })),
          payload.discountAmount ?? 0,
          context,
        ).total,
      );
      const epochKey = `epoch:${active.actorId}`;
      let deviceEpoch = await readState<string>(epochKey);
      if (!deviceEpoch) {
        deviceEpoch = crypto.randomUUID();
        await writeState(epochKey, deviceEpoch);
      }
      const key = `allocation:${active.actorId}:${shopId}`;
      let allocation = await readState<Allocation>(key);
      const now = new Date();
      if (
        !allocation ||
        allocation.issuer !== context.settings.gstin ||
        allocation.financialYear !== financialYear(now) ||
        allocation.next > 100 ||
        Date.parse(allocation.expiresAt) <= Date.now() ||
        allocation.gstVersion !== context.settings.version
      ) {
        allocation = {
          ...(await api.gst.provision(shopId, {
            deviceEpoch,
            gstVersion: context.settings.version,
          })),
          next: 1,
          gstVersion: context.settings.version,
        };
        assertScope(active);
        if (
          !/^[a-f0-9-]{36}$/i.test(allocation.id) ||
          allocation.deviceEpoch !== deviceEpoch ||
          allocation.issuer !== context.settings.gstin ||
          allocation.financialYear !== financialYear(now) ||
          !Number.isInteger(allocation.block) ||
          allocation.block < 1 ||
          !Number.isFinite(Date.parse(allocation.expiresAt)) ||
          Date.parse(allocation.expiresAt) <= now.getTime()
        )
          throw Error("The invoice number reservation could not be verified.");
      }
      const issuedAt = now.toISOString();
      payload = {
        ...payload,
        soldAt: issuedAt,
        gstContext: {
          ...context,
          issuedAt,
          documentRenderVersion: FISCAL_RENDER_VERSION,
          allocation: {
            id: allocation.id,
            index: allocation.next,
            number: allocationNumber(allocation, allocation.next),
            financialYear: allocation.financialYear,
            deviceEpoch,
          },
        },
      };
      // Store reservation including the request before advancing the counter.
      await reserveSale(
        key,
        { ...allocation, next: allocation.next + 1, pending: payload },
        {
          ...active,
          id: payload.clientId,
          path: `/api/shops/${shopId}/sales`,
          payload,
          createdAt: issuedAt,
          state: "pending",
        },
      );
    }
    const path = `/api/shops/${shopId}/sales`;
    const row: RetainedRequest = {
      ...active,
      id: payload.clientId,
      path,
      payload,
      createdAt: saved?.createdAt ?? new Date().toISOString(),
      state: "pending",
    };
    await retainRequest(row);
    assertScope(active);
    try {
      const result = await api.createSale(shopId, payload);
      assertScope(active);
      await verifySale(result.sale, active, payload);
      assertScope(active);
      await requestStatus(payload.clientId, {
        state: "confirmed",
        result: result.sale,
        error: undefined,
      });
      return result;
    } catch (error) {
      await requestStatus(payload.clientId, {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm the bill.",
      });
      throw error;
    }
  });
}
export async function verifySale(
  sale: Sale,
  scope: Scope,
  payload: CreateSalePayload,
) {
  if (
    sale.shopId !== scope.shopId ||
    sale.soldBy !== scope.actorId ||
    sale.clientId !== payload.clientId ||
    sale.requestHash !==
      (await sha256(
        canonicalSaleRequest({ ...payload, userId: scope.actorId }),
      ))
  )
    throw Error(
      "The server outcome could not be verified. The original bill is preserved.",
    );
  if (
    payload.gstContext &&
    ["regular", "composition"].includes(
      payload.gstContext.settings.registration,
    )
  ) {
    const snapshot = sale.gstSnapshot;
    if (
      sale.gstIntegrity !== "verified" ||
      !snapshot ||
      snapshot.invoiceNumber !== payload.gstContext.allocation?.number ||
      canonicalJson(snapshot.context) !== canonicalJson(payload.gstContext)
    )
      throw Error("The saved GST bill could not be verified.");
  }
}
export async function recoverReservedSales(
  active: Scope,
  includeLegacy = false,
) {
  const legacy = includeLegacy
    ? readPending(active.actorId, active.shopId)
    : null;
  if (
    legacy &&
    legacy.payload?.clientId === legacy.clientId &&
    !(await retainedRequests(active)).some((row) => row.id === legacy.clientId)
  ) {
    await retainRequest({
      ...active,
      id: legacy.clientId,
      path: `/api/shops/${active.shopId}/sales`,
      payload: legacy.payload,
      createdAt: new Date(legacy.startedAt).toISOString(),
      state: "pending",
    });
  }
  const allocation = await readState<
    Allocation & { pending?: CreateSalePayload }
  >(`allocation:${active.actorId}:${active.shopId}`);
  if (allocation?.pending) {
    await retainRequest({
      ...active,
      id: allocation.pending.clientId,
      path: `/api/shops/${active.shopId}/sales`,
      payload: allocation.pending,
      createdAt: allocation.pending.soldAt,
      state: "pending",
    });
  }
}
