'use client';

import Link from 'next/link';
import { GstCollectionReview } from '../gst-collection-review';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, ShopDialog, inputClass, isDenied } from '../ui';

export function CustomerDetailScreen({ customerId }: { customerId: string }) {
  const { api, shop, perms, premium, t } = useShop();
  const queryClient = useQueryClient();
  const enabled = !!shop && perms.canManageCustomers && premium;
  const detail = useQuery({
    queryKey: ['customer', shop?.id, customerId],
    enabled,
    queryFn: () => api.getCustomer(shop!.id, customerId),
  });
  const paymentRequest = useRef<Parameters<typeof api.gst.recordCustomerPayment>[2] | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
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
  const days = Math.max(0, Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / 86400000));
  const paymentMethods = customer.preferredPaymentMethods?.map(value => t('pos.method.' + value, value === 'credit' ? 'Udhaar' : value === 'upi' ? 'UPI' : value.charAt(0).toUpperCase() + value.slice(1))).join(' / ');
  const shownName = ready ? name : customer.name;
  const shownPhone = ready ? phone : (customer.phone ?? '');

  return (
    <div className="shop-page">
      <PageHeader
        back={{href: '/shop/customers', label: t('customers.back', 'Back to customers')}}
        kicker={t('checkout.customer_title', 'Customer')}
        title={customer.name}
        description={customer.phone ?? undefined}
        actions={
          <>
            <Button onClick={() => {setError(null); setPaymentOpen(true);}}>{t('customers.record_payment', 'Record payment')}</Button>
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

          </>
        }
      />
      <div className="dash-stats customer-stats">
        <div className={`shop-stat ${customer.balance > 0 ? 'shop-stat--warn' : 'shop-stat--ok'}`}>
          <span className="shop-stat-n num">{formatINR(customer.balance)}</span>
          <span className="shop-stat-l">{t('customers.outstanding', 'Udhaar outstanding')}</span>
        </div>
        <div className="shop-stat"><span className="shop-stat-n num">{customer.totalBusinessAmount == null ? '—' : formatINR(customer.totalBusinessAmount)}</span><span className="shop-stat-l">{t('customers.total_business', 'Total business amount')}</span><small>{t('customers.bill_value_hint', 'All completed bills, including GST')}</small></div>
        <div className="shop-stat"><span className="shop-stat-n">{days} <span className="customer-stat-unit">{t('customers.days', 'days')}</span></span><span className="shop-stat-l">{t('customers.tenure', 'Customer since')}</span><small>{formatWhen(customer.createdAt)}</small></div>
        <div className="shop-stat"><span className="shop-stat-n customer-payment-value">{paymentMethods || (customer.preferredPaymentMethods ? t('customers.no_bills', 'No bills yet') : '—')}</span><span className="shop-stat-l">{t('customers.preferred_payment', 'Most-used payment')}</span><small>{t('customers.payment_hint', 'By bill count; includes udhaar')}</small></div>
      </div>
      <Notice error={error} />
      {paymentOpen ? <ShopDialog title={t('customers.record_payment', 'Record payment')} onClose={() => setPaymentOpen(false)} busy={savingPayment}>
        <p className="shop-hint">{customer.name} · {t('customers.outstanding', 'Udhaar outstanding')}: {formatINR(customer.balance)}</p>
        <Notice error={error} />
        <form className="stack-form" onSubmit={event => {
          event.preventDefault();
          if (savingPayment || (!paymentRequest.current && (!/^\d+(\.\d{1,2})?$/.test(amount) || !(Number(amount) > 0)))) return;
          setError(null); setSavingPayment(true);
          const input = paymentRequest.current ?? {clientId: crypto.randomUUID(), amount: Number(amount), method};
          paymentRequest.current = input;
          void api.gst.recordCustomerPayment(shop.id, customerId, input).then(async () => {
            paymentRequest.current = null;
            setAmount(''); setPaymentOpen(false);
            await Promise.all(['customer', 'customers', 'customers-summary', 'gst'].map(key => queryClient.invalidateQueries({queryKey: [key]})));
          }).catch(setError).finally(() => setSavingPayment(false));
        }}>
        <fieldset disabled={savingPayment || !!paymentRequest.current} className="customer-payment-form">
        <Field label={t('bill.amount', 'Amount')}><input className={inputClass} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
        <Field label={t('checkout.payment_method', 'Method')}>
          <select className={inputClass} value={method} onChange={(event) => setMethod(event.target.value as 'cash' | 'upi')}>
            <option value="cash">{t('pos.method.cash', 'Cash')}</option>
            <option value="upi">{t('pos.method.upi', 'UPI')}</option>
          </select>
        </Field>
        </fieldset>
        <Button type="submit" disabled={savingPayment || (!paymentRequest.current && (!/^\d+(\.\d{1,2})?$/.test(amount) || !(Number(amount) > 0)))}>{savingPayment ? t('common.saving', 'Saving…') : paymentRequest.current ? t('web.gst.retry_saved_request', 'Retry saved request') : t('customers.save_payment', 'Save payment')}</Button>
        </form>
      </ShopDialog> : null}
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
          <Field label={t('customers.name', 'Name')}><input className={inputClass} value={shownName} onChange={(event) => { if (!ready) setPhone(customer.phone ?? ''); setReady(true); setName(event.target.value); }} /></Field>
          <Field label={t('pos_settings.shop_phone', 'Phone')}><input className={inputClass} value={shownPhone} onChange={(event) => { if (!ready) setName(customer.name); setReady(true); setPhone(event.target.value); }} /></Field>
          <Button type="submit">Save customer</Button>
        </form>
      </Card>
      <GstCollectionReview customerId={customerId}/>
      <Card>
        <h2 className="font-semibold">{t('customers.ledger', 'Ledger')}</h2>
        <div className="customer-ledger-wrap"><table className="gst-table customer-ledger">
          <thead><tr><th>{t('customers.activity', 'Activity')}</th><th>{t('customers.date', 'Date')}</th><th>{t('bill.amount', 'Amount')}</th><th>{t('customers.balance_after', 'Balance after')}</th></tr></thead>
          <tbody>{(detail.data?.ledger ?? []).map(entry => <tr key={entry.id}>
            <td><strong>{t('customers.ledger_type.' + entry.type, entry.type.replaceAll('_', ' '))}</strong>{entry.saleId && entry.saleNumber ? <Link className="shop-back" href={'/shop/sales/' + entry.saleId}>{t('bill.title', 'Bill')} #{entry.saleNumber}</Link> : null}{entry.method ? <small>{t('pos.method.' + entry.method, entry.method === 'upi' ? 'UPI' : entry.method)}</small> : null}</td>
            <td>{formatWhen(entry.createdAt)}</td><td className="num">{formatINR(entry.amount)}</td><td className="num">{formatINR(entry.balanceAfter)}</td>
          </tr>)}</tbody>
        </table></div>
        {!detail.data?.ledger.length ? <p className="shop-hint">{t('customers.no_ledger', 'No entries yet.')}</p> : null}
      </Card>
    </div>
  );
}
