'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { enabledL1, isAllowedL2, l2ForL1, remapProductL1 } from '../../../lib/shop/catalog';
import { UNITS } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, Spinner, inputClass } from '../ui';

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
  const { api, shop, perms, hideCost } = useShop();
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

  const handleSubmit = async () => {
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
      router.push(`/shop/products/${created.product.id}`);
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <h1 className="font-display text-3xl">{productId ? 'Edit product' : 'Add product'}</h1>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Notice error={error} />
        <Field label="Name"><input className={inputClass} value={form.name} onChange={(event) => set({ name: event.target.value })} required /></Field>
        <Field label="Barcode"><input className={inputClass} value={form.barcode} onChange={(event) => set({ barcode: event.target.value })} /></Field>
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
        <Field label="Unit">
          <select className={inputClass} value={form.unit} onChange={(event) => set({ unit: event.target.value })}>
            {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </Field>
        <Field label="Minimum stock"><input className={inputClass} inputMode="decimal" value={form.minStockLevel} onChange={(event) => set({ minStockLevel: event.target.value })} /></Field>
        <Field label="Selling price"><input className={inputClass} inputMode="decimal" value={form.sellingPrice} onChange={(event) => set({ sellingPrice: event.target.value })} /></Field>
        <Field label="MRP"><input className={inputClass} inputMode="decimal" value={form.mrp} onChange={(event) => set({ mrp: event.target.value })} /></Field>
        {!hideCost ? <Field label="Purchase price"><input className={inputClass} inputMode="decimal" value={form.purchasePrice} onChange={(event) => set({ purchasePrice: event.target.value })} /></Field> : null}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.trackStock} onChange={(event) => set({ trackStock: event.target.checked })} /> Track stock</label>
        {!productId ? (
          <>
            <Field label="Opening stock"><input className={inputClass} inputMode="decimal" value={form.initialStock} onChange={(event) => set({ initialStock: event.target.value })} /></Field>
            {!hideCost ? <Field label="Supplier"><input className={inputClass} value={form.supplier} onChange={(event) => set({ supplier: event.target.value })} /></Field> : null}
            <Field label="Batch number"><input className={inputClass} value={form.batchNumber} onChange={(event) => set({ batchNumber: event.target.value })} /></Field>
            <Field label="Purchase date"><input className={inputClass} type="date" value={form.purchaseDate} onChange={(event) => set({ purchaseDate: event.target.value })} /></Field>
            <Field label="Expiry"><input className={inputClass} type="date" value={form.expiryDate} onChange={(event) => set({ expiryDate: event.target.value })} /></Field>
          </>
        ) : null}
        <Button type="submit" disabled={pending || !form.name.trim() || !dirty}>{pending ? 'Saving…' : 'Save'}</Button>
      </form>
    </Card>
  );
}
