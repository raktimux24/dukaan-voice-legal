'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { catalogL1Label, catalogL2Label, enabledL1, isAllowedL2, l2ForL1, remapProductL1 } from '../../../lib/shop/catalog';
import { formatINR } from '../../../lib/shop/money';
import { UNITS, formatQty, isWeightOrVolume } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Spinner, cx, inputClass } from '../ui';

type Draft = {
  name: string;
  barcode: string;
  category: string;
  subcategory: string;
  unit: string;
  minStockLevel: string;
  sellingPrice: string;
  mrp: string;
  purchasePrice: string;
  trackStock: boolean;
  shortCode: string;
  packSize: string;
  packLabel: string;
  initialStock: string;
  supplier: string;
  expiryDate: string;
  purchaseDate: string;
  batchNumber: string;
};

function blank(category: string, subcategory: string, extra?: Partial<Draft>): Draft {
  return {
    name: '',
    barcode: '',
    category,
    subcategory,
    unit: 'piece',
    minStockLevel: '0',
    sellingPrice: '',
    mrp: '',
    purchasePrice: '',
    trackStock: true,
    shortCode: '',
    packSize: '',
    packLabel: '',
    initialStock: '0',
    supplier: '',
    expiryDate: '',
    purchaseDate: '',
    batchNumber: '',
    ...extra,
  };
}

export function ProductFormScreen({ productId }: { productId?: string }) {
  const { api, shop, perms, hideCost, setNotice } = useShop();
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const existing = useQuery({
    queryKey: ['catalog', shop?.id, hideCost],
    enabled: !!shop?.id && !!productId,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const item = existing.data?.find((row) => row.productId === productId);
  const l1 = enabledL1(shop?.category, shop?.subtype);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const initial = useMemo(() => {
    if (!shop) return null;
    const first = l1[0];
    const sub = first ? l2ForL1(first.code)[0]?.code ?? '' : '';
    if (!productId) {
      return blank(first?.code ?? 'staples', sub, {
        name: params.get('name') ?? '',
        barcode: params.get('barcode') ?? '',
        initialStock: params.get('qty') ?? '0',
      });
    }
    if (!item) return null;
    return blank(remapProductL1(item.product.category), item.product.subcategory ?? '', {
      name: item.product.name,
      barcode: item.product.barcode ?? '',
      unit: item.product.unit,
      minStockLevel: String(item.product.minStockLevel ?? 0),
      sellingPrice: item.product.sellingPrice == null ? '' : String(item.product.sellingPrice),
      mrp: item.product.mrp == null ? '' : String(item.product.mrp),
      purchasePrice: item.product.purchasePrice == null ? '' : String(item.product.purchasePrice),
      trackStock: item.product.trackStock !== false,
      shortCode: item.product.shortCode ?? '',
      packSize: item.product.packSize == null ? '' : String(item.product.packSize),
      packLabel: item.product.packLabel ?? '',
    });
  }, [item, l1, params, productId, shop]);
  const form = draft ?? initial;

  if (!shop) return <Spinner />;
  if (!perms.canEditProducts) return <NoAccess what="Only an owner or manager can add or edit products." />;
  if (productId && existing.isLoading) return <Spinner label="Loading product" />;
  if (productId && !item) return <Card><p>That product was not found.</p></Card>;
  if (!form) return <Spinner />;

  const subs = l2ForL1(form.category);
  const set = (partial: Partial<Draft>) => setDraft({ ...form, ...partial });
  const dirty = initial ? JSON.stringify(form) !== JSON.stringify(initial) : true;
  const selling = form.sellingPrice === '' ? null : Number(form.sellingPrice);
  const cost = form.purchasePrice === '' ? null : Number(form.purchasePrice);
  const marginPct = selling != null && cost != null && selling > 0 ? ((selling - cost) / selling) * 100 : null;
  const opening = Number(form.initialStock || 0);
  const canSave = !pending && !!form.name.trim() && !!form.subcategory && dirty;

  const handleSubmit = async (addAnother = false) => {
    if (!isAllowedL2(shop.category, shop.subtype, form.category, form.subcategory)) {
      setError(new Error('That category is not available for this shop.'));
      return;
    }
    const buyListItemId = params.get('buyListItemId');
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      barcode: form.barcode.trim() || null,
      category: form.category,
      subcategory: form.subcategory,
      unit: form.unit,
      minStockLevel: Number(form.minStockLevel || 0),
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      mrp: form.mrp === '' ? null : Number(form.mrp),
      trackStock: form.trackStock,
      shortCode: form.shortCode.trim() || null,
      packSize: form.packSize === '' ? null : Number(form.packSize),
      packLabel: form.packLabel.trim() || null,
    };
    if (!hideCost && form.purchasePrice !== '') body.purchasePrice = Number(form.purchasePrice);
    setPending(true);
    setError(null);
    try {
      if (productId) {
        await api.updateProduct(shop.id, productId, body);
        await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
        router.push(`/shop/products/${productId}`);
        return;
      }
      body.initialStock = Number(form.initialStock || 0);
      if (form.supplier) body.supplier = form.supplier;
      if (form.expiryDate) body.expiryDate = form.expiryDate;
      if (form.purchaseDate) body.purchaseDate = form.purchaseDate;
      if (form.batchNumber) body.batchNumber = form.batchNumber;
      const created = await api.addProduct(shop.id, body);
      if (buyListItemId) await api.updateBuyList(shop.id, buyListItemId, { status: 'stocked', productId: created.product.id });
      await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
      if (addAnother) {
        setNotice(`${created.product.name} added.`);
        setDraft(blank(form.category, form.subcategory, { unit: form.unit }));
        window.scrollTo({ top: 0 });
        return;
      }
      router.push(`/shop/products/${created.product.id}`);
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  };

  const money = (value: string, onChange: (next: string) => void, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <div className="shop-input-wrap">
        <span className="shop-input-prefix">₹</span>
        <input className={cx(inputClass, 'num')} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" />
      </div>
    </Field>
  );

  return (
    <form
      className="shop-page"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <PageHeader
        kicker="Catalog"
        title={productId ? 'Edit product' : 'Add product'}
        description={productId ? 'Changes save to the shop catalog and show on the phone after a refresh.' : 'Name, category, and a price are enough to start selling. Stock and batch details are optional.'}
        actions={<Button href={productId ? `/shop/products/${productId}` : '/shop/products'} tone="quiet" size="sm">Cancel</Button>}
      />
      <Notice error={error} />

      <div className="form-layout">
        <div className="form-stack">
          <Card className="grid gap-5">
            <div>
              <h2 className="shop-section-title">Product</h2>
              <p className="shop-section-sub">What it is and how it is counted.</p>
            </div>
            <div className="form-grid">
              <Field label="Name">
                <input className="shop-field is-lg" value={form.name} onChange={(event) => set({ name: event.target.value })} required autoFocus={!productId} placeholder="e.g. Tata Salt 1 kg" />
              </Field>
              <div className="form-grid is-2">
                <Field label="Category">
                  <select className={inputClass} value={form.category} onChange={(event) => set({ category: event.target.value, subcategory: l2ForL1(event.target.value)[0]?.code ?? '' })}>
                    {l1.map((row) => <option key={row.code} value={row.code}>{row.label}</option>)}
                  </select>
                </Field>
                <Field label="Sub-category">
                  <select className={inputClass} value={form.subcategory} onChange={(event) => set({ subcategory: event.target.value })} required>
                    {subs.map((row) => <option key={row.code} value={row.code}>{row.label}</option>)}
                  </select>
                </Field>
              </div>
              <div className="form-grid is-2">
                <Field label="Barcode" hint="Scan into this field with a USB scanner, or type it.">
                  <input className={cx(inputClass, 'num')} value={form.barcode} onChange={(event) => set({ barcode: event.target.value })} inputMode="numeric" />
                </Field>
                <Field label="Unit" hint={isWeightOrVolume(form.unit) ? 'Sold by weight or volume; the counter accepts decimals.' : 'Sold in whole numbers.'}>
                  <select className={inputClass} value={form.unit} onChange={(event) => set({ unit: event.target.value })}>
                    {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Card>

          <Card className="grid gap-5">
            <div>
              <h2 className="shop-section-title">Pricing</h2>
              <p className="shop-section-sub">The selling price is what the counter charges. MRP prints on the bill when it is higher.</p>
            </div>
            <div className={cx('form-grid', hideCost ? 'is-2' : 'is-3')}>
              {money(form.sellingPrice, (next) => set({ sellingPrice: next }), 'Selling price', 'Leave empty to price at the counter later.')}
              {money(form.mrp, (next) => set({ mrp: next }), 'MRP')}
              {!hideCost ? money(form.purchasePrice, (next) => set({ purchasePrice: next }), 'Purchase price', 'Your cost. Hidden from helpers.') : null}
            </div>
          </Card>

          <Card className="grid gap-5">
            <div>
              <h2 className="shop-section-title">Stock</h2>
              <p className="shop-section-sub">{productId ? 'Add or edit batches from the product page.' : 'Opening stock creates the first batch.'}</p>
            </div>
            <div className="form-grid is-2">
              <label className="shop-toggle">
                <span>
                  Track stock
                  <span className="block text-xs text-muted">Turn off for services or items you never count.</span>
                </span>
                <input type="checkbox" className="shop-field" checked={form.trackStock} onChange={(event) => set({ trackStock: event.target.checked })} />
              </label>
              <Field label="Low-stock alert at" hint={`Alerts when on-hand falls to this many ${form.unit}.`}>
                <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.minStockLevel} onChange={(event) => set({ minStockLevel: event.target.value })} />
              </Field>
            </div>
            {!productId && form.trackStock ? (
              <div className="form-grid is-2">
                <Field label="Opening stock">
                  <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.initialStock} onChange={(event) => set({ initialStock: event.target.value })} />
                </Field>
                {!hideCost ? (
                  <Field label="Supplier" hint="Suppliers are built from this field.">
                    <input className={inputClass} value={form.supplier} onChange={(event) => set({ supplier: event.target.value })} />
                  </Field>
                ) : null}
                <Field label="Batch number">
                  <input className={inputClass} value={form.batchNumber} onChange={(event) => set({ batchNumber: event.target.value })} />
                </Field>
                <div className="form-grid is-2">
                  <Field label="Purchased on">
                    <input className={inputClass} type="date" value={form.purchaseDate} onChange={(event) => set({ purchaseDate: event.target.value })} />
                  </Field>
                  <Field label="Expires on">
                    <input className={inputClass} type="date" value={form.expiryDate} onChange={(event) => set({ expiryDate: event.target.value })} />
                  </Field>
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <details className="form-details" open={!!(form.shortCode || form.packSize || form.packLabel)}>
              <summary>More options: short code and pack size</summary>
              <div className="form-grid is-3">
                <Field label="Short code" hint="Type this at the counter to add the product.">
                  <input className={inputClass} value={form.shortCode} onChange={(event) => set({ shortCode: event.target.value })} placeholder="e.g. TS1" />
                </Field>
                <Field label="Pack size" hint={`How many ${form.unit} make one pack.`}>
                  <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.packSize} onChange={(event) => set({ packSize: event.target.value })} />
                </Field>
                <Field label="Pack label">
                  <input className={inputClass} value={form.packLabel} onChange={(event) => set({ packLabel: event.target.value })} placeholder="e.g. case, strip" />
                </Field>
              </div>
            </details>
          </Card>
        </div>

        <aside className="form-aside">
          <Card className="form-summary">
            <p className="shop-kicker">{productId ? 'Saving changes to' : 'Adding'}</p>
            <p className="form-summary-name">{form.name.trim() || 'New product'}</p>
            <div className="grid gap-2">
              <p className="form-summary-row"><span>Category</span><b>{catalogL1Label(form.category)}{form.subcategory ? ` · ${catalogL2Label(form.category, form.subcategory)}` : ''}</b></p>
              <p className="form-summary-row"><span>Sells at</span><b className="num">{selling == null ? 'Price at counter' : `${formatINR(selling)} / ${form.unit}`}</b></p>
              {form.mrp !== '' ? <p className="form-summary-row"><span>MRP</span><b className="num">{formatINR(Number(form.mrp))}</b></p> : null}
              {!productId ? (
                <p className="form-summary-row"><span>Opening stock</span><b className="num">{form.trackStock ? formatQty(opening, form.unit) : 'Not tracked'}</b></p>
              ) : null}
              {form.barcode.trim() ? <p className="form-summary-row"><span>Barcode</span><b className="num">{form.barcode.trim()}</b></p> : null}
            </div>
            {!hideCost && marginPct != null ? (
              <div className={cx('form-margin', marginPct < 0 && 'is-negative')}>
                <strong className="num">{marginPct.toFixed(1)}%</strong> margin · {formatINR(selling! - cost!)} per {form.unit}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Button type="submit" size="lg" block disabled={!canSave}>{pending ? 'Saving…' : productId ? 'Save changes' : 'Save product'}</Button>
              {!productId ? (
                <Button tone="ghost" block disabled={!canSave} onClick={() => void handleSubmit(true)}>Save and add another</Button>
              ) : null}
            </div>
            {!form.name.trim() ? <p className="text-center text-xs text-faint">A name is required.</p> : null}
          </Card>
        </aside>
      </div>
    </form>
  );
}
