import {assertSaleStock} from './local-stock';
import {ensureInvoiceAllocation,ensureRoundingGrant} from './invoice-preparation';
import {buildLocalFiscalReceipt,verifyLocalFiscalReceipt} from './local-fiscal-receipt';
import {attachCatalogTaxSnapshot,assertCartTaxSnapshots} from './gst-core/gst-tax-cache';
import {rspItemsForIssue} from './rsp-issue-items';
import {mixedCartProjection} from './mixed-cart-projection';
import {mixedSaleConfirmationMatches} from './mixed-sale-confirmation';
import {roundedSaleConfirmationMatches} from './rounded-sale-confirmation';
import {quoteRoundedReservation} from './rounded-reservation';
import {localRoundingGrantIssue} from './rounding-grant';
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
    if(!saved){
      const pending=journal.filter(row=>row.state==='pending'&&row.path===`/api/shops/${shopId}/sales`);
      for(const row of pending){
        if(!row.verification?.localFiscalReceipt||!body.gstContext||!['regular','composition'].includes(body.gstContext.settings.registration))throw Error('A previous bill needs recovery. Open GST recovery before starting another bill.');
        await verifyLocalFiscalReceipt(row,active);assertScope(active);
      }
    }
    if(saved?.verification?.localFiscalReceipt){await verifyLocalFiscalReceipt(saved,active);assertScope(active);}
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
      const stock=await api.getAllInventory(shopId,true,false,true);assertScope(active);
      assertSaleStock(payload.items,stock);

      let {allocation,deviceEpoch}=await ensureInvoiceAllocation(api,active,context.settings);
      let taxLines:Parameters<typeof assertCartTaxSnapshots>[0]["lines"]|undefined;
      // Validate fresh server timelines before reserving a number. Never silently substitute tax rates.
      if(context.settings.registration==='regular'){
        const ids=payload.items.map(i=>i.productId);
        if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw Error('Each GST line needs a distinct saved product.');
        const snapshot=await api.getTaxSnapshot(shopId,ids as string[]);assertScope(active);
        const entries=attachCatalogTaxSnapshot(payload.items.map(item=>({product:{id:item.productId!} as Pick<import("./types").Product,"id"|"gstTaxSnapshot"|"gstRspSnapshot">})),snapshot,shopId);
        taxLines=payload.items.map((item,index)=>({...item,productId:item.productId!,gstTaxSnapshot:entries[index].product.gstTaxSnapshot,gstRspSnapshot:entries[index].product.gstRspSnapshot}));
        assertCartTaxSnapshots({gstTaxSnapshotsRequired:true,lines:taxLines},shopId,new Date().toISOString());
      }
      const liveSettings=await api.getPosSettings(shopId);assertScope(active);
      if(liveSettings.gstSettings?.version!==context.settings.version)throw Error('Shop GST settings changed. Refresh checkout before charging.');
      const prepared=await ensureRoundingGrant(api,active,allocation,deviceEpoch,liveSettings.gstPayableRoundingAvailable===true);
      allocation=prepared.allocation;const grant=prepared.grant;
      const key=`allocation:${active.actorId}:${shopId}`;
      const issuedAt = new Date().toISOString();
      if(taxLines)assertCartTaxSnapshots({gstTaxSnapshotsRequired:true,lines:taxLines},shopId,issuedAt);
      payload = {
        ...payload,
        items:rspItemsForIssue(payload.items,issuedAt),
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
      const issuedContext=payload.gstContext!;
      const mixed=payload.items.some(i=>i.rsp);
      const before=mixed?Number(mixedCartProjection(payload.items.map((i,index)=>({...i,key:`line-${index}`,price:i.price??0,discount:i.discount??0})),issuedContext,payload.discountAmount??0,payload.mixedDiscountReview).payable):calculateTax(payload.items.map(i=>({quantity:i.quantity,price:i.price??0,listPrice:i.listPrice,discount:i.discount,tax:i.gstConfig})),payload.discountAmount??0,issuedContext).total;
      validateContext(issuedContext,before);
      if(grant){
        localRoundingGrantIssue(grant,{shopId,actorId:active.actorId,deviceEpoch,allocationId:allocation.id,issuer:allocation.issuer,financialYear:allocation.financialYear,index:allocation.next,number:allocationNumber(allocation,allocation.next),issuedAt,policyVersion:grant.signedGrant.grant.policy.version});
        const quote=quoteRoundedReservation(shopId,payload,grant.signedGrant.grant.policy);
        payload={...payload,roundingGrant:grant,roundingSnapshot:quote.snapshot};
      }else if(Math.round(payload.payments.reduce((sum,p)=>sum+p.amount,0)*100)!==Math.round(before*100))throw Error('The bill total changed. Refresh checkout and confirm payment again.');
      const localFiscalReceipt=await buildLocalFiscalReceipt(active,payload);
      assertScope(active);
      // Store receipt, original request and advanced counter in one transaction.
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
          verification:{localFiscalReceipt},
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
    if(payload.roundingSnapshot){
      if(!roundedSaleConfirmationMatches(sale,scope.shopId,payload)||canonicalJson(sale.roundingEvidence?.snapshot)!==canonicalJson(payload.roundingSnapshot)||canonicalJson(sale.roundingGrant)!==canonicalJson(payload.roundingGrant))throw Error('The saved rounded bill could not be verified.');
      const evidence=sale.roundingEvidence!;
      if(evidence.hash!==await sha256(canonicalJson({document:evidence.document,snapshot:evidence.snapshot})))throw Error('The rounding evidence could not be verified.');
    }else if(payload.items.some(i=>i.rsp)){
      if(!mixedSaleConfirmationMatches(sale,payload))throw Error('The saved mixed GST bill could not be verified.');
    }else{
      const snapshot = sale.gstSnapshot;
      if(sale.gstIntegrity !== 'verified'||!snapshot||snapshot.invoiceNumber!==payload.gstContext.allocation?.number||canonicalJson(snapshot.context)!==canonicalJson(payload.gstContext))throw Error('The saved GST bill could not be verified.');
    }
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

/** Reconnect only replays already-issued original bills; it never creates or edits a request. */
export async function syncQueuedSales(api:ShopApi,shopId:string,isCurrent:()=>boolean=()=>true) {
 const active=financialScope(shopId);
 const rows=(await retainedRequests(active)).filter(row=>row.state==='pending'&&row.path===`/api/shops/${shopId}/sales`).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||((a.payload as CreateSalePayload).gstContext?.allocation?.index??0)-((b.payload as CreateSalePayload).gstContext?.allocation?.index??0));
 let confirmed=0;
 for(const row of rows){
  if(!isCurrent())break;
  assertScope(active);
  if(!row.verification?.localFiscalReceipt)break; // Unissued or uncertain legacy requests require manual review.
  await verifyLocalFiscalReceipt(row,active);assertScope(active);
  await issueSale(api,shopId,row.payload as CreateSalePayload);
  assertScope(active);confirmed++;
 }
 return confirmed;
}
