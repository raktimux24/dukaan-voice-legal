import type { CashbookState, CashRequest, CashResult } from "./contract";
type Send = <T>(path: string, init?: RequestInit) => Promise<T>;
export function bindCashbook(send: Send) {
  const root = (s: string) =>
    "/api/shops/" + encodeURIComponent(s) + "/cashbook";
  return {
    state: (s: string, day: string, offset = 0, expenseOffset = 0) =>
      send<CashbookState>(
        root(s) +
          "?" +
          new URLSearchParams({
            day,
            offset: String(offset),
            expenseOffset: String(expenseOffset),
          }),
      ),
    action: (s: string, r: CashRequest) =>
      send<CashResult>(root(s) + "/actions", {
        method: "POST",
        body: JSON.stringify(r),
      }),
  };
}
