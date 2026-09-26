'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { formatINR, formatDay } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Card, NoAccess, Notice, Spinner, inputClass } from '../ui';

export function SuppliersScreen() {
  const { api, shop, perms } = useShop();
  const [q, setQ] = useState('');
  const enabled = !!shop && perms.canSeeCost;
  const list = useQuery({ queryKey: ['suppliers', shop?.id, q], enabled, queryFn: () => api.getSuppliers(shop!.id, q.trim() || undefined) });
  const compare = useQuery({ queryKey: ['supplier-compare', shop?.id], enabled, queryFn: () => api.compareSuppliers(shop!.id) });

  if (!shop) return <Spinner />;
  if (!perms.canSeeCost) return <NoAccess what="Suppliers show purchase prices, so helpers cannot open them." />;

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Suppliers</h1>
      <p className="text-muted">Suppliers come from batches you stock. There is no separate supplier form.</p>
      <input className={inputClass} placeholder="Search suppliers" value={q} onChange={(event) => setQ(event.target.value)} aria-label="Search suppliers" />
      <Notice error={list.error ?? compare.error} />
      {list.isLoading ? <Spinner label="Loading suppliers" /> : null}
      <div className="grid gap-2">
        {(list.data?.suppliers ?? []).map((supplier) => (
          <Link key={supplier.name} href={`/shop/suppliers/${encodeURIComponent(supplier.name)}`} className="shop-surface rounded-xl border border-line bg-card p-3">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{supplier.name}</p>
                <p className="text-sm text-muted">{supplier.products} products · last {formatDay(supplier.lastAt)}</p>
              </div>
              <p>{formatINR(supplier.spend)}</p>
            </div>
          </Link>
        ))}
      </div>
      {(compare.data?.products.length ?? 0) > 0 ? (
        <Card>
          <h2 className="font-semibold">Price compare</h2>
          <div className="mt-3 grid gap-3">
            {compare.data?.products.slice(0, 12).map((product) => (
              <div key={product.productId}>
                <p>{product.name} · cheapest {product.cheapest}</p>
                <p className="text-sm text-muted">{product.suppliers.map((row) => `${row.name} ${formatINR(row.price)}`).join(' · ')}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
