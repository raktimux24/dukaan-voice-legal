"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useShop } from "./context";
import { Button, Notice } from "./ui";
import { formatINR } from "../../lib/shop/money";
export function SaleAdjustmentHistory({ saleId }: { saleId: string }) {
  const { api, shop, userId, perms, t } = useShop();
  const debits = useInfiniteQuery({
    queryKey: ["saleDebits", shop?.id, userId, saleId],
    enabled: !!shop && perms.canVoidOrReturn,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.gst.saleDebits(shop!.id, saleId, pageParam),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const credits = useInfiniteQuery({
    queryKey: ["saleCredits", shop?.id, userId, saleId],
    enabled: !!shop && perms.canVoidOrReturn,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.gst.saleCredits(shop!.id, saleId, pageParam),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  if (!perms.canVoidOrReturn) return null;
  return (
    <div className="sale-adjustment-history">
      {debits.data?.pages.some((p) => p.items.length) || debits.isError ? (
        <details className="sale-detail-disclosure">
          <summary>{t("debit.retained_notes", "")}</summary>
          <Notice error={debits.error} />
          {debits.isError ? (
            <Button tone="quiet" onClick={() => void debits.refetch()}>
              {t("common.retry", "")}
            </Button>
          ) : null}
          {debits.data?.pages
            .flatMap((p) => p.items)
            .map((note) => (
              <div className="sale-payment-row" key={note.id}>
                <div>
                  <b>
                    {note.number} · {formatINR(Number(note.grossAmount))}
                  </b>
                  <p>
                    {t("debit.remaining", "")}:{" "}
                    {formatINR(Number(note.remaining))}
                  </p>
                  {note.balanceStatus === "review_required" ? (
                    <p>{t("debit.review_required", "")}</p>
                  ) : null}
                </div>
                <Button href={"/shop/adjustments/" + note.id} tone="quiet">
                  {t("customers.review_collections", "")}
                </Button>
              </div>
            ))}
          {debits.hasNextPage ? (
            <Button
              tone="quiet"
              disabled={debits.isFetchingNextPage}
              onClick={() => void debits.fetchNextPage()}
            >
              {t("counter.more", "")}
            </Button>
          ) : null}
        </details>
      ) : null}
      {credits.data?.pages.some((p) => p.items.length) || credits.isError ? (
        <details className="sale-detail-disclosure">
          <summary>{t("credit.retained", "")}</summary>
          <Notice error={credits.error} />
          {credits.isError ? (
            <Button tone="quiet" onClick={() => void credits.refetch()}>
              {t("common.retry", "")}
            </Button>
          ) : null}
          {credits.data?.pages
            .flatMap((p) => p.items)
            .map((note) => (
              <div className="sale-payment-row" key={note.id}>
                <div>
                  <b>
                    {note.number ?? t("credit.detail", "")} ·{" "}
                    {formatINR(Number(note.grossAmount))}
                  </b>
                  <p>
                    {t("credit.reduction", "")}:{" "}
                    {formatINR(Number(note.creditReduction))}
                    {" · "}
                    {t("credit.refund", "")}:{" "}
                    {formatINR(Number(note.moneyRefund))}
                  </p>
                  {note.evidenceStatus === "review_required" ? (
                    <p>{t("credit.review", "")}</p>
                  ) : null}
                </div>
                <Button href="#sale-documents" tone="quiet">
                  {t("web.gst.verified_documents", "")}
                </Button>
              </div>
            ))}
          {credits.hasNextPage ? (
            <Button
              tone="quiet"
              disabled={credits.isFetchingNextPage}
              onClick={() => void credits.fetchNextPage()}
            >
              {t("counter.more", "")}
            </Button>
          ) : null}
        </details>
      ) : null}
    </div>
  );
}
