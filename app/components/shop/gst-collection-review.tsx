"use client";
import { useRef, useState } from "react";
import { useShop } from "./context";
import { Button, Field, inputClass } from "./ui";
import { Section, TextField, Check, useGstText, useFiscalDate } from "./gst-ui";
import { useGstPages, useGstAction, ReadState, More } from "./gst-workspace";
import { formatINR } from "../../lib/shop/money";

export function GstCollectionReview({ customerId }: { customerId: string }) {
  const { api, shop, perms, premium, t } = useShop(),
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
  const total = allocations.reduce((sum, row) => sum + Math.round(row.amount * 100), 0) / 100;
  const valid =
    selected &&
    total > 0 &&
    total <= Number(selected.unassignedAmount) &&
    Object.values(amounts).every(value => value === '' || /^\d+(\.\d{1,2})?$/.test(value)) &&
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
      <p className="shop-hint">{t('customers.match_hint', 'Link a payment you already received to its bills. Your customer’s balance stays the same.')}</p>
      {action.notice}
      <fieldset className="collection-review-form" disabled={action.busy || !!saved.current}>
        <ReadState query={receipts} empty={!rows.length}>
          <Field label={t('customers.choose_payment', '1. Choose received payment')}>
            <select className={inputClass} value={ledger} onChange={event => {setLedger(event.target.value); setAmounts({}); setReviewed(false);}}>
              <option value="">{t('customers.select_payment', 'Select a payment')}</option>
              {rows.map(row => <option key={row.id} value={row.id}>{date(row.recordedAt)} · {t('pos.method.' + row.method, row.method ?? '—')} · {formatINR(Number(row.unassignedAmount))} {text('Unassigned')}</option>)}
            </select>
          </Field>
        </ReadState>
        <More query={receipts} />
        {selected ? (
          <ReadState query={invoices} empty={!bills.length}>
            <h3 className="shop-section-title">{t('customers.choose_bills', '2. Choose bills and amounts')}</h3>
            <div className="collection-bills">{bills.map(bill => (
              <div className="collection-bill" key={bill.id}>
                <div><strong>{text('Bill')} #{bill.saleNumber}</strong><small>{text('Unpaid')}: {formatINR(Number(bill.remainingCredit))}</small></div>
                <Field label={`${text('Amount assigned')} · ${text('Bill')} #${bill.saleNumber}`}>
                  <input className={inputClass} type="number" min="0" step="0.01" max={bill.remainingCredit} placeholder="0.00" value={amounts[bill.id] ?? ''} onChange={event => {setAmounts({...amounts, [bill.id]: event.target.value}); setReviewed(false);}} />
                </Field>
                <Button tone="quiet" size="sm" onClick={() => {
                  const usedElsewhere = allocations.filter(a => a.saleId !== bill.id).reduce((sum, a) => sum + Math.round(a.amount * 100), 0);
                  const available = Math.max(0, Math.round(Number(selected.unassignedAmount) * 100) - usedElsewhere);
                  setAmounts({...amounts, [bill.id]: (Math.min(available, Math.round(Number(bill.remainingCredit) * 100)) / 100).toFixed(2)}); setReviewed(false);
                }}>{t('customers.use_remaining', 'Use remaining payment')}</Button>
              </div>
            ))}</div>
            <More query={invoices} />
            <div className="collection-summary"><span>{text('Amount assigned')}: <strong>{formatINR(total)}</strong></span><span>{t('customers.left_to_match', 'Left to match')}: <strong>{formatINR(Number(selected.unassignedAmount) - total)}</strong></span></div>
            {total > Number(selected.unassignedAmount) ? <p role="alert" className="customer-owing">{t('customers.exceeds_payment', 'Assigned amounts exceed this payment. Reduce the amounts before saving.')}</p> : null}
            <TextField
              label={t("customers.match_note", "Note: why these bills?")}
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
