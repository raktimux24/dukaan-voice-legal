'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { taxHistoryBoundary, watchTaxHistoryBoundary } from '../../lib/shop/tax-history-refresh';
import type { TaxHistory } from '../../lib/shop/gst-types';
import { EN_FALLBACK } from '../../lib/shop/en-fallback';
import { useShop } from './context';
import { useGstPages, ReadState, More } from './gst-workspace';
import { useGstText, useFiscalDate } from './gst-ui';
import { Button, Card, Pill } from './ui';

const subscribeOnline = (listener: () => void) => onlineManager.subscribe(listener);
export function useProductTaxHistory(productId: string, allowed = true) {
  const { api, shop, perms } = useShop();
  const enabled = allowed && perms.canSeeReports;
  const query = useGstPages(['tax-history', productId], cursor => api.gst.taxHistory(shop!.id, productId, cursor), enabled);
  const capture = query.data?.pages.at(-1) as TaxHistory | undefined;
  const online = useSyncExternalStore(subscribeOnline, () => onlineManager.isOnline(), () => true);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  let boundary: number | null = null, invalidCapture = false;
  try { boundary = capture ? taxHistoryBoundary(capture) : null; } catch { invalidCapture = true; }
  const due = boundary !== null && boundary <= Date.now();
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => { setRefreshNeeded(true); void query.refetch({ cancelRefetch: false }); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visible);
    setRefreshNeeded(invalidCapture || due);
    const stop = boundary === null ? undefined : watchTaxHistoryBoundary(boundary, {
      now: Date.now,
      setTimer: (fn, delay) => setTimeout(fn, delay),
      clearTimer: timer => clearTimeout(timer as ReturnType<typeof setTimeout>),
    }, refresh);
    return () => { stop?.(); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [enabled, capture, query.dataUpdatedAt, query.refetch, boundary, invalidCapture, due]);
  return { ...query, capture, historyFresh: !!capture && online && !query.error && !query.isFetching && !query.isPending && !refreshNeeded && !due && !invalidCapture };
}

export function TaxHistoryRefresh({ query }: { query: ReturnType<typeof useProductTaxHistory> }) {
  const { t } = useShop();
  return !query.isPending && !query.historyFresh ? <Button tone="ghost" disabled={query.isFetching} onClick={() => void query.refetch({cancelRefetch:false})}>{t('gst.tax_history_refresh_needed', EN_FALLBACK['gst.tax_history_refresh_needed'])}</Button> : null;
}

export function TaxHistoryRows({ rows, capture, action }: {
  rows: TaxHistory['items'];
  capture?: TaxHistory;
  action?: (row: TaxHistory['items'][number]) => ReactNode;
}) {
  const { t } = useShop(), text = useGstText(), date = useFiscalDate();
  const label = (key: keyof typeof EN_FALLBACK, vars?: Record<string, string | number>) => t(key, EN_FALLBACK[key], vars);
  const status = capture?.currentProfileStatus;
  const effective = capture?.effectiveVersion === undefined ? capture?.currentVersion : capture.effectiveVersion;
  return <>
    {status && status !== 'matches' && status !== 'not_configured' ? <p className="shop-hint text-warning">{label(`gst.tax_history_status.${status}`)}</p> : null}
    {rows.map(row => {
      const current = effective === undefined ? row.current : row.id === effective;
      const key = row.draft ? 'gst.tax_history_draft' : row.cancelledAt ? 'gst.tax_history_cancelled' : row.disabled ? 'gst.tax_history_disabled' : row.scheduled && row.effectiveAt && Date.parse(row.effectiveAt) > Date.now() ? 'gst.tax_history_scheduled' : current ? status && status !== 'matches' ? 'gst.tax_history_reference' : 'gst.tax_history_current' : 'gst.tax_history_previous';
      const tax = row.draft ?? row.config;
      return <Card key={row.id} className="grid gap-2">
        <div><Pill tone={row.valid && !row.draft ? 'ok' : 'warn'}>{label(key)}</Pill></div>
        <p>{row.disabled ? label('gst.tax_history_disabled_hint') : tax ? `${row.draft ? '' : t(`gst.category.${tax.category}`, tax.category) + ' · '}${tax.codeType.toUpperCase()} ${tax.code} · ${tax.rate}%` : label('gst.tax_history_invalid')}</p>
        {row.draft ? <p className="shop-hint">{label('gst.product_confirmation_requires_authorization')}</p> : null}
        <p className="shop-hint">{label('gst.tax_history_recorded', {date: date(row.recordedAt)})}</p>
        {row.effectiveAt && Date.parse(row.effectiveAt) !== Date.parse(row.recordedAt) ? <p className="shop-hint">{label('gst.tax_history_effective', {date: date(row.effectiveAt)})}</p> : null}
        {row.confirmation ? <p className="shop-hint">{label('gst.tax_confirmation_evidence', {
          actor: row.confirmation.actorName?.trim() || label('gst.confirmation_name_unavailable'),
          owner: row.confirmation.ownerName?.trim() || label('gst.confirmation_name_unavailable'),
          grant: row.confirmation.grantId ? label('gst.confirmation_authorized_manager') : t('role.owner', 'Owner'),
        })}</p> : null}
        {row.scheduleReview ? <><p className="shop-hint">{text('Source reference')}: {row.scheduleReview.sourceReference}</p><p className="shop-hint">{text('Reason')}: {row.scheduleReview.reason}</p></> : null}
        {row.cancellationReview ? <p className="shop-hint">{label('gst.schedule_cancel_reason')}: {row.cancellationReview.reason}</p> : null}
        {action?.(row)}
      </Card>;
    })}
  </>;
}

export function ProductTaxHistory({ productId }: { productId: string }) {
  const { perms, t } = useShop();
  const query = useProductTaxHistory(productId, perms.canSeeReports);
  if (!perms.canSeeReports) return null;
  const rows = query.data?.pages.flatMap(page => page.items) ?? [];
  return <section className="grid gap-4" aria-labelledby="product-tax-history-title">
    <div><h2 id="product-tax-history-title" className="shop-section-title">{t('gst.tax_history', EN_FALLBACK['gst.tax_history'])}</h2><p className="shop-section-sub">{t('gst.tax_history_hint', EN_FALLBACK['gst.tax_history_hint'])}</p></div>
    <TaxHistoryRefresh query={query} />
    <ReadState query={query}>
      {rows.length ? <TaxHistoryRows rows={rows} capture={query.capture} /> : <Card>{t('gst.tax_history_empty', EN_FALLBACK['gst.tax_history_empty'])}</Card>}
    </ReadState>
    <More query={query} />
    <Button href={`/shop/products/${productId}/gst`} tone="ghost">{t('gst.tax_history', EN_FALLBACK['gst.tax_history'])} ›</Button>
  </section>;
}
