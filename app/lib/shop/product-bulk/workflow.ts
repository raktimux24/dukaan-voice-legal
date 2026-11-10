import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkPaise,
  type BulkChanges,
  type BulkSelection,
  type BulkJob,
} from "./contract";
import type { ProductBulkApi } from "./client";
type Op =
  | { kind: "create"; id: string; selection: BulkSelection }
  | {
      kind: "review";
      id: string;
      version: number;
      changes: BulkChanges;
      batch: number;
      refresh: boolean;
    }
  | { kind: "apply"; id: string; version: number; clientId: string };
export function validBulkDraft(d: BulkChanges) {
  if (!Object.keys(d).length) return false;
  if (d.category && (!d.category.category || !d.category.subcategory))
    return false;
  if (
    d.minStockLevel !== undefined &&
    (!Number.isInteger(d.minStockLevel) ||
      d.minStockLevel < 0 ||
      d.minStockLevel > 1000000000)
  )
    return false;
  try {
    for (const f of ["sellingPrice", "mrp"] as const)
      if (d[f]) {
        const n = bulkPaise(d[f].value);
        if (d[f].mode.includes("percent") && n > 1000000n) return false;
      }
  } catch {
    return false;
  }
  return true;
}
export function useProductBulk(
  api: ProductBulkApi,
  scope: { shopId: string; actorId: string; generation?: number },
  allowed: boolean,
  makeId: () => string,
) {
  const cache = useQueryClient(),
    key = scope.shopId + ":" + scope.actorId + ":" + (scope.generation ?? 0),
    current = useRef(key);
  current.current = key;
  const running = useRef(false),
    [job, setJob] = useState<BulkJob | null>(null),
    [draft, setDraft] = useState<BulkChanges>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [pending, setPending] = useState<Op | null>(null);
  const meta = useQuery({
    queryKey: ["productBulk", scope.shopId, scope.actorId, scope.generation],
    queryFn: () => api.metadata(scope.shopId),
    enabled: !!scope.shopId && !!scope.actorId && allowed,
    retry: false,
  });
  useEffect(() => {
    setJob(null);
    setDraft({});
    setError(null);
    setPending(null);
    setBusy(false);
    running.current = false;
    return () => {
      if (current.current === key) current.current = "";
    };
  }, [key]);
  const invalidate = () =>
    Promise.all(
      ["productBulk", "inventory", "inventoryStats", "catalog", "auditLog"].map(
        (k) => cache.invalidateQueries({ queryKey: [k, scope.shopId] }),
      ),
    );
  const execute = async (op: Op) => {
    if (running.current || !allowed) return;
    const captured = key,
      active = () => current.current === captured;
    running.current = true;
    setBusy(true);
    setError(null);
    setPending(op);
    try {
      let result: BulkJob;
      try {
        result =
          op.kind === "create"
            ? await api.create(scope.shopId, {
                clientId: op.id,
                selection: op.selection,
              })
            : op.kind === "review"
              ? await api.review(scope.shopId, op.id, {
                  version: op.version,
                  changes: op.changes,
                  batch: op.batch,
                  refresh: op.refresh,
                })
              : await api.apply(scope.shopId, op.id, {
                  version: op.version,
                  clientId: op.clientId,
                });
      } catch (failure) {
        if (!active()) return;
        const status = (failure as { status?: number })?.status;
        if (
          status &&
          status >= 400 &&
          status < 500 &&
          status !== 408 &&
          status !== 429
        )
          throw failure;
        const latest = await api.get(scope.shopId, op.id).catch(() => null);
        const confirmed =
          latest &&
          (op.kind === "create" ||
            (op.kind === "apply" &&
              latest.completed.some((r) => r.requestId === op.clientId)) ||
            (op.kind === "review" &&
              latest.version > op.version &&
              JSON.stringify(latest.changes) === JSON.stringify(op.changes)));
        if (!confirmed) throw failure;
        result = latest!;
      }
      if (!active()) return;
      setJob(result);
      setDraft(result.changes);
      setPending(null);
      await invalidate();
    } catch (e) {
      if (active()) {
        setError(e);
        const status = (e as { status?: number })?.status;
        if (
          status &&
          status >= 400 &&
          status < 500 &&
          status !== 429 &&
          status !== 408
        )
          setPending(null);
      }
    } finally {
      if (active()) {
        running.current = false;
        setBusy(false);
      }
    }
  };
  const open = async (id: string) => {
    if (running.current || !allowed) return;
    const captured = key;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await api.get(scope.shopId, id);
      if (current.current === captured) {
        setJob(result);
        setDraft(result.changes);
        setPending(null);
      }
    } catch (e) {
      if (current.current === captured) setError(e);
    } finally {
      if (current.current === captured) {
        setBusy(false);
        running.current = false;
      }
    }
  };
  const next = job
    ? Array.from({ length: job.batches }, (_, i) => i + 1).find(
        (batch) => !job.completed.some((r) => r.batch === batch),
      )
    : undefined;
  return {
    job,
    draft,
    setDraft,
    busy,
    error,
    pending,
    meta,
    next,
    start: (selection: BulkSelection) =>
      execute({ kind: "create", id: makeId(), selection }),
    open,
    review: (refresh = false) =>
      job && next
        ? execute({
            kind: "review",
            id: job.id,
            version: job.version,
            changes: draft,
            batch: job.state === "applied" ? next : job.batch,
            refresh,
          })
        : undefined,
    apply: () =>
      job
        ? execute({
            kind: "apply",
            id: job.id,
            version: job.version,
            clientId: makeId(),
          })
        : undefined,
    recover: () => (pending ? execute(pending) : undefined),
  };
}
