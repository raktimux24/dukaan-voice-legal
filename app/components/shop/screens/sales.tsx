'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { downloadText } from '../../../lib/shop/csv';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, PremiumLock, Spinner, isPremiumError } from '../ui';

const PERIODS = ['today', 'yesterday', 'week', 'month'] as const;

export function SalesScreen() {
  const { api, shop, perms, premium } = useShop();
  const [period, setPeriod] = useState<(typeof PERIODS)[number] | 'custom'>('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ from: '', to: '' });
  const [error, setError] = useState<unknown>(null);
  const lastGood = useRef(applied);
  const params = period === 'custom' ? { from: applied.from, to: applied.to } : { period };
  const sales = useQuery({
    queryKey: ['sales', shop?.id, period, applied.from, applied.to],
    enabled: !!shop?.id && (period !== 'custom' || (!!applied.from && !!applied.to)),
    queryFn: () => api.getSales(shop!.id, { ...params, limit: 50 }),
  });

  useEffect(() => {
    if (sales.isSuccess) lastGood.current = applied;
  }, [applied, sales.isSuccess]);

  useEffect(() => {
    if (sales.error instanceof ApiError && sales.error.code === 'invalid_range') {
      setError(sales.error);
      setApplied(lastGood.current);
    }
  }, [sales.error]);

  if (!shop) return <Spinner />;
  if (!perms.canSell) return <NoAccess what="You cannot view sales." />;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Sales</h1>
        {perms.canSeeReports ? (
          premium ? (
            <Button
              tone="ghost"
              onClick={() => {
                void api.salesCsv(shop.id, period === 'custom' ? { from: applied.from, to: applied.to } : { period }).then((csv) => downloadText(`sales-${period}.csv`, csv)).catch(setError);
              }}
            >
              Export CSV
            </Button>
          ) : <Button href={`/account?shopId=${shop.id}`}>Premium CSV</Button>
        ) : null}
      </div>
      <Notice error={error ?? (sales.error && !isPremiumError(sales.error) ? sales.error : null)} />
      {isPremiumError(error) || isPremiumError(sales.error) ? <PremiumLock shopId={shop.id} feature="pos_reports" /> : null}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((item) => (
          <Button key={item} tone={period === item ? 'primary' : 'ghost'} onClick={() => setPeriod(item)}>{item}</Button>
        ))}
        <Button tone={period === 'custom' ? 'primary' : 'ghost'} onClick={() => setPeriod('custom')}>Range</Button>
      </div>
      {period === 'custom' ? (
        <Card className="flex flex-wrap items-end gap-3">
          <label className="text-sm">From<input className="mt-1 block rounded-lg border border-line bg-elevated px-3 py-2" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="text-sm">To<input className="mt-1 block rounded-lg border border-line bg-elevated px-3 py-2" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <Button onClick={() => {
            setError(null);
            setApplied({ from, to });
          }}>Apply</Button>
        </Card>
      ) : null}
      {sales.data?.limitedToDays ? <p className="text-sm text-muted">Showing the last {sales.data.limitedToDays} days.</p> : null}
      {sales.isLoading ? <Spinner label="Loading sales" /> : null}
      <div className="grid gap-2">
        {(sales.data?.sales ?? []).map((sale) => (
          <Link key={sale.id} href={`/shop/sales/${sale.id}`} className="shop-surface rounded-xl border border-line bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">#{sale.saleNumber} {sale.customerName ? `· ${sale.customerName}` : ''}</p>
                <p className="text-sm text-muted">{formatWhen(sale.soldAt)} · {sale.sellerName} · {sale.itemCount} items</p>
              </div>
              <div className="text-right">
                <p>{formatINR(sale.total)}</p>
                <p className="text-xs text-muted">{sale.status} · {sale.paymentStatus}</p>
              </div>
            </div>
          </Link>
        ))}
        {!sales.isLoading && (sales.data?.sales.length ?? 0) === 0 ? <Card><p>No bills in this range.</p></Card> : null}
      </div>
    </div>
  );
}
