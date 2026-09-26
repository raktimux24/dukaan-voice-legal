'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDay, formatINR } from '../../../lib/shop/money';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Card, NoAccess, Notice, PageHeader, Pill, Spinner } from '../ui';

export function SupplierDetailScreen({ name }: { name: string }) {
  const { api, shop, perms } = useShop();
  const decoded = decodeURIComponent(name);
  const detail = useQuery({
    queryKey: ['supplier', shop?.id, decoded],
    enabled: !!shop && perms.canSeeCost && decoded.trim().length > 0,
    queryFn: () => api.getSupplier(shop!.id, decoded),
  });

  if (!shop) return <Spinner />;
  if (!perms.canSeeCost) return <NoAccess what="Suppliers show purchase prices, so helpers cannot open them." />;
  if (!decoded.trim()) return <Notice error={new Error('A supplier name is required.')} />;
  if (detail.isLoading) return <Spinner label="Loading supplier" />;
  if (detail.error) return <Notice error={detail.error} />;
  if (!detail.data) return <Card><p>That supplier was not found.</p></Card>;

  const { summary, items, batches } = detail.data;

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/suppliers', label: 'Suppliers' }}
        kicker="Supplier"
        title={detail.data.name || decoded}
        description={summary.lastAt ? `Last purchase ${formatDay(summary.lastAt)}` : 'No purchases recorded yet.'}
      />
      <div className="stat-strip">
        <div className="kpi"><p className="kpi-label">Spend</p><p className="kpi-value">{formatINR(summary.spend)}</p></div>
        <div className="kpi"><p className="kpi-label">Products</p><p className="kpi-value">{summary.products}</p></div>
        <div className="kpi"><p className="kpi-label">Batches</p><p className="kpi-value">{summary.batches}</p></div>
        <div className="kpi"><p className="kpi-label">First purchase</p><p className="kpi-value is-compact">{formatDay(summary.firstAt)}</p></div>
      </div>
      <Card flush>
        <div className="card-intro">
          <h2 className="shop-section-title">Products</h2>
          <p className="shop-section-sub">Last price paid, the range across batches, and another supplier when one exists.</p>
        </div>
        <div className="shop-list">
          {items.length === 0 ? <p className="shop-list-empty">No products from this supplier yet.</p> : null}
          {items.map((item) => (
            <Link key={item.productId} href={`/shop/products/${item.productId}`} className="shop-list-row">
              <div className="shop-list-main">
                <p className="shop-list-title">{item.name}</p>
                <p className="shop-list-meta">
                  Last {formatINR(item.lastPrice)}
                  {item.minPrice !== item.maxPrice ? ` · ${formatINR(item.minPrice)}–${formatINR(item.maxPrice)}` : ''}
                  {' · '}
                  {formatQty(item.quantity, item.unit)} bought
                </p>
                {item.alt ? <p className="shop-list-meta">Also from {item.alt.supplier} at {formatINR(item.alt.price)}</p> : null}
              </div>
              <div className="shop-list-right">
                <p>{formatINR(item.spend)}</p>
                <p className="shop-list-meta">{item.batches} batches</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
      <Card flush>
        <div className="card-intro">
          <h2 className="shop-section-title">Batches</h2>
          <p className="shop-section-sub">What arrived, what is still on the shelf, and when it expires.</p>
        </div>
        <div className="shop-list">
          {batches.length === 0 ? <p className="shop-list-empty">No batches recorded.</p> : null}
          {batches.map((batch) => (
            <div key={batch.id} className="shop-list-row">
              <div className="shop-list-main">
                <p className="shop-list-title">{batch.name}</p>
                <p className="shop-list-meta">
                  {formatDay(batch.at)} · {formatINR(batch.price)} · {formatQty(batch.remaining, batch.unit)} left of {formatQty(batch.quantity, batch.unit)}
                  {batch.expiryDate ? ` · expires ${formatDay(batch.expiryDate)}` : ''}
                </p>
              </div>
              <Pill tone={batch.status === 'active' ? 'ok' : 'neutral'}>{batch.status}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
