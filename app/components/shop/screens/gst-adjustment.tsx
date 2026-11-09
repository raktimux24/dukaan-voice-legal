"use client";
import { useEffect, useRef, useState } from "react";
import { useShop } from "../context";
import { Button, Card, PageHeader, Pill } from "../ui";
import {
  TextField, FiscalDateTimeField, useFiscalDate,
  SelectField,
  Check,
  Section,
  Stats,
  useGstText,
} from "../gst-ui";
import {
  GstAccess,
  ReadState,
  useGstAction,
  useGstQuery,
} from "../gst-workspace";
import { formatINR } from "../../../lib/shop/money";
import { financialScope, retainedRequests } from "../../../lib/shop/gst-storage";
export function GstAdjustmentScreen({ id }: { id: string }) {
  const { api, shop, offline, t } = useShop(),
    text = useGstText(),
    action = useGstAction(), formatDate = useFiscalDate();
  const query = useGstQuery(["debit-balance", id], () =>
    api.gst.debitBalance(shop!.id, id),
  );
  const [amount, setAmount] = useState(""),
    [method, setMethod] = useState("cash"),
    [reference, setReference] = useState(""),
    [reason, setReason] = useState(""),
    [date, setDate] = useState(()=>new Date().toISOString()),
    [confirmed, setConfirmed] = useState(false);
  const pending = useRef<Parameters<typeof api.gst.debitSettlement>[2] | null>(
    null,
  );
  const journal = useGstQuery(["debit-settlement-pending",id],async()=> (await retainedRequests(financialScope(shop!.id))).filter(row=>row.state==="pending"&&row.path===`/api/shops/${shop!.id}/adjustments/${id}/settlements`),true,"always");
  useEffect(()=>{const row=journal.data?.[0];if(row) {const input=row.payload as NonNullable<typeof pending.current>;pending.current=input;setDate(input.occurredAt);setReference(input.evidenceReference);setReason(input.reason);setAmount(String(input.amount));setMethod(input.method)}},[journal.data]);
  const validDate=Number.isFinite(Date.parse(date))&&Date.parse(date)<=Date.now()+60000&&!!query.data&&Date.parse(date)>=Date.parse(query.data.obligation.createdAt);
  const validEvidence=!!reference.trim()&&reference.length<=500&&!!reason.trim()&&reason.length<=1000;
  const record = async (reverse?: {
    id: string;
    amount: string;
    method: string;
    occurredAt: string;
  }) => {
    if(offline || (!pending.current && (!validDate || !validEvidence || (reverse && Date.parse(date)<Date.parse(reverse.occurredAt))))) return;
    const input = pending.current ?? {
      clientId: crypto.randomUUID(),
      kind: reverse ? "collection_reversal" : "collection",
      amount: reverse ? Number(reverse.amount) : Number(amount),
      method: reverse?.method ?? method,
      occurredAt: new Date(date).toISOString(),
      evidenceReference: reference.trim(),
      reason: reason.trim(),
      ...(reverse ? { reversesId: reverse.id } : {}),
    };
    pending.current = input;
    await api.gst.debitSettlement(shop!.id, id, input);
    pending.current = null;
    setConfirmed(false);
    setAmount("");
    await Promise.all([query.refetch(),journal.refetch()]);
  };
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-adjustment-workspace">
        <PageHeader
          title={text("Additional invoice value")}
          back={{
            href: query.data
              ? "/shop/sales/" + query.data.obligation.saleId
              : "/shop/sales",
            label: text("Original bill"),
          }}
          description={text(
            "Record money already collected against this debit note, or reverse an incorrect collection.",
          )}
        />
        <ReadState query={journal}>{null}</ReadState>
        <ReadState query={query}>
          {query.data ? (
            <>
              <Stats
                items={[
                  {
                    label: text("Additional value"),
                    value: formatINR(Number(query.data.obligation.grossAmount)),
                  },
                  {
                    label: t("debit.collected", "Collected"),
                    value: formatINR(Number(query.data.collected)),
                  },
                  {
                    label: t("debit.remaining", "Remaining to collect"),
                    value: formatINR(Number(query.data.remaining)),
                  },
                ]}
              />
              {query.data.integrity !== "verified" ? (
                <Card>
                  <p>
                    {text(
                      "The retained document needs review. Collections are disabled.",
                    )}
                  </p>
                </Card>
              ) : null}
              {action.notice}
              <Card className="stack-form"><fieldset className="form-grid is-2"
                disabled={
                  offline || !journal.isSuccess || !!journal.error || action.busy ||
                  !!pending.current ||
                  query.data.integrity !== "verified"
                }
              >
                <TextField
                  label={text("Amount collected (₹)")}
                  type="number"
                  value={amount}
                  onChange={(v) => {
                    setAmount(v);
                    setConfirmed(false);
                  }}
                />
                <SelectField
                  label={text("Payment method")}
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
                <FiscalDateTimeField
                  label={text("Payment date")}
                  value={date}
                  onChange={(v) => {
                    setDate(v);
                    setConfirmed(false);
                  }}
                />
                <TextField
                  label={text("Evidence reference")}
                  value={reference}
                  onChange={(v) => {
                    setReference(v);
                    setConfirmed(false);
                  }}
                />
                <TextField
                  label={text("Reason")}
                  value={reason}
                  onChange={(v) => {
                    setReason(v);
                    setConfirmed(false);
                  }}
                />
                <Check
                  label={text("I have reviewed this financial entry.")}
                  checked={confirmed}
                  onChange={setConfirmed}
                />
              </fieldset>
              <Button
                disabled={
                  offline || !journal.isSuccess || !!journal.error || action.busy ||
                  (!pending.current &&
                    (!confirmed ||
                      !reference.trim() ||
                      !reason.trim() ||
                      !validDate || !validEvidence ||
                      !/^\d+(\.\d{1,2})?$/.test(amount) ||
                      !(Number(amount) > 0) ||
                      Number(amount) > Number(query.data.remaining) ||
                      query.data.integrity !== "verified"))
                }
                onClick={() => void action.run(() => record())}
              >
                {text(
                  pending.current
                    ? "Retry saved request"
                    : "Record received payment",
                )}
              </Button>
              </Card><Section title={text("Collection history")}>
                {query.data.events.map((event) => (
                  <div className="gst-row" key={event.id}>
                    <span>
                      {text(
                        event.kind === "collection" ? "Collection" : "Reversal",
                      )}{" "}
                      · {formatINR(Number(event.amount))} · {text(event.method === "cash" ? "Cash" : event.method === "card" ? "Card" : "UPI")}
                      <small className="shop-hint">{formatDate(event.occurredAt)} · {event.evidenceReference} · {event.reason}</small>
                    </span>
                    {event.kind === "collection" &&
                    !query.data!.events.some(
                      (e) => e.reversesId === event.id,
                    ) ? (
                      <Button
                        tone="ghost"
                        disabled={
                          offline || !journal.isSuccess || !!journal.error || action.busy ||
                          !!pending.current ||
                          !confirmed ||
                          !reason.trim() ||
                          !reference.trim() ||
                          !validDate || !validEvidence || Date.parse(date)<Date.parse(event.occurredAt) ||
                          query.data!.integrity !== "verified"
                        }
                        onClick={() => void action.run(() => record(event))}
                      >
                        {text("Reverse this collection")}
                      </Button>
                    ) : null}
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
