import type { OpeningPending } from "./contract";
export type OpeningStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
export function decodeOpeningPending(raw: string): OpeningPending {
  const v = JSON.parse(raw) as OpeningPending,
    uuid = (s: unknown) =>
      typeof s === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s);
  if (
    !v ||
    !["confirm", "apply", "supplier_settlement"].includes(v.operation) ||
    !uuid(v.sessionId) ||
    !v.payload ||
    !uuid(v.payload.clientId)
  )
    throw Error("opening_storage");
  return v;
}
/** Keep exact intent through timeouts/restarts; only verified success clears it. */
export async function retainOpeningRequest<T>(
  storage: OpeningStorage,
  key: string,
  input: OpeningPending,
  send: (value: OpeningPending) => Promise<T>,
  guard: () => void,
  onPending: (value: OpeningPending | null) => void,
): Promise<T> {
  guard();
  const existing = await storage.getItem(key);
  guard();
  if (
    existing &&
    JSON.stringify(decodeOpeningPending(existing)) !== JSON.stringify(input)
  ) {
    onPending(decodeOpeningPending(existing));
    throw Error("opening_pending");
  }
  const text = existing ?? JSON.stringify(input),
    value = decodeOpeningPending(text);
  await storage.setItem(key, text);
  guard();
  onPending(value);
  if ((await storage.getItem(key)) !== text) throw Error("opening_storage");
  guard();
  const result = await send(value);
  guard();
  if ((await storage.getItem(key)) !== text) throw Error("opening_storage");
  guard();
  await storage.removeItem(key);
  guard();
  onPending(null);
  return result;
}
