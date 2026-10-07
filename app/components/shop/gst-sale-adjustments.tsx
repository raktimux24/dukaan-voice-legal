"use client";
import { useState, useRef } from "react";
import { useShop } from "./context";
import { Button, Card, Pill } from "./ui";
import {
  Section,
  TextField,
  SelectField,
  Check,
  Stats,
  useGstText,
} from "./gst-ui";
import { useGstQuery, useGstAction, ReadState } from "./gst-workspace";
import {specialReturnPreview,verifiedReturnDocuments} from "../../lib/shop/gst-return-preview";
import { returnTax } from "../../lib/shop/gst-core/gst";
import type { Sale } from "../../lib/shop/types";
import { formatINR } from "../../lib/shop/money";
export function GstSaleAdjustments({ sale }: { sale: Sale }) {
  const { api, shop, perms } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const [kind, setKind] = useState("return"),
    [quantities, setQuantities] = useState<Record<string, string>>({}),
    [prices, setPrices] = useState<Record<string, string>>({}),
    [restock, setRestock] = useState(false),
    [reason, setReason] = useState(""),
    [credit, setCredit] = useState("0"),
    [method, setMethod] = useState("cash"),
    [reference, setReference] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [preview, setPreview] = useState<number | null>(null),
    [debitId, setDebitId] = useState<string | null>(null);
  const retained = useRef<(() => Promise<unknown>) | null>(null);
  const capacity = useGstQuery(
    ["return-capacity", sale.id],
    () => api.gst.returnCapacity(shop!.id, sale.id),
    perms.canVoidOrReturn,
  );
  const balance = useGstQuery(
    ["debit-balance", debitId],
    () => api.gst.debitBalance(shop!.id, debitId!),
    !!debitId,
  );
  const special=!!sale.mixedGstSnapshot||!!sale.roundingEvidence;
  const documents=useGstQuery(["return-documents",sale.id],async()=>verifiedReturnDocuments(shop!.id,sale.id,await api.gst.fiscalDocuments(shop!.id,sale.id)),special&&perms.canVoidOrReturn);
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID());
  const mode = sale.gstSnapshot?.context.priceMode ?? sale.mixedGstSnapshot?.context.priceMode ?? "inclusive";
  const reset = () => {
    setConfirmed(false);
    setPreview(null);
    setRequestId(crypto.randomUUID());
  };
  const items = sale.items.filter((i) => Number(quantities[i.id]) > 0);
  let returnTotal = 0;
  let specialPlan:ReturnType<typeof specialReturnPreview>=null;
  let returnError:unknown=null;
  try {
    if(special){
      if(!documents.data||capacity.data?.status!=='ready')throw Error('Loading verified return evidence.');
      specialPlan=specialReturnPreview(sale,documents.data,quantities,requestId,capacity.data.unpaidCredit);
      returnTotal=specialPlan?.total??0;
    }else for (const item of items) {
      if (!item.taxSnapshot) throw Error("Missing retained tax profile");
      const basis = item.returnTaxBasis;
      const tax = basis?.tax ?? item.taxSnapshot;
      returnTotal += returnTax(
        tax,
        basis?.quantity ?? item.quantity,
        basis ? 0 : item.returnedQuantity,
        Number(quantities[item.id]),
      ).total;
    }
    returnTotal = Math.round(returnTotal * 100) / 100;
  } catch(e) {
    returnError=e;
    returnTotal = NaN;
  }
  async function submit() {
    if (retained.current) {
      await retained.current();
      retained.current = null;
      return;
    }
    if (
      kind !== "return" &&
      items.some(
        (i) =>
          !/^\d+(\.\d{1,2})?$/.test(prices[i.id] ?? "") ||
          Number(prices[i.id]) <= 0,
      )
    )
      throw Error(
        text(
          "Enter a positive value correction with up to two decimal places.",
        ),
      );
    const total = kind === "return" ? returnTotal : preview;
    if (
      kind !== "debit" &&
      (!/^\d+(\.\d{1,2})?$/.test(credit) ||
        (specialPlan?.creditReduction??Number(credit)) < 0 ||
        total == null ||
        (specialPlan?.creditReduction??Number(credit)) > total ||
        (specialPlan?.creditReduction??Number(credit)) > Number(capacity.data?.unpaidCredit ?? 0) ||
        Math.round((total - (specialPlan?.creditReduction??Number(credit))) * 100) >
          Math.round(Number(capacity.data?.refundableMoney ?? 0) * 100))
    )
      throw Error(
        text("The refund and credit reduction exceed the available balance."),
      );
    const common = {
      clientId: crypto.randomUUID(),
      priceMode: mode,
      reason,
      items: items.map((i) => ({
        originalSaleItemId: i.id,
        quantity: Number(quantities[i.id]),
        price: Number(prices[i.id]),
      })),
    };
    let operation: () => Promise<unknown>;
    if (kind === "return") {
      const total = returnTotal;
      const input = {
        requestId,
        items: items.map((i) => ({
          saleItemId: i.id,
          quantity: Number(quantities[i.id]),
          restock,
        })),
        reason,
        settlement: {
          creditReduction: (specialPlan?.creditReduction??Number(credit)),
          moneyRefund: Math.round((total - (specialPlan?.creditReduction??Number(credit))) * 100) / 100,
          method,
          evidenceReference: reference,
        },
      };
      operation = () => api.gst.returnSale(shop!.id, sale.id, input, total);
    } else if (kind === "credit") {
      const total = preview!;
      operation = () =>
        api.gst.manualCredit(shop!.id, sale.id, {
          ...common,
          settlement: {
            creditReduction: (specialPlan?.creditReduction??Number(credit)),
            moneyRefund: Math.round((total - (specialPlan?.creditReduction??Number(credit))) * 100) / 100,
            method,
            evidenceReference: reference,
          },
        });
    } else {
      operation = async () => {
        const result = await api.gst.debitNote(shop!.id, sale.id, common);
        setDebitId(String(result.adjustment.id));
      };
    }
    retained.current = operation;
    await operation();
    retained.current = null;
    setConfirmed(false);
    setQuantities({});
    setRequestId(crypto.randomUUID());
    setPreview(null);
  }
  if (!perms.canVoidOrReturn) return null;
  return (
    <Section title={text("Returns and value corrections")}>
      <ReadState query={capacity}>
        {capacity.data?.status !== "ready" ? (
          <Card>
            <p>
              {text(
                "Payment allocation or retained evidence needs review before a refund can be recorded.",
              )}
            </p>
            {sale.customerId ? (
              <Button href={"/shop/customers/" + sale.customerId} tone="ghost">
                {text("Review customer collections")}
              </Button>
            ) : null}
          </Card>
        ) : null}
      </ReadState>
      {action.notice}
      {special?<ReadState query={documents}>{null}</ReadState>:null}
      {returnError&&items.length?<p className="text-danger">{returnError instanceof Error?returnError.message:text('The retained return evidence needs review.')}</p>:null}
      <fieldset disabled={action.busy || !!retained.current}>
        <SelectField
          label={text("Adjustment type")}
          value={kind}
          onChange={(v) => {
            setKind(v);
            reset();
          }}
          options={[
            ["return", text("Return goods")],
            ...!special?[["credit", text("Reduce invoice value (no stock movement)")],["debit", text("Additional invoice value (no stock movement)")]] as [string,string][]:[],
          ]}
        />
        <TextField
          label={text("Reason")}
          value={reason}
          onChange={(v) => {
            setReason(v);
            reset();
          }}
        />
        {sale.items.map((item) => (
          <div key={item.id} className="gst-row">
            <TextField
              label={`${item.name} · ${text("Quantity")}`}
              type="number"
              value={quantities[item.id] ?? ""}
              onChange={(v) => {
                setQuantities({ ...quantities, [item.id]: v });
                reset();
              }}
            />
            {kind !== "return" ? (
              <TextField
                label={text("Value correction per unit (₹)")}
                type="number"
                value={prices[item.id] ?? ""}
                onChange={(v) => {
                  setPrices({ ...prices, [item.id]: v });
                  reset();
                }}
              />
            ) : null}
          </div>
        ))}
        {kind === "return" ? (
          <>
            <Check
              label={text("Return these goods to stock")}
              checked={restock}
              onChange={(v) => {
                setRestock(v);
                reset();
              }}
            />
            <p>
              {text("Return total")}:{" "}
              {Number.isFinite(returnTotal) ? formatINR(returnTotal) : "—"}
            </p>
          </>
        ) : kind === "credit" ? (
          <Button
            tone="ghost"
            disabled={action.busy || !items.length || !reason.trim()}
            onClick={() =>
              void action.run(async () => {
                const result = await api.gst.previewCredit(shop!.id, sale.id, {
                  reason,
                  priceMode: mode,
                  items: items.map((i) => ({
                    originalSaleItemId: i.id,
                    quantity: Number(quantities[i.id]),
                    price: Number(prices[i.id]),
                  })),
                });
                if (result.requiresCollectionReview)
                  throw Error(
                    text("Review customer collections before this refund."),
                  );
                setPreview(result.plan.totals.total);
              })
            }
          >
            {text("Preview value credit")}
          </Button>
        ) : (
          <p className="shop-hint">
            {text(
              "The additional value is posted to this customer’s credit balance. It does not receive stock.",
            )}
          </p>
        )}
        {preview != null ? (
          <p>
            {text("Correction total")}: {formatINR(preview)}
          </p>
        ) : null}
        {kind !== "debit" ? (
          <>
            {sale.roundingEvidence?<Stats items={[{label:text('Credit reduction'),value:formatINR(specialPlan?.creditReduction??0)},{label:text('Money refund'),value:formatINR(specialPlan?.moneyRefund??0)}]}/>:<TextField
              label={text("Reduce unpaid customer credit (₹)")}
              type="number"
              value={credit}
              onChange={(v) => {
                setCredit(v);
                setConfirmed(false);
              }}
            />
            }
            <SelectField
              label={text("Refund method")}
              value={method}
              onChange={(v) => {
                setMethod(v);
                setConfirmed(false);
              }}
              options={[
                ["cash", text("Cash")],
                ["upi", "UPI"],
                ["card", text("Card")],
              ]}
            />
            <TextField
              label={text("Refund evidence reference")}
              value={reference}
              onChange={(v) => {
                setReference(v);
                setConfirmed(false);
              }}
            />
          </>
        ) : null}
        <Check
          label={text(
            "I have reviewed the quantities, tax and financial effect.",
          )}
          checked={confirmed}
          onChange={setConfirmed}
        />
      </fieldset>
      <Button
        disabled={
          action.busy ||
          (!retained.current &&
            (!confirmed ||
              !reason.trim() ||
              !items.length ||
              sale.gstIntegrity !== "verified" ||
              (kind === "return" &&
                (!Number.isFinite(returnTotal) ||
                  returnTotal < 0 ||
                  capacity.data?.status !== "ready")) ||
              (kind === "credit" && preview == null) ||
              (kind === "debit" && !sale.customerId)))
        }
        onClick={() => void action.run(submit)}
      >
        {text(
          retained.current
            ? "Retry saved request"
            : "Record reviewed adjustment",
        )}
      </Button>
      {debitId ? (
        <ReadState query={balance}>
          {balance.data ? (
            <Card>
              <p>
                {text("Additional amount outstanding")}:{" "}
                {formatINR(Number(balance.data.remaining))}
              </p>
              <Button href={"/shop/adjustments/" + debitId}>
                {text("Review collections")}
              </Button>
            </Card>
          ) : null}
        </ReadState>
      ) : null}
    </Section>
  );
}
