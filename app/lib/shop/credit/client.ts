import type {
  CreditState,
  CreditRequest,
  CreditResult,
  CreditCheck,
  CreditStatement,
} from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindCredit(send: Send) {
  const root = (shop: string) =>
    "/api/shops/" + encodeURIComponent(shop) + "/customer-credit";
  return {
    state: (s: string, c: string) =>
      send<CreditState>(root(s) + "/" + encodeURIComponent(c)),
    action: (s: string, c: string, r: CreditRequest) =>
      send<CreditResult>(root(s) + "/" + encodeURIComponent(c) + "/actions", {
        method: "POST",
        body: JSON.stringify(r),
      }),
    check: (
      s: string,
      customerId: string | null,
      proposed: string,
      dueDate?: string | null,
      phone?: string | null,
    ) =>
      send<CreditCheck>(root(s) + "/check", {
        method: "POST",
        body: JSON.stringify({
          phone,
          customerId,
          proposed,
          ...(dueDate === undefined ? {} : { dueDate }),
        }),
      }),
    statement: (s: string, c: string, id: string) =>
      send<CreditStatement>(
        root(s) +
          "/" +
          encodeURIComponent(c) +
          "/statements/" +
          encodeURIComponent(id),
      ),
  };
}
