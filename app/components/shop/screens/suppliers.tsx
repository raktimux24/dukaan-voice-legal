'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { formatDay, formatINR } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Card, NoAccess, Notice, PageHeader, Spinner, inputClass } from '../ui';

export function SuppliersScreen() {
  const { api, shop, perms, t } = useShop();
  const [q, setQ] = useState('');
  const enabled = !!shop && perms.canSeeCost;
  const list = useQuery({ queryKey: ['suppliers', shop?.id, q], enabled, queryFn: () => api.getSuppliers(shop!.id, q.trim() || undefined) });
  const compare = useQuery({ queryKey: ['supplier-compare', shop?.id], enabled, queryFn: () => api.compareSuppliers(shop!.id) });

  if (!shop) return <Spinner />;
  if (!perms.canSeeCost) return <NoAccess what="Suppliers show purchase prices, so helpers cannot open them." />;

  const suppliers = list.data?.suppliers ?? [];
  const compared = compare.data?.products ?? [];

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Stock"
        title={t('suppliers.title', 'Suppliers')}
        description="Built from the supplier named on each batch. Spend is what this shop has paid them."
      />
      <input
        className={`${inputClass} shop-search`}
        placeholder="Search suppliers"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Search suppliers"
      />
      <Notice error={list.error ?? compare.error} />
      {list.isLoading ? <Spinner label="Loading suppliers" /> : null}
      {!list.isLoading && suppliers.length === 0 ? (
        <Card>
          <p>No suppliers yet. Name a supplier when you add a batch and they show up here.</p>
        </Card>
      ) : null}
      <div className="party-grid">
        {suppliers.map((supplier) => (
          <Link key={supplier.name} href={`/shop/suppliers/${encodeURIComponent(supplier.name)}`} className="party-card">
            <div className="party-card-top">
              <div>
                <p className="party-name">{supplier.name}</p>
                <p className="party-meta">Last purchase {formatDay(supplier.lastAt)}</p>
              </div>
              <p className="party-spend">{formatINR(supplier.spend)}</p>
            </div>
            <div className="party-stats">
              <div className="party-stat"><span>Products</span><b>{supplier.products}</b></div>
              <div className="party-stat"><span>Batches</span><b>{supplier.batches}</b></div>
              <div className="party-stat"><span>30 days</span><b>{formatINR(supplier.spend30d)}</b></div>
            </div>
          </Link>
        ))}
      </div>
      {compared.length > 0 ? (
        <Card>
          <h2 className="shop-section-title">Price compare</h2>
          <p className="shop-section-sub">Same product, more than one supplier. The name on the right is the cheaper last price.</p>
          <div className="chart-rows">
            {compared.map((product) => (
              <div key={product.productId} className="chart-row is-compare">
                <span>{product.name}</span>
                <span className="party-meta">
                  {product.suppliers.map((row) => `${row.name} ${formatINR(row.price)}`).join(' · ')}
                </span>
                <b>{product.savingPct > 0 ? `${Math.round(product.savingPct)}% less at ${product.cheapest}` : product.cheapest}</b>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
