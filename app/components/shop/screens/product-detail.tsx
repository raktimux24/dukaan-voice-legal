'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { catalogL1Label, catalogL2Label } from '../../../lib/shop/catalog';
import { useCart } from '../../../lib/shop/cart';
import { formatDay, formatINR } from '../../../lib/shop/money';
import type { AdjustmentReason } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PremiumLock, Spinner, isPremiumError, inputClass } from '../ui';

const REASONS: AdjustmentReason[] = ['damaged', 'expired', 'theft', 'correction', 'returned_to_supplier', 'personal_use', 'other'];

export function ProductDetailScreen({ productId }: { productId: string }) {
  const { api, shop, perms, hideCost, premium, userId } = useShop();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useCart(userId, shop?.id ?? null);
  const catalog = useQuery({
    queryKey: ['catalog', shop?.id, hideCost],
    enabled: !!shop?.id,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const batches = useQuery({
    queryKey: ['batches', shop?.id, productId],
    enabled: !!shop?.id && perms.canEditProducts,
    queryFn: () => api.getBatches(shop!.id, productId, true),
  });
  const history = useQuery({
    queryKey: ['history', shop?.id],
    enabled: !!shop?.id && premium && perms.canSeeReports,
    queryFn: () => api.getHistory(shop!.id, 30),
  });
  const item = catalog.data?.find((row) => row.productId === productId);
  const [quantity, setQuantity] = useState('');
  const [removeQty, setRemoveQty] = useState('');
  const [reason, setReason] = useState<AdjustmentReason>('correction');
  const [note, setNote] = useState('');
  const [batchQty, setBatchQty] = useState(params.get('qty') ?? '');
  const [supplier, setSupplier] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [showBatch, setShowBatch] = useState(params.get('batch') === '1');

  if (!shop) return <Spinner />;
  if (catalog.isLoading) return <Spinner label="Loading product" />;
  if (!item) return <Card><p>That product was not found.</p></Card>;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['batches', shop.id, productId] });
    await queryClient.invalidateQueries({ queryKey: ['stats', shop.id] });
  };

  const run = async (work: () => Promise<void>) => {
    setPending(true);
    setError(null);
    try {
      await work();
      await refresh();
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{item.product.name}</h1>
          <p className="text-muted">{catalogL1Label(item.product.category)} · {catalogL2Label(item.product.category, item.product.subcategory)} · {formatQty(item.quantity, item.unit)}</p>
        </div>
        {perms.canEditProducts ? <Button href={`/shop/products/${productId}/edit`}>Edit</Button> : null}
      </div>
      <Notice error={error} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm text-muted">Selling price</p><p className="text-xl">{item.product.sellingPrice == null ? 'Unpriced' : formatINR(item.product.sellingPrice)}</p></Card>
        {!hideCost ? <Card><p className="text-sm text-muted">Purchase price</p><p className="text-xl">{formatINR(item.product.purchasePrice)}</p></Card> : null}
        <Card><p className="text-sm text-muted">Status</p><p className="text-xl">{item.stockStatus}</p></Card>
      </div>
      <Card className="grid gap-3">
        <h2 className="font-semibold">Remove stock</h2>
        <Field label="Quantity"><input className={inputClass} inputMode="decimal" value={removeQty} onChange={(event) => setRemoveQty(event.target.value)} /></Field>
        <Field label="Reason">
          <select className={inputClass} value={reason} onChange={(event) => setReason(event.target.value as AdjustmentReason)}>
            {REASONS.map((itemReason) => <option key={itemReason} value={itemReason}>{itemReason.replaceAll('_', ' ')}</option>)}
          </select>
        </Field>
        <Field label="Note"><input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} /></Field>
        <Button
          disabled={pending || !(Number(removeQty) > 0)}
          onClick={() => void run(async () => {
            await api.removeStock(shop.id, productId, Number(removeQty), reason, note || undefined);
            setRemoveQty('');
          })}
        >
          Remove
        </Button>
      </Card>
      {perms.canEditProducts ? (
        <Card className="grid gap-3">
          <h2 className="font-semibold">Set on-hand quantity</h2>
          <Field label="Quantity"><input className={inputClass} inputMode="decimal" value={quantity} placeholder={String(item.quantity)} onChange={(event) => setQuantity(event.target.value)} /></Field>
          <Button
            disabled={pending || quantity === '' || Number(quantity) === item.quantity}
            onClick={() => void run(() => api.updateQuantity(shop.id, item.id, Number(quantity), hideCost).then(() => undefined))}
          >
            Save quantity
          </Button>
        </Card>
      ) : null}
      {perms.canEditProducts ? (
        <Card className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Batches</h2>
            <Button tone="ghost" onClick={() => setShowBatch((value) => !value)}>{showBatch ? 'Close' : 'Add batch'}</Button>
          </div>
          {showBatch ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const buyListItemId = params.get('buyListItemId');
                void run(async () => {
                  const body: Record<string, unknown> = { quantity: Number(batchQty) };
                  if (supplier.trim()) body.supplier = supplier.trim();
                  if (!hideCost && purchasePrice !== '') body.purchasePrice = Number(purchasePrice);
                  if (expiry) body.expiryDate = expiry;
                  await api.addBatch(shop.id, productId, body);
                  if (buyListItemId) await api.updateBuyList(shop.id, buyListItemId, { status: 'stocked', productId });
                  setShowBatch(false);
                  setBatchQty('');
                  if (buyListItemId) router.push('/shop/buy-list');
                });
              }}
            >
              <Field label="Quantity"><input className={inputClass} inputMode="decimal" value={batchQty} onChange={(event) => setBatchQty(event.target.value)} required /></Field>
              {!hideCost ? (
                <>
                  <Field label="Supplier"><input className={inputClass} value={supplier} onChange={(event) => setSupplier(event.target.value)} /></Field>
                  <Field label="Purchase price"><input className={inputClass} inputMode="decimal" value={purchasePrice} onChange={(event) => setPurchasePrice(event.target.value)} /></Field>
                </>
              ) : null}
              <Field label="Expiry"><input className={inputClass} type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></Field>
              <Button type="submit" disabled={pending || !(Number(batchQty) > 0)}>Add batch</Button>
            </form>
          ) : null}
          {(batches.data ?? []).map((batch) => (
            <BatchEditor
              key={batch.id}
              label={`${formatQty(batch.quantity, item.unit)} · ${batch.status}${batch.supplier ? ` · ${batch.supplier}` : ''}`}
              meta={`${formatDay(batch.expiryDate)}${!hideCost && batch.purchasePrice != null ? ` · ${formatINR(batch.purchasePrice)}` : ''}`}
              quantity={batch.quantity}
              supplier={batch.supplier ?? ''}
              expiry={batch.expiryDate?.slice(0, 10) ?? ''}
              hideCost={hideCost}
              disabled={pending}
              onSave={(body) => run(() => api.updateBatch(shop.id, batch.id, body).then(() => undefined))}
            />
          ))}
        </Card>
      ) : null}
      {perms.canSeeReports ? (
        premium ? (
          history.isError && isPremiumError(history.error) ? <PremiumLock shopId={shop.id} feature="history" /> : (
            <Card>
              <h2 className="font-semibold">Stock history</h2>
              <div className="mt-2 grid gap-1 text-sm text-muted">
                {(history.data?.stats ?? []).slice(-7).map((row) => <p key={row.date}>{row.date}: {row.lowStockCount} low, {row.outOfStockCount} out</p>)}
              </div>
            </Card>
          )
        ) : <PremiumLock shopId={shop.id} feature="history" />
      ) : null}
      {perms.canEditProducts ? (
        <Button
          tone="danger"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Archive ${item.product.name}?`)) return;
            void run(async () => {
              await api.deleteProduct(shop.id, productId);
              cart.dropProduct(productId);
              router.push('/shop/products');
            });
          }}
        >
          Archive product
        </Button>
      ) : null}
      <Link href="/shop/products" className="text-sm text-muted">Back to products</Link>
    </div>
  );
}

function BatchEditor({
  label,
  meta,
  quantity,
  supplier,
  expiry,
  hideCost,
  disabled,
  onSave,
}: {
  label: string;
  meta: string;
  quantity: number;
  supplier: string;
  expiry: string;
  hideCost: boolean;
  disabled: boolean;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [qty, setQty] = useState(String(quantity));
  const [nextSupplier, setNextSupplier] = useState(supplier);
  const [nextExpiry, setNextExpiry] = useState(expiry);
  const dirty = qty !== String(quantity) || nextSupplier !== supplier || nextExpiry !== expiry;
  return (
    <div className="grid gap-2 border-t border-line pt-3">
      <p>{label}</p>
      <p className="text-sm text-muted">{meta}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <input className={inputClass} inputMode="decimal" aria-label="Batch quantity" value={qty} onChange={(event) => setQty(event.target.value)} />
        {!hideCost ? <input className={inputClass} aria-label="Batch supplier" value={nextSupplier} onChange={(event) => setNextSupplier(event.target.value)} /> : null}
        <input className={inputClass} type="date" aria-label="Batch expiry" value={nextExpiry} onChange={(event) => setNextExpiry(event.target.value)} />
      </div>
      <Button
        disabled={disabled || !dirty || !(Number(qty) >= 0)}
        onClick={() => {
          const body: Record<string, unknown> = {};
          if (qty !== String(quantity)) body.quantity = Number(qty);
          if (!hideCost && nextSupplier !== supplier) body.supplier = nextSupplier;
          if (nextExpiry !== expiry) body.expiryDate = nextExpiry || null;
          if (Object.keys(body).length === 0) return;
          onSave(body);
        }}
      >
        Save batch
      </Button>
    </div>
  );
}
