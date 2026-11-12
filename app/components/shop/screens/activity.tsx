"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ProductImageById } from "../product-image";
import { useShop } from "../context";
import { Button, EmptyState, NoAccess, Notice, PageHeader, Skeleton, Spinner } from "../ui";
import { downloadText } from "../../../lib/shop/csv";
import { formatTime, formatDay, formatWhen } from "../../../lib/shop/money";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import {
  ACTIVITY_FILTERS,
  activityFilter,
  activityGroups,
  activityDay,
  activityDescription,
  activitySource,
  activityLabel,
  activityTarget,
  activityCsv,
  nextActivityPage,
  uniqueActivity,
  normalizedActivityAction,
  type ActivityFilter,
} from "../../../lib/shop/activity";
import type { AuditLogEntry } from "../../../lib/shop/types";

function ActivityMark({ log }: { log: AuditLogEntry }) {
  const productId =
    typeof log.payload?.productId === "string" ? log.payload.productId : null;
  if (productId)
    return (
      <ProductImageById
        productId={productId}
        name={String(log.payload?.productName ?? "")}
        size={42}
      />
    );
  const action = normalizedActivityAction(log.actionType);
  const paths: Record<string, string> = {
    add: "M12 5v14M5 12h14",
    remove: "M5 12h14",
    sale: "M6 3h12v18l-3-2-3 2-3-2-3 2V3m3 5h6m-6 4h6",
    sale_void: "M5 5l14 14M19 5L5 19",
    sale_return: "M7 7h8a5 5 0 0 1 0 10h-4M7 7l4-4M7 7l4 4",
    adjustment: "M4 8h16M8 4v8M4 17h16M16 13v8",
    member_removed:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 5h5",
    member_role_changed: "M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4",
  };
  return (
    <span
      className={
        "activity-mark is-" +
        (action.startsWith("sale")
          ? "sale"
          : action === "add"
            ? "add"
            : ["remove", "adjustment", "member_removed"].includes(action)
              ? "change"
              : "record")
      }
      aria-hidden="true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={paths[action] ?? "M3 12h4l3-7 4 14 3-7h4"} />
      </svg>
    </span>
  );
}
export function ActivityScreen() {
  const { shop, userId, perms, premium, offline, prefs } = useShop();
  return (
    <ActivityWorkspace
      key={`${shop?.id}:${userId}:${perms.role}:${premium}:${offline}:${prefs?.appLanguage}`}
    />
  );
}
function ActivityWorkspace() {
  const { api, shop, userId, perms, prefs, premium, t, offline } = useShop(),
    params = useSearchParams();
  const text = (key: string, vars?: Record<string, string | number>, fallback?: string) =>
    t(key, fallback ?? EN_FALLBACK[key] ?? "", vars);
  const [filter, setFilter] = useState<ActivityFilter>(() =>
      activityFilter(params.get("filter")),
    ),
    [error, setError] = useState<unknown>(null),
    [exporting, setExporting] = useState(false),
    [exported, setExported] = useState<string | null>(null);
  const alive = useRef(true),
    exportLock = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const enabled = !!shop && !!perms.role && !offline;
  const logs = useInfiniteQuery({
    queryKey: ["activity", shop?.id, userId, perms.role, premium, filter],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.getAudit(shop!.id, filter, pageParam),
    getNextPageParam: (last, _pages, lastOffset) =>
      nextActivityPage(last, lastOffset),
    staleTime: 0,
  });
  const rows = uniqueActivity(logs.data?.pages ?? []),
    days = activityGroups(rows),
    limited = logs.data?.pages[0]?.limitedToDays,
    total = logs.data?.pages[0]?.total;
  const filterName = text("activity.filter_" + filter);
  const today = activityDay(new Date().toISOString()),
    yesterday = activityDay(new Date(Date.now() - 86400000).toISOString());
  const dayName = (day: string) =>
    day === today
      ? text("common.time_today")
      : day === yesterday
        ? text("common.time_yesterday")
        : day === "unknown"
          ? t("activityweb.date_unknown", "Date unavailable")
          : formatDay(day + "T12:00:00+05:30", prefs?.appLanguage);
  const exportCsv = async () => {
    if (!enabled || !shop || exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    setExported(null);
    setError(null);
    const requestedFilter = filter,
      requestedLabel = filterName;
    try {
      api.assertSession();
      const all = await api.getAllAudit(shop.id, requestedFilter);
      api.assertSession();
      if (alive.current) {
        downloadText(
          `activity-${requestedFilter}.csv`,
          activityCsv(
            uniqueActivity([{ logs: all, total: all.length, hasMore: false }]),
            text,
            prefs?.appLanguage,
          ),
        );
        setExported(
          t(
            "activityweb.export_ready",
            "Downloaded {{n}} available entries · {{filter}}",
            { n: all.length, filter: requestedLabel },
          ),
        );
      }
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) {
        exportLock.current = false;
        setExporting(false);
      }
    }
  };
  if (!shop) return <Spinner />;
  if (offline)
    return (
      <div className="shop-page activity-workspace">
        <div className="activity-empty" role="status">
          <h2>{text("activity.title")}</h2>
          <p>
            {t("activityweb.offline", "Reconnect to view the latest activity.")}
          </p>
        </div>
      </div>
    );
  if (!perms.role)
    return (
      <NoAccess
        what={t("activityweb.access", "Join a shop to view its activity.")}
      />
    );
  return (
    <div className="shop-page activity-workspace">
      <PageHeader
        title={text("activity.title")}
        description={t(
          "activityweb.intro",
          "Follow the work behind each sale, stock change and update.",
        )}
        actions={
          <>
            <Button
              tone="ghost"
              disabled={
                exporting || logs.isLoading || !logs.data || logs.isError
              }
              onClick={() => void exportCsv()}
            >
              {exporting
                ? text("common.loading")
                : t("activityweb.export", "Export CSV")}{" "}
              ↓
            </Button>
          </>
        }
      />
      <div className="activity-controls">
        <div
          className="activity-filters"
          aria-label={t("activityweb.filter_label", "Filter activity")}
        >
          {ACTIVITY_FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => {
                setFilter(id);
                setError(null);
                setExported(null);
              }}
            >
              {text("activity.filter_" + id)}
            </button>
          ))}
        </div>
        <span className="activity-zone">
          {t("activityweb.india_time", "Times shown in IST")}
        </span>
      </div>
      <div className="activity-status">
        <p aria-live="polite">
          {total == null
            ? "—"
            : t("activityweb.count", "{{shown}} of {{total}} entries", {
                shown: rows.length,
                total,
              })}
        </p>
        <p>
          {t(
            "activityweb.export_scope",
            "CSV includes all available entries for this filter.",
          )}
        </p>
      </div>
      {limited ? (
        <div className="activity-limit">
          <span>
            <strong>
              {t(
                "activity.free_limit_title",
                "Showing the last {{days}} days.",
                { days: limited },
              )}
            </strong>
            <small>{text("activity.free_limit_body")}</small>
          </span>
          <Button href="/shop/settings/subscription" tone="quiet">
            {t("activityweb.plans", "View plans")} ↗
          </Button>
        </div>
      ) : null}
      <Notice error={error} />
      {exported ? (
        <p className="activity-export-status" role="status">
          {exported}
        </p>
      ) : null}
      {logs.isLoading ? (
        <Skeleton variant="row" count={4} label={t("activityweb.loading", "Loading activity")} />
      ) : null}
      {logs.isError && !logs.isFetchNextPageError ? (
        <div>
          <Notice error={logs.error} />
          <Button tone="ghost" onClick={() => void logs.refetch()}>
            {text("common.retry")}
          </Button>
        </div>
      ) : null}
      {logs.isSuccess && !rows.length ? (
        <EmptyState
          icon="clipboard"
          title={t("activityweb.empty", "No activity in this view")}
          body={t(
            "activityweb.empty_hint",
            "Try another filter. New changes show up here on their own.",
          )}
          action={
            filter !== "all" ? (
              <Button tone="quiet" onClick={() => setFilter("all")}>
                {t("activityweb.show_all", "Show all activity")} →
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {(!logs.isError || logs.isFetchNextPageError) &&
        days.map((day) => (
          <section className="activity-day" key={day.day}>
            <div className="activity-day-heading">
              <h2>{dayName(day.day)}</h2>
              <span>
                {t("activityweb.day_count", "{{n}} entries", {
                  n: day.logs.length,
                })}
              </span>
            </div>
            <ol className="activity-journal">
              {day.logs.map((log) => {
                const target = activityTarget(log, perms.canSeeReports),
                  description =
                    activityDescription(log, text, prefs?.appLanguage) ||
                    t("activityweb.recorded", "Activity recorded"),
                  who =
                    log.userName && log.userName !== "Unknown"
                      ? log.userName
                      : t("activityweb.unknown_user", "Unknown user");
                return (
                  <li key={log.id} className="activity-entry">
                    <div className="activity-entry-mark">
                      <ActivityMark log={log} />
                    </div>
                    <div className="activity-entry-content">
                      <div className="activity-entry-heading">
                        <span className="activity-event-type">
                          {activityLabel(log.actionType, text)}
                        </span>
                        <time
                          dateTime={log.createdAt}
                          title={formatWhen(log.createdAt, prefs?.appLanguage)}
                        >
                          {formatTime(log.createdAt, prefs?.appLanguage)}
                        </time>
                      </div>
                      <h3>{description}</h3>
                      <div className="activity-entry-foot">
                        <div className="activity-attribution">
                          <span>{who}</span>
                          {log.inputMethod !== "manual" ? (
                            <span
                              className={
                                "activity-source " +
                                (log.inputMethod === "voice" ? "is-voice" : "")
                              }
                            >
                              {log.inputMethod === "voice" ? (
                                <span aria-hidden="true">◖</span>
                              ) : null}
                              {activitySource(log.inputMethod, text)}
                            </span>
                          ) : null}
                        </div>
                        {target ? (
                          <Link
                            className="activity-record-link"
                            href={target.href}
                          >
                            {text(target.label)}{" "}
                            <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                      </div>
                      <details className="activity-entry-details">
                        <summary>
                          {t("activityweb.details", "Entry details")}
                        </summary>
                        <dl>
                          <div>
                            <dt>{t("activityweb.date", "Recorded at")}</dt>
                            <dd>
                              {formatWhen(log.createdAt, prefs?.appLanguage)} ·{" "}
                              {t(
                                "activityweb.india_time",
                                "Times shown in IST",
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt>{t("activityweb.event_id", "Entry ID")}</dt>
                            <dd>{log.id}</dd>
                          </div>
                        </dl>
                      </details>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      {logs.isFetchNextPageError ? <Notice error={logs.error} /> : null}
      {logs.hasNextPage ? (
        <div className="activity-load">
          <Button
            tone="ghost"
            disabled={logs.isFetching}
            onClick={() => void logs.fetchNextPage()}
          >
            {logs.isFetchingNextPage
              ? text("common.loading")
              : logs.isFetchNextPageError
                ? text("common.retry")
                : t("activityweb.more", "Load more activity")}{" "}
            ↓
          </Button>
        </div>
      ) : logs.isSuccess && rows.length ? (
        <p className="activity-end">
          {t(
            "activityweb.end",
            "You have reached the end of the available activity.",
          )}
        </p>
      ) : null}
    </div>
  );
}
