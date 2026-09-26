'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auditCsv, downloadText } from '../../../lib/shop/csv';
import { formatWhen } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Button, Card, Notice, Spinner } from '../ui';

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

export function ActivityScreen() {
  const { api, shop } = useShop();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [error, setError] = useState<unknown>(null);
  const logs = useQuery({
    queryKey: ['audit', shop?.id, filter],
    enabled: !!shop,
    queryFn: () => api.getAudit(shop!.id, filter),
  });

  if (!shop) return <Spinner />;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Activity</h1>
        <Button
          tone="ghost"
          onClick={() => {
            setError(null);
            void api.getAllAudit(shop.id).then((rows) => downloadText(`activity-${shop.name}.csv`, auditCsv(rows))).catch(setError);
          }}
        >
          Export
        </Button>
      </div>
      <div className="flex gap-2">
        {FILTERS.map((item) => <Button key={item.id} tone={filter === item.id ? 'primary' : 'ghost'} onClick={() => setFilter(item.id)}>{item.label}</Button>)}
      </div>
      <Notice error={error ?? logs.error} />
      {logs.data?.limitedToDays ? <p className="text-sm text-muted">Showing the last {logs.data.limitedToDays} days.</p> : null}
      {logs.isLoading ? <Spinner label="Loading activity" /> : null}
      <div className="grid gap-2">
        {(logs.data?.logs ?? []).map((log) => (
          <Card key={log.id}>
            <p className="font-medium">{LABELS[log.actionType] ?? log.actionType.replaceAll('_', ' ')}</p>
            <p className="text-sm text-muted">{log.description}</p>
            <p className="text-xs text-faint">{formatWhen(log.createdAt)} · {log.userName} · {log.inputMethod}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
