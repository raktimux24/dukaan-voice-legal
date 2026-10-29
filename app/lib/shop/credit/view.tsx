import { useEffect, useState, type ComponentType } from "react";
import type { CashUi } from "../cashbook/view";
import {
  creditDay,
  creditDisplayDate,
  type CreditStatement,
  type CreditPolicy,
} from "./contract";
import type { useCredit } from "./workflow";
type T = (k: string, v?: Record<string, string | number>) => string;
export const creditError = (e: unknown) => {
  const raw = (e as any)?.code ?? (e as any)?.message ?? String(e ?? "");
  return /^credit_(invalid|amount|reason|date|not_allowed|owner|not_found|conflict|blocked|review|allocation|too_many|storage|unavailable)$/.test(
    raw,
  )
    ? "credit.error." + raw.slice(7)
    : "credit.error.failed";
};
export function CreditView({
  w,
  ui,
  t,
  language,
  reviewCollections,
  Statement,
}: {
  w: ReturnType<typeof useCredit>;
  ui: CashUi;
  t: T;
  language: string;
  reviewCollections: () => void;
  Statement: ComponentType<{ statement: CreditStatement }>;
}) {
  const { Box, Text, Input, Button, Check, Select, Totals } = ui,
    tr = (k: string, v?: Record<string, string | number>) =>
      t("credit." + k, v),
    d = w.data.data,
    [tab, setTab] = useState("statement"),
    [target, setTarget] = useState("customer"),
    [form, setForm] = useState(""),
    [policy, setPolicy] = useState<CreditPolicy>({
      enabled: true,
      limit: null,
      termDays: null,
      mode: "warn",
      allowOverride: false,
    }),
    [reason, setReason] = useState(""),
    [due, setDue] = useState(""),
    [source, setSource] = useState(""),
    [receipt, setReceipt] = useState(""),
    [amount, setAmount] = useState(""),
    [reverse, setReverse] = useState(""),
    [from, setFrom] = useState(() => creditDay().slice(0, 8) + "01"),
    [to, setTo] = useState(creditDay),
    [saved, setSaved] = useState(false),
    [limit, setLimit] = useState(30),
    blocked = w.busy || !!w.pending || !w.ready;
  useEffect(() => {
    if (d) setPolicy(target === "shop" ? d.shopPolicy : d.policy);
  }, [target, d]);
  const run = async (a: Parameters<typeof w.run>[0]) => {
    setSaved(false);
    const r = await w.run(a);
    if (r) {
      setForm("");
      setSaved(true);
      setReason("");
    }
  };
  if (!w.allowed) return <Text tone="danger">{tr("error.not_allowed")}</Text>;
  return (
    <Box>
      <Text tone="muted">{tr("intro")}</Text>
      {w.data.isPending || w.busy ? (
        <ui.Busy label={t("common.loading")} />
      ) : null}
      {w.error || w.data.error ? (
        <Box card>
          <Text tone="danger" live>
            {t(creditError(w.error || w.data.error))}
          </Text>
          <Button
            label={t("common.retry")}
            onPress={() => {
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
            onPress={() => void run(undefined)}
          />
        </Box>
      ) : null}
      {saved ? <Text live>{tr("saved")}</Text> : null}
      {d ? (
        <>
          <Text heading>{d.customer.name}</Text>
          <Button
            label={tr("refresh")}
            disabled={blocked}
            onPress={() => void w.refresh()}
          />
          <Totals
            items={[
              ["balance", d.balance],
              ["overdue", d.overdue],
              ["unassigned", d.unassigned],
            ].map(([k, v]) => ({ label: tr(k), value: "₹" + v }))}
          />
          {Number(d.balance) < 0 ? (
            <Text tone="accent">
              {tr("we_owe", { amount: Math.abs(Number(d.balance)).toFixed(2) })}
            </Text>
          ) : null}
          {Number(d.unassigned) > 0 ? (
            <Box card>
              <Text tone="muted">{tr("unassigned_help")}</Text>
              <Button
                label={tr("review_collections")}
                onPress={reviewCollections}
              />
            </Box>
          ) : null}
          <Box row>
            <Button
              label={tr("items")}
              primary={tab === "items"}
              onPress={() => {
                setTab("items");
                setForm("");
              }}
            />
            <Button
              label={tr("statement")}
              primary={tab === "statement"}
              onPress={() => {
                setTab("statement");
                setForm("");
              }}
            />
            <Button
              label={tr("policy")}
              primary={tab === "policy"}
              onPress={() => {
                setTab("policy");
                setForm("");
              }}
            />
          </Box>
          {tab === "policy" ? (
            <Box card>
              <Text heading>
                {tr(target === "shop" ? "shop_policy" : "customer_policy")}
              </Text>
              {d.role === "OWNER" ? (
                <Select
                  label={tr("policy")}
                  value={target}
                  options={[
                    { value: "customer", label: tr("customer_policy") },
                    { value: "shop", label: tr("shop_policy") },
                  ]}
                  onChange={(v) => {
                    setTarget(v);
                    setReason("");
                  }}
                  disabled={blocked}
                />
              ) : null}
              <Text tone="muted">{tr("policy_help")}</Text>
              <Check
                label={tr("enabled")}
                value={policy.enabled}
                onChange={(v) => setPolicy((p) => ({ ...p, enabled: v }))}
                disabled={blocked}
              />
              <Input
                label={tr("limit")}
                type="decimal"
                value={policy.limit ?? ""}
                onChange={(v) =>
                  setPolicy((p) => ({ ...p, limit: v.trim() || null }))
                }
                disabled={blocked}
              />
              <Input
                label={tr("term_days")}
                type="decimal"
                value={policy.termDays === null ? "" : String(policy.termDays)}
                onChange={(v) =>
                  setPolicy((p) => ({
                    ...p,
                    termDays: v.trim() === "" ? null : Number(v),
                  }))
                }
                disabled={blocked}
              />
              <Check
                label={tr("strict")}
                value={policy.mode === "block"}
                onChange={(v) =>
                  setPolicy((p) => ({ ...p, mode: v ? "block" : "warn" }))
                }
                disabled={blocked}
              />
              <Check
                label={tr("allow_override")}
                value={policy.allowOverride}
                onChange={(v) => setPolicy((p) => ({ ...p, allowOverride: v }))}
                disabled={blocked}
              />
              <Input
                label={tr("reason")}
                value={reason}
                onChange={setReason}
                disabled={blocked}
              />
              <Button
                label={tr("save_policy")}
                primary
                disabled={blocked || !reason.trim()}
                onPress={() =>
                  void run({
                    kind: "policy",
                    target: target as "customer" | "shop",
                    policy,
                    reason,
                  })
                }
              />
              {target === "customer" && d.customPolicy ? (
                <Button
                  label={tr("reset_policy")}
                  disabled={blocked || !reason.trim()}
                  onPress={() =>
                    void run({
                      kind: "policy",
                      target: "customer",
                      policy: null,
                      reason,
                    })
                  }
                />
              ) : null}
            </Box>
          ) : tab === "statement" ? (
            <>
              {w.statement ? (
                <>
                  <Button label={tr("back")} onPress={w.clearStatement} />
                  <Statement statement={w.statement} />
                </>
              ) : (
                <Box card>
                  <Text heading>{tr("statement")}</Text>
                  <Input
                    label={tr("from")}
                    type="date"
                    value={from}
                    onChange={setFrom}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("to")}
                    type="date"
                    value={to}
                    onChange={setTo}
                    disabled={blocked}
                  />
                  <Text tone="muted">{tr("export_help")}</Text>
                  <Button
                    label={tr("create_statement")}
                    primary
                    disabled={blocked || !from || !to}
                    onPress={() =>
                      void run({ kind: "statement", from, to, language })
                    }
                  />
                </Box>
              )}
              <Box card>
                <Text heading>{tr("saved_statements")}</Text>
                {d.statements.length ? (
                  d.statements.map((s) => (
                    <Button
                      key={s.id}
                      label={
                        tr("open_statement") +
                        " · " +
                        creditDisplayDate(s.from, language) +
                        " — " +
                        creditDisplayDate(s.to, language)
                      }
                      disabled={blocked}
                      onPress={() => void w.open(s.id)}
                    />
                  ))
                ) : (
                  <Text tone="muted">{tr("no_statements")}</Text>
                )}
              </Box>
            </>
          ) : (
            <>
              <Text heading>{tr("obligations")}</Text>
              {!d.obligations.length ? (
                <Text tone="muted">{tr("no_obligations")}</Text>
              ) : null}
              {d.obligations.slice(0, limit).map((o) => (
                <Box card key={o.key}>
                  <Text heading>
                    {tr("kind." + o.kind) +
                      (o.reference ? " · " + o.reference : "")}
                  </Text>
                  <Text tone="accent">{tr("status." + o.status)}</Text>
                  <Text>
                    {tr("original") +
                      ": ₹" +
                      o.original +
                      " · " +
                      tr("remaining") +
                      ": ₹" +
                      o.remaining}
                  </Text>
                  <Text
                    tone={
                      o.dueDate &&
                      o.dueDate < creditDay() &&
                      Number(o.remaining) > 0
                        ? "danger"
                        : "muted"
                    }
                  >
                    {tr("due") +
                      ": " +
                      (o.dueDate
                        ? creditDisplayDate(o.dueDate, language)
                        : tr("no_due"))}
                  </Text>
                  <Button
                    label={tr("change_due")}
                    disabled={blocked}
                    onPress={() => {
                      setSource(o.key);
                      setDue(o.dueDate ?? "");
                      setReason("");
                      setForm("due");
                    }}
                  />
                  {form === "due" && source === o.key ? (
                    <>
                      <Text tone="muted">{tr("due_help")}</Text>
                      <Input
                        label={tr("due")}
                        type="date"
                        value={due}
                        onChange={setDue}
                        disabled={blocked}
                      />
                      <Input
                        label={tr("reason")}
                        value={reason}
                        onChange={setReason}
                        disabled={blocked}
                      />
                      <Button
                        primary
                        label={tr("save_due")}
                        disabled={blocked || !reason.trim()}
                        onPress={() =>
                          void run({
                            kind: "due",
                            sourceKey: o.key,
                            dueDate: due || null,
                            reason,
                          })
                        }
                      />
                    </>
                  ) : null}
                  {o.history.map((h, i) => (
                    <Text key={i} tone="muted">
                      {(h.dueDate
                        ? creditDisplayDate(h.dueDate, language)
                        : tr("no_due")) +
                        " · " +
                        h.reason +
                        " · " +
                        creditDisplayDate(h.at, language, true)}
                    </Text>
                  ))}
                </Box>
              ))}
              {d.obligations.length > limit ? (
                <Button
                  label={t("imports.more")}
                  onPress={() => setLimit((n) => n + 30)}
                />
              ) : null}
              {d.obligations.some(
                (o) => o.kind === "opening" && Number(o.remaining) > 0,
              ) && d.receipts.length ? (
                <Box card>
                  <Text heading>{tr("allocate")}</Text>
                  <Text tone="muted">{tr("allocation_help")}</Text>
                  <Select
                    label={tr("receipt")}
                    value={receipt}
                    options={[
                      { value: "", label: tr("receipt") },
                      ...d.receipts.map((r) => ({
                        value: r.id,
                        label: creditDay(r.date) + " · ₹" + r.amount,
                      })),
                    ]}
                    onChange={setReceipt}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("allocation_amount")}
                    type="decimal"
                    value={amount}
                    onChange={setAmount}
                    disabled={blocked}
                  />
                  <Input
                    label={tr("reason")}
                    value={reason}
                    onChange={setReason}
                    disabled={blocked}
                  />
                  <Button
                    primary
                    label={tr("allocate_save")}
                    disabled={blocked || !receipt || !amount || !reason.trim()}
                    onPress={() =>
                      void run({
                        kind: "allocate_opening",
                        ledgerId: receipt,
                        amount,
                        reason,
                      })
                    }
                  />
                </Box>
              ) : null}
              {d.allocations.length ? (
                <Box card>
                  <Text heading>{tr("allocations")}</Text>
                  {d.allocations.map((a) => (
                    <Box key={a.id}>
                      <Text>{"₹" + a.amount + " · " + a.reason}</Text>
                      {a.reversed ? (
                        <Text tone="muted">
                          {tr("event.reverse_allocation")}
                        </Text>
                      ) : (
                        <Button
                          label={tr("reverse_allocation")}
                          disabled={blocked}
                          onPress={() => {
                            setReverse(a.id);
                            setReason("");
                            setForm("reverse");
                          }}
                        />
                      )}
                      {form === "reverse" && reverse === a.id ? (
                        <>
                          <Text tone="muted">{tr("reversal_help")}</Text>
                          <Input
                            label={tr("reason")}
                            value={reason}
                            onChange={setReason}
                          />
                          <Button
                            label={tr("reverse_allocation")}
                            disabled={blocked || !reason.trim()}
                            onPress={() =>
                              void run({
                                kind: "reverse_allocation",
                                allocationId: a.id,
                                reason,
                              })
                            }
                          />
                        </>
                      ) : null}
                    </Box>
                  ))}
                </Box>
              ) : null}
            </>
          )}
          <Box card>
            <Text heading>{tr("history")}</Text>
            {d.history.length ? (
              d.history.map((h, i) => (
                <Text key={i}>
                  {tr("event." + h.kind) +
                    " · " +
                    creditDisplayDate(h.at, language, true) +
                    " · " +
                    h.reason}
                </Text>
              ))
            ) : (
              <Text tone="muted">{tr("no_history")}</Text>
            )}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
