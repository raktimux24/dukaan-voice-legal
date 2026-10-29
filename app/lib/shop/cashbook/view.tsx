import { useState, type ComponentType } from "react";
import type { OpeningUi } from "../openings/view";
import {
  cashDay,
  CASH_METHODS,
  type CashAction,
  type Expense,
  type CashResult,
} from "./contract";
import type { useCashbook } from "./workflow";
export type CashUi = OpeningUi & {
  Select: ComponentType<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    disabled?: boolean;
  }>;
  Totals: ComponentType<{
    items: { label: string; value: string }[];
    highlightLast?: boolean;
  }>;
};
type T = (k: string, v?: Record<string, string | number>) => string;
const money = (value: string) =>
  value.startsWith("-") ? "−₹" + value.slice(1) : "₹" + value;
const codes = [
  "invalid",
  "amount",
  "date",
  "reason",
  "method",
  "not_allowed",
  "owner",
  "setup",
  "before_start",
  "coverage",
  "too_many",
  "conflict",
  "stale",
  "closed",
  "reopen",
  "review",
  "already_started",
  "category",
  "overpay",
  "not_found",
  "cancelled",
  "reversed",
  "paid_cancel",
  "unavailable",
  "storage",
];
export function cashbookErrorKey(e: unknown, loading = false) {
  const raw = (e as any)?.code ?? (e as any)?.message ?? "";
  const code = codes.find((k) => raw === "cashbook_" + k);
  return "cashbook.error." + (code ?? (loading ? "load" : "failed"));
}
export function CashbookView({
  w,
  ui,
  t,
  language,
  share,
  onNavigate,
}: {
  w: ReturnType<typeof useCashbook>;
  ui: CashUi;
  t: T;
  language: string;
  share: (file: NonNullable<CashResult["export"]>) => Promise<void>;
  onNavigate?: () => void;
}) {
  const { Box, Text, Button, Input, Check, Busy, Select, Totals } = ui,
    tr = (k: string, v?: Record<string, string | number>) =>
      t("cashbook." + k, v),
    [tab, setTab] = useState<"cashbook" | "expenses">("cashbook"),
    [form, setForm] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [message, setMessage] = useState(""),
    [seed, setSeed] = useState(false),
    [startDay, setStartDay] = useState(cashDay),
    [opening, setOpening] = useState("0"),
    [review, setReview] = useState(false),
    [amount, setAmount] = useState(""),
    [category, setCategory] = useState("rent"),
    [payee, setPayee] = useState(""),
    [date, setDate] = useState(cashDay),
    [method, setMethod] = useState("cash"),
    [note, setNote] = useState(""),
    [reference, setReference] = useState(""),
    [paid, setPaid] = useState(true),
    [direction, setDirection] = useState("out"),
    [cashType, setCashType] = useState("owner"),
    [reverseId, setReverseId] = useState("");
  const d = w.data.data,
    displayLocale = language === "hinglish" ? "en-IN" : language + "-IN",
    s = d?.summary,
    p = d?.expenses.find((p) => p.id === selected),
    owner = d?.role === "OWNER",
    blocked = w.busy || !w.ready || !!w.pending,
    methods = CASH_METHODS.map((value) => ({
      value,
      label: tr("method." + value),
    })),
    cat = (id: string) =>
      d?.categories.find((c) => c.id === id)?.builtin
        ? tr("category." + id)
        : (d?.categories.find((c) => c.id === id)?.name ?? id);
  const error = (e: unknown, loading = false) =>
    t(cashbookErrorKey(e, loading));
  const reset = (next: string) => {
    onNavigate?.();
    setForm(next);
    setDate(w.day);
    setAmount("");
    setNote("");
    setReference("");
    setReview(false);
    setPaid(true);
    setMethod("cash");
    setPayee("");
    setMessage("");
  };
  const run = async (a?: CashAction) => {
    const r = await w.run(a);
    if (r) {
      onNavigate?.();
      setForm("");
      if (r.expenseId) {
        setSelected(r.expenseId);
        setTab("expenses");
      }
      setMessage(tr("saved"));
      if (r.export)
        try {
          await share(r.export);
          setMessage(tr("exported"));
        } catch {
          setMessage(tr("saved"));
        }
    }
  };
  if (!w.allowed) return <Text tone="danger">{tr("online")}</Text>;
  return (
    <Box>
      {!d?.account ? <Text tone="muted">{tr("intro")}</Text> : null}
      {w.data.isPending || w.busy ? <Busy label={t("common.loading")} /> : null}
      {w.error || w.data.error ? (
        <Box card>
          <Text tone="danger" live>
            {error(w.error ? { code: w.error } : w.data.error, !w.error)}
          </Text>
          <Button
            label={t("common.retry")}
            onPress={() => {
              w.clearError();
              if (!w.ready) w.reloadStorage();
              void w.refresh();
            }}
          />
        </Box>
      ) : null}
      {w.pending ? (
        <Box card>
          <Text>{tr("pending")}</Text>
          <Button
            label={tr("retry")}
            disabled={w.busy}
            onPress={() => void run()}
          />
        </Box>
      ) : null}
      {message ? <Text live>{message}</Text> : null}
      {d && !d.account ? (
        <>
          <Text heading>{tr("setup")}</Text>
          <Text tone="muted">{tr("setup_help")}</Text>
          {owner ? (
            <>
              <Check
                label={tr("use_opening")}
                value={seed}
                onChange={(v) => {
                  setSeed(v);
                  setReview(false);
                }}
                disabled={blocked || !d.suggested}
              />
              {seed && d.suggested ? (
                <Text>
                  {tr("opening_suggestion", {
                    amount: d.suggested.amount,
                    date: d.suggested.effectiveAt,
                  })}
                </Text>
              ) : null}
              {!seed ? (
                <>
                  <Input
                    label={tr("start_day")}
                    type="date"
                    value={startDay}
                    onChange={(v) => {
                      setStartDay(v);
                      setReview(false);
                    }}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("starting_cash")}
                    type="decimal"
                    value={opening}
                    onChange={(v) => {
                      setOpening(v);
                      setReview(false);
                    }}
                    disabled={blocked}
                  />
                </>
              ) : null}
              <Input
                label={tr("reference_required")}
                value={reference}
                onChange={setReference}
                disabled={blocked}
              />
              <Check
                label={tr("setup_review")}
                value={review}
                onChange={setReview}
                disabled={blocked}
              />
              <Button
                primary
                label={tr("start")}
                disabled={blocked || !review || !reference.trim()}
                onPress={() =>
                  void run({
                    kind: "init",
                    day:
                      seed && d.suggested
                        ? cashDay(d.suggested.effectiveAt)
                        : startDay,
                    opening: seed && d.suggested ? d.suggested.amount : opening,
                    openingRef: seed ? (d.suggested?.id ?? null) : null,
                    reference,
                    reviewed: review,
                  })
                }
              />
            </>
          ) : (
            <Text>{tr("owner_setup")}</Text>
          )}
        </>
      ) : null}
      {d?.account ? (
        <>
          {!form ? (
            <Box row>
              <Button
                primary={tab === "cashbook"}
                label={tr("cashbook")}
                onPress={() => {
                  setTab("cashbook");
                  onNavigate?.();
                  setForm("");
                  setSelected(null);
                }}
                disabled={blocked}
              />
              <Button
                primary={tab === "expenses"}
                label={tr("expenses")}
                onPress={() => {
                  setTab("expenses");
                  onNavigate?.();
                  setForm("");
                  setSelected(null);
                }}
                disabled={blocked}
              />
            </Box>
          ) : null}
          {form ? (
            <>
              <Button
                label={tr("cancel_form")}
                disabled={blocked}
                onPress={() => {
                  setForm("");
                  onNavigate?.();
                }}
              />
              {form === "expense" ? (
                <>
                  <Text heading>{tr("expense_form")}</Text>
                  <Input
                    label={tr("amount")}
                    value={amount}
                    type="decimal"
                    onChange={setAmount}
                    disabled={blocked}
                  />
                  <Select
                    label={tr("category")}
                    value={category}
                    options={d.categories.map((c) => ({
                      value: c.id,
                      label: cat(c.id),
                    }))}
                    onChange={setCategory}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("date")}
                    type="date"
                    value={date}
                    onChange={(v) => {
                      setDate(v);
                      if (v > cashDay()) setPaid(false);
                    }}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("payee")}
                    value={payee}
                    onChange={setPayee}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("expense_reference")}
                    value={reference}
                    onChange={setReference}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("expense_note")}
                    value={note}
                    onChange={setNote}
                    multiline
                    disabled={blocked}
                  />
                  <Check
                    label={tr("expense_paid")}
                    value={paid}
                    onChange={setPaid}
                    disabled={blocked}
                  />
                  <Text tone="muted">{tr("expense_paid_help")}</Text>
                  {paid ? (
                    <Select
                      label={tr("method")}
                      value={method}
                      options={methods}
                      onChange={setMethod}
                      disabled={blocked}
                    />
                  ) : null}
                  <Button
                    primary
                    label={tr("save_expense")}
                    disabled={blocked || !amount}
                    onPress={() =>
                      void run({
                        kind: "expense",
                        date,
                        category,
                        amount,
                        payee,
                        note,
                        reference,
                        paid,
                        method: method as any,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "pay" && p ? (
                <>
                  <Text heading>{tr("pay")}</Text>
                  <Text>
                    {cat(p.category) + " · " + tr("due") + ": ₹" + p.due}
                  </Text>
                  <Input
                    label={tr("payment_amount")}
                    type="decimal"
                    value={amount}
                    onChange={setAmount}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("payment_date")}
                    type="date"
                    value={date}
                    onChange={setDate}
                    disabled={blocked}
                  />
                  <Select
                    label={tr("method")}
                    value={method}
                    options={methods}
                    onChange={setMethod}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("payment_reference")}
                    value={reference}
                    onChange={setReference}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("payment_note")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("pay")}
                    disabled={blocked || !amount}
                    onPress={() =>
                      void run({
                        kind: "pay",
                        id: p.id,
                        version: p.version,
                        date,
                        amount,
                        method: method as any,
                        reference,
                        note,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "reverse" && p ? (
                <>
                  <Text heading>{tr("reverse")}</Text>
                  <Text tone="muted">{tr("reverse_help")}</Text>
                  <Input
                    label={tr("date")}
                    type="date"
                    value={date}
                    onChange={setDate}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("reverse_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("reverse_payment")}
                    disabled={blocked || !note.trim()}
                    onPress={() =>
                      void run({
                        kind: "reverse",
                        id: p.id,
                        version: p.version,
                        paymentId: reverseId,
                        date,
                        reason: note,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "cancel" && p ? (
                <>
                  <Text heading>{tr("cancel_expense")}</Text>
                  <Text tone="muted">{tr("cancel_help")}</Text>
                  <Input
                    label={tr("cancel_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("cancel_expense")}
                    disabled={blocked || !note.trim()}
                    onPress={() =>
                      void run({
                        kind: "cancel",
                        id: p.id,
                        version: p.version,
                        reason: note,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "cash" ? (
                <>
                  <Text heading>{tr("cash_tools")}</Text>
                  <Text tone="muted">{tr("cash_help")}</Text>
                  <Select
                    label={tr("cash_type")}
                    value={cashType}
                    options={["owner", "adjustment"].map((value) => ({
                      value,
                      label: tr("cash_type." + value),
                    }))}
                    onChange={setCashType}
                    disabled={blocked}
                  />
                  <Select
                    label={tr("direction")}
                    value={direction}
                    options={["in", "out"].map((value) => ({
                      value,
                      label: tr("direction." + value),
                    }))}
                    onChange={setDirection}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("amount")}
                    type="decimal"
                    value={amount}
                    onChange={setAmount}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("date")}
                    type="date"
                    value={date}
                    onChange={setDate}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("cash_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("reference")}
                    value={reference}
                    onChange={setReference}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("record_cash")}
                    disabled={blocked || !amount || !note.trim()}
                    onPress={() =>
                      void run({
                        kind: "cash",
                        type: cashType as any,
                        direction: direction as any,
                        date,
                        amount,
                        reason: note,
                        reference,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "count" && s ? (
                <>
                  <Text heading>{tr("count")}</Text>
                  <Text tone="muted">{tr("count_help")}</Text>
                  <Text>{tr("closing") + ": ₹" + s.closing}</Text>
                  <Input
                    label={tr("counted_input")}
                    type="decimal"
                    value={amount}
                    onChange={(v) => {
                      setAmount(v);
                      setReview(false);
                    }}
                    disabled={blocked}
                  />
                  {amount && Number.isFinite(Number(amount)) ? (
                    <Text>
                      {tr("difference") +
                        ": ₹" +
                        (Number(amount) - Number(s.closing)).toFixed(2)}
                    </Text>
                  ) : null}
                  <Input
                    label={tr("close_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Check
                    label={tr("count_review")}
                    value={review}
                    onChange={setReview}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("close")}
                    disabled={blocked || !amount || !review}
                    onPress={() =>
                      void run({
                        kind: "close",
                        day: w.day,
                        hash: s.hash,
                        counted: amount,
                        reason: note,
                        reviewed: review,
                      })
                    }
                  />
                </>
              ) : null}
              {form === "reopen" && s ? (
                <>
                  <Text heading>{tr("reopen")}</Text>
                  <Text tone="muted">{tr("late_help")}</Text>
                  <Input
                    label={tr("reopen_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("reopen")}
                    disabled={blocked || !note.trim()}
                    onPress={() =>
                      void run({ kind: "reopen", day: w.day, reason: note })
                    }
                  />
                </>
              ) : null}
              {form === "category" ? (
                <>
                  <Text heading>{tr("category_tools")}</Text>
                  <Input
                    label={tr("category_name")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("add_category")}
                    disabled={blocked || !note.trim()}
                    onPress={() => void run({ kind: "category", name: note })}
                  />
                </>
              ) : null}
            </>
          ) : tab === "cashbook" && s ? (
            <>
              <Box>
                <Input
                  label={tr("date")}
                  type="date"
                  value={w.day}
                  onChange={w.setDay}
                  disabled={blocked}
                />
              </Box>
              <Totals
                highlightLast
                items={[
                  ["opening", s.opening],
                  ["receipts", s.receipts],
                  ["payments", s.payments],
                  ["closing", s.closing],
                ].map(([k, v]) => ({ label: tr(k), value: money(v) }))}
              />
              <Text tone="muted">
                {tr("coverage_help", {
                  date: new Date(s.coverageAt).toLocaleString(displayLocale, {
                    timeZone: "Asia/Kolkata",
                  }),
                })}
              </Text>
              {s.openingChanged ? (
                <Text tone="danger">{tr("opening_changed")}</Text>
              ) : null}
              <Text tone={s.status === "needs_review" ? "danger" : "accent"}>
                {tr("status") + ": " + tr("status." + s.status)}
              </Text>
              {s.status === "needs_review" ? (
                <Text tone="danger">{tr("late_help")}</Text>
              ) : null}
              {Number(s.closing) < 0 ? (
                <Text tone="danger">{tr("negative")}</Text>
              ) : null}
              <Box row>
                <Button
                  primary
                  label={tr("add_expense")}
                  disabled={blocked}
                  onPress={() => reset("expense")}
                />
                {owner ? (
                  <>
                    <Button
                      label={tr("cash_tools")}
                      disabled={blocked}
                      onPress={() => reset("cash")}
                    />
                    <Button
                      label={tr(s.close ? "reopen" : "count")}
                      disabled={blocked}
                      onPress={() => reset(s.close ? "reopen" : "count")}
                    />
                  </>
                ) : null}
                <Button
                  label={tr("export")}
                  disabled={blocked}
                  onPress={() =>
                    void run({ kind: "export", day: w.day, language })
                  }
                />
              </Box>
              {s.close ? (
                <Box card>
                  <Text heading>{tr("close_saved")}</Text>
                  <Totals
                    items={["expected", "counted", "difference"].map((k) => ({
                      label: tr(k === "expected" ? "closing" : k),
                      value: money(
                        s.close![k as "expected" | "counted" | "difference"],
                      ),
                    }))}
                  />
                  <Text tone="muted">{s.close.reason}</Text>
                </Box>
              ) : null}
              <Box card>
                <Text heading>{tr("noncash")}</Text>
                {CASH_METHODS.filter((m) => m !== "cash").map((m) => (
                  <Text key={m}>
                    {tr("method." + m) +
                      " · " +
                      tr("in") +
                      ": ₹" +
                      s.methods[m].in +
                      " · " +
                      tr("out") +
                      ": ₹" +
                      s.methods[m].out +
                      " · " +
                      tr("net") +
                      ": ₹" +
                      s.methods[m].net}
                  </Text>
                ))}
              </Box>
              <Text heading>{tr("events")}</Text>
              <Text tone="muted">
                {tr("showing", { n: s.events.length, total: s.totalEvents })}
              </Text>
              {s.events.length === 0 ? <Text>{tr("no_events")}</Text> : null}
              {s.events.map((e) => (
                <Box card key={e.id}>
                  <Text heading>{tr("kind." + e.kind)}</Text>
                  <Text tone="accent">
                    {(Number(e.amount) < 0
                      ? "−"
                      : Number(e.amount) > 0
                        ? "+"
                        : "") +
                      "₹" +
                      (Number(e.amount) < 0 ? e.amount.slice(1) : e.amount) +
                      " · " +
                      tr("method." + e.method)}
                  </Text>
                  <Text>
                    {tr("effective") +
                      ": " +
                      new Date(e.effectiveAt).toLocaleString(displayLocale, {
                        timeZone: "Asia/Kolkata",
                      })}
                  </Text>
                  {e.backfilled ? (
                    <Text tone="muted">{tr("backfill")}</Text>
                  ) : cashDay(e.effectiveAt) !== cashDay(e.recordedAt) ? (
                    <Text tone="danger">
                      {tr("late", { date: cashDay(e.effectiveAt) })}
                    </Text>
                  ) : null}
                  {e.reference ? <Text>{e.reference}</Text> : null}
                  {e.note ? <Text>{e.note}</Text> : null}
                  <Text tone="muted">
                    {tr("actor") +
                      ": " +
                      (d.actors[e.actor] || tr("actor")) +
                      " · " +
                      tr("recorded") +
                      ": " +
                      new Date(e.recordedAt).toLocaleString(displayLocale, {
                        timeZone: "Asia/Kolkata",
                      })}
                  </Text>
                </Box>
              ))}
              <Box row>
                {w.offset > 0 ? (
                  <Button
                    label={tr("previous")}
                    onPress={() => w.setOffset(Math.max(0, w.offset - 100))}
                    disabled={blocked}
                  />
                ) : null}
                {s.more ? (
                  <Button
                    label={tr("more")}
                    onPress={() => w.setOffset(w.offset + 100)}
                    disabled={blocked}
                  />
                ) : null}
              </Box>
              {s.history.length ? (
                <>
                  <Text heading>{tr("close_history")}</Text>
                  {s.history.map((e) => (
                    <Text key={e.version} tone="muted">
                      {tr("close_event." + e.event) +
                        " · " +
                        (d.actors[e.actor] || tr("actor")) +
                        " · " +
                        new Date(e.at).toLocaleString(displayLocale, {
                          timeZone: "Asia/Kolkata",
                        }) +
                        " · " +
                        e.reason}
                    </Text>
                  ))}
                </>
              ) : null}
              <Text tone="muted">{tr("export_help")}</Text>
              <Button
                label={tr("refresh")}
                onPress={() => void w.refresh()}
                disabled={blocked}
              />
            </>
          ) : tab === "expenses" ? (
            <>
              {p ? (
                <>
                  <ExpenseCard p={p} ui={ui} tr={tr} cat={cat} />
                  {!p.cancelled ? (
                    <Box row>
                      {Number(p.due) > 0 ? (
                        <Button
                          primary
                          label={tr("pay")}
                          disabled={blocked || p.date > cashDay()}
                          onPress={() => {
                            reset("pay");
                            setAmount(p.due);
                          }}
                        />
                      ) : null}
                      {Number(p.paid) === 0 ? (
                        <Button
                          label={tr("cancel_expense")}
                          disabled={blocked}
                          onPress={() => reset("cancel")}
                        />
                      ) : null}
                    </Box>
                  ) : null}
                  <Text heading>{tr("payment_history")}</Text>
                  {p.payments.map((e) => (
                    <Box card key={e.id}>
                      <Text>
                        {"₹" +
                          e.amount +
                          " · " +
                          tr("method." + e.method) +
                          " · " +
                          e.date}
                      </Text>
                      {e.note ? <Text>{e.note}</Text> : null}
                      {e.reference ? <Text>{e.reference}</Text> : null}
                      {!p.cancelled &&
                      !e.reversesId &&
                      !p.payments.some((r) => r.reversesId === e.id) ? (
                        <Button
                          label={tr("reverse")}
                          disabled={blocked}
                          onPress={() => {
                            reset("reverse");
                            setDate(cashDay());
                            setReverseId(e.id);
                          }}
                        />
                      ) : null}
                      {e.reversesId ? (
                        <Text tone="muted">{tr("event.reverse")}</Text>
                      ) : null}
                    </Box>
                  ))}
                  <Text heading>{tr("history")}</Text>
                  {p.history.map((e, i) => (
                    <Text key={i} tone="muted">
                      {tr("event." + e.kind) +
                        " · " +
                        (d.actors[e.actor] || tr("actor")) +
                        " · " +
                        new Date(e.at).toLocaleString(displayLocale, {
                          timeZone: "Asia/Kolkata",
                        }) +
                        (e.note ? " · " + e.note : "")}
                    </Text>
                  ))}
                </>
              ) : (
                <>
                  <Box row>
                    <Button
                      primary
                      label={tr("add_expense")}
                      disabled={blocked}
                      onPress={() => reset("expense")}
                    />
                    {owner ? (
                      <Button
                        label={tr("category_tools")}
                        disabled={blocked}
                        onPress={() => reset("category")}
                      />
                    ) : null}
                  </Box>
                  {!d.expenses.length ? (
                    <Text>{tr("empty_expenses")}</Text>
                  ) : null}
                  {d.expenses.map((e) => (
                    <Box card key={e.id}>
                      <ExpenseCard p={e} ui={ui} tr={tr} cat={cat} />
                      <Button
                        label={tr("expense_open")}
                        onPress={() => {
                          setSelected(e.id);
                          onNavigate?.();
                        }}
                        disabled={blocked}
                      />
                    </Box>
                  ))}
                  <Box row>
                    {w.expenseOffset > 0 ? (
                      <Button
                        label={tr("previous")}
                        onPress={() =>
                          w.setExpenseOffset(Math.max(0, w.expenseOffset - 30))
                        }
                        disabled={blocked}
                      />
                    ) : null}
                    {d.moreExpenses ? (
                      <Button
                        label={tr("more")}
                        onPress={() => w.setExpenseOffset(w.expenseOffset + 30)}
                        disabled={blocked}
                      />
                    ) : null}
                  </Box>
                </>
              )}
            </>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
function ExpenseCard({
  p,
  ui,
  tr,
  cat,
}: {
  p: Expense;
  ui: CashUi;
  tr: T;
  cat: (id: string) => string;
}) {
  const { Text, Box } = ui;
  return (
    <Box>
      <Text heading>{cat(p.category) + " · ₹" + p.amount}</Text>
      <Text tone="accent">
        {tr(
          "expense_status." +
            (p.cancelled
              ? "cancelled"
              : Number(p.paid) === 0
                ? "unpaid"
                : Number(p.due) > 0
                  ? "part_paid"
                  : "paid"),
        )}
      </Text>
      <Text>{p.date + (p.payee ? " · " + p.payee : "")}</Text>
      <Text>
        {tr("paid") + ": ₹" + p.paid + " · " + tr("due") + ": ₹" + p.due}
      </Text>
      {p.date > cashDay() && !p.cancelled ? (
        <Text tone="muted">{tr("scheduled")}</Text>
      ) : null}
      {p.reference ? <Text>{p.reference}</Text> : null}
      {p.note ? <Text>{p.note}</Text> : null}
    </Box>
  );
}
