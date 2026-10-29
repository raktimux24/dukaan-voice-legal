import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { bindCredit } from "./client";
import type { CreditAction, CreditRequest, CreditStatement } from "./contract";
import type { CashStorage } from "../cashbook/workflow";
import { verifyStatement } from "./statement";
export function useCredit(
  api: ReturnType<typeof bindCredit>,
  shop: string,
  customer: string,
  scope: string,
  allowed: boolean,
  uuid: () => string,
  storage: CashStorage,
  digest: (s: string) => Promise<string>,
) {
  const [pending, setPending] = useState<CreditRequest | null>(null),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [statement, setStatement] = useState<CreditStatement | null>(null),
    [epoch, setEpoch] = useState(0),
    active = useRef(true),
    lock = useRef(false),
    key = "customer-credit-pending-v1:" + scope,
    qc = useQueryClient(),
    data = useQuery({
      queryKey: ["customerCredit", shop, customer, scope],
      queryFn: () => api.state(shop, customer),
      enabled: allowed,
      retry: 1,
    });
  useEffect(() => {
    active.current = true;
    setReady(false);
    storage
      .getItem(key)
      .then((raw) => {
        if (!active.current) return;
        if (raw) {
          const r = JSON.parse(raw);
          if (!r.clientId || !r.action?.kind) throw Error("credit_storage");
          setPending(r);
        }
        setReady(true);
        setError("");
      })
      .catch(() => {
        if (active.current) setError("credit_storage");
      });
    return () => {
      active.current = false;
    };
  }, [key, epoch]);
  const refresh = () =>
    Promise.all(
      ["customerCredit", "customers", "customer", "auditLog", "followup", "followups"].map((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      ),
    );
  const run = async (action?: CreditAction) => {
    if (lock.current || !allowed || !ready) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const r = pending ?? { clientId: uuid(), action: action! },
        raw = JSON.stringify(r),
        old = await storage.getItem(key);
      if (!active.current) return;
      if (old && old !== raw) throw Error("credit_storage");
      await storage.setItem(key, raw);
      if (!active.current) return;
      if ((await storage.getItem(key)) !== raw) throw Error("credit_storage");
      setPending(r);
      const result = await api.action(shop, customer, r);
      if (!active.current) return;
      if (result.status !== "recorded") throw Error("credit_failed");
      if (result.statement) await verifyStatement(result.statement, digest);
      if (!active.current) return;
      if ((await storage.getItem(key)) !== raw) throw Error("credit_storage");
      await storage.removeItem(key);
      if (!active.current) return;
      setPending(null);
      if (result.statement) setStatement(result.statement);
      await refresh();
      return result;
    } catch (e: any) {
      if (active.current) {
        setError(e.code ?? e.message ?? "credit_failed");
        if (
          e.status >= 400 &&
          e.status < 500 &&
          ![408, 429].includes(e.status) &&
          e.code !== "credit_conflict"
        )
          try {
            await storage.removeItem(key);
            if (active.current) setPending(null);
          } catch {
            if (active.current) setError("credit_storage");
          }
      }
    } finally {
      lock.current = false;
      if (active.current) setBusy(false);
    }
  };
  const open = async (id: string) => {
    if (lock.current || !allowed) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const s = await api.statement(shop, customer, id);
      await verifyStatement(s, digest);
      if (active.current) setStatement(s);
    } catch (e: any) {
      if (active.current) setError(e.code ?? e.message ?? "credit_failed");
    } finally {
      lock.current = false;
      if (active.current) setBusy(false);
    }
  };
  return {
    data,
    pending,
    ready,
    busy,
    error,
    statement,
    clearStatement: () => setStatement(null),
    run,
    open,
    refresh,
    allowed,
    reloadStorage: () => setEpoch((x) => x + 1),
  };
}
