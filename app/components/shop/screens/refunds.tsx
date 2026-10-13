'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useShop } from '../context';
import { useGstText, useFiscalDate } from '../gst-ui';
import { formatINR } from '../../../lib/shop/money';
import { Button, Card, Chip, NoAccess, Notice, PageHeader, PremiumLock, Spinner, isPremiumError } from '../ui';

const PERIODS = ['today', '7d', '30d', 'month'] as const;
export function RefundsScreen() {
  const { api, shop, userId, perms, t } = useShop();
  const when = useFiscalDate();
  const uiText = useGstText();
  const [period, setPeriod] = useState<typeof PERIODS[number]>('7d');
  const refunds = useInfiniteQuery({
    queryKey: ['refunds', userId, shop?.id, period],
    enabled: !!shop && perms.canSeeReports,
    initialPageParam: 0,
    queryFn: ({pageParam}) => api.getReturns(shop!.id, {period, offset: pageParam, limit: 50}),
    getNextPageParam: (last, _pages, offset) => last.hasMore && last.refunds.length ? offset + last.refunds.length : undefined,
  });
  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what={t('refunds.no_access', 'Refunds are for owners and managers.')} />;
  const rows = refunds.data?.pages.flatMap(page => page.refunds) ?? [];
  const summary = refunds.data?.pages[0]?.summary;
  const limited = refunds.data?.pages[0]?.limitedToDays;
  return <div className="shop-page">
    <PageHeader title={t('refunds.title', 'Refunds')} back={{href: '/shop/sales', label: t('sales.title', 'Sales')}} description={t('refunds.empty_subtitle', 'When you return items from a bill, they show up here.')} />
    <div className="pos-chips" role="tablist" aria-label={t('refunds.title', 'Refunds')}>
      {PERIODS.map(value => <Chip key={value} active={period === value} onClick={() => setPeriod(value)}>{t(`sales.period.${value}`, value === 'today' ? 'Today' : value === '7d' ? 'Last 7 days' : value === '30d' ? 'Last 30 days' : 'This month')}</Chip>)}
    </div>
    {summary ? <div className="kpi-grid">
      <Card><p className="kpi-label">{t('refunds.summary.count', 'Returns')}</p><p className="kpi-value">{summary.count}</p></Card>
      <Card><p className="kpi-label">{t('refunds.summary.total_value', 'Return total')}</p><p className="kpi-value">{formatINR(summary.amount)}</p></Card>
      {Object.entries(summary.byMethod).filter(([,value]) => value > 0).map(([method, value]) => <Card key={method}><p className="kpi-label">{t(`pos.method.${method}`, method)}</p><p className="kpi-value">{formatINR(value)}</p></Card>)}
    </div> : null}
    {limited ? <p className="party-meta">{t('activity.free_limit_title', 'Showing the last {{days}} days.', {days: limited})}</p> : null}
    {isPremiumError(refunds.error) ? <PremiumLock feature="pos_reports" /> : <Notice error={refunds.error} />}
    {refunds.isError ? <Button tone="ghost" onClick={() => void refunds.refetch()}>{t('common.retry', 'Try again')}</Button> : null}
    {refunds.isLoading ? <Spinner /> : null}
    <Card flush><div className="shop-list">
      {rows.map(row => <Link key={row.id} href={`/shop/sales/${row.saleId}`} className="shop-list-row">
        <div className="shop-list-main">
          <p className="shop-list-title">{t('refunds.bill', 'Bill #{{n}}', {n: row.invoiceNumber ?? row.saleNumber})}</p>
          <p className="shop-list-meta">{when(row.createdAt)} · {row.firstItem && row.itemCount === 1 ? row.firstItem : t('refunds.items_count', '{{n}} items', {n: row.itemCount})}{row.customerName ? ` · ${row.customerName}` : ''}{row.refundMethod ? ` · ${t(`pos.method.${row.refundMethod}`, row.refundMethod)}` : ''}</p>
          {row.settlement ? <p className="shop-list-meta">{t('bill.fiscal.credit_reduced', 'Unpaid credit reduced')}: {formatINR(Number(row.settlement.creditReduction))} · {t('refunds.money_refunded', 'Money refunded')}: {formatINR(Number(row.settlement.moneyRefund))}</p> : null}
          {row.reason ? <p className="shop-list-meta">{row.reason}</p> : null}
        </div>
        <p className="num font-semibold text-danger">−{formatINR(row.refundAmount)}</p>
      </Link>)}
      {refunds.isSuccess && rows.length === 0 ? <p className="shop-list-empty">{t('refunds.empty_title', 'No refunds in this period')}</p> : null}
    </div></Card>
    {refunds.hasNextPage ? <Button tone="ghost" disabled={refunds.isFetchingNextPage} onClick={() => void refunds.fetchNextPage()}>{refunds.isFetchingNextPage ? t('common.loading', 'Loading') : uiText('Load more')}</Button> : null}
  </div>;
}
