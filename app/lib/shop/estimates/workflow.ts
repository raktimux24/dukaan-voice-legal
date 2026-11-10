import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { bindEstimates } from "./client";
import type { EstimateAction, EstimateRequest, Estimate } from "./contract";
export type EstimateStorage = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
};
export function useEstimates(
  api: ReturnType<typeof bindEstimates>,
  scope: string,
  shop: string,
  allowed: boolean,
  uuid: () => string,
  storage: EstimateStorage,
) {
  const qc = useQueryClient(),
    [order, setOrder] = useState<Estimate | null>(null),
    [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [storageEpoch, setStorageEpoch] = useState(0),
    [pending, setPending] = useState<EstimateRequest | null>(null),
    key = "estimate-pending-v1:" + scope,
    active = useRef(true),
    mutex = useRef(false);
  const [querySearch, setQuerySearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setQuerySearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const list = useQuery({
      queryKey: ["estimates", shop, scope, offset],
      queryFn: () => api.list(shop, offset),
      enabled: allowed,
    }),
    options = useQuery({
      queryKey: ["estimateOptions", shop, scope, querySearch],
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
            throw Error("estimates_storage");
          setPending(r);
        }
        setReady(true);
      })
      .catch(() => {
        if (active.current) setError("estimates_storage");
      });
    return () => {
      active.current = false;
    };
  }, [key, storageEpoch]);
  const [preview, setPreview] = useState(false);
  const readiness = useQuery({
    queryKey: ["estimateReadiness", shop, scope, order?.id, order?.version],
    queryFn: () => api.readiness(shop, order!.id),
    enabled: allowed && !!order && order.status !== "draft",
  });
  const document = useQuery({
    queryKey: ["estimateDocument", shop, scope, order?.id, order?.version],
    queryFn: () => api.document(shop, order!.id),
    enabled: allowed && preview && !!order?.number,
  });
  const device = async () => {
    const key = "estimate-installation-v1";
    let id = await storage.getItem(key);
    if (!active.current) throw Error("estimates_scope");
    if (!id) {
      id = uuid();
      await storage.setItem(key, id);
      if ((await storage.getItem(key)) !== id) throw Error("estimates_storage");
    }
    return id;
  };
  const refresh = async () => {
    await Promise.all(
      [
        "estimates",
        "estimateOptions",
        "inventory",
        "catalog",
        "auditLog",
        "estimateReadiness",
        "sales",
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
      if (active.current) setError(e.code ?? e.message ?? "estimates_failed");
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const run = async (action?: EstimateAction) => {
    if (mutex.current || !allowed || !ready) return null;
    mutex.current = true;
    setBusy(true);
    setError("");
    try {
      const r = pending ?? { clientId: uuid(), action: action! };
      if (!r.action) throw Error("estimates_invalid");
      const raw = JSON.stringify(r);
      const prior = await storage.getItem(key);
      if (!active.current) return null;
      if (prior && prior !== raw) throw Error("estimates_storage");
      await storage.setItem(key, raw);
      if (!active.current) return null;
      if ((await storage.getItem(key)) !== raw)
        throw Error("estimates_storage");
      if (!active.current) return null;
      setPending(r);
      const result = await api.action(shop, r);
      if (!active.current) return null;
      if (result.shopId !== shop || !result.id || !result.version)
        throw Error("estimates_failed");
      if ((await storage.getItem(key)) !== raw)
        throw Error("estimates_storage");
      if (!active.current) return null;
      await storage.removeItem(key);
      if (!active.current) return null;
      setPending(null);
      setOrder(result);
      await refresh();
      return result;
    } catch (e: any) {
      if (active.current) {
        const code = e.code ?? e.message ?? "estimates_failed";
        setError(code);
        if (
          e.status >= 400 &&
          e.status < 500 &&
          e.status !== 408 &&
          e.status !== 429 &&
          code !== "estimates_conflict"
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
            if (active.current) setError("estimates_storage");
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
    order,
    setOrder,
    list,
    options,
    search,
    setSearch,
    offset,
    setOffset,
    busy,
    clearError: () => setError(""),
    error,
    ready,
    pending,
    open,
    run,
    allowed,
    readiness,
    document,
    preview,
    setPreview,
    device,
    reloadStorage: () => setStorageEpoch((n) => n + 1),
  };
}
