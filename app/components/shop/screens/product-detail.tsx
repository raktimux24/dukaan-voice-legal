'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { catalogL1Label, catalogL2Label } from '../../../lib/shop/catalog';
import { useCart } from '../../../lib/shop/cart';
import { formatDay, formatINR, formatWhen } from '../../../lib/shop/money';
import type { AdjustmentReason, StockBatch } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PageHeader, Pill, Spinner, inputClass, isDenied } from '../ui';

const REASONS: AdjustmentReason[] = ['damaged', 'expired', 'theft', 'correction', 'returned_to_supplier', 'personal_use', 'other'];

function logMentionsProduct(payload: Record<string, unknown>, productId: string) {
  if (payload.productId === productId || payload.product_id === productId) return true;
  if (!Array.isArray(payload.items)) return false;
  return payload.items.some((item) => {
    if (typeof item === 'string') return item === productId;
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    return row.productId === productId || row.product_id === productId;
  });
}

export function ProductDetailScreen({ productId }: { productId: string }) {
  const { api, shop, perms, hideCost, userId, setNotice } = useShop();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useCart(userId, shop?.id ?? null);
  const catalog = useQuery({
    queryKey: ['catalog', shop?.id, hideCost],
    enabled: !!shop?.id,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const [showAll, setShowAll] = useState(false);
  const batches = useQuery({
    queryKey: ['batches', shop?.id, productId, showAll],
    enabled: !!shop?.id,
    queryFn: () => api.getBatches(shop!.id, productId, showAll),
  });
  const sales = useQuery({
    queryKey: ['product-sales', shop?.id, productId],
    enabled: !!shop?.id && perms.canSeeReports,
    queryFn: () => api.getProductSales(shop!.id, productId, 30),
  });
  const activity = useQuery({
    queryKey: ['audit', shop?.id, 'product', productId],
    enabled: !!shop?.id,
    queryFn: () => api.getAudit(shop!.id, 'all'),
  });
  const buyList = useQuery({
    queryKey: ['buy-list', shop?.id],
    enabled: !!shop?.id && perms.canEditProducts,
    queryFn: () => api.getBuyList(shop!.id),
  });
  const item = catalog.data?.find((row) => row.productId === productId);
  const [panel, setPanel] = useState<'adjust' | 'batch' | null>(params.get('batch') === '1' ? 'batch' : null);
  const [removeQty, setRemoveQty] = useState('');
  const [reason, setReason] = useState<AdjustmentReason>('correction');
  const [note, setNote] = useState('');
  const [setQty, setSetQty] = useState('');
  const [batchQty, setBatchQty] = useState(params.get('qty') ?? '');
  const [supplier, setSupplier] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);

  if (!shop) return <Spinner />;
  if (catalog.isLoading) return <Spinner label="Loading product" />;
  if (!item) return <Card><p>That product was not found.</p></Card>;

  const product = item.product;
  const onBuyList = (buyList.data ?? []).some((row) => row.productId === productId && row.status === 'pending');
  const activeBatches = (batches.data ?? []).filter((batch) => batch.status !== 'depleted');
  const nextOutId = activeBatches[0]?.id;
  const nextCost = activeBatches.find((batch) => batch.purchasePrice != null)?.purchasePrice ?? product.purchasePrice ?? null;
  const margin = product.sellingPrice != null && nextCost != null ? product.sellingPrice - nextCost : null;
  const productLogs = (activity.data?.logs ?? []).filter((log) => logMentionsProduct(log.payload, productId)).slice(0, 5);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['batches', shop.id, productId] });
    await queryClient.invalidateQueries({ queryKey: ['stats', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['buy-list', shop.id] });
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

  const sell = () => {
    if (product.sellingPrice == null) {
      setNotice(perms.canEditProducts ? 'Set a selling price before selling this.' : 'Ask a manager to set the price.');
      if (perms.canEditProducts) router.push(`/shop/products/${productId}/edit`);
      return;
    }
    const result = cart.addProduct(item, 1);
    if (!result.ok) {
      setNotice(result.message === 'unpriced' ? 'Set a selling price first.' : result.message ?? 'Could not add this to the bill.');
      return;
    }
    router.push('/shop/sell');
  };

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/products', label: 'Products' }}
        kicker={catalogL1Label(product.category)}
        title={product.name}
        description={[product.barcode ? `Barcode ${product.barcode}` : null, catalogL2Label(product.category, product.subcategory) || null].filter(Boolean).join(' · ') || undefined}
        actions={perms.canEditProducts ? <Button href={`/shop/products/${productId}/edit`} tone="ghost">Edit details</Button> : null}
      />
      <Notice error={error ?? (batches.error && !isDenied(batches.error) ? batches.error : null)} />

      <div className="product-hero">
        <p className="product-qty">{formatQty(item.quantity, item.unit, { packSize: product.packSize, packLabel: product.packLabel })}</p>
        <p className="party-meta">{product.sellingPrice != null ? `${formatINR(product.sellingPrice)} / ${item.unit}` : 'No selling price'}</p>
        {item.stockStatus === 'OUT' || item.stockStatus === 'LOW' ? (
          <Pill tone={item.stockStatus === 'OUT' ? 'danger' : 'warn'}>{item.stockStatus === 'OUT' ? 'Out of stock' : 'Running low'}</Pill>
        ) : null}
      </div>

      <div className="product-actions">
        <button type="button" className="product-action" onClick={() => setPanel((current) => current === 'adjust' ? null : 'adjust')}>
          <span>Adjust stock</span>
          <small>Remove or correct</small>
        </button>
        {perms.canEditProducts ? (
          <button type="button" className="product-action is-batch" onClick={() => setPanel((current) => current === 'batch' ? null : 'batch')}>
            <span>Add batch</span>
            <small>New stock in</small>
          </button>
        ) : null}
        <button type="button" className="product-action is-sell" onClick={sell}>
          <span>Sell</span>
          <small>Add to the bill</small>
        </button>
      </div>

      {panel === 'adjust' ? (
        <Card className="stack-form">
          <h2 className="shop-section-title">Adjust stock</h2>
          <p className="shop-section-sub">Removing stock needs a reason. Setting the quantity replaces what is on hand.</p>
          <Field label="Remove quantity">
            <input className={inputClass} inputMode="decimal" value={removeQty} onChange={(event) => setRemoveQty(event.target.value)} />
          </Field>
          <Field label="Reason">
            <select className={inputClass} value={reason} onChange={(event) => setReason(event.target.value as AdjustmentReason)}>
              {REASONS.map((itemReason) => <option key={itemReason} value={itemReason}>{itemReason.replaceAll('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label="Note">
            <input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
          <Button
            disabled={pending || !(Number(removeQty) > 0)}
            onClick={() => void run(async () => {
              await api.removeStock(shop.id, productId, Number(removeQty), reason, note || undefined);
              setRemoveQty('');
              setNote('');
            })}
          >
            Remove
          </Button>
          {perms.canEditProducts ? (
            <>
              <Field label="Set on-hand quantity">
                <input className={inputClass} inputMode="decimal" value={setQty} placeholder={String(item.quantity)} onChange={(event) => setSetQty(event.target.value)} />
              </Field>
              <Button
                tone="ghost"
                disabled={pending || setQty === '' || Number(setQty) === item.quantity}
                onClick={() => void run(() => api.updateQuantity(shop.id, item.id, Number(setQty), hideCost).then(() => undefined))}
              >
                Save quantity
              </Button>
            </>
          ) : null}
        </Card>
      ) : null}

      {panel === 'batch' && perms.canEditProducts ? (
        <Card>
          <form
            className="stack-form"
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
                setPanel(null);
                setBatchQty('');
                setSupplier('');
                setPurchasePrice('');
                setExpiry('');
                if (buyListItemId) router.push('/shop/buy-list');
              });
            }}
          >
            <h2 className="shop-section-title">Add batch</h2>
            <p className="shop-section-sub">This is the stock the next sale will draw from, in {product.depletionOrder === 'fifo' ? 'first-in order' : 'soonest-expiry order'}.</p>
            <div className="form-grid is-2">
              <Field label="Quantity"><input className={inputClass} inputMode="decimal" value={batchQty} onChange={(event) => setBatchQty(event.target.value)} required /></Field>
              <Field label="Expiry"><input className={inputClass} type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></Field>
              {!hideCost ? (
                <>
                  <Field label="Supplier"><input className={inputClass} value={supplier} onChange={(event) => setSupplier(event.target.value)} /></Field>
                  <Field label="Purchase price"><input className={inputClass} inputMode="decimal" value={purchasePrice} onChange={(event) => setPurchasePrice(event.target.value)} /></Field>
                </>
              ) : null}
            </div>
            <Button type="submit" disabled={pending || !(Number(batchQty) > 0)}>Add batch</Button>
          </form>
        </Card>
      ) : null}

      <Card flush>
        <div className="card-intro product-batch-head">
          <h2 className="shop-section-title">Batches</h2>
          <div className="shop-seg" role="group" aria-label="Batch list">
            <button type="button" className={!showAll ? 'is-active' : undefined} onClick={() => setShowAll(false)}>Active</button>
            <button type="button" className={showAll ? 'is-active' : undefined} onClick={() => setShowAll(true)}>All</button>
          </div>
        </div>
        <p className="product-batch-note">{product.depletionOrder === 'fifo' ? 'The first batch is the one the next sale uses.' : 'The soonest expiry is the one the next sale uses.'}</p>
        {batches.isLoading ? <p className="shop-list-empty">Loading batches</p> : null}
        {!batches.isLoading && (batches.data?.length ?? 0) === 0 ? (
          <p className="shop-list-empty">{showAll ? 'No batches yet.' : 'No active batches. Add one to put stock on the shelf.'}</p>
        ) : null}
        <div className="batch-list">
          {(batches.data ?? []).map((batch) => (
            <BatchRow
              key={batch.id}
              batch={batch}
              unit={item.unit}
              nextOut={batch.id === nextOutId}
              hideCost={hideCost}
              canEdit={perms.canEditProducts}
              editing={editing === batch.id}
              pending={pending}
              onEdit={() => setEditing((current) => current === batch.id ? null : batch.id)}
              onSave={(body) => run(() => api.updateBatch(shop.id, batch.id, body).then(() => setEditing(null)))}
            />
          ))}
        </div>
      </Card>

      {perms.canSeeReports && sales.data && (sales.data.units > 0 || sales.data.bills > 0) ? (
        <div className="kpi-grid">
          <div className="kpi"><p className="kpi-label">Sold · {sales.data.days}d</p><p className="kpi-value">{formatQty(sales.data.units, item.unit)}</p></div>
          <div className="kpi"><p className="kpi-label">Revenue</p><p className="kpi-value">{formatINR(sales.data.revenue)}</p></div>
          <div className="kpi"><p className="kpi-label">Cover</p><p className="kpi-value">{sales.data.daysOfCover == null ? '—' : `${sales.data.daysOfCover}d`}</p></div>
          <div className="kpi"><p className="kpi-label">Last sold</p><p className="kpi-value is-compact">{formatWhen(sales.data.lastSoldAt)}</p></div>
        </div>
      ) : null}

      <Card>
        <div className="product-batch-head">
          <h2 className="shop-section-title">Details</h2>
          {perms.canEditProducts ? <Button href={`/shop/products/${productId}/edit`} tone="quiet" size="sm">Edit</Button> : null}
        </div>
        <dl className="detail-list">
          {!hideCost ? <div><dt>Last paid</dt><dd>{formatINR(product.purchasePrice)}</dd></div> : null}
          <div><dt>Selling price</dt><dd>{product.sellingPrice == null ? '—' : formatINR(product.sellingPrice)}</dd></div>
          <div><dt>MRP</dt><dd>{product.mrp == null ? '—' : formatINR(product.mrp)}</dd></div>
          {!hideCost ? <div><dt>Margin on next sale</dt><dd>{margin == null || product.sellingPrice == null || product.sellingPrice <= 0 ? '—' : `${formatINR(margin)} · ${Math.round((margin / product.sellingPrice) * 100)}%`}</dd></div> : null}
          {product.shortCode ? <div><dt>Short code</dt><dd>{product.shortCode}</dd></div> : null}
          <div><dt>Low-stock alert</dt><dd>{product.minStockLevel > 0 ? formatQty(product.minStockLevel, item.unit) : '—'}</dd></div>
          <div><dt>Unit</dt><dd>{item.unit}</dd></div>
          <div><dt>Category</dt><dd>{[catalogL1Label(product.category), catalogL2Label(product.category, product.subcategory)].filter(Boolean).join(' · ')}</dd></div>
          <div><dt>Updated</dt><dd>{formatWhen(item.updatedAt)} · {item.updatedByName}</dd></div>
        </dl>
      </Card>

      {productLogs.length > 0 ? (
        <Card>
          <h2 className="shop-section-title">Activity</h2>
          <div className="detail-list">
            {productLogs.map((log) => (
              <div key={log.id}>
                <dt>{log.description}</dt>
                <dd>{log.userName} · {formatWhen(log.createdAt)}</dd>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {perms.canEditProducts ? (
        <div className="shop-actions">
          <Button
            tone="ghost"
            disabled={pending || onBuyList}
            onClick={() => void run(async () => {
              await api.addBuyListItem(shop.id, {
                itemName: product.name,
                quantity: product.minStockLevel > 0 ? product.minStockLevel : 1,
                unit: item.unit,
                category: product.category,
                productId,
              });
              setNotice(`${product.name} is on the buy list.`);
            })}
          >
            {onBuyList ? 'Already on the buy list' : 'Add to buy list'}
          </Button>
          <Button
            tone="danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Archive ${product.name}?`)) return;
              void run(async () => {
                await api.deleteProduct(shop.id, productId);
                cart.dropProduct(productId);
                router.push('/shop/products');
              });
            }}
          >
            Archive
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BatchRow({
  batch,
  unit,
  nextOut,
  hideCost,
  canEdit,
  editing,
  pending,
  onEdit,
  onSave,
}: {
  batch: StockBatch;
  unit: string;
  nextOut: boolean;
  hideCost: boolean;
  canEdit: boolean;
  editing: boolean;
  pending: boolean;
  onEdit: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [qty, setQty] = useState(String(batch.quantity));
  const [nextSupplier, setNextSupplier] = useState(batch.supplier ?? '');
  const [nextExpiry, setNextExpiry] = useState(batch.expiryDate?.slice(0, 10) ?? '');
  const depleted = batch.status === 'depleted';
  return (
    <article className={depleted ? 'batch-row is-depleted' : nextOut ? 'batch-row is-next' : 'batch-row'}>
      <div className="batch-row-main">
        <p className="shop-list-title">
          {formatQty(batch.quantity, unit)}
          {batch.initialQuantity != null && batch.initialQuantity > batch.quantity ? ` left of ${formatQty(batch.initialQuantity, unit)}` : ''}
        </p>
        <p className="shop-list-meta">
          {[batch.supplier, batch.purchaseDate ? `bought ${formatDay(batch.purchaseDate)}` : null, batch.expiryDate ? `expires ${formatDay(batch.expiryDate)}` : null].filter(Boolean).join(' · ') || 'No supplier or expiry'}
        </p>
        {!hideCost && batch.purchasePrice != null ? <p className="shop-list-meta">{formatINR(batch.purchasePrice)} / {unit}</p> : null}
      </div>
      <div className="batch-row-side">
        {nextOut ? <Pill tone="saffron">Next out</Pill> : null}
        {depleted ? <Pill>Depleted</Pill> : null}
        {canEdit ? <Button size="sm" tone="quiet" onClick={onEdit}>{editing ? 'Close' : 'Edit'}</Button> : null}
      </div>
      {editing ? (
        <div className="batch-edit">
          <Field label="Quantity"><input className={inputClass} inputMode="decimal" value={qty} onChange={(event) => setQty(event.target.value)} /></Field>
          {!hideCost ? <Field label="Supplier"><input className={inputClass} value={nextSupplier} onChange={(event) => setNextSupplier(event.target.value)} /></Field> : null}
          <Field label="Expiry"><input className={inputClass} type="date" value={nextExpiry} onChange={(event) => setNextExpiry(event.target.value)} /></Field>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => {
              const body: Record<string, unknown> = {};
              if (qty !== String(batch.quantity)) body.quantity = Number(qty);
              if (!hideCost && nextSupplier !== (batch.supplier ?? '')) body.supplier = nextSupplier;
              if (nextExpiry !== (batch.expiryDate?.slice(0, 10) ?? '')) body.expiryDate = nextExpiry || null;
              if (Object.keys(body).length === 0) return;
              onSave(body);
            }}
          >
            Save batch
          </Button>
        </div>
      ) : null}
    </article>
  );
}
