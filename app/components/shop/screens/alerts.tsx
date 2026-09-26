'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useShop } from '../context';
import { Button, Card, Notice, PremiumLock, Spinner, isPremiumError } from '../ui';

export function AlertsScreen() {
  const { api, shop, premium, perms } = useShop();
  const queryClient = useQueryClient();
  const alerts = useQuery({ queryKey: ['alerts', shop?.id], enabled: !!shop, queryFn: () => api.getAlerts(shop!.id) });
  const predictions = useQuery({ queryKey: ['predictions', shop?.id], enabled: !!shop && premium, queryFn: () => api.getPredictions(shop!.id) });
  const [error, setError] = useState<unknown>(null);
  if (!shop) return <Spinner />;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Alerts</h1>
        {perms.canSeeReports && premium ? (
          <Button tone="ghost" onClick={() => void api.generatePredictions(shop.id).then(() => queryClient.invalidateQueries({ queryKey: ['predictions', shop.id] })).catch(setError)}>Refresh predictions</Button>
        ) : null}
      </div>
      <Notice error={error} />
      {alerts.isLoading ? <Spinner label="Loading alerts" /> : null}
      <Card>
        <h2 className="font-semibold">Out of stock</h2>
        {(alerts.data?.stock.outOfStock ?? []).map((row) => <Link key={row.productId} className="mt-2 block" href={`/shop/products/${row.productId}`}>{row.productName}</Link>)}
        {(alerts.data?.stock.outOfStock.length ?? 0) === 0 ? <p className="text-muted">None</p> : null}
      </Card>
      <Card>
        <h2 className="font-semibold">Low stock</h2>
        {(alerts.data?.stock.lowStock ?? []).map((row) => <Link key={row.productId} className="mt-2 block" href={`/shop/products/${row.productId}`}>{row.productName} · {row.quantity} {row.unit}</Link>)}
      </Card>
      <Card>
        <h2 className="font-semibold">Expiry</h2>
        {(alerts.data?.expiry ?? []).map((row) => <Link key={`${row.productId}-${row.expiryDate}`} className="mt-2 block" href={`/shop/products/${row.productId}`}>{row.productName} · {row.daysRemaining} days</Link>)}
      </Card>
      {premium ? (
        <Card>
          <h2 className="font-semibold">Predictions</h2>
          {isPremiumError(predictions.error) ? <PremiumLock shopId={shop.id} feature="predictions" /> : null}
          {(predictions.data?.predictions ?? alerts.data?.predictions ?? []).map((row) => (
            <div key={row.id} className="mt-3 border-t border-line pt-3">
              <p className="font-medium">{row.title}</p>
              <p className="text-sm text-muted">{row.description}</p>
              <Button tone="ghost" onClick={() => void api.dismissPrediction(shop.id, row.id).then(() => queryClient.invalidateQueries({ queryKey: ['predictions', shop.id] })).catch(setError)}>Dismiss</Button>
            </div>
          ))}
        </Card>
      ) : perms.canSeeReports ? <PremiumLock shopId={shop.id} feature="predictions" /> : null}
    </div>
  );
}
