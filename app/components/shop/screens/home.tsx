'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatINR, formatTime } from '../../../lib/shop/money';
import type { InventoryItem, SalesSummary } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, PageHeader, Pill, SectionHead, Spinner } from '../ui';

const METHOD_COLORS: Record<string, string> = {
  cash: '#32d583',
  upi: '#ff6b00',
  credit: '#ffb547',
  card: '#8a8a90',
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  credit: 'Udhaar',
  card: 'Card',
};

function delta(today: number | undefined, yesterday: number | undefined) {
  if (today == null || yesterday == null) return null;
  if (yesterday === 0) return today === 0 ? { pct: 0, dir: 'flat' as const } : { pct: null, dir: 'up' as const };
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return { pct, dir: pct > 0 ? ('up' as const) : pct < 0 ? ('down' as const) : ('flat' as const) };
}

function SplitBar({ summary }: { summary: SalesSummary }) {
  const parts = Object.entries(summary.byMethod ?? {}).filter(([, amount]) => amount > 0);
  const total = parts.reduce((sum, [, amount]) => sum + amount, 0);
  if (total <= 0) return <p className="text-sm text-muted">No payments yet today.</p>;
  return (
    <div className="dash-split">
      <div className="dash-split-bar" aria-hidden="true">
        {parts.map(([method, amount]) => (
          <span key={method} style={{ width: `${(amount / total) * 100}%`, background: METHOD_COLORS[method] ?? '#5a5a62' }} />
        ))}
      </div>
      <div className="dash-split-legend">
        {parts.map(([method, amount]) => (
          <span key={method} className="num">
            <i style={{ background: METHOD_COLORS[method] ?? '#5a5a62' }} />
            {METHOD_LABELS[method] ?? method} {formatINR(amount)}
          </span>
        ))}
      </div>
    </div>
  );
}

function stockTone(item: InventoryItem): 'danger' | 'warn' | 'neutral' {
  if (item.stockStatus === 'OUT') return 'danger';
  if (item.stockStatus === 'LOW') return 'warn';
  return 'neutral';
}

export function HomeScreen() {
  const { api, shop, perms, premium, t } = useShop();
  const shopId = shop?.id ?? '';
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const stats = useQuery({ queryKey: ['stats', shopId], enabled: !!shopId, queryFn: () => api.getInventoryStats(shopId) });
  const catalog = useQuery({ queryKey: ['catalog', shopId, !perms.canSeeCost], enabled: !!shopId, queryFn: () => api.getAllInventory(shopId, !perms.canSeeCost) });
  const today = useQuery({
    queryKey: ['sales-summary', shopId, 'today'],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getSalesSummary(shopId, { period: 'today' }),
  });
  const yesterday = useQuery({
    queryKey: ['sales-summary', shopId, 'yesterday'],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getSalesSummary(shopId, { period: 'yesterday' }),
  });
  const recent = useQuery({
    queryKey: ['sales', shopId, 'today', 'recent'],
    enabled: !!shopId,
    queryFn: () => api.getSales(shopId, { period: 'today', limit: 6 }),
  });
  const brief = useQuery({
    queryKey: ['brief', shopId],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getBrief(shopId),
  });
  const nudges = useQuery({ queryKey: ['nudges', shopId], enabled: !!shopId, queryFn: () => api.getNudges(shopId) });
  const alerts = useQuery({ queryKey: ['alerts', shopId], enabled: !!shopId, queryFn: () => api.getAlerts(shopId) });
  const search = useQuery({
    queryKey: ['search', shopId, debounced],
    enabled: !!shopId && debounced.length > 1,
    queryFn: () => api.search(shopId, debounced),
  });

  const unpriced = useMemo(() => (catalog.data ?? []).filter((item) => item.product.isActive !== false && item.product.sellingPrice == null).length, [catalog.data]);
  const attentionItems = useMemo(() => {
    const rank = { OUT: 0, LOW: 1 } as Record<string, number>;
    return (catalog.data ?? [])
      .filter((item) => item.product.isActive !== false && (item.stockStatus === 'OUT' || item.stockStatus === 'LOW'))
      .sort((a, b) => (rank[a.stockStatus] ?? 2) - (rank[b.stockStatus] ?? 2) || a.quantity - b.quantity)
      .slice(0, 6);
  }, [catalog.data]);
  const localHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (catalog.data ?? []).filter((item) => item.product.name.toLowerCase().includes(q) || item.product.barcode?.includes(q)).slice(0, 8);
  }, [catalog.data, query]);

  if (!shop) return <Spinner label="Loading shop" />;

  const revenueDelta = delta(today.data?.revenue, yesterday.data?.revenue);
  const avgBill = today.data && today.data.bills > 0 ? today.data.revenue / today.data.bills : 0;

  const attention = [
    { key: 'low_stock', label: 'Low stock', n: stats.data?.lowStock, tone: 'shop-stat--warn' },
    { key: 'out_of_stock', label: 'Out of stock', n: stats.data?.outOfStock, tone: 'shop-stat--danger' },
    { key: 'near_expiry', label: 'Near expiry', n: stats.data?.nearExpiry, tone: 'shop-stat--warn' },
    ...(perms.canEditProducts ? [{ key: 'unpriced', label: 'Unpriced', n: catalog.isLoading ? undefined : unpriced, tone: 'shop-stat--ok' }] : []),
  ];

  const searching = query.trim().length > 0;

  return (
    <div className="shop-page">
      <PageHeader
        kicker={shop.name}
        title={t('nav.home', 'Home')}
        description="Sales, stock, and what needs attention today."
        actions={
          <>
            <Link href="/shop/alerts" className="shop-alert">
              Alerts
              {alerts.data?.counts.total ? <span className="shop-alert-count">{alerts.data.counts.total}</span> : null}
            </Link>
            {perms.canEditProducts ? <Button href="/shop/products/new" tone="ghost">Add product</Button> : null}
            <Button href="/shop/sell">New sale</Button>
          </>
        }
      />

      <input
        className="shop-field is-lg"
        placeholder="Search products, bills, customers"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search the shop"
      />

      {searching ? (
        <Card flush>
          <div className="shop-list">
            {localHits.map((item) => (
              <Link key={item.id} href={`/shop/products/${item.productId}`} className="shop-list-row">
                <div className="shop-list-main">
                  <p className="shop-list-title">{item.product.name}</p>
                  <p className="shop-list-meta">Product · {formatQty(item.quantity, item.unit)}</p>
                </div>
                <p className="shop-list-right num">{item.product.sellingPrice == null ? 'Unpriced' : formatINR(item.product.sellingPrice)}</p>
              </Link>
            ))}
            {perms.canSeeReports
              ? search.data?.sales.map((sale) => (
                  <Link key={sale.id} href={`/shop/sales/${sale.id}`} className="shop-list-row">
                    <div className="shop-list-main">
                      <p className="shop-list-title">Bill #{sale.saleNumber}</p>
                      <p className="shop-list-meta">{sale.customerName ?? 'Walk-in'} · {formatTime(sale.soldAt)}</p>
                    </div>
                    <p className="shop-list-right num">{formatINR(sale.total)}</p>
                  </Link>
                ))
              : null}
            {perms.canManageCustomers
              ? search.data?.customers.map((customer) => (
                  <Link key={customer.id} href={`/shop/customers/${customer.id}`} className="shop-list-row">
                    <div className="shop-list-main">
                      <p className="shop-list-title">{customer.name}</p>
                      <p className="shop-list-meta">Customer{customer.phone ? ` · ${customer.phone}` : ''}</p>
                    </div>
                    <p className="shop-list-right num">{formatINR(customer.balance)}</p>
                  </Link>
                ))
              : null}
            {perms.canSeeCost
              ? search.data?.suppliers.map((supplier) => (
                  <Link key={supplier.name} href={`/shop/suppliers/${encodeURIComponent(supplier.name)}`} className="shop-list-row">
                    <div className="shop-list-main">
                      <p className="shop-list-title">{supplier.name}</p>
                      <p className="shop-list-meta">Supplier · {supplier.products} products</p>
                    </div>
                  </Link>
                ))
              : null}
            {!localHits.length && !search.data?.sales.length && !search.data?.customers.length && !search.data?.suppliers.length ? (
              <p className="shop-list-empty">{search.isLoading ? 'Searching…' : 'No matches.'}</p>
            ) : null}
          </div>
        </Card>
      ) : (
        <>
          {perms.canSeeReports ? (
            <div className="dash-hero">
              <section className="dash-revenue shop-surface">
                <div>
                  <p className="shop-kicker">Today</p>
                  <p className="dash-revenue-n num">
                    {today.isLoading ? '…' : formatINR(today.data?.revenue ?? 0)}
                    {revenueDelta && !today.isLoading ? (
                      <span className={`dash-delta is-${revenueDelta.dir}`}>
                        {revenueDelta.dir === 'up' ? '▲' : revenueDelta.dir === 'down' ? '▼' : '•'}
                        {revenueDelta.pct == null ? 'new' : `${Math.abs(revenueDelta.pct)}%`} vs yesterday
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="dash-facts">
                  <div>
                    <p className="dash-fact-l">Bills</p>
                    <p className="dash-fact-n num">{today.isLoading ? '…' : today.data?.bills ?? 0}</p>
                  </div>
                  <div>
                    <p className="dash-fact-l">Average bill</p>
                    <p className="dash-fact-n num">{today.isLoading ? '…' : formatINR(avgBill)}</p>
                  </div>
                  <div>
                    <p className="dash-fact-l">{premium && today.data?.udhaar ? 'Udhaar given' : 'Discounts'}</p>
                    <p className="dash-fact-n num">
                      {today.isLoading ? '…' : formatINR(premium && today.data?.udhaar ? today.data.udhaar.givenInRange : today.data?.discounts ?? 0)}
                    </p>
                  </div>
                </div>
                {today.data ? <SplitBar summary={today.data} /> : null}
              </section>

              <section className="dash-brief shop-surface">
                <div>
                  <p className="shop-kicker">Daily brief</p>
                  <p className="dash-brief-body mt-2">
                    {brief.isLoading ? 'Preparing today’s brief…' : brief.data?.today?.body || brief.data?.today?.title || 'Nothing pressing yet. The brief fills in as the day goes on.'}
                  </p>
                </div>
                {brief.data?.items.length ? (
                  <div className="grid gap-2">
                    {brief.data.items.slice(0, 3).map((item) => (
                      <p key={item.id} className="dash-brief-item">{item.title}</p>
                    ))}
                  </div>
                ) : null}
                <Link href="/shop/brief" className="shop-section-link">
                  Open brief{brief.data?.items.length ? ` · ${brief.data.items.length} actions` : ''}
                </Link>
              </section>
            </div>
          ) : null}

          <div className="dash-stats">
            {attention.map((row) => (
              <Link key={row.key} href={`/shop/products?filter=${row.key}`} className={`shop-stat ${row.tone}`}>
                <span className="shop-stat-n num">{row.n == null ? '…' : row.n}</span>
                <span className="shop-stat-l">{row.label}</span>
              </Link>
            ))}
          </div>

          <div className="dash-columns">
            <section>
              <SectionHead title="Recent bills" sub={perms.canSeeReports ? 'Today, newest first' : 'Your bills today'} link={{ href: '/shop/sales', label: 'All sales' }} />
              <Card flush>
                <div className="shop-list">
                  {(recent.data?.sales ?? []).map((sale) => (
                    <Link key={sale.id} href={`/shop/sales/${sale.id}`} className="shop-list-row">
                      <div className="shop-list-main">
                        <p className="shop-list-title">
                          #{sale.saleNumber} · {sale.firstItem ?? `${sale.itemCount} items`}
                          {sale.itemCount > 1 && sale.firstItem ? <span className="text-muted"> +{sale.itemCount - 1}</span> : null}
                        </p>
                        <p className="shop-list-meta">
                          {formatTime(sale.soldAt)}
                          {sale.customerName ? ` · ${sale.customerName}` : ''}
                          {sale.status === 'voided' ? ' · voided' : ''}
                        </p>
                      </div>
                      <div className="shop-list-right">
                        <p className="num font-semibold">{formatINR(sale.total)}</p>
                        <p className="mt-1 flex justify-end gap-1">
                          {sale.methods.map((method) => (
                            <Pill key={method} tone={method === 'credit' ? 'warn' : 'neutral'}>{METHOD_LABELS[method] ?? method}</Pill>
                          ))}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {recent.isLoading ? <p className="shop-list-empty">Loading bills…</p> : null}
                  {!recent.isLoading && (recent.data?.sales.length ?? 0) === 0 ? (
                    <p className="shop-list-empty">No bills yet today. <Link href="/shop/sell" className="text-saffron">Start a sale</Link>.</p>
                  ) : null}
                </div>
              </Card>
            </section>

            <section>
              <SectionHead title="Needs attention" sub="Out of stock and running low" link={{ href: '/shop/products?filter=low_stock', label: 'All low stock' }} />
              <Card flush>
                <div className="shop-list">
                  {attentionItems.map((item) => (
                    <Link key={item.id} href={`/shop/products/${item.productId}`} className="shop-list-row">
                      <div className="shop-list-main">
                        <p className="shop-list-title">{item.product.name}</p>
                        <p className="shop-list-meta">
                          {formatQty(item.quantity, item.unit)} on hand
                          {item.product.minStockLevel > 0 ? ` · min ${formatQty(item.product.minStockLevel, item.unit)}` : ''}
                        </p>
                      </div>
                      <Pill tone={stockTone(item)}>{item.stockStatus === 'OUT' ? 'Out' : 'Low'}</Pill>
                    </Link>
                  ))}
                  {catalog.isLoading ? <p className="shop-list-empty">Checking stock…</p> : null}
                  {!catalog.isLoading && attentionItems.length === 0 ? <p className="shop-list-empty">Stock looks healthy.</p> : null}
                </div>
              </Card>
            </section>
          </div>

          {(nudges.data?.nudges.length ?? 0) > 0 ? (
            <section>
              <SectionHead title="Suggestions" sub="Based on this shop’s recent activity" />
              <Card flush>
                {(nudges.data?.nudges ?? []).slice(0, 4).map((nudge) => {
                  const action = nudge.action?.type ?? '';
                  const allowed = !action || !/price|stock|product|batch/i.test(action) || perms.canEditProducts;
                  return (
                    <div key={nudge.id} className="dash-nudge">
                      <div className="min-w-0">
                        <p className="font-medium">{nudge.title}</p>
                        <p className="mt-1 text-sm text-muted">{nudge.body}</p>
                      </div>
                      {action && allowed ? (
                        <Button
                          tone="ghost"
                          size="sm"
                          onClick={() => {
                            void api.nudgeEvent(shopId, nudge.id, 'tapped').catch(() => undefined);
                            void api.actNudge(shopId, nudge.id, nudge.action?.params ?? {}).catch(() => undefined);
                          }}
                        >
                          Do this
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </Card>
            </section>
          ) : null}

          {!catalog.isLoading && (catalog.data?.length ?? 0) === 0 ? (
            <Card>
              <h2 className="font-display text-xl">No products yet</h2>
              <p className="mt-2 text-muted">Add the first product, then sell it from the counter.</p>
              {perms.canEditProducts ? <div className="mt-4"><Button href="/shop/products/new">Add product</Button></div> : null}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
