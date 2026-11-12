"use client";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../../lib/shop/cart";
import { downloadText } from "../../../lib/shop/csv";
import { formatINR } from "../../../lib/shop/money";
import { salesSummaryParams, salesRangeReady } from "../../../lib/shop/sales";
import {
  saleCollectionStatus,
  saleCollectionLabel,
} from "../../../lib/shop/sale-collection";
import {
  financialScope,
  assertScope,
  retainedRequests,
} from "../../../lib/shop/gst-storage";
import { useFiscalDate } from "../gst-ui";
import { useShop } from "../context";
import {
  CounterNotice,
  CounterFiltersView,
  useCounterFilters,
} from "../counter-filters";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  Pill,
  PremiumLock,
  Skeleton,
  Spinner,
  isPremiumError,
} from "../ui";

export function SalesScreen() {
  const qc = useQueryClient(),
    { api, shop, userId, perms, premium, prefs, t, offline } = useShop(),
    when = useFiscalDate();
  const draft = useCart(userId, shop?.id ?? null);
  const { filters, params, href, change } = useCounterFilters("sales");
  const [error, setError] = useState<unknown>(null),
    [exporting, setExporting] = useState(false);
  const tr = (k: string, v?: Record<string, string | number>) =>
      t("counter." + k, "", v),
    ready = salesRangeReady(filters),
    range = salesSummaryParams(filters);
  const sales = useInfiniteQuery({
    queryKey: ["sales", shop?.id, userId, params],
    enabled: !!shop && perms.canSell && ready,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      api.getSales(shop!.id, {
        ...params,
        limit: 50,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const summary = useQuery({
    queryKey: ["salesSummary", shop?.id, userId, range],
    enabled: !!shop && perms.canSell && ready,
    queryFn: () => api.getSalesSummary(shop!.id, range),
  });
  const journal = useQuery({
    queryKey: ["counterJournal", userId, shop?.id],
    enabled: !!shop && !!userId && perms.canSell,
    networkMode: "always",
    retry: false,
    refetchInterval: 10000,
    queryFn: async () => {
      const scope = financialScope(shop!.id);
      const rows = await retainedRequests(scope);
      assertScope(scope);
      return rows.filter(
        (r) => r.state === "pending" && /\/sales(?:\/|$)/.test(r.path),
      );
    },
  });
  if (!shop) return <Spinner />;
  if (!perms.canSell)
    return (
      <Card>
        <h2>{tr("access_denied")}</h2>
        <p>{tr("sales_no_access")}</p>
      </Card>
    );
  const rows = sales.data?.pages.flatMap((p) => p.sales) ?? [],
    first = sales.data?.pages[0];
  const exportCsv = async () => {
    setError(null);
    setExporting(true);
    try {
      const scope = financialScope(shop.id);
      const csv = await api.salesCsv(shop.id, {
        ...params,
        register: "1",
        language: prefs?.appLanguage ?? "en",
      });
      api.assertSession();
      assertScope(scope);
      downloadText("sales.csv", csv);
    } catch (e) {
      setError(e);
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="shop-page sales-workspace">
      <PageHeader
        kicker={tr("counter")}
        title={t("sales.title", "Sales")}
        description={t(
          "salesweb.intro",
          "Find a bill. Follow a payment. Keep every sale in view.",
        )}
      />
      {draft.pending ? (
        <div className="sales-recovery" role="status">
          <p>{t("counter.pending_outcomes", "", { n: 1 })}</p>
          <Button href="/shop/sell/checkout" tone="ghost">
            {t("checkoutweb.retry", "Check saved bill")} →
          </Button>
        </div>
      ) : null}
      {(journal.data?.length ?? 0) > 0 || journal.isError ? (
        <div className="sales-recovery" role="status">
          <p>
            {journal.isError
              ? tr("recovery_storage_error")
              : tr("pending_outcomes", { n: journal.data!.length })}
          </p>
          <Button href="/shop/settings/gst/recovery" tone="ghost" size="sm">
            {tr("recovery")}
          </Button>
        </div>
      ) : null}
      <section className="sales-register">
        <div className="sales-register-heading">
          <div>
            <h2>{t("salesweb.ledger", "Sales register")}</h2>
            {first ? <p>{tr("results", { n: first.total })}</p> : null}
          </div>
          <details className="sales-tools">
            <summary>
              {t("salesweb.tools", "Register tools")}{" "}
              <span aria-hidden="true">＋</span>
            </summary>
            <nav aria-label={t("salesweb.tools", "Register tools")}>
              <Link href="/shop/estimates">
                {t("estimates.mobile.title_short", "Estimates")}
              </Link>
              <Link href="/shop/settings/gst/recovery">{tr("recovery")}</Link>
              {perms.canSeeReports ? (
                <>
                  <Link href="/shop/sales/refunds">{tr("refunds_title")}</Link>
                  <Button
                    tone="quiet"
                    disabled={!ready || exporting || offline}
                    href={!premium ? "/shop/settings/subscription" : undefined}
                    onClick={() => void exportCsv()}
                  >
                    {exporting
                      ? t("common.loading", "Loading")
                      : tr("export_register")}
                    {!premium ? " · Premium" : ""}
                  </Button>
                </>
              ) : null}
            </nav>
          </details>
        </div>
        <CounterFiltersView kind="sales" value={filters} onChange={change} />
        <CounterNotice
          error={error ?? (isPremiumError(sales.error) ? null : sales.error)}
        />
        {isPremiumError(error) || isPremiumError(sales.error) ? (
          <PremiumLock shopId={shop.id} feature="pos_reports" />
        ) : null}
        {first?.limitedToDays ? (
          <p className="sales-limit">
            {t("activity.free_limit_title", "", { days: first.limitedToDays })}{" "}
            <Link href="/shop/settings/subscription">
              {t("subscription.cta.manage", "Manage plan")}
            </Link>
          </p>
        ) : null}
        {!ready ? (
          <p role="status">{tr("error.invalid_range")}</p>
        ) : sales.isPending ? (
          <Skeleton variant="row" count={4} label={t("common.loading", "Loading")} />
        ) : null}
        <div className="sales-ledger-head" aria-hidden="true">
          <span>{t("bill.bill", "Bill")}</span>
          <span>{t("sale_detail.payment_heading", "Payment")}</span>
          <span>{t("bill.total", "Total")}</span>
          <span />
        </div>
        <div className="sales-ledger">
          {rows.map((sale) => (
            <Link
              key={sale.id}
              href={
                "/shop/sales/" +
                sale.id +
                "?returnTo=" +
                encodeURIComponent(href)
              }
              className="sales-entry"
            >
              <span className="sales-entry-main">
                <span className="sales-entry-title">
                  <b>{sale.invoiceNumber ?? "#" + sale.saleNumber}</b>
                  <span>
                    {sale.customerName ||
                      t("salesweb.walk_in", "Walk-in customer")}
                  </span>
                </span>
                <span className="sales-entry-items">
                  {sale.firstItem ?? t("bill.bill", "Bill")}
                  {sale.itemCount > 1 ? " +" + (sale.itemCount - 1) : ""}
                </span>
                <span className="sales-entry-meta">
                  {when(sale.soldAt)}
                  {sale.sellerName ? " · " + sale.sellerName : ""}
                </span>
              </span>
              <span className="sales-entry-payment">
                <Pill
                  tone={
                    sale.status === "voided"
                      ? "danger"
                      : ["paid", "settled"].includes(saleCollectionStatus(sale))
                        ? "ok"
                        : "warn"
                  }
                >
                  {t(saleCollectionLabel(saleCollectionStatus(sale)), "")}
                </Pill>
                <span>
                  {sale.methods.map((m) => t("pos.method." + m, m)).join(" + ")}
                </span>
              </span>
              <span className="sales-entry-amount">
                <b className="num">{formatINR(sale.total)}</b>
                {sale.returnCount > 0 ? (
                  <span>{tr("returned", { n: sale.returnCount })}</span>
                ) : null}
                {sale.status !== "voided" &&
                Number(sale.collection?.remainingCredit) > 0 ? (
                  <span>
                    {t("collection.balance_due", "", {
                      amount: formatINR(
                        Number(sale.collection?.remainingCredit),
                      ),
                    })}
                  </span>
                ) : null}
              </span>
              <span className="sales-entry-arrow" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>
        {sales.isSuccess && !rows.length ? (
          <EmptyState
            icon="receipt"
            title={t(
              filters.q.trim() ||
                filters.status !== "all" ||
                filters.desk !== "all" ||
                filters.method !== "all"
                ? "counter.no_bills"
                : filters.period === "today"
                  ? "mobile.observations.no_sales_today"
                  : filters.period === "yesterday"
                    ? "mobile.observations.no_sales_yesterday"
                    : "counter.no_bills",
              "",
            )}
            body={t("mobile.observations.earlier_bills", "")}
            action={
              <div className="shop-actions">
                {filters.q.trim() && filters.period !== "all" ? (
                  <Button
                    onClick={() => change({ period: "all", from: "", to: "" })}
                  >
                    {t("salesweb.search_all_dates", "Search all dates for “{{q}}”", {
                      q: filters.q.trim(),
                    })}
                  </Button>
                ) : null}
                <Button
                  tone="ghost"
                  onClick={() =>
                    change({
                      period: filters.period === "today" ? "yesterday" : "7d",
                      from: "",
                      to: "",
                      q: "",
                      status: "all",
                      desk: "all",
                      method: "all",
                    })
                  }
                >
                  {t(
                    filters.period === "today"
                      ? "mobile.observations.yesterday_bills"
                      : "mobile.observations.recent_bills",
                    "",
                  )}
                </Button>
              </div>
            }
          />
        ) : null}
        <footer className="sales-register-footer">
          <p>{tr("snapshot_help")}</p>
          {sales.isError ? (
            <Button
              tone="ghost"
              onClick={() =>
                void qc.resetQueries({
                  queryKey: ["sales", shop.id, userId, params],
                })
              }
            >
              {tr("reset_pages")}
            </Button>
          ) : sales.hasNextPage ? (
            <Button
              tone="ghost"
              disabled={sales.isFetchingNextPage}
              onClick={() => void sales.fetchNextPage()}
            >
              {sales.isFetchingNextPage ? t("common.loading", "") : tr("more")}
            </Button>
          ) : null}
        </footer>
      </section>
      <section
        className="sales-period"
        aria-label={t("salesweb.overview", "Period overview")}
      >
        <div className="sales-period-heading">
          <h2>{t("salesweb.overview", "Period overview")}</h2>
          <span>
            {filters.period === "custom"
              ? filters.from + " — " + filters.to
              : tr("period_" + filters.period)}
          </span>
        </div>
        {ready && summary.isSuccess && !summary.isError ? (
          <>
            <dl className="sales-metrics">
              <div className="is-leading">
                <dt>{t("sales.summary.revenue", "Net sales")}</dt>
                <dd>{formatINR(summary.data.revenue)}</dd>
              </div>
              <div>
                <dt>{t("sales.summary.bills", "Bills")}</dt>
                <dd>{summary.data.bills}</dd>
              </div>
              <div>
                <dt>
                  {t(
                    "reports.sales.avg_before_returns",
                    "Average bill before returns",
                  )}
                </dt>
                <dd>{formatINR(summary.data.avgBill)}</dd>
              </div>
              <div>
                <dt>{t("sales.summary.returned_value", "Returned value")}</dt>
                <dd>{formatINR(summary.data.returns ?? 0)}</dd>
              </div>
            </dl>
            <p className="shop-hint">
              {t("reports.sales.average_help", "")}{" "}
              {t(
                "salesweb.period_scope",
                "Period totals include all bills, before list filters.",
              )}
            </p>
          </>
        ) : !ready ? (
          <p className="shop-hint">{tr("error.invalid_range")}</p>
        ) : summary.isPending ? (
          <Skeleton variant="line" count={2} label={t("common.loading", "Loading")} />
        ) : (
          <div className="sales-period-error" role="status">
            <p className="shop-hint">
              {t(
                "salesweb.summary_totals_unavailable",
                "Period totals could not be loaded.",
              )}
            </p>
            <Button tone="ghost" size="sm" onClick={() => void summary.refetch()}>
              {t("common.retry", "Try again")}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
