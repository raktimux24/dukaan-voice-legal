"use client";
import { useState, useRef } from "react";
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
import { financialYear } from "../../../lib/shop/gst-core/gst";
import type { GstReport } from "../../../lib/shop/gst-types";
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
            <Button disabled={action.busy} onClick={() => void action.run(() => download(saved))}>
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
export function GstPeriodsScreen() {
  const { api, shop, role } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const [month, setMonth] = useState(
      new Date()
        .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
        .slice(0, 7),
    ),
    [note, setNote] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const q = useGstQuery(
    ["period", month],
    () => api.gst.period(shop!.id, month),
    /^\d{4}-(0[1-9]|1[0-2])$/.test(month),
  );
  const action = useGstAction(),
    period = q.data;
  const pending = useRef<Parameters<typeof api.gst.changePeriod>[2] | null>(
    null,
  );
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("GST period review")}
          back={{ href: base + "/exports", label: text("GST export history") }}
          description={text(
            "Closing a period records a review and saves supporting reports. It does not file a GST return.",
          )}
        />
        <TextField
          label={text("Month")}
          type="month"
          value={month}
          onChange={(v) => {
            if (!pending.current) {
              setMonth(v);
              setReviewed(false);
            }
          }}
        />
        {!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? (
          <Notice error={Error(text("Choose a valid month."))} />
        ) : (
          <ReadState query={q}>
            {period ? (
              <>
                <Card>
                  <Pill tone={period.changedSinceClose ? "warn" : "neutral"}>
                    {text(period.state === "closed" ? "Closed" : "Open")}
                  </Pill>
                  {period.changedSinceClose ? (
                    <p>
                      {text(
                        "Records changed since the last closure. Review them before relying on the saved reports.",
                      )}
                    </p>
                  ) : null}
                  <Button href={base + "/exports"} tone="quiet">
                    {text("Review reports")}
                  </Button>
                </Card>
                {role === "OWNER" ? (
                  <Card>
                    <fieldset disabled={action.busy || !!pending.current}>
                      <TextField
                        label={text("Review note")}
                        value={note}
                        onChange={(v) => {
                          setNote(v);
                          setReviewed(false);
                        }}
                      />
                      <Check
                        label={text(
                          "I have reviewed this period and its source records.",
                        )}
                        checked={reviewed}
                        onChange={setReviewed}
                      />
                    </fieldset>
                    {action.notice}
                    <Button
                      disabled={
                        action.busy ||
                        (!pending.current && (!reviewed || !note.trim()))
                      }
                      onClick={() =>
                        void action.run(async () => {
                          const input = pending.current ?? {
                            clientId: crypto.randomUUID(),
                            action:
                              period.state === "closed"
                                ? ("reopen" as const)
                                : ("close" as const),
                            note,
                            reviewed: true as const,
                            expectedSequence: period.sequence,
                            expectedSourceFingerprint:
                              period.currentSourceFingerprint,
                          };
                          pending.current = input;
                          await api.gst.changePeriod(shop!.id, month, input);
                          pending.current = null;
                          setReviewed(false);
                          await q.refetch();
                        })
                      }
                    >
                      {text(
                        pending.current
                          ? "Retry saved review"
                          : period.state === "closed"
                            ? "Reopen period"
                            : "Close reviewed period",
                      )}
                    </Button>
                  </Card>
                ) : null}
                <Section title={text("Review history")}>
                  {period.history.map((event) => (
                    <div key={event.id} className="gst-row">
                      <b>
                        {text(event.action === "close" ? "Closed" : "Reopened")}
                      </b>
                      <span>{date(event.createdAt)}</span>
                      <p>{event.note}</p>
                    </div>
                  ))}
                </Section>
              </>
            ) : null}
          </ReadState>
        )}
      </div>
    </GstAccess>
  );
}
export function GstTurnoverScreen() {
  const { api, shop, role } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  const [year, setYear] = useState(financialYear(new Date())),
    [amount, setAmount] = useState(""),
    [reference, setReference] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const q = useGstQuery(
      ["turnover", year],
      () => api.gst.turnover(shop!.id, year),
      /^\d{4}-\d{2}$/.test(year) &&
        Number(year.slice(5)) === (Number(year.slice(0, 4)) + 1) % 100,
    ),
    action = useGstAction();
  const pending = useRef<Parameters<typeof api.gst.saveTurnover>[2] | null>(
    null,
  );
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
        <TextField
          label={text("Financial year")}
          value={year}
          onChange={(v) => {
            if (!pending.current) setYear(v);
          }}
        />
        {!(
          /^\d{4}-\d{2}$/.test(year) &&
          Number(year.slice(5)) === (Number(year.slice(0, 4)) + 1) % 100
        ) ? (
          <Notice
            error={Error(
              text("Choose a valid financial year, such as 2026-27."),
            )}
          />
        ) : (
          <ReadState query={q}>
            <Card>
              <p>
                {text("Last reviewed amount")}: {q.data?.current?.amount ?? "—"}
              </p>
              <p>{q.data?.current?.evidenceReference}</p>
              {q.data?.current ? <p>{date(q.data.current.createdAt)}</p> : null}
            </Card>
            {role === "OWNER" ? (
              <Card>
                <fieldset disabled={action.busy || !!pending.current}>
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
                {action.notice}
                <Button
                  disabled={
                    action.busy ||
                    (!pending.current &&
                      (!reviewed ||
                        !reference.trim() ||
                        !/^\d{1,16}(?:\.\d{1,2})?$/.test(amount)))
                  }
                  onClick={() =>
                    void action.run(async () => {
                      const input = pending.current ?? {
                        clientId: crypto.randomUUID(),
                        expectedSequence: q.data?.current?.sequence ?? 0,
                        amount,
                        evidenceReference: reference,
                        reviewed: true as const,
                      };
                      pending.current = input;
                      await api.gst.saveTurnover(shop!.id, year, input);
                      pending.current = null;
                      setReviewed(false);
                      await q.refetch();
                    })
                  }
                >
                  {text(
                    pending.current
                      ? "Retry saved review"
                      : "Save reviewed turnover",
                  )}
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
