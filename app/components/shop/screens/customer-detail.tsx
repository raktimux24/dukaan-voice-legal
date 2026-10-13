'use client';
import Link from 'next/link';
import {GstCustomerPayment} from '../gst-customer-payment';

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
  const days = Math.max(0, Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / 86400000));
  const paymentMethods = customer.preferredPaymentMethods?.map(value => t('pos.method.' + value, value === 'credit' ? 'Udhaar' : value === 'upi' ? 'UPI' : value.charAt(0).toUpperCase() + value.slice(1))).join(' / ');
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
      <GstCustomerPayment customerId={customerId}/>
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
          <Button type="submit">{uiText("Save customer")}</Button>
        </form>
      </Card>
      <GstCollectionReview customerId={customerId}/>
      <Card>
        <h2 className="font-semibold">{t('customers.ledger', 'Ledger')}</h2>
        <div className="customer-ledger-wrap"><table className="gst-table customer-ledger">
          <thead><tr><th>{t('customers.activity', 'Activity')}</th><th>{t('customers.date', 'Date')}</th><th>{t('bill.amount', 'Amount')}</th><th>{t('customers.balance_after', 'Balance after')}</th></tr></thead>
          <tbody>{(detail.data?.ledger ?? []).map(entry => <tr key={entry.id}>
            <td><strong>{t(`customers.ledger_type.${entry.type}`, EN_FALLBACK[`customers.ledger_type.${entry.type}`] ?? EN_FALLBACK['customers.ledger_type.adjustment'])}</strong>{entry.saleId && entry.saleNumber ? <Link className="shop-back" href={'/shop/sales/' + entry.saleId}>{t('bill.title', 'Bill')} #{entry.saleNumber}</Link> : null}{entry.method ? <small>{t('pos.method.' + entry.method, entry.method === 'upi' ? 'UPI' : entry.method)}</small> : null}</td>
            <td>{formatWhen(entry.createdAt)}</td><td className="num">{formatINR(entry.amount)}</td><td className="num">{formatINR(entry.balanceAfter)}</td>
          </tr>)}</tbody>
        </table></div>
        {!detail.data?.ledger.length ? <p className="shop-hint">{t('customers.no_ledger', 'No entries yet.')}</p> : null}
      </Card>
    </div>
  );
}
