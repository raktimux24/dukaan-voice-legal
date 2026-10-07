import { canonicalJson } from "./gst-core/sale-request-canonical";
import { sha256 } from "./gst-storage";
import { fiscalTotalsConsistent } from "./gst-core/fiscal-totals-integrity";
import { fiscalRenderVersion } from "./gst-core/fiscal-render-version";
import type { FiscalDocument } from "./gst-types";
export async function verifyDocument(
  doc: FiscalDocument,
  shopId: string,
  saleId: string,
) {
  if (
    doc.shopId !== shopId ||
    doc.saleId !== saleId ||
    doc.integrity !== "verified"
  )
    throw Error("This saved document needs review before sharing.");
  const issuedAt = new Date(doc.issuedAt);
  if (!Number.isFinite(issuedAt.getTime())) throw Error("Invalid fiscal date.");
  const content =
    doc.hashVersion === "fiscal_document_v2"
      ? {
          shopId: doc.shopId,
          saleId: doc.saleId,
          issuer: doc.issuer,
          financialYear: doc.financialYear,
          number: doc.number,
          type: doc.type,
          issuedAt: issuedAt.toISOString(),
          originalNumber: doc.originalNumber ?? null,
          payload: doc.payload,
        }
      : doc.hashVersion === "canonical_json_v1"
        ? doc.payload
        : null;
  if (
    !content ||
    (await sha256(canonicalJson(JSON.parse(JSON.stringify(content))))) !==
      doc.hash
  )
    throw Error("This saved document could not be verified.");
  fiscalRenderVersion(doc.payload.renderVersion);
  if (doc.payload.totals && !fiscalTotalsConsistent(doc.payload.totals))
    throw Error("The retained document totals do not reconcile.");
  if (
    ["tax_invoice", "bill_of_supply", "invoice_cum_bill_of_supply"].includes(
      doc.type,
    )
  ) {
    if (
      !doc.payload.context ||
      !doc.payload.totals ||
      !Array.isArray(doc.payload.items) ||
      !doc.payload.items.length
    )
      throw Error(
        "This document format needs a supported renderer before printing. Download the original document for support.",
      );
    if (doc.payload.items.length !== doc.payload.totals.lines.length)
      throw Error("The saved document has incomplete product details.");
    for (const [index, item] of doc.payload.items.entries()) {
      const line = item as {
        name?: unknown;
        quantity?: unknown;
        unit?: unknown;
        tax?: unknown;
      };
      if (
        typeof line.name !== "string" ||
        typeof line.unit !== "string" ||
        typeof line.quantity !== "number" ||
        !Number.isFinite(line.quantity) ||
        !line.tax ||
        canonicalJson(line.tax) !==
          canonicalJson(doc.payload.totals.lines[index])
      )
        throw Error("The saved document has incomplete product details.");
    }
  }
  return doc;
}
