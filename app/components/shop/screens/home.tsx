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
  Glyph,
  Notice,
  Pill,
  SectionHead,
  Spinner,
  type GlyphName,
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
  const alerts = useQuery({
    queryKey: ["alerts", shopId],
    enabled: !!shopId,
    queryFn: () => api.getAlerts(shopId),
    refetchInterval: live,
  });
  const customers = useQuery({
    queryKey: ["customer-summary", shopId],
    enabled: !!shopId && perms.canManageCustomers,
    queryFn: () => api.getCustomerSummary(shopId),
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
      ...(perms.canManageCustomers ? [customers] : []),
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
  const revenueDelta =
    !today.isError && !yesterday.isError
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
  const deskGroups: {
    title: string;
    links: { href: string; label: string; icon: GlyphName; count?: number }[];
  }[] = [
    {
      title: t("homeweb.stock_buying", "Stock & buying"),
      links: [
        {
          href: "/shop/products",
          label: t("products.title", "Products"),
          icon: "package",
          count: stats.data?.total,
        },
        ...(perms.canEditProducts
          ? [
              {
                href: "/shop/buy-list",
                label: t("nav.buy_list", "Buy list"),
                icon: "clipboard" as const,
              },
              {
                href: "/shop/purchase-orders",
                label: t("po.title", "Purchase orders"),
                icon: "truck" as const,
              },
            ]
          : []),
        ...(perms.canSeeCost
          ? [
              {
                href: "/shop/suppliers",
                label: t("suppliers.title", "Suppliers"),
                icon: "bag" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: t("homeweb.money_people", "Money & people"),
      links: [
        ...(perms.canSeeReports
          ? [
              {
                href: "/shop/cashbook",
                label: t("cashbook.title", "Expenses & cashbook"),
                icon: "wallet" as const,
              },
            ]
          : []),
        ...(perms.canManageCustomers
          ? [
              {
                href: "/shop/customers",
                label: t("customers.title", "Customers"),
                icon: "users" as const,
                count: customers.data?.customerCount,
              },
            ]
          : []),
        ...(perms.canSeeReports
          ? [
              {
                href: "/shop/reports",
                label: t("reports.title", "Reports"),
                icon: "landmark" as const,
              },
            ]
          : []),
        {
          href: "/shop/sales",
          label: t("sales.title", "Sales"),
          icon: "receipt",
        },
      ],
    },
  ];
  return (
    <div className="shop-page home-dashboard">
      <header className="home-heading">
        <div>
          <p className="shop-kicker">
            {t("homeweb.workspace", "YOUR SHOP, AT A GLANCE")}
          </p>
          <h1>{t("homeweb.title", "Your shop today")}</h1>
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
          {perms.canSell ? (
            <Button href="/shop/sell">
              <span aria-hidden="true">＋</span>
              {t("home.action_new_sale", "New sale")}
            </Button>
          ) : null}
        </div>
      </header>
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
        <Link className="home-command" href="/shop/voice">
          <span aria-hidden="true" className="home-voice-mark">
            ▥
          </span>
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
          <span aria-hidden="true">↗</span>
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
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </>
          ) : null}
          {searchPending ? (
            <Spinner label={t("common.loading", "Loading…")} />
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
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <p className="home-revenue-number num">
                  {today.data
                    ? formatINR(today.data.revenue)
                    : today.isPending
                      ? "…"
                      : "—"}
                </p>
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
                  <span className="home-brief-orbit" aria-hidden="true">
                    ✳
                  </span>
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
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </section>
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
                <span aria-hidden="true">↗</span>
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
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            {readError(stats.isError, () => {
              void stats.refetch();
            })}
          </section>
          <section className="home-desk">
            <div className="home-section-top">
              <div>
                <h2>{t("homeweb.desk", "The shop desk")}</h2>
                <p>
                  {t(
                    "homeweb.desk_hint",
                    "Everything you need to run the day.",
                  )}
                </p>
              </div>
              <div className="home-desk-actions">
                <Link href="/shop/sell?scan=1" className="home-text-link">
                  <Glyph name="qr" />
                  {t("homeweb.scan_bill", "Scan to bill")}
                </Link>
                {perms.canEditProducts ? (
                  <Link href="/shop/products/new" className="home-text-link">
                    <span aria-hidden="true">＋</span>
                    {t("products.add", "Add product")}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="home-desk-groups">
              {deskGroups.map((group) => (
                <div key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="home-desk-links">
                    {group.links.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <Glyph name={link.icon} />
                        <span>{link.label}</span>
                        {"count" in link && link.count != null ? (
                          <small className="num">{link.count}</small>
                        ) : (
                          <span aria-hidden="true" className="home-desk-arrow">
                            ↗
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
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
                  <Spinner label={uiText("Loading bills…")} />
                ) : null}
                {readError(recent.isError, () => {
                  void recent.refetch();
                })}
                {recent.isSuccess && !recent.data.sales.length ? (
                  <div className="home-empty">
                    <Glyph name="receipt" />
                    <p>{uiText("No bills yet today.")}</p>
                    <Link href="/shop/sell" className="home-text-link">
                      {uiText("Start a sale")} ↗
                    </Link>
                  </div>
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
                        {formatQty(item.quantity, item.unit)}{" "}
                        {t("reports.stock.on_hand", "on hand")}
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
                  <Spinner label={uiText("Checking stock…")} />
                ) : null}
                {readError(catalog.isError, () => {
                  void catalog.refetch();
                })}
                {catalog.isSuccess && !attentionItems.length ? (
                  <div className="home-empty">
                    <Glyph name="package" />
                    <p>
                      {catalog.data.length
                        ? uiText("Stock looks healthy.")
                        : t("home.empty_title", "No products yet")}
                    </p>
                    {!catalog.data.length && perms.canEditProducts ? (
                      <Link
                        href="/shop/products/new"
                        className="home-text-link"
                      >
                        {t("products.add", "Add product")} ↗
                      </Link>
                    ) : null}
                  </div>
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
