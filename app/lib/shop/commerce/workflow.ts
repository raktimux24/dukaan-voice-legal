import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { bindCommerce } from "./client";
import type { CommerceAction, CommerceRequest, OnlineOrder } from "./contract";
import { sendCommerceRequest } from "./requests";
type Storage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
};
export function useCommerce(
  api: ReturnType<typeof bindCommerce>,
  scope: string,
  shop: string,
  allowed: boolean,
  uuid: () => string,
  storage: Storage,
) {
  const qc = useQueryClient(),
    [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0),
    [orderOffset, setOrderOffset] = useState(0),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState<CommerceRequest | null>(null),
    [order, setOrder] = useState<OnlineOrder | null>(null),
    active = useRef(true),
    mutex = useRef(false),
    key = "commerce-pending-v1:" + scope;
  const store = useQuery({
      queryKey: ["commerceStore", shop, scope, search, offset],
      enabled: allowed,
      queryFn: () => api.store(shop, search, offset),
    }),
    orders = useQuery({
      queryKey: ["commerceOrders", shop, scope, orderOffset],
      enabled: allowed,
      queryFn: () => api.orders(shop, orderOffset),
      refetchInterval: 30000,
    });
  useEffect(() => {
    active.current = true;
    void storage
      .getItem(key)
      .then((raw) => {
        if (!active.current) return;
        if (raw) {
          const r = JSON.parse(raw);
          if (!r.clientId || !r.action?.kind) throw Error("commerce_storage");
          setPending(r);
        }
        setReady(true);
      })
      .catch(() => {
        if (active.current) setError("commerce_storage");
      });
    return () => {
      active.current = false;
    };
  }, [key]);
  const refresh = () =>
    Promise.all(
      [
        "commerceStore",
        "commerceOrders",
        "catalog",
        "inventory",
        "estimates",
        "sales",
        "cashbook",
      ].map((k) => qc.invalidateQueries({ queryKey: [k] })),
    );
  const open = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const p = await api.order(shop, id);
      if (active.current) setOrder(p);
    } catch (e: any) {
      if (active.current) setError(e.code ?? e.message ?? "commerce_failed");
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const run = async (action?: CommerceAction) => {
    if (mutex.current || !allowed || !ready) return;
    mutex.current = true;
    setBusy(true);
    setError("");
    try {
      const r = pending ?? { clientId: uuid(), action: action! };
      if (!r.action) throw Error("commerce_invalid");
      const result = await sendCommerceRequest({
        storage, key, request: r,
        send: request => api.action(shop, request),
        pending: request => { if (active.current) setPending(request); },
      });
      if (!active.current) return;
      if (result.order) setOrder(result.order);
      await refresh();
      return result;
    } catch (e: any) {
      if (active.current) {
        setError(e.code ?? e.message ?? "commerce_failed");
        if (e.code === "commerce_stale") await refresh();
      }
    } finally {
      mutex.current = false;
      if (active.current) setBusy(false);
    }
  };
  const reset = async () => {
    if (busy) return;
    try {
      await storage.removeItem(key);
      if (active.current) {
        setPending(null);
        setError("");
      }
    } catch {
      if (active.current) setError("commerce_storage");
    }
  };
  return {
    store,
    orders,
    order,
    setOrder,
    search,
    setSearch,
    offset,
    setOffset,
    orderOffset,
    setOrderOffset,
    busy,
    ready,
    error,
    setError,
    pending,
    run,
    open,
    refresh,
    reset,
    allowed,
  };
}
