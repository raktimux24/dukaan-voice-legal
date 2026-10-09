"use client";

import { useGstText as useUiText } from "./gst-ui";
import { useState, useRef, type ReactNode } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useShop } from "./context";
import { Button, Card, Notice, Spinner, NoAccess } from "./ui";
import { TextField, useGstText } from "./gst-ui";
import { financialScope, assertScope } from "../../lib/shop/gst-storage";
import {
  currentReportMonth,
  reportPeriod,
} from "../../lib/shop/gst-core/report-period";
export function useGstQuery<T>(
  key: unknown[],
  load: () => Promise<T>,
  allowed = true,
  networkMode: 'online'|'always' = 'online',
) {
  const { shop, userId } = useShop();
  return useQuery({
    queryKey: ["gst", userId, shop?.id, ...key],
    enabled: !!shop && allowed,
    queryFn: async () => {
      const active = financialScope(shop!.id);
      const result = await load();
      assertScope(active);
      return result;
    },
    retry: false,
    networkMode,
  });
}
export function useGstPages<T>(
  key: unknown[],
  load: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null }>,
  allowed = true,
) {
  const { shop, userId } = useShop();
  return useInfiniteQuery({
    queryKey: ["gst", userId, shop?.id, ...key],
    initialPageParam: undefined as string | undefined,
    enabled: !!shop && allowed,
    queryFn: async ({ pageParam }) => {
      const active = financialScope(shop!.id);
      const result = await load(pageParam);
      assertScope(active);
      return result;
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: false,
  });
}
export function ReadState({
  query,
  empty,
  children,
}: {
  query: { isPending: boolean; error: unknown; refetch: () => unknown };
  empty?: boolean;
  children: ReactNode;
}) {
  const text = useGstText();
  if (query.isPending) return <Spinner label={text("Loading")} />;
  if (query.error)
    return (
      <Card>
        <Notice error={query.error} />
        <Button tone="ghost" onClick={() => void query.refetch()}>
          {text("Retry")}
        </Button>
      </Card>
    );
  if (empty) return <Card>{text("No records for this selection.")}</Card>;
  return <>{children}</>;
}
export function More({
  query,
}: {
  query: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => unknown;
  };
}) {
  const text = useGstText();
  return query.hasNextPage ? (
    <Button
      tone="ghost"
      disabled={query.isFetchingNextPage}
      onClick={() => void query.fetchNextPage()}
    >
      {text("Load more")}
    </Button>
  ) : null;
}
export function useGstAction() {
  const { shop, userId } = useShop();
  const text = useGstText();
  const client = useQueryClient();
  const [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  const running = useRef(false);
  return {
    error,
    busy,
    success,
    async run(action: () => Promise<unknown>) {
      if (running.current) return;
      running.current = true;
      setBusy(true);
      setError(null);
      setSuccess(false);
      try {
        await action();
        setSuccess(true);
        await client.invalidateQueries({ queryKey: ["gst", userId, shop?.id] });
      } catch (e) {
        setError(e);
      } finally {
        running.current = false;
        setBusy(false);
      }
    },
    notice: error ? (
      <Card>
        <Notice error={error} />
        <Button href="/shop/settings/gst/recovery" tone="quiet">
          {text("Keep any saved request and review recovery")}
        </Button>
      </Card>
    ) : null,
  };
}
export function GstAccess({
  children,
  owner = false,
}: {
  children: ReactNode;
  owner?: boolean;
}) {
  const uiText = useUiText();
  const { shop, perms, role } = useShop();
  if (!shop) return <Spinner />;
  if (owner ? role !== "OWNER" : !perms.canSeeReports)
    return (
      <NoAccess what={uiText("Only authorized shop administrators can review these records.")} />
    );
  return <>{children}</>;
}
export function usePeriod(initial?: { from: string; through: string }) {
  const text = useGstText();
  const [dates, setDates] = useState(initial ?? currentReportMonth);
  let range: ReturnType<typeof reportPeriod> | undefined, error: unknown;
  try {
    range = reportPeriod(dates.from, dates.through);
  } catch (e) {
    error = e;
  }
  return {
    dates,
    range,
    error,
    fields: (
      <div className="form-grid is-2">
        <TextField
          type="date"
          label={text("Start date (included)")}
          value={dates.from}
          onChange={(from) => setDates({ ...dates, from })}
        />
        <TextField
          type="date"
          label={text("End date (included)")}
          value={dates.through}
          onChange={(through) => setDates({ ...dates, through })}
        />
        <p className="shop-hint">
          {text(
            "Indian Standard Time. The same period applies to records, totals and exports.",
          )}
        </p>
        <Notice error={error} />
      </div>
    ),
  };
}
