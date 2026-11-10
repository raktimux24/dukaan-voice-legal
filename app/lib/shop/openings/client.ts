import type {
  OpeningMetadata,
  OpeningSession,
  OpeningDraft,
  OpeningSection,
  OpeningTarget,
  OpeningConfirmation,
  OpeningPending,
  OpeningHistory,
  OpeningMode,
  OpeningSupplierPayment,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindOpenings(send: Send) {
  const root = (shop: string) =>
    "/api/shops/" + encodeURIComponent(shop) + "/openings";
  const post = <T>(path: string, value: unknown) =>
    send<T>(path, { method: "POST", body: JSON.stringify(value) });
  return {
    metadata: (shop: string) => send<OpeningMetadata>(root(shop)),
    targets: (shop: string, section: OpeningSection, q = "", offset = 0) =>
      send<{ items: OpeningTarget[]; more: boolean }>(
        root(shop) +
          "/targets?section=" +
          section +
          "&q=" +
          encodeURIComponent(q) +
          "&offset=" +
          offset,
      ),
    target: (shop: string, section: OpeningSection, id: string) =>
      send<OpeningTarget>(
        root(shop) + "/target/" + section + "/" + encodeURIComponent(id),
      ),
    history: (shop: string, offset = 0) =>
      send<{ items: OpeningHistory[]; more: boolean }>(
        root(shop) + "/history?offset=" + offset,
      ),
    create: (
      shop: string,
      input: {
        clientId: string;
        origin: "settings" | "onboarding";
        mode: OpeningMode;
      },
    ) => post<OpeningSession>(root(shop), input),
    get: (shop: string, id: string) =>
      send<OpeningSession>(root(shop) + "/" + encodeURIComponent(id)),
    save: (shop: string, id: string, version: number, draft: OpeningDraft) =>
      post<OpeningSession>(
        root(shop) + "/" + encodeURIComponent(id) + "/draft",
        { version, draft },
      ),
    review: (shop: string, id: string, version: number) =>
      post<OpeningSession>(
        root(shop) + "/" + encodeURIComponent(id) + "/review",
        { version },
      ),
    attach: (
      shop: string,
      id: string,
      version: number,
      kind: "stock" | "customer" | "supplier",
      importId: string,
    ) =>
      post<OpeningSession>(
        root(shop) + "/" + encodeURIComponent(id) + "/imports",
        { version, kind, importId },
      ),
    confirm: (shop: string, id: string, input: OpeningConfirmation) =>
      post<OpeningSession>(
        root(shop) + "/" + encodeURIComponent(id) + "/confirm",
        input,
      ),
    apply: (
      shop: string,
      id: string,
      input: { clientId: string; version: number; localPendingCount: number },
    ) =>
      post<OpeningSession>(
        root(shop) + "/" + encodeURIComponent(id) + "/apply",
        input,
      ),
    resolve: (shop: string, input: OpeningPending) =>
      post<{ status: "closed" | "recorded"; session: OpeningSession }>(
        root(shop) + "/request-outcome",
        input,
      ),
    settle: (shop: string, input: OpeningSupplierPayment) =>
      post<{ ok: true }>(root(shop) + "/supplier-settlement", input),
    skip: (shop: string) => post<{ ok: true }>(root(shop) + "/skip", {}),
  };
}
export type OpeningsApi = ReturnType<typeof bindOpenings>;
