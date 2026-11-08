'use client';
import {CounterCamera} from '../counter-scanner';
import {ProductImageEditor,useProductImageEditor} from '../product-image-editor';
import {useProductSaveRecovery} from '../use-product-save-recovery';
import {useProductPhotoLeave} from '../use-product-photo-leave';
import {useProductEditorFields} from '../../../lib/shop/product-images/use-editor-fields';
import {productFormTaxPatch,restoredTaxWasEdited} from '../../../lib/shop/product-images/product-tax-intent';

import {barcodeErrorKey} from '../../../lib/shop/barcodes/client';
import { useGstText as useUiText } from "../gst-ui";
import { TaxFields, Check, TextField, useGstText } from '../gst-ui';
import type { ProductTax } from '../../../lib/shop/gst-types';
import { discountedBuyingPrice, productPriceBreakdown } from '../../../lib/shop/gst-core/product-gross-price';
import { validateProductTaxDraft } from '../../../lib/shop/gst-core/gst';
import { EN_FALLBACK } from '../../../lib/shop/en-fallback';


import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import { enabledL1, isAllowedL2, l2ForL1, labeledL1, labeledL2, l2ItemType, remapProductL1 } from '../../../lib/shop/catalog';
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
  depletionOrder: "expiry" | "fifo";
  packPrice: string;
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
    trackStock: l2ItemType(category, subcategory) !== "service",
    depletionOrder: "expiry",
    packPrice: "",
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
  const [photoReset,setPhotoReset]=useState(0);
  const formSlot=JSON.stringify([productId??'new',params.get('buyListItemId'),onCreated?'embedded':'route']);
  const media=useProductImageEditor(productId,photoReset,formSlot);
  const [preparingPhoto,setPreparingPhoto]=useState(false);
  const [uncertainOutcome,setUncertainSave]=useState(false);
  const saveIntent=useProductSaveRecovery(formSlot);
  const uncertainSave=uncertainOutcome||!!saveIntent.pending;
  const createdResult=useRef<Awaited<ReturnType<typeof api.addProduct>>|null>(null);
  useEffect(()=>{createdResult.current=null;setUncertainSave(false);},[saveIntent.identity]);
  const [generateBarcode,setGenerateBarcode]=useState(false);
  const [cameraOn,setCameraOn]=useState(false);
  const barcodeRef=useRef<HTMLInputElement>(null);
  const formRef=useRef<HTMLFormElement>(null);
  const closeCamera=()=>{setCameraOn(false);barcodeRef.current?.focus();};
  const [draft, setDraft] = useState<Draft | null>(null);
  const initial = useMemo(() => {
    if (!shop) return null;
    const first = l1[0];
    const sub = first ? l2ForL1(first.code)[0]?.code ?? '' : '';
    if (!productId) {
      const category = params.get('category');
      const initialCategory = l1.some(c=>c.code===category) ? category! : first?.code ?? 'staples';
      return blank(initialCategory, initialCategory === first?.code ? sub : l2ForL1(initialCategory)[0]?.code ?? '', {
        name: params.get('name') ?? '',
        unit: UNITS.some(u=>u===params.get('unit')) ? params.get('unit')! : 'piece',
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
      depletionOrder: item.product.depletionOrder === "fifo" ? "fifo" : "expiry",
      shortCode: item.product.shortCode ?? '',
      packSize: item.product.packSize == null ? '' : String(item.product.packSize),
      packLabel: item.product.packLabel ?? '',
    });
  }, [item, l1, params, productId, shop]);
  const form = draft ?? initial;
  const editorFields=useProductEditorFields(form?media:{editor:null,state:null},form?{
    ...Object.fromEntries(Object.entries(form).map(([key,value])=>[key,String(value)])),purchaseDiscount:buyingDiscount,autoMrp:String(autoMrp),generateBarcode:String(generateBarcode),gstConfig:JSON.stringify(gstDraft===undefined?item?.product.gstConfig??null:gstDraft),gstEdited:String(gstDraft!==undefined),
  }:{},fields=>{
    const bool=(key:string)=>{if(!['true','false'].includes(fields[key]))throw Error('product_image_recovery_unavailable');return fields[key]==='true';};
    const tax=JSON.parse(fields.gstConfig??'null');
    if(!(UNITS as readonly string[]).includes(fields.unit))throw Error('product_image_recovery_unavailable');
    const restored=blank(fields.category??'',fields.subcategory??'');
    for(const key of Object.keys(restored) as (keyof Draft)[])if(key!=='trackStock'&&typeof fields[key]==='string')(restored as unknown as Record<string,string>)[key]=fields[key];
    restored.depletionOrder=fields.depletionOrder==='fifo'?'fifo':'expiry';restored.trackStock=bool('trackStock');setDraft(restored);setBuyingDiscount(fields.purchaseDiscount??'');setAutoMrp(bool('autoMrp'));setGenerateBarcode(bool('generateBarcode'));setGstDraft(restoredTaxWasEdited(fields.gstEdited,tax,item?.product.gstConfig??null)?tax:undefined);
  });
  const leaveGuard=useProductPhotoLeave({dirty:media.dirty||preparingPhoto||uncertainSave,busy:pending,current:saveIntent.current,flush:async()=>{await media.editor?.flushRecovery();},message:t('product_images.leave_title','Leave this form?')+'\n\n'+(uncertainSave?t('product_images.save_pending','The previous save is still unconfirmed.')+'\n\n':'')+t('product_images.leave_hint','Your saved product will not change. Photo changes stay in a draft on this device. Unfinished photos may need to be selected again.'),onError:()=>setError(Error(t('opening.error.storage','The draft could not be saved on this device.')))});
  useEffect(()=>{leaveGuard.reset();},[saveIntent.identity]);

  if (!shop) return <Spinner />;
  if (!perms.canEditProducts) return <NoAccess what={uiText("Only an owner or manager can add or edit products.")} />;
  if (productId && existing.isLoading) return <Spinner label={uiText("Loading product")} />;
  if (productId && existing.error) return <div className="shop-page"><Notice error={existing.error}/><Button onClick={()=>void existing.refetch()}>{t("common.retry", "Try again")}</Button></div>;
  if (productId && !item) return <Card><p>{uiText("That product was not found.")}</p></Card>;
  if (!form) return <Spinner />;

  const subs = l2ForL1(form.category);
  const set = (partial: Partial<Draft>) => setDraft({ ...form, ...partial });
  const dirty = (initial ? JSON.stringify(form) !== JSON.stringify(initial) : true)||gstDraft!==undefined||buyingDiscount!==''||autoMrp||generateBarcode||media.dirty;
  const selling = form.sellingPrice === '' ? null : Number(form.sellingPrice);
  const gstConfig=gstDraft===undefined?item?.product.gstConfig??null:gstDraft;
  const priceBreakdown=productPriceBreakdown(form.sellingPrice,gstConfig,pos.data?.gstSettings);
  const cost = discountedBuyingPrice(form.purchasePrice,buyingDiscount);
  const netSelling=priceBreakdown?.net??selling;
  const marginPct = netSelling != null && cost != null && netSelling > 0 ? ((netSelling - cost) / netSelling) * 100 : null;
  const opening = Number(form.initialStock || 0);
  const canSave = !pending && !media.busy && !preparingPhoto && saveIntent.ready && !saveIntent.error && (uncertainSave||editorFields.ready&&!!form.name.trim() && !!form.subcategory && dirty && !pos.isPending && !pos.error);

  const handleSubmit = async (addAnother = false) => {
    if(pending||!saveIntent.ready||saveIntent.error||(!uncertainSave&&!editorFields.ready))return;
    if(!uncertainSave){
    if (!form.name.trim()) { setError(Error(t('modal.add_product.alert_name_required','A name is required.'))); return; }
    if ([form.sellingPrice,form.mrp,form.initialStock,form.packSize,form.packPrice].some(v=>v!=null&&v!==''&&(!/^\d+(\.\d+)?$/.test(v)||!Number.isFinite(Number(v))||Number(v)<0)) || (form.packSize!==''&&Number(form.packSize)<=0)) {
      setError(Error(t('productform.invalid_numbers','Enter valid, non-negative prices and quantities. Pack size must be greater than zero.'))); return;
    }
    if (!isAllowedL2(shop.category, shop.subtype, form.category, form.subcategory)) {
      setError(new Error(t('productform.invalid_category','Choose a category available for this shop.')));
      return;
    }
    if(!hideCost && form.purchasePrice!=='' && cost===null){setError(Error(text('Enter a valid buying price and a discount between 0 and 100%.')));return;}
    if(autoMrp&&!priceBreakdown){setError(Error(text('Confirm selling price and GST before calculating MRP.')));return;}
    const threshold=Number(form.minStockLevel||0);
    if(!Number.isInteger(threshold)||threshold<0||threshold>1000000000){setError(Error(t('imports.issue.number_invalid','Enter a non-negative whole number for the reorder level.')));return;}
    if(gstConfig){try{validateProductTaxDraft(gstConfig);}catch(e){setError(e);return;}}
    if(form.mrp&&priceBreakdown&&priceBreakdown.gross>Number(form.mrp)&&!autoMrp){setError(new Error(text('Selling price including GST must not exceed MRP.')));return;}
    }
    const buyListItemId = onCreated ? null : params.get('buyListItemId');
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      barcode: item?.product.barcode ?? (form.barcode.trim() || null),
      category: form.category,
      subcategory: form.subcategory,
      unit: form.unit,
      minStockLevel: Number(form.minStockLevel || 0),
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      ...productFormTaxPatch(!productId,gstDraft!==undefined,gstConfig),
      mrp: autoMrp&&priceBreakdown?priceBreakdown.gross:form.mrp === '' ? null : Number(form.mrp),
      trackStock: form.trackStock,
      depletionOrder: form.trackStock ? (form.depletionOrder === "fifo" ? "fifo" : "expiry") : "expiry",
      shortCode: form.shortCode.trim() || null,
      packSize: form.packSize === '' ? null : Number(form.packSize),
      packLabel: form.packLabel.trim() || null,
    };
    if (!hideCost && form.purchasePrice !== '') body.purchasePrice = cost;
    setPending(true);
    setError(null);
    try {
      if(media.busy||preparingPhoto)throw Error(t('product_images.pending','Finish or remove failed uploads before saving.'));
      const imageManifest=uncertainSave?undefined:await media.manifest();
      const intent=saveIntent.retry()??(!productId||imageManifest?await saveIntent.prepare({...body,...(!productId?{initialStock:form.trackStock?Number(form.initialStock||0):0,generateBarcode:generateBarcode&&!form.barcode.trim(),supplier:form.supplier||undefined,expiryDate:form.expiryDate||undefined,purchaseDate:form.purchaseDate||undefined,batchNumber:form.batchNumber||undefined}:{}),...(imageManifest?{imageManifest}:{})}):null);
      if (productId) {
        await api.updateProduct(shop.id, productId, intent??body);
        if(!saveIntent.current())return;
        await media.clearRecovery();
        await saveIntent.succeeded();
        await Promise.all([queryClient.invalidateQueries({queryKey:['productMedia']}),queryClient.invalidateQueries({queryKey:['productImages']}),queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] })]);
        if(!saveIntent.current())return;
        leaveGuard.allow();router.push(`/shop/products/${productId}`);
        return;
      }
      body.generateBarcode=generateBarcode&&!form.barcode.trim();
      body.initialStock = form.trackStock ? Number(form.initialStock || 0) : 0;
      if (form.supplier) body.supplier = form.supplier;
      if (form.expiryDate) body.expiryDate = form.expiryDate;
      if (form.purchaseDate) body.purchaseDate = form.purchaseDate;
      if (form.batchNumber) body.batchNumber = form.batchNumber;
      const created=createdResult.current??await api.addProduct(shop.id,intent??body);
      if(!saveIntent.current())return;
      createdResult.current=created;
      if (buyListItemId) await api.updateBuyList(shop.id, buyListItemId, { status: 'stocked', productId: created.product.id });
      await Promise.all([queryClient.invalidateQueries({queryKey:['productMedia']}),queryClient.invalidateQueries({queryKey:['productImages']}),queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] })]);
      if(!saveIntent.current())return;
      await media.clearRecovery();
      if (onCreated) {
        if(!saveIntent.current())return;
        leaveGuard.allow();
        await onCreated(created.product.id);
        await saveIntent.succeeded();
        return;
      }
      if (addAnother) {
        leaveGuard.reset();
        setNotice(t('modal.add_product.toast_added', '{{name}} added to inventory', { name: created.product.name }));
        await saveIntent.succeeded();createdResult.current=null;setUncertainSave(false);setPhotoReset(n=>n+1);
        setGenerateBarcode(false);
        setDraft(blank(form.category, form.subcategory, { unit: form.unit }));setGstDraft(undefined);setBuyingDiscount('');setAutoMrp(false);
        window.scrollTo({ top: 0 });
        return;
      }
      await saveIntent.succeeded();leaveGuard.allow();router.push(`/shop/products/${created.product.id}`);
    } catch (caught) {
      if(!saveIntent.current())return;
      if(!createdResult.current)await saveIntent.failed(caught);setUncertainSave(!!saveIntent.retry()||!!createdResult.current);
      setError(caught);
    } finally {
      setPending(false);
    }
  };

  const money = (value: string, onChange: (next: string) => void, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <div className="shop-input-wrap">
        <span className="shop-input-prefix">₹</span>
        <input aria-label={label} className={cx(inputClass, 'num')} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" />
      </div>
    </Field>
  );

  return (
    <form
      ref={formRef}
      className="shop-page product-form-workspace"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <PageHeader
        kicker={t('products.title', 'Catalog')}
        title={productId ? t('modal.add_product.title_edit', 'Edit product') : t('modal.add_product.title', 'Add product')}
        description={productId ? t('modal.add_product.edit_note', 'Stock and batch details are managed from the product page.') : t('productform.intro','Start with the product. Set its price and stock before saving.')}
        actions={<Button onClick={()=>void leaveGuard.leave(()=>{if(onCancel)onCancel();else router.push(productId?`/shop/products/${productId}`:'/shop/products');})} disabled={pending} tone="quiet" size="sm">{t('common.cancel', 'Cancel')}</Button>}
      />
      {(error as {code?:string}|null)?.code==='product_image_conflict'?<p role="alert" className="shop-notice">{t('product_images.conflict','Photos changed on another device. Reload and review before saving.')}</p>:error&&(error as {code?:string}).code?.startsWith('barcode_')?<p role="alert">{t(barcodeErrorKey(error),barcodeErrorKey(error))}</p>:<Notice error={error} />}

      {uncertainSave?<p role="alert">{t("product_images.save_pending","The previous save is still unconfirmed. Retry it to finish before editing further.")}</p>:null}
      {saveIntent.pending?<p>{String(saveIntent.pending.name??'')}</p>:null}
      {saveIntent.error||editorFields.error?<p role="alert">{t('opening.error.storage',"The saved request could not be verified. Keep this device's data and check recovery before continuing.")}</p>:null}
      <nav className="product-form-index" aria-label={t('productform.sections','Product form sections')}>
        {[['identity',t('modal.product_detail.section_details','Details')],['pricing',text('Prices & GST')],['stock',t('productform.stock','Stock')],['photos',t('product_images.title','Product photos')]].map(([id,label],index)=><a key={id} href={'#product-form-'+id}><span aria-hidden="true">0{index+1}</span>{label}</a>)}
      </nav>
      <div className="form-layout">
        <fieldset className="form-stack" style={{border:0,padding:0,margin:0,minWidth:0}} disabled={uncertainSave||!saveIntent.ready} inert={uncertainSave||!saveIntent.ready}>

          <Card className="product-form-section" id="product-form-identity">
            <div>
              <h2 className="shop-section-title">{t('modal.product_detail.section_details', 'Details')}</h2>
            </div>
            <div className="form-grid">
              <Field label={t('modal.add_product.name_label', 'Name')}>
                <input className="shop-field is-lg" value={form.name} onChange={(event) => set({ name: event.target.value })} required placeholder={t('modal.add_product.name_placeholder', 'e.g. Tata Salt 1 kg')} />
              </Field>
              <div className="form-grid is-2">
                <Field label={t('modal.add_product.category_label', 'Category')}>
                  <select className={inputClass} value={form.category} onChange={(event) => set({ category: event.target.value, subcategory: l2ForL1(event.target.value)[0]?.code ?? '', trackStock: l2ItemType(event.target.value, l2ForL1(event.target.value)[0]?.code) !== 'service' })}>
                    {l1.map((row) => <option key={row.code} value={row.code}>{labeledL1(row.code, (key) => t(key, key))}</option>)}
                  </select>
                </Field>
                <Field label={t('modal.add_product.subcategory_label', 'Sub-category')}>
                  <select className={inputClass} value={form.subcategory} onChange={(event) => set({ subcategory: event.target.value, trackStock: l2ItemType(form.category, event.target.value) !== 'service' })} required>
                    <option value="">{t("modal.add_product.subcategory_placeholder", "Choose a sub-category")}</option>
                    {subs.map((row) => <option key={row.code} value={row.code}>{labeledL2(form.category, row.code, (key) => t(key, key))}</option>)}
                  </select>
                </Field>
              </div>
              {!productId&&!form.barcode.trim()?<label className="import-confirm"><input type="checkbox" checked={generateBarcode} onChange={e=>setGenerateBarcode(e.target.checked)}/><span>{t('barcodes.generate_on_save','No barcode? Generate one when saving')}</span></label>:null}
              {item?.product.barcode?<Button tone="ghost" href={'/shop/products/barcodes?productId='+productId}>{t('barcodes.manage','Manage barcode')}</Button>:null}
              <div className="form-grid is-2">
                <Field label={t('modal.add_product.barcode_label', 'Barcode')} hint={t('modal.add_product.barcode_placeholder', 'Scan or enter barcode')}>
                  <input ref={barcodeRef} aria-label={t('modal.add_product.barcode_label','Barcode')} className={cx(inputClass, 'num')} value={form.barcode} onChange={(event) => set({ barcode: event.target.value })} readOnly={!!item?.product.barcode} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();}}}/>
                  {!item?.product.barcode?<button type="button" className="shop-btn shop-btn-quiet" disabled={pending} aria-expanded={cameraOn} onClick={()=>setCameraOn(v=>!v)}>{t('sellweb.camera','Camera')}</button>:null}
                </Field>
                <Field label={t('modal.add_product.unit_label', 'Unit')}>
                  <select className={inputClass} value={form.unit} onChange={(event) => set({ unit: event.target.value })}>
                    {UNITS.map((unit) => <option key={unit} value={unit}>{t(unit === 'packet' ? 'unit_picker.pack' : unit === 'L' ? 'unit_picker.liter' : unit === 'mL' ? 'unit_picker.ml' : `unit_picker.${unit}`, unit)}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            {cameraOn?<CounterCamera onCode={barcode=>{set({barcode});closeCamera();}} onClose={closeCamera}/>:null}
          </Card>

          <Card className="product-form-section" id="product-form-pricing">
            <h2 className="shop-section-title">{text('Prices & GST')}</h2>
            {!hideCost?<div className="form-grid is-2">
              {money(form.purchasePrice,next=>set({purchasePrice:next}),text('Buying price'),text('Your cost before the buying discount.'))}
              <TextField label={text('Buying discount (%)')} type="number" value={buyingDiscount} onChange={setBuyingDiscount}/>
              {cost!=null?<p className="shop-hint">{text('Effective buying cost')}: {formatINR(cost)}</p>:null}
            </div>:null}
            {money(form.sellingPrice,next=>set({sellingPrice:next}),text('Selling price'),pos.data?.gstSettings?.registration === 'regular' ? text('GST is calculated on this selling price after discounts.') : undefined)}
            <Notice error={pos.error}/>
            <p className="shop-hint">{t(!pos.data?.gstSettings || pos.data.gstSettings.registration === 'unknown' ? 'gst.product_price_unknown' : pos.data.gstSettings.registration !== 'regular' ? 'gst.product_price_no_collection' : pos.data.gstSettings.priceMode === 'exclusive' ? 'gst.product_price_exclusive' : 'gst.product_price_inclusive', EN_FALLBACK[!pos.data?.gstSettings || pos.data.gstSettings.registration === 'unknown' ? 'gst.product_price_unknown' : pos.data.gstSettings.registration !== 'regular' ? 'gst.product_price_no_collection' : pos.data.gstSettings.priceMode === 'exclusive' ? 'gst.product_price_exclusive' : 'gst.product_price_inclusive'])}</p>
            <TaxFields value={gstConfig} onChange={setGstDraft}/>
            {priceBreakdown?<div className="gst-price-preview"><span>{text('Before GST')} <b>{formatINR(priceBreakdown.net)}</b></span><span>{text('GST')} <b>{formatINR(priceBreakdown.tax)}</b></span><span>{text('Customer pays')} <b>{formatINR(priceBreakdown.gross)}</b></span></div>:<p className="shop-hint">{text('Set up shop GST and confirm the product tax details to see the GST calculation.')}</p>}
            <Check label={text('Calculate MRP from selling price and GST')} checked={autoMrp} onChange={setAutoMrp}/>
            {autoMrp?<p>{text('Calculated MRP')}: {priceBreakdown?formatINR(priceBreakdown.gross):'—'}</p>:money(form.mrp,next=>set({mrp:next}),t('productform.mrp','MRP'),t('gst.mrp_help',EN_FALLBACK['gst.mrp_help']))}
          </Card>

          <Card className="product-form-section" id="product-form-stock">
            <div>
              <h2 className="shop-section-title">{t('productform.stock', 'Stock')}</h2>
              <p className="shop-section-sub">{productId ? t('modal.add_product.edit_note', 'Add or edit batches from the product page.') : t('modal.add_product.section_initial_batch', 'Opening stock creates the first batch.')}</p>
            </div>
            {form.trackStock?<Field label={t('modal.add_product.depletion_order_label','Sell stock by')} hint={t('modal.add_product.depletion_order_hint','Which batch goes out first when you sell this product')}>
              <select className={inputClass} value={form.depletionOrder} onChange={e=>set({depletionOrder:e.target.value as 'expiry'|'fifo'})}>
                <option value="expiry">{t('modal.add_product.depletion_order_expiry','Soonest expiry')}</option>
                <option value="fifo">{t('modal.add_product.depletion_order_fifo','Oldest stock')}</option>
              </select>
            </Field>:null}
            <div className="form-grid is-2">
              <label className="shop-toggle">
                <span>
                  {t('modal.add_product.track_stock_label', 'Track stock')}
                  <span className="block text-xs text-muted">{t('modal.add_product.track_stock_hint', 'Turn off for services or items you never count.')}</span>
                </span>
                <input type="checkbox" className="shop-field" checked={form.trackStock} onChange={(event) => set({ trackStock: event.target.checked })} />
              </label>
              {form.trackStock ? <Field label={t('modal.add_product.min_stock_label', 'Low-stock alert at')} hint={t('modal.product_detail.detail_min_stock', 'Alerts when on-hand falls to this many {{unit}}.', { unit: form.unit })}>
                <input className={cx(inputClass, 'num')} inputMode="numeric" value={form.minStockLevel} onChange={(event) => set({ minStockLevel: event.target.value })} />
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

          <Card className="product-form-section">
            <details className="form-details" open={!!(form.shortCode || form.packSize || form.packLabel)}>
              <summary>{t('modal.add_product.short_code_label', 'Short code')} · {t('modal.add_product.packs_label', 'Buy in packs')}</summary>
              <div className="form-grid is-3">
                <Field label={t('modal.add_product.short_code_label', 'Short code')} hint={t('modal.add_product.short_code_placeholder', 'Type this at the counter to add the product.')}>
                  <input className={inputClass} value={form.shortCode} onChange={(event) => set({ shortCode: event.target.value })} placeholder={t('modal.add_product.short_code_placeholder', 'e.g. TS1')} />
                </Field>
                <Field label={t('modal.add_product.pack_size', '{{unit}} per pack', { unit: form.unit })} hint={t('modal.add_product.packs_hint', 'How many {{unit}} make one pack.', { unit: form.unit })}>
                  <input className={cx(inputClass, 'num')} inputMode="decimal" value={form.packSize} onChange={(event) => {const packSize=event.target.value;set({packSize,...(Number(packSize)>0&&Number(form.packPrice)>0?{purchasePrice:String(Math.round(Number(form.packPrice)/Number(packSize)*100)/100)}:{})});}} />
                </Field>
                <Field label={t('modal.add_product.pack_name', 'Pack label')}>
                  <input className={inputClass} value={form.packLabel} onChange={(event) => set({ packLabel: event.target.value })} placeholder={t('modal.add_product.pack_name_placeholder', 'e.g. case, strip')} />
                </Field>
              </div>
              {!hideCost?<div className="product-form-pack-price">
                {money(form.packPrice,packPrice=>set({packPrice,...(Number(form.packSize)>0&&Number(packPrice)>0?{purchasePrice:String(Math.round(Number(packPrice)/Number(form.packSize)*100)/100)}:{})}),t('modal.add_product.pack_price','Price per {{label}}',{label:form.packLabel||t('modal.add_product.pack_default_label','pack')}),t('modal.add_product.packs_hint','Stock and prices stay per {{unit}}.',{unit:form.unit}))}
                {Number(form.packSize)>0&&Number(form.packPrice)>0?<p className="shop-hint">{t('modal.add_product.pack_per_unit','{{price}} per {{unit}}',{price:formatINR(Math.round(Number(form.packPrice)/Number(form.packSize)*100)/100),unit:form.unit})}</p>:null}
              </div>:null}
            </details>
          </Card>
          <Card className="product-form-section" id="product-form-photos"><ProductImageEditor media={media} name={form.name} disabled={pending||uncertainSave} onBusyChange={setPreparingPhoto} onReset={()=>setError((current:unknown)=>(current as {code?:string}|null)?.code==='product_image_conflict'?null:current)}/></Card>
        </fieldset>

        <aside className="form-aside">
          <Card className="form-summary">
            {!uncertainSave?<>
            <p className="shop-kicker">{t('productform.review','Product overview')}</p>
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
            </>:null}
          </Card>
        </aside>
      </div>
      <footer className="product-form-footer">
            <div className="product-form-save-buttons">
              <Button type="submit" size="lg" block disabled={!canSave}>{pending ? t('common.saving', 'Saving…') : uncertainSave?t('product_images.retry','Retry'):productId ? t('modal.add_product.button_update', 'Save changes') : t('modal.add_product.button_save', 'Save product')}</Button>
              {!productId && !onCreated ? (
                <Button tone="ghost" block disabled={!canSave} onClick={() => {if(formRef.current?.reportValidity())void handleSubmit(true);}}>{uiText("Save and add another")}</Button>
              ) : null}
            </div>
            {!uncertainSave&&(!form.name.trim()||!form.subcategory) ? <p className="text-center text-xs text-muted">{!form.name.trim()?t('modal.add_product.alert_name_required', 'A name is required.'):t('modal.add_product.subcategory_placeholder','Choose a sub-category')}</p> : null}
      </footer>
    </form>
  );
}
