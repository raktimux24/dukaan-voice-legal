'use client';

import { useQuery } from '@tanstack/react-query';
import { formatINR } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Card, NoAccess, Notice, Spinner } from '../ui';

function rows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
}

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

  const data = detail.data ?? {};
  const products = rows(data.products ?? data.batches ?? data.items);

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">{decoded}</h1>
      <Card>
        {products.length === 0 ? <p className="text-muted">No purchase rows yet.</p> : null}
        <div className="grid gap-2">
          {products.map((row, index) => (
            <div key={String(row.id ?? index)} className="flex justify-between gap-3 border-t border-line py-2">
              <span>{String(row.name ?? row.productName ?? 'Item')}</span>
              <span>{typeof row.price === 'number' || typeof row.purchasePrice === 'number' ? formatINR(Number(row.price ?? row.purchasePrice)) : String(row.quantity ?? '')}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
