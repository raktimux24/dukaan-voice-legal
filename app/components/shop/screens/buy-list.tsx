'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UNITS } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass, isPremiumError } from '../ui';

export function BuyListScreen() {
  const { api, shop, perms, premium } = useShop();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enabled = !!shop && perms.canEditProducts;
  const list = useQuery({ queryKey: ['buy-list', shop?.id], enabled, queryFn: () => api.getBuyList(shop!.id) });
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<string>(UNITS[4]);
  const [error, setError] = useState<unknown>(null);

  if (!shop) return <Spinner />;
  if (!perms.canEditProducts) return <NoAccess what="The buy list is for the owner and managers." />;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['buy-list', shop.id] });
  const aiLocked = (list.data ?? []).some((item) => item.isAiSuggested && !premium);

  return (
    <div className="shop-page">
      <PageHeader kicker="Stock" title="Buy list" description="What to buy next. Stocking a row adds a batch to the product." />
      <Notice error={error ?? list.error} />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-[1fr_120px_140px_auto] md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            void api.addBuyListItem(shop.id, { itemName: name.trim(), quantity: Number(qty), unit }).then(() => {
              setName('');
              return refresh();
            }).catch(setError);
          }}
        >
          <Field label="Item"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
          <Field label="Qty"><input className={inputClass} inputMode="decimal" value={qty} onChange={(event) => setQty(event.target.value)} /></Field>
          <Field label="Unit">
            <select className={inputClass} value={unit} onChange={(event) => setUnit(event.target.value)}>
              {UNITS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Button type="submit" disabled={!name.trim()}>Add</Button>
        </form>
      </Card>
      {aiLocked || isPremiumError(list.error) ? <PremiumLock shopId={shop.id} feature="buy_list_ai" /> : null}
      <div className="grid gap-2">
        {(list.data ?? []).map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{item.itemName}</p>
                <p className="text-sm text-muted">{item.quantity ?? ''} {item.unit ?? ''} · {item.status}{item.isAiSuggested ? ' · suggested' : ''}</p>
                {item.aiReason ? <p className="text-sm text-muted">{item.aiReason}</p> : null}
              </div>
              <div className="flex gap-2">
                {item.status !== 'stocked' && !(item.isAiSuggested && !premium) ? (
                  <Button
                    onClick={() => {
                      const qtyParam = item.quantity ?? '';
                      if (item.productId) router.push(`/shop/products/${item.productId}?batch=1&buyListItemId=${item.id}&qty=${qtyParam}`);
                      else router.push(`/shop/products/new?buyListItemId=${item.id}&name=${encodeURIComponent(item.itemName)}&qty=${qtyParam}`);
                    }}
                  >
                    Stock
                  </Button>
                ) : null}
                <Button tone="ghost" onClick={() => void api.deleteBuyListItem(shop.id, item.id).then(refresh).catch(setError)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
