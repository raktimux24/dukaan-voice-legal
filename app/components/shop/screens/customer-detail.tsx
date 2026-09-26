'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass, isDenied } from '../ui';

export function CustomerDetailScreen({ customerId }: { customerId: string }) {
  const { api, shop, perms, premium } = useShop();
  const queryClient = useQueryClient();
  const enabled = !!shop && perms.canManageCustomers && premium;
  const detail = useQuery({
    queryKey: ['customer', shop?.id, customerId],
    enabled,
    queryFn: () => api.getCustomer(shop!.id, customerId),
  });
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'upi'>('cash');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (!shop) return <Spinner />;
  if (!perms.canManageCustomers) return <NoAccess what="Customers are for the owner and managers." />;
  if (!premium) return <PremiumLock shopId={shop.id} feature="udhaar" />;
  if (detail.isLoading) return <Spinner label="Loading customer" />;
  if (isDenied(detail.error)) return <NoAccess what="You cannot open this customer." />;
  if (detail.error) return <Notice error={detail.error} />;
  const customer = detail.data?.customer;
  if (!customer) return <Card><p>That customer was not found.</p></Card>;
  const shownName = ready ? name : customer.name;
  const shownPhone = ready ? phone : (customer.phone ?? '');

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Customer"
        title={customer.name}
        description={customer.phone ?? undefined}
        actions={
          <>
            {customer.phone && customer.balance > 0 ? (
              <Button
                tone="ghost"
                onClick={() => {
                  const message = `Namaste ${customer.name}, your balance at ${shop.name} is ${formatINR(customer.balance)}.`;
                  window.location.href = `sms:${customer.phone}?body=${encodeURIComponent(message)}`;
                }}
              >
                Text reminder
              </Button>
            ) : null}
            <Button href="/shop/customers" tone="quiet" size="sm">All customers</Button>
          </>
        }
      />
      <div className="dash-stats">
        <div className={`shop-stat ${customer.balance > 0 ? 'shop-stat--warn' : 'shop-stat--ok'}`}>
          <span className="shop-stat-n num">{formatINR(customer.balance)}</span>
          <span className="shop-stat-l">Udhaar outstanding</span>
        </div>
      </div>
      <Notice error={error} />
      <Card className="grid gap-3">
        <h2 className="font-semibold">Record payment</h2>
        <Field label="Amount"><input className={inputClass} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
        <Field label="Method">
          <select className={inputClass} value={method} onChange={(event) => setMethod(event.target.value as 'cash' | 'upi')}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>
        </Field>
        <Button
          disabled={!(Number(amount) > 0)}
          onClick={() => {
            setError(null);
            void api.recordPayment(shop.id, customerId, { amount: Number(amount), method }).then(async () => {
              setAmount('');
              await queryClient.invalidateQueries({ queryKey: ['customer', shop.id, customerId] });
            }).catch(setError);
          }}
        >
          Save payment
        </Button>
      </Card>
      <Card>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const normalized = normalizeIndianMobile(shownPhone);
            if (normalized === 'invalid') {
              setError(new Error('Enter a valid Indian mobile number.'));
              return;
            }
            const body: Record<string, unknown> = {};
            if (shownName.trim() !== customer.name) body.name = shownName.trim();
            if ((normalized ?? null) !== customer.phone) body.phone = normalized;
            if (!Object.keys(body).length) return;
            setError(null);
            void api.updateCustomer(shop.id, customerId, body).then(() => queryClient.invalidateQueries({ queryKey: ['customer', shop.id, customerId] })).catch(setError);
          }}
        >
          <Field label="Name"><input className={inputClass} value={shownName} onChange={(event) => { setReady(true); setName(event.target.value); }} /></Field>
          <Field label="Phone"><input className={inputClass} value={shownPhone} onChange={(event) => { setReady(true); setPhone(event.target.value); }} /></Field>
          <Button type="submit">Save customer</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-semibold">Ledger</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {(detail.data?.ledger ?? []).map((entry) => (
            <div key={entry.id} className="flex justify-between gap-3 border-t border-line pt-2">
              <span>{entry.type}{entry.saleNumber ? ` #${entry.saleNumber}` : ''} · {formatWhen(entry.createdAt)}</span>
              <span>{formatINR(entry.amount)} → {formatINR(entry.balanceAfter)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
