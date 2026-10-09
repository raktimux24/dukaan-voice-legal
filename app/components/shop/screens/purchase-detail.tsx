"use client";
import { useRef, useState } from "react";
import { useShop } from "../context";
import { Button, Card, PageHeader, Pill } from "../ui";
import {
  Section,
  FiscalDateTimeField,
  TextField,
  SelectField,
  Check,
  Stats,
  useGstText,
  useFiscalDate,
} from "../gst-ui";
import {
  useGstQuery,
  useGstAction,
  ReadState,
  GstAccess,
} from "../gst-workspace";
import { formatINR } from "../../../lib/shop/money";
import { validateItcReview } from "../../../lib/shop/gst-core/purchase-gst";
import type {
  InputTaxReview,
  PurchaseSettlementInput,
  SettlementReversalInput,
  PurchaseReturnInput,
} from "../../../lib/shop/gst-types";
const initialConditions = {
  invoiceValid: false,
  goodsReceived: false,
  businessUse: false,
  portalMatched: false,
  supplierTaxConfirmed: false,
  returnFiled: false,
  withinTimeLimit: false,
};
const labels = {
  invoiceValid: "Valid invoice",
  goodsReceived: "Goods received",
  businessUse: "For business use",
  portalMatched: "Matched against portal records",
  supplierTaxConfirmed: "Supplier tax confirmed",
  returnFiled: "Required return filed",
  withinTimeLimit: "Within the permitted time limit",
};
export function PurchaseDetailScreen({ id }: { id: string }) {
  const { api, shop } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const q = useGstQuery(["purchase", id], () => api.gst.purchase(shop!.id, id));
  const [decision, setDecision] =
      useState<InputTaxReview["decision"]>("deferred"),
    [conditions, setConditions] = useState(initialConditions),
    [note, setNote] = useState(""),
    [reference, setReference] = useState(""),
    [amount, setAmount] = useState(""),
    [method, setMethod] = useState<PurchaseSettlementInput["method"]>("cash"),
    [kind, setKind] = useState<PurchaseSettlementInput["kind"]>("payment"),
    [when, setWhen] = useState(new Date().toISOString()),
    [settlementNote, setSettlementNote] = useState(""),
    [settlementReference, setSettlementReference] = useState(""),
    [reverseId, setReverseId] = useState(""),
    [reverseDate, setReverseDate] = useState(new Date().toISOString()),
    [reverseNote, setReverseNote] = useState(""),
    [reverseReference, setReverseReference] = useState(""),
    [creditNumber, setCreditNumber] = useState(""),
    [creditDate, setCreditDate] = useState(new Date().toISOString()),
    [creditReference, setCreditReference] = useState(""),
    [reason, setReason] = useState(""),
    [quantities, setQuantities] = useState<Record<string, string>>({}),
    [stock, setStock] = useState<Record<string, boolean>>({});
  const retained = useRef<{
    operation: string;
    input:
      | InputTaxReview
      | PurchaseSettlementInput
      | SettlementReversalInput
      | PurchaseReturnInput;
  } | null>(null);
  const preview = useGstQuery(["cost-preview", id, decision], () =>
    api.gst.costPreview(shop!.id, id, decision),
  );
  const detail = q.data;
  const reversalEntry = detail?.settlements.find((entry) => entry.id === reverseId);
  async function mutate(
    operation: string,
    input: NonNullable<typeof retained.current>["input"],
  ) {
    if (!retained.current && operation !== "review") {
      if (operation === "reversal" && "settlementId" in input &&
          (!detail?.settlements.some((entry) => entry.id === input.settlementId && !entry.reversesId) ||
           detail.settlements.some((entry) => entry.reversesId === input.settlementId))) {
        throw Error(text("The original entry is unavailable. Refresh this invoice. A saved correction can still be retried."));
      }
      const at =
        "occurredAt" in input
          ? input.occurredAt
          : "issuedAt" in input
            ? input.issuedAt
            : "";
      if (
        !Number.isFinite(Date.parse(at)) ||
        Date.parse(at) < Date.parse(
          operation === "reversal" && "settlementId" in input
            ? detail?.settlements.find((entry) => entry.id === input.settlementId)?.occurredAt ?? ""
            : detail?.issuedAt ?? "",
        ) ||
        Date.parse(at) > Date.now()
      )
        throw Error(
          text("Choose a date between the original invoice and today."),
        );
      if (
        "amount" in input &&
        (!/^\d+(\.\d{1,2})?$/.test(input.amount) ||
          Number(input.amount) <= 0 ||
          Number(input.amount) >
            Number(
              input.kind === "payment"
                ? detail?.settlement.outstanding
                : detail?.settlement.recoverable,
            ))
      )
        throw Error(text("The amount exceeds the available supplier balance."));
    }
    const saved = retained.current ?? { operation, input };
    retained.current = saved;
    if (saved.operation === "review")
      await api.gst.reviewItc(shop!.id, id, saved.input as InputTaxReview);
    else if (saved.operation === "return")
      await api.gst.returnPurchase(
        shop!.id,
        id,
        saved.input as PurchaseReturnInput,
      );
    else if (saved.operation === "reversal")
      await api.gst.reverseSettlement(
        shop!.id,
        id,
        saved.input as SettlementReversalInput,
      );
    else
      await api.gst.settle(
        shop!.id,
        id,
        saved.input as PurchaseSettlementInput,
      );
    retained.current = null;
    if (saved.operation === "settlement") {
      setAmount("");
      setSettlementNote("");
      setSettlementReference("");
      setWhen(new Date().toISOString());
    } else if (saved.operation === "reversal") {
      setReverseId("");
      setReverseNote("");
      setReverseReference("");
    } else if (saved.operation === "return") {
      setCreditNumber("");
      setCreditReference("");
      setReason("");
      setQuantities({});
      setStock({});
      setCreditDate(new Date().toISOString());
    }
    await q.refetch();
    await preview.refetch();
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={
            detail
              ? `${text("Supplier invoice")} ${detail.snapshot.invoiceNumber}`
              : text("Supplier invoice")
          }
          back={{ href: "/shop/purchases", label: text("Purchases") }}
        />
        {action.notice}
        {retained.current ? (
          <Card>
            <p>
              {text(
                "A saved request needs confirmation. Retry keeps its original amounts and identity.",
              )}
            </p>
            <Button
              disabled={action.busy}
              onClick={() =>
                void action.run(() =>
                  mutate(retained.current!.operation, retained.current!.input),
                )
              }
            >
              {text("Retry saved request")}
            </Button>
          </Card>
        ) : null}
        <ReadState query={q}>
          {detail ? (
            <>
              <Stats
                items={[
                  {
                    label: text("Invoice total"),
                    value: formatINR(Number(detail.grossAmount)),
                  },
                  {
                    label: text("Purchase tax"),
                    value: formatINR(Number(detail.taxAmount)),
                  },
                  {
                    label: text("Outstanding"),
                    value: formatINR(Number(detail.settlement.outstanding)),
                  },
                  {
                    label: text("Recoverable"),
                    value: formatINR(Number(detail.settlement.recoverable)),
                  },
                ]}
              />
              <Card>
                <h2 className="shop-section-title">
                  {detail.snapshot.supplier.name}
                </h2>
                <p>
                  {text(
                    (
                      {
                        regular: "Regular GST",
                        composition: "Composition",
                        unregistered: "Not registered",
                      } as const
                    )[detail.snapshot.supplierRegistration] ??
                      "Original registration not recorded",
                  )}{" "}
                  ·{" "}
                  {text(
                    (
                      {
                        tax_invoice: "Tax invoice",
                        bill_of_supply: "Bill of supply",
                        commercial_invoice:
                          "Commercial invoice from unregistered supplier",
                      } as const
                    )[detail.snapshot.documentType] ??
                      "Original registration not recorded",
                  )}
                </p>
                <p>
                  {detail.snapshot.supplier.gstin || text("Not registered")}
                </p>
                <p>{detail.snapshot.supplier.address}</p>
                <p>{date(detail.issuedAt)}</p>
                <p className="shop-hint">
                  {text("Evidence reference")}:{" "}
                  {detail.snapshot.evidenceReference}
                </p>
                <div className="gst-table-wrap">
                  <table className="gst-table">
                    <thead>
                      <tr>
                        <th>{text("Product")}</th>
                        <th>{text("Quantity")}</th>
                        <th>{text("Tax")}</th>
                        <th>{text("Total")}</th>
                        <th>{text("Stock action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            {item.quantity} {item.unit}
                          </td>
                          <td>{formatINR(Number(item.taxAmount))}</td>
                          <td>{formatINR(Number(item.grossAmount))}</td>
                          <td>
                            {text(
                              detail.snapshot.stockActions?.find(
                                (a) => a.purchaseItemId === item.id,
                              )?.action ??
                                (item.batchId
                                  ? "Linked stock"
                                  : "Invoice only"),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Section title={text("Invoice details")}>
                <div className="gst-row">
                  <span>{text("Net value")}</span>
                  <b>{formatINR(detail.snapshot.totals.net)}</b>
                </div>
                {(["cgst", "sgst", "utgst", "igst"] as const)
                  .filter((kind) => detail.snapshot.totals[kind] !== 0)
                  .map((kind) => (
                    <div className="gst-row" key={kind}>
                      <span>{kind.toUpperCase()}</span>
                      <b>{formatINR(detail.snapshot.totals[kind])}</b>
                    </div>
                  ))}
                <div className="gst-row">
                  <span>{text("State code (for example, 29)")}</span>
                  <b>{detail.snapshot.supplier.stateCode}</b>
                </div>
                {detail.snapshot.goodsMovement ? (
                  <>
                    <div className="gst-row">
                      <span>{text("Reviewed delivery address")}</span>
                      <b>{detail.snapshot.goodsMovement.deliveryAddress}</b>
                    </div>
                    <div className="gst-row">
                      <span>{text("Destination state")}</span>
                      <b>
                        {detail.snapshot.goodsMovement.destinationStateCode}
                      </b>
                    </div>
                  </>
                ) : null}
                {(["supplier", "recipient"] as const).map((role) => {
                  const party = detail.snapshot[role];
                  return (
                    <div key={role} className="grid gap-2">
                      <h3 className="shop-section-title">
                        {text(
                          role === "supplier"
                            ? "Choose supplier"
                            : "Your shop’s invoice identity",
                        )}
                      </h3>
                      <p>{party.name}</p>
                      {party.gstin ? <p>{party.gstin}</p> : null}
                      <p>{party.address}</p>
                      <div className="gst-row">
                        <span>{text("State code (for example, 29)")}</span>
                        <b>{party.stateCode}</b>
                      </div>
                      {party.structuredAddress ? (
                        <>
                          {[
                            [
                              "Address line 1",
                              party.structuredAddress.address1,
                            ],
                            [
                              "Address line 2 (optional)",
                              party.structuredAddress.address2,
                            ],
                            [
                              "Locality / city",
                              party.structuredAddress.location,
                            ],
                            [
                              "Six-digit pincode",
                              party.structuredAddress.pincode,
                            ],
                          ]
                            .filter(([, value]) => value)
                            .map(([label, value]) => (
                              <div className="gst-row" key={label}>
                                <span>{text(label!)}</span>
                                <b>{value}</b>
                              </div>
                            ))}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </Section>
              <fieldset disabled={action.busy || !!retained.current}>
                <Section
                  title={text("Review input tax")}
                  summary={text(detail.reviews[0]?.decision ?? "Not reviewed")}
                >
                  <p className="shop-hint">
                    {text(
                      "This records your eligibility review. It does not claim or file input tax credit.",
                    )}
                  </p>
                  <p className="shop-hint">
                    {text(
                      "Only regular GST recipients purchasing from regular GST suppliers can record eligibility. These are your confirmations; the app does not check the GST portal or supplier payments. This decision does not claim ITC or file a return.",
                    )}
                  </p>
                  <p className="shop-hint">
                    {text(
                      "Changing eligibility recalculates acquisition costs for remaining stock and consumed quantities. Review the tax movement and retained cost history before saving.",
                    )}
                  </p>
                  <SelectField
                    label={text("Decision")}
                    value={decision}
                    onChange={(v) => setDecision(v as typeof decision)}
                    options={[
                      ["deferred", text("Review later")],
                      ...(detail.recipientRegistration === "regular" &&
                      detail.snapshot.supplierRegistration === "regular"
                        ? [
                            [
                              "reviewed_eligible",
                              text("Reviewed eligible"),
                            ] as const,
                          ]
                        : []),
                      ["ineligible", text("Ineligible")],
                    ]}
                  />
                  {Object.entries(labels).map(([key, label]) => (
                    <Check
                      key={key}
                      label={text(label)}
                      checked={conditions[key as keyof typeof conditions]}
                      onChange={(v) =>
                        setConditions({ ...conditions, [key]: v })
                      }
                    />
                  ))}
                  <TextField
                    label={text("Review note")}
                    value={note}
                    onChange={setNote}
                  />
                  <TextField
                    label={text("Evidence reference")}
                    value={reference}
                    onChange={setReference}
                  />
                  <ReadState query={preview}>
                    {preview.data?.changes.map((row, i) => (
                      <div className="gst-row" key={i}>
                        <b>{row.name}</b>
                        <span>
                          {formatINR(Number(row.previousUnitCost))} →{" "}
                          {formatINR(Number(row.newUnitCost))}
                        </span>
                        <small>
                          {text("Inventory cost change")}:{" "}
                          {row.inventoryAdjustment} ·{" "}
                          {text("Consumed cost change")}:{" "}
                          {row.consumedAdjustment}
                        </small>
                      </div>
                    ))}
                  </ReadState>
                  <Button
                    disabled={
                      action.busy ||
                      !preview.isSuccess ||
                      preview.isFetching ||
                      !note.trim() ||
                      !reference.trim()
                    }
                    onClick={() =>
                      void action.run(async () => {
                        validateItcReview(
                          decision,
                          conditions,
                          detail.recipientRegistration,
                          detail.snapshot.supplier.gstin,
                          note,
                          reference,
                          detail.snapshot.supplierRegistration,
                        );
                        await mutate("review", {
                          clientId: crypto.randomUUID(),
                          decision,
                          conditions,
                          note,
                          evidenceReference: reference,
                        });
                      })
                    }
                  >
                    {text("Save input-tax review")}
                  </Button>
                </Section>
                <Section
                  title={text("Supplier payments and refunds")}
                  summary={text(({
                    payable: "Still owed to supplier",
                    supplier_owes: "Recoverable from supplier",
                    settled: "All settled",
                  } as Record<string, string>)[detail.settlement.status] ?? "Unavailable")}
                >
                  <p className="shop-hint">{text("This records a payment made outside the app. It does not transfer money.")}</p>
                  <div className="form-grid is-2">
                    <SelectField
                      label={text("Entry type")}
                      value={kind}
                      onChange={(v) => setKind(v as typeof kind)}
                      options={[
                        ["payment", text("Payment to supplier")],
                        ["supplier_refund", text("Refund from supplier")],
                      ]}
                    />
                    <SelectField
                      label={text("Payment method")}
                      value={method}
                      onChange={(v) => setMethod(v as typeof method)}
                      options={[
                        ["cash", text("Cash")],
                        ["upi", "UPI"],
                        ["bank", text("Bank")],
                        ["card", text("Card")],
                      ]}
                    />
                    <TextField
                      label={text("Amount (₹)")}
                      type="number"
                      value={amount}
                      onChange={setAmount}
                    />
                    <FiscalDateTimeField
                      label={text("Payment date and time")}
                      value={when}
                      onChange={setWhen}
                    />
                    <TextField
                      label={text("Evidence reference")}
                      value={settlementReference}
                      onChange={setSettlementReference}
                    />
                    <TextField
                      label={text("Note")}
                      value={settlementNote}
                      onChange={setSettlementNote}
                    />
                  </div>
                  <Button
                    disabled={
                      action.busy ||
                      !(Number(amount) > 0) ||
                      !settlementReference.trim() ||
                      !settlementNote.trim()
                    }
                    onClick={() =>
                      void action.run(() =>
                        mutate("settlement", {
                          clientId: crypto.randomUUID(),
                          kind,
                          amount,
                          method,
                          occurredAt: when,
                          evidenceReference: settlementReference,
                          note: settlementNote,
                        }),
                      )
                    }
                  >
                    {text("Record payment or refund")}
                  </Button>
                  {detail.settlements.map((entry) => (
                    <div key={entry.id} className="gst-row">
                      <b>
                        {text(({
                          payment: "Payment to supplier",
                          supplier_refund: "Refund received from supplier",
                          payment_reversal: "Payment entry reversed",
                          supplier_refund_reversal: "Refund entry reversed",
                        } as Record<string, string>)[entry.kind] ?? entry.kind)} · {formatINR(Number(entry.amount))} · {text(({
                          cash: "Cash", upi: "UPI", bank: "Bank transfer", card: "Card",
                        } as Record<string, string>)[entry.method] ?? "Unavailable")}
                      </b>
                      <span>{date(entry.occurredAt)}</span>
                      <small>{entry.evidenceReference}</small>
                      {!entry.reversesId &&
                      !detail.settlements.some(
                        (r) => r.reversesId === entry.id,
                      ) ? (
                        <Button
                          tone="danger"
                          disabled={action.busy}
                          onClick={() => {
                            setReverseId(entry.id);
                            setReverseDate(new Date().toISOString());
                            setReverseNote("");
                            setReverseReference("");
                          }}
                        >
                          {text("Correct entry")}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  {reversalEntry ? (
                    <Card className="stack-form">
                      <p>{text("Use only to correct an incorrectly recorded payment or refund. The original entry is retained. This does not transfer money or change tax. Add a reason and evidence; correct dependent refund entries before reversing their payment.")}</p>
                      <p>{formatINR(Number(reversalEntry.amount))} · {date(reversalEntry.occurredAt)} · {reversalEntry.evidenceReference}</p>
                      <FiscalDateTimeField label={text("Payment date and time")} value={reverseDate} onChange={setReverseDate} />
                      <TextField label={text("Reason")} value={reverseNote} onChange={setReverseNote} />
                      <TextField label={text("Evidence reference")} value={reverseReference} onChange={setReverseReference} />
                      <Button disabled={action.busy || !reverseNote.trim() || !reverseReference.trim()} onClick={() => void action.run(() => mutate("reversal", {
                        clientId: crypto.randomUUID(), settlementId: reversalEntry.id,
                        occurredAt: reverseDate, evidenceReference: reverseReference, note: reverseNote,
                      }))}>{text("Confirm entry reversal")}</Button>
                    </Card>
                  ) : null}
                </Section>
                <Section title={text("Supplier credit and return")}>
                  <p className="shop-hint">
                    {text(
                      "Enter the supplier credit document and returned quantities. Remove stock only when the goods leave your shop.",
                    )}
                  </p>
                  <TextField
                    label={text("Supplier credit number")}
                    value={creditNumber}
                    onChange={setCreditNumber}
                  />
                  <FiscalDateTimeField
                    label={text("Credit date and time")}
                    value={creditDate}
                    onChange={setCreditDate}
                  />
                  <TextField
                    label={text("Reason")}
                    value={reason}
                    onChange={setReason}
                  />
                  <TextField
                    label={text("Evidence reference")}
                    value={creditReference}
                    onChange={setCreditReference}
                  />
                  {detail.items.map((item) => {
                    const returned = detail.returnItems
                      .filter((r) => r.purchaseItemId === item.id)
                      .reduce((sum, r) => sum + Number(r.quantity), 0);
                    if (Number(item.quantity) - returned <= 0) return null;
                    return (
                      <div key={item.id} className="gst-row">
                        <TextField
                          label={`${item.name} · ${text("Remaining")} ${Number(item.quantity) - returned}`}
                          type="number"
                          value={quantities[item.id] ?? ""}
                          onChange={(v) =>
                            setQuantities({ ...quantities, [item.id]: v })
                          }
                        />
                        {item.batchId ? <Check
                          label={text("Remove this quantity from stock")}
                          checked={stock[item.id] ?? true}
                          onChange={(v) => setStock({ ...stock, [item.id]: v })}
                        /> : null}
                      </div>
                    );
                  })}
                  <Button
                    disabled={
                      action.busy ||
                      !creditNumber.trim() ||
                      !reason.trim() ||
                      !creditReference.trim()
                    }
                    onClick={() =>
                      void action.run(async () => {
                        if (!/^[A-Za-z0-9/-]{1,16}$/.test(creditNumber))
                          throw Error(text("Check the supplier credit number, date, reason and reference."));
                        const items = detail.items
                          .filter((i) => quantities[i.id]?.trim())
                          .map((i) => ({
                            purchaseItemId: i.id,
                            quantity: Number(quantities[i.id]),
                            removeStock: !!i.batchId && (stock[i.id] ?? true),
                          }));
                        if (!items.length)
                          throw Error(text("Choose quantities to return."));
                        for (const item of items) {
                          const original = detail.items.find(
                            (i) => i.id === item.purchaseItemId,
                          )!;
                          const returned = detail.returnItems
                            .filter(
                              (r) => r.purchaseItemId === item.purchaseItemId,
                            )
                            .reduce((n, r) => n + Number(r.quantity), 0);
                          if (
                            !Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity >
                            Number(original.quantity) - returned
                          )
                            throw Error(
                              text(
                                "The return exceeds the remaining invoice quantity.",
                              ),
                            );
                        }
                        await mutate("return", {
                          clientId: crypto.randomUUID(),
                          supplierCreditNumber: creditNumber,
                          issuedAt: creditDate,
                          evidenceReference: creditReference,
                          reason,
                          items,
                        });
                      })
                    }
                  >
                    {text("Record supplier credit")}
                  </Button>
                </Section>
              </fieldset>
              <Section title={text("Review and adjustment history")}>
                {detail.reviews.map((row) => (
                  <div key={row.id} className="gst-row">
                    <b>{text(row.decision)}</b>
                    <span>{date(row.createdAt)}</span>
                    <p>
                      {row.note} · {row.evidenceReference}
                    </p>
                  </div>
                ))}
                {detail.returns.map((row) => (
                  <div key={row.id} className="gst-row">
                    <b>
                      {row.supplierCreditNumber} ·{" "}
                      {formatINR(Number(row.grossAmount))}
                    </b>
                    <p>{row.reason}</p>
                  </div>
                ))}
              </Section>
            </>
          ) : null}
        </ReadState>
      </div>
    </GstAccess>
  );
}
