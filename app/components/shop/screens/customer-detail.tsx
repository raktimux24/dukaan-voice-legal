'use client';

import { useGstText as useUiText } from "../gst-ui";

import { GstCollectionReview } from '../gst-collection-review';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatINR } from '../../../lib/shop/money';
import { useShopDates } from '../use-shop-dates';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import { EN_FALLBACK } from '../../../lib/shop/en-fallback';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass, isDenied } from '../ui';

export function CustomerDetailScreen({ customerId }: { customerId: string }) {
  const uiText = useUiText();
  const { formatWhen } = useShopDates();
  const { api, shop, perms, premium, t } = useShop();
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
  if (!perms.canManageCustomers) return <NoAccess what={uiText("Customers are for the owner and managers.")} />;
  if (!premium) return <PremiumLock shopId={shop.id} feature="udhaar" />;
  if (detail.isLoading) return <Spinner label={uiText("Loading customer")} />;
  if (isDenied(detail.error)) return <NoAccess what={uiText("You cannot open this customer.")} />;
  if (detail.error) return <Notice error={detail.error} />;
  const customer = detail.data?.customer;
  if (!customer) return <Card><p>{uiText("That customer was not found.")}</p></Card>;
  const shownName = ready ? name : customer.name;
  const shownPhone = ready ? phone : (customer.phone ?? '');

  return (
    <div className="shop-page">
      <PageHeader
        kicker={t('checkout.customer_title', 'Customer')}
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
                {t('customers.remind', 'Text reminder')}
              </Button>
            ) : null}
            <Button href="/shop/customers" tone="quiet" size="sm">{t('customers.title', 'All customers')}</Button>
          </>
        }
      />
      <div className="dash-stats">
        <div className={`shop-stat ${customer.balance > 0 ? 'shop-stat--warn' : 'shop-stat--ok'}`}>
          <span className="shop-stat-n num">{formatINR(customer.balance)}</span>
          <span className="shop-stat-l">{t('customers.outstanding', 'Udhaar outstanding')}</span>
        </div>
      </div>
      <Notice error={error} />
      <Card className="grid gap-3">
        <h2 className="font-semibold">{t('customers.record_payment', 'Record payment')}</h2>
        <Field label={t('bill.amount', 'Amount')}><input className={inputClass} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
        <Field label={t('checkout.payment_method', 'Method')}>
          <select className={inputClass} value={method} onChange={(event) => setMethod(event.target.value as 'cash' | 'upi')}>
            <option value="cash">{t('pos.method.cash', 'Cash')}</option>
            <option value="upi">{t('pos.method.upi', 'UPI')}</option>
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
        > {uiText("Save payment")} </Button>
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
          <Field label={t('customers.name', 'Name')}><input className={inputClass} value={shownName} onChange={(event) => { setReady(true); setName(event.target.value); }} /></Field>
          <Field label={t('pos_settings.shop_phone', 'Phone')}><input className={inputClass} value={shownPhone} onChange={(event) => { setReady(true); setPhone(event.target.value); }} /></Field>
          <Button type="submit">{uiText("Save customer")}</Button>
        </form>
      </Card>
      <GstCollectionReview customerId={customerId}/>
      <Card>
        <h2 className="font-semibold">{t('customers.ledger', 'Ledger')}</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {(detail.data?.ledger ?? []).map((entry) => (
            <div key={entry.id} className="flex justify-between gap-3 border-t border-line pt-2">
              <span>{t(`customers.ledger_type.${entry.type}`, EN_FALLBACK[`customers.ledger_type.${entry.type}`] ?? EN_FALLBACK['customers.ledger_type.adjustment'])}{entry.saleNumber ? ` #${entry.saleNumber}` : ''} · {formatWhen(entry.createdAt)}</span>
              <span>{formatINR(entry.amount)} → {formatINR(entry.balanceAfter)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
