"use client";
import {
  gstMonitorView,
  gstMonitorReceiptConfirmed,
  CORE_MONITOR_KINDS,
} from "../../../lib/shop/gst-monitor-view";
import { hasLocalIssuedReceipt } from "../../../lib/shop/local-issued-receipt";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, PageHeader, Notice, Pill } from "../ui";
import {
  Section,
  Stats,
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
export function GstRecordsScreen() {
  const { api, shop } = useShop(),
    text = useGstText();
  const health = useGstQuery(["health"], () => api.gst.health(shop!.id)),
    settings = useGstQuery(["settings"], () => api.getPosSettings(shop!.id));
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("GST records & invoice numbers")}
          back={{
            href: "/shop/settings",
            label: text("Settings"),
          }}
          description={text(
            "Review saved bills, invoice numbers and records that need attention.",
          )}
        />
        <ReadState query={health}>
          {health.data ? (
            <Stats
              items={[
                {
                  label: text("Verified documents"),
                  value: health.data.integrity.verified,
                },
                {
                  label: text("Records needing review"),
                  value:
                    health.data.integrity.mismatches.length +
                    health.data.evidence.missingInvoices +
                    health.data.evidence.missingCreditNotes +
                    health.data.evidence.unbalancedSales,
                },
                {
                  label: text("Coverage"),
                  value: text(
                    health.data.integrity.truncated
                      ? "Partial results"
                      : "Saved records checked",
                  ),
                },
              ]}
            />
          ) : null}
        </ReadState>
        <div className="gst-navigation">
          {[
            [
              "/shop/sales",
              "View bills & credit notes",
              "Open retained sales and their adjustments.",
            ],
            [
              base + "/recovery",
              "Device bill recovery",
              "Recover requests retained in this browser.",
            ],
            [
              base + "/numbers",
              "Invoice number register",
              "Review synchronized and unconfirmed invoice numbers.",
            ],
            [
              base + "/checks",
              "GST record checks",
              "Find saved records that need attention.",
            ],
            ...(settings.data?.gstPayableRoundingReviewsAvailable
              ? [
                  [
                    base + "/rounding",
                    "Payable rounding review",
                    "Review rounding policy and retained evidence.",
                  ],
                ]
              : []),
            [
              base + "/exports",
              "GST export history",
              "Prepare registers and reopen saved files.",
            ],
          ].map(([href, title, description]) => (
            <Link key={href} href={href} className="shop-list-row">
              <span>
                <b className="shop-list-title">{text(title)}</b>
                <small className="shop-list-meta block">
                  {text(description)}
                </small>
              </span>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
        <Section title={text("Billing installations")}>
          <GstDevicesScreen embedded />
        </Section>
        <Section title={text("GST provider status")}>
          <Button href={base + "/providers"} tone="ghost">
            {text("GST provider status")}
          </Button>
        </Section>
        <Button
          tone="ghost"
          onClick={() => {
            void health.refetch();
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
      <div className="shop-page">
        <PageHeader
          title={text("GST record checks")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Checks saved bill integrity and incomplete product tax setup. Reports are for filing elsewhere.",
          )}
        />
        <Notice error={q.error} />
        <Card>
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
        {issues.map((issue) => {
          const message = issue.kind === "closedPeriodChanged" ? [t("gst.monitor.kind.closedPeriodChanged", "Closed reporting period has new records"),t("gst.period_changed", "Records changed after closing. Reopen and review updated reports."),"periods"] : messages[issue.kind] ?? [
            "Saved records need review",
            "Keep the original records and ask support to investigate.",
            "recovery",
          ];
          return (
            <Card key={issue.id}>
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
        {report?.issueTruncated && issueLimit < 10000 ? (
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
  const { api, shop } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const q = useGstPages(["numbers"], (cursor) =>
    api.gst.numbers(shop!.id, cursor),
  );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Invoice number register")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Unconfirmed numbers may include bills issued offline. Do not reuse or reclaim them.",
          )}
        />
        <ReadState query={q} empty={!rows.length}>
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
              <div className="gst-table-wrap">
                <table className="gst-table">
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
                        <td>{row.number}</td>
                        <td>{date(row.issuedAt)}</td>
                        <td>
                          <Link href={"/shop/sales/" + row.saleId}>
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
                {block.unconfirmedIndices.join(", ") || "—"}
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
  const { api, shop, role } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const q = useGstPages(["devices"], (cursor) =>
    api.gst.devices(shop!.id, cursor),
  );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [],
    action = useGstAction();
  const [reason, setReason] = useState("");
  return (
    <GstAccess>
      <div className={embedded ? "grid gap-4" : "shop-page"}>
        {!embedded ? (
          <PageHeader
            title={text("Billing installations")}
            back={{ href: base, label: text("GST records") }}
            description={text(
              "An installation identifies a browser’s billing storage. Last seen does not confirm that every bill has synchronized.",
            )}
          />
        ) : null}
        {action.notice}
        <ReadState query={q} empty={!rows.length}>
          {rows.map((row) => (
            <Section
              key={row.id}
              title={row.actorName ?? text("Shop member")}
              summary={text(row.revocation ? "Revoked" : "Active")}
            >
              <p>
                {text("Enrolled")} {date(row.enrolledAt)}
              </p>
              <p>
                {text("Last seen")} {date(row.lastSeenAt)}
              </p>
              {row.revocation ? (
                <p>{row.revocation.reason}</p>
              ) : role === "OWNER" ? (
                <>
                  <TextField
                    label={text("Reason for revocation")}
                    value={reason}
                    onChange={setReason}
                  />
                  <p className="shop-hint">
                    {text(
                      "Revocation prevents new billing from this installation. Previously issued bills remain preserved.",
                    )}
                  </p>
                  <Button
                    tone="danger"
                    disabled={action.busy || !reason.trim()}
                    onClick={() =>
                      void action.run(() =>
                        api.gst.revoke(shop!.id, row.id, reason),
                      )
                    }
                  >
                    {text("Revoke installation")}
                  </Button>
                </>
              ) : null}
            </Section>
          ))}
        </ReadState>
        <More query={q} />
      </div>
    </GstAccess>
  );
}
export function GstRecoveryScreen() {
  const { api, shop, userId, offline } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const [closureReason, setClosureReason] = useState(""),
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
  async function retry(row: RetainedRequest) {
    await recoverFinancialRequest(api, shop!.id, row);
  }
  return (
    <div className="shop-page">
      <PageHeader
        title={text("Device bill recovery")}
        back={{ href: base, label: text("GST records") }}
        description={text(
          "These records belong to this account and shop in this browser. Keep unresolved requests until their recorded outcome is confirmed.",
        )}
      />
      {action.notice}
      <ReadState query={q} empty={!q.data?.length}>
        {q.data?.map((row) => (
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
            <p className="shop-hint">
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
                  value={closureReason}
                  onChange={setClosureReason}
                />
                <Button
                  tone="danger"
                  disabled={action.busy || !closureReason.trim()}
                  onClick={() =>
                    void action.run(async () => {
                      await closeUnrecordedPurchase(
                        api,
                        shop!.id,
                        row,
                        closureReason,
                      );
                      setClosureReason("");
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
