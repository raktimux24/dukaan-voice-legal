'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatINR } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Button, Card, Spinner } from '../ui';

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
  const catalog = useQuery({ queryKey: ['catalog', shopId, perms.canSeeCost], enabled: !!shopId, queryFn: () => api.getAllInventory(shopId, !perms.canSeeCost) });
  const sales = useQuery({
    queryKey: ['sales-summary', shopId, 'today'],
    enabled: !!shopId && perms.canSeeReports,
    queryFn: () => api.getSalesSummary(shopId, { period: 'today' }),
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

  const unpriced = useMemo(() => (catalog.data ?? []).filter((item) => item.product.sellingPrice == null).length, [catalog.data]);
  const localHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (catalog.data ?? []).filter((item) => item.product.name.toLowerCase().includes(q) || item.product.barcode?.includes(q)).slice(0, 8);
  }, [catalog.data, query]);

  if (!shop) return <Spinner label="Loading shop" />;

  const attention = [
    { key: 'low_stock', label: 'Low stock', n: stats.data?.lowStock ?? 0 },
    { key: 'out_of_stock', label: 'Out of stock', n: stats.data?.outOfStock ?? 0 },
    { key: 'near_expiry', label: 'Near expiry', n: stats.data?.nearExpiry ?? 0 },
    ...(perms.canEditProducts ? [{ key: 'unpriced', label: 'Unpriced', n: unpriced }] : []),
  ];

  const statTone: Record<string, string> = {
    low_stock: 'shop-stat--warn',
    out_of_stock: 'shop-stat--danger',
    near_expiry: 'shop-stat--warn',
    unpriced: 'shop-stat--ok',
  };

  return (
    <div className="shop-page">
      <div className="shop-page-head">
        <div>
          <p className="shop-kicker">Today’s counter</p>
          <h1 className="shop-title">{t('nav.home', 'Home')}</h1>
        </div>
        <div className="shop-actions">
          <Button href="/shop/sell">New sale</Button>
          {perms.canEditProducts ? <Button href="/shop/products/new" tone="ghost">New product</Button> : null}
          <Link href="/shop/alerts" className="shop-alert">
            Alerts
            {alerts.data?.counts.total ? <span className="shop-alert-count">{alerts.data.counts.total}</span> : null}
          </Link>
        </div>
      </div>
      <input
        className="shop-field"
        placeholder="Search products, bills, customers"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search the shop"
      />
      {query.trim() ? (
        <Card className="grid gap-3">
          {localHits.map((item) => (
            <Link key={item.id} href={`/shop/products/${item.productId}`} className="flex justify-between gap-3">
              <span>{item.product.name}</span>
              <span className="text-muted">{item.quantity} {item.unit}</span>
            </Link>
          ))}
          {perms.canSeeReports
            ? search.data?.sales.map((sale) => (
                <Link key={sale.id} href={`/shop/sales/${sale.id}`}>Bill {sale.saleNumber} · {formatINR(sale.total)}</Link>
              ))
            : null}
          {perms.canManageCustomers
            ? search.data?.customers.map((customer) => (
                <Link key={customer.id} href={`/shop/customers/${customer.id}`}>{customer.name} · {formatINR(customer.balance)}</Link>
              ))
            : null}
          {perms.canSeeCost
            ? search.data?.suppliers.map((supplier) => (
                <Link key={supplier.name} href={`/shop/suppliers/${encodeURIComponent(supplier.name)}`}>{supplier.name}</Link>
              ))
            : null}
          {!localHits.length && !search.data?.sales.length ? <p className="text-muted">No matches.</p> : null}
        </Card>
      ) : (
        <>
          <div className="shop-hero">
            {perms.canSeeReports ? (
              <Link href="/shop/sales" className="shop-hero-card">
                <p className="shop-kicker">Today</p>
                <p className="shop-hero-n">{sales.isLoading ? '…' : formatINR(sales.data?.revenue ?? 0)}</p>
                <p className="shop-meta">{sales.data?.bills ?? 0} bills</p>
                {sales.data && (sales.data.byMethod.upi || sales.data.byMethod.cash) ? (
                  <p className="shop-meta">UPI {formatINR(sales.data.byMethod.upi)} · Cash {formatINR(sales.data.byMethod.cash)}</p>
                ) : null}
              </Link>
            ) : null}
            {perms.canSeeReports && brief.data?.today ? (
              <Link href="/shop/brief" className="shop-brief">
                <p className="shop-kicker">Daily brief</p>
                <p className="mt-2 text-ink">{brief.data.today.body || brief.data.today.title}</p>
                <p className="shop-meta">{brief.data.items.length} actions</p>
              </Link>
            ) : null}
          </div>
          {(nudges.data?.nudges ?? []).slice(0, 3).map((nudge) => {
            const action = nudge.action?.type ?? '';
            const allowed = !action || !/price|stock|product|batch/i.test(action) || perms.canEditProducts;
            return (
              <Card key={nudge.id}>
                <p className="font-semibold">{nudge.title}</p>
                <p className="text-sm text-muted">{nudge.body}</p>
                {action && allowed ? (
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-saffron"
                    onClick={() => {
                      void api.nudgeEvent(shopId, nudge.id, 'tapped').catch(() => undefined);
                      void api.actNudge(shopId, nudge.id, nudge.action?.params ?? {}).catch(() => undefined);
                    }}
                  >
                    Do this
                  </button>
                ) : null}
              </Card>
            );
          })}
          <div className="shop-stats">
            {attention.map((row) => (
              <Link key={row.key} href={`/shop/products?filter=${row.key}`} className={`shop-stat ${statTone[row.key] ?? ''}`}>
                <span className="shop-stat-n">{stats.isLoading && row.key !== 'unpriced' ? '…' : row.n}</span>
                <span className="shop-stat-l">{row.label}</span>
              </Link>
            ))}
          </div>
          <div className="shop-shortcuts">
            <Link href="/shop/products" className="shop-shortcut"><strong>{stats.data?.total ?? catalog.data?.length ?? 0}</strong><span>Products</span></Link>
            {perms.canEditProducts ? <Link href="/shop/buy-list" className="shop-shortcut"><strong>Buy</strong><span>Buy list</span></Link> : null}
            {perms.canManageCustomers ? <Link href="/shop/customers" className="shop-shortcut"><strong>{premium ? 'Open' : 'Premium'}</strong><span>Customers</span></Link> : null}
            {perms.canSeeReports ? <Link href="/shop/reports" className="shop-shortcut"><strong>View</strong><span>Reports</span></Link> : null}
            <Link href="/shop/sell" className="shop-shortcut"><strong>Sell</strong><span>New sale</span></Link>
            {perms.canEditProducts ? <Link href="/shop/products/new" className="shop-shortcut"><strong>Add</strong><span>New product</span></Link> : null}
            {perms.canSeeCost ? <Link href="/shop/suppliers" className="shop-shortcut"><strong>Stock</strong><span>Suppliers</span></Link> : null}
          </div>
          {!catalog.isLoading && (catalog.data?.length ?? 0) === 0 ? (
            <Card>
              <h2 className="font-display text-xl">No products yet</h2>
              <p className="mt-2 text-muted">Add the first product, then sell it from the counter.</p>
              {perms.canEditProducts ? <Link className="mt-3 inline-block text-saffron" href="/shop/products/new">Add product</Link> : null}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
