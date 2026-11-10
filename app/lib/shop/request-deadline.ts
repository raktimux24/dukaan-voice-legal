export class RequestTimeoutError extends Error {
  readonly status = 408;
  readonly code = "request_timeout";
  constructor() { super("Request timed out"); this.name = "RequestTimeoutError"; }
}

/** Bounds token lookup, transport and body reads even when a dependency ignores abort. */
export function withRequestDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  external?: AbortSignal | null,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const controller = new AbortController();
    let settled = false;
    const cleanup = () => { clearTimeout(timer); external?.removeEventListener("abort", cancelled); };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
      controller.abort();
    };
    const cancelled = () => fail(Object.assign(Error("Request cancelled"), { name: "AbortError" }));
    const timer = setTimeout(() => fail(new RequestTimeoutError()), timeoutMs);
    external?.addEventListener("abort", cancelled, { once: true });
    if (external?.aborted) { cancelled(); return; }
    try {
      Promise.resolve(operation(controller.signal)).then(value => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      }, error => fail(error));
    } catch (error) { fail(error as Error); }
  });
}
