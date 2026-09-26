'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { labeledL1 } from '../../../lib/shop/catalog';
import { inventoryCsv, downloadText } from '../../../lib/shop/csv';
import { formatINR } from '../../../lib/shop/money';
import type { InventoryItem } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Chip, PageHeader, Pill, Spinner } from '../ui';

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
  const { api, shop, perms, hideCost, t } = useShop();
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
    <div className="shop-page">
      <PageHeader
        kicker="Stock"
        title={t('products.title', 'Products')}
        description={catalog.data ? `${rows.length} of ${catalog.data.filter((item) => item.product.isActive !== false).length} products` : undefined}
        actions={
          <>
            <Button tone="ghost" onClick={() => downloadText(`products-${shop.name}.csv`, inventoryCsv(catalog.data ?? [], hideCost))}>Export CSV</Button>
            {perms.canEditProducts ? <Button href="/shop/products/new">Add product</Button> : null}
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="pos-chips">
          {FILTERS.filter((item) => item.id !== 'unpriced' || perms.canEditProducts).map((item) => (
            <Chip key={item.id} active={filter === item.id} href={item.id === 'all' ? '/shop/products' : `/shop/products?filter=${item.id}`}>{item.label}</Chip>
          ))}
        </div>
        <input className="shop-field sm:ml-auto sm:max-w-xs" placeholder="Filter by name or barcode" value={q} onChange={(event) => setQ(event.target.value)} aria-label="Filter products" />
      </div>
      {catalog.isLoading ? <Spinner label="Loading products" /> : null}
      <Card flush>
        <div className="shop-list">
          {rows.map((item) => (
            <Link key={item.id} href={`/shop/products/${item.productId}`} className="shop-list-row">
              <div className="shop-list-main">
                <p className="shop-list-title">{item.product.name}</p>
                <p className="shop-list-meta">{labeledL1(item.product.category, (key) => t(key, key))} · {formatQty(item.quantity, item.unit)} on hand</p>
              </div>
              <div className="shop-list-right flex items-center gap-4">
                <p className="num">{item.product.sellingPrice == null ? <span className="text-muted">Unpriced</span> : formatINR(item.product.sellingPrice)}</p>
                <Pill tone={item.stockStatus === 'OUT' ? 'danger' : item.stockStatus === 'LOW' ? 'warn' : 'ok'}>
                  {item.stockStatus === 'OUT' ? 'Out' : item.stockStatus === 'LOW' ? 'Low' : 'In stock'}
                </Pill>
              </div>
            </Link>
          ))}
          {!catalog.isLoading && rows.length === 0 ? <p className="shop-list-empty">No products in this view.</p> : null}
        </div>
      </Card>
    </div>
  );
}
