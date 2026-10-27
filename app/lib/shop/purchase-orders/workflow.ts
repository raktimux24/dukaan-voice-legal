import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { bindPurchaseOrders } from "./client";
import type { PoAction, PoRequest, PurchaseOrder } from "./contract";
export type PoStorage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
};
export function usePurchaseOrders(
  api: ReturnType<typeof bindPurchaseOrders>,
  scope: string,
  shop: string,
  allowed: boolean,
  uuid: () => string,
  storage: PoStorage,
) {
  const qc = useQueryClient(),
    [order, setOrder] = useState<PurchaseOrder | null>(null),
    [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [pending, setPending] = useState<PoRequest | null>(null),
    key = "po-pending-v1:" + scope,
    active = useRef(true),
    mutex = useRef(false);
  const [querySearch, setQuerySearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setQuerySearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const list = useQuery({
      queryKey: ["purchaseOrders", shop, scope, offset],
      queryFn: () => api.list(shop, offset),
      enabled: allowed,
    }),
    options = useQuery({
      queryKey: ["poOptions", shop, scope, querySearch],
      queryFn: () => api.options(shop, querySearch),
      enabled: allowed,
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
            throw Error("po_storage");
          setPending(r);
        }
        setReady(true);
      })
      .catch(() => {
        if (active.current) setError("po_storage");
      });
    return () => {
      active.current = false;
    };
  }, [key]);
  const refresh = async () => {
    await Promise.all(
      [
        "purchaseOrders",
        "poOptions",
        "buy-list",
        "buyList",
        "inventory",
        "catalog",
        "auditLog",
        "purchaseLinkBatches",
      ].map((k) => qc.invalidateQueries({ queryKey: [k] })),
    );
  };
  const open = async (id: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const p = await api.get(shop, id);
      if (active.current) setOrder(p);
    } catch (e: any) {
      if (active.current) setError(e.code ?? e.message ?? "po_failed");
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const run = async (action?: PoAction) => {
    if (mutex.current || !allowed || !ready) return false;
    mutex.current = true;
    setBusy(true);
    setError("");
    try {
      const r = pending ?? { clientId: uuid(), action: action! };
      if (!r.action) throw Error("po_invalid");
      const raw = JSON.stringify(r);
      const prior = await storage.getItem(key);
      if (!active.current) return false;
      if (prior && prior !== raw) throw Error("po_storage");
      await storage.setItem(key, raw);
      if (!active.current) return false;
      if ((await storage.getItem(key)) !== raw) throw Error("po_storage");
      if (!active.current) return false;
      setPending(r);
      const result = await api.action(shop, r);
      if (!active.current) return false;
      if (result.shopId !== shop || !result.id || !result.version)
        throw Error("po_failed");
      if ((await storage.getItem(key)) !== raw) throw Error("po_storage");
      if (!active.current) return false;
      await storage.removeItem(key);
      if (!active.current) return false;
      setPending(null);
      setOrder(result);
      await refresh();
      return true;
    } catch (e: any) {
      if (active.current) {
        const code = e.code ?? e.message ?? "po_failed";
        setError(code);
        if (
          e.status >= 400 &&
          e.status < 500 &&
          e.status !== 408 &&
          e.status !== 429 &&
          code !== "po_request_conflict"
        ) {
          try {
            await storage.removeItem(key);
            if (active.current) {
              setPending(null);
              const target = pending?.action ?? action;
              if (target && "id" in target)
                setOrder(await api.get(shop, target.id));
              await refresh();
            }
          } catch {
            if (active.current) setError("po_storage");
          }
        }
      }
      return false;
    } finally {
      mutex.current = false;
      if (active.current) setBusy(false);
    }
  };
  return {
    order,
    setOrder,
    list,
    options,
    search,
    setSearch,
    offset,
    setOffset,
    busy,
    error,
    ready,
    pending,
    open,
    run,
    allowed,
  };
}
