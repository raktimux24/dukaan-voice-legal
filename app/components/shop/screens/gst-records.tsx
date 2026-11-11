"use client";
import {
  gstMonitorView,
  gstMonitorReceiptConfirmed,
  CORE_MONITOR_KINDS,
} from "../../../lib/shop/gst-monitor-view";
import { VoiceSheet } from "../voice-sheet";
import { TabList } from "../settings-tabs";
import { gstPositionRanges } from "../../../lib/shop/gst-register-positions";
import { hasLocalIssuedReceipt } from "../../../lib/shop/local-issued-receipt";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, PageHeader, Notice, Pill, Spinner } from "../ui";
import { dateLocale, formatINR } from "../../../lib/shop/money";
import {
  Section,
  TextField,
  useGstText,
  useFiscalDate,
} from "../gst-ui";
import {
  GstAccess,
  useGstQuery,
  useGstPages,
  ReadState,
  More,
  useGstAction,
} from "../gst-workspace";
import {
  financialScope,
  retainedRequests,
  saveFile,
  requestStatus,
  readState,
  assertScope,
  type RetainedRequest,
} from "../../../lib/shop/gst-storage";
import {
  recoverFinancialRequest,
  closeUnrecordedPurchase,
} from "../../../lib/shop/gst-recovery";
import {
  issueSale,
  recoverReservedSales,
} from "../../../lib/shop/gst-issuance";
import type { CreateSalePayload } from "../../../lib/shop/types";
const base = "/shop/settings/gst";
type MonthAmounts = Record<"net" | "taxable" | "cgst" | "sgst" | "utgst" | "igst" | "tax" | "gross", string>;
/** One month's recorded GST totals, as `GET /pos-settings/gst-month/:month` returns them (owner and manager only). */
type GstMonthSummary = {
  month: string;
  invoices: { count: number; amounts: MonthAmounts };
  credits: { count: number; amounts: MonthAmounts };
  debits: { count: number; amounts: MonthAmounts };
  afterCredits: MonthAmounts;
  businessInvoices: number;
  discrepancies: number;
};
/** `YYYY-MM` of the current month in India. */
function istMonth(now = Date.now()) {
  return new Date(now + 19800000).toISOString().slice(0, 7);
}
function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7);
}
/** First day and last day (or today, for the current month), as the Reports page's `from` / `through`. */
function monthRange(month: string, now = Date.now()) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const today = new Date(now + 19800000).toISOString().slice(0, 10);
  return { from: month + "-01", through: last < today ? last : today };
}
function monthLabel(month: string, language?: string | null) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString(dateLocale(language), { month: "long", year: "numeric", timeZone: "UTC" });
}
/** Requests saved in this browser that are still waiting for their outcome. */
function usePendingRequests() {
  const { shop } = useShop();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shop) return;
    let active = true;
    void (async () => {
      try {
        const rows = await retainedRequests(financialScope(shop.id));
        if (active) setCount(rows.filter((row) => row.state === "pending").length);
      } catch {
        /* Storage unavailable: the Sync & recovery page explains it. */
      }
    })();
    return () => {
      active = false;
    };
  }, [shop]);
  return count;
}
function HubRow({ href, title, subtitle, count, warn }: { href: string; title: string; subtitle?: string; count?: number; warn?: boolean }) {
  return (
    <Link href={href} className="shop-list-row gst-hub-row">
      <span>
        <b className="shop-list-title">{title}</b>
        {subtitle ? <small className="shop-list-meta block">{subtitle}</small> : null}
      </span>
      {count !== undefined ? <span className={"gst-hub-count" + (warn ? " is-warn" : "")}>{count}</span> : null}
      <span aria-hidden="true">›</span>
    </Link>
  );
}
/** GST records: this month's totals and status first, then where to go, with numbers, devices and recovery under Advanced. Mirrors the mobile GST records screen. */
export function GstRecordsScreen() {
  const { api, shop, t, perms, prefs } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const allowed = perms.canSeeReports;
  const thisMonth = istMonth(),
    [month, setMonth] = useState(thisMonth);
  const health = useGstQuery(["health"], () => api.gst.health(shop!.id)),
    settings = useGstQuery(["settings"], () => api.getPosSettings(shop!.id)),
    totals = useGstQuery(["month", month], () => api.gst.get<GstMonthSummary>(`/api/shops/${shop!.id}/pos-settings/gst-month/${month}`), allowed),
    // Same key as the record checks page, so both read one cache.
    monitor = useGstQuery(["checks", 100], () => api.gst.monitor(shop!.id, 100), allowed, "always");
  const unsynced = usePendingRequests();
  const report = health.data;
  const liveProblems = report
    ? report.integrity.mismatches.length + report.evidence.missingInvoices + report.evidence.missingCreditNotes + report.evidence.unbalancedSales + (report.evidence.providerHistoryMismatches ?? 0)
    : 0;
  const monitorOpen = monitor.data?.issues.filter((i) => i.status === "open" && CORE_MONITOR_KINDS.has(i.kind)).length ?? 0;
  const summary = totals.data?.month === month ? totals.data : undefined;
  const range = monthRange(month);
  const prepareHref = `${base}/exports?kind=sales&from=${range.from}&through=${range.through}`;
  // A problem found live and the same one found by the last check are one problem, not two.
  const attention = [
    { key: "unsynced", title: t("gstweb.hub.unsynced", "Bills and requests saved in this browser, waiting to be confirmed"), count: unsynced, href: base + "/recovery" },
    { key: "records", title: t("recordsUI.hub.att.records", "Saved bills that need a review"), count: Math.max(liveProblems, monitorOpen), href: base + "/checks" },
    { key: "month", title: t("recordsUI.hub.att.month", "Bills this month whose totals don't add up"), count: summary?.discrepancies ?? 0, href: prepareHref },
    { key: "portal", title: t("recordsUI.hub.att.portal", "GST portal requests to confirm"), count: report?.providerJobs?.uncertain ?? 0, href: base + "/providers" },
  ].filter((item) => item.count > 0);
  const portalJobs = !!report?.providerJobs && Object.values(report.providerJobs).some((n) => n > 0);
  const amounts = summary?.afterCredits;
  const bills = summary ? summary.invoices.count + summary.debits.count : 0;
  const money = (v: string) => formatINR(Number(v));
  const registration = settings.data?.gstSettings?.registration;
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-overview">
        <PageHeader
          title={text("GST records")}
          back={{ href: "/shop/settings?section=shop", label: text("Settings") }}
        />
        <section className="gst-month-card" aria-labelledby="gst-month-title">
          <div className="gst-month-head">
            <h2 id="gst-month-title">
              {month === thisMonth ? t("recordsUI.hub.monthSoFar", "{{month}} so far", { month: monthLabel(month, prefs?.appLanguage) }) : monthLabel(month, prefs?.appLanguage)}
            </h2>
            <button type="button" className="gst-month-arrow" aria-label={t("recordsUI.hub.prevMonth", "Previous month")} onClick={() => setMonth((m) => shiftMonth(m, -1))}>‹</button>
            <button type="button" className="gst-month-arrow" aria-label={t("recordsUI.hub.nextMonth", "Next month")} disabled={month >= thisMonth} onClick={() => setMonth((m) => shiftMonth(m, 1))}>›</button>
          </div>
          {!summary && totals.isPending ? (
            <Spinner label={text("Loading")} />
          ) : !summary && totals.error ? (
            <div className="gst-month-failed">
              <p>{t("recordsUI.hub.totalsFailed", "Couldn't load this month's totals.")}</p>
              <Button tone="ghost" disabled={totals.isFetching} onClick={() => void totals.refetch()}>{text("Retry")}</Button>
            </div>
          ) : summary && !bills && !summary.credits.count ? (
            <p className="gst-month-empty">{t("recordsUI.hub.noBills", "No GST bills this month yet.")}</p>
          ) : summary && amounts ? (
            <>
              <dl className="gst-month-figures">
                <div><dt>{t("recordsUI.hub.sales", "Sales before GST")}</dt><dd>{money(amounts.taxable)}</dd></div>
                <div className="is-strong"><dt>{t("recordsUI.hub.gstCollected", "GST collected")}</dt><dd>{money(amounts.tax)}</dd></div>
              </dl>
              <p className="shop-hint">
                {Number(amounts.igst) || Number(amounts.utgst)
                  ? t("recordsUI.hub.splitInter", "CGST {{cgst}} · SGST {{sgst}} · IGST {{igst}}", { cgst: money(amounts.cgst), sgst: money(Number(amounts.utgst) ? amounts.utgst : amounts.sgst), igst: money(amounts.igst) })
                  : t("recordsUI.hub.split", "CGST {{cgst}} · SGST {{sgst}}", { cgst: money(amounts.cgst), sgst: money(amounts.sgst) })}
              </p>
              <p className="shop-hint">
                {[
                  bills === 1 ? t("recordsUI.hub.bills_one", "1 bill") : t("recordsUI.hub.bills_many", "{{count}} bills", { count: bills }),
                  ...(summary.businessInvoices ? [t("recordsUI.hub.business", "{{count}} to businesses", { count: summary.businessInvoices })] : []),
                  ...(summary.credits.count ? [summary.credits.count === 1 ? t("recordsUI.hub.credits_one", "1 credit note") : t("recordsUI.hub.credits_many", "{{count}} credit notes", { count: summary.credits.count })] : []),
                ].join(" · ")}
              </p>
            </>
          ) : null}
          <Link href={base + "/checks"} className={"gst-month-status" + (report && !attention.length ? " is-ok" : report ? " is-warn" : "")}>
            <span aria-hidden="true">{report ? (attention.length ? "!" : "✓") : ""}</span>
            <span>
              <b>
                {report
                  ? attention.length
                    ? attention.length === 1 ? t("recordsUI.hub.attention_one", "1 thing needs your attention") : t("recordsUI.hub.attention_many", "{{count}} things need your attention", { count: attention.length })
                    : t("recordsUI.hub.allGood", "All records check out")
                  : health.isFetching ? text("Loading") : t("gst.health_unavailable_title", "GST health is unavailable")}
              </b>
              {report ? <small>{t("recordsUI.hub.checked", "Checked {{time}}", { time: date(report.generatedAt) })}</small> : null}
            </span>
          </Link>
          {health.error && !report ? <Button tone="ghost" disabled={health.isFetching} onClick={() => void health.refetch()}>{text("Retry")}</Button> : null}
          <Button href={prepareHref}>{t("recordsUI.hub.prepare", "Prepare report for your accountant")}</Button>
          <p className="shop-hint">{t("recordsUI.hub.notFiled", "These are your recorded totals, not a filed GST return.")}</p>
        </section>
        {attention.length ? (
          <section aria-labelledby="gst-attention-title">
            <h2 id="gst-attention-title" className="gst-hub-heading">{t("recordsUI.hub.needsAttention", "Needs attention")}</h2>
            <div className="gst-navigation gst-attention">
              {attention.map((item) => <HubRow key={item.key} href={item.href} title={item.title} count={item.count} warn />)}
            </div>
          </section>
        ) : null}
        {report && liveProblems > 0 ? <Section open title={t('recordsUI.checkDetails','Check details')}><dl className="gst-record-metrics">{[['gst.health_missing_invoice',report.evidence.missingInvoices],['gst.health_missing_credit',report.evidence.missingCreditNotes],['gst.health_unbalanced',report.evidence.unbalancedSales],['gst.health_provider_history',report.evidence.providerHistoryMismatches??0]].map(([key,value])=><div key={key}><dt>{t(String(key),String(key))}</dt><dd>{value}</dd></div>)}</dl>{report.integrity.mismatches.map(d=><Button key={d.id} tone="ghost" href={d.saleId?'/shop/sales/'+d.saleId+'?documentId='+d.id:'/shop/sales'}>{d.number} →</Button>)}</Section> : null}
        <div className="gst-navigation">
          <HubRow href="/shop/sales" title={t("recordsUI.hub.bills", "Bills & credit notes")} subtitle={t("recordsUI.hub.billsSub", "Every GST bill and credit note, with its original copy")} count={summary ? bills + summary.credits.count : undefined} />
          <HubRow href={base + "/exports"} title={t("recordsUI.hub.reports", "Reports")} subtitle={t("recordsUI.hub.reportsSub", "Prepare registers for filing and download saved ones")} />
          <HubRow href={`${base}/periods?month=${month}`} title={t("recordsUI.hub.close", "Month close")} subtitle={t("recordsUI.hub.closeSub", "Lock a month after you send it for filing")} />
          <HubRow href="/shop/settings/payments?tab=gst" title={text("GST setup")} subtitle={registration && registration !== "unknown" ? t(`gst.registration.${registration}`, registration) + (settings.data?.gstSettings?.gstin ? " · " + settings.data.gstSettings.gstin : "") : t("gstweb.hub.setup_missing", "Not set up yet")} />
          <HubRow href="/shop/products/gst?filter=missing" title={t("gst.bulk_title", "Review product GST in bulk")} subtitle={t("gstweb.hub.products_sub", "Give each product its HSN code and GST rate")} />
        </div>
        <Section title={t("recordsUI.hub.advanced", "Advanced")} summary={t("gstweb.hub.advanced_sub", "For your accountant or support")}>
          <div className="gst-navigation">
            <HubRow href={base + "/numbers"} title={t("recordsUI.hub.numbers", "Invoice numbers")} subtitle={t("gstweb.hub.numbers_sub", "Number blocks reserved by each browser or phone")} />
            <HubRow href={base + "/devices"} title={t("recordsUI.devices", "Billing devices")} subtitle={t("gstweb.hub.devices_sub", "Browsers and phones that can issue GST bills")} />
            <HubRow href={base + "/recovery"} title={t("recordsUI.hub.sync", "Sync & recovery")} subtitle={t("gstweb.hub.sync_sub", "Bills and requests saved in this browser")} count={unsynced || undefined} warn={unsynced > 0} />
            {portalJobs ? <HubRow href={base + "/providers"} title={text("GST provider status")} count={report!.providerJobs!.uncertain || undefined} warn={!!report!.providerJobs!.uncertain} /> : null}
            {settings.data?.gstPayableRoundingReviewsAvailable ? <HubRow href={base + "/rounding"} title={text("Payable rounding review")} subtitle={text("Review rounding policy and retained evidence.")} /> : null}
            <HubRow href={base + "/turnover"} title={text("Business turnover review")} />
            <HubRow href={base + "/checks"} title={t("recordsUI.hub.fullCheck", "Run a full record check")} subtitle={t("recordsUI.hub.fullCheckSub", "Check every saved bill and product tax setting")} />
          </div>
        </Section>
        <Button
          tone="ghost"
          disabled={health.isFetching || totals.isFetching}
          onClick={() => {
            void health.refetch();
            void totals.refetch();
            void monitor.refetch();
          }}
        >
          {text("Refresh report")}
        </Button>
      </div>
    </GstAccess>
  );
}
const messages: Record<string, [string, string, string]> = {
  integrityMismatch: [
    "Saved bill needs review",
    "The saved contents could not be verified. Keep the original bill and ask support to investigate.",
    "recovery",
  ],
  legacyHashes: [
    "Older bills need a manual check",
    "These older bills are preserved but cannot be verified automatically.",
    "recovery",
  ],
  missingProfiles: [
    "Products need confirmed tax details",
    "Review product tax settings before GST billing.",
    "/shop/products/gst",
  ],
  numberConflict: [
    "Invoice number needs review",
    "Compare saved requests with recorded bills before retrying.",
    "numbers",
  ],
  missingInvoices: [
    "Some sales are missing saved bills",
    "Keep the original records and review the affected sale.",
    "recovery",
  ],
  missingCreditNotes: [
    "A return is missing its credit note",
    "Review the original bill and recorded return.",
    "recovery",
  ],
  unbalancedSales: [
    "Some sale totals do not reconcile",
    "Keep the original bill and payment records for review.",
    "recovery",
  ],
};
export function GstChecksScreen() {
  const { api, shop, userId, offline, t } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    router = useRouter();
  const [unconfirmedScan, setUnconfirmedScan] = useState<string|null>(null);
  const scanScope = `${userId}:${shop?.id}`;
  const pendingRun = useRef<{ scope: string; receipt: unknown } | null>(null);
  const [issueLimit, setIssueLimit] = useState(100);
  const [supportNotice, setSupportNotice] = useState("");
  const q = useGstQuery(
      ["checks", issueLimit],
      () => api.gst.monitor(shop!.id, issueLimit),
      true,
      "always",
    ),
    action = useGstAction();
  const refreshSaved = async () => {
    const scope = financialScope(shop!.id);
    const refreshed = await q.refetch();
    assertScope(scope);
    if (!refreshed.error && pendingRun.current?.scope === scanScope && gstMonitorReceiptConfirmed(pendingRun.current.receipt, refreshed.data)) {
      setUnconfirmedScan(null);
      pendingRun.current = null;
    }
    return refreshed;
  };
  const report = q.data,
    issues =
      report?.issues.filter(
        (i) => i.status === "open" && CORE_MONITOR_KINDS.has(i.kind),
      ) ?? [];
  const last =
    report?.lastSuccessfulRun ??
    report?.runs.find((run) => run.status === "completed");
  const partial = report?.issueTruncated ?? report?.truncated;
  const failed = report?.runs[0]?.status === "failed";
  const view = gstMonitorView({
    hasData: !!report,
    pending: q.isPending,
    fetchStatus: offline ? "paused" : q.fetchStatus,
    error: !!q.error || !!failed,
    completed: !!last,
    enabled: report?.enabled,
    unconfirmed: unconfirmedScan === scanScope,
    truncated: !!partial,
    issueCount: issues.length,
  });
  const status = {
    loading: "Loading saved checks…",
    offline: "Waiting for a connection",
    unavailable: "Checks unavailable",
    stale: "Saved results may be out of date",
    never_checked: "No completed check yet",
    attention: "Some records need attention",
    partial: "More results need review",
    checked: "Last completed check",
  }[view];
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-check-workspace">
        <PageHeader
          title={text("GST record checks")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Checks saved bill integrity and incomplete product tax setup. Reports are for filing elsewhere.",
          )}
        />
        <Notice error={q.error} />
        <Card className="gst-check-summary">
          <h2 className="shop-section-title">{text(status)}</h2>
          <p className="shop-hint">
            {last
              ? `${date(last.createdAt)} · ${t("gst.monitor_checked_count", "Checked {{count}} saved documents.", { count: last.scannedDocuments })}`
              : text("Run a check to assess the saved records.")}
          </p>
          {failed ? (
            <p role="status">
              {text(
                "The latest check failed. Results below are from earlier checks.",
              )}
            </p>
          ) : null}
          <p className="shop-hint">
            {text(
              "Results reflect the time of the check, not legal or filing approval.",
            )}
          </p>
          {report?.enabled === false ? (
            <p>{text("Checks are unavailable on this server.")}</p>
          ) : null}
          {partial ? (
            <p role="status">
              {text(
                "Results are partial. An empty list does not mean all records passed.",
              )}
            </p>
          ) : null}
        </Card>
        {action.notice}
        <div className="shop-actions">
          <Button
            disabled={
              action.busy ||
              q.isFetching ||
              !q.isSuccess ||
              offline ||
              report?.enabled === false
            }
            onClick={() =>
              void action.run(async () => {
                const scope = financialScope(shop!.id);
                setUnconfirmedScan(scanScope);
                pendingRun.current = null;
                try {
                  const result = await api.gst.runChecks(scope.shopId);
                  assertScope(scope);
                  pendingRun.current = { scope: scanScope, receipt: result };
                  if (result.skipped) throw Error(text("A check is already running or unavailable. Refresh saved results shortly."));
                  const refreshed = await refreshSaved();
                  assertScope(scope);
                  if (refreshed.error) throw refreshed.error;
                  if (!gstMonitorReceiptConfirmed(result, refreshed.data)) throw Error(text("Refresh to confirm the current result."));
                } catch (error) {
                  assertScope(scope);
                  setUnconfirmedScan(scanScope);
                  await refreshSaved();
                  throw error;
                }
              })
            }
          >
            {text(action.busy ? "Checking records" : "Check records")}
          </Button>
          <Button
            tone="ghost"
            disabled={q.isFetching || action.busy}
            onClick={() => void refreshSaved().catch(() => {})}
          >
            {text("Refresh saved results")}
          </Button>
        </div>
        {report && !issues.length ? (
          <Card>
            <h2 className="shop-section-title">{text("Current results")}</h2>
            <p>
              {text(
                view === "checked"
                  ? "No billing issues were found in the last completed check."
                  : view === "partial"
                    ? "Load the remaining results before drawing a conclusion."
                    : view === "stale"
                      ? "Refresh to confirm the current result."
                      : "A completed current result has not been confirmed.",
              )}
            </p>
          </Card>
        ) : null}
        <div className="gst-issue-grid">{issues.map((issue) => {
          const message = issue.kind === "closedPeriodChanged" ? [t("gst.monitor.kind.closedPeriodChanged", "Closed reporting period has new records"),t("gst.period_changed", "Records changed after closing. Reopen and review updated reports."),"periods"] : messages[issue.kind] ?? [
            "Saved records need review",
            "Keep the original records and ask support to investigate.",
            "recovery",
          ];
          return (
            <Card key={issue.id} className="gst-issue-record">
              <Pill tone={issue.severity === "critical" ? "danger" : "warn"}>
                {text("Needs review")}
              </Pill>
              <h2 className="shop-section-title">
                {issue.document
                  ? `${text("Bill")} ${issue.document.number}`
                  : text(message[0])}
              </h2>
              <p>{text(message[1])}</p>
              {issue.details.count != null ? (
                <p>
                  {text("Affected records")}: {issue.details.count}
                </p>
              ) : null}
              <p className="shop-hint">
                {text("Last observed")} {date(issue.lastSeenAt)}
              </p>
              <Button
                tone="quiet"
                onClick={() =>
                  void action.run(async () => {
                    const scope = financialScope(shop!.id);
                    if (issue.kind === "closedPeriodChanged") {
                      const month=issue.details.month;
                      if(typeof month!=="string"||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error("invalid_report_period");
                      router.push(base+"/periods?month="+encodeURIComponent(month));
                      return;
                    }
                    if (issue.document) {
                      router.push("/shop/sales/" + issue.document.saleId);
                      return;
                    }
                    if (issue.details.documentId) {
                      const target = await api.gst.get<{ saleId: string }>(
                        `/api/shops/${shop!.id}/gst-exports/documents/${issue.details.documentId}`,
                      );
                      assertScope(scope);
                      router.push("/shop/sales/" + target.saleId);
                      return;
                    }
                    router.push(
                      message[2].startsWith("/")
                        ? message[2]
                        : base + "/" + message[2],
                    );
                  })
                }
              >
                {text(
                  issue.document || issue.details.documentId
                    ? "Review affected bill"
                    : "Review records",
                )}
              </Button>
            </Card>
          );
        })}
        </div>{report?.issueTruncated && issueLimit < 10000 ? (
          <Button
            tone="ghost"
            disabled={q.isFetching || action.busy || offline}
            onClick={() =>
              setIssueLimit((limit) => Math.min(10000, limit + 100))
            }
          >
            {text("Load more observations")}
          </Button>
        ) : null}
        <Section title={text("Previous results")}>
          {report?.runs.map((run) => (
            <div className="gst-row" key={run.id}>
              <span>{date(run.createdAt)}</span>
              <Pill tone={run.status === "completed" ? "ok" : "warn"}>
                {text(run.status === "completed" ? "Completed" : "Failed")}
              </Pill>
              <span>
                {run.scannedDocuments} {text("documents")}
              </span>
            </div>
          ))}
          {report?.historyTruncated ? (
            <p className="shop-hint">
              {text(
                "More results may be available. This page does not show every observation yet.",
              )}
            </p>
          ) : null}
          {report ? (
            <Button
              tone="ghost"
              onClick={async () => {
                const scope = financialScope(shop!.id);
                try {
                  assertScope(scope);
                  await navigator.clipboard.writeText(
                    JSON.stringify({ shopId: scope.shopId, report }, null, 2),
                  );
                  assertScope(scope);
                  setSupportNotice(
                    text(
                      "Support details copied. Share them only with your support contact.",
                    ),
                  );
                } catch {
                  try {
                    assertScope(scope);
                    setSupportNotice(
                      text("Could not copy support details. Try again."),
                    );
                  } catch {
                    /* Account changed; leave the current view untouched. */
                  }
                }
              }}
            >
              {text("Copy details for support")}
            </Button>
          ) : null}
          {supportNotice ? (
            <p role="status" className="shop-hint">
              {supportNotice}
            </p>
          ) : null}
        </Section>
      </div>
    </GstAccess>
  );
}
export function GstNumbersScreen() {
  const { api, shop, t } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const q = useGstPages(["numbers"], (cursor) =>
    api.gst.numbers(shop!.id, cursor),
  );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-number-workspace">
        <PageHeader
          title={t("recordsUI.hub.numbers", "Invoice numbers")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Unconfirmed numbers may include bills issued offline. Do not reuse or reclaim them.",
          )}
        />
        <div className="shop-actions"><Button tone="ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}>{text('Refresh report')}</Button></div>
        <ReadState query={q} empty={!rows.length} emptyText={t("gstweb.empty.numbers", "No invoice numbers yet. They are reserved when the first GST bill is made.")}>
          {rows.map((block) => (
            <Section
              key={block.id}
              title={`${block.firstNumber} — ${block.lastNumber}`}
              summary={`${text("Synchronized")}: ${block.synchronized.length} · ${text("Unconfirmed")}: ${block.unconfirmedIndices.length}`}
            >
              <p>
                {text(block.expired ? "Expired" : "Expires")}{" "}
                {date(block.expiresAt)}
              </p>
              {block.inconsistentEvidence > 0 ? (
                <Notice
                  error={Error(
                    text("Some number evidence needs reconciliation."),
                  )}
                />
              ) : null}
              <Section title={text('Support reference')}><p className="gst-reference">{text('Issuing user')}: {block.userId}</p><p className="gst-reference">{text('Installation identity')}: {block.deviceEpoch || '—'}</p></Section>
              <div className="gst-table-wrap">
                <table className="gst-table gst-mobile-records">
                  <thead>
                    <tr>
                      <th>{text("Number")}</th>
                      <th>{text("Issued")}</th>
                      <th>{text("Bill")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.synchronized.map((row) => (
                      <tr key={row.index}>
                        <td data-label={text("Number")}>{row.number}</td>
                        <td data-label={text("Issued")}>{date(row.issuedAt)}</td>
                        <td data-label={text("Bill")}>
                          <Link href={row.saleId?"/shop/sales/" + row.saleId+"?documentId="+row.documentId:"/shop/sales"}>
                            {text("Open bill")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="shop-hint">
                {text("Unconfirmed positions")}:{" "}
                {gstPositionRanges(block.unconfirmedIndices) || "—"}
              </p>
            </Section>
          ))}
        </ReadState>
        <More query={q} />
      </div>
    </GstAccess>
  );
}
export function GstDevicesScreen({
  embedded = false,
}: { embedded?: boolean } = {}) {
  const { api, shop, role, userId, t, offline } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const q = useGstPages(["devices"], (cursor) =>
    api.gst.devices(shop!.id, cursor),
  );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [],
    action = useGstAction(t("gstweb.device_revoked", "Device revoked. It can no longer make GST bills."));
  const [reason,setReason]=useState(''),[selected,setSelected]=useState<string|null>(null),[epoch,setEpoch]=useState<string|null>(null);
  useEffect(()=>{let active=true;void readState<string>('epoch:'+userId).then(value=>{if(active)setEpoch(value??null)}).catch(()=>{});return()=>{active=false}},[userId]);
  return (
    <GstAccess>
      <div className={embedded ? "grid gap-4" : "shop-page gst-workspace gst-device-workspace"}>
        {!embedded ? (
          <PageHeader
            title={t("recordsUI.devices", "Billing devices")}
            back={{ href: base, label: text("GST records") }}
            description={text(
              "An installation identifies a browser’s billing storage. Last seen does not confirm that every bill has synchronized.",
            )}
          />
        ) : null}
        {action.notice}<Button tone="ghost" disabled={q.isFetching||action.busy} onClick={()=>void q.refetch()}>{text('Refresh report')}</Button>
        <ReadState query={q} empty={!rows.length} emptyText={t("gstweb.empty.devices", "No billing devices yet. A browser or phone appears here after it makes its first GST bill.")}>
          {rows.map((row) => (
            <Section
              key={row.id}
              title={row.userId===userId&&row.deviceEpoch===epoch?t("gst.ui.this_device_fa5a6d","This device"):row.actorName ?? text("Shop member")}
              summary={text(row.revocation ? "Revoked" : "Active")}
            >
              <Section title={text('Support reference')}><p className="gst-reference">{text('Issuing user')}: {row.userId}</p><p className="gst-reference">{text('Installation identity')}: {row.deviceEpoch}</p></Section>
              <p>
                {text("Enrolled")} {date(row.enrolledAt)}
              </p>
              <p>
                {text("Last seen")} {date(row.lastSeenAt)}
              </p>
              {row.revocation ? (
                <p>{row.revocation.reason}</p>
              ) : role === "OWNER" ? (
                <Button tone="danger" disabled={action.busy||offline} onClick={()=>{setReason('');setSelected(row.id)}}>{text('Revoke installation')}</Button>
              ) : null}
            </Section>
          ))}
        </ReadState>
        <More query={q} />
        {selected&&rows.some(r=>r.id===selected&&!r.revocation)?<VoiceSheet title={text('Revoke installation')} closeLabel={text('Cancel')} onClose={()=>{if(!action.busy)setSelected(null)}}><p>{rows.find(r=>r.id===selected)?.actorName??text('Shop member')}</p><p className="shop-hint">{text('Revocation prevents new billing from this installation. Previously issued bills remain preserved.')}</p><p className="gst-revoke-warning" role="note">{t('gstweb.revoke_permanent', "This can’t be undone. To bill again from this browser or phone, the person will have to sign in again and it will be set up as a new device.")}</p><TextField label={text('Reason for revocation')} value={reason} onChange={setReason} disabled={action.busy}/><div className="shop-actions"><Button tone="ghost" disabled={action.busy} onClick={()=>setSelected(null)}>{text('Cancel')}</Button><Button tone="danger" disabled={action.busy||offline||!reason.trim()} onClick={()=>void action.run(async()=>{await api.gst.revoke(shop!.id,selected,reason.trim());setSelected(null);setReason('')})}>{t('gst.device_revoke_confirm','Confirm revocation')}</Button></div></VoiceSheet>:null}
      </div>
    </GstAccess>
  );
}
export function GstRecoveryScreen() {
  const { api, shop, userId, offline, perms, t } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const [closureReasons,setClosureReasons]=useState<Record<string,string>>({}),[section,setSection]=useState("bills"),
    settings = useGstQuery(["settings"], () => api.getPosSettings(shop!.id)),
    q = useGstQuery(
      ["recovery"],
      async () => {
        const scope = financialScope(shop!.id);
        await recoverReservedSales(scope, true);
        const rows = await retainedRequests(scope);
        assertScope(scope);
        return rows;
      },
      true,
      "always",
    );
  const rows=(q.data??[]).filter(row=>row.path.endsWith('/sales')?section==='bills'||!perms.canSeeCost:perms.canSeeCost&&section==='requests');
  async function retry(row: RetainedRequest) {
    await recoverFinancialRequest(api, shop!.id, row);
  }
  return (
    <div className="shop-page gst-workspace gst-recovery-workspace">
      <PageHeader
        title={t("recordsUI.hub.sync", "Sync & recovery")}
        back={{ href: base, label: text("GST records") }}
        description={text(
          "These records belong to this account and shop in this browser. Keep unresolved requests until their recorded outcome is confirmed.",
        )}
      />
      {action.notice}
      {perms.canSeeCost?<TabList className="gst-workspace-tabs" label={t("recordsUI.hub.sync", "Sync & recovery")} value={section} onChange={setSection} items={[['bills',t('sales.summary.bills','Bills')],['requests',t('recordsUI.requests','Requests')]]}/>:null}
      <ReadState query={q} empty={!rows.length} emptyText={t("gstweb.empty.recovery", "Nothing waiting. Every bill and request saved in this browser has been confirmed.")}>
        {rows.map((row) => (
          <Section
            key={row.id}
            title={text(
              row.path.endsWith("/sales")
                ? "Saved bill"
                : "Saved financial request",
            )}
            summary={`${text(row.state === "confirmed" ? "Confirmed" : row.state === "closed" ? "Closed without recording" : "Needs recovery")} · ${date(row.createdAt)}`}
          >
            <Notice error={row.error ? Error(row.error) : null} />
            <p className="gst-reference">
              {text("Original request")} {row.id}
            </p>
            {hasLocalIssuedReceipt(row) ? (
              <Button href={`/shop/settings/gst/recovery/${row.id}`}>
                {text("Review saved bill")}
              </Button>
            ) : null}
            {row.state === "pending" ? (
              <Button
                disabled={action.busy || offline}
                onClick={() =>
                  void action.run(async () => {
                    await retry(row);
                    await q.refetch();
                  })
                }
              >
                {text("Recover original request")}
              </Button>
            ) : null}
            {row.state === "pending" &&
            row.path.includes("/purchases") &&
            settings.data?.gstPurchaseRequestClosureAvailable ? (
              <Section title={text("Close an unrecorded request")}>
                <p>
                  {text(
                    "The server checks that this request was not recorded before closing it. The original evidence is kept.",
                  )}
                </p>
                <TextField
                  label={text("Reason")}
                  value={closureReasons[row.id]??""}
                  onChange={value=>setClosureReasons(old=>({...old,[row.id]:value}))}
                />
                <Button
                  tone="danger"
                  disabled={action.busy || offline || !(closureReasons[row.id]??"").trim()}
                  onClick={() =>
                    void action.run(async () => {
                      await closeUnrecordedPurchase(
                        api,
                        shop!.id,
                        row,
                        closureReasons[row.id]??"",
                      );
                      setClosureReasons(old=>({...old,[row.id]:""}));
                      await q.refetch();
                    })
                  }
                >
                  {text("Confirm closure")}
                </Button>
              </Section>
            ) : null}
            <Button
              tone="ghost"
              onClick={() =>
                saveFile(
                  JSON.stringify(row, null, 2),
                  `samaan-recovery-${row.id}.json`,
                  "application/json",
                )
              }
            >
              {text("Export recovery evidence")}
            </Button>
          </Section>
        ))}
      </ReadState>
      <Button tone="ghost" onClick={() => void q.refetch()}>
        {text("Refresh saved results")}
      </Button>
    </div>
  );
}
