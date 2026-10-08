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
import { formatINR } from "../../../lib/shop/money";
export function PurchasesScreen() {
  const { api, shop, perms } = useShop(),
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
        <Card>
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
                <Section title={text("Purchase reconciliation")}>
                  <div className="gst-row">
                    <span>{text("Opening reviewed ITC")}</span>
                    <b>{formatINR(totals.data.reviewedItc.opening)}</b>
                  </div>
                  <div className="gst-row">
                    <span>{text("Reviewed ITC movement")}</span>
                    <b>{formatINR(totals.data.reviewedItc.movement)}</b>
                  </div>
                  <div className="gst-row">
                    <span>{text("Closing reviewed ITC")}</span>
                    <b>{formatINR(totals.data.reviewedItc.closing)}</b>
                  </div>
                  <div className="gst-row">
                    <span>{text("Supplier payable")}</span>
                    <b>
                      {formatINR(
                        Number(totals.data.settlements.closingPayable),
                      )}
                    </b>
                  </div>
                  <div className="gst-row">
                    <span>{text("Supplier recoverable")}</span>
                    <b>
                      {formatINR(
                        Number(totals.data.settlements.closingRecoverable),
                      )}
                    </b>
                  </div>
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
          href={
            "/shop/settings/gst/exports?kind=purchases&from=" +
            period.dates.from +
            "&through=" +
            period.dates.through
          }
          tone="ghost"
        >
          {text("Prepare purchase register")}
        </Button>
      </div>
    </GstAccess>
  );
}
