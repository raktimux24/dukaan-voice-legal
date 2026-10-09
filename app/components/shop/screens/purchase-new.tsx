"use client";
import { eligiblePurchaseReceipts } from "../../../lib/shop/gst-core/purchase-batch-link";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, PageHeader, Notice } from "../ui";
import { SupplierPicker } from "../gst-supplier";
import {
  BuyerFields,
  emptyBuyer,
  emptyTax,
  TaxFields,
  TextField,
  SelectField,
  StateField,
  Check,
  Section,
  Stats,
  useGstText,
} from "../gst-ui";
import {
  useGstQuery,
  useGstAction,
  ReadState,
  GstAccess,
} from "../gst-workspace";
import { purchaseTotals } from "../../../lib/shop/gst-core/purchase-gst";
import { indianCalendarDate } from "../../../lib/shop/gst-core/fiscal-date";
import type {
  Buyer,
  GstSupplier,
  PurchaseInput,
  PurchaseLineInput,
} from "../../../lib/shop/gst-types";
import { formatINR } from "../../../lib/shop/money";
type Line = PurchaseLineInput & {
  key: string;
  name: string;
  stockMode: "invoice_only" | "receive" | "link";
};
export function PurchaseNewScreen() {
  const { api, shop, perms } = useShop(),
    text = useGstText(),
    router = useRouter(),
    action = useGstAction();
  const pos = useGstQuery(["settings"], () => api.getPosSettings(shop!.id)),
    catalog = useGstQuery(
      ["purchase-products"],
      () => api.getAllInventory(shop!.id),
      perms.canSeeCost,
    );
  const [supplier, setSupplier] = useState<GstSupplier | null>(null),
    [recipientDraft, setRecipient] = useState<Buyer | null>(null),
    [lines, setLines] = useState<Line[]>([]),
    [registration, setRegistration] =
      useState<PurchaseInput["supplierRegistration"]>("regular"),
    [documentType, setDocumentType] =
      useState<PurchaseInput["documentType"]>("tax_invoice"),
    [invoiceNumber, setNumber] = useState(""),
    [invoiceDate, setDate] = useState(indianCalendarDate),
    [mode, setMode] = useState<"inclusive" | "exclusive">("exclusive"),
    [discount, setDiscount] = useState("0"),
    [declared, setDeclared] = useState(""),
    [reference, setReference] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [movement, setMovement] = useState(false);
  const retained = useRef<PurchaseInput | null>(null);
  const settings = pos.data?.gstSettings;
  const recipient = recipientDraft ?? {
    ...emptyBuyer(),
    name: settings?.legalName || shop?.name || "",
    gstin: settings?.gstin || "",
    stateCode: settings?.stateCode || "",
    address: settings?.address || pos.data?.shopAddress || "",
    structuredAddress: settings?.structuredAddress,
  };
  const reset = () => {
    setReviewed(false);
    setLines((rows) =>
      rows.map((l) => ({ ...l, tax: { ...l.tax, reviewed: false } })),
    );
  };
  const change = (fn: () => void) => {
    fn();
    reset();
  };
  const input: PurchaseInput = {
    clientId: "",
    supplierId: supplier?.id ?? "",
    supplierRegistration: registration,
    documentType,
    supplyType: "domestic_forward_charge",
    ...(movement
      ? {
          goodsMovement: {
            destinationStateCode: recipient.stateCode,
            deliveryAddress: recipient.address,
            reviewed: true,
          },
        }
      : {}),
    invoiceNumber,
    invoiceDate,
    priceMode: mode,
    placeOfSupply: recipient.stateCode,
    discount: Number(discount),
    declaredTotal: Number(declared),
    recipient,
    lines: lines.map(({ key, name, stockMode, ...line }) => ({
      ...line,
      tax: {...line.tax, version: line.tax.version || "purchase-manual-v1"},
    })),
    evidenceReference: reference,
    reviewed,
  };
  let totals: ReturnType<typeof purchaseTotals> | undefined,
    validation: unknown;
  try {
    if (lines.some((l) => l.stockMode === "link" && !l.existingBatchId))
      throw Error(text("Select a batch for each linked stock item."));
    if (supplier)
      totals = purchaseTotals({ ...input, reviewed: true }, supplier.identity);
  } catch (e) {
    validation = e;
  }
  const selectSupplier = (row: GstSupplier) => {
    setSupplier(row);
    reset();
  };
  const updateLine = (key: string, part: Partial<Line>, taxEdit = false) => {
    setReviewed(false);
    setLines((rows) =>
      rows.map((l) =>
        l.key !== key
          ? l
          : {
              ...l,
              ...part,
              tax: part.tax ?? {
                ...l.tax,
                reviewed: taxEdit ? l.tax.reviewed : false,
              },
            },
      ),
    );
  };
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Record supplier invoice")}
          back={{ href: "/shop/purchases", label: text("Purchases") }}
          description={text(
            "Choose a supplier, enter the original invoice and confirm how each product affects stock.",
          )}
        />
        {action.notice}
        <ReadState query={pos}>
          {pos.data?.gstPurchasesAvailable !== true ? (
            <Card>
              {text("Purchase recording is unavailable on this server.")}
            </Card>
          ) : null}
        </ReadState>
        {retained.current ? (
          <Card>
            <p>
              {text(
                "An original invoice request is retained. Retry verifies that request; use recovery if its outcome remains uncertain.",
              )}
            </p>
            <Button href="/shop/settings/gst/recovery" tone="quiet">
              {text("Open recovery")}
            </Button>
          </Card>
        ) : null}
        <fieldset disabled={action.busy || !!retained.current}>
          <Section
            title={"1 · " + text("Choose supplier")}
            summary={supplier?.identity.name}
            open
          >
            <SupplierPicker value={supplier} onChange={selectSupplier} />
            <div className="form-grid is-2">
              <SelectField
                label={text("Supplier registration for this invoice")}
                value={registration}
                onChange={(v) =>
                  change(() => {
                    const r = v as PurchaseInput["supplierRegistration"];
                    setRegistration(r);
                    setDocumentType(
                      r === "regular"
                        ? "tax_invoice"
                        : r === "composition"
                          ? "bill_of_supply"
                          : "commercial_invoice",
                    );
                  })
                }
                options={[
                  ["regular", text("Regular GST")],
                  ["composition", text("Composition")],
                  ["unregistered", text("Not registered")],
                ]}
              />
              <SelectField
                label={text("Original supplier document type")}
                value={documentType}
                onChange={(v) =>
                  change(() =>
                    setDocumentType(v as PurchaseInput["documentType"]),
                  )
                }
                options={[
                  ["tax_invoice", text("Tax invoice")],
                  ["bill_of_supply", text("Bill of supply")],
                  ["commercial_invoice", text("Commercial invoice")],
                ]}
              />
            </div>
          </Section>
          <Section title={"2 · " + text("Invoice details")} open>
            <div className="form-grid is-2">
              <TextField
                label={text("Supplier invoice number")}
                value={invoiceNumber}
                onChange={(v) => change(() => setNumber(v))}
              />
              <TextField
                label={text("Invoice date")}
                type="date"
                value={invoiceDate}
                onChange={(v) => change(() => setDate(v))}
              />
              <SelectField
                label={text("Purchase price entry")}
                value={mode}
                onChange={(v) => change(() => setMode(v as typeof mode))}
                options={[
                  ["inclusive", text("GST included")],
                  ["exclusive", text("GST added")],
                ]}
              />
              <TextField
                label={text("Invoice discount (₹)")}
                value={discount}
                type="number"
                onChange={(v) => change(() => setDiscount(v))}
              />
              <TextField
                label={text("Original invoice total (₹)")}
                type="number"
                value={declared}
                onChange={(v) => change(() => setDeclared(v))}
              />
              <TextField
                label={text("Evidence reference")}
                value={reference}
                onChange={(v) => change(() => setReference(v))}
              />
            </div>
            <Section
              title={text("Shop recipient details")}
              summary={recipient.name}
            >
              <BuyerFields
                value={recipient}
                onChange={(v) => change(() => setRecipient(v))}
              />
            </Section>
            {supplier && supplier.identity.stateCode !== recipient.stateCode ? (
              <Check
                label={text(
                  "I have reviewed goods movement to the shop billing address.",
                )}
                checked={movement}
                onChange={(v) => change(() => setMovement(v))}
              />
            ) : null}
          </Section>
          <Section
            title={"3 · " + text("Products and stock")}
            summary={`${lines.length} ${text("products")}`}
            open
          >
            <ReadState query={catalog}>
              <SelectField
                label={text("Add product")}
                value=""
                onChange={(id) => {
                  const row = catalog.data?.find((r) => r.productId === id);
                  if (!row) return;
                  setReviewed(false);
                  setLines([
                    ...lines,
                    {
                      key: crypto.randomUUID(),
                      name: row.product.name,
                      productId: id,
                      quantity: 1,
                      price: row.product.purchasePrice ?? 0,
                      discount: 0,
                      tax: {
                        ...(row.product.gstConfig ?? emptyTax()),
                        reviewed: false,
                      },
                      receiveStock: false,
                      stockMode: "invoice_only",
                    },
                  ]);
                }}
                options={[
                  ["", text("Choose product")],
                  ...(catalog.data ?? []).map(
                    (r) => [r.productId, r.product.name] as const,
                  ),
                ]}
              />
            </ReadState>
            {lines.map((line) => (
              <Section
                key={line.key}
                title={line.name}
                summary={`${line.quantity} × ${formatINR(line.price)}`}
                open
              >
                <div className="form-grid is-2">
                  <TextField
                    label={text("Quantity")}
                    type="number"
                    value={String(line.quantity)}
                    onChange={(v) =>
                      updateLine(line.key, { quantity: Number(v), existingBatchId: undefined })
                    }
                  />
                  <TextField
                    label={text("Buying price (₹)")}
                    type="number"
                    value={String(line.price)}
                    onChange={(v) => updateLine(line.key, { price: Number(v) })}
                  />
                  <TextField
                    label={text("Line discount (₹)")}
                    type="number"
                    value={String(line.discount ?? 0)}
                    onChange={(v) =>
                      updateLine(line.key, { discount: Number(v) })
                    }
                  />
                  <SelectField
                    label={text("Stock action")}
                    value={line.stockMode}
                    onChange={(v) =>
                      updateLine(line.key, {
                        stockMode: v as Line["stockMode"],
                        receiveStock: v === "receive",
                        existingBatchId: undefined,
                      })
                    }
                    options={[
                      ["invoice_only", text("Record invoice only")],
                      ["receive", text("Receive new stock")],
                      ["link", text("Link existing stock batch")],
                    ]}
                  />
                </div>
                {line.stockMode === "link" ? (
                  <PurchaseBatchPicker
                    productId={line.productId}
                    quantity={Number(line.quantity)}
                    value={line.existingBatchId ?? ""}
                    onChange={(existingBatchId) =>
                      updateLine(line.key, {
                        existingBatchId: existingBatchId || undefined,
                      })
                    }
                  />
                ) : line.stockMode === "receive" ? (
                  <>
                    <TextField
                      label={text("Batch number (optional)")}
                      value={line.batchNumber ?? ""}
                      onChange={(v) =>
                        updateLine(line.key, { batchNumber: v || undefined })
                      }
                    />
                    <TextField
                      label={text("Expiry date (optional)")}
                      type="date"
                      value={line.expiryDate ?? ""}
                      onChange={(v) =>
                        updateLine(line.key, { expiryDate: v || undefined })
                      }
                    />
                  </>
                ) : null}
                <TaxFields
                  required
                  value={line.tax}
                  onChange={(v) =>
                    updateLine(line.key, { tax: v ?? emptyTax() }, true)
                  }
                />
                <Button
                  tone="danger"
                  onClick={() => {
                    setLines(lines.filter((l) => l.key !== line.key));
                    setReviewed(false);
                  }}
                >
                  {text("Remove product")}
                </Button>
              </Section>
            ))}
          </Section>
          <Card>
            {totals ? (
              <Stats
                items={[
                  { label: text("Before tax"), value: formatINR(totals.net) },
                  { label: text("GST"), value: formatINR(totals.tax) },
                  {
                    label: text("Invoice total"),
                    value: formatINR(totals.total),
                  },
                ]}
              />
            ) : null}
            <p className="shop-hint">
              {text(
                "The calculated total must match the original invoice. Confirm tax details again after editing prices or invoice details.",
              )}
            </p>
            <Notice error={validation} />
            <Check
              label={text(
                "I have reviewed the invoice, tax details and stock actions.",
              )}
              checked={reviewed}
              onChange={setReviewed}
            />
          </Card>
        </fieldset>
        <Button
          disabled={
            action.busy ||
            pos.data?.gstPurchasesAvailable !== true ||
            !supplier ||
            (!retained.current && (!reviewed || !totals))
          }
          onClick={() =>
            void action.run(async () => {
              const request = retained.current ?? {
                ...input,
                clientId: crypto.randomUUID(),
              };
              if (!retained.current)
                purchaseTotals(request, supplier!.identity);
              retained.current = request;
              const saved = await api.gst.createPurchase(shop!.id, request);
              retained.current = null;
              router.push("/shop/purchases/" + saved.invoice.id);
            })
          }
        >
          {text(action.busy ? "Recording invoice" : "Record supplier invoice")}
        </Button>
      </div>
    </GstAccess>
  );
}

function PurchaseBatchPicker({
  quantity,
  productId,
  value,
  onChange,
}: {
  productId: string;
  quantity: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const { api, shop, t } = useShop(),
    text = useGstText();
  const q = useGstQuery(["purchase-batches", productId], () =>
    api.getBatches(shop!.id, productId, true),
  );
  const batches = eligiblePurchaseReceipts(q.data ?? [], quantity);
  return (
    <ReadState query={q}>
      <p className="text-sm text-muted">{t("purchase.link_batch", EN_FALLBACK["purchase.link_batch"])}</p>
      <SelectField
        label={text("Existing stock batch")}
        value={value}
        onChange={onChange}
        options={[
          ["", text("Choose batch")],
          ...batches.map(
            (b) =>
              [
                b.id,
                `${b.batchNumber || b.id.slice(0, 8)} · ${b.initialQuantity} → ${b.quantity} · ${b.supplier ?? ""}`,
              ] as const,
          ),
        ]}
      />
      {q.isSuccess && !batches.length ? <p role="status" className="text-amber-400">{t("gst.ui.no_eligible_receipt_matches_this_quantity_record_a_receipt_a73a9f", EN_FALLBACK["gst.ui.no_eligible_receipt_matches_this_quantity_record_a_receipt_a73a9f"])}</p> : null}
    </ReadState>
  );
}
