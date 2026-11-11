"use client";
import { SaleAdjustmentHistory } from "../sale-adjustment-history";
import { SaleReturnEditor } from "../sale-return-editor";
import { salesVoidAllowed } from "../../../lib/shop/sales";
import { verifiedSaleBalance } from "../../../lib/shop/sale-balance";
import { ProductImageById } from "../product-image";
import {
  saleCollectionStatus,
  saleCollectionLabel,
} from "../../../lib/shop/sale-collection";
import Link from "next/link";
import { printDocument } from "../../../lib/shop/gst-print";
import { textFontCss } from "../../../lib/shop/documents/fonts";
import { counterReturn } from "../../../lib/shop/counter/query";
import { IssuedDocumentButton } from "../document-preview";

import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { GstDocuments } from "../gst-documents";
import { GstSaleAdjustments } from "../gst-sale-adjustments";
import { ApiError } from "../../../lib/shop/api";
import { formatINR } from "../../../lib/shop/money";
import { useShopDates } from "../use-shop-dates";
import { formatQty } from "../../../lib/shop/units";
import {
  billPlainText,
  shareBill,
  type ShareBillInput,
} from "../../../lib/shop/share-bill";
import { recoverFinancialRequest } from "../../../lib/shop/gst-recovery";
import {
  financialScope,
  assertScope,
  retainedRequests,
} from "../../../lib/shop/gst-storage";
import { useShop } from "../context";
import {
  Button,
  Card,
  Field,
  NoAccess,
  Notice,
  PageHeader,
  Pill,
  Spinner,
  inputClass,
  isDenied,
} from "../ui";

const METHOD: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  credit: "Udhaar",
};

export function SaleDetailScreen({ saleId }: { saleId: string }) {
  const { shop, userId } = useShop();
  return (
    <SaleDetailWorkspace
      key={`${shop?.id}:${userId}:${saleId}`}
      saleId={saleId}
    />
  );
}

function SaleDetailWorkspace({ saleId }: { saleId: string }) {
  const uiText = useUiText();
  const { formatWhen } = useShopDates();
  const { api, shop, userId, offline, perms, hideCost, setNotice, t } =
    useShop();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const saleQuery = useQuery({
    queryKey: ["sale", shop?.id, saleId, userId],
    enabled: !!shop?.id,
    queryFn: () => api.getSale(shop!.id, saleId),
  });
  const settings = useQuery({
    queryKey: ["pos", shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const savedReturn = useQuery({
    queryKey: ["counterReturnPending", shop?.id, userId, saleId],
    enabled: !!shop && perms.canVoidOrReturn,
    networkMode: "always",
    queryFn: async () => {
      const scope = financialScope(shop!.id);
      const rows = await retainedRequests(scope);
      assertScope(scope);
      return (
        rows.find(
          (r) =>
            r.state === "pending" &&
            r.path === `/api/shops/${shop!.id}/sales/${saleId}/returns`,
        ) ?? null
      );
    },
  });
  const [voidReason, setVoidReason] = useState("");
  const [voidConfirmed, setVoidConfirmed] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const receipt = useRef<HTMLElement>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [printing, setPrinting] = useState(false);
  const newSale = useRef<HTMLAnchorElement>(null),
    newSaleFocused = useRef(false);
  const sale = saleQuery.data;
  const justRecorded = !!params.get("recorded");
  useEffect(() => {
    // After charging, Enter starts the next bill.
    if (!justRecorded || newSaleFocused.current || !newSale.current) return;
    newSaleFocused.current = true;
    newSale.current.focus();
  });

  const balance = useQuery({
    queryKey: ["saleReturnCapacity", shop?.id, userId, saleId],
    enabled:
      !!shop &&
      perms.canVoidOrReturn &&
      sale?.status === "completed" &&
      sale.creditTotal > 0,
    staleTime: 0,
    queryFn: async () =>
      verifiedSaleBalance(
        await api.gst.returnCapacity(shop!.id, saleId),
        sale!,
      ),
  });

  if (!shop) return <Spinner />;
  if (saleQuery.isLoading) return <Spinner label={uiText("Loading bill")} />;
  if (isDenied(saleQuery.error))
    return <NoAccess what={uiText("You cannot open this bill.")} />;
  if (saleQuery.error)
    return (
      <Card>
        <Notice error={saleQuery.error} />
        <p>{t("counter.bill_connection", "")}</p>
        <div className="shop-actions">
          <Button tone="ghost" onClick={() => void saleQuery.refetch()}>
            {t("common.retry", "")}
          </Button>
          <Button href="/shop/settings/gst/recovery" tone="ghost">
            {t("counter.recovery", "")}
          </Button>
        </div>
      </Card>
    );
  if (!sale)
    return (
      <Card>
        <p>{uiText("That bill was not found.")}</p>
      </Card>
    );

  const shortfalls = sale.items.filter((item) => (item.shortfall ?? 0) > 0);
  const windowHours = settings.data?.voidWindowHours;
  const withinWindow =
    settings.isSuccess &&
    !settings.isError &&
    salesVoidAllowed(sale, windowHours);
  const returnable = sale.items.filter(
    (item) => item.quantity - item.returnedQuantity > 0,
  );
  const pos = settings.data;
  const showCost =
    !hideCost && sale.showCost === true && sale.costTotal != null;
  const recorded = params.get("recorded");
  const methods = [
    ...new Set(
      sale.payments
        .filter((payment) => payment.kind !== "refund")
        .map((payment) => t("pos.method." + payment.method, payment.method)),
    ),
  ];

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["sale", shop.id, saleId],
    });
    await queryClient.invalidateQueries({ queryKey: ["sales", shop.id] });
    await queryClient.invalidateQueries({ queryKey: ["catalog", shop.id] });
    await Promise.all(
      [
        "refunds",
        "counterReturnPending",
        "cashbook",
        "customerCredit",
        "followup",
        "followups",
        "salesSummary",
        "saleDebits",
        "saleCredits",
        "saleReturnCapacity",
        "home",
        "inventory",
        "customers",
      ].map((k) => queryClient.invalidateQueries({ queryKey: [k, shop.id] })),
    );
  };

  const billPayload = (): ShareBillInput => ({
      shopName: pos?.shopName || shop.name,
      address: pos?.shopAddress,
      phone: pos?.shopPhone,
      saleNumber: sale.saleNumber,
      when: formatWhen(sale.soldAt),
      lines: sale.items.map((item) => ({
        name: item.name,
        detail: `${formatQty(item.quantity, item.unit)} × ${formatINR(item.unitPrice)}`,
        amount: formatINR(item.lineTotal),
      })),
      subtotal: formatINR(sale.subtotal),
      discount:
        sale.discountAmount > 0 ? `−${formatINR(sale.discountAmount)}` : null,
      total: formatINR(sale.total),
      payments: sale.payments.map((payment) => {
        const label =
          (payment.kind === "refund"
            ? t("bill.refunded", "Refunded") + " · "
            : "") +
          t(
            `pos.method.${payment.method}`,
            METHOD[payment.method] ?? payment.method,
          );
        const extra = [
          payment.tendered != null
            ? `${t("checkout.cash_received", "Cash received")} ${formatINR(payment.tendered)}`
            : null,
          payment.changeGiven
            ? `${t("checkout.change", "Change to return")} ${formatINR(payment.changeGiven)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return extra
          ? `${label} · ${extra} · ${formatINR(payment.amount)}`
          : `${label} · ${formatINR(payment.amount)}`;
      }),
      footer: pos?.billFooter,
      labels: {
        bill: t("bill.bill", "Bill"),
        subtotal: t("bill.subtotal", "Subtotal"),
        discount: t("bill.discount", "Discount"),
        total: t("bill.total", "Total"),
        thanks: t("bill.thanks", "Thank you"),
      },
    });
  const share = async () => {
    const payload = billPayload();
    if (sale.gstSnapshot || sale.mixedGstSnapshot) {
      setError(
        new Error(
          t(
            "bill.use_verified_gst_document",
            "Use the verified GST document above to print or download this bill.",
          ),
        ),
      );
      return;
    }
    setSharing(true);
    try {
      const scope = financialScope(shop.id);
      const result = await shareBill(payload, () => {
        api.assertSession();
        assertScope(scope);
      });
      if (result === "copied")
        setNotice(t("bill.share_copied", "Bill text copied."));
      if (result === "downloaded")
        setNotice(t("bill.share_downloaded", "Bill image downloaded."));
    } catch (error) {
      setError(
        error instanceof Error &&
          error.message === "Could not share or download this bill. Try again."
          ? new Error(t("bill.share_failed", error.message))
          : error,
      );
    } finally {
      setSharing(false);
    }
  };

  // Same as the app: straight into the customer's chat when the bill has a valid
  // Indian mobile number, otherwise WhatsApp asks who to send it to.
  const sendWhatsApp = () => {
    if (sale.gstSnapshot || sale.mixedGstSnapshot) return;
    setError(null);
    try {
      api.assertSession();
      assertScope(financialScope(shop.id));
    } catch (caught) {
      setError(caught);
      return;
    }
    const digits = (sale.customer?.phone ?? "")
      .replace(/\D/g, "")
      .replace(/^91(?=\d{10}$)/, "");
    const to = /^[6-9]\d{9}$/.test(digits) ? "91" + digits : "";
    // "noopener" would make window.open return null, so detach the opener by hand
    // and fall back to the share sheet only when a pop-up blocker stopped it.
    const opened = window.open(
      `https://wa.me/${to}?text=${encodeURIComponent(billPlainText(billPayload()))}`,
      "_blank",
    );
    if (opened) opened.opener = null;
    else void share();
  };
  const paidNow = sale.payments
    .filter((payment) => payment.kind !== "refund" && payment.method !== "credit")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const changeGiven = sale.payments.reduce(
    (sum, payment) => sum + (payment.changeGiven ?? 0),
    0,
  );
  const status = saleCollectionStatus(sale),
    fiscal = !!(sale.gstSnapshot || sale.mixedGstSnapshot);
  const identifier =
    sale.gstSnapshot?.invoiceNumber ??
    sale.mixedGstSnapshot?.context.allocation?.number ??
    sale.saleNumber;
  return (
    <div className="shop-page sale-detail-workspace">
      <PageHeader
        back={{
          href: counterReturn(params.get("returnTo")),
          label: t("sales.title", "Sales"),
        }}
        kicker={t(
          "counter." +
            (recorded === "new"
              ? "sale_recorded"
              : recorded === "again"
                ? "already_recorded"
                : "bill"),
          "",
        )}
        title={t("counter.bill_number", "", { number: identifier })}
        description={formatWhen(sale.soldAt)}
        actions={
          recorded ? null : (
            <Button
              tone="ghost"
              disabled={saleQuery.isFetching || offline}
              onClick={() => void refresh()}
            >
              {t("counter.refresh", "Refresh")}
            </Button>
          )
        }
      />
      <Notice error={error} />
      {recorded ? (
        <section className="sale-success" aria-labelledby="sale-success-title">
          <span className="sale-success-mark" aria-hidden="true">
            ✓
          </span>
          <div className="sale-success-copy">
            <h2 id="sale-success-title" className="num">
              {paidNow > 0
                ? t("salesweb.paid_amount", "Paid {{amount}}", {
                    amount: formatINR(paidNow),
                  })
                : t("salesweb.recorded_amount", "Bill recorded · {{amount}}", {
                    amount: formatINR(sale.total),
                  })}
            </h2>
            <p>
              {methods.join(" + ")}
              {changeGiven > 0
                ? " · " +
                  t("salesweb.change_given", "Change {{amount}}", {
                    amount: formatINR(changeGiven),
                  })
                : ""}
            </p>
          </div>
          <div className="sale-success-actions">
            {!fiscal && !sale.documentPresentation ? (
              <Button tone="ghost" onClick={sendWhatsApp}>
                {t("whatsapp_receipt.send", "Send on WhatsApp")}
                {sale.customer?.name ? " · " + sale.customer.name : ""}
              </Button>
            ) : null}
            <Link
              ref={newSale}
              href="/shop/sell"
              className="shop-btn shop-btn-primary"
            >
              {t("sale_complete.new_sale", "New sale")}
              <kbd className="shop-kbd" aria-hidden="true">
                {uiText("Enter")}
              </kbd>
            </Link>
          </div>
        </section>
      ) : null}
      <section className="sale-detail-sheet">
        <header className="sale-detail-hero">
          <div>
            <p>{t("bill.total", "Total")}</p>
            <strong className="num">{formatINR(sale.total)}</strong>
            <div className="sale-detail-status">
              <Pill
                tone={
                  status === "voided"
                    ? "danger"
                    : ["paid", "settled"].includes(status)
                      ? "ok"
                      : "warn"
                }
              >
                {t(saleCollectionLabel(status), "")}
              </Pill>
              {sale.items.length > 0 &&
              sale.items.every((i) => i.returnedQuantity >= i.quantity) ? (
                <Pill>{t("sale_return.fully_returned", "")}</Pill>
              ) : null}
            </div>
          </div>
          <div className="sale-detail-party">
            <p>
              {t("collection.at_checkout", "")}
              {": "}
              {methods.join(" + ")}
            </p>
            <b>
              {sale.customer?.name ?? t("salesweb.walk_in", "Walk-in customer")}
            </b>
            {sale.customer?.phone ? <p>{sale.customer.phone}</p> : null}
            {sale.customer && perms.canManageCustomers ? (
              <Link href={"/shop/customers/" + sale.customer.id}>
                {t("salesweb.customer_account", "Open customer account")}{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
          </div>
        </header>
        <div className="sale-document-actions">
          {sale.documentPresentationError ? (
            <p role="alert" className="text-danger">
              {t("documents.error.integrity", "")}
            </p>
          ) : sale.documentPresentation ? (
            <IssuedDocumentButton issued={sale.documentPresentation} />
          ) : !fiscal ? (
            <>
              <Button onClick={() => void share()} disabled={sharing}>
                {sharing
                  ? t("common.loading", "")
                  : t("salesweb.share", "Share bill")}
              </Button>
              <Button
                tone="ghost"
                disabled={printing}
                onClick={() => {
                  setPrinting(true);
                  setError(null);
                  const scope = financialScope(shop.id),
                    check = () => {
                      api.assertSession();
                      assertScope(scope);
                      if (!alive.current || !receipt.current)
                        throw Error("counter_print_failed");
                    };
                  void textFontCss(JSON.stringify(sale))
                    .then((fonts) => {
                      check();
                      return printDocument(
                        receipt.current!,
                        "#" + sale.saleNumber,
                        fonts,
                        check,
                      );
                    })
                    .catch(() =>
                      setError(new Error(t("counter.print_failed", ""))),
                    )
                    .finally(() => {
                      if (alive.current) setPrinting(false);
                    });
                }}
              >
                {t("salesweb.print_pdf", "Print / save PDF")}
              </Button>
            </>
          ) : null}
          {sale.estimateId ? (
            <Button tone="quiet" href={"/shop/estimates?id=" + sale.estimateId}>
              {t("estimates.bill_source", "View source estimate")}
            </Button>
          ) : null}
        </div>
        {fiscal ? (
          <details className="sale-detail-disclosure" id="sale-documents" open>
            <summary>
              {t("web.gst.verified_documents", "Verified documents")}
            </summary>
            <GstDocuments saleId={sale.id} />
          </details>
        ) : null}
        {sale.creditTotal > 0 && sale.status === "completed" ? (
          <section className="sale-balance">
            <div>
              <h2>{t("sale_detail.current_invoice_balance", "")}</h2>
              <p className="shop-hint">
                {t("sale_detail.original_credit", "", {
                  amount: formatINR(sale.creditTotal),
                })}
              </p>
            </div>
            {perms.canVoidOrReturn ? (
              <>
                <p className="sale-balance-due">
                  {balance.isFetching
                    ? t("common.loading", "")
                    : balance.isError || !balance.data
                      ? t("sale_detail.balance_unavailable", "")
                      : t("sale_detail.invoice_unpaid", "", {
                          amount: formatINR(Number(balance.data.unpaidCredit)),
                        })}
                </p>
                {balance.data && !balance.isError && !balance.isFetching ? (
                  <>
                    <p>
                      {t("sale_detail.allocated_collections", "", {
                        amount: formatINR(
                          Number(balance.data.allocatedCollections),
                        ),
                      })}
                    </p>
                    <p>
                      {t("sale_detail.return_credit_reduced", "", {
                        amount: formatINR(Number(balance.data.creditReduced)),
                      })}
                    </p>
                    {balance.data.status === "unassigned_collections" ? (
                      <p className="text-warn">
                        {t("sale_detail.balance_unassigned", "")}
                      </p>
                    ) : null}
                  </>
                ) : null}
                <Button
                  tone="quiet"
                  disabled={balance.isFetching || offline}
                  onClick={() => void balance.refetch()}
                >
                  {t("sale_detail.refresh_balance", "")}
                </Button>
              </>
            ) : (
              <p>
                {sale.collection?.remainingCredit != null
                  ? t("collection.balance_due", "", {
                      amount: formatINR(
                        Number(sale.collection.remainingCredit),
                      ),
                    })
                  : t("collection.review", "")}
              </p>
            )}
          </section>
        ) : null}
        <section className="sale-detail-items">
          <div className="sale-section-heading">
            <h2>{t("sale_detail.items_heading", "Items")}</h2>
            <span>{sale.items.length}</span>
          </div>
          {sale.items.map((item) => {
            const revenue = fiscal
              ? (item.netSales ??
                item.taxSnapshot?.net ??
                (item.rspSnapshot
                  ? Number(item.rspSnapshot.calculation.commercial.netSaleValue)
                  : undefined))
              : item.lineTotal;
            const costVisible =
              !hideCost &&
              sale.showCost === true &&
              item.costTotal != null &&
              recorded !== "new";
            return (
              <div className="sale-detail-item" key={item.id}>
                <ProductImageById
                  productId={item.productId}
                  name={item.name}
                  size={44}
                />
                <div className="sale-item-copy">
                  <h3>{item.name}</h3>
                  <p>
                    {formatQty(item.quantity, item.unit)} ×{" "}
                    {formatINR(item.unitPrice)}
                    {item.discountAmount > 0
                      ? " · −" + formatINR(item.discountAmount)
                      : ""}
                  </p>
                  {item.returnedQuantity > 0 ? (
                    <p className="text-warn">
                      {t("sale_detail.returned_n", "", {
                        n: item.returnedQuantity,
                      })}
                    </p>
                  ) : null}
                  {(item.shortfall ?? 0) > 0 ? (
                    <p className="text-warn">
                      {t("sale_detail.oversold", "", {
                        n: item.shortfall!,
                        unit: item.unit,
                      })}
                    </p>
                  ) : null}
                  {item.batches?.length && recorded !== "new" ? (
                    <details className="sale-provenance">
                      <summary>
                        {t("mobile.audit.stock_provenance", "Stock provenance")}
                      </summary>
                      {item.batches.map((b) => (
                        <p key={b.batchId}>
                          {t("sale_detail.from_batch", "", {
                            label: b.batchNumber
                              ? "#" + b.batchNumber
                              : b.purchaseDate
                                ? t("sale_detail.batch_unnamed", "", {
                                    date: formatWhen(b.purchaseDate),
                                  })
                                : t("sale_detail.batch_unknown", ""),
                            n: b.quantity,
                          })}
                          {b.supplier ? " · " + b.supplier : ""}
                          {!hideCost &&
                          sale.showCost === true &&
                          b.purchasePrice != null
                            ? " · " +
                              formatINR(b.purchasePrice) +
                              "/" +
                              item.unit
                            : ""}
                        </p>
                      ))}
                    </details>
                  ) : null}
                  {costVisible ? (
                    <details className="sale-provenance">
                      <summary>
                        {t("salesweb.cost_margin", "Cost & margin")}
                      </summary>
                      <p>
                        {typeof revenue === "number" &&
                        Number.isFinite(revenue) &&
                        revenue > 0
                          ? t(
                              item.returnedQuantity > 0
                                ? "sale_detail.original_cost_margin"
                                : "sale_detail.cost_margin",
                              "",
                              {
                                cost: formatINR(item.costTotal!),
                                margin: formatINR(revenue - item.costTotal!),
                                pct: Math.round(
                                  ((revenue - item.costTotal!) / revenue) * 100,
                                ),
                              },
                            )
                          : t(
                              item.returnedQuantity > 0
                                ? "sale_detail.original_cost_only"
                                : "sale_detail.cost_only",
                              "",
                              { cost: formatINR(item.costTotal!) },
                            )}
                      </p>
                      {item.returnedQuantity > 0 &&
                      sale.gstIntegrity === "verified" &&
                      item.remainingAmounts?.status === "exact" &&
                      item.remainingAmounts.costTotal != null ? (
                        <p>
                          {t("sale_detail.remaining_return_margin", "", {
                            net: formatINR(item.remainingAmounts.netSales),
                            cost: formatINR(item.remainingAmounts.costTotal),
                            margin: formatINR(
                              item.remainingAmounts.netSales -
                                item.remainingAmounts.costTotal,
                            ),
                          })}
                        </p>
                      ) : null}
                    </details>
                  ) : null}
                </div>
                <b className="num">{formatINR(item.lineTotal)}</b>
              </div>
            );
          })}
          <p className="shop-hint sale-photo-note">
            {t("product_images.current_help", "")}
          </p>
          <dl className="sale-detail-totals">
            {!fiscal ? (
              <div>
                <dt>{t("bill.subtotal", "Subtotal")}</dt>
                <dd>{formatINR(sale.subtotal)}</dd>
              </div>
            ) : null}
            {sale.discountAmount > 0 ? (
              <div>
                <dt>{t("bill.discount", "Discount")}</dt>
                <dd>−{formatINR(sale.discountAmount)}</dd>
              </div>
            ) : null}
            <div className="is-total">
              <dt>{t("bill.total", "Total")}</dt>
              <dd>{formatINR(sale.total)}</dd>
            </div>
          </dl>
        </section>
        <section className="sale-detail-payments">
          <h2>{t("sale_detail.payment_heading", "Payment")}</h2>
          {sale.payments.map((payment) => (
            <div className="sale-payment-row" key={payment.id}>
              <div>
                <b>
                  {payment.method === "credit"
                    ? t(
                        payment.kind === "refund"
                          ? "bill.fiscal.credit_reduced"
                          : "pos.method.credit",
                        "",
                      )
                    : t(
                        payment.kind === "refund"
                          ? "bill.refunded"
                          : "bill.paid",
                        "",
                      ) +
                      " · " +
                      t("pos.method." + payment.method, payment.method)}
                </b>
                {payment.reference ? <p>{payment.reference}</p> : null}
                {payment.tendered != null ? (
                  <p>
                    {t("checkout.cash_received", "Cash received")}:{" "}
                    {formatINR(payment.tendered)}
                    {payment.changeGiven
                      ? " · " +
                        t("checkout.change", "Change to return") +
                        ": " +
                        formatINR(payment.changeGiven)
                      : ""}
                  </p>
                ) : null}
              </div>
              <b className="num">
                {payment.kind === "refund" ? "−" : ""}
                {formatINR(payment.amount)}
              </b>
            </div>
          ))}
        </section>
        {sale.returns.length ? (
          <section className="sale-detail-returns">
            <h2>{t("sale_detail.returns", "Returns")}</h2>
            {sale.returns.map((entry) => (
              <article className="sale-return-history" key={entry.id}>
                <header>
                  <span>{formatWhen(entry.createdAt)}</span>
                  <b>
                    {entry.settlement
                      ? t("sale_detail.return_total", "", {
                          amount: formatINR(Number(entry.settlement.total)),
                        })
                      : formatINR(entry.refundAmount) +
                        (entry.refundMethod
                          ? " · " +
                            t(
                              "pos.method." + entry.refundMethod,
                              entry.refundMethod,
                            )
                          : "")}
                  </b>
                </header>
                {entry.items.map((item) => (
                  <p key={item.saleItemId}>
                    {sale.items.find((i) => i.id === item.saleItemId)?.name} ·{" "}
                    {item.quantity}
                    {" · "}
                    {t(
                      item.restock
                        ? "sale_return.restock"
                        : "salesweb.not_restocked",
                      "",
                    )}
                  </p>
                ))}
                {entry.settlement ? (
                  <>
                    <p>
                      {t("sale_detail.return_debt_reduction", "", {
                        amount: formatINR(
                          Number(entry.settlement.creditReduction),
                        ),
                      })}
                    </p>
                    <p>
                      {t("sale_detail.return_money_refund", "", {
                        amount: formatINR(Number(entry.settlement.moneyRefund)),
                      })}
                      {Number(entry.settlement.moneyRefund) > 0
                        ? " · " +
                          t(
                            "pos.method." + entry.settlement.method,
                            entry.settlement.method,
                          )
                        : ""}
                      {entry.settlement.evidenceReference
                        ? " · " + entry.settlement.evidenceReference
                        : ""}
                    </p>
                  </>
                ) : null}
                {entry.reason ? <p>{entry.reason}</p> : null}
                {entry.documentPresentation ? (
                  <IssuedDocumentButton issued={entry.documentPresentation} />
                ) : entry.creditNoteNumber ? (
                  <p>
                    {t("gst.credit_note", "Credit note")}{" "}
                    {entry.creditNoteNumber}
                  </p>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}
        {sale.note ? (
          <details className="sale-detail-disclosure">
            <summary>{t("mobile.audit.record_note", "Note")}</summary>
            <p>{sale.note}</p>
          </details>
        ) : null}
        {sale.status === "voided" ? (
          <div className="sale-voided" role="status">
            {t("sale_detail.voided_on", "", {
              date: sale.voidedAt ? formatWhen(sale.voidedAt) : "—",
            })}
            {sale.voidReason ? " · " + sale.voidReason : ""}
          </div>
        ) : null}
      </section>
      {savedReturn.isError ? (
        <p role="alert">{t("counter.recovery_storage_error", "")}</p>
      ) : null}
      {savedReturn.data ? (
        <div className="sales-recovery">
          <p>{t("counter.pending_outcomes", "", { n: 1 })}</p>
          <Button
            disabled={pending || offline}
            onClick={() => {
              setPending(true);
              setError(null);
              void recoverFinancialRequest(api, shop.id, savedReturn.data!)
                .then(refresh)
                .catch(setError)
                .finally(() => setPending(false));
            }}
          >
            {t("credit.retry", "")}
          </Button>
          <Button href="/shop/settings/gst/recovery" tone="ghost">
            {t("counter.recovery", "")}
          </Button>
        </div>
      ) : null}
      {fiscal && perms.canVoidOrReturn ? (
        <SaleAdjustmentHistory saleId={sale.id} />
      ) : null}
      {perms.canVoidOrReturn && sale.status === "completed" ? (
        <section className="sale-management">
          <h2>{t("salesweb.manage", "Manage this bill")}</h2>
          <p className="shop-hint">
            {t(
              "salesweb.manage_help",
              "Returns and corrections keep the original bill on record.",
            )}
          </p>
          {fiscal ? (
            <details className="sale-detail-disclosure">
              <summary>
                {t("salesweb.adjustments", "Returns & value corrections")}
              </summary>
              {!savedReturn.data && savedReturn.isSuccess ? (
                <GstSaleAdjustments sale={sale} onDone={refresh} />
              ) : null}
            </details>
          ) : returnable.length ? (
            <details className="sale-detail-disclosure">
              <summary>{t("sale_detail.return_items", "Return items")}</summary>
              <SaleReturnEditor
                key={shop.id + ":" + userId + ":" + sale.id}
                sale={sale}
                onDone={refresh}
              />
            </details>
          ) : null}
          {!fiscal && withinWindow ? (
            <details className="sale-detail-disclosure sale-void">
              <summary>{t("sale_detail.void", "Void bill")}</summary>
              <div className="stack-form">
                <p>{t("sale_detail.void_body", "")}</p>
                <p className="shop-hint">
                  {t(
                    withinWindow
                      ? "salesweb.void_window"
                      : "salesweb.void_closed",
                    "",
                    { hours: windowHours ?? "—" },
                  )}
                </p>
                <Field label={uiText("Reason")}>
                  <input
                    className={inputClass}
                    value={voidReason}
                    onChange={(e) => {
                      setVoidReason(e.target.value);
                      setVoidConfirmed(false);
                    }}
                    placeholder={uiText("Optional")}
                  />
                </Field>
                <label className="sale-check">
                  <input
                    type="checkbox"
                    checked={voidConfirmed}
                    onChange={(e) => setVoidConfirmed(e.target.checked)}
                  />
                  {t(
                    "salesweb.void_confirm",
                    "I understand that this will void the bill.",
                  )}
                </label>
                <Button
                  tone="danger"
                  disabled={
                    pending ||
                    offline ||
                    !withinWindow ||
                    !voidConfirmed ||
                    !savedReturn.isSuccess ||
                    !!savedReturn.data
                  }
                  onClick={() => {
                    if (!salesVoidAllowed(sale, windowHours)) return;
                    setPending(true);
                    setError(null);
                    void api
                      .voidSale(shop.id, sale.id, voidReason || undefined)
                      .then(refresh)
                      .catch((caught: unknown) => {
                        if (
                          caught instanceof ApiError &&
                          caught.code === "already_voided"
                        )
                          void refresh();
                        setError(caught);
                      })
                      .finally(() => setPending(false));
                  }}
                >
                  {t("sale_detail.void", "Void bill")}
                </Button>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
      {!sale.documentPresentation && !fiscal ? (
        <details className="sale-legacy-preview">
          <summary>{t("salesweb.receipt_preview", "Receipt preview")}</summary>{" "}
          <article
            ref={receipt}
            className="receipt"
            aria-label={t("counter.bill_number", "", {
              number: sale.saleNumber,
            })}
          >
            <header className="receipt-head">
              <p className="receipt-shop">{pos?.shopName || shop.name}</p>
              {pos?.shopAddress ? <p>{pos.shopAddress}</p> : null}
              {pos?.shopPhone ? <p>{pos.shopPhone}</p> : null}
              {pos?.billHeader ? <p>{pos.billHeader}</p> : null}
            </header>
            <div className="receipt-rule" />
            <div className="receipt-meta">
              <span>
                {uiText("Bill #")}
                {sale.saleNumber}
              </span>
              <span>{formatWhen(sale.soldAt)}</span>
            </div>
            <p
              className={
                sale.status === "voided"
                  ? "receipt-status is-voided"
                  : "receipt-status"
              }
            >
              {t("collection.at_checkout", "")}
              {": "}
              {sale.status === "voided"
                ? t("sales.status_filter.voided", "")
                : sale.paymentStatus === "credit"
                  ? t("counter.unpaid", "")
                  : sale.paymentStatus === "partial"
                    ? t("counter.part_paid", "")
                    : t("bill.paid", "")}
            </p>
            {sale.customer ? (
              <p className="receipt-customer">
                {sale.customer.name}
                {sale.customer.phone ? ` · ${sale.customer.phone}` : ""}
              </p>
            ) : null}
            <div className="receipt-rule" />
            <ul className="receipt-lines">
              {sale.items.map((item) => (
                <li key={item.id}>
                  <div>
                    <p>{item.name}</p>
                    <p className="receipt-qty">
                      {formatQty(item.quantity, item.unit)} ×{" "}
                      {formatINR(item.unitPrice)}
                      {item.discountAmount > 0
                        ? " · " +
                          t("bill.discount", "") +
                          " " +
                          formatINR(item.discountAmount)
                        : ""}
                      {item.returnedQuantity > 0
                        ? " · " +
                          t("counter.returned_quantity", "") +
                          " " +
                          formatQty(item.returnedQuantity, item.unit)
                        : ""}
                    </p>
                  </div>
                  <b>{formatINR(item.lineTotal)}</b>
                </li>
              ))}
            </ul>
            <div className="receipt-rule" />
            <dl className="receipt-totals">
              <div>
                <dt>{uiText("Subtotal")}</dt>
                <dd>{formatINR(sale.subtotal)}</dd>
              </div>
              {sale.discountAmount > 0 ? (
                <div>
                  <dt>{uiText("Discount")}</dt>
                  <dd>−{formatINR(sale.discountAmount)}</dd>
                </div>
              ) : null}
              <div className="is-total">
                <dt>{uiText("Total")}</dt>
                <dd>{formatINR(sale.total)}</dd>
              </div>
            </dl>
            <ul className="receipt-pays">
              {sale.payments.map((payment) => (
                <li key={payment.id} className="receipt-pay">
                  <span>
                    {t("pos.method." + payment.method, payment.method)}
                    {payment.tendered != null || payment.changeGiven ? (
                      <span className="receipt-qty">
                        {payment.tendered != null
                          ? t("checkout.cash_received", "") +
                            " " +
                            formatINR(payment.tendered)
                          : ""}
                        {payment.changeGiven
                          ? `${payment.tendered != null ? " · " : ""}${t("checkout.change", "")} ${formatINR(payment.changeGiven)}`
                          : ""}
                      </span>
                    ) : null}
                  </span>
                  <b>{formatINR(payment.amount)}</b>
                </li>
              ))}
            </ul>
            {sale.creditTotal > 0 ? (
              <p className="receipt-pay">
                <span>{uiText("On credit")}</span>
                <span>{formatINR(sale.creditTotal)}</span>
              </p>
            ) : null}
            {sale.returns.map((entry) => (
              <p key={entry.id} className="receipt-qty">
                {" "}
                {uiText("Return")} {formatWhen(entry.createdAt)} ·{" "}
                {formatINR(entry.refundAmount)}
                {entry.refundMethod
                  ? " · " +
                    t("pos.method." + entry.refundMethod, entry.refundMethod)
                  : ""}
                {entry.reason ? ` · ${entry.reason}` : ""}
              </p>
            ))}
            {sale.returns
              .filter((r) => r.documentPresentation)
              .map((r) => (
                <IssuedDocumentButton
                  key={r.id}
                  issued={r.documentPresentation!}
                />
              ))}
            {sale.note ? <p className="receipt-qty">{sale.note}</p> : null}
            {sale.voidReason ? (
              <p className="receipt-qty">
                {uiText("Voided:")} {sale.voidReason}
              </p>
            ) : null}
            {showCost ? (
              <p className="receipt-cost">
                {uiText("Cost")} {formatINR(sale.costTotal)}
              </p>
            ) : null}
            <p className="receipt-foot">
              {pos?.billFooter || t("bill.thanks", "Thank you")}
            </p>
          </article>
        </details>
      ) : null}
    </div>
  );
}
