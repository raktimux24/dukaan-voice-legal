'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { formatINR, formatWhen } from '../../../lib/shop/money';
import type { PaymentMethod } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, Spinner, isDenied } from '../ui';

export function SaleDetailScreen({ saleId }: { saleId: string }) {
  const { api, shop, perms, hideCost } = useShop();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const saleQuery = useQuery({
    queryKey: ['sale', shop?.id, saleId],
    enabled: !!shop?.id,
    queryFn: () => api.getSale(shop!.id, saleId),
  });
  const settings = useQuery({
    queryKey: ['pos', shop?.id],
    enabled: !!shop?.id && perms.canVoidOrReturn,
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const [reason, setReason] = useState('');
  const [returns, setReturns] = useState<Record<string, string>>({});
  const [refund, setRefund] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const sale = saleQuery.data;

  if (!shop) return <Spinner />;
  if (saleQuery.isLoading) return <Spinner label="Loading bill" />;
  if (isDenied(saleQuery.error)) return <NoAccess what="You cannot open this bill." />;
  if (saleQuery.error) return <Notice error={saleQuery.error} />;
  if (!sale) return <Card><p>That bill was not found.</p></Card>;

  const shortfalls = sale.items.filter((item) => (item.shortfall ?? 0) > 0);
  const windowHours = settings.data?.voidWindowHours;
  const withinWindow = windowHours == null || Date.now() - new Date(sale.soldAt).getTime() <= windowHours * 60 * 60 * 1000;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sale', shop.id, saleId] });
    await queryClient.invalidateQueries({ queryKey: ['sales', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
  };

  return (
    <div className="grid gap-4">
      <div className="no-print flex items-center justify-between">
        <h1 className="font-display text-3xl">Bill #{sale.saleNumber}</h1>
        <Button tone="ghost" onClick={() => window.print()}>Print</Button>
      </div>
      {params.get('recorded') === 'again' ? <p className="text-sm text-muted">This bill was already recorded.</p> : null}
      {shortfalls.length ? (
        <Card>
          <p className="font-semibold text-warn">Sold more than was on hand</p>
          {shortfalls.map((item) => <p key={item.id} className="text-sm">{item.name}: short by {item.shortfall}</p>)}
        </Card>
      ) : null}
      <Notice error={error} />
      <article className="shop-surface rounded-xl border border-line bg-card p-4">
        <p>{shop.name}</p>
        <p className="text-sm text-muted">{formatWhen(sale.soldAt)} · {sale.status}</p>
        {sale.customer ? <p className="mt-2">{sale.customer.name}</p> : null}
        <table className="mt-4 w-full text-sm">
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="py-2">{item.name}<div className="text-muted">{item.quantity} {item.unit}</div></td>
                <td className="py-2 text-right">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-right text-xl font-semibold">{formatINR(sale.total)}</p>
        {!hideCost && sale.showCost !== false && sale.costTotal != null ? <p className="text-right text-sm text-muted">Cost {formatINR(sale.costTotal)}</p> : null}
        <div className="mt-3 text-sm text-muted">
          {sale.payments.map((payment) => (
            <p key={payment.id}>{payment.method} {formatINR(payment.amount)}{payment.tendered != null ? ` received ${formatINR(payment.tendered)}` : ''}{payment.changeGiven ? ` change ${formatINR(payment.changeGiven)}` : ''}</p>
          ))}
        </div>
        {sale.note ? <p className="mt-2 text-sm">{sale.note}</p> : null}
      </article>
      {perms.canVoidOrReturn && sale.status === 'completed' ? (
        <div className="no-print grid gap-4">
          <Card className="grid gap-3">
            <h2 className="font-semibold">Void</h2>
            {withinWindow ? <p className="text-sm text-muted">Allowed for {windowHours ?? 'the configured'} hours after the sale.</p> : <p className="text-sm text-danger">The void window has closed.</p>}
            <input className="rounded-lg border border-line bg-elevated px-3 py-2" placeholder="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <Button
              tone="danger"
              disabled={pending}
              onClick={() => {
                setPending(true);
                setError(null);
                void api.voidSale(shop.id, sale.id, reason || undefined).then(refresh).catch((caught: unknown) => {
                  if (caught instanceof ApiError && caught.code === 'already_voided') void refresh();
                  setError(caught);
                }).finally(() => setPending(false));
              }}
            >
              Void bill
            </Button>
          </Card>
          <Card className="grid gap-3">
            <h2 className="font-semibold">Return</h2>
            {sale.items.map((item) => {
              const left = item.quantity - item.returnedQuantity;
              if (left <= 0) return null;
              return (
                <label key={item.id} className="text-sm">
                  {item.name} (up to {left})
                  <input className="mt-1 w-full rounded-lg border border-line bg-elevated px-3 py-2" inputMode="decimal" value={returns[item.id] ?? ''} onChange={(event) => setReturns((current) => ({ ...current, [item.id]: event.target.value }))} />
                </label>
              );
            })}
            <label className="text-sm">Refund
              <select className="mt-1 w-full rounded-lg border border-line bg-elevated px-3 py-2" value={refund} onChange={(event) => setRefund(event.target.value as PaymentMethod)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                {sale.customer ? <option value="credit">Credit</option> : null}
              </select>
            </label>
            <Button
              disabled={pending}
              onClick={() => {
                const items = sale.items
                  .map((item) => ({ saleItemId: item.id, quantity: Number(returns[item.id] || 0), restock: true }))
                  .filter((item) => item.quantity > 0);
                if (!items.length) return;
                setPending(true);
                setError(null);
                void api.returnSale(shop.id, sale.id, { items, refundMethod: refund, reason: reason || null }).then(async () => {
                  setReturns({});
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
  );
}
