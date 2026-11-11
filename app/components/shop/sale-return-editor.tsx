"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShop } from "./context";
import { Button, Field, Notice, inputClass } from "./ui";
import { ProductImageById } from "./product-image";
import { formatINR } from "../../lib/shop/money";
import { formatQty, r3, stepFor } from "../../lib/shop/units";
import { ordinaryReturnPlan } from "../../lib/shop/sales";
import { verifiedSaleBalance } from "../../lib/shop/sale-balance";
import { planReturnSettlement } from "../../lib/shop/gst-core/sale-return-settlement";
import type { Sale } from "../../lib/shop/types";
import {
  assertScope,
  financialScope,
  retainedRequests,
} from "../../lib/shop/gst-storage";
import { recoverFinancialRequest } from "../../lib/shop/gst-recovery";

/** Ordinary bills only. GST/mixed bills retain their verified tax adjustment workflow. */
export function SaleReturnEditor({
  sale,
  onDone,
}: {
  sale: Sale;
  onDone: () => Promise<void>;
}) {
  const { shop, userId, api, perms, offline, t } = useShop();
  const [quantities, setQuantities] = useState<Record<string, string>>({}),
    [restock, setRestock] = useState<Record<string, boolean>>({});
  const [method, setMethod] = useState<"cash" | "upi" | "card">(() => {
    const m = sale.payments.find(
      (p) => p.kind === "payment" && p.method !== "credit",
    )?.method;
    return m === "upi" || m === "card" ? m : "cash";
  });
  const [override, setOverride] = useState(""),
    [credit, setCredit] = useState(""),
    [reference, setReference] = useState(""),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const saved = useQuery({
    queryKey: ["counterReturnPending", shop?.id, userId, sale.id],
    enabled: !!shop && perms.canVoidOrReturn,
    networkMode: "always",
    retry: false,
    queryFn: async () => {
      const scope = financialScope(shop!.id);
      const rows = await retainedRequests(scope);
      assertScope(scope);
      return (
        rows.find(
          (r) =>
            r.state === "pending" &&
            r.path === `/api/shops/${shop!.id}/sales/${sale.id}/returns`,
        ) ?? null
      );
    },
  });
  const capacity = useQuery({
    queryKey: ["saleReturnCapacity", shop?.id, userId, sale.id],
    enabled:
      !!shop && perms.canVoidOrReturn && sale.creditTotal > 0 && !saved.data,
    staleTime: 0,
    queryFn: async () =>
      verifiedSaleBalance(
        await api.gst.returnCapacity(shop!.id, sale.id),
        sale,
      ),
  });
  let plan: ReturnType<typeof ordinaryReturnPlan> | null = null,
    settlement:
      | {
          creditReduction: number;
          moneyRefund: number;
          method: "cash" | "upi" | "card";
          evidenceReference: string;
        }
      | undefined,
    invalid = false;
  try {
    plan = ordinaryReturnPlan(sale, quantities, restock, override);
  } catch {
    invalid = true;
  }
  if (sale.creditTotal > 0 && plan) {
    try {
      if (
        !capacity.data ||
        capacity.isError ||
        capacity.isFetching ||
        capacity.data.status !== "ready" ||
        !/^\d+(?:\.\d{1,2})?$/.test(credit.trim())
      )
        throw Error();
      settlement = {
        creditReduction: Number(credit),
        moneyRefund: Math.round((plan.total - Number(credit)) * 100) / 100,
        method,
        evidenceReference: reference,
      };
      planReturnSettlement(
        { ...capacity.data, returnTotal: plan.total.toFixed(2) },
        settlement,
      );
    } catch {
      invalid = true;
    }
  }
  const locked = busy || !!saved.data,
    allowed =
      !!shop &&
      perms.canVoidOrReturn &&
      !offline &&
      saved.isSuccess &&
      !invalid &&
      !!plan?.items.length &&
      !sale.returnPlanningError;
  // Same as the app: steppers from 0 up to what is left, and one tap for all of it.
  const setReturnQuantity = (id: string, quantity: number) =>
    setQuantities({ ...quantities, [id]: quantity > 0 ? String(r3(quantity)) : "" });
  async function submit() {
    if (!allowed || !shop || !plan || busy || saved.data) return;
    setBusy(true);
    setError(null);
    const input = {
      requestId: crypto.randomUUID(),
      items: plan.items,
      refundMethod: method,
      refundAmount: sale.creditTotal > 0 ? plan.total : plan.refundAmount,
      reason: reason.trim(),
      ...(settlement ? { settlement } : {}),
    };
    try {
      await api.gst.returnSale(shop.id, sale.id, input, plan.total);
      setQuantities({});
      await onDone();
    } catch (e) {
      setError(e);
      await saved.refetch();
      await capacity.refetch();
    } finally {
      setBusy(false);
    }
  }
  if (!perms.canVoidOrReturn || !shop) return null;
  return (
    <div className="sale-return-editor">
      <Notice error={error} />
      {saved.isError ? (
        <p role="alert">{t("counter.recovery_storage_error", "")}</p>
      ) : null}
      {saved.data ? (
        <div className="sales-recovery">
          <p>{t("sale_return.pending_settlement", "")}</p>
          <Button
            disabled={busy || offline}
            onClick={() => {
              setBusy(true);
              setError(null);
              void recoverFinancialRequest(api, shop.id, saved.data!)
                .then(async () => {
                  await onDone();
                  await saved.refetch();
                })
                .catch(setError)
                .finally(() => setBusy(false));
            }}
          >
            {t("purchase.retry", "Retry saved request")}
          </Button>
          <Button tone="ghost" href="/shop/settings/gst/recovery">
            {t("counter.recovery", "")}
          </Button>
        </div>
      ) : null}
      <fieldset disabled={locked || !saved.isSuccess}>
        <p className="shop-hint">
          {t("sale_return.subtitle", "", { n: sale.saleNumber })}
        </p>
        {sale.returnPlanningError ? (
          <p role="alert">{t("sale_return.adjustment_history_review", "")}</p>
        ) : null}
        <div className="sale-return-lines">
          {sale.items
            .filter((i) => i.quantity > i.returnedQuantity)
            .map((item) => (
              <div key={item.id} className="sale-return-line">
                <ProductImageById
                  productId={item.productId}
                  name={item.name}
                  size={40}
                />
                <div>
                  <b>{item.name}</b>
                  <p className="shop-hint">
                    {t("salesweb.return_max", "", {
                      quantity: formatQty(
                        Math.round(
                          (item.quantity - item.returnedQuantity) * 1000,
                        ) / 1000,
                        item.unit,
                      ),
                    })}
                  </p>
                  {item.productId ? (
                    <label className="sale-check">
                      <input
                        type="checkbox"
                        checked={restock[item.id] !== false}
                        onChange={(e) => {
                          setRestock({
                            ...restock,
                            [item.id]: e.target.checked,
                          });
                        }}
                      />
                      {t("sale_return.restock", "Return to stock")}
                    </label>
                  ) : null}
                </div>
                <Field
                  label={t("sale_return.precise_quantity", "", {
                    unit: item.unit,
                  })}
                >
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={quantities[item.id] ?? ""}
                    placeholder="0"
                    onChange={(e) => {
                      setQuantities({
                        ...quantities,
                        [item.id]: e.target.value,
                      });
                    }}
                  />
                </Field>
                {(() => {
                  const remaining = r3(item.quantity - item.returnedQuantity),
                    current = Number(quantities[item.id] || 0),
                    known = Number.isFinite(current) ? current : 0,
                    step = item.rspSnapshot ? 1 : Math.min(stepFor(item.unit), remaining);
                  return (
                    <div
                      className="sale-return-stepper"
                      role="group"
                      aria-label={item.name}
                    >
                      <button
                        type="button"
                        aria-label={`${t("a11y.decrease", "Decrease quantity")}: ${item.name}`}
                        disabled={known <= 0}
                        onClick={() =>
                          setReturnQuantity(item.id, Math.max(0, r3(known - step)))
                        }
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={`${t("a11y.increase", "Increase quantity")}: ${item.name}`}
                        disabled={known >= remaining}
                        onClick={() =>
                          setReturnQuantity(item.id, Math.min(remaining, r3(known + step)))
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="sale-return-all"
                        disabled={known === remaining}
                        onClick={() => setReturnQuantity(item.id, remaining)}
                      >
                        {t("salesweb.return_all_of", "All {{quantity}}", {
                          quantity: formatQty(remaining, item.unit),
                        })}
                      </button>
                    </div>
                  );
                })()}
              </div>
            ))}
        </div>
        {sale.creditTotal > 0 ? (
          <div className="sale-credit-return">
            <h3>{t("sale_return.ordinary_settlement_title", "")}</h3>
            <p className="shop-hint">{t("sale_return.settlement_help", "")}</p>
            {capacity.isFetching ? (
              <p>{t("common.loading", "")}</p>
            ) : capacity.isError || !capacity.data ? (
              <p role="alert">{t("sale_return.capacity_unavailable", "")}</p>
            ) : capacity.data.status !== "ready" ? (
              <p role="alert">
                {t("sale_return.review_collections_first", "")}
              </p>
            ) : (
              <p>
                {t("sale_return.unpaid_capacity", "", {
                  amount: formatINR(Number(capacity.data.unpaidCredit)),
                })}
                {" · "}
                {t("sale_return.money_capacity", "", {
                  amount: formatINR(Number(capacity.data.refundableMoney)),
                })}
              </p>
            )}
            <Button
              tone="quiet"
              disabled={capacity.isFetching}
              onClick={() => void capacity.refetch()}
            >
              {t("sale_detail.refresh_balance", "")}
            </Button>
            {sale.customerId &&
            capacity.data?.status === "unassigned_collections" ? (
              <Button href={"/shop/customers/" + sale.customerId} tone="ghost">
                {t("customers.review_collections", "")}
              </Button>
            ) : null}
            <Field label={t("sale_return.reduce_credit", "")}>
              <input
                className={inputClass}
                inputMode="decimal"
                value={credit}
                placeholder="0"
                onChange={(e) => {
                  setCredit(e.target.value);
                }}
              />
            </Field>
            <Field label={t("sale_return.refund_evidence", "")}>
              <input
                className={inputClass}
                maxLength={500}
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                }}
              />
            </Field>
          </div>
        ) : (
          <Field
            label={t("sale_return.refund_amount", "Refund amount")}
            hint={plan ? formatINR(plan.total) : undefined}
          >
            <input
              className={inputClass}
              inputMode="decimal"
              value={override}
              placeholder={plan ? String(plan.total) : "0"}
              onChange={(e) => {
                setOverride(e.target.value);
              }}
            />
          </Field>
        )}
        <div className="sale-return-fields">
          <Field label={t("sale_return.refund_via", "Refund via")}>
            <select
              className={inputClass}
              value={method}
              onChange={(e) => {
                setMethod(e.target.value as typeof method);
              }}
            >
              {(["cash", "upi", "card"] as const).map((m) => (
                <option key={m} value={m}>
                  {t("pos.method." + m, m)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("counter.reason", "Reason")}>
            <input
              className={inputClass}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
            />
          </Field>
        </div>
        <div className="sale-return-review">
          <span>{t("sale_return.ordinary_return_total", "Return total")}</span>
          <b className="num">{plan ? formatINR(plan.total) : "—"}</b>
        </div>
        {sale.creditTotal > 0 &&
        settlement &&
        Number.isFinite(settlement.moneyRefund) ? (
          <p>
            {t("sale_return.money_refund", "", {
              amount: formatINR(settlement.moneyRefund),
            })}
          </p>
        ) : null}
        {invalid && Object.values(quantities).some(Boolean) ? (
          <p className="text-danger" role="alert">
            {t(
              "salesweb.return_review",
              "Check the quantities, refund amount and credit allocation before continuing.",
            )}
          </p>
        ) : null}
        <Button disabled={!allowed || locked} onClick={() => void submit()}>
          {busy
            ? t("common.loading", "")
            : t(
                sale.creditTotal > 0
                  ? "sale_return.credit_confirm"
                  : "sale_return.confirm",
                "",
                { amount: plan ? formatINR(plan.total) : "—" },
              )}
        </Button>
      </fieldset>
    </div>
  );
}
