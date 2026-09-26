'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { formatINR } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass } from '../ui';

export function CustomersScreen() {
  const { api, shop, perms, premium } = useShop();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<unknown>(null);
  const enabled = !!shop && perms.canManageCustomers && premium;
  const summary = useQuery({ queryKey: ['customers-summary', shop?.id], enabled, queryFn: () => api.getCustomerSummary(shop!.id) });
  const list = useQuery({ queryKey: ['customers', shop?.id], enabled, queryFn: () => api.getCustomers(shop!.id, { limit: 100 }) });

  if (!shop) return <Spinner />;
  if (!perms.canManageCustomers) return <NoAccess what="Customers are for the owner and managers." />;
  if (!premium) return <PremiumLock shopId={shop.id} feature="udhaar" />;

  return (
    <div className="shop-page">
      <PageHeader kicker="People" title="Customers" description="Profiles and the udhaar ledger. Credit sales at checkout land here." />
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="shop-stat shop-stat--warn"><span className="shop-stat-n num">{summary.isLoading ? '…' : formatINR(summary.data?.outstandingTotal)}</span><span className="shop-stat-l">Outstanding udhaar</span></div>
        <div className="shop-stat"><span className="shop-stat-n num">{summary.data?.debtorCount ?? '…'}</span><span className="shop-stat-l">People with udhaar</span></div>
        <div className="shop-stat shop-stat--ok"><span className="shop-stat-n num">{summary.data?.customerCount ?? '…'}</span><span className="shop-stat-l">Customers</span></div>
      </div>
      <Notice error={error ?? summary.error ?? list.error} />
      <Card>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const normalized = normalizeIndianMobile(phone);
            if (normalized === 'invalid') {
              setError(new Error('Enter a valid Indian mobile number.'));
              return;
            }
            setError(null);
            void api.createCustomer(shop.id, { name: name.trim(), phone: normalized, clientId: crypto.randomUUID() }).then(() => {
              setName('');
              setPhone('');
              return list.refetch();
            }).catch(setError);
          }}
        >
          <Field label="Name"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
          <Field label="Phone"><input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" /></Field>
          <Button type="submit" disabled={!name.trim()}>Add customer</Button>
        </form>
      </Card>
      <div className="grid gap-2">
        {(list.data?.customers ?? []).map((customer) => (
          <Link key={customer.id} href={`/shop/customers/${customer.id}`} className="shop-surface flex justify-between rounded-xl border border-line bg-card p-3">
            <span>{customer.name}<span className="block text-sm text-muted">{customer.phone}</span></span>
            <span>{formatINR(customer.balance)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
