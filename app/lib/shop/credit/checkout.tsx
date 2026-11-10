import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { bindCredit } from "./client";
import type { CashUi } from "../cashbook/view";
import { creditError } from "./view";
import type { CreditTerms } from "./contract";
export function useCheckoutCredit(
  api: ReturnType<typeof bindCredit>,
  shop: string,
  scope: string,
  customerId: string | null,
  phone: string | null,
  selected: boolean,
  proposed: number,
) {
  const [due, setDue] = useState<string | null | undefined>(),
    [ack, setAck] = useState(false),
    [override, setOverride] = useState("");
  useEffect(() => {
    setDue(undefined);
    setAck(false);
    setOverride("");
  }, [shop, scope, customerId, phone]);
  const q = useQuery({
    queryKey: ["checkoutCredit", shop, scope, customerId, phone, proposed, due],
    queryFn: () => api.check(shop, customerId, proposed.toFixed(2), due, phone),
    enabled: !!shop && selected && Number.isFinite(proposed) && proposed > 0,
    retry: false,
    staleTime: 0,
  });
  useEffect(() => {
    setAck(false);
  }, [q.dataUpdatedAt, proposed, due]);
  const d = q.data,
    valid =
      proposed <= 0 ||
      (selected &&
        !!d &&
        !q.isFetching &&
        !q.error &&
        (!d.blocked || (d.canOverride && !!override.trim())) &&
        (!d.warnings.length || ack)),
    terms: CreditTerms | undefined =
      valid && d
        ? {
            dueDate: d.dueDate,
            acknowledged: true,
            ...(override.trim() ? { overrideReason: override.trim() } : {}),
          }
        : undefined;
  return {
    q,
    valid,
    terms,
    due,
    setDue,
    ack,
    setAck,
    override,
    setOverride,
    selected,
    proposed,
  };
}
export function CheckoutCreditView({
  w,
  ui,
  t,
}: {
  w: ReturnType<typeof useCheckoutCredit>;
  ui: CashUi;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const { Box, Text, Input, Button, Check, Totals } = ui,
    tr = (k: string) => t("credit." + k),
    d = w.q.data;
  if (w.proposed <= 0) return null;
  return (
    <Box card>
      <Text heading>{tr("checkout_title")}</Text>
      <Text tone="muted">{tr("checkout_intro")}</Text>
      {!w.selected ? (
        <Text tone="danger">{tr("choose_customer")}</Text>
      ) : (
        <>
          {w.q.isFetching ? <ui.Busy label={tr("checking")} /> : null}
          {w.q.error ? (
            <Text tone="danger" live>
              {tr("online")}
            </Text>
          ) : null}
          {d ? (
            <>
              <Totals
                items={[
                  ["balance", d.balance],
                  ["proposed", d.proposed],
                  ["resulting", d.resulting],
                  ["overdue", d.overdue],
                ].map(([k, v]) => ({ label: tr(k), value: "₹" + v }))}
              />
              <Text>
                {tr("checkout_limit") +
                  ": " +
                  (d.limit === null ? tr("no_limit") : "₹" + d.limit)}
              </Text>
              <Input
                label={tr("due")}
                value={d.dueDate ?? ""}
                type="date"
                onChange={(v) => w.setDue(v || null)}
                disabled={w.q.isFetching}
              />
              {d.warnings.map((k) => (
                <Text
                  key={k}
                  tone={
                    k === "overdue" || k === "limit" || k === "disabled"
                      ? "danger"
                      : "muted"
                  }
                >
                  {tr("warning." + k)}
                </Text>
              ))}
              {d.blocked ? <Text tone="danger">{tr("blocked")}</Text> : null}
              {d.canOverride ? (
                <Input
                  label={tr("override")}
                  value={w.override}
                  onChange={w.setOverride}
                  disabled={w.q.isFetching}
                />
              ) : null}
              {d.warnings.length ? (
                <Check
                  label={tr("ack")}
                  value={w.ack}
                  onChange={w.setAck}
                  disabled={w.q.isFetching}
                />
              ) : null}
            </>
          ) : null}
          <Button
            label={tr("refresh")}
            disabled={w.q.isFetching}
            onPress={() => void w.q.refetch()}
          />
        </>
      )}
    </Box>
  );
}
