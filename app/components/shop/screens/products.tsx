'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { catalogL1Label } from '../../../lib/shop/catalog';
import { inventoryCsv, downloadText } from '../../../lib/shop/csv';
import { formatINR } from '../../../lib/shop/money';
import type { InventoryItem } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Spinner } from '../ui';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low_stock', label: 'Low stock' },
  { id: 'out_of_stock', label: 'Out of stock' },
  { id: 'near_expiry', label: 'Near expiry' },
  { id: 'unpriced', label: 'Unpriced' },
] as const;

function nearExpiry(item: InventoryItem) {
  if (!item.nearestExpiryDate) return false;
  return new Date(item.nearestExpiryDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000;
}

function matches(item: InventoryItem, filter: string) {
  if (item.product.isActive === false) return false;
  if (filter === 'low_stock') return item.stockStatus === 'LOW';
  if (filter === 'out_of_stock') return item.stockStatus === 'OUT';
  if (filter === 'near_expiry') return nearExpiry(item);
  if (filter === 'unpriced') return item.product.sellingPrice == null;
  return true;
}

export function ProductsScreen() {
  const { api, shop, perms, hideCost } = useShop();
  const params = useSearchParams();
  const filter = params.get('filter') ?? 'all';
  const [q, setQ] = useState('');
  const catalog = useQuery({
    queryKey: ['catalog', shop?.id, hideCost],
    enabled: !!shop?.id,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const rows = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (catalog.data ?? []).filter((item) => matches(item, filter) && (!text || item.product.name.toLowerCase().includes(text) || item.product.barcode?.includes(text)));
  }, [catalog.data, filter, q]);

  if (!shop) return <Spinner label="Loading products" />;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Products</h1>
        <div className="flex gap-2">
          <Button
            tone="ghost"
            onClick={() => downloadText(`products-${shop.name}.csv`, inventoryCsv(catalog.data ?? [], hideCost))}
          >
            Export
          </Button>
          {perms.canEditProducts ? <Button href="/shop/products/new">Add product</Button> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.filter((item) => item.id !== 'unpriced' || perms.canEditProducts).map((item) => (
          <Link key={item.id} href={item.id === 'all' ? '/shop/products' : `/shop/products?filter=${item.id}`} className={`rounded-full px-3 py-1 text-sm ${filter === item.id ? 'bg-saffron text-white' : 'border border-line text-muted'}`}>
            {item.label}
          </Link>
        ))}
      </div>
      <input className="rounded-xl border border-line bg-card px-4 py-3" placeholder="Filter products" value={q} onChange={(event) => setQ(event.target.value)} aria-label="Filter products" />
      {catalog.isLoading ? <Spinner label="Loading products" /> : null}
      <div className="grid gap-2">
        {rows.map((item) => (
          <Link key={item.id} href={`/shop/products/${item.productId}`} className="shop-surface rounded-xl border border-line bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-muted">{catalogL1Label(item.product.category)} · {formatQty(item.quantity, item.unit)}</p>
              </div>
              <div className="text-right">
                <p>{item.product.sellingPrice == null ? 'Unpriced' : formatINR(item.product.sellingPrice)}</p>
                <p className={`text-xs ${item.stockStatus === 'OUT' || item.stockStatus === 'LOW' ? 'text-danger' : 'text-muted'}`}>{item.stockStatus}</p>
              </div>
            </div>
          </Link>
        ))}
        {!catalog.isLoading && rows.length === 0 ? <Card><p>No products in this view.</p></Card> : null}
      </div>
    </div>
  );
}
