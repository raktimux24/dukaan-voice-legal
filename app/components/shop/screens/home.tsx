'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatINR } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Card, Spinner } from '../ui';

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

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{t('nav.home', 'Home')}</h1>
        <Link href="/shop/alerts" className="rounded-full border border-line px-3 py-2 text-sm">
          Alerts {alerts.data?.counts.total ? <span className="text-danger">{alerts.data.counts.total}</span> : null}
        </Link>
      </div>
      <input
        className="rounded-xl border border-line bg-card px-4 py-3"
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
          {perms.canSeeReports ? (
            <Link href="/shop/sales">
              <Card>
                <p className="text-sm text-muted">Today</p>
                <p className="font-display text-3xl">{sales.isLoading ? '…' : formatINR(sales.data?.revenue ?? 0)}</p>
                <p className="text-muted">{sales.data?.bills ?? 0} bills</p>
                {sales.data && (sales.data.byMethod.upi || sales.data.byMethod.cash) ? (
                  <p className="mt-2 text-xs text-faint">UPI {formatINR(sales.data.byMethod.upi)} · Cash {formatINR(sales.data.byMethod.cash)}</p>
                ) : null}
              </Card>
            </Link>
          ) : null}
          {perms.canSeeReports && brief.data?.today ? (
            <Link href="/shop/brief">
              <Card>
                <p className="text-sm text-saffron">Daily brief</p>
                <p className="mt-1">{brief.data.today.body || brief.data.today.title}</p>
                <p className="mt-1 text-xs text-muted">{brief.data.items.length} actions</p>
              </Card>
            </Link>
          ) : null}
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {attention.map((row) => (
              <Link key={row.key} href={`/shop/products?filter=${row.key}`}>
                <Card>
                  <p className={`font-display text-3xl ${row.n > 0 && row.key !== 'all' ? 'text-danger' : ''}`}>{stats.isLoading && row.key !== 'unpriced' ? '…' : row.n}</p>
                  <p className="text-sm text-muted">{row.label}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/shop/products"><Card><p className="font-semibold">Products</p><p className="text-muted">{stats.data?.total ?? catalog.data?.length ?? 0}</p></Card></Link>
            {perms.canEditProducts ? <Link href="/shop/buy-list"><Card><p className="font-semibold">Buy list</p></Card></Link> : null}
            {perms.canManageCustomers ? <Link href="/shop/customers"><Card><p className="font-semibold">Customers</p><p className="text-xs text-muted">{premium ? '' : 'Premium'}</p></Card></Link> : null}
            {perms.canSeeReports ? <Link href="/shop/reports"><Card><p className="font-semibold">Reports</p></Card></Link> : null}
            <Link href="/shop/sell"><Card><p className="font-semibold">Sell</p></Card></Link>
            {perms.canEditProducts ? <Link href="/shop/products/new"><Card><p className="font-semibold">Add product</p></Card></Link> : null}
            {perms.canSeeCost ? <Link href="/shop/suppliers"><Card><p className="font-semibold">Suppliers</p></Card></Link> : null}
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
