import { canonicalJson } from "./gst-core/sale-request-canonical";

export type Scope = { actorId: string; shopId: string };
export type RetainedRequest = Scope & {
  id: string;
  path: string;
  outcomePath?: string;
  payload: unknown;
  createdAt: string;
  state: "pending" | "confirmed" | "closed";
  error?: string;
  result?: unknown;
  verification?: Record<string, unknown>;
};
let scope: Scope | null = null;
export function setFinancialScope(value: Scope | null) {
  scope = value;
}
export function financialScope(shopId: string): Scope {
  if (!scope || scope.shopId !== shopId)
    throw Error("The active account or shop changed. Reopen this page.");
  return { ...scope };
}
export function assertScope(value: Scope) {
  if (scope?.actorId !== value.actorId || scope?.shopId !== value.shopId)
    throw Error(
      "The active account or shop changed. Your saved request is preserved.",
    );
}
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("samaan-financial-v1", 1);
    request.onupgradeneeded = () => {
      for (const name of ["requests", "state", "locks"])
        request.result.createObjectStore(name);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(Error("Could not save financial records in this browser."));
  });
}
export async function transact<T>(
  store: string,
  mode: IDBTransactionMode,
  operation: (s: IDBObjectStore, done: (v: T) => void) => void,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    let result: T;
    let complete = false;
    operation(tx.objectStore(store), (v) => {
      result = v;
      complete = true;
    });
    tx.oncomplete = () => {
      db.close();
      complete
        ? resolve(result)
        : reject(Error("Browser storage operation was not confirmed."));
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(
        Error(
          "Could not safely save the financial request. Check browser storage and retry.",
        ),
      );
    };
  });
}
export const readState = <T>(key: string) =>
  transact<T | undefined>("state", "readonly", (s, done) => {
    const q = s.get(key);
    q.onsuccess = () => done(q.result);
  });
export const writeState = (key: string, value: unknown) =>
  transact<void>("state", "readwrite", (s, done) => {
    s.put(value, key);
    done();
  });
export async function retainRequest(row: RetainedRequest) {
  await transact<void>("requests", "readwrite", (s, done) => {
    const q = s.get(row.id);
    q.onsuccess = () => {
      const existing = q.result as RetainedRequest | undefined;
      if (
        existing &&
        (existing.actorId !== row.actorId ||
          existing.shopId !== row.shopId ||
          existing.path !== row.path ||
          canonicalJson(existing.payload) !== canonicalJson(row.payload))
      ) {
        s.transaction.abort();
        return;
      }
      s.put(existing ?? row, row.id);
      done();
    };
  });
}
export async function requestStatus(
  id: string,
  patch: Partial<RetainedRequest>,
) {
  await transact<void>("requests", "readwrite", (s, done) => {
    const q = s.get(id);
    q.onsuccess = () => {
      if (!q.result) {
        s.transaction.abort();
        return;
      }
      s.put({ ...q.result, ...patch }, id);
      done();
    };
  });
}
export async function retainedRequests(active: Scope) {
  const all = await transact<RetainedRequest[]>(
    "requests",
    "readonly",
    (s, done) => {
      const q = s.getAll();
      q.onsuccess = () => done(q.result);
    },
  );
  return all
    .filter((r) => r.actorId === active.actorId && r.shopId === active.shopId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function withFinancialLock<T>(
  active: Scope,
  operation: () => Promise<T>,
): Promise<T> {
  assertScope(active);
  const key = `${active.actorId}:${active.shopId}`;
  if (navigator.locks)
    return navigator.locks.request(key, async () => {
      assertScope(active);
      return operation();
    });
  const token = crypto.randomUUID();
  const acquired = await transact<boolean>("locks", "readwrite", (s, done) => {
    const q = s.get(key);
    q.onsuccess = () => {
      if (q.result?.until > Date.now()) {
        done(false);
        return;
      }
      s.put({ token, until: Date.now() + 300_000 }, key);
      done(true);
    };
  });
  if (!acquired)
    throw Error("Another financial request is in progress in this browser.");
  try {
    assertScope(active);
    return await operation();
  } finally {
    await transact<void>("locks", "readwrite", (s, done) => {
      const q = s.get(key);
      q.onsuccess = () => {
        if (q.result?.token === token) s.delete(key);
        done();
      };
    });
  }
}
export async function sha256(content: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}

export async function reserveSale(
  key: string,
  state: unknown,
  row: RetainedRequest,
) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["state", "requests"], "readwrite");
    const requests = tx.objectStore("requests");
    const existing = requests.get(row.id);
    existing.onsuccess = () => {
      const saved = existing.result as RetainedRequest | undefined;
      if (
        saved &&
        (saved.actorId !== row.actorId ||
          saved.shopId !== row.shopId ||
          saved.path !== row.path ||
          canonicalJson(saved.payload) !== canonicalJson(row.payload))
      ) {
        tx.abort();
        return;
      }
      tx.objectStore("state").put(state, key);
      requests.put(saved ?? row, row.id);
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(Error("Could not safely reserve this invoice."));
    };
  });
}
export function saveFile(
  content: string,
  name: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
