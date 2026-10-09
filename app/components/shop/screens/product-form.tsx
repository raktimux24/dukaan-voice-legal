'use client';

import { useGstText as useUiText } from "../gst-ui";
import { TaxFields, Check, TextField, useGstText } from '../gst-ui';
import type { ProductTax } from '../../../lib/shop/gst-types';
import { discountedBuyingPrice, productPriceBreakdown } from '../../../lib/shop/gst-core/product-gross-price';
import { validateProductTaxDraft } from '../../../lib/shop/gst-core/gst';
import { EN_FALLBACK } from '../../../lib/shop/en-fallback';


import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { enabledL1, isAllowedL2, l2ForL1, labeledL1, labeledL2, remapProductL1 } from '../../../lib/shop/catalog';
import { formatINR } from '../../../lib/shop/money';
import { UNITS, formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { SupplierField } from '../supplier-field';
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

export function ProductFormScreen({ productId, onCreated, onCancel }: { productId?: string; onCreated?: (id: string) => void | Promise<void>; onCancel?: () => void }) {
  const uiText = useUiText();
  const { api, shop, perms, hideCost, setNotice, t } = useShop();
  const router = useRouter();
  const text=useGstText();
  const [gstDraft,setGstDraft]=useState<ProductTax|null|undefined>(undefined);
  const [buyingDiscount,setBuyingDiscount]=useState('');
  const [autoMrp,setAutoMrp]=useState(false);
  const pos=useQuery({queryKey:['pos',shop?.id],enabled:!!shop,queryFn:()=>api.getPosSettings(shop!.id)});
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
  if (!perms.canEditProducts) return <NoAccess what={uiText("Only an owner or manager can add or edit products.")} />;
  if (productId && existing.isLoading) return <Spinner label={uiText("Loading product")} />;
  if (productId && !item) return <Card><p>{uiText("That product was not found.")}</p></Card>;
  if (!form) return <Spinner />;

  const subs = l2ForL1(form.category);
  const set = (partial: Partial<Draft>) => setDraft({ ...form, ...partial });
  const dirty = (initial ? JSON.stringify(form) !== JSON.stringify(initial) : true)||gstDraft!==undefined||buyingDiscount!==''||autoMrp;
  const selling = form.sellingPrice === '' ? null : Number(form.sellingPrice);
  const gstConfig=gstDraft===undefined?item?.product.gstConfig??null:gstDraft;
  const priceBreakdown=productPriceBreakdown(form.sellingPrice,gstConfig,pos.data?.gstSettings);
  const cost = discountedBuyingPrice(form.purchasePrice,buyingDiscount);
  const netSelling=priceBreakdown?.net??selling;
  const marginPct = netSelling != null && cost != null && netSelling > 0 ? ((netSelling - cost) / netSelling) * 100 : null;
  const opening = Number(form.initialStock || 0);
  const canSave = !pending && !!form.name.trim() && !!form.subcategory && dirty && !pos.isPending && !pos.error;

  const handleSubmit = async (addAnother = false) => {
    if (!isAllowedL2(shop.category, shop.subtype, form.category, form.subcategory)) {
      setError(new Error('That category is not available for this shop.'));
      return;
    }
    if(!hideCost && form.purchasePrice!=='' && cost===null){setError(Error(text('Enter a valid buying price and a discount between 0 and 100%.')));return;}
    if(autoMrp&&!priceBreakdown){setError(Error(text('Confirm selling price and GST before calculating MRP.')));return;}
    const buyListItemId = onCreated ? null : params.get('buyListItemId');
    if(gstConfig){try{validateProductTaxDraft(gstConfig);}catch(e){setError(e);return;}}
    if(form.mrp&&priceBreakdown&&priceBreakdown.gross>Number(form.mrp)&&!autoMrp){setError(new Error(text('Selling price including GST must not exceed MRP.')));return;}
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      barcode: form.barcode.trim() || null,
      category: form.category,
      subcategory: form.subcategory,
      unit: form.unit,
      minStockLevel: Number(form.minStockLevel || 0),
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      gstConfig,
      mrp: autoMrp&&priceBreakdown?priceBreakdown.gross:form.mrp === '' ? null : Number(form.mrp),
      trackStock: form.trackStock,
      shortCode: form.shortCode.trim() || null,
      packSize: form.packSize === '' ? null : Number(form.packSize),
      packLabel: form.packLabel.trim() || null,
    };
    if (!hideCost && form.purchasePrice !== '') body.purchasePrice = cost;
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
      if (onCreated) {
        await onCreated(created.product.id);
        return;
      }
      if (addAnother) {
        setNotice(t('modal.add_product.toast_added', '{{name}} added to inventory', { name: created.product.name }));
        setDraft(blank(form.category, form.subcategory, { unit: form.unit }));setGstDraft(undefined);setBuyingDiscount('');setAutoMrp(false);
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
        kicker={t('products.title', 'Catalog')}
        title={productId ? t('modal.add_product.title_edit', 'Edit product') : t('modal.add_product.title', 'Add product')}
        description={productId ? t('modal.add_product.edit_note', 'Stock and batch details are managed from the product page.') : uiText('Name, category, and a price are enough to start selling.')}
        actions={<Button href={onCancel ? undefined : productId ? `/shop/products/${productId}` : '/shop/products'} onClick={onCancel} disabled={pending} tone="quiet" size="sm">{t('common.cancel', 'Cancel')}</Button>}
      />
      <Notice error={error} />

      <div className="form-layout">
        <div className="form-stack">
          <Card className="grid gap-5">
            <div>
              <h2 className="shop-section-title">{t('products.title', 'Product')}</h2>
              <p className="shop-section-sub">{t('modal.product_detail.section_details', 'What it is and how it is counted.')}</p>
            </div>
            <div className="form-grid">
              <Field label={t('modal.add_product.name_label', 'Name')}>
                <input className="shop-field is-lg" value={form.name} onChange={(event) => set({ name: event.target.value })} required autoFocus={!productId} placeholder={t('modal.add_product.name_placeholder', 'e.g. Tata Salt 1 kg')} />
              </Field>
              <div className="form-grid is-2">
                <Field label={t('modal.add_product.category_label', 'Category')}>
                  <select className={inputClass} value={form.category} onChange={(event) => set({ category: event.target.value, subcategory: l2ForL1(event.target.value)[0]?.code ?? '' })}>
                    {l1.map((row) => <option key={row.code} value={row.code}>{labeledL1(row.code, (key) => t(key, key))}</option>)}
                  </select>
                </Field>
                <Field label={t('modal.add_product.subcategory_label', 'Sub-category')}>
                  <select className={inputClass} value={form.subcategory} onChange={(event) => set({ subcategory: event.target.value })} required>
                    {subs.map((row) => <option key={row.code} value={row.code}>{labeledL2(form.category, row.code, (key) => t(key, key))}</option>)}
                  </select>
                </Field>
              </div>
              <div className="form-grid is-2">
                <Field label={t('modal.add_product.barcode_label', 'Barcode')} hint={t('modal.add_product.barcode_placeholder', 'Scan or enter barcode')}>
                  <input className={cx(inputClass, 'num')} value={form.barcode} onChange={(event) => set({ barcode: event.target.value })} inputMode="numeric" />
                </Field>
                <Field label={t('modal.add_product.unit_label', 'Unit')}>
                  <select className={inputClass} value={form.unit} onChange={(event) => set({ unit: event.target.value })}>
                    {UNITS.map((unit) => <option key={unit} value={unit}>{t(unit === 'packet' ? 'unit_picker.pack' : unit === 'L' ? 'unit_picker.liter' : unit === 'mL' ? 'unit_picker.ml' : `unit_picker.${unit}`, unit)}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Card>

          <Card className="grid gap-5">
            <h2 className="shop-section-title">{text('Prices & GST')}</h2>
            {!hideCost?<div className="form-grid is-2">
              {money(form.purchasePrice,next=>set({purchasePrice:next}),text('Buying price'),text('Your cost before the buying discount.'))}
              <TextField label={text('Buying discount (%)')} type="number" value={buyingDiscount} onChange={setBuyingDiscount}/>
              {cost!=null?<p className="shop-hint">{text('Effective buying cost')}: {formatINR(cost)}</p>:null}
            </div>:null}
            {money(form.sellingPrice,next=>set({sellingPrice:next}),text('Selling price'),pos.data?.gstSettings?.registration === 'regular' ? text('GST is calculated on this selling price after discounts.') : undefined)}
            <Notice error={pos.error}/>
            <p className="shop-hint">{text(EN_FALLBACK[!pos.data?.gstSettings || pos.data.gstSettings.registration === 'unknown' ? 'gst.product_price_unknown' : pos.data.gstSettings.registration !== 'regular' ? 'gst.product_price_no_collection' : pos.data.gstSettings.priceMode === 'exclusive' ? 'gst.product_price_exclusive' : 'gst.product_price_inclusive'])}</p>
            <TaxFields value={gstConfig} onChange={setGstDraft}/>
            {priceBreakdown?<div className="gst-price-preview"><span>{text('Before GST')} <b>{formatINR(priceBreakdown.net)}</b></span><span>{text('GST')} <b>{formatINR(priceBreakdown.tax)}</b></span><span>{text('Customer pays')} <b>{formatINR(priceBreakdown.gross)}</b></span></div>:<p className="shop-hint">{text('Set up shop GST and confirm the product tax details to see the GST calculation.')}</p>}
            <Check label={text('Calculate MRP from selling price and GST')} checked={autoMrp} onChange={setAutoMrp}/>
            {autoMrp?<p>{text('Calculated MRP')}: {priceBreakdown?formatINR(priceBreakdown.gross):'—'}</p>:money(form.mrp,next=>set({mrp:next}),text('MRP'),text(EN_FALLBACK['gst.mrp_help']))}
          </Card>

          <Card className="grid gap-5">
            <div>
              <h2 className="shop-section-title">{t('reports.stock.on_hand', 'Stock')}</h2>
              <p className="shop-section-sub">{productId ? t('modal.add_product.edit_note', 'Add or edit batches from the product page.') : t('modal.add_product.section_initial_batch', 'Opening stock creates the first batch.')}</p>
            </div>
            <div className="form-grid is-2">
              <label className="shop-toggle">
                <span>
                  {t('modal.add_product.track_stock_label', 'Track stock')}
                  <span className="block text-xs text-muted">{t('modal.add_product.track_stock_hint', 'Turn off for services or items you never count.')}</span>
                </span>
                <input type="checkbox" className="shop-field" checked={form.trackStock} onChange={(event) => set({ trackStock: event.target.checked })} />
              </label>
              {form.trackStock ? <Field label={t('modal.add_product.min_stock_label', 'Low-stock alert at')} hint={t('modal.product_detail.detail_min_stock', 'Alerts when on-hand falls to this many {{unit}}.', { unit: form.unit })}>
                <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.minStockLevel} onChange={(event) => set({ minStockLevel: event.target.value })} />
              </Field> : null}
            </div>
            {!productId && form.trackStock ? (
              <div className="form-grid is-2">
                <Field label={t('modal.add_product.quantity_label', 'Opening stock')}>
                  <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.initialStock} onChange={(event) => set({ initialStock: event.target.value })} />
                </Field>
                {!hideCost ? <SupplierField value={form.supplier} onChange={(supplier) => set({ supplier })} /> : null}
                <Field label={t('modal.add_product.batch_number_label', 'Batch number')}>
                  <input className={inputClass} value={form.batchNumber} onChange={(event) => set({ batchNumber: event.target.value })} />
                </Field>
                <div className="form-grid is-2">
                  <Field label={t('modal.add_product.purchase_date_label', 'Purchased on')}>
                    <input className={inputClass} type="date" value={form.purchaseDate} onChange={(event) => set({ purchaseDate: event.target.value })} />
                  </Field>
                  <Field label={t('modal.add_product.expiry_date_label', 'Expires on')}>
                    <input className={inputClass} type="date" value={form.expiryDate} onChange={(event) => set({ expiryDate: event.target.value })} />
                  </Field>
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <details className="form-details" open={!!(form.shortCode || form.packSize || form.packLabel)}>
              <summary>{t('modal.add_product.short_code_label', 'Short code')} · {t('modal.add_product.pack_name', 'Pack size')}</summary>
              <div className="form-grid is-3">
                <Field label={t('modal.add_product.short_code_label', 'Short code')} hint={t('modal.add_product.short_code_placeholder', 'Type this at the counter to add the product.')}>
                  <input className={inputClass} value={form.shortCode} onChange={(event) => set({ shortCode: event.target.value })} placeholder={t('modal.add_product.short_code_placeholder', 'e.g. TS1')} />
                </Field>
                <Field label={t('modal.add_product.pack_size', '{{unit}} per pack', { unit: form.unit })} hint={t('modal.add_product.packs_hint', 'How many {{unit}} make one pack.', { unit: form.unit })}>
                  <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.packSize} onChange={(event) => set({ packSize: event.target.value })} />
                </Field>
                <Field label={t('modal.add_product.pack_name', 'Pack label')}>
                  <input className={inputClass} value={form.packLabel} onChange={(event) => set({ packLabel: event.target.value })} placeholder={t('modal.add_product.pack_name_placeholder', 'e.g. case, strip')} />
                </Field>
              </div>
            </details>
          </Card>
        </div>

        <aside className="form-aside">
          <Card className="form-summary">
            <p className="shop-kicker">{productId ? t('common.saving', 'Saving changes to') : t('modal.add_product.title', 'Adding')}</p>
            <p className="form-summary-name">{form.name.trim() || t('modal.add_product.title', 'New product')}</p>
            <div className="grid gap-2">
              <p className="form-summary-row"><span>{t('modal.add_product.category_label', 'Category')}</span><b>{labeledL1(form.category, (key) => t(key, key))}{form.subcategory ? ` · ${labeledL2(form.category, form.subcategory, (key) => t(key, key))}` : ''}</b></p>
              <p className="form-summary-row"><span>{t('modal.add_product.selling_price_label', 'Sells at')}</span><b className="num">{selling == null ? t('pos.set_price', 'Price at counter') : `${formatINR(selling)} / ${form.unit}`}</b></p>
              {form.mrp !== '' ? <p className="form-summary-row"><span>{t('modal.product_detail.detail_mrp', 'MRP')}</span><b className="num">{formatINR(Number(form.mrp))}</b></p> : null}
              {!productId ? (
                <p className="form-summary-row"><span>{t('modal.add_product.quantity_label', 'Opening stock')}</span><b className="num">{form.trackStock ? formatQty(opening, form.unit) : t('pos.no_stock_tracking', 'Not tracked')}</b></p>
              ) : null}
              {form.barcode.trim() ? <p className="form-summary-row"><span>{t('modal.add_product.barcode_label', 'Barcode')}</span><b className="num">{form.barcode.trim()}</b></p> : null}
            </div>
            {!hideCost && marginPct != null ? (
              <div className={cx('form-margin', marginPct < 0 && 'is-negative')}>
                {t('modal.add_product.margin_line', '{{pct}}% margin · {{margin}} per {{unit}}', { pct: marginPct.toFixed(1), margin: formatINR(netSelling! - cost!), unit: form.unit })}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Button type="submit" size="lg" block disabled={!canSave}>{pending ? t('common.saving', 'Saving…') : productId ? t('modal.add_product.button_update', 'Save changes') : t('modal.add_product.button_save', 'Save product')}</Button>
              {!productId && !onCreated ? (
                <Button tone="ghost" block disabled={!canSave} onClick={() => void handleSubmit(true)}>{uiText("Save and add another")}</Button>
              ) : null}
            </div>
            {!form.name.trim() ? <p className="text-center text-xs text-faint">{t('modal.add_product.alert_name_required', 'A name is required.')}</p> : null}
          </Card>
        </aside>
      </div>
    </form>
  );
}
