"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProductImageById } from "../product-image";
import { VoiceCapture, SpeechAudio } from "../voice-capture";
import { ReportChart } from "../report-chart";
import { SalesInsights } from "../report-sales-insights";
import { StockInsights } from "../report-stock-insights";
import { labeledL1 } from "../../../lib/shop/catalog";
import { downloadText } from "../../../lib/shop/csv";
import {
  dateLocale,
  formatINR,
  formatShortDay,
  formatDay,
} from "../../../lib/shop/money";
import type {
  SalesReport,
  StockReport,
  SpokenAnswer,
} from "../../../lib/shop/types";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import {
  SALES_PERIODS,
  STOCK_PERIODS,
  effectiveReportPeriod,
  reportTab,
  reportCostVisible,
  stockMovementTotals,
  type SalesPeriod,
  type StockPeriod,
} from "../../../lib/shop/reports";
import { useShop } from "../context";
import {
  Button,
  Field,
  NoAccess,
  Notice,
  PageHeader,
  PremiumLock,
  Spinner,
  inputClass,
} from "../ui";

const METHODS = ["cash", "upi", "card", "credit"] as const;
const QUESTION_KEYS = [
  "sales_today",
  "cash",
  "top_selling",
  "udhaar",
  "low_stock",
  "stock_value",
  "expiring",
  "movement",
  "most_active",
  "buy_list",
  "team",
];
function useLabels() {
  const { t } = useShop();
  return (key: string, vars?: Record<string, string | number>) =>
    t(key, EN_FALLBACK[key] || key, vars);
}
function periodLabel(id: string, label: ReturnType<typeof useLabels>) {
  return label(
    id === "last_month"
      ? "reports.sales.period_last_month"
      : id === "90d"
        ? "reports.stock.period_90d"
        : `sales.period.${id}`,
  );
}
function Metric({
  label,
  children,
  note,
}: {
  label: string;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="report-metric">
      <span>{label}</span>
      <strong>{children}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}
function Panel({
  title,
  children,
  note,
}: {
  title: string;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <section className="report-panel">
      <h2>{title}</h2>
      {note ? <p className="shop-hint">{note}</p> : null}
      {children}
    </section>
  );
}
function Breakdown({ rows }: { rows: { label: string; value: number }[] }) {
  const label = useLabels();
  const total = rows.reduce((n, r) => n + Math.max(0, r.value), 0);
  return rows.length ? (
    <div className="report-breakdown">
      {rows.map((r, i) => (
        <div key={i}>
          <span>{r.label}</span>
          <strong>{formatINR(r.value)}</strong>
          <i aria-hidden="true">
            <b
              style={{
                width: `${total ? (Math.max(0, r.value) / total) * 100 : 0}%`,
              }}
            />
          </i>
        </div>
      ))}
    </div>
  ) : (
    <p className="shop-hint">{label("modal.analytics.no_data")}</p>
  );
}
function SalesView({
  report,
  showCost,
  children,
}: {
  report: SalesReport;
  showCost: boolean;
  children?: ReactNode;
}) {
  const { t, prefs } = useShop(),
    label = useLabels(),
    s = report.summary;
  const hour = (h: number) =>
    new Intl.DateTimeFormat(dateLocale(prefs?.appLanguage), {
      hour: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, 0, 1, h)));
  return (
    <>
      <div className="report-overview">
        <Metric
          label={label("sales.summary.revenue")}
          note={t("reportweb.net_sales", "After returns, excluding GST")}
        >
          {formatINR(s.revenue)}
          {report.comparison?.deltaPct.revenue != null ? (
            <em
              className={
                report.comparison.deltaPct.revenue >= 0 ? "is-up" : "is-down"
              }
            >
              {report.comparison.deltaPct.revenue > 0 ? "+" : ""}
              {Math.round(report.comparison.deltaPct.revenue)}%{" "}
              <span>
                {label(
                  report.comparison.label === "same_day_last_week"
                    ? "reports.sales.vs_last_week"
                    : "reports.sales.vs_previous",
                )}
              </span>
            </em>
          ) : null}
        </Metric>
        <Metric label={label("sales.summary.bills")}>{s.bills}</Metric>
        <Metric label={label("reports.sales.avg_before_returns")}>
          {formatINR(s.avgBill)}
        </Metric>
        <Metric label={label("reports.sales.items_sold")}>{s.itemsSold}</Metric>
      </div>
      {report.comparison ? (
        <p className="report-context">
          {label(
            report.comparison.label === "same_day_last_week"
              ? "reports.sales.compare_note_week"
              : "reports.sales.compare_note_prev",
            {
              amount: formatINR(report.comparison.previous.revenue),
              n: report.comparison.previous.bills,
            },
          )}
        </p>
      ) : null}
      {children}
      <div className="report-two-col">
        <Panel
          title={label(
            report.period === "today" && report.premium
              ? "reports.sales.by_hour"
              : "reports.sales.by_day",
          )}
          note={
            report.period === "today" && report.premium
              ? undefined
              : t("reportweb.net_sales", "After returns, excluding GST")
          }
        >
          {report.period === "today" && report.premium ? (
            <ReportChart
              money
              empty={t(
                "reportweb.today_empty",
                "No sales yet today. The first bill will show here.",
              )}
              columns={s.byHour.map((v, h) => ({
                label: hour(h),
                values: [v],
              }))}
              series={[label("sales.summary.revenue")]}
            />
          ) : s.series?.length ? (
            <ReportChart
              money
              columns={s.series.map((d) => ({
                label: formatShortDay(d.date, prefs?.appLanguage),
                values: [d.revenue],
              }))}
              series={[label("sales.summary.revenue")]}
            />
          ) : (
            <p className="shop-hint">{label("sales.empty_title")}</p>
          )}
        </Panel>
        <Panel
          title={label("reports.sales.payment_mix")}
          note={t(
            "reportweb.payment_note",
            "Includes collections and refunds; this is not the sales total.",
          )}
        >
          <Breakdown
            rows={METHODS.map((m) => ({
              label: label(`pos.method.${m}`),
              value: s.byMethod[m] ?? 0,
            }))}
          />
          {s.collections && Object.values(s.collections).some((n) => n > 0) ? (
            <p className="shop-hint">
              {label("reports.sales.incl_collections", {
                amount: formatINR(
                  Object.values(s.collections).reduce((a, b) => a + b, 0),
                ),
              })}
            </p>
          ) : null}
        </Panel>
      </div>
      <details className="report-disclosure">
        <summary>
          <span>
            {t("reportweb.sales_detail", "Sales breakdown")}
            <small>
              {t(
                "reportweb.sales_detail_hint",
                "Categories, busy hours, baskets and returns",
              )}
            </small>
          </span>
          <span aria-hidden="true">+</span>
        </summary>
        <div className="report-disclosure-body">
          <div className="report-two-col">
            <Panel title={label("reports.sales.by_category")}>
              <Breakdown
                rows={report.byCategory.map((c) => ({
                  label:
                    c.category === "legacy_unknown"
                      ? label("reports.sales.category_unknown")
                      : labeledL1(c.category, (k) => label(k)),
                  value: c.revenue,
                }))}
              />
            </Panel>
            <Panel title={label("reports.sales.busy_days")}>
              <ReportChart
                money
                columns={Array.from({ length: 7 }, (_, dow) => ({
                  label: label(
                    `reports.sales.dow.${["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dow]}`,
                  ),
                  values: [
                    report.byWeekday.find((d) => d.dow === dow)?.revenue ?? 0,
                  ],
                }))}
                series={[label("sales.summary.revenue")]}
              />
            </Panel>
          </div>
          {report.premium && report.period !== "today" ? (
            <Panel
              title={label("reports.sales.by_hour")}
              note={
                report.bestHour != null
                  ? label("reports.sales.best_hour_line", {
                      hour: hour(report.bestHour),
                    })
                  : undefined
              }
            >
              <ReportChart
                money
                columns={s.byHour.map((v, h) => ({
                  label: hour(h),
                  values: [v],
                }))}
                series={[label("sales.summary.revenue")]}
              />
            </Panel>
          ) : null}
          <Panel title={label("reports.sales.basket")}>
            <div className="report-stat-grid">
              <Metric label={label("reports.sales.items_per_bill_label")}>
                {report.basket?.itemsPerBill ?? "—"}
              </Metric>
              <Metric label={label("bill.discount")}>
                {formatINR(s.discounts)}
              </Metric>
              <Metric label={label("reports.sales.of_gross")}>
                {report.basket?.discountPctOfGross == null
                  ? "—"
                  : `${report.basket.discountPctOfGross}%`}
              </Metric>
              <Metric
                label={label("reports.sales.bills_discounted")}
                note={
                  report.basket?.discountedBillsPct == null
                    ? undefined
                    : `${report.basket.discountedBillsPct}%`
                }
              >
                {report.basket?.discountedBills ?? 0}
              </Metric>
            </div>
            <p className="shop-hint">{label("reports.sales.average_help")}</p>
          </Panel>
          <Panel title={label("sale_detail.returns")}>
            <div className="report-stat-grid">
              <Metric label={label("sale_detail.returns")}>
                {report.returns?.returns ?? 0}
              </Metric>
              <Metric
                label={t("reportweb.return_value", "Returns value")}
                note={
                  report.returns?.returnPctOfSales == null
                    ? undefined
                    : `${report.returns.returnPctOfSales}%`
                }
              >
                {formatINR(report.returns?.returnAmount)}
              </Metric>
              <Metric label={label("sales.status_filter.voided")}>
                {report.returns?.voids ?? 0}
              </Metric>
              <Metric label={t("reportweb.void_value", "Voided value")}>
                {formatINR(report.returns?.voidAmount)}
              </Metric>
            </div>
            {report.premium && report.returns?.topReturned?.length ? (
              <p className="shop-hint">
                {label("reports.sales.most_returned")}:{" "}
                {report.returns.topReturned
                  .map((x) => `${x.name} ×${x.units}`)
                  .join(", ")}
              </p>
            ) : null}
          </Panel>
          {report.inputMethods?.length ? (
            <Panel title={label("reports.sales.input_methods")}>
              <div className="report-stat-grid">
                {report.inputMethods.map((m) => (
                  <Metric
                    key={m.method}
                    label={label(`reports.sales.method_${m.method}`)}
                    note={formatINR(m.revenue)}
                  >
                    {label("reports.sales.bills_n", { n: m.bills })}
                  </Metric>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>
      </details>
      <Panel
        title={label("reports.sales.net_cash_flow")}
        note={label("reports.sales.net_cash_flow_help")}
      >
        <div className="report-cash">
          <strong>{formatINR(s.cashInDrawer)}</strong>
          <Button tone="quiet" href="/shop/cashbook">
            {label("cashbook.title")} →
          </Button>
        </div>
      </Panel>
      {report.premium && showCost ? (
        <details className="report-disclosure">
          <summary>
            <span>
              {label("reports.sales.gross_profit")}
              <small>
                {t(
                  "reportweb.profit_hint",
                  "Cost, margin and purchase-cost corrections",
                )}
              </small>
            </span>
            <span aria-hidden="true">+</span>
          </summary>
          <div className="report-disclosure-body">
            <div className="report-stat-grid">
              <Metric label={label("reports.sales.gross_profit")}>
                {formatINR(s.grossProfit)}
              </Metric>
              <Metric label={label("reports.sales.margin")}>
                {s.marginPct == null ? "—" : `${s.marginPct.toFixed(1)}%`}
              </Metric>
            </div>
            <p className="shop-hint">
              {label("reports.sales.cogs_note", { amount: formatINR(s.cogs) })}
            </p>
            {s.purchaseCostMovement && s.purchaseCostMovement.count > 0 ? (
              <Panel
                title={label("gst.cost_movement_title")}
                note={label("gst.cost_movement_notice")}
              >
                <div className="report-stat-grid">
                  {(["inventory", "consumed", "total"] as const).map((k) => (
                    <Metric key={k} label={label(`gst.cost_movement_${k}`)}>
                      {formatINR(Number(s.purchaseCostMovement![k]))}
                    </Metric>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>
        </details>
      ) : null}
      <SalesInsights report={report} showCost={showCost} />
    </>
  );
}
function StockView({
  report,
  showCost,
}: {
  report: StockReport;
  showCost: boolean;
}) {
  const { t, prefs } = useShop(),
    label = useLabels(),
    s = report.onHand,
    totals = stockMovementTotals(report.movementByDay);
  return (
    <>
      <div className="report-overview">
        <Metric
          label={label(
            showCost ? "reports.stock.value_at_cost" : "reports.stock.units",
          )}
          note={t(
            "reportweb.current_stock",
            "Current stock. The selected period applies to movements and history.",
          )}
        >
          {showCost ? formatINR(s.costValue) : s.units}
        </Metric>
        <Metric label={label("reports.stock.products")}>{s.products}</Metric>
        <Metric label={label("reports.stock.status_low")}>
          {s.byStatus.LOW.products}
        </Metric>
        <Metric label={label("reports.stock.status_out")}>
          {s.byStatus.OUT.products}
        </Metric>
      </div>
      {showCost ? (
        <p className="report-context">
          {label("reports.stock.status_ok")}: {s.byStatus.OK.products} ·{" "}
          {label("reports.stock.retail_value")}: {formatINR(s.retailValue)} ·{" "}
          {label("reports.stock.potential_margin", {
            amount: formatINR(s.potentialMargin),
          })}
        </p>
      ) : null}
      <div className="report-two-col">
        <Panel
          title={label("reports.stock.movement")}
          note={label("mobile.observations.movement_range")}
        >
          <div className="report-stat-grid report-movement-totals">
            {(["incoming", "sold", "adjusted", "net"] as const).map((k, i) => (
              <Metric
                key={k}
                label={label(
                  [
                    "reports.stock.units_in",
                    "reports.stock.units_sold",
                    "reports.stock.units_adjusted",
                    "reports.stock.net",
                  ][i],
                )}
              >
                {totals[k]}
              </Metric>
            ))}
          </div>
          {report.movementByDay.length ? (
            <>
              <div className="report-legend">
                {["units_in", "units_sold", "units_adjusted"].map((k, i) => (
                  <span key={k}>
                    <i className={`report-series-${i}`} />
                    {label(`reports.stock.${k}`)}
                  </span>
                ))}
              </div>
              <ReportChart
                columns={report.movementByDay.map((d) => ({
                  label: formatShortDay(d.date, prefs?.appLanguage),
                  values: [d.unitsIn, d.unitsSold, d.unitsAdjusted],
                }))}
                series={["units_in", "units_sold", "units_adjusted"].map((k) =>
                  label(`reports.stock.${k}`),
                )}
              />
            </>
          ) : (
            <p className="shop-hint">{label("modal.analytics.no_data")}</p>
          )}
        </Panel>
        <Panel title={label("reports.stock.expiry")}>
          <p className="shop-hint">
            {t(
              "reportweb.expiry_note",
              "Upcoming expiry windows overlap. Review the batches below.",
            )}
          </p>
          <div className="report-expiry">
            {(["within7", "within30", "within60"] as const).map((k, i) => (
              <div key={k}>
                <span>{label(`reports.stock.expiry_${[7, 30, 60][i]}`)}</span>
                <strong>
                  {showCost
                    ? formatINR(report.expiry[k].costValue)
                    : report.expiry[k].units}
                </strong>
                <small>
                  {t("reportweb.batches", "{{n}} batches", {
                    n: report.expiry[k].batches,
                  })}
                </small>
              </div>
            ))}
          </div>
          <Button href="/shop/products?filter=near_expiry" tone="quiet">
            {t("reportweb.review_stock", "Review stock")} →
          </Button>
        </Panel>
      </div>
      <details className="report-disclosure">
        <summary>
          <span>
            {t("reportweb.stock_detail", "Stock breakdown")}
            <small>
              {t(
                "reportweb.stock_detail_hint",
                "Categories and batches nearing expiry",
              )}
            </small>
          </span>
          <span aria-hidden="true">+</span>
        </summary>
        <div className="report-disclosure-body">
          <Panel
            title={label(
              showCost
                ? "reports.stock.value_by_category"
                : "reports.stock.units_by_category",
            )}
          >
            <div className="report-category-list">
              {report.byCategory.length ? (
                report.byCategory.map((c) => (
                  <div key={c.category}>
                    <span>
                      {labeledL1(c.category, (k) => label(k))}
                      <small>
                        {label("reports.stock.status_low")}: {c.lowStock} ·{" "}
                        {label("reports.stock.status_out")}: {c.outOfStock}
                      </small>
                    </span>
                    <strong>
                      {showCost ? formatINR(c.costValue) : c.units}
                    </strong>
                  </div>
                ))
              ) : (
                <p>{label("modal.analytics.no_data")}</p>
              )}
            </div>
          </Panel>
          <Panel title={label("reports.stock.expiry")}>
            <div className="report-product-list">
              {report.expiry.items.length ? (
                report.expiry.items.map((item, i) => (
                  <Link
                    key={`${item.productId}-${item.expiryDate}-${i}`}
                    href={`/shop/products/${encodeURIComponent(item.productId)}`}
                  >
                    <ProductImageById
                      productId={item.productId}
                      name={item.name}
                      size={40}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.units} {item.unit} ·{" "}
                        {formatShortDay(item.expiryDate, prefs?.appLanguage)}
                        {item.batchNumber ? ` · ${item.batchNumber}` : ""}
                      </small>
                    </span>
                    <b>
                      {item.daysRemaining <= 0
                        ? label("reports.stock.expired")
                        : label("reports.stock.in_days", {
                            n: item.daysRemaining,
                          })}
                    </b>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))
              ) : (
                <p className="shop-hint">{label("modal.analytics.no_data")}</p>
              )}
            </div>
          </Panel>
        </div>
      </details>
      <StockInsights
        key={`${report.range.from}:${report.range.to}`}
        report={report}
        showCost={showCost}
      />
    </>
  );
}

export function ReportsScreen() {
  const { shop, userId, perms, premium, prefs, hideCost } = useShop();
  return (
    <ReportsWorkspace
      key={`${shop?.id}:${userId}:${perms.role}:${premium}:${hideCost}:${prefs?.voiceLanguage}:${prefs?.voiceFeedbackEnabled}`}
    />
  );
}
function ReportsWorkspace() {
  const { api, shop, userId, perms, premium, prefs, hideCost, t, offline } =
      useShop(),
    label = useLabels(),
    params = useSearchParams();
  const [tab, setTab] = useState(() => reportTab(params.get("tab")));
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("7d"),
    [stockPeriod, setStockPeriod] = useState<StockPeriod>("7d");
  const [topBy, setTopBy] = useState<"quantity" | "revenue">("quantity");
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState<SpokenAnswer | null>(null),
    [error, setError] = useState<unknown>(null),
    [askError, setAskError] = useState<unknown>(null),
    [asking, setAsking] = useState(false),
    [exporting, setExporting] = useState(false),
    [exported, setExported] = useState(false);
  const alive = useRef(true),
    askLock = useRef(false),
    exportLock = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => setTab(reportTab(params.get("tab"))), [params.get("tab")]);
  const salesEffective = effectiveReportPeriod(salesPeriod, premium),
    stockEffective = effectiveReportPeriod(stockPeriod, premium);
  const enabled = !!shop && perms.canSeeReports && !offline,
    scope = [shop?.id, userId, perms.role, premium, hideCost];
  const sales = useQuery({
    queryKey: ["report-sales", ...scope, salesEffective],
    enabled: enabled && tab === "sales",
    queryFn: () => api.getSalesReport(shop!.id, salesEffective),
  });
  const stock = useQuery({
    queryKey: ["report-stock", ...scope, stockEffective],
    enabled: enabled && tab === "stock",
    queryFn: () => api.getStockReport(shop!.id, stockEffective),
  });
  const top = useQuery({
    queryKey: ["top", ...scope, salesEffective, premium ? topBy : "quantity"],
    enabled: enabled && tab === "sales",
    queryFn: () =>
      api.getTopProducts(shop!.id, {
        period: salesEffective,
        by: premium ? topBy : "quantity",
        limit: 8,
      }),
  });
  const history = useQuery({
    queryKey: ["report-history", ...scope, stockEffective],
    enabled: enabled && tab === "stock" && perms.canSeeCost && !hideCost,
    queryFn: () => api.getHistory(shop!.id, parseInt(stockEffective)),
  });
  const active = tab === "sales" ? sales : stock,
    report = active.data;
  const showCost = reportCostVisible(
    report?.showCost,
    perms.canSeeCost,
    hideCost,
  );
  const selected = tab === "sales" ? salesPeriod : stockPeriod,
    effective = tab === "sales" ? salesEffective : stockEffective;
  const refresh = () => {
    void active.refetch();
    if (tab === "sales") void top.refetch();
    else if (perms.canSeeCost && !hideCost) void history.refetch();
  };
  const ask = async (text: string) => {
    if (!text.trim() || !shop || !enabled || !premium || askLock.current)
      return;
    askLock.current = true;
    setAsking(true);
    setAnswer(null);
    setAskError(null);
    setQuestion(text);
    try {
      const response = await api.ask(
        shop.id,
        text.trim(),
        prefs?.voiceLanguage ?? prefs?.appLanguage,
        prefs?.voiceFeedbackEnabled !== false,
      );
      if (alive.current) setAnswer(response);
    } catch (e) {
      if (alive.current) setAskError(e);
    } finally {
      if (alive.current) {
        askLock.current = false;
        setAsking(false);
      }
    }
  };
  const exportCsv = async () => {
    if (
      !shop ||
      !enabled ||
      !premium ||
      !report ||
      active.isError ||
      exportLock.current
    )
      return;
    exportLock.current = true;
    setExporting(true);
    setExported(false);
    setError(null);
    const requestedTab = tab,
      requestedPeriod = effective;
    try {
      api.assertSession();
      const csv =
        requestedTab === "sales"
          ? await api.salesCsv(shop.id, { period: requestedPeriod })
          : await api.stockCsv(shop.id, requestedPeriod);
      api.assertSession();
      if (alive.current) {
        downloadText(`${requestedTab}-${requestedPeriod}.csv`, csv);
        setExported(true);
      }
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) {
        exportLock.current = false;
        setExporting(false);
      }
    }
  };
  if (!shop) return <Spinner />;
  if (!enabled)
    return (
      <NoAccess
        what={t(
          offline ? "reportweb.offline" : "reportweb.access",
          offline
            ? "Reconnect to view up-to-date reports."
            : "Reports are for owners and managers.",
        )}
      />
    );
  return (
    <div className="shop-page reports-workspace">
      <PageHeader
        kicker={t("reportweb.insights", "Insights")}
        title={label("reports.title")}
        description={t(
          "reportweb.intro",
          "See what sold, what moved, and what needs a closer look.",
        )}
        actions={
          <>
            <Button tone="ghost" disabled={active.isFetching} onClick={refresh}>
              {t("common.refresh", "Refresh")}
            </Button>
            {premium ? (
              <Button
                disabled={
                  exporting || active.isFetching || !report || active.isError
                }
                onClick={() => void exportCsv()}
              >
                {exporting
                  ? label("common.loading")
                  : t("reportweb.export", "Export CSV")}{" "}
                ↓
              </Button>
            ) : null}
          </>
        }
      />
      <div className="report-controls">
        <div className="report-tabs" aria-label={label("reports.title")}>
          {(["sales", "stock"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => {
                setTab(id);
                setExported(false);
              }}
            >
              {label(`reports.tab.${id}`)}
            </button>
          ))}
        </div>
        <div
          className="report-tabs report-periods"
          role="group"
          aria-label={t("reportweb.period", "Report period")}
        >
          {(tab === "sales" ? SALES_PERIODS : STOCK_PERIODS).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={selected === p}
              onClick={() => {
                tab === "sales"
                  ? setSalesPeriod(p as SalesPeriod)
                  : setStockPeriod(p as StockPeriod);
                setExported(false);
              }}
            >
              {periodLabel(p, label)}
              {effectiveReportPeriod(p, premium) !== p ? (
                <>
                  <span aria-hidden="true"> 🔒</span>
                  <span className="sr-only">
                    {" · "}
                    {label("subscription.status.active")}
                  </span>
                </>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <div className="report-caption">
        <span>
          {periodLabel(effective, label)}
          {report?.range
            ? ` · ${formatDay(report.range.from, prefs?.appLanguage)} – ${formatDay(new Date(new Date(report.range.to).getTime() - 1).toISOString(), prefs?.appLanguage)}`
            : ""}
        </span>
        <span>{t("reportweb.india_time", "India time · IST")}</span>
      </div>
      {effective !== selected ? (
        <div className="report-plan-note">
          <p>
            {label(
              tab === "sales"
                ? "reports.sales.range_premium"
                : "reports.stock.range_premium",
            )}
          </p>

          <Button tone="quiet" href="/shop/settings/subscription">
            {t("reportweb.plans", "View plans")} →
          </Button>
        </div>
      ) : null}
      <Notice error={error} />
      {exported ? (
        <p role="status" className="shop-hint">
          {t("reportweb.export_ready", "CSV download started.")}
        </p>
      ) : null}
      {active.isLoading ? (
        <Spinner label={label("mobile.audit.loading_report")} />
      ) : active.isError ? (
        <div>
          <Notice error={active.error} />
          <Button tone="ghost" onClick={refresh}>
            {label("common.retry")}
          </Button>
        </div>
      ) : null}
      {!active.isError && report ? (
        <>
          {tab === "sales" && sales.data ? (
            <SalesView report={sales.data} showCost={showCost}>
              <Panel title={label("reports.sales.top_products")}>
                <div className="report-ranking-head">
                  {premium ? (
                    <div className="report-tabs">
                      {(["quantity", "revenue"] as const).map((by) => (
                        <button
                          key={by}
                          aria-pressed={topBy === by}
                          onClick={() => setTopBy(by)}
                        >
                          {label(`reports.sales.by_${by}`)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <Button href="/shop/sales" tone="quiet">
                    {t("reportweb.view_sales", "View sales")} →
                  </Button>
                </div>
                {top.isLoading ? (
                  <Spinner />
                ) : top.isError ? (
                  <>
                    <Notice error={top.error} />
                    <Button tone="quiet" onClick={() => void top.refetch()}>
                      {label("common.retry")}
                    </Button>
                  </>
                ) : (
                  <div className="report-product-list">
                    {top.data?.products.map((p, i) => (
                      <div key={`${p.productId}-${i}`}>
                        <small className="report-rank">
                          {String(i + 1).padStart(2, "0")}
                        </small>
                        <ProductImageById
                          productId={p.productId}
                          name={p.name}
                          size={40}
                        />
                        <span>
                          {p.productId ? (
                            <Link
                              href={`/shop/products/${encodeURIComponent(p.productId)}`}
                            >
                              {p.name} →
                            </Link>
                          ) : (
                            <strong>{p.name}</strong>
                          )}
                          <small>
                            {p.quantity} {p.unit} ·{" "}
                            {label("reports.sales.in_bills", { n: p.bills })}
                            {premium && showCost && p.marginPct != null
                              ? ` · ${p.marginPct}% ${label("reports.sales.margin")}`
                              : ""}
                          </small>
                          {p.fiscalCorrectionNet ? (
                            <small>
                              {label("reports.sales.value_corrections")}:{" "}
                              {formatINR(p.fiscalCorrectionNet)}
                            </small>
                          ) : null}
                        </span>
                        <b>{formatINR(p.revenue)}</b>
                      </div>
                    ))}
                    {!top.data?.products.length ? (
                      <p className="shop-hint">
                        {label("modal.analytics.no_data")}
                      </p>
                    ) : null}
                  </div>
                )}
              </Panel>
            </SalesView>
          ) : null}
          {tab === "stock" && stock.data ? (
            <StockView report={stock.data} showCost={showCost} />
          ) : null}
          {tab === "stock" && showCost ? (
            <Panel
              title={label("modal.analytics.value_trend_title")}
              note={t(
                "reportweb.history_note",
                "Daily stock-value snapshots. Missing days are not filled in.",
              )}
            >
              {history.isLoading ? (
                <Spinner />
              ) : history.isError ? (
                <>
                  <Notice error={history.error} />
                  <Button tone="quiet" onClick={() => void history.refetch()}>
                    {label("common.retry")}
                  </Button>
                </>
              ) : history.data?.stats.filter((d) => d.totalStockValue != null)
                  .length ? (
                <ReportChart
                  money
                  columns={history.data.stats
                    .filter((d) => d.totalStockValue != null)
                    .map((d) => ({
                      label: formatShortDay(d.date, prefs?.appLanguage),
                      values: [d.totalStockValue!],
                    }))}
                  series={[label("modal.analytics.value_trend_title")]}
                />
              ) : (
                <p className="shop-hint">
                  {t(
                    "reportweb.history_empty",
                    "No stock-value snapshots yet.",
                  )}
                </p>
              )}
            </Panel>
          ) : null}

          {!premium ? (
            <div className="report-plan-note">
              <p>
                {label(
                  tab === "sales"
                    ? "reports.sales.more_premium"
                    : "reports.stock.more_premium",
                )}
              </p>
              <Button tone="quiet" href="/shop/settings/subscription">
                {t("reportweb.plans", "View plans")} →
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
      <section className="report-ask">
        <div>
          <p className="shop-kicker">
            {t("reportweb.ask_kicker", "A closer look")}
          </p>
          <h2>{label("modal.analytics.ask_title")}</h2>
          <p>
            {t(
              "reportweb.ask_hint",
              "Ask about your shop in your own words. Answers may cover a different period from this report.",
            )}
          </p>
        </div>
        <div>
          <Notice error={askError} />
          {premium ? (
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(question);
              }}
            >
              <Field label={label("modal.analytics.ask_placeholder")}>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={question}
                  disabled={asking}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </Field>
              <div className="shop-actions">
                <Button type="submit" disabled={asking || !question.trim()}>
                  {asking
                    ? label("modal.analytics.analyzing")
                    : t("reportweb.ask", "Ask")}
                </Button>
                <VoiceCapture
                  disabled={asking}
                  onRecorded={async (recording) => {
                    if (askLock.current) return;
                    askLock.current = true;
                    setAsking(true);
                    setAnswer(null);
                    setAskError(null);
                    try {
                      const response = await api.askVoice(
                        shop.id,
                        recording,
                        prefs?.voiceLanguage ?? prefs?.appLanguage,
                        prefs?.voiceFeedbackEnabled !== false,
                      );
                      if (alive.current) {
                        setAnswer(response);
                        if (response.transcript)
                          setQuestion(response.transcript);
                      }
                    } catch (e) {
                      if (alive.current) setAskError(e);
                      throw e;
                    } finally {
                      if (alive.current) {
                        askLock.current = false;
                        setAsking(false);
                      }
                    }
                  }}
                />
              </div>
              {!answer ? (
                <details className="report-data">
                  <summary>{t("reportweb.examples", "Try a question")}</summary>
                  <div className="report-question-list">
                    {QUESTION_KEYS.map((k) => (
                      <button
                        type="button"
                        key={k}
                        disabled={asking}
                        onClick={() =>
                          void ask(label(`modal.analytics.sample_${k}`))
                        }
                      >
                        {label(`modal.analytics.sample_${k}`)} →
                      </button>
                    ))}
                  </div>
                </details>
              ) : (
                <div className="report-answer" aria-live="polite">
                  <p>{answer.answer}</p>
                  <SpeechAudio
                    base64={answer.ttsAudioBase64}
                    label={label("brief.listen")}
                  />
                  <Button
                    tone="quiet"
                    onClick={() => {
                      setAnswer(null);
                      setQuestion("");
                    }}
                  >
                    {label("modal.analytics.ask_another")}
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <PremiumLock shopId={shop.id} feature="analytics" />
          )}
        </div>
      </section>
    </div>
  );
}
