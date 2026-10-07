"use client";
import { useShop } from "./context";
import { Card, Button, Notice, NoAccess } from "./ui";
import { useGstQuery, ReadState, useGstAction } from "./gst-workspace";
import { Section, useGstText, useFiscalDate } from "./gst-ui";
import { verifyDocument } from "../../lib/shop/gst-document";
import { saveFile } from "../../lib/shop/gst-storage";
import { formatINR } from "../../lib/shop/money";
import type {
  FiscalDocument,
  TaxTotals,
  LineTax,
} from "../../lib/shop/gst-types";
export function GstDocuments({ saleId }: { saleId: string }) {
  const { api, shop, perms } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const q = useGstQuery(
    ["fiscal-documents", saleId],
    async () => {
      const rows = await api.gst.fiscalDocuments(shop!.id, saleId);
      return Promise.all(
        rows.map(async (doc) => {
          try {
            await verifyDocument(doc, shop!.id, saleId);
            return { doc, error: null };
          } catch (error) {
            return { doc, error };
          }
        }),
      );
    },
    perms.canSeeReports,
  );
  if (!perms.canSeeReports)
    return (
      <NoAccess
        what={text(
          "Ask a shop administrator to open the verified GST document.",
        )}
      />
    );
  return (
    <div className="grid gap-4">
      <ReadState query={q} empty={!q.data?.length}>
        {q.data?.map(({ doc, error }) => {
          const context =
            doc.payload.context ??
            (
              doc.payload.original as
                { context?: typeof doc.payload.context } | undefined
            )?.context;
          const totals = doc.payload.totals;
          const items = doc.payload.items as
            | {
                name: string;
                unit: string;
                quantity: number;
                price?: number;
                tax?: LineTax;
              }[]
            | undefined;
          return (
            <Section
              key={doc.id}
              title={`${text(doc.type.replaceAll("_", " "))} ${doc.number}`}
              summary={date(doc.issuedAt)}
              open
            >
              <Notice error={error} />
              {error ? (
                <Button
                  tone="ghost"
                  onClick={() =>
                    saveFile(
                      JSON.stringify(doc, null, 2),
                      `samaan-document-${doc.id}.json`,
                      "application/json",
                    )
                  }
                >
                  {text("Download document for support")}
                </Button>
              ) : null}
              {!error ? (
                <article className="gst-document" id={"gst-doc-" + doc.id}>
                  <header>
                    <p>
                      <b>
                        {text(doc.type.replaceAll("_", " "))} {doc.number}
                      </b>
                    </p>
                    <p>{date(doc.issuedAt)}</p>
                    <h2 className="shop-section-title">
                      {context?.settings.legalName}
                    </h2>
                    <p>{context?.settings.address}</p>
                    <p>GSTIN {context?.settings.gstin}</p>
                  </header>
                  {context?.buyer ? (
                    <div className="gst-row">
                      <b>{context.buyer.name}</b>
                      <span>{context.buyer.gstin}</span>
                      <p>{context.buyer.address}</p>
                    </div>
                  ) : null}
                  {doc.originalNumber ? (
                    <p>
                      {text("Original invoice")}: {doc.originalNumber}
                    </p>
                  ) : null}
                  <div className="gst-table-wrap">
                    <table className="gst-table">
                      <thead>
                        <tr>
                          <th>{text("Product")}</th>
                          <th>{text("Quantity")}</th>
                          <th>{text("HSN / SAC")}</th>
                          <th>{text("Rate")}</th>
                          <th>{text("GST")}</th>
                          <th>{text("Total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items?.map((line, index) => (
                          <tr key={index}>
                            <td>{line.name}</td>
                            <td>
                              {line.quantity} {line.unit}
                            </td>
                            <td>{line.tax?.code}</td>
                            <td>{line.tax?.rate}%</td>
                            <td>{line.tax ? formatINR(line.tax.tax) : "—"}</td>
                            <td>
                              {line.tax ? formatINR(line.tax.total) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totals ? (
                    <div className="gst-price-preview">
                      <span>
                        {text("Before GST")}
                        <b>{formatINR(totals.net)}</b>
                      </span>
                      <span>
                        GST<b>{formatINR(totals.tax)}</b>
                      </span>
                      <span>
                        {text("Total")}
                        <b>{formatINR(totals.total)}</b>
                      </span>
                      <span>CGST {formatINR(totals.cgst)}</span>
                      <span>
                        SGST / UTGST {formatINR(totals.sgst + totals.utgst)}
                      </span>
                      <span>IGST {formatINR(totals.igst)}</span>
                    </div>
                  ) : (
                    <p>
                      {text("Total")}:{" "}
                      {typeof doc.payload.total === "number" &&
                      Number.isFinite(doc.payload.total)
                        ? formatINR(doc.payload.total)
                        : text("See the saved document for adjustment details")}
                    </p>
                  )}
                  <p className="shop-hint">
                    {text("Authorised signatory")} __________________
                  </p>
                  <p className="shop-hint">
                    {text(
                      "The app does not digitally sign GST documents. Sign a printed copy when required.",
                    )}
                  </p>
                  <div className="shop-actions no-print">
                    <Button
                      tone="ghost"
                      onClick={() => {
                        const content = document.getElementById(
                          "gst-doc-" + doc.id,
                        )?.outerHTML;
                        if (!content) return;
                        const html =
                          '<!doctype html><html><head><meta charset="utf-8"><title>' +
                          doc.number.replace(/[<>&"]/g, "") +
                          "</title><style>body{font:14px Arial,sans-serif;padding:32px;color:#111}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}.no-print{display:none}.gst-price-preview{display:grid;gap:10px;margin:24px 0}p{line-height:1.5}@media print{tr{break-inside:avoid}thead{display:table-header-group}}</style></head><body>" +
                          content +
                          "</body></html>";
                        saveFile(
                          html,
                          `samaan-${doc.number.replace(/[^a-zA-Z0-9-]/g, "-")}.html`,
                          "text/html",
                        );
                      }}
                    >
                      {text("Download bill")}
                    </Button>
                    <Button tone="ghost" onClick={() => window.print()}>
                      {text("Print / save PDF")}
                    </Button>
                    <Button
                      tone="ghost"
                      onClick={() =>
                        saveFile(
                          JSON.stringify(doc, null, 2),
                          `samaan-${doc.number.replace(/[^a-zA-Z0-9-]/g, "-")}.json`,
                          "application/json",
                        )
                      }
                    >
                      {text("Download saved document")}
                    </Button>
                  </div>
                </article>
              ) : null}
            </Section>
          );
        })}
      </ReadState>
      {action.notice}
    </div>
  );
}
