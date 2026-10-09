"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SelectField } from "../gst-ui";
import { useShop } from "../context";
import { Button, Card, PageHeader } from "../ui";
import { Stats, Section, useGstText, useFiscalDate } from "../gst-ui";
import {
  useGstPages,
  useGstQuery,
  usePeriod,
  ReadState,
  More,
  GstAccess,
} from "../gst-workspace";
import { currentReportMonth } from "../../../lib/shop/gst-core/report-period";
import { formatINR } from "../../../lib/shop/money";
export function PurchasesScreen() {
  const { api, shop, perms, offline } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    period = usePeriod();
  const range = period.range;
  const params = useSearchParams();
  const [supplierId, setSupplierId] = useState(params.get("supplierId") ?? "");
  const suppliers = useGstPages(
    ["purchase-suppliers"],
    (cursor) => api.gst.suppliers(shop!.id, "", cursor),
    perms.canSeeCost,
  );
  const supplierRows =
    suppliers.data?.pages.flatMap((page) => page.items) ?? [];
  const q = useGstPages(
    ["purchases", range, supplierId],
    (cursor) =>
      api.gst.purchases(shop!.id, range!.from, range!.to, supplierId, cursor),
    !!range && perms.canSeeCost,
  );
  const totals = useGstQuery(
    ["purchase-totals", range],
    () => api.gst.reconciliation(shop!.id, range!.from, range!.to),
    !!range && perms.canSeeCost,
  );
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Supplier invoices & purchase tax")}
          back={{
            href: "/shop/settings",
            label: text("Settings"),
          }}
          description={text(
            "Record supplier invoices and review purchase tax. Recording an invoice does not claim or file ITC.",
          )}
          actions={
            <Button href="/shop/purchases/new">
              {text("Record supplier invoice")}
            </Button>
          }
        />
        <Button tone="ghost" href="/shop/settings/gst/recovery">
          {text("Resume / check saved requests")}
        </Button>
        <Card>
          <h2 className="shop-section-title">{text("Report period")}</h2>
          <div className="shop-actions">
            <Button
              tone="ghost"
              onClick={() => period.setDates(currentReportMonth())}
            >
              {text("This month")}
            </Button>
            <Button
              tone="ghost"
              onClick={() => {
                const current = currentReportMonth(),
                  through = new Date(
                    Date.parse(current.from + "T12:00:00Z") - 86400000,
                  )
                    .toISOString()
                    .slice(0, 10);
                period.setDates({ from: through.slice(0, 7) + "-01", through });
              }}
            >
              {text("Last month")}
            </Button>
          </div>
          {period.fields}
          <SelectField
            label={text("Filter recorded invoices by supplier")}
            value={supplierId}
            onChange={setSupplierId}
            options={[
              ["", text("All suppliers")],
              ...supplierRows.map((s) => [s.id, s.identity.name] as const),
            ]}
          />
          <More query={suppliers} />
          {supplierId ? (
            <p className="shop-hint">
              {text(
                "Summary totals and purchase registers include all shop suppliers for the selected period. The supplier filter applies to the invoice list.",
              )}
            </p>
          ) : null}
        </Card>
        {range ? (
          <ReadState query={totals}>
            {totals.data ? (
              <>
                <Stats
                  items={[
                    {
                      label: text("Purchases after credits"),
                      value: formatINR(totals.data.periodNet.gross),
                    },
                    {
                      label: text("Purchase tax after credits"),
                      value: formatINR(totals.data.periodNet.tax),
                    },
                    {
                      label: text("Unreviewed invoices"),
                      value: totals.data.currentUnreviewed.count,
                    },
                  ]}
                />
                <Section title={text("Accounting details — shop totals")}>
                  <p className="shop-hint">
                    {text(
                      "Invoices and credits use document dates; reviewed tax and cost changes use recording dates; payments use effective dates. The unreviewed queue below is current and all-time.",
                    )}
                  </p>
                  {[
                    ["Supplier invoices", totals.data.invoice.gross],
                    ["Supplier credits", totals.data.supplierCredits.gross],
                    ["Net acquisition value", totals.data.periodNet.net],
                    [
                      "Opening reviewed credit",
                      totals.data.reviewedItc.opening,
                    ],
                    [
                      "Reviewed credit movement",
                      totals.data.reviewedItc.movement,
                    ],
                    [
                      "Closing reviewed credit",
                      totals.data.reviewedItc.closing,
                    ],
                    ["Opening payable", totals.data.settlements.openingPayable],
                    [
                      "Opening recoverable",
                      totals.data.settlements.openingRecoverable,
                    ],
                    [
                      "Recorded supplier payments",
                      totals.data.settlements.payments,
                    ],
                    [
                      "Recorded supplier refunds",
                      totals.data.settlements.refunds,
                    ],
                    ["Closing payable", totals.data.settlements.closingPayable],
                    [
                      "Closing recoverable",
                      totals.data.settlements.closingRecoverable,
                    ],
                    [
                      "On-hand cost changes",
                      totals.data.costMovements.inventory,
                    ],
                    [
                      "Consumed cost changes",
                      totals.data.costMovements.consumed,
                    ],
                    [
                      "Current unreviewed purchase tax (all-time)",
                      totals.data.currentUnreviewed.tax,
                    ],
                  ].map(([label, value]) => (
                    <div className="gst-row" key={label}>
                      <span>{text(String(label))}</span>
                      <b>{formatINR(Number(value))}</b>
                    </div>
                  ))}
                  <p className="shop-hint">
                    {text(
                      "Recording a payment or refund does not transfer money. Reviewed credit is a recorded decision, not a filed claim.",
                    )}
                  </p>
                </Section>
              </>
            ) : null}
          </ReadState>
        ) : null}
        <h2 className="shop-section-title">{text("Recorded invoices")}</h2>
        {range ? (
          <ReadState query={q} empty={!rows.length}>
            <div className="gst-table-wrap">
              <table className="gst-table">
                <thead>
                  <tr>
                    <th>{text("Invoice")}</th>
                    <th>{text("Supplier")}</th>
                    <th>{text("Date")}</th>
                    <th>{text("Tax")}</th>
                    <th>{text("Total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={"/shop/purchases/" + row.id}>
                          {row.snapshot.invoiceNumber}
                        </Link>
                      </td>
                      <td>{row.snapshot.supplier.name}</td>
                      <td>{date(row.issuedAt)}</td>
                      <td>{formatINR(Number(row.taxAmount))}</td>
                      <td>{formatINR(Number(row.grossAmount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReadState>
        ) : null}
        <More query={q} />
        <Button
          disabled={!range}
          href={
            range
              ? "/shop/settings/gst/exports?kind=purchases&from=" +
                period.dates.from +
                "&through=" +
                period.dates.through
              : undefined
          }
          tone="ghost"
        >
          {text("Prepare purchase register")}
        </Button>
        <Button
          tone="ghost"
          href={
            "/shop/settings/gst/exports?kind=purchases&from=" +
            period.dates.from +
            "&through=" +
            period.dates.through
          }
        >
          {text("Purchase export history")}
        </Button>
        <Button
          tone="ghost"
          disabled={
            !range ||
            offline ||
            q.isFetching ||
            totals.isFetching ||
            suppliers.isFetching
          }
          onClick={() => {
            void q.refetch();
            void totals.refetch();
            void suppliers.refetch();
          }}
        >
          {text("Refresh records & totals")}
        </Button>
      </div>
    </GstAccess>
  );
}
