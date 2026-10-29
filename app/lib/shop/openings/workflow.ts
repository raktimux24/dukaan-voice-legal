import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emptyOpeningDraft,
  rowForOpeningTarget,
  type OpeningTarget,
  type OpeningEntry,
  type OpeningDraft,
  type OpeningSession,
  type OpeningSection,
  type OpeningPending,
  type OpeningMode,
  type OpeningConfirmation,
  type OpeningSupplierPayment,
} from "./contract";
import type { OpeningsApi } from "./client";
import {
  decodeOpeningPending,
  retainOpeningRequest,
  type OpeningStorage,
} from "./retained";
export function useOpenings(
  api: OpeningsApi,
  scope: { shopId: string; actorId: string; generation?: number },
  enabled: boolean,
  newId: () => string,
  storage: OpeningStorage,
  localPendingCount: () => Promise<number>,
  online: () => Promise<boolean>,
) {
  const key =
      scope.actorId + ":" + scope.shopId + ":" + (scope.generation ?? 0),
    storageKey = "opening-pending-v1:" + scope.actorId + ":" + scope.shopId,
    current = useRef(key),
    running = useRef(false);
  current.current = key;
  const qc = useQueryClient(),
    [session, setSession] = useState<OpeningSession | null>(null),
    [draft, setDraft] = useState<OpeningDraft>(emptyOpeningDraft),
    [view, setView] = useState<
      "hub" | "edit" | "review" | "history" | "suppliers"
    >("hub"),
    [section, setSection] = useState<OpeningSection>("stock"),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [offset, setOffset] = useState(0),
    [historyOffset, setHistoryOffset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [pending, setPending] = useState<OpeningPending | null>(null),
    [message, setMessage] = useState("");
  const createIntent = useRef<{
    clientId: string;
    origin: "settings" | "onboarding";
    mode: OpeningMode;
  } | null>(null);
  const metadata = useQuery({
    queryKey: ["openingMeta", scope.shopId, scope.actorId, scope.generation],
    queryFn: () => api.metadata(scope.shopId),
    enabled: enabled && !!scope.shopId && !!scope.actorId,
    retry: false,
  });
  const targets = useQuery({
    queryKey: [
      "openingTargets",
      scope.shopId,
      scope.actorId,
      scope.generation,
      view === "suppliers" ? "supplier" : section,
      query,
      offset,
    ],
    queryFn: () =>
      api.targets(
        scope.shopId,
        view === "suppliers" ? "supplier" : section,
        query,
        offset,
      ),
    enabled:
      enabled &&
      (view === "suppliers" ||
        (view === "edit" &&
          !!session &&
          ["stock", "customer", "supplier"].includes(section))),
    retry: false,
  });
  const history = useQuery({
    queryKey: [
      "openingHistory",
      scope.shopId,
      scope.actorId,
      scope.generation,
      historyOffset,
    ],
    queryFn: () => api.history(scope.shopId, historyOffset),
    enabled: enabled && view === "history",
    retry: false,
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setOffset(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    current.current = key;
    running.current = false;
    setSession(null);
    setDraft(emptyOpeningDraft());
    setView("hub");
    setPending(null);
    setError(null);
    setBusy(false);
    setMessage("");
    createIntent.current = null;
    if (enabled && scope.shopId && scope.actorId)
      void storage
        .getItem(storageKey)
        .then((raw) => {
          if (current.current === key && raw)
            setPending(decodeOpeningPending(raw));
        })
        .catch((e) => {
          if (current.current === key) setError(e);
        });
    return () => {
      if (current.current === key) current.current = "";
    };
  }, [key, enabled]);
  const guard = () => {
    if (current.current !== key) throw Error("opening_scope");
  };
  const refresh = async () => {
    guard();
    await Promise.all(
      [
        "openingMeta",
        "openingHistory",
        "openingTargets",
        "catalog",
        "inventory",
        "inventoryStats",
        "stockReport",
        "customers",
        "customer",
        "customerSummary",
        "customers-summary",
        "suppliers",
        "gstSuppliers",
        "partyProfile",
        "auditLog",
      ].map((name) => qc.invalidateQueries({ queryKey: [name, scope.shopId] })),
    );
  };
  const receive = (s: OpeningSession, next?: typeof view) => {
    guard();
    setSession(s);
    setDraft(JSON.parse(JSON.stringify(s.draft)) as OpeningDraft);
    setView(next ?? (s.state === "draft" ? "edit" : "review"));
  };
  const run = async (action: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    setMessage("");
    try {
      guard();
      await action();
    } catch (e) {
      if (current.current === key) setError(e);
    } finally {
      if (current.current === key) {
        running.current = false;
        setBusy(false);
      }
    }
  };
  const connected = async () => {
    if (!(await online())) throw Error("opening_offline");
    guard();
  };
  const safeCount = async () => {
    await connected();
    const count = await localPendingCount();
    guard();
    if (count !== 0) throw Error("opening_pending");
    return 0;
  };
  const locked = () => {
    if (pending) throw Error("opening_pending");
  };
  const start = (mode: OpeningMode, origin: "settings" | "onboarding") =>
    run(async () => {
      locked();
      await connected();
      const old = createIntent.current;
      const intent =
        old && old.mode === mode && old.origin === origin
          ? old
          : { clientId: newId(), origin, mode };
      createIntent.current = intent;
      const s = await api.create(scope.shopId, intent);
      guard();
      createIntent.current = null;
      receive(s, "edit");
      await refresh();
    });
  const open = (id: string) =>
    run(async () => {
      await connected();
      const s = await api.get(scope.shopId, id);
      guard();
      receive(s);
    });
  const save = async (nextDraft = draft) => {
    locked();
    await connected();
    if (!session) throw Error("opening_not_found");
    const s = await api.save(
      scope.shopId,
      session.id,
      session.version,
      nextDraft,
    );
    guard();
    receive(s, "edit");
    return s;
  };
  const saveDraft = (nextDraft = draft) =>
    run(async () => {
      await save(nextDraft);
      setMessage("opening.saved");
      await refresh();
    });
  const saveAndLeave = (onSaved: () => void) =>
    run(async () => {
      await save();
      await refresh();
      onSaved();
    });
  const review = () =>
    run(async () => {
      let s = await save({ ...draft, step: 4 });
      s = await api.review(scope.shopId, s.id, s.version);
      guard();
      receive(s, "review");
    });
  const attach = (
    id: string,
    kind: "stock" | "customer" | "supplier",
    importId: string,
  ) =>
    run(async () => {
      locked();
      await connected();
      let s = session?.id === id ? session : await api.get(scope.shopId, id);
      guard();
      if (
        !s.sources.some(
          (source) => source.kind === kind && source.importId === importId,
        )
      ) {
        s = await api.attach(scope.shopId, id, s.version, kind, importId);
        guard();
      }
      receive(s, s.state === "draft" ? "edit" : "review");
      setSection(kind);
      await refresh();
    });
  const sendPending = async (value: OpeningPending) =>
    value.operation === "confirm"
      ? api.confirm(
          scope.shopId,
          value.sessionId,
          value.payload as OpeningConfirmation,
        )
      : value.operation === "apply"
        ? api.apply(
            scope.shopId,
            value.sessionId,
            value.payload as {
              clientId: string;
              version: number;
              localPendingCount: number;
            },
          )
        : api.settle(scope.shopId, value.payload as OpeningSupplierPayment);
  const retained = async (value: OpeningPending) =>
    retainOpeningRequest(
      storage,
      storageKey,
      value,
      sendPending,
      guard,
      setPending,
    );
  const applyAll = async (s: OpeningSession) => {
    try {
      while (s.state !== "complete") {
        await safeCount();
        const result = await retained({
          sessionId: s.id,
          operation: "apply",
          payload: {
            clientId: newId(),
            version: s.version,
            localPendingCount: 0,
          },
        });
        guard();
        s = result as OpeningSession;
        receive(s, "review");
      }
    } finally {
      await refresh();
    }
    setMessage("opening.done");
  };
  const confirm = (input: {
    workResolved: boolean;
    overlapReviewed: boolean;
    deviceIds: string[];
  }) =>
    run(async () => {
      locked();
      if (!session?.review) throw Error("opening_resolve");
      await safeCount();
      const s = (await retained({
        sessionId: session.id,
        operation: "confirm",
        payload: {
          ...input,
          clientId: newId(),
          version: session.version,
          reviewHash: session.review.hash,
          localPendingCount: 0,
        },
      })) as OpeningSession;
      guard();
      receive(s, "review");
      await applyAll(s);
    });
  const resume = () =>
    run(async () => {
      locked();
      if (!session) throw Error("opening_not_found");
      await applyAll(session);
    });
  const resolve = () =>
    run(async () => {
      await connected();
      if (!pending) return;
      const saved = await storage.getItem(storageKey);
      guard();
      if (!saved) throw Error("opening_storage");
      const intent = decodeOpeningPending(saved),
        out = await api.resolve(scope.shopId, intent);
      guard();
      if ((await storage.getItem(storageKey)) !== saved)
        throw Error("opening_storage");
      guard();
      await storage.removeItem(storageKey);
      guard();
      setPending(null);
      receive(
        out.session,
        intent.operation === "supplier_settlement" ? "suppliers" : "review",
      );
      setMessage(
        out.status === "closed" ? "opening.closed" : "opening.recovered",
      );
      await refresh();
    });
  const settle = (input: Omit<OpeningSupplierPayment, "clientId">) =>
    run(async () => {
      locked();
      await connected();
      await retained({
        sessionId: input.sessionId,
        operation: "supplier_settlement",
        payload: { ...input, clientId: newId() },
      });
      guard();
      setMessage("opening.payment_saved");
      await refresh();
    });
  const skip = () =>
    run(async () => {
      locked();
      await connected();
      await api.skip(scope.shopId);
      guard();
      setMessage("opening.skipped");
      await refresh();
    });
  const edit = () => {
    if (pending || busy) return;
    setDraft((d) => ({ ...d, step: 0 }));
    setView("edit");
    setMessage("");
    setError(null);
  };
  const appendTarget = (target: OpeningTarget, kind: OpeningSection) => {
    setDraft((d) =>
      d[kind].some((r) => r.targetId === target.id) || d[kind].length >= 500
        ? d
        : {
            ...d,
            mode: target.opening ? "current" : d.mode,
            [kind]: [...d[kind], rowForOpeningTarget(newId(), kind, target)],
          },
    );
    setSearch("");
    if (target.opening) setMessage("opening.existing_mode");
  };
  const selectTarget = (target: OpeningTarget, kind = section) => {
    if (busy || pending || session?.outcomes.length) return;
    appendTarget(target, kind);
  };
  const addCash = () =>
    run(async () => {
      locked();
      const target = await api.target(scope.shopId, "cash", scope.shopId);
      guard();
      if (!session?.outcomes.length) appendTarget(target, "cash");
    });
  const correct = (
    entry: OpeningEntry,
    origin: "settings" | "onboarding" = "settings",
  ) =>
    run(async () => {
      locked();
      await connected();
      const target = await api.target(
        scope.shopId,
        entry.section,
        entry.targetId,
      );
      guard();
      const s = await api.create(scope.shopId, {
        clientId: newId(),
        mode: "current",
        origin,
      });
      guard();
      receive(s, "edit");
      setDraft({
        ...s.draft,
        reference: entry.reference,
        step: entry.section === "stock" ? 1 : entry.section === "cash" ? 3 : 2,
        [entry.section]: [rowForOpeningTarget(newId(), entry.section, target)],
      });
      setSection(entry.section);
      await refresh();
    });
  const importRows = (
    kind: "stock" | "customer" | "supplier",
    navigate: (sessionId: string) => void,
  ) =>
    run(async () => {
      const s = await save({ ...draft, step: kind === "stock" ? 1 : 2 });
      guard();
      navigate(s.id);
    });
  return {
    metadata,
    targets,
    history,
    session,
    draft,
    setDraft,
    view,
    setView,
    section,
    setSection,
    search,
    setSearch,
    offset,
    setOffset,
    historyOffset,
    setHistoryOffset,
    busy,
    error,
    setError,
    pending,
    message,
    start,
    open,
    saveDraft,
    saveAndLeave,
    review,
    attach,
    confirm,
    resume,
    resolve,
    settle,
    skip,
    edit,
    run,
    guard,
    selectTarget,
    addCash,
    correct,
    importRows,
  };
}
