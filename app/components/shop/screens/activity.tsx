'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auditCsv, downloadText } from '../../../lib/shop/csv';
import { formatTime } from '../../../lib/shop/money';
import type { AuditLogEntry } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Chip, Notice, PageHeader, Spinner } from '../ui';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sales', label: 'Sales' },
  { id: 'stock', label: 'Stock' },
  { id: 'today', label: 'Today' },
] as const;

const LABELS: Record<string, string> = {
  product_added: 'Product added',
  product_updated: 'Product updated',
  product_deleted: 'Product deleted',
  batch_added: 'Batch added',
  batch_updated: 'Batch updated',
  stock_removed: 'Stock removed',
  stock_adjusted: 'Stock adjusted',
  sale_created: 'Sale',
  sale_voided: 'Sale voided',
  sale_returned: 'Sale returned',
  member_role_changed: 'Member role changed',
  member_removed: 'Member removed',
};

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Earlier';
  const today = new Date();
  const same = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
  if (same(date, today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (same(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function tone(action: string) {
  if (action.includes('void') || action.includes('return') || action.includes('deleted') || action.includes('removed')) return 'is-danger';
  if (action.startsWith('sale')) return 'is-sale';
  if (action.startsWith('stock') || action.startsWith('batch') || action.startsWith('product')) return 'is-stock';
  return '';
}

function groups(logs: AuditLogEntry[]) {
  const days: { label: string; logs: AuditLogEntry[] }[] = [];
  for (const log of logs) {
    const label = dayLabel(log.createdAt);
    const last = days[days.length - 1];
    if (last?.label === label) last.logs.push(log);
    else days.push({ label, logs: [log] });
  }
  return days;
}

export function ActivityScreen() {
  const { api, shop, t } = useShop();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [error, setError] = useState<unknown>(null);
  const logs = useQuery({
    queryKey: ['audit', shop?.id, filter],
    enabled: !!shop,
    queryFn: () => api.getAudit(shop!.id, filter),
  });

  if (!shop) return <Spinner />;
  const days = groups(logs.data?.logs ?? []);

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Insights"
        title={t('activity.title', 'Activity')}
        description="Every stock change, sale, void, and staff change in this shop."
        actions={
          <Button
            tone="ghost"
            onClick={() => {
              setError(null);
              void api.getAllAudit(shop.id).then((rows) => downloadText(`activity-${shop.name}.csv`, auditCsv(rows))).catch(setError);
            }}
          >
            Export CSV
          </Button>
        }
      />
      <div className="pos-chips">
        {FILTERS.map((item) => <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</Chip>)}
      </div>
      <Notice error={error ?? logs.error} />
      {logs.data?.limitedToDays ? <p className="party-meta">Showing the last {logs.data.limitedToDays} days.</p> : null}
      {logs.isLoading ? <Spinner label="Loading activity" /> : null}
      {!logs.isLoading && days.length === 0 ? <p className="shop-list-empty">Nothing recorded for this filter.</p> : null}
      {days.map((day) => (
        <section key={day.label}>
          <h2 className="timeline-day">{day.label}</h2>
          <ol className="timeline">
            {day.logs.map((log) => (
              <li key={log.id} className={`timeline-item ${tone(log.actionType)}`}>
                <div>
                  <p className="timeline-title">{LABELS[log.actionType] ?? log.actionType.replaceAll('_', ' ')}</p>
                  <p className="timeline-meta">{log.description}</p>
                  <p className="timeline-meta">{log.userName} · {log.inputMethod}</p>
                </div>
                <time className="timeline-when" dateTime={log.createdAt}>{formatTime(log.createdAt)}</time>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
