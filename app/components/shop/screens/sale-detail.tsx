'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import type { PaymentMethod } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { shareBill, type ShareBillInput } from '../../../lib/shop/share-bill';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Spinner, inputClass, isDenied } from '../ui';

const METHOD: Record<string, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', credit: 'Udhaar' };

export function SaleDetailScreen({ saleId }: { saleId: string }) {
  const { api, shop, perms, hideCost, setNotice } = useShop();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const saleQuery = useQuery({
    queryKey: ['sale', shop?.id, saleId],
    enabled: !!shop?.id,
    queryFn: () => api.getSale(shop!.id, saleId),
  });
  const settings = useQuery({
    queryKey: ['pos', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const [voidReason, setVoidReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returns, setReturns] = useState<Record<string, string>>({});
  const [refund, setRefund] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const sale = saleQuery.data;

  if (!shop) return <Spinner />;
  if (saleQuery.isLoading) return <Spinner label="Loading bill" />;
  if (isDenied(saleQuery.error)) return <NoAccess what="You cannot open this bill." />;
  if (saleQuery.error) return <Notice error={saleQuery.error} />;
  if (!sale) return <Card><p>That bill was not found.</p></Card>;

  const shortfalls = sale.items.filter((item) => (item.shortfall ?? 0) > 0);
  const windowHours = settings.data?.voidWindowHours;
  const withinWindow = windowHours == null || Date.now() - new Date(sale.soldAt).getTime() <= windowHours * 60 * 60 * 1000;
  const returnable = sale.items.filter((item) => item.quantity - item.returnedQuantity > 0);
  const pos = settings.data;
  const showCost = !hideCost && sale.showCost !== false && sale.costTotal != null;
  const recorded = params.get('recorded');
  const methods = [...new Set(sale.payments.map((payment) => METHOD[payment.method] ?? payment.method))];

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sale', shop.id, saleId] });
    await queryClient.invalidateQueries({ queryKey: ['sales', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
  };

  const share = async () => {
    const payload: ShareBillInput = {
      shopName: pos?.shopName || shop.name,
      address: pos?.shopAddress,
      phone: pos?.shopPhone,
      saleNumber: sale.saleNumber,
      when: formatWhen(sale.soldAt),
      lines: sale.items.map((item) => ({
        name: item.name,
        detail: `${formatQty(item.quantity, item.unit)} × ${formatINR(item.unitPrice)}`,
        amount: formatINR(item.lineTotal),
      })),
      subtotal: formatINR(sale.subtotal),
      discount: sale.discountAmount > 0 ? `−${formatINR(sale.discountAmount)}` : null,
      total: formatINR(sale.total),
      payments: sale.payments.map((payment) => {
        const label = METHOD[payment.method] ?? payment.method;
        const extra = [
          payment.tendered != null ? `received ${formatINR(payment.tendered)}` : null,
          payment.changeGiven ? `change ${formatINR(payment.changeGiven)}` : null,
        ].filter(Boolean).join(' · ');
        return extra ? `${label} · ${extra} · ${formatINR(payment.amount)}` : `${label} · ${formatINR(payment.amount)}`;
      }),
      footer: pos?.billFooter,
    };
    setSharing(true);
    try {
      const result = await shareBill(payload);
      if (result === 'copied') setNotice('Bill copied. The image downloaded so you can send it on WhatsApp.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="shop-page">
      <div className="no-print">
        <PageHeader
          back={{ href: '/shop/sales', label: 'Sales' }}
          kicker={recorded === 'new' ? 'Sale recorded' : recorded === 'again' ? 'Already recorded' : 'Bill'}
          title={`Bill #${sale.saleNumber}`}
          description={`${formatWhen(sale.soldAt)}${sale.customer ? ` · ${sale.customer.name}` : ''}`}
        />
      </div>
      <Notice error={error} />
      <div className="sale-stage">
        <article className="receipt" aria-label={`Bill ${sale.saleNumber}`}>
          <header className="receipt-head">
            <p className="receipt-shop">{pos?.shopName || shop.name}</p>
            {pos?.shopAddress ? <p>{pos.shopAddress}</p> : null}
            {pos?.shopPhone ? <p>{pos.shopPhone}</p> : null}
            {pos?.billHeader ? <p>{pos.billHeader}</p> : null}
          </header>
          <div className="receipt-rule" />
          <div className="receipt-meta">
            <span>Bill #{sale.saleNumber}</span>
            <span>{formatWhen(sale.soldAt)}</span>
          </div>
          <p className={sale.status === 'voided' ? 'receipt-status is-voided' : 'receipt-status'}>
            {sale.status === 'voided' ? 'Void' : sale.paymentStatus}
          </p>
          {sale.customer ? <p className="receipt-customer">{sale.customer.name}{sale.customer.phone ? ` · ${sale.customer.phone}` : ''}</p> : null}
          <div className="receipt-rule" />
          <ul className="receipt-lines">
            {sale.items.map((item) => (
              <li key={item.id}>
                <div>
                  <p>{item.name}</p>
                  <p className="receipt-qty">
                    {formatQty(item.quantity, item.unit)} × {formatINR(item.unitPrice)}
                    {item.discountAmount > 0 ? ` · less ${formatINR(item.discountAmount)}` : ''}
                    {item.returnedQuantity > 0 ? ` · returned ${formatQty(item.returnedQuantity, item.unit)}` : ''}
                  </p>
                </div>
                <b>{formatINR(item.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <div className="receipt-rule" />
          <dl className="receipt-totals">
            <div><dt>Subtotal</dt><dd>{formatINR(sale.subtotal)}</dd></div>
            {sale.discountAmount > 0 ? <div><dt>Discount</dt><dd>−{formatINR(sale.discountAmount)}</dd></div> : null}
            <div className="is-total"><dt>Total</dt><dd>{formatINR(sale.total)}</dd></div>
          </dl>
          <ul className="receipt-pays">
            {sale.payments.map((payment) => (
              <li key={payment.id} className="receipt-pay">
                <span>
                  {METHOD[payment.method] ?? payment.method}
                  {payment.tendered != null || payment.changeGiven ? (
                    <span className="receipt-qty">
                      {payment.tendered != null ? `Received ${formatINR(payment.tendered)}` : ''}
                      {payment.changeGiven ? `${payment.tendered != null ? ' · ' : ''}change ${formatINR(payment.changeGiven)}` : ''}
                    </span>
                  ) : null}
                </span>
                <b>{formatINR(payment.amount)}</b>
              </li>
            ))}
          </ul>
          {sale.creditTotal > 0 ? <p className="receipt-pay"><span>On credit</span><span>{formatINR(sale.creditTotal)}</span></p> : null}
          {sale.returns.map((entry) => (
            <p key={entry.id} className="receipt-qty">
              Return {formatWhen(entry.createdAt)} · {formatINR(entry.refundAmount)}
              {entry.refundMethod ? ` by ${METHOD[entry.refundMethod] ?? entry.refundMethod}` : ''}
              {entry.reason ? ` · ${entry.reason}` : ''}
            </p>
          ))}
          {sale.note ? <p className="receipt-qty">{sale.note}</p> : null}
          {sale.voidReason ? <p className="receipt-qty">Voided: {sale.voidReason}</p> : null}
          {showCost ? <p className="receipt-cost">Cost {formatINR(sale.costTotal)}</p> : null}
          <p className="receipt-foot">{pos?.billFooter || 'Thank you'}</p>
        </article>
        <div className="sale-side no-print">
          <Card className="sale-summary">
            {recorded ? <p className="sale-complete-mark" aria-hidden="true">✓</p> : null}
            <p className="sale-complete-total">{formatINR(sale.total)}</p>
            <p className="party-meta">{methods.join(' + ') || sale.paymentStatus}{sale.customer ? ` · ${sale.customer.name}` : ''}</p>
            <div className="shop-actions">
              <Button onClick={() => void share()} disabled={sharing}>{sharing ? 'Sharing…' : 'Share bill'}</Button>
              <Button tone="ghost" onClick={() => window.print()}>Print</Button>
              {recorded ? <Button href="/shop/sell">New sale</Button> : null}
            </div>
          </Card>
          {shortfalls.length ? (
            <Card>
              <p className="font-semibold text-warn">Sold more than was on hand</p>
              {shortfalls.map((item) => <p key={item.id} className="party-meta">{item.name}: short by {formatQty(item.shortfall ?? 0, item.unit)}</p>)}
            </Card>
          ) : null}
        {perms.canVoidOrReturn && sale.status === 'completed' ? (
          <div className="stack-form">
            <Card className="stack-form">
              <h2 className="shop-section-title">Void</h2>
              <p className="shop-section-sub">
                {withinWindow
                  ? `Open for ${windowHours ?? 'the configured'} hours after the sale.`
                  : `The ${windowHours}-hour void window has closed.`}
              </p>
              <Field label="Reason">
                <input className={inputClass} value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder="Optional" />
              </Field>
              <Button
                tone="danger"
                disabled={pending || !withinWindow}
                onClick={() => {
                  setPending(true);
                  setError(null);
                  void api.voidSale(shop.id, sale.id, voidReason || undefined).then(refresh).catch((caught: unknown) => {
                    if (caught instanceof ApiError && caught.code === 'already_voided') void refresh();
                    setError(caught);
                  }).finally(() => setPending(false));
                }}
              >
                Void bill
              </Button>
            </Card>
            <Card className="stack-form">
              <h2 className="shop-section-title">Return</h2>
              <p className="shop-section-sub">Enter how much of each line comes back. Returned stock is put on the shelf again.</p>
              {returnable.length === 0 ? <p className="party-meta">Every line on this bill has already been returned.</p> : null}
              {returnable.map((item) => {
                const left = item.quantity - item.returnedQuantity;
                return (
                  <Field key={item.id} label={item.name} hint={`Up to ${formatQty(left, item.unit)}`}>
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={returns[item.id] ?? ''}
                      onChange={(event) => setReturns((current) => ({ ...current, [item.id]: event.target.value }))}
                    />
                  </Field>
                );
              })}
              <Field label="Refund">
                <select className={inputClass} value={refund} onChange={(event) => setRefund(event.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  {sale.customer ? <option value="credit">Credit</option> : null}
                </select>
              </Field>
              <Field label="Reason">
                <input className={inputClass} value={returnReason} onChange={(event) => setReturnReason(event.target.value)} placeholder="Optional" />
              </Field>
              <Button
                disabled={pending || returnable.length === 0}
                onClick={() => {
                  const items = sale.items
                    .map((item) => ({ saleItemId: item.id, quantity: Number(returns[item.id] || 0), restock: true }))
                    .filter((item) => item.quantity > 0);
                  if (!items.length) return;
                  setPending(true);
                  setError(null);
                  void api.returnSale(shop.id, sale.id, { items, refundMethod: refund, reason: returnReason || null }).then(async () => {
                    setReturns({});
                    setReturnReason('');
                    await refresh();
                  }).catch(setError).finally(() => setPending(false));
                }}
              >
                Return items
              </Button>
            </Card>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
