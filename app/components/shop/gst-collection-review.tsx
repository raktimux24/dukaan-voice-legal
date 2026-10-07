"use client";
import { useRef, useState } from "react";
import { useShop } from "./context";
import { Button, Card, Pill } from "./ui";
import { Section, TextField, Check, useGstText, useFiscalDate } from "./gst-ui";
import { useGstPages, useGstAction, ReadState, More } from "./gst-workspace";
import { formatINR } from "../../lib/shop/money";

export function GstCollectionReview({ customerId }: { customerId: string }) {
  const { api, shop, perms, premium } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const receipts = useGstPages(
    ["unassigned-collections", customerId],
    (cursor) => api.gst.collections(shop!.id, customerId, cursor),
    perms.canManageCustomers && premium,
  );
  const invoices = useGstPages(
    ["credit-invoices", customerId],
    (cursor) => api.gst.creditInvoices(shop!.id, customerId, cursor),
    perms.canManageCustomers && premium,
  );
  const [ledger, setLedger] = useState(""),
    [amounts, setAmounts] = useState<Record<string, string>>({}),
    [reason, setReason] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const saved = useRef<Parameters<typeof api.gst.reviewCollection>[2] | null>(
    null,
  );
  const rows = receipts.data?.pages.flatMap((p) => p.items) ?? [],
    bills = invoices.data?.pages.flatMap((p) => p.items) ?? [];
  const selected = rows.find((r) => r.id === ledger);
  const allocations = bills
    .filter((b) => Number(amounts[b.id]) > 0)
    .map((b) => ({ saleId: b.id, amount: Number(amounts[b.id]) }));
  const total = allocations.reduce((sum, row) => sum + row.amount, 0);
  const valid =
    selected &&
    total > 0 &&
    total <= Number(selected.unassignedAmount) &&
    allocations.every(
      (a) =>
        /^\d+(\.\d{1,2})?$/.test(amounts[a.saleId]) &&
        a.amount <=
          Number(bills.find((b) => b.id === a.saleId)!.remainingCredit),
    );
  if (!perms.canManageCustomers || !premium) return null;
  return (
    <Section
      title={text("Match received payments to bills")}
      summary={`${rows.length} ${text("payments to review")}`}
    >
      <p className="shop-hint">
        {text(
          "Choose a payment already received, then assign its amount to the unpaid bills it settles. This does not record another payment.",
        )}
      </p>
      {action.notice}
      <fieldset disabled={action.busy || !!saved.current}>
        <ReadState query={receipts} empty={!rows.length}>
          {rows.map((row) => (
            <button
              className="gst-nav-row"
              type="button"
              key={row.id}
              aria-pressed={ledger === row.id}
              onClick={() => {
                setLedger(row.id);
                setAmounts({});
                setReviewed(false);
              }}
            >
              <span>
                {date(row.recordedAt)} · {row.method}
                <small>
                  {text("Unassigned")}:{" "}
                  {formatINR(Number(row.unassignedAmount))}
                </small>
              </span>
              {ledger === row.id ? (
                <Pill tone="ok">{text("Selected")}</Pill>
              ) : null}
            </button>
          ))}
        </ReadState>
        <More query={receipts} />
        {selected ? (
          <ReadState query={invoices} empty={!bills.length}>
            {bills.map((bill) => (
              <TextField
                key={bill.id}
                label={`${text("Bill")} #${bill.saleNumber} · ${text("Unpaid")}: ${formatINR(Number(bill.remainingCredit))}`}
                type="number"
                value={amounts[bill.id] ?? ""}
                onChange={(value) => {
                  setAmounts({ ...amounts, [bill.id]: value });
                  setReviewed(false);
                }}
              />
            ))}
            <More query={invoices} />
            <p>
              {text("Amount assigned")}: {formatINR(total)}
            </p>
            <TextField
              label={text("Review reason")}
              value={reason}
              onChange={(v) => {
                setReason(v);
                setReviewed(false);
              }}
            />
            <Check
              label={text("I have confirmed which bills this payment settles.")}
              checked={reviewed}
              onChange={setReviewed}
            />
          </ReadState>
        ) : null}
      </fieldset>
      <Button
        disabled={
          action.busy ||
          (!saved.current && (!valid || !reviewed || !reason.trim()))
        }
        onClick={() =>
          void action.run(async () => {
            const input = saved.current ?? {
              clientId: crypto.randomUUID(),
              ledgerId: ledger,
              reason,
              allocations,
            };
            saved.current = input;
            await api.gst.reviewCollection(shop!.id, customerId, input);
            saved.current = null;
            setReviewed(false);
            setLedger("");
            setAmounts({});
          })
        }
      >
        {text(saved.current ? "Retry saved review" : "Save payment allocation")}
      </Button>
    </Section>
  );
}
