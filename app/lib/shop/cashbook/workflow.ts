import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { bindCashbook } from "./client";
import {
  cashDay,
  type CashAction,
  type CashRequest,
  type CashResult,
} from "./contract";
export interface CashStorage {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
}
export function useCashbook(
  api: ReturnType<typeof bindCashbook>,
  scope: string,
  shop: string,
  allowed: boolean,
  uuid: () => string,
  storage: CashStorage,
  digest: (s: string) => Promise<string>,
) {
  const [day, setDay] = useState(cashDay),
    [offset, setOffset] = useState(0),
    [expenseOffset, setExpenseOffset] = useState(0),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [pending, setPending] = useState<CashRequest | null>(null),
    [error, setError] = useState(""),
    [epoch, setEpoch] = useState(0),
    active = useRef(true),
    mutex = useRef(false),
    key = "cashbook-pending-v1:" + scope,
    qc = useQueryClient();
  const data = useQuery({
    queryKey: ["cashbook", shop, scope, day, offset, expenseOffset],
    queryFn: () => api.state(shop, day, offset, expenseOffset),
    enabled: allowed,
    retry: 1,
  });
  useEffect(() => {
    active.current = true;
    void storage
      .getItem(key)
      .then((raw) => {
        if (!active.current) return;
        if (raw) {
          const r = JSON.parse(raw);
          if (typeof r.clientId !== "string" || !r.action?.kind)
            throw Error("cashbook_storage");
          setPending(r);
        }
        setReady(true);
      })
      .catch(() => {
        if (active.current) setError("cashbook_storage");
      });
    return () => {
      active.current = false;
    };
  }, [key, epoch]);
  const refresh = () =>
    Promise.all(
      ["cashbook", "auditLog"].map((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      ),
    );
  const run = async (action?: CashAction): Promise<CashResult | null> => {
    if (mutex.current || !allowed || !ready) return null;
    mutex.current = true;
    setBusy(true);
    setError("");
    let r: CashRequest | undefined;
    try {
      r = pending ?? { clientId: uuid(), action: action! };
      if (!r.action) throw Error("cashbook_invalid");
      const raw = JSON.stringify(r),
        before = await storage.getItem(key);
      if (!active.current) return null;
      if (before && before !== raw) throw Error("cashbook_storage");
      await storage.setItem(key, raw);
      if (!active.current) return null;
      if ((await storage.getItem(key)) !== raw) throw Error("cashbook_storage");
      setPending(r);
      const result = await api.action(shop, r);
      if (!active.current) return null;
      if (result.status !== "recorded") throw Error("cashbook_failed");
      if (
        result.export &&
        result.export.hash !==
          (await digest(JSON.stringify({ content: result.export.content })))
      )
        throw Error("cashbook_failed");
      if ((await storage.getItem(key)) !== raw) throw Error("cashbook_storage");
      if (!active.current) return null;
      await storage.removeItem(key);
      if (!active.current) return null;
      setPending(null);
      if (r.action.kind === "expense") setExpenseOffset(0);
      await refresh();
      return result;
    } catch (e: any) {
      if (active.current) {
        setError(e.code ?? e.message ?? "cashbook_failed");
        if (
          e.status >= 400 &&
          e.status < 500 &&
          ![408, 429].includes(e.status) &&
          e.code !== "cashbook_conflict"
        ) {
          try {
            await storage.removeItem(key);
            if (active.current) {
              setPending(null);
              await refresh();
            }
          } catch {
            if (active.current) setError("cashbook_storage");
          }
        }
      }
      return null;
    } finally {
      mutex.current = false;
      if (active.current) setBusy(false);
    }
  };
  return {
    data,
    day,
    setDay: (d: string) => {
      setOffset(0);
      setDay(d);
    },
    offset,
    setOffset,
    expenseOffset,
    setExpenseOffset,
    busy,
    ready,
    pending,
    error,
    run,
    allowed,
    refresh,
    reloadStorage: () => setEpoch((n) => n + 1),
  };
}
