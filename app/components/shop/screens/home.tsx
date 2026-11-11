"use client";

import { ProductImage } from "../product-image";
import { HomeBillImage } from "../home-bill-image";
import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatINR } from "../../../lib/shop/money";
import { useShopDates } from "../use-shop-dates";
import type { InventoryItem, SalesSummary } from "../../../lib/shop/types";
import { formatQty } from "../../../lib/shop/units";
import { useShop } from "../context";
import {
  Button,
  EmptyState,
  Glyph,
  Notice,
  Pill,
  PremiumLock,
  SectionHead,
  Skeleton,
  Spinner,
  isPremiumError,
} from "../ui";

import {
  homeTrialNotice,
  matchHomeDemand,
  searchHomeCatalog,
} from "../../../lib/shop/home";
import { CounterCamera } from "../counter-scanner";
import { VoiceSheet } from "../voice-sheet";
import { HomeNudge } from "../home-nudge";

const METHOD_COLORS: Record<string, string> = {
  cash: "#ff8b3d",
  upi: "#d5d1c8",
  credit: "#898897",
  card: "#8a8a90",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  credit: "Udhaar",
  card: "Card",
};

function delta(today: number | undefined, yesterday: number | undefined) {
  if (today == null || yesterday == null) return null;
  if (yesterday === 0)
    return today === 0
      ? { pct: 0, dir: "flat" as const }
      : { pct: null, dir: "up" as const };
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return {
    pct,
    dir:
      pct > 0
        ? ("up" as const)
        : pct < 0
          ? ("down" as const)
          : ("flat" as const),
  };
}

function methodName(
  method: string,
  t: (key: string, fallback: string) => string,
) {
  return t(`pos.method.${method}`, METHOD_LABELS[method] ?? method);
}

function SplitBar({ summary }: { summary: SalesSummary }) {
  const { t } = useShop();
  const parts = Object.entries(summary.byMethod ?? {}).filter(
    ([, amount]) => amount !== 0,
  );
  const total = parts.reduce((sum, [, amount]) => sum + amount, 0);
  if (!parts.length)
    return (
      <p className="text-sm text-muted">
        {t("sales.empty_subtitle", "No payments yet today.")}
      </p>
    );
  return (
    <div className="dash-split">
      {total > 0 && parts.every(([, amount]) => amount >= 0) ? (
        <div className="dash-split-bar" aria-hidden="true">
          {parts.map(([method, amount]) => (
            <span
              key={method}
              style={{
                width: `${(amount / total) * 100}%`,
                background: METHOD_COLORS[method] ?? "#5a5a62",
              }}
            />
          ))}
        </div>
      ) : null}
      <div className="dash-split-legend">
        {parts.map(([method, amount]) => (
          <span key={method} className="num">
            <i style={{ background: METHOD_COLORS[method] ?? "#5a5a62" }} />
            {methodName(method, t)} {formatINR(amount)}
          </span>
        ))}
      </div>
    </div>
  );
}

function stockTone(item: InventoryItem): "danger" | "warn" | "neutral" {
  if (item.stockStatus === "OUT") return "danger";
  if (item.stockStatus === "LOW") return "warn";
  return "neutral";
}

// Remount transient search, scanner and notice state when the actor or shop changes.
export function HomeScreen() {
  const { shop, userId } = useShop();
  return <HomeWorkspace key={`${userId}:${shop?.id}`} />;
}

function HomeWorkspace() {
  const uiText = useUiText(),
    { formatTime } = useShopDates();
  const {
    api,
    shop,
    perms,
    premium,
    t,
    userId,
    prefs,
    role,
    entitlement,
    offline,
    setNotice,
  } = useShop();
  const client = useQueryClient(),
    router = useRouter(),
    alive = useRef(true),
    scanBusy = useRef(false),
    searchInput = useRef<HTMLInputElement>(null);
  const shopId = shop?.id ?? "";
  const [query, setQuery] = useState(""),
    [debounced, setDebounced] = useState("");
  const [scanner, setScanner] = useState(false),
    [scanError, setScanError] = useState<unknown>(null),
    [scanning, setScanning] = useState(false);
  const [demandBusy, setDemandBusy] = useState(false),
    [demandError, setDemandError] = useState<unknown>(null),
    [notedQuery, setNotedQuery] = useState("");
  const [trialDismissed, setTrialDismissed] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    setDemandError(null);
    return () => window.clearTimeout(timer);
  }, [query]);
  const live = offline ? false : 30_000;
  const opening = useQuery({
    queryKey: ["openingMeta", shopId, userId],
    enabled: !!shopId && perms.canEditProducts,
    queryFn: () => api.openings.metadata(shopId),
    retry: false,
  });
  const stats = useQuery({
    queryKey: ["stats", shopId],
    enabled: !!shopId,
    queryFn: () => api.getInventoryStats(shopId),
    refetchInterval: live,
  });
  const catalog = useQuery({
    queryKey: ["catalog", shopId, !perms.canSeeCost],
    enabled: !!shopId,
    queryFn: () => api.getAllInventory(shopId, !perms.canSeeCost),
  });
  const today = useQuery({
    queryKey: ["sales-summary", shopId, "today"],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getSalesSummary(shopId, { period: "today" }),
    refetchInterval: live,
  });
  const yesterday = useQuery({
    queryKey: ["sales-summary", shopId, "yesterday"],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getSalesSummary(shopId, { period: "yesterday" }),
  });
  const recent = useQuery({
    queryKey: ["sales", shopId, "today", "recent"],
    enabled: !!shopId,
    queryFn: () => api.getSales(shopId, { period: "today", limit: 5 }),
    refetchInterval: live,
  });
  const brief = useQuery({
    queryKey: ["brief", shopId, userId, prefs?.appLanguage],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getBrief(shopId, prefs?.appLanguage),
  });
  const nudges = useQuery({
    queryKey: ["nudges", shopId, "home", userId, prefs?.appLanguage],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getNudges(shopId),
  });
  const streak = useQuery({
    queryKey: ["streak", shopId],
    enabled: !!shopId,
    retry: false,
    queryFn: () => api.getStreak(shopId),
  });
  const moved = useQuery({
    queryKey: ["stock-moved", shopId],
    enabled: !!shopId && perms.canSeeCost,
    retry: false,
    queryFn: () => api.getStockMoved(shopId),
  });
  const alerts = useQuery({
    queryKey: ["alerts", shopId],
    enabled: !!shopId,
    queryFn: () => api.getAlerts(shopId),
    refetchInterval: live,
  });
  const search = useQuery({
    queryKey: ["search", shopId, userId, debounced],
    enabled: !!shopId && debounced.length > 1,
    queryFn: () => api.search(shopId, debounced),
  });
  const demand = useQuery({
    queryKey: ["demand-terms", shopId],
    enabled: !!shopId && debounced.length > 1,
    queryFn: () => api.getDemandTerms(shopId),
  });
  const unpriced = useMemo(
    () =>
      (catalog.data ?? []).filter(
        (item) =>
          item.product.isActive !== false && item.product.sellingPrice == null,
      ).length,
    [catalog.data],
  );
  const attentionItems = useMemo(
    () =>
      (catalog.data ?? [])
        .filter(
          (item) =>
            item.product.isActive !== false &&
            item.product.trackStock !== false &&
            ["OUT", "LOW"].includes(item.stockStatus),
        )
        .sort(
          (a, b) =>
            Number(b.stockStatus === "OUT") - Number(a.stockStatus === "OUT") ||
            a.quantity - b.quantity,
        )
        .slice(0, 5),
    [catalog.data],
  );
  const localHits = useMemo(
    () => searchHomeCatalog(catalog.data, query),
    [catalog.data, query],
  );
  if (!shop) return <Spinner label={uiText("Loading shop")} />;

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const reads = [
      stats,
      catalog,
      recent,
      alerts,
      ...(perms.canEditProducts ? [opening] : []),
      ...(perms.canSeeReports ? [today, yesterday, brief, nudges] : []),
      ...(debounced.length > 1 ? [search, demand] : []),
    ];
    await Promise.allSettled(reads.map((read) => read.refetch()));
    if (alive.current) setRefreshing(false);
  };
  const readError = (failed: boolean, retry: () => void) =>
    failed ? (
      <div className="home-read-error" role="alert">
        <p>{t("homeweb.load_failed", "Could not refresh this information.")}</p>
        <Button tone="ghost" size="sm" onClick={retry}>
          {t("common.retry", "Try again")}
        </Button>
      </div>
    ) : null;
  const lookup = async (code: string) => {
    if (scanBusy.current) return;
    scanBusy.current = true;
    setScanning(true);
    setScanError(null);
    setScanner(false);
    try {
      const result = await api.lookupBarcode(shopId, code, !perms.canSeeCost);
      if (!alive.current) return;
      if (result.found && result.item)
        router.push(`/shop/products/${result.item.productId}`);
      else {
        setQuery(code);
        searchInput.current?.focus();
      }
    } catch (error) {
      if (alive.current) setScanError(error);
    } finally {
      if (alive.current) setScanning(false);
      scanBusy.current = false;
    }
  };
  const noteDemand = async () => {
    if (demandBusy || offline || !canNote) return;
    const term = query.trim();
    setDemandBusy(true);
    setDemandError(null);
    try {
      await api.postDemand(shopId, term);
      if (!alive.current) return;
      setNotedQuery(term);
      setNotice(
        t("nudge.demand.noted", "Noted — we'll count how often it's asked for"),
      );
      void client.invalidateQueries({ queryKey: ["demand-terms", shopId] });
    } catch (error) {
      if (alive.current) setDemandError(error);
    } finally {
      if (alive.current) setDemandBusy(false);
    }
  };
  const trial =
    role === "OWNER" && !trialDismissed ? homeTrialNotice(entitlement) : null;
  // A day with no bills yet is not "-100% vs yesterday"; show the comparison once trading starts.
  const revenueDelta =
    !today.isError && !yesterday.isError && (today.data?.bills ?? 0) > 0
      ? delta(today.data?.revenue, yesterday.data?.revenue)
      : null;
  const attention = [
    {
      key: "low_stock",
      label: t("home.stat_low_stock", "Low stock"),
      n: stats.data?.lowStock,
      warn: true,
    },
    {
      key: "out_of_stock",
      label: t("home.stat_out_of_stock", "Out of stock"),
      n: stats.data?.outOfStock,
      warn: true,
    },
    {
      key: "near_expiry",
      label: t("home.stat_near_expiry", "Near expiry"),
      n: stats.data?.nearExpiry,
      warn: true,
    },
    ...(perms.canEditProducts
      ? [
          {
            key: "unpriced",
            label: t("home.filter_unpriced", "Unpriced"),
            n: catalog.data ? unpriced : undefined,
            warn: false,
          },
        ]
      : []),
  ];
  const searching = query.trim().length > 0,
    currentSearch = query.trim() === debounced && debounced.length > 1;
  const remote = currentSearch ? search.data : undefined;
  const customerHits = perms.canManageCustomers
      ? (remote?.customers ?? [])
      : [],
    supplierHits = perms.canSeeCost ? (remote?.suppliers ?? []) : [];
  const hasHits = !!(
    localHits.length ||
    remote?.sales.length ||
    customerHits.length ||
    supplierHits.length
  );
  const searchPending =
    catalog.isPending ||
    (query.trim().length > 1 && (!currentSearch || search.isPending));
  const canNote =
    currentSearch &&
    !hasHits &&
    catalog.isSuccess &&
    !catalog.isError &&
    search.isSuccess &&
    !search.isError &&
    notedQuery !== query.trim();
  const matchedDemand = matchHomeDemand(demand.data?.terms, query);
  const streakLabel = streak.data
    ? streak.data.current === 0
      ? t("home.streak.label_zero", "Start your streak today")
      : t("home.streak.label_one", "{{count}}-day streak", { count: streak.data.current })
    : null;
  return (
    <div className="shop-page home-dashboard">
      <header className="home-heading">
        <div>
          <div className="home-title-row">
            <h1>{t("homeweb.title", "Your shop today")}</h1>
            {streakLabel ? (
              <span
                className={`home-streak${streak.data?.activeToday ? " is-active" : ""}`}
                title={streak.data?.activeToday ? t("home.streak.active_today", "Active today") : t("home.streak.inactive_today", "Don't break it")}
              >
                {streakLabel}
              </span>
            ) : null}
          </div>
          <p>
            {t(
              "homeweb.subtitle",
              "Start a sale. Catch up on stock. Keep the day moving.",
            )}
          </p>
        </div>
        <div className="shop-actions">
          <Button
            tone="ghost"
            disabled={refreshing || offline}
            onClick={() => void refresh()}
          >
            {refreshing
              ? t("homeweb.refreshing", "Refreshing…")
              : t("homeweb.refresh", "Refresh")}
          </Button>
        </div>
      </header>
      {isPremiumError(streak.error) || isPremiumError(moved.error) ? <PremiumLock feature="insights" /> : null}
      {streak.error && !isPremiumError(streak.error) ? <Notice error={streak.error} /> : null}
      {moved.error && !isPremiumError(moved.error) ? <Notice error={moved.error} /> : null}
      <div className="home-command-bar">
        <div className="home-search-field">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            ref={searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(
              "home.search_placeholder",
              "Search products, bills, customers…",
            )}
            aria-label={t(
              "home.search_placeholder",
              "Search products, bills, customers…",
            )}
          />
          {searching ? (
            <button
              type="button"
              className="home-icon-button"
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
              aria-label={t("homeweb.clear_search", "Clear search")}
            >
              ×
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="home-command"
          disabled={scanning || offline}
          onClick={() => setScanner(true)}
        >
          <Glyph name="qr" />
          {t("homeweb.scan_product", "Find by barcode")}
        </button>
        <Link className="home-command is-voice" href="/shop/voice">
          <Glyph name="mic" />
          {t("a11y.voice", "Voice command")}
        </Link>
      </div>
      <Notice error={scanError} />
      {scanning ? <p role="status">{t("common.loading", "Loading…")}</p> : null}
      {scanner ? (
        <VoiceSheet
          title={t("homeweb.scan_product", "Find by barcode")}
          closeLabel={t("common.close", "Close")}
          onClose={() => setScanner(false)}
        >
          <CounterCamera
            onCode={(code) => void lookup(code)}
            onClose={() => setScanner(false)}
          />
        </VoiceSheet>
      ) : null}
      {trial ? (
        <aside className="home-notice">
          <Link href="/shop/settings/subscription">
            <strong>
              {trial.ending
                ? trial.days
                  ? t(
                      "subscription.trial_banner.ends_in",
                      "Premium trial ends in {{days}} days",
                      { days: trial.days },
                    )
                  : t(
                      "subscription.trial_banner.ends_today",
                      "Premium trial ends today",
                    )
                : t(
                    "subscription.trial_banner.ended",
                    "Your Premium trial has ended",
                  )}
            </strong>
            <span>
              {trial.ending
                ? t(
                    "subscription.trial_banner.ending_body",
                    "Voice, predictions and analytics pause after that. Tap to see how to continue.",
                  )
                : t(
                    "subscription.trial_banner.ended_body",
                    "Your inventory is safe. Tap to see how to bring Premium back.",
                  )}
            </span>
          </Link>
          <button
            type="button"
            className="home-icon-button"
            onClick={() => setTrialDismissed(true)}
            aria-label={t("common.close", "Close")}
          >
            ×
          </button>
        </aside>
      ) : null}
      {opening.data &&
      ["not_started", "in_progress"].includes(opening.data.setup) ? (
        <Link
          href="/shop/settings/opening-balances"
          className="home-setup-link"
        >
          <Glyph name="clipboard" />
          <span>{t("opening.title", "Opening balances & migration")}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
      {searching ? (
        <section
          className="home-results"
          aria-live="polite"
          aria-busy={searchPending}
        >
          {localHits.length ? (
            <>
              <h2>{t("home.search_products", "Products")}</h2>
              {localHits.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/products/${item.productId}`}
                  className="shop-list-row home-product-row"
                >
                  <ProductImage
                    image={item.product.media?.cover}
                    name={item.product.name}
                  />
                  <div className="shop-list-main">
                    <p className="shop-list-title">{item.product.name}</p>
                    <p className="shop-list-meta">
                      {formatQty(item.quantity, item.unit)}
                    </p>
                  </div>
                  <span className="num">
                    {item.product.sellingPrice == null
                      ? t("home.filter_unpriced", "Unpriced")
                      : formatINR(item.product.sellingPrice)}
                  </span>
                </Link>
              ))}
            </>
          ) : null}
          {remote?.sales.length ? (
            <>
              <h2>{t("home.search_orders", "Bills")}</h2>
              {remote.sales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/shop/sales/${sale.id}`}
                  className="shop-list-row"
                >
                  <div className="shop-list-main">
                    <p className="shop-list-title">
                      {t("home.search_bill", "Bill #{{n}}", {
                        n: sale.saleNumber,
                      })}
                    </p>
                    <p className="shop-list-meta">
                      {sale.customerName ??
                        t("checkout.customer_title", "Walk-in")}{" "}
                      · {formatTime(sale.soldAt)}
                    </p>
                  </div>
                  <span
                    className="num"
                    style={{
                      textDecoration:
                        sale.status === "voided" ? "line-through" : undefined,
                    }}
                  >
                    {formatINR(sale.total)}
                  </span>
                </Link>
              ))}
            </>
          ) : null}
          {customerHits.length ? (
            <>
              <h2>{t("home.search_customers", "Customers")}</h2>
              {customerHits.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/shop/customers/${customer.id}`}
                  className="shop-list-row"
                >
                  <span className="shop-list-main">
                    {customer.name}
                    <small className="shop-list-meta">{customer.phone}</small>
                  </span>
                  <span className="num">
                    {formatINR(Math.abs(customer.balance))}
                    {customer.balance < 0 ? (
                      <small>{t("customers.advance_label", "Advance / credit")}</small>
                    ) : null}
                  </span>
                </Link>
              ))}
            </>
          ) : null}
          {supplierHits.length ? (
            <>
              <h2>{t("home.search_suppliers", "Suppliers")}</h2>
              {supplierHits.map((supplier) => (
                <Link
                  key={supplier.name}
                  href={`/shop/suppliers/${encodeURIComponent(supplier.name)}`}
                  className="shop-list-row"
                >
                  <span>{supplier.name}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </>
          ) : null}
          {searchPending ? (
            <Skeleton variant="row" count={2} label={t("common.loading", "Loading…")} />
          ) : null}
          {readError(
            catalog.isError || (currentSearch && search.isError),
            () => {
              void catalog.refetch();
              if (currentSearch) void search.refetch();
            },
          )}
          {!searchPending && !hasHits && !catalog.isError && !search.isError ? (
            <div className="home-empty">
              <h2>{t("home.search_empty_title", "No matches")}</h2>
              <p>
                {t("home.search_empty_subtitle", 'Nothing found for "{{q}}"', {
                  q: query.trim(),
                })}
              </p>
              {matchedDemand ? (
                <p>
                  {t(
                    "nudge.demand.already_noted_one",
                    "Already noted as “{{term}}” — asked {{n}}× this week",
                    { term: matchedDemand.term, n: matchedDemand.asks },
                  )}
                </p>
              ) : null}
              {canNote ? (
                <Button
                  tone="ghost"
                  disabled={demandBusy || offline}
                  onClick={() => void noteDemand()}
                >
                  {matchedDemand
                    ? t(
                        "nudge.demand.count_again",
                        "Count as “{{term}}” again",
                        { term: matchedDemand.term },
                      )
                    : t("nudge.demand.note_it", "Not in stock? Note it")}
                </Button>
              ) : notedQuery === query.trim() ? (
                <p role="status">
                  {t(
                    "nudge.demand.noted",
                    "Noted — we'll count how often it's asked for",
                  )}
                </p>
              ) : null}
              <Notice error={demandError} />
            </div>
          ) : null}
        </section>
      ) : (
        <>
          {perms.canSeeReports ? (
            <div className="home-overview">
              <section className="home-revenue">
                <div className="home-section-top">
                  <h2>{t("homeweb.net_sales", "Net sales today")}</h2>
                  <Link href="/shop/sales" className="home-text-link">
                    {t("homeweb.view_sales", "View sales")}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
                {today.isPending ? (
                  <Skeleton variant="stat" label={t("common.loading", "Loading…")} />
                ) : (
                  <p className="home-revenue-number num">
                    {today.data ? formatINR(today.data.revenue) : "—"}
                  </p>
                )}
                <div className="home-revenue-context">
                  <p>
                    {t(
                      "homeweb.net_sales_help",
                      "After returns, excluding GST",
                    )}
                  </p>
                  {revenueDelta?.pct != null ? (
                    <span className={`dash-delta is-${revenueDelta.dir}`}>
                      {revenueDelta.pct > 0 ? "+" : ""}
                      {revenueDelta.pct}%{" "}
                      {t("common.time_yesterday", "vs yesterday")}
                    </span>
                  ) : null}
                </div>
                {readError(today.isError, () => {
                  void today.refetch();
                })}
                <div className="home-facts">
                  <div>
                    <span>{t("sales.summary.bills", "Bills")}</span>
                    <strong className="num">{today.data?.bills ?? "—"}</strong>
                  </div>
                  <div>
                    <span title={t("reports.sales.average_help", "")}>
                      {t("reports.sales.avg_before_returns", "Average bill")}
                    </span>
                    <strong className="num">
                      {today.data ? formatINR(today.data.avgBill) : "—"}
                    </strong>
                  </div>
                  <div>
                    <span>
                      {premium && today.data?.udhaar
                        ? t("reports.sales.udhaar", "Udhaar")
                        : t("bill.discount", "Discounts")}
                    </span>
                    <strong className="num">
                      {today.data
                        ? formatINR(
                            premium && today.data.udhaar
                              ? today.data.udhaar.givenInRange
                              : today.data.discounts,
                          )
                        : "—"}
                    </strong>
                  </div>
                </div>
                {today.data ? (
                  <div className="home-payments">
                    <p>
                      {t(
                        "homeweb.payment_mix",
                        "Payments · includes collections & refunds",
                      )}
                    </p>
                    <SplitBar summary={today.data} />
                  </div>
                ) : null}
              </section>
              <section className="home-brief">
                <div className="home-section-top">
                  <h2>{t("brief.home_card", "Daily brief")}</h2>
                </div>
                <p className="home-brief-copy">
                  {brief.data?.today?.evidence?.dayLine ||
                    brief.data?.today?.body ||
                    brief.data?.today?.title ||
                    (brief.isPending
                      ? "…"
                      : brief.isError
                        ? "—"
                        : t(
                            "brief.nothing_urgent",
                            "Nothing pressing yet. The brief fills in as the day goes on.",
                          ))}
                </p>
                {readError(brief.isError, () => {
                  void brief.refetch();
                })}
                <div className="home-brief-footer">
                  <span>
                    {brief.data?.items.length
                      ? t(
                          brief.data.items.length === 1
                            ? "brief.n_actions_one"
                            : "brief.n_actions",
                          "{{n}} actions",
                          { n: brief.data.items.length },
                        )
                      : t("homeweb.daily_view", "A clear view of the day")}
                  </span>
                  <Link href="/shop/brief" className="home-text-link">
                    {t("homeweb.open_brief", "Read brief")}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </section>
            </div>
          ) : null}
          {moved.data ? (
            <div className="dash-stats home-month">
              <div className="shop-stat">
                <span className="shop-stat-n num">{formatINR(moved.data.amount)}</span>
                <span className="shop-stat-l">{t("home.stock_moved.title", "Sold this month")}</span>
                <span className="text-xs text-muted">{t("home.stock_moved.subtitle_items", "{{count}} items · {{bills}} bills", { count: moved.data.itemCount, bills: moved.data.removeCount })}{moved.data.source === "legacy" ? ` · ${t("home.stock_moved.legacy_note", "Estimated from stock removed (at cost)")}` : ""}</span>
              </div>
            </div>
          ) : null}
          <section className="home-attention">
            <div className="home-section-top">
              <h2>{t("home.attention", "Needs attention")}</h2>
              <Link href="/shop/alerts" className="home-text-link">
                {t("modal.alerts.title", "Alerts")}
                {alerts.data?.counts.total ? (
                  <span className="home-count">{alerts.data.counts.total}</span>
                ) : null}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="home-attention-grid">
              {attention.map((row) => (
                <Link
                  key={row.key}
                  href={`/shop/products?filter=${row.key}`}
                  className={`home-attention-item ${row.n && row.warn ? "needs-review" : ""}`}
                >
                  <strong className="num">{row.n ?? "—"}</strong>
                  <span>{row.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            {readError(stats.isError, () => {
              void stats.refetch();
            })}
          </section>
          {/* Every destination now lives in the sidebar (or More on a phone); keep only the two counter tasks. */}
          <div className="home-shortcuts">
            <Link href="/shop/sell?scan=1" className="home-text-link">
              <Glyph name="qr" />
              {t("homeweb.scan_bill", "Scan to bill")}
            </Link>
            {perms.canEditProducts ? (
              <Link href="/shop/products/new" className="home-text-link">
                <Glyph name="plus" />
                {t("products.add", "Add product")}
              </Link>
            ) : null}
          </div>
          <div className="home-ledgers">
            <section>
              <SectionHead
                title={t("homeweb.recent_bills", "Recent bills")}
                sub={t("home.section_today", "Today")}
                link={{
                  href: "/shop/sales",
                  label: t("homeweb.view_sales", "View sales"),
                }}
              />
              <div className="home-ledger-list">
                {recent.data?.sales.map((sale) => (
                  <Link
                    key={sale.id}
                    href={`/shop/sales/${sale.id}`}
                    className="shop-list-row"
                  >
                    <HomeBillImage sale={sale} />
                    <div className="shop-list-main">
                      <p className="shop-list-title">
                        {sale.firstItem ??
                          t("homeweb.item_count", "{{n}} items", {
                            n: sale.itemCount,
                          })}
                        {sale.itemCount > 1 && sale.firstItem ? (
                          <span className="text-muted">
                            {" "}
                            +{sale.itemCount - 1}
                          </span>
                        ) : null}
                      </p>
                      <p className="shop-list-meta">
                        <span className="num">#{sale.saleNumber}</span>
                        {" · "}
                        {formatTime(sale.soldAt)}
                        {sale.customerName ? ` · ${sale.customerName}` : ""}
                        {sale.status === "voided"
                          ? ` · ${t("sales.status_filter.voided", "Voided")}`
                          : ""}
                      </p>
                    </div>
                    <div className="shop-list-right">
                      <p
                        className="num"
                        style={{
                          textDecoration:
                            sale.status === "voided"
                              ? "line-through"
                              : undefined,
                        }}
                      >
                        {formatINR(sale.total)}
                      </p>
                      <small>
                        {sale.methods
                          .map((method) => methodName(method, t))
                          .join(" · ")}
                      </small>
                    </div>
                  </Link>
                ))}
                {recent.isPending ? (
                  <Skeleton variant="row" count={3} label={uiText("Loading bills…")} />
                ) : null}
                {readError(recent.isError, () => {
                  void recent.refetch();
                })}
                {recent.isSuccess && !recent.data.sales.length ? (
                  <EmptyState
                    icon="receipt"
                    title={uiText("No bills yet today.")}
                    action={perms.canSell ? (
                      <Button href="/shop/sell" tone="ghost" size="sm">
                        {uiText("Start a sale")}
                      </Button>
                    ) : undefined}
                  />
                ) : null}
              </div>
            </section>
            <section>
              <SectionHead
                title={t("homeweb.stock_watch", "Stock watch")}
                sub={t("homeweb.restock_first", "What to restock first")}
                link={{
                  href: "/shop/products?filter=low_stock",
                  label: t("home.filter_low_stock", "Low stock"),
                }}
              />
              <div className="home-ledger-list">
                {attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/products/${item.productId}`}
                    className="shop-list-row home-product-row"
                  >
                    <ProductImage
                      image={item.product.media?.cover}
                      name={item.product.name}
                    />
                    <div className="shop-list-main">
                      <p className="shop-list-title">{item.product.name}</p>
                      <p className="shop-list-meta">
                        {t("homeweb.on_hand_qty", "{{qty}} in stock", {
                          qty: formatQty(item.quantity, item.unit),
                        })}
                      </p>
                    </div>
                    <Pill tone={stockTone(item)}>
                      {item.stockStatus === "OUT"
                        ? t("home.stat_out_of_stock", "Out of stock")
                        : t("home.stat_low_stock", "Low stock")}
                    </Pill>
                  </Link>
                ))}
                {catalog.isPending ? (
                  <Skeleton variant="row" count={3} label={uiText("Checking stock…")} />
                ) : null}
                {readError(catalog.isError, () => {
                  void catalog.refetch();
                })}
                {catalog.isSuccess && !attentionItems.length ? (
                  <EmptyState
                    icon="package"
                    title={
                      catalog.data.length
                        ? uiText("Stock looks healthy.")
                        : t("home.empty_title", "No products yet")
                    }
                    action={!catalog.data.length && perms.canEditProducts ? (
                      <Button href="/shop/products/new" tone="ghost" size="sm" icon="plus">
                        {t("products.add", "Add product")}
                      </Button>
                    ) : undefined}
                  />
                ) : null}
              </div>
            </section>
          </div>
          {perms.canSeeReports &&
          (nudges.isError ||
            nudges.data?.nudges.some(
              (nudge) => nudge.status === "open" && nudge.kind !== "brief",
            )) ? (
            <section>
              <SectionHead title={t("nudge.section.for_you", "For you")} />
              {readError(nudges.isError, () => {
                void nudges.refetch();
              })}
              <div className="home-suggestions">
                {nudges.data?.nudges
                  .filter(
                    (nudge) =>
                      nudge.status === "open" && nudge.kind !== "brief",
                  )
                  .slice(0, 2)
                  .map((nudge) => (
                    <HomeNudge key={nudge.id} nudge={nudge} />
                  ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
