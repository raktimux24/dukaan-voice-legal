// All subscription mutations share a queue; delayed work must retain its actor lease.
export type PushLease = { actorId: string | null; generation: number };
let active: PushLease = { actorId: null, generation: 0 };
let queue: Promise<unknown> = Promise.resolve();
export function beginPushSession(actorId: string | null): PushLease {
  active = { actorId, generation: active.generation + 1 };
  return { ...active };
}
export function pushSession(actorId: string): PushLease {
  if (active.actorId !== actorId)
    throw Error("Browser notification account changed.");
  return { ...active };
}
export function assertPushSession(lease: PushLease) {
  if (
    lease.generation !== active.generation ||
    lease.actorId !== active.actorId
  )
    throw Error("Browser notification account changed.");
}
export function withPushSession<T>(
  lease: PushLease,
  work: (check: () => void) => Promise<T>,
): Promise<T> {
  const result = queue
    .catch(() => {})
    .then(() => {
      const check = () => assertPushSession(lease);
      check();
      return work(check);
    });
  queue = result.catch(() => {});
  return result;
}
export function pushKeyMatches(
  key: ArrayBuffer | null | undefined,
  encoded: string,
): boolean {
  if (!key) return false;
  try {
    const raw = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(key);
    return (
      bytes.length === raw.length &&
      bytes.every((v, i) => v === raw.charCodeAt(i))
    );
  } catch {
    return false;
  }
}
export function bindPushOwner(
  worker: Pick<ServiceWorker, "postMessage"> | null,
  actorId: string | null,
  timeoutMs = 3000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(Error("Notification worker is not active."));
      return;
    }
    const channel = new MessageChannel();
    const finish = (error?: Error) => {
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      error ? reject(error) : resolve();
    };
    const timer = setTimeout(
      () => finish(Error("Notification worker did not confirm readiness.")),
      timeoutMs,
    );
    channel.port1.onmessage = (event) =>
      finish(
        event.data?.ok === true && event.data.actorId === actorId
          ? undefined
          : Error("Notification account could not be saved."),
      );
    try {
      worker.postMessage({ type: "BIND_PUSH_ACCOUNT", actorId }, [
        channel.port2,
      ]);
    } catch {
      finish(Error("Notification worker could not be reached."));
    }
  });
}
export function pushWorkerReady(
  ready: Promise<ServiceWorkerRegistration>,
  timeoutMs = 10000,
): Promise<ServiceWorkerRegistration> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Notification worker did not become active.")),
      timeoutMs,
    );
    ready.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
