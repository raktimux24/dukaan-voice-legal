"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, IllustratedEmpty, PageHeader, NoAccess } from "../ui";
import { SelectField, TextField, Stats, Section, useGstText } from "../gst-ui";
import { useGstPages, useGstQuery, usePeriod, ReadState, More, GstAccess } from "../gst-workspace";
import { currentReportMonth } from "../../../lib/shop/gst-core/report-period";
import { useShopDates } from "../use-shop-dates";
import { formatINR } from "../../../lib/shop/money";
import { purchaseAccess, invoicePeriod, filterInvoices } from "../../../lib/shop/purchases/presentation";

export function PurchasesScreen() {
  const { api, shop, perms, offline, t } = useShop(), text = useGstText(), date = useShopDates().formatDay;
  const params = useSearchParams();
  const period = usePeriod(invoicePeriod(params.get("from"), params.get("through"))), range = period.range;
  const [section, setSection] = useState(params.get("view") === "reports" ? "reports" : "invoices");
  const [supplierId, setSupplierId] = useState(params.get("supplierId") ?? ""), [search, setSearch] = useState("");
  const settings = useGstQuery(["settings"], () => api.getPosSettings(shop!.id), perms.canSeeCost);
  const access = purchaseAccess(settings.data, !!settings.error);
  const allowed = perms.canSeeCost && access.readable;
  const suppliers = useGstPages(["purchase-suppliers"], cursor => api.gst.suppliers(shop!.id, "", cursor), allowed);
  const supplierRows = suppliers.data?.pages.flatMap(page => page.items) ?? [];
  const q = useGstPages(["purchases", range, supplierId], cursor => api.gst.purchases(shop!.id, range!.from, range!.to, supplierId, cursor), !!range && allowed);
  const totals = useGstQuery(["purchase-totals", range], () => api.gst.reconciliation(shop!.id, range!.from, range!.to), !!range && allowed);
  const rows = q.data?.pages.flatMap(p => p.items) ?? [], filtered = filterInvoices(rows, search);
  const refreshing = settings.isFetching || q.isFetching || totals.isFetching || suppliers.isFetching;
  const recordHref = access.writable && !offline ? `/shop/purchases/new${supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : ""}` : undefined;
  const exportHref = range && allowed ? `/shop/settings/gst/exports?kind=purchases&from=${period.dates.from}&through=${period.dates.through}` : undefined;
  const refresh = () => { void settings.refetch(); if (allowed && range) { void q.refetch(); void totals.refetch(); void suppliers.refetch(); } };
  if (!perms.canSeeCost) return <NoAccess what={text("This role cannot view purchase costs.")} />;
  return <GstAccess><div className="shop-page invoice-workspace">
    <PageHeader kicker={t("poweb.kicker", "Purchasing")} title={text("Supplier invoices")}
      back={{href:"/shop",label:text("Home")}}
      description={t("invoiceweb.intro", "Keep supplier bills, payments and purchase tax together.")}
      actions={<><Button tone="ghost" disabled={offline || refreshing} onClick={refresh}>{text("Refresh records & totals")}</Button><Button href={recordHref} disabled={!recordHref}>{text("Record supplier invoice")}</Button></>} />
    <nav className="invoice-tabs" aria-label={text("Supplier invoices")}>
      <button type="button" aria-pressed={section === "invoices"} onClick={() => setSection("invoices")}>{text("Recorded invoices")}</button>
      <button type="button" aria-pressed={section === "reports"} onClick={() => setSection("reports")}>{t("invoiceweb.reports", "Reports & exports")}</button>
    </nav>
    <div className="invoice-period"><details className="invoice-disclosure" open={!range || undefined}>
      <summary><span>{text("Report period")}<strong>{date(period.dates.from+"T12:00:00Z")} — {date(period.dates.through+"T12:00:00Z")}</strong></span><span aria-hidden="true">⌄</span></summary>
      <div className="invoice-filter-body"><div className="shop-actions"><Button tone="ghost" onClick={() => period.setDates(currentReportMonth())}>{text("This month")}</Button><Button tone="ghost" onClick={() => { const current=currentReportMonth(), through=new Date(Date.parse(current.from+"T12:00:00Z")-86400000).toISOString().slice(0,10); period.setDates({from:through.slice(0,7)+"-01",through}); }}>{text("Last month")}</Button></div>{period.fields}</div>
    </details></div>
    {!access.readable ? <Card><p>{text("Invoice access unavailable")}</p><p className="shop-hint">{text(settings.isFetching ? "Checking server availability…" : "Refresh the connection to load retained invoices. No records have been removed.")}</p><Button tone="ghost" disabled={settings.isFetching || offline} onClick={() => void settings.refetch()}>{text("Retry")}</Button></Card> : !access.writable ? <p className="shop-hint">{text("Purchase recording is unavailable on this server.")}</p> : null}
    {range && allowed ? <ReadState query={totals}>{totals.data ? <div className="invoice-summary"><Stats items={[
      {label:t("invoiceweb.shop_total", "Shop purchases after credits"),value:formatINR(totals.data.periodNet.gross)},
      {label:text("Purchase tax after credits"),value:formatINR(totals.data.periodNet.tax)},
      {label:t("invoiceweb.unreviewed", "Unreviewed invoices · all time"),value:totals.data.currentUnreviewed.count},
    ]}/></div> : null}</ReadState> : null}
    {section === "invoices" ? <>
      <div className="invoice-tools"><TextField label={t("invoiceweb.search", "Search loaded invoices")} value={search} onChange={setSearch}/><div><SelectField label={text("Filter recorded invoices by supplier")} value={supplierId} onChange={setSupplierId} options={[["",text("All suppliers")],...supplierRows.map(s => [s.id,s.identity.name] as const)]}/><More query={suppliers}/>{suppliers.error ? <Button tone="quiet" onClick={() => void suppliers.refetch()}>{text("Retry")}</Button> : null}</div></div>
      <p className="shop-hint">{t("invoiceweb.scope", "Search covers loaded invoices. Totals and exports cover all suppliers in the selected period.")}</p>
      {range && allowed ? <ReadState query={q}>
        {filtered.length ? <div className="invoice-ledger">{filtered.map(row => <Link className="invoice-ledger-row" key={row.id} href={"/shop/purchases/"+row.id}>
          <span className="invoice-mark" aria-hidden="true">↙</span><span className="invoice-identity"><strong>{row.snapshot.supplier.name}</strong><small>{row.snapshot.invoiceNumber} · {date(row.issuedAt)}</small></span>
          <span className="invoice-row-tax"><small>{text("Purchase tax")}</small>{formatINR(Number(row.taxAmount))}</span><span className="invoice-row-total"><small>{text("Invoice total")}</small><strong>{formatINR(Number(row.grossAmount))}</strong></span><span aria-hidden="true" className="invoice-row-arrow">↗</span>
        </Link>)}</div> : <IllustratedEmpty icon="receipt" title={search ? t("invoiceweb.no_match", "No matching invoices") : t("shopux.no_invoices", "No supplier invoices in this period")} body={search ? t("invoiceweb.try_search", "Try a supplier name or invoice number, or load more invoices.") : t("shopux.no_invoices_body", "Record a bill from a supplier, or widen the dates above.")} action={search ? <Button tone="ghost" onClick={() => setSearch("")}>{t("invoiceweb.clear", "Clear search")}</Button> : recordHref ? <Button href={recordHref}>{text("Record supplier invoice")}</Button> : undefined}/>}
        <More query={q}/>
      </ReadState> : null}
    </> : <div className="invoice-reports"><div className="invoice-export-actions"><Button href={exportHref} disabled={!exportHref}>{text("Prepare purchase register")}</Button><Button tone="ghost" href={exportHref} disabled={!exportHref}>{text("Purchase export history")}</Button></div>
      {range && allowed && totals.data && !totals.error ? <>
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
      </> : null}
    </div>}
    <div className="invoice-recovery"><p>{text("Record supplier invoices and review purchase tax. Recording an invoice does not claim or file ITC.")}</p><Button tone="quiet" href="/shop/settings/gst/recovery">{text("Resume / check saved requests")}</Button></div>
  </div></GstAccess>;
}
