"use client";
import { eligiblePurchaseReceipts } from "../../../lib/shop/gst-core/purchase-batch-link";
import { ProductFormScreen } from "./product-form";
import { purchaseReviewSignature } from "../../../lib/shop/gst-core/purchase-review-draft";
import {
  purchaseDraftTax,
  purchaseDraftHasPrice,
  purchaseLineForRequest,
  type PurchaseDraftLine,
} from "../../../lib/shop/purchase-draft";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, Notice, PageHeader, StepRail } from "../ui";
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
type Line = PurchaseDraftLine;
export function PurchaseNewScreen() {
  const { api, shop, perms, t:poText } = useShop(),
    text = useGstText(),
    router = useRouter(),
    action = useGstAction();
  const poParams=useSearchParams(),poOrderId=poParams.get('poOrderId'),poReceiptId=poParams.get('poReceiptId');
  const requestedSupplierId = poParams.get("supplierId") ?? "";
  const poSource=useGstQuery(['poInvoiceSource',poOrderId,poReceiptId],()=>api.purchaseOrders.invoice(shop!.id,poOrderId!,poReceiptId!),!!poOrderId&&!!poReceiptId);
  const requestedSupplier = useGstQuery(["purchase-supplier", requestedSupplierId],
    () => api.gst.supplier(shop!.id, requestedSupplierId), !!requestedSupplierId);
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
    [reviewSignature, setReviewSignature] = useState<string | null>(null),
    [ordinarySupply, setOrdinarySupply] = useState(false),
    [addingProduct, setAddingProduct] = useState(false),
    [movementSignature, setMovementSignature] = useState<string | null>(null),
    [step, setStep] = useState<1 | 2 | 3>(poReceiptId ? 2 : 1),
    [stepNote, setStepNote] = useState("");
  const poLoaded=useRef(false);
  useEffect(()=>{if(poSource.data&&!poLoaded.current){poLoaded.current=true;setMode("inclusive");setLines(poSource.data.lines.map(l=>({key:crypto.randomUUID(),name:l.name,trackStock:true,productId:l.productId,quantity:Number(l.quantity),price:Number(l.price),priceText:l.price,discount:0,tax:{...((l.gstConfig as any)??emptyTax()),reviewed:false},receiveStock:false,existingBatchId:l.batchId,stockMode:'link' as const}))) }},[poSource.data]);
  const retained = useRef<PurchaseInput | null>(null);
  const supplierPrefilled = useRef(false);
  useEffect(() => {
    if (!supplierPrefilled.current && requestedSupplier.data) {
      supplierPrefilled.current = true;
      setSupplier(current => current ?? requestedSupplier.data!);
    }
  }, [requestedSupplier.data]);
  const settings = pos.data?.gstSettings;
  const recipient = recipientDraft ?? {
    ...emptyBuyer(),
    name: settings?.legalName || shop?.name || "",
    gstin: settings?.gstin || "",
    stateCode: settings?.stateCode || "",
    address: settings?.address || pos.data?.shopAddress || "",
    structuredAddress: settings?.structuredAddress,
  };
  const movementContext = purchaseReviewSignature({
    supplierId: supplier?.id,
    supplierRegistration: registration,
    placeOfSupply: recipient.stateCode,
    recipientAddress: recipient.address,
  });
  const movement = movementSignature === movementContext;
  const setMovement = (value: boolean) =>
    setMovementSignature(value ? movementContext : null);
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
  const taxContext = purchaseReviewSignature({
    supplierId: supplier?.id,
    supplierIdentity: supplier?.identity,
    supplierRegistration: registration,
    documentType,
    invoiceNumber:invoiceNumber.trim(),
    invoiceDate,
    priceMode: mode,
    discount,
    declared,
    reference,
    recipient,
    ordinarySupply,
    movement,
  });
  const input: PurchaseInput = {
    ...(poOrderId&&poReceiptId?{poReceipt:{orderId:poOrderId,receiptId:poReceiptId}}:{}),
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
    invoiceNumber:invoiceNumber.trim(),
    invoiceDate,
    priceMode: mode,
    placeOfSupply: recipient.stateCode,
    discount: Number(discount),
    declaredTotal: Number(declared),
    recipient,
    lines: lines.map((line) => purchaseLineForRequest(line, taxContext)),
    evidenceReference: reference,
    reviewed: false,
  };
  const invoiceSignature = purchaseReviewSignature({
    ...input,
    clientId: undefined,
    reviewed: undefined,
    supplierIdentity: supplier?.identity,
  });
  const reviewed = reviewSignature === invoiceSignature;
  input.reviewed = reviewed;
  const setReviewed = (value: boolean) =>
    setReviewSignature(value ? invoiceSignature : null);
  let totals: ReturnType<typeof purchaseTotals> | undefined,
    validation: unknown;
  try {
    if(poReceiptId&&!poSource.data?.lines.length)throw Error(poText('po.invoice_unavailable','Linked receipt is unavailable or already invoiced.'));
    if (lines.some((line) => !purchaseDraftHasPrice(line)))
      throw Error(text(EN_FALLBACK["purchase.required"]));
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
    if(poReceiptId){delete part.quantity;delete part.receiveStock;delete part.existingBatchId;delete part.stockMode;}
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
          back={step > 1 ? { href: "/shop/purchases", label: text("Back"), onClick: () => { setStepNote(""); setStep((current) => (current === 3 ? 2 : 1)); } } : { href: "/shop/purchases", label: text("Purchases") }}
          description={text(
            "Choose a supplier, enter the original invoice and confirm how each product affects stock.",
          )}
        />
        <StepRail current={step - 1} labels={[poText("shopux.step_supplier", "Supplier"), poText("shopux.step_invoice", "Invoice"), poText("shopux.step_products", "Products")]} />
        {stepNote ? <Notice error={new Error(stepNote)} /> : null}
        {poReceiptId?<Card><p>{poText('po.invoice_help','These goods are already in stock. Review the supplier invoice prices and tax details.')}</p></Card>:null}
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
        {addingProduct ? (
          <Card>
            <ProductFormScreen
              onCancel={() => setAddingProduct(false)}
              onCreated={async () => {
                setAddingProduct(false);
                await catalog.refetch();
              }}
            />
          </Card>
        ) : null}
        <fieldset disabled={action.busy || !!retained.current || addingProduct}>
          {step === 1 ? <Section
            title={"1 · " + text("Choose supplier")}
            summary={supplier?.identity.name}
            open
          >
            {poReceiptId?<p>{supplier?.identity.name}</p>:<SupplierPicker value={supplier} onChange={selectSupplier} />}
            {requestedSupplierId && requestedSupplier.isError ? <Notice error={requestedSupplier.error} /> : null}
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
          </Section> : null}
          {step === 2 ? <Section title={"2 · " + text("Invoice details")} open>
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
            <Check
              label={text(EN_FALLBACK["purchase.ordinary_supply"])}
              checked={ordinarySupply}
              onChange={(value) => change(() => setOrdinarySupply(value))}
            />
          </Section> : null}
          {step === 3 ? <><Section
            title={"3 · " + text("Products and stock")}
            summary={`${lines.length} ${text("products")}`}
            open
          >
            <ReadState query={catalog}>
              <Button tone="quiet" disabled={!!poReceiptId} onClick={() => setAddingProduct(true)}>
                {text(
                  EN_FALLBACK[
                    "gst.ui.add_a_missing_product_then_return_to_this_invoice_92fbf4"
                  ],
                )}
              </Button>
              <SelectField
                label={text("Add product")}
                disabled={!!poReceiptId||lines.length >= 100}
                value=""
                onChange={(id) => {
                  const row = catalog.data?.find((r) => r.productId === id);
                  if (!row || lines.length >= 100) return;
                  setReviewed(false);
                  setLines([
                    ...lines,
                    {
                      key: crypto.randomUUID(),
                      name: row.product.name,
                      trackStock: row.product.trackStock !== false,
                      productId: id,
                      quantity: 1,
                      price: row.product.purchasePrice ?? 0,
                      priceText:
                        row.product.purchasePrice == null
                          ? ""
                          : String(row.product.purchasePrice),
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
                    disabled={!!poReceiptId}
                    value={String(line.quantity)}
                    onChange={(v) =>
                      updateLine(line.key, {
                        quantity: Number(v),
                        existingBatchId: undefined,
                      })
                    }
                  />
                  <TextField
                    label={text("Buying price (₹)")}
                    type="number"
                    value={line.priceText ?? String(line.price)}
                    onChange={(v) =>
                      updateLine(line.key, { price: Number(v), priceText: v })
                    }
                  />
                  <TextField
                    label={text("Line discount (₹)")}
                    type="number"
                    value={String(line.discount ?? 0)}
                    onChange={(v) =>
                      updateLine(line.key, { discount: Number(v) })
                    }
                  />
                  {line.trackStock ? (
                    <SelectField
                      label={text("Stock action")}
                      disabled={!!poReceiptId}
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
                  ) : (
                    <p className="shop-hint">{text("Record invoice only")}</p>
                  )}
                </div>
                {line.stockMode === "link" && !poReceiptId ? (
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
                  value={purchaseDraftTax(line, taxContext)}
                  onChange={(v) =>
                    updateLine(
                      line.key,
                      { tax: v ?? emptyTax(), taxReviewContext: taxContext },
                      true,
                    )
                  }
                />
                <Button
                  tone="danger"
                  disabled={!!poReceiptId}
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
          <Card className="purchase-confirmation">
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
          </Card></> : null}
        </fieldset>
        <div className="shop-actions">
        {step < 3 ? <Button onClick={() => {
          if (step === 1 && !supplier) { setStepNote(poText("shopux.supplier_need", "Choose a supplier before continuing.")); return; }
          if (step === 2 && (!invoiceNumber.trim() || !invoiceDate || !declared.trim())) { setStepNote(poText("shopux.invoice_need", "Enter the invoice number, date and total before continuing.")); return; }
          setStepNote("");
          setStep((current) => (current === 1 ? 2 : 3));
        }}>{poText("shopux.continue", "Continue")}</Button> : <Button
          disabled={
            action.busy ||
            addingProduct ||
            pos.data?.gstPurchasesAvailable !== true ||
            !supplier ||
            (!retained.current &&
              (!declared.trim() || !ordinarySupply || !reviewed || !totals))
          }
          onClick={() =>
            void action.run(async () => {
              const request = retained.current ?? {
                ...input,
                clientId: crypto.randomUUID(),
              };
              if (!retained.current) {
                if (!ordinarySupply)
                  throw Error(
                    text(
                      EN_FALLBACK["gst.error.purchase_supply_not_supported"],
                    ),
                  );
                if (!declared.trim())
                  throw Error(text(EN_FALLBACK["purchase.required"]));
                if(poReceiptId&&!poSource.data?.lines.length)throw Error(poText('po.invoice_unavailable','Linked receipt is unavailable or already invoiced.'));
    if (lines.some((line) => !purchaseDraftHasPrice(line)))
                  throw Error(text(EN_FALLBACK["purchase.required"]));
                purchaseTotals(request, supplier!.identity);
              }
              retained.current = request;
              const saved = await api.gst.createPurchase(shop!.id, request);
              retained.current = null;
              router.push("/shop/purchases/" + saved.invoice.id);
            })
          }
        >
          {text(action.busy ? "Recording invoice" : "Record supplier invoice")}
        </Button>}
        {step > 1 ? <Button tone="ghost" onClick={() => { setStepNote(""); setStep((current) => (current === 3 ? 2 : 1)); }}>{text("Back")}</Button> : null}
        </div>
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
      <p className="text-sm text-muted">
        {t("purchase.link_batch", EN_FALLBACK["purchase.link_batch"])}
      </p>
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
      {q.isSuccess && !batches.length ? (
        <p role="status" className="text-amber-400">
          {t(
            "gst.ui.no_eligible_receipt_matches_this_quantity_record_a_receipt_a73a9f",
            EN_FALLBACK[
              "gst.ui.no_eligible_receipt_matches_this_quantity_record_a_receipt_a73a9f"
            ],
          )}
        </p>
      ) : null}
    </ReadState>
  );
}
