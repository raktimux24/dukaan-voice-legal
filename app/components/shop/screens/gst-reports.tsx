"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, PageHeader, Pill, Notice } from "../ui";
import {
  Section,
  TextField,
  SelectField,
  Check,
  useGstText,
  useFiscalDate,
} from "../gst-ui";
import {
  useGstPages,
  useGstQuery,
  useGstAction,
  usePeriod,
  ReadState,
  More,
  GstAccess,
} from "../gst-workspace";
import {
  saveFile,
  sha256,
  financialScope,
  assertScope,
  retainRequest,
  requestStatus,
} from "../../../lib/shop/gst-storage";
import {
  reportReviewDefaults,
  pendingReportReviews,
  checkRecordedPeriod,
} from "../../../lib/shop/report-review";
import { recoverFinancialRequest } from "../../../lib/shop/gst-recovery";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import {
  gstExportReview,
  gstExportReviewItems,
} from "../../../lib/shop/gst-core/gst-export-review";
import type {
  GstPreparationSummary,
  GstReport,
} from "../../../lib/shop/gst-types";
const base = "/shop/settings/gst";
export function GstExportsScreen() {
  const selection = useSearchParams();
  const { api, shop } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    period = usePeriod(
      selection.get("from") && selection.get("through")
        ? { from: selection.get("from")!, through: selection.get("through")! }
        : undefined,
    );
  const params = useSearchParams();
  const [kind, setKind] = useState(
      params.get("kind") === "purchases" ? "purchases" : "sales",
    ),
    [saved, setSaved] = useState<GstReport | null>(null),
    [preparing, setPreparing] = useState(false);
  const pending = useRef<{
    requestId: string;
    credit: boolean;
    exclusiveThrough: string;
  } | null>(null);
  const action = useGstAction(),
    q = useGstPages(["exports", kind], (cursor) =>
      api.gst.history(shop!.id, kind, cursor),
    );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  async function runPreparation(credit = false) {
    await action.run(async () => {
      setPreparing(true);
      try {
        await prepare(credit);
      } finally {
        setPreparing(false);
      }
    });
  }
  async function download(row: GstReport) {
    const content = await api.gst.downloadReport(
      shop!.id,
      row.id,
      row.contentHash,
    );
    saveFile(content, `samaan-${row.kind}-${row.id}.csv`);
  }
  async function prepare(credit = false) {
    const active = financialScope(shop!.id);
    if ((kind !== "numbering" || credit) && !period.range) throw period.error;
    let report: GstReport;
    if (kind === "numbering" || credit) {
      const original = pending.current ?? {
        requestId: crypto.randomUUID(),
        credit,
        exclusiveThrough: period.range?.to ?? "",
      };
      pending.current = original;
      const requestId = original.requestId;
      credit = original.credit;
      const path = `/api/shops/${shop!.id}/gst-exports/${credit ? "mixed-credits" : "numbering"}`,
        payload = credit
          ? { requestId, exclusiveThrough: original.exclusiveThrough }
          : { requestId };
      await retainRequest({
        ...active,
        id: requestId,
        path,
        payload,
        createdAt: new Date().toISOString(),
        state: "pending",
      });
      report = credit
        ? await api.gst.creditReport(
            shop!.id,
            original.exclusiveThrough,
            requestId,
          )
        : await api.gst.numberReport(shop!.id, requestId);
      assertScope(active);
      await api.gst.downloadReport(shop!.id, report.id, report.contentHash);
      await requestStatus(requestId, { state: "confirmed", result: report });
      pending.current = null;
    } else {
      const receipt = await api.gst.createRegister(
        shop!.id,
        kind,
        period.range!.from,
        period.range!.to,
      );
      const hash = receipt.hash;
      const history = await api.gst.history(shop!.id, kind);
      const found = history.items.find(
        (r) => r.id === receipt.id && r.contentHash === hash,
      );
      if (!found)
        throw Error(
          text(
            "The saved report could not be confirmed. Refresh report history before preparing another file.",
          ),
        );
      report = found;
      await api.gst.downloadReport(shop!.id, report.id, hash);
    }
    assertScope(active);
    setSaved(report);
    await q.refetch();
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("GST export history")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Prepare a register for a period or reopen its exact saved file. Reports are for filing elsewhere.",
          )}
        />
        <Card className="stack-form">
          <div className="form-grid is-2">
            <SelectField
              label={text("Register")}
              value={kind}
              disabled={action.busy || !!pending.current}
              onChange={(v) => {
                if (!action.busy && !pending.current) {
                  setKind(v);
                  setSaved(null);
                }
              }}
              options={[
                ["sales", text("Sales")],
                ["purchases", text("Purchases")],
                ["numbering", text("Invoice numbers")],
              ]}
            />
          </div>
          <fieldset disabled={action.busy || !!pending.current}>
            {kind !== "numbering" ? (
              period.fields
            ) : (
              <p className="shop-hint">
                {text(
                  "The snapshot includes all retained invoice number allocations at the time it is saved.",
                )}
              </p>
            )}
          </fieldset>
          <Button
            disabled={
              action.busy ||
              (!pending.current && kind !== "numbering" && !period.range)
            }
            onClick={() => void runPreparation()}
          >
            {text(
              preparing
                ? "Preparing report"
                : pending.current
                  ? "Retry saved report"
                  : "Prepare register",
            )}
          </Button>
          {action.notice}
        </Card>
        {saved ? (
          <Card>
            <Pill tone="ok">{text("Report saved")}</Pill>
            <p>
              {text(
                "The exact file is retained. You can download it again from saved reports.",
              )}
            </p>
            <Button
              disabled={action.busy}
              onClick={() => void action.run(() => download(saved))}
            >
              {text("Download saved report")}
            </Button>
            <ReportDetails report={saved} />
          </Card>
        ) : null}
        <Section title={text("More reports & review tools")}>
          <div className="gst-navigation">
            <Link className="gst-nav-row" href={base + "/turnover"}>
              {text("Business turnover review")} ↗
            </Link>
            <Link className="gst-nav-row" href={base + "/periods"}>
              {text("GST period review")} ↗
            </Link>
            <Link className="gst-nav-row" href={base + "/numbers"}>
              {text("Invoice number register")} ↗
            </Link>
          </div>
          <p className="shop-hint">
            {text(
              "Mixed GST credit notes include recorded notes up to the selected end date. Other refunds remain separate.",
            )}
          </p>
          <Button
            tone="ghost"
            disabled={action.busy || (!pending.current && !period.range)}
            onClick={() => void runPreparation(true)}
          >
            {text("Save credit-note report")}
          </Button>
        </Section>
        <h2 className="shop-section-title">{text("Saved reports")}</h2>
        <ReadState query={q} empty={!rows.length}>
          <div className="gst-table-wrap">
            <table className="gst-table">
              <thead>
                <tr>
                  <th>{text("Created")}</th>
                  <th>{text("Period")}</th>
                  <th>{text("Register")}</th>
                  <th>{text("File")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{date(row.createdAt)}</td>
                    <td>
                      {date(row.periodFrom)} —{" "}
                      {date(
                        new Date(Date.parse(row.periodTo) - 1).toISOString(),
                      )}
                    </td>
                    <td>
                      {text(
                        row.kind === "sales"
                          ? "Sales"
                          : row.kind === "purchases"
                            ? "Purchases"
                            : "Invoice numbers",
                      )}
                    </td>
                    <td>
                      <Button
                        tone="quiet"
                        disabled={action.busy}
                        onClick={() => void action.run(() => download(row))}
                      >
                        {text("Download")}
                      </Button>
                      <ReportDetails report={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReadState>
        <More query={q} />
      </div>
    </GstAccess>
  );
}
function PreparationReview({ summary }: { summary: GstPreparationSummary }) {
  const { t: translate } = useShop();
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(key, EN_FALLBACK[key], params);
  const [expanded, setExpanded] = useState(false);
  const review = gstExportReview(summary),
    items = gstExportReviewItems(summary);
  return (
    <div className="stack-form">
      <Pill tone={review.status === "checked" ? "neutral" : "warn"}>
        {t(`gst.preparation.${review.status}`)}
      </Pill>
      {review.status === "review" ? (
        <>
          <p className="shop-hint">
            {t("gst.preparation.documents")}: {review.documents} ·{" "}
            {t("gst.preparation.classifications")}: {review.classifications} ·{" "}
            {t("gst.preparation.business")}: {review.businessReviews} ·{" "}
            {t("gst.export_discrepancies")}: {review.discrepancies}
          </p>
          {(expanded ? items : items.slice(0, 5)).map((item, index) => (
            <p className="shop-hint" key={index}>
              {item.reference ? `${item.reference} · ` : ""}
              {t(`gst.preparation.reason.${item.reason}`, {
                digits: item.digits ?? "",
              })}
            </p>
          ))}
          {items.length > 5 ? (
            <Button
              tone="quiet"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {t(expanded ? "gst.preparation.less" : "gst.preparation.more")}
            </Button>
          ) : null}
        </>
      ) : null}
      <p className="shop-hint">{t("gst.preparation.notice")}</p>
    </div>
  );
}
function ReviewRequestState({
  journal,
  action,
  onRecover,
  canCheck = false,
}: {
  journal: ReturnType<
    typeof useGstQuery<
      import("../../../lib/shop/gst-storage").RetainedRequest[]
    >
  >;
  action: ReturnType<typeof useGstAction>;
  onRecover: (
    row: import("../../../lib/shop/gst-storage").RetainedRequest,
    checkOnly: boolean,
  ) => Promise<void>;
  canCheck?: boolean;
}) {
  const { t: translate, role } = useShop();
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(key, EN_FALLBACK[key], params);
  if (journal.isPending) return <ReadState query={journal}>{null}</ReadState>;
  if (journal.error) return <ReadState query={journal}>{null}</ReadState>;
  return (
    <>
      {journal.data?.map((row) => (
        <Card key={row.id} className="stack-form">
          <p>{t("purchase.pending")}</p>
          <div className="shop-actions">
            <Button
              disabled={action.busy || role !== "OWNER"}
              onClick={() => void action.run(() => onRecover(row, false))}
            >
              {t("purchase.retry")}
            </Button>
            {canCheck ? (
              <Button
                tone="quiet"
                disabled={action.busy}
                onClick={() => void action.run(() => onRecover(row, true))}
              >
                {t("gst.period_check_recorded")}
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
    </>
  );
}
export function GstPeriodsScreen() {
  const { api, shop, role, userId, t: translate } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(key, EN_FALLBACK[key], params);
  const params = useSearchParams();
  const [month, setMonth] = useState(() =>
    /^\d{4}-(0[1-9]|1[0-2])$/.test(params.get("month") ?? "")
      ? params.get("month")!
      : reportReviewDefaults().month,
  );
  const [note, setNote] = useState(""),
    [confirmedSource, setConfirmedSource] = useState<string | null>(null);
  const valid = /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  const q = useGstQuery(
    ["period", month],
    () => api.gst.period(shop!.id, month),
    valid,
  );
  const journal = useGstQuery(
    ["period-pending", month],
    () => pendingReportReviews(shop!.id, "periods", month),
    valid,
    "always",
  );
  const action = useGstAction(),
    period = q.data;
  const blocked =
    !journal.isSuccess || !!journal.error || !!journal.data?.length;
  const source = JSON.stringify([
    userId,
    shop?.id,
    month,
    period?.sequence,
    period?.currentSourceFingerprint,
  ]);
  const reviewed = confirmedSource === source;
  useEffect(() => {
    setNote("");
    setConfirmedSource(null);
  }, [userId, shop?.id, month]);
  useEffect(() => {
    setConfirmedSource(null);
  }, [source]);
  useEffect(() => {
    const row = journal.data?.[0];
    if (row)
      setNote(String((row.payload as Record<string, unknown>).note ?? ""));
  }, [journal.data]);
  async function recover(
    row: import("../../../lib/shop/gst-storage").RetainedRequest,
    checkOnly: boolean,
  ) {
    const scope = financialScope(shop!.id);
    try {
      if (checkOnly) await checkRecordedPeriod(api, shop!.id, row);
      else await recoverFinancialRequest(api, shop!.id, row);
      assertScope(scope);
      setNote("");
      setConfirmedSource(null);
      await q.refetch();
    } finally {
      await journal.refetch();
    }
  }
  async function preview(kind: "sales" | "purchases") {
    const scope = financialScope(shop!.id);
    if (!period) throw Error("invalid_report_period");
    const receipt = await api.gst.createRegister(
      shop!.id,
      kind,
      period.from,
      period.to,
    );
    assertScope(scope);
    saveFile(receipt.content, `gst-${kind}-${month}.csv`);
  }
  async function download(id: string, hash?: string | null) {
    if (!hash) throw Error("gst_export_content_mismatch");
    const scope = financialScope(shop!.id),
      content = await api.gst.downloadReport(shop!.id, id, hash);
    assertScope(scope);
    saveFile(content, `gst-reviewed-${id}.csv`);
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("GST period review")}
          back={{ href: base + "/exports", label: text("GST export history") }}
          description={t("gst.period_notice")}
        />
        <fieldset disabled={action.busy || !!journal.data?.length}>
          <TextField
            label={text("Month")}
            type="month"
            value={month}
            onChange={setMonth}
          />
        </fieldset>
        <Button
          tone="quiet"
          disabled={!valid || q.isFetching || action.busy}
          onClick={() =>
            void action.run(async () => {
              await q.refetch();
              await journal.refetch();
            })
          }
        >
          {t("gst.health_refresh")}
        </Button>
        {valid ? (
          <>
            <ReviewRequestState
              journal={journal}
              action={action}
              onRecover={recover}
              canCheck
            />
            {action.notice}
            <ReadState query={q}>
              {period ? (
                <>
                  <Card className="stack-form">
                    <Pill tone={period.changedSinceClose ? "warn" : "neutral"}>
                      {text(period.state === "closed" ? "Closed" : "Open")}
                    </Pill>
                    {period.changedSinceClose ? (
                      <p role="status">{t("gst.period_changed")}</p>
                    ) : null}
                  </Card>
                  {(["sales", "purchases"] as const).map((kind) => {
                    const summary = period.currentSummaries?.[kind];
                    return (
                      <Card className="stack-form" key={kind}>
                        <h2 className="shop-section-title">
                          {t(
                            kind === "sales"
                              ? "gst.export_sales"
                              : "gst.export_purchases",
                          )}
                        </h2>
                        {summary ? (
                          <>
                            <div className="form-grid is-3">
                              {(["net", "tax", "gross"] as const).map((key) => (
                                <div key={key}>
                                  <p className="shop-hint">
                                    {t(`gst.export_${key}`)}
                                  </p>
                                  <b>₹{summary.afterCredits[key]}</b>
                                </div>
                              ))}
                            </div>
                            {summary.discrepancies.length ? (
                              <p role="alert">
                                {t("gst.export_discrepancies")}:{" "}
                                {summary.discrepancies.length}
                              </p>
                            ) : null}
                            {kind === "sales" ? (
                              <PreparationReview summary={summary} />
                            ) : null}
                          </>
                        ) : null}
                        <Button
                          tone="quiet"
                          disabled={action.busy}
                          onClick={() => void action.run(() => preview(kind))}
                        >
                          {t("gst.period_preview")}
                        </Button>
                      </Card>
                    );
                  })}
                  {role === "OWNER" ? (
                    <Card className="stack-form">
                      <fieldset
                        disabled={action.busy || blocked}
                        className="stack-form"
                      >
                        <TextField
                          label={t("gst.period_note")}
                          value={note}
                          onChange={(value) => {
                            setNote(value);
                            setConfirmedSource(null);
                          }}
                        />
                        <Check
                          label={t("gst.period_reviewed")}
                          checked={reviewed}
                          onChange={(value) =>
                            setConfirmedSource(value ? source : null)
                          }
                        />
                      </fieldset>
                      <Button
                        disabled={
                          action.busy ||
                          blocked ||
                          !reviewed ||
                          !note.trim() ||
                          note.length > 1000 ||
                          q.isFetching
                        }
                        onClick={() =>
                          void action.run(async () => {
                            const scope = financialScope(shop!.id);
                            try {
                              if (
                                (
                                  await pendingReportReviews(
                                    shop!.id,
                                    "periods",
                                    month,
                                  )
                                ).length
                              )
                                throw Error(
                                  "purchase_request_outcome_unconfirmed",
                                );
                              await api.gst.changePeriod(shop!.id, month, {
                                clientId: crypto.randomUUID(),
                                action:
                                  period.state === "closed"
                                    ? "reopen"
                                    : "close",
                                note,
                                reviewed: true,
                                expectedSequence: period.sequence,
                                expectedSourceFingerprint:
                                  period.currentSourceFingerprint,
                              });
                              assertScope(scope);
                              setNote("");
                              setConfirmedSource(null);
                              await q.refetch();
                            } finally {
                              await journal.refetch();
                            }
                          })
                        }
                      >
                        {t(
                          period.state === "closed"
                            ? "gst.period_reopen"
                            : "gst.period_close",
                        )}
                      </Button>
                    </Card>
                  ) : null}
                  <Section title={text("Review history")}>
                    {period.history.map((event) => (
                      <div key={event.id} className="gst-row">
                        <b>
                          {text(
                            event.action === "close" ? "Closed" : "Reopened",
                          )}
                        </b>
                        <span>{date(event.createdAt)}</span>
                        <p>{event.note}</p>
                        <div className="shop-actions">
                          {event.salesExportId ? (
                            <Button
                              tone="quiet"
                              disabled={action.busy}
                              onClick={() =>
                                void action.run(() =>
                                  download(
                                    event.salesExportId!,
                                    event.salesExportHash,
                                  ),
                                )
                              }
                            >
                              {t("gst.period_saved_sales")}
                            </Button>
                          ) : null}
                          {event.purchaseExportId ? (
                            <Button
                              tone="quiet"
                              disabled={action.busy}
                              onClick={() =>
                                void action.run(() =>
                                  download(
                                    event.purchaseExportId!,
                                    event.purchaseExportHash,
                                  ),
                                )
                              }
                            >
                              {t("gst.period_saved_purchases")}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </Section>
                </>
              ) : null}
            </ReadState>
          </>
        ) : (
          <Notice error={Error(text("Choose a valid month."))} />
        )}
      </div>
    </GstAccess>
  );
}
export function GstTurnoverScreen() {
  const { api, shop, role, userId, t: translate } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(key, EN_FALLBACK[key], params);
  const [year, setYear] = useState(() => reportReviewDefaults().year),
    [amount, setAmount] = useState(""),
    [reference, setReference] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const valid =
    /^20\d{2}-\d{2}$/.test(year) &&
    Number(year.slice(5)) === (Number(year.slice(0, 4)) + 1) % 100;
  const q = useGstQuery(
    ["turnover", year],
    () => api.gst.turnover(shop!.id, year),
    valid,
  );
  const journal = useGstQuery(
    ["turnover-pending", year],
    () => pendingReportReviews(shop!.id, "turnover", year),
    valid,
    "always",
  );
  const action = useGstAction(),
    blocked = !journal.isSuccess || !!journal.error || !!journal.data?.length;
  useEffect(() => {
    setAmount("");
    setReference("");
    setReviewed(false);
  }, [userId, shop?.id, year]);
  useEffect(() => {
    const row = journal.data?.[0];
    if (row) {
      setAmount(String((row.payload as Record<string, unknown>).amount ?? ""));
      setReference(
        String(
          (row.payload as Record<string, unknown>).evidenceReference ?? "",
        ),
      );
      setReviewed(false);
    }
  }, [journal.data]);
  useEffect(() => {
    setReviewed(false);
  }, [q.data?.current?.sequence]);
  async function recover(
    row: import("../../../lib/shop/gst-storage").RetainedRequest,
  ) {
    const scope = financialScope(shop!.id);
    try {
      await recoverFinancialRequest(api, shop!.id, row);
      assertScope(scope);
      setReviewed(false);
      await q.refetch();
    } finally {
      await journal.refetch();
    }
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Business turnover review")}
          back={{ href: base + "/exports", label: text("GST export history") }}
          description={text(
            "Record reviewed business-wide turnover evidence. This shop’s sales alone do not establish business turnover.",
          )}
        />
        <fieldset disabled={action.busy || !!journal.data?.length}>
          <TextField
            label={text("Financial year")}
            value={year}
            onChange={setYear}
          />
        </fieldset>
        <Button
          tone="quiet"
          disabled={!valid || q.isFetching || action.busy}
          onClick={() =>
            void action.run(async () => {
              await q.refetch();
              await journal.refetch();
            })
          }
        >
          {t("gst.health_refresh")}
        </Button>
        {valid ? (
          <>
            <ReviewRequestState
              journal={journal}
              action={action}
              onRecover={recover}
            />
            {action.notice}
            <ReadState query={q}>
              <Card className="stack-form">
                <p>
                  {text("Last reviewed amount")}:{" "}
                  {q.data?.current ? `₹${q.data.current.amount}` : "—"}
                </p>
                <p>{q.data?.current?.evidenceReference}</p>
                {q.data?.current ? (
                  <>
                    <p>{date(q.data.current.createdAt)}</p>
                    {q.data.minimumCodeDigits ? (
                      <p>
                        {t("gst.turnover.digits", {
                          digits: q.data.minimumCodeDigits,
                        })}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Card>
              {role === "OWNER" ? (
                <Card className="stack-form">
                  <fieldset
                    disabled={action.busy || blocked}
                    className="stack-form"
                  >
                    <TextField
                      label={text("Business-wide turnover (₹)")}
                      type="number"
                      value={amount}
                      onChange={(v) => {
                        setAmount(v);
                        setReviewed(false);
                      }}
                    />
                    <TextField
                      label={text("Evidence reference")}
                      value={reference}
                      onChange={(v) => {
                        setReference(v);
                        setReviewed(false);
                      }}
                    />
                    <Check
                      label={text(
                        "I have reviewed the business-wide turnover evidence.",
                      )}
                      checked={reviewed}
                      onChange={setReviewed}
                    />
                  </fieldset>
                  <Button
                    disabled={
                      action.busy ||
                      blocked ||
                      !q.isSuccess ||
                      q.isFetching ||
                      !reviewed ||
                      !reference.trim() ||
                      reference.length > 500 ||
                      !/^\d{1,16}(?:\.\d{1,2})?$/.test(amount)
                    }
                    onClick={() =>
                      void action.run(async () => {
                        const scope = financialScope(shop!.id);
                        try {
                          if (
                            (
                              await pendingReportReviews(
                                shop!.id,
                                "turnover",
                                year,
                              )
                            ).length
                          )
                            throw Error("purchase_request_outcome_unconfirmed");
                          await api.gst.saveTurnover(shop!.id, year, {
                            clientId: crypto.randomUUID(),
                            expectedSequence: q.data?.current?.sequence ?? 0,
                            amount,
                            evidenceReference: reference,
                            reviewed: true,
                          });
                          assertScope(scope);
                          setReviewed(false);
                          await q.refetch();
                        } finally {
                          await journal.refetch();
                        }
                      })
                    }
                  >
                    {text("Save reviewed turnover")}
                  </Button>
                </Card>
              ) : null}
              <Section title={text("Review history")}>
                {(q.data?.history ?? q.data?.items ?? []).map((row) => (
                  <div key={row.sequence} className="gst-row">
                    <b>₹{row.amount}</b>
                    <span>{date(row.createdAt)}</span>
                    <p>{row.evidenceReference}</p>
                  </div>
                ))}
              </Section>
            </ReadState>
          </>
        ) : (
          <Notice
            error={Error(
              text("Choose a valid financial year, such as 2026-27."),
            )}
          />
        )}
      </div>
    </GstAccess>
  );
}

function ReportDetails({ report }: { report: GstReport }) {
  const text = useGstText();
  const summary = report.summary as
    | {
        invoices?: { count: number };
        credits?: { count: number };
        afterCredits?: { gross: string; tax: string };
        discrepancies?: unknown[];
        turnoverPreparation?: { status?: string }[];
      }
    | undefined;
  if (!summary) return null;
  return (
    <Section title={text("Report details")}>
      <p>
        {text("Recorded invoices")}: {summary.invoices?.count ?? "—"}
      </p>
      <p>
        {text("Recorded credit notes")}: {summary.credits?.count ?? "—"}
      </p>
      {summary.afterCredits ? (
        <>
          <p>
            {text("Total after credits")}: ₹{summary.afterCredits.gross}
          </p>
          <p>
            {text("GST after credits")}: ₹{summary.afterCredits.tax}
          </p>
        </>
      ) : null}
      {summary.discrepancies?.length ? (
        <>
          <p>
            {text(
              "Some source records need review before using this file for filing preparation.",
            )}
          </p>
          <Button href={base + "/checks"} tone="quiet">
            {text("Review GST record checks")}
          </Button>
        </>
      ) : null}
      <p className="shop-hint">
        {text(
          "This is a saved preparation report. It does not confirm filing or input-tax eligibility.",
        )}
      </p>
    </Section>
  );
}
