'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDay } from '../../../lib/shop/money';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Notice, PageHeader, Pill, PremiumLock, Spinner, isPremiumError } from '../ui';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'stock', label: 'Stock' },
  { id: 'expiry', label: 'Expiry' },
  { id: 'ai', label: 'Predictions' },
] as const;

export function AlertsScreen() {
  const { api, shop, premium, perms } = useShop();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const [error, setError] = useState<unknown>(null);
  const alerts = useQuery({ queryKey: ['alerts', shop?.id], enabled: !!shop, queryFn: () => api.getAlerts(shop!.id) });
  const predictions = useQuery({ queryKey: ['predictions', shop?.id], enabled: !!shop && premium, queryFn: () => api.getPredictions(shop!.id) });
  const buyList = useQuery({
    queryKey: ['buy-list', shop?.id],
    enabled: !!shop && perms.canEditProducts,
    queryFn: () => api.getBuyList(shop!.id),
  });

  const listed = useMemo(() => new Set((buyList.data ?? []).filter((row) => row.status === 'pending' && row.productId).map((row) => row.productId as string)), [buyList.data]);

  if (!shop) return <Spinner />;

  const stock = [
    ...(alerts.data?.stock.outOfStock ?? []).map((row) => ({ ...row, tone: 'out' as const })),
    ...(alerts.data?.stock.lowStock ?? []).map((row) => ({ ...row, tone: 'low' as const })),
  ];
  const expiry = alerts.data?.expiry ?? [];
  const ai = predictions.data?.predictions ?? alerts.data?.predictions ?? [];
  const counts = alerts.data?.counts;

  const addToBuyList = (productId: string, name: string, quantity: number, unit: string) => {
    setError(null);
    void api.addBuyListItem(shop.id, {
      itemName: name,
      quantity: quantity > 0 ? quantity : 1,
      unit,
      productId,
    }).then(() => queryClient.invalidateQueries({ queryKey: ['buy-list', shop.id] })).catch(setError);
  };

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Shop"
        title="Notifications"
        description="Out of stock, running low, and batches that are about to expire."
        actions={
          perms.canSeeReports && premium ? (
            <Button tone="ghost" onClick={() => void api.generatePredictions(shop.id).then(() => queryClient.invalidateQueries({ queryKey: ['predictions', shop.id] })).catch(setError)}>Refresh predictions</Button>
          ) : null
        }
      />
      <div className="shop-seg" role="tablist" aria-label="Notifications">
        {TABS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : undefined} onClick={() => setTab(item.id)}>
            {item.label}
            {item.id === 'all' && counts ? ` ${counts.total}` : null}
            {item.id === 'stock' && counts ? ` ${counts.stock}` : null}
            {item.id === 'expiry' && counts ? ` ${counts.expiry}` : null}
          </button>
        ))}
      </div>
      <Notice error={error ?? alerts.error} />
      {alerts.isLoading ? <Spinner label="Loading notifications" /> : null}

      {(tab === 'all' || tab === 'stock') && stock.length > 0 ? (
        <section className="alert-group">
          {tab === 'all' ? <h2 className="timeline-day">Stock</h2> : null}
          {stock.map((row) => (
            <article key={row.productId} className={row.tone === 'out' ? 'alert-card is-out' : 'alert-card is-low'}>
              <div>
                <Link href={`/shop/products/${row.productId}`} className="shop-list-title">{row.productName}</Link>
                <p className="shop-list-meta">
                  {row.tone === 'out' ? `0 ${row.unit}` : formatQty(row.quantity, row.unit)} · alert at {formatQty(row.minStockLevel, row.unit)}
                </p>
              </div>
              {perms.canEditProducts ? (
                <Button size="sm" tone="ghost" disabled={listed.has(row.productId)} onClick={() => addToBuyList(row.productId, row.productName, row.minStockLevel, row.unit)}>
                  {listed.has(row.productId) ? 'On buy list' : 'Buy'}
                </Button>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {(tab === 'all' || tab === 'expiry') && expiry.length > 0 ? (
        <section className="alert-group">
          {tab === 'all' ? <h2 className="timeline-day">Expiry</h2> : null}
          {expiry.map((row) => (
            <article key={`${row.productId}-${row.expiryDate}`} className={row.daysRemaining <= 7 ? 'alert-card is-out' : 'alert-card is-low'}>
              <div>
                <Link href={`/shop/products/${row.productId}`} className="shop-list-title">{row.productName}</Link>
                <p className="shop-list-meta">{formatQty(row.quantity, row.unit)} · expires {formatDay(row.expiryDate)}</p>
              </div>
              <div className="alert-side">
                <Pill tone={row.daysRemaining <= 7 ? 'danger' : 'warn'}>{row.daysRemaining <= 0 ? 'Expired' : `${row.daysRemaining}d`}</Pill>
                {perms.canEditProducts ? (
                  <Button size="sm" tone="ghost" disabled={listed.has(row.productId)} onClick={() => addToBuyList(row.productId, row.productName, row.quantity, row.unit)}>
                    {listed.has(row.productId) ? 'On buy list' : 'Buy'}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'ai' ? (
        premium ? (
          isPremiumError(predictions.error) ? <PremiumLock feature="predictions" /> : (
            <section className="alert-group">
              {ai.length === 0 ? <p className="shop-list-empty">No predictions yet.</p> : null}
              {ai.map((row) => (
                <article key={row.id} className="alert-card">
                  <div>
                    <p className="shop-list-title">{row.title}</p>
                    <p className="shop-list-meta">{row.description}</p>
                  </div>
                  <Button size="sm" tone="ghost" onClick={() => void api.dismissPrediction(shop.id, row.id).then(() => {
                    void queryClient.invalidateQueries({ queryKey: ['predictions', shop.id] });
                    void queryClient.invalidateQueries({ queryKey: ['alerts', shop.id] });
                  }).catch(setError)}>Dismiss</Button>
                </article>
              ))}
            </section>
          )
        ) : <PremiumLock feature="predictions" />
      ) : null}

      {!alerts.isLoading && tab === 'all' && stock.length === 0 && expiry.length === 0 ? (
        <p className="shop-list-empty">Nothing needs attention.</p>
      ) : null}
      {!alerts.isLoading && tab === 'stock' && stock.length === 0 ? <p className="shop-list-empty">Stock looks fine.</p> : null}
      {!alerts.isLoading && tab === 'expiry' && expiry.length === 0 ? <p className="shop-list-empty">Nothing is close to expiry.</p> : null}
    </div>
  );
}
