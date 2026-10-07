"use client";
import { useRef, useState } from "react";
import { useShop } from "../context";
import { Button, Card, PageHeader, Pill } from "../ui";
import {
  TextField,
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
import { indianCalendarDate } from "../../../lib/shop/gst-core/fiscal-date";
export function GstAdjustmentScreen({ id }: { id: string }) {
  const { api, shop } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const query = useGstQuery(["debit-balance", id], () =>
    api.gst.debitBalance(shop!.id, id),
  );
  const [amount, setAmount] = useState(""),
    [method, setMethod] = useState("cash"),
    [reference, setReference] = useState(""),
    [reason, setReason] = useState(""),
    [date, setDate] = useState(indianCalendarDate),
    [confirmed, setConfirmed] = useState(false);
  const pending = useRef<Parameters<typeof api.gst.debitSettlement>[2] | null>(
    null,
  );
  const record = async (reverse?: {
    id: string;
    amount: string;
    method: string;
  }) => {
    const input = pending.current ?? {
      clientId: crypto.randomUUID(),
      kind: reverse ? "collection_reversal" : "collection",
      amount: reverse ? Number(reverse.amount) : Number(amount),
      method: reverse?.method ?? method,
      occurredAt: new Date(date + "T12:00:00+05:30").toISOString(),
      evidenceReference: reference,
      reason,
      ...(reverse ? { reversesId: reverse.id } : {}),
    };
    pending.current = input;
    await api.gst.debitSettlement(shop!.id, id, input);
    pending.current = null;
    setConfirmed(false);
    setAmount("");
  };
  return (
    <GstAccess>
      <div className="shop-page">
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
                    label: text("Collected"),
                    value: formatINR(Number(query.data.collected)),
                  },
                  {
                    label: text("Outstanding"),
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
              <fieldset
                disabled={
                  action.busy ||
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
                <TextField
                  label={text("Payment date")}
                  type="date"
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
                  action.busy ||
                  (!pending.current &&
                    (!confirmed ||
                      !reference.trim() ||
                      !reason.trim() ||
                      !date ||
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
              <Section title={text("Collection history")}>
                {query.data.events.map((event) => (
                  <div className="gst-row" key={event.id}>
                    <span>
                      {text(
                        event.kind === "collection" ? "Collection" : "Reversal",
                      )}{" "}
                      · {formatINR(Number(event.amount))} · {event.method}
                    </span>
                    {event.kind === "collection" &&
                    !query.data!.events.some(
                      (e) => e.reversesId === event.id,
                    ) ? (
                      <Button
                        tone="ghost"
                        disabled={
                          action.busy ||
                          !!pending.current ||
                          !confirmed ||
                          !reason.trim() ||
                          !reference.trim() ||
                          !date ||
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
