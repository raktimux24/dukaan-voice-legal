'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { downloadText } from '../../../lib/shop/csv';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Button, Card, Chip, Field, NoAccess, Notice, PageHeader, Pill, PremiumLock, Spinner, isPremiumError } from '../ui';

const PERIODS = ['today', 'yesterday', 'week', 'month'] as const;

export function SalesScreen() {
  const { api, shop, perms, premium, t } = useShop();
  const [period, setPeriod] = useState<(typeof PERIODS)[number] | 'custom'>('today');
  const [desk, setDesk] = useState<'all' | 'udhaar'>('all');
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

  const rows = (sales.data?.sales ?? []).filter((sale) => desk === 'all' || sale.creditTotal > 0 || sale.paymentStatus === 'credit' || sale.paymentStatus === 'partial');

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Counter"
        title={t('sales.title', 'Sales')}
        description={sales.data ? `${sales.data.total} ${sales.data.total === 1 ? 'bill' : 'bills'} in this range` : undefined}
        actions={
          perms.canSeeReports ? (
            premium ? (
              <Button
                tone="ghost"
                onClick={() => {
                  void api.salesCsv(shop.id, period === 'custom' ? { from: applied.from, to: applied.to } : { period }).then((csv) => downloadText(`sales-${period}.csv`, csv)).catch(setError);
                }}
              >
                Export CSV
              </Button>
            ) : <Button href="/shop/settings/subscription" tone="ghost">CSV needs Premium</Button>
          ) : null
        }
      />
      <Notice error={error ?? (sales.error && !isPremiumError(sales.error) ? sales.error : null)} />
      {isPremiumError(error) || isPremiumError(sales.error) ? <PremiumLock shopId={shop.id} feature="pos_reports" /> : null}
      <div className="pos-chips" role="tablist" aria-label="Bill type">
        <Chip active={desk === 'all'} onClick={() => setDesk('all')}>All bills</Chip>
        <Chip active={desk === 'udhaar'} onClick={() => setDesk('udhaar')}>Udhaar</Chip>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="pos-chips">
          {PERIODS.map((item) => (
            <Chip key={item} active={period === item} onClick={() => setPeriod(item)}>{item[0].toUpperCase() + item.slice(1)}</Chip>
          ))}
          <Chip active={period === 'custom'} onClick={() => setPeriod('custom')}>Custom range</Chip>
        </div>
        {period === 'custom' ? (
          <div className="flex flex-wrap items-end gap-3">
            <Field label="From"><input className="shop-field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></Field>
            <Field label="To"><input className="shop-field" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></Field>
            <Button tone="ghost" onClick={() => {
              setError(null);
              setApplied({ from, to });
            }}>Apply</Button>
          </div>
        ) : null}
      </div>
      {sales.data?.limitedToDays ? <p className="text-sm text-muted">Showing the last {sales.data.limitedToDays} days.</p> : null}
      {sales.isLoading ? <Spinner label="Loading sales" /> : null}
      <Card flush>
        <div className="shop-list">
          {rows.map((sale) => (
            <Link key={sale.id} href={`/shop/sales/${sale.id}`} className="shop-list-row">
              <div className="shop-list-main">
                <p className="shop-list-title">
                  #{sale.saleNumber}
                  {sale.customerName ? ` · ${sale.customerName}` : ''}
                  {sale.firstItem ? <span className="text-muted"> · {sale.firstItem}{sale.itemCount > 1 ? ` +${sale.itemCount - 1}` : ''}</span> : null}
                </p>
                <p className="shop-list-meta">{formatWhen(sale.soldAt)} · {sale.sellerName}</p>
              </div>
              <div className="shop-list-right flex items-center gap-4">
                <p className="num font-semibold">{formatINR(sale.total)}</p>
                {sale.status === 'voided' ? <Pill tone="danger">Voided</Pill> : sale.paymentStatus === 'credit' ? <Pill tone="warn">Udhaar</Pill> : sale.paymentStatus === 'partial' ? <Pill tone="warn">Partial</Pill> : <Pill tone="ok">Paid</Pill>}
              </div>
            </Link>
          ))}
          {!sales.isLoading && rows.length === 0 ? <p className="shop-list-empty">{desk === 'udhaar' ? 'No udhaar bills in this range.' : 'No bills in this range.'}</p> : null}
        </div>
      </Card>
    </div>
  );
}
