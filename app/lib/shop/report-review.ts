import type { ShopApi } from "./api";
import {
  financialScope,
  assertScope,
  retainedRequests,
  requestStatus,
  withFinancialLock,
  type RetainedRequest,
} from "./gst-storage";
import { canonicalJson } from "./gst-core/sale-request-canonical";
import { confirmedPeriodEvent } from "./gst-core/period-outcome";
import { normalizeTurnoverReview } from "./gst-core/gst-turnover-review";

export function reportReviewDefaults(now = new Date()) {
  const day = new Date(now.getTime() + 19800000);
  const previous = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth() - 1, 1),
  );
  const start = day.getUTCFullYear() - (day.getUTCMonth() < 3 ? 2 : 1);
  return {
    month: `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`,
    year: `${start}-${String((start + 1) % 100).padStart(2, "0")}`,
  };
}
export function reportReviewPath(
  shop: string,
  kind: "periods" | "turnover",
  period: string,
) {
  const valid =
    kind === "periods"
      ? /^\d{4}-(0[1-9]|1[0-2])$/.test(period)
      : /^20\d{2}-\d{2}$/.test(period) &&
        Number(period.slice(5)) === (Number(period.slice(0, 4)) + 1) % 100;
  if (!valid) throw Error("invalid_report_period");
  return `/api/shops/${shop}/gst-exports/${kind}/${period}`;
}
export async function pendingReportReviews(
  shop: string,
  kind: "periods" | "turnover",
  period: string,
) {
  const scope = financialScope(shop),
    path = reportReviewPath(shop, kind, period);
  const rows = (await retainedRequests(scope)).filter(
    (row) => row.state === "pending" && row.path === path,
  );
  assertScope(scope);
  for (const row of rows) {
    if (
      !row.payload ||
      typeof row.payload !== "object" ||
      Array.isArray(row.payload)
    )
      throw Error("purchase_request_outcome_unconfirmed");
    const body = row.payload as Record<string, unknown>;
    if (body.clientId !== row.id)
      throw Error("purchase_request_outcome_unconfirmed");
    if (kind === "turnover") normalizeTurnoverReview(period, body);
    else if (
      !["close", "reopen"].includes(String(body.action)) ||
      body.reviewed !== true ||
      typeof body.note !== "string" ||
      !body.note.trim() ||
      body.note.length > 1000 ||
      (body.action === "close" &&
        !/^[0-9a-f]{64}$/.test(String(body.expectedSourceFingerprint))) ||
      !Number.isSafeInteger(body.expectedSequence) ||
      Number(body.expectedSequence) < 0 ||
      typeof body.expectedSourceFingerprint !== "string"
    )
      throw Error("purchase_request_outcome_unconfirmed");
  }
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
/** Outcome lookup only: never issue another period event while checking a retained request. */
export async function checkRecordedPeriod(
  api: ShopApi,
  shop: string,
  row: RetainedRequest,
) {
  const scope = financialScope(shop);
  const match = row.path.match(
    /\/gst-exports\/periods\/(\d{4}-(?:0[1-9]|1[0-2]))$/,
  );
  if (
    !match ||
    row.actorId !== scope.actorId ||
    row.shopId !== shop ||
    row.path !== reportReviewPath(shop, "periods", match[1])
  )
    throw Error("purchase_request_outcome_unconfirmed");
  return withFinancialLock(scope, async () => {
    const current = (
      await pendingReportReviews(shop, "periods", match[1])
    ).find((saved) => saved.id === row.id);
    if (
      !current ||
      canonicalJson(current.payload) !== canonicalJson(row.payload)
    )
      throw Error("purchase_request_outcome_unconfirmed");
    const input = current.payload as Parameters<typeof api.gst.changePeriod>[2];
    const result = await api.gst.post<unknown>(
      current.path + "/request-outcome",
      input,
    );
    assertScope(scope);
    const event = confirmedPeriodEvent(
      result,
      shop,
      scope.actorId,
      match[1],
      input,
    );
    await requestStatus(row.id, {
      state: "confirmed",
      result: event,
      error: undefined,
    });
    assertScope(scope);
    return event;
  });
}
