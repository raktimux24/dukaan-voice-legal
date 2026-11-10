import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { BarcodeRequest, BarcodeOutcome } from "./contract";
import type { BarcodesApi } from "./client";
export function useBarcodes(
  api: BarcodesApi,
  scope: { shopId: string; actorId: string; generation?: number },
  allowed: boolean,
) {
  const key =
      scope.shopId + ":" + scope.actorId + ":" + (scope.generation ?? 0),
    current = useRef(key);
  current.current = key;
  const running = useRef(false),
    cache = useQueryClient();
  const [busy, setBusy] = useState(false),
    [pending, setPending] = useState<BarcodeRequest | null>(null),
    [error, setError] = useState<unknown>(null),
    [outcome, setOutcome] = useState<BarcodeOutcome | null>(null);
  const metadata = useQuery({
    queryKey: ["barcodes", scope.shopId, scope.actorId, scope.generation],
    queryFn: () => api.metadata(scope.shopId),
    enabled: !!scope.shopId && !!scope.actorId && allowed,
    retry: false,
  });
  useEffect(() => {
    setBusy(false);
    setPending(null);
    setError(null);
    setOutcome(null);
    running.current = false;
    return () => {
      if (current.current === key) current.current = "";
    };
  }, [key]);
  const refresh = () =>
    Promise.all(
      [
        "barcodes",
        "barcodeProduct",
        "barcodePng",
        "catalog",
        "inventory",
        "inventoryStats",
        "auditLog",
      ].map((query) =>
        cache.invalidateQueries({ queryKey: [query, scope.shopId] }),
      ),
    );
  const apply = async (input: BarcodeRequest) => {
    if (running.current || !allowed) return;
    const captured = key;
    const active = () => current.current === captured;
    running.current = true;
    setBusy(true);
    setError(null);
    setPending(input);
    try {
      let result: BarcodeOutcome;
      try {
        result = await api.apply(scope.shopId, input);
      } catch (failure) {
        if (!active()) return;
        try {
          result = await api.outcome(scope.shopId, input.clientId);
        } catch {
          throw failure;
        }
      }
      if (!active()) return;
      setOutcome(result);
      setPending(null);
      await refresh();
    } catch (e) {
      if (active()) {
        setError(e);
        const status = (e as { status?: number })?.status;
        if (status && status >= 400 && status < 500 && status !== 429)
          setPending(null);
      }
    } finally {
      if (active()) {
        running.current = false;
        setBusy(false);
      }
    }
  };
  const recover = async () => {
    if (!pending || running.current) return;
    const captured = key;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await api.outcome(scope.shopId, pending.clientId);
      if (current.current !== captured) return;
      setOutcome(result);
      setPending(null);
      await refresh();
    } catch (e) {
      if (current.current === captured) {
        if ((e as { code?: string })?.code === "barcode_request_missing") {
          running.current = false;
          setBusy(false);
          await apply(pending);
          return;
        }
        setError(e);
      }
    } finally {
      if (current.current === captured) {
        running.current = false;
        setBusy(false);
      }
    }
  };
  return { metadata, busy, pending, error, outcome, apply, recover, refresh };
}
