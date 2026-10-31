import type { CommerceRequest, CommerceResult } from "./contract";

// Only explicit server rejections release an editable setup action. A timeout,
// storage failure or order/bill operation always keeps its original request ID.
export function rejectedSetup(request: CommerceRequest, code: unknown) {
  return ["configure", "listing", "publish"].includes(request.action.kind) &&
    ["commerce_invalid", "commerce_phone", "commerce_not_allowed", "commerce_not_found",
     "commerce_setup", "commerce_review", "commerce_stale", "commerce_product"].includes(String(code));
}
export async function sendCommerceRequest({storage, key, request, send, pending}: {
  storage: {getItem(k:string):Promise<string|null>;setItem(k:string,v:string):Promise<void>;removeItem(k:string):Promise<void>};
  key: string;
  request: CommerceRequest;
  send: (request: CommerceRequest) => Promise<CommerceResult>;
  pending: (request: CommerceRequest | null) => void;
}) {
  const raw = JSON.stringify(request);
  await storage.setItem(key, raw);
  if (await storage.getItem(key) !== raw) throw Error("commerce_storage");
  pending(request);
  let result: CommerceResult;
  try {
    result = await send(request);
  } catch (error: any) {
    if (rejectedSetup(request, error.code)) {
      await storage.removeItem(key);
      pending(null);
    }
    throw error;
  }
  await storage.removeItem(key);
  pending(null);
  return result;
}
