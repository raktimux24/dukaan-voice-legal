'use client';
import {ProductImage,ProductImageById} from '../product-image';
import {serialScanner} from '../../../lib/shop/counter/scanner';
import {UsbCounterScanner,CounterCamera} from '../counter-scanner';
import {CounterStatus} from '../counter-status';
import {isBarcodeQuery,cachedBarcodeMatches} from '../../../lib/shop/barcodes/contract';
import {barcodeErrorKey} from '../../../lib/shop/barcodes/client';

import {prepareOfflineInvoices} from '../../../lib/shop/invoice-preparation';
import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { labeledL1 } from '../../../lib/shop/catalog';
import { useCart, lineGross, lineDiscount, type CartLine } from '../../../lib/shop/cart';
import { searchSellCatalog, sellAmount, sellBillPreview, sellStockShortfalls } from '../../../lib/shop/sell';
import { matchHomeDemand } from '../../../lib/shop/home';
import { formatINR } from '../../../lib/shop/money';
import type { InventoryItem } from '../../../lib/shop/types';
import { chipLabel, convert, defaultChips, altUnit, formatQty, unitLabel, isWeightOrVolume, r3, stepFor } from '../../../lib/shop/units';
import { useShop } from '../context';
import { CustomerAttach } from '../customer-attach';
import { Button, Chip, Glyph, Kbd, Notice, Spinner, cx, inputClass } from '../ui';
import { VoiceSheet } from '../voice-sheet';

const BARCODE = /^\d{4,}$/;

export function SellScreen() {
  const uiText = useUiText();
  const { api, shop, userId, perms, hideCost, offline, setNotice, t } = useShop();
  const shopId = shop?.id ?? '';
  const cartApi = useCart(userId, shop?.id ?? null);
  const posSettings=useQuery({queryKey:["pos",shopId],enabled:!!shopId,networkMode:'always',queryFn:()=>api.getPosSettings(shopId)});
  useQuery({
    queryKey:['offline-invoice-preparation',userId,shopId,posSettings.data?.gstSettings?.version],
    enabled:!!shopId&&posSettings.data?.gstAvailable===true&&['regular','composition'].includes(posSettings.data.gstSettings?.registration??''),
    queryFn:()=>prepareOfflineInvoices(api,shopId),
    retry:false,
    refetchOnWindowFocus:false,
    // Retry successful capabilities before expiry; failed provisioning waits for an explicit revisit.
    refetchInterval:q=>q.state.status==='success'&&q.state.data?Math.max(60000,Math.min(15*60000,Date.parse(q.state.data.expiresAt)-Date.now()-30000)):false,
  });
  const coherentTax=posSettings.data?.gstAvailable===true&&posSettings.data.gstSettings?.registration==="regular";
  const catalog = useQuery({
    queryKey: ['catalog', shopId, hideCost, coherentTax],
    enabled: !!shopId&&!!posSettings.data,
    networkMode:'always',
    queryFn: () => api.getAllInventory(shopId, hideCost, coherentTax),
  });
  const boughtWith = useQuery({
    queryKey: ['nudges', shopId, 'checkout'],
    enabled: !!shopId && cartApi.cart.lines.length > 0,
    queryFn: () => api.getNudges(shopId, 'checkout'),
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null),usbRef=useRef<HTMLInputElement>(null);
  const highlightedProduct = useRef<HTMLButtonElement>(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [highlight, setHighlight] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [priceFor, setPriceFor] = useState<InventoryItem | null>(null);
  const [priceBusy, setPriceBusy] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(true);
  const [visibleCount, setVisibleCount] = useState(60);
  const [noting, setNoting] = useState(false);
  const latestQuery = useRef(query);
  latestQuery.current = query;
  const [cameraOn, setCameraOn] = useState(false);
  const [scanMode, setScanMode] = useState<'bill' | 'stock'>('bill');
  const searchParams = useSearchParams();
  const scanRequested = useRef(false);
  useEffect(() => {
    if (searchParams.get('scan') === '1' && !scanRequested.current) {
      scanRequested.current = true;
      setCameraOn(true);
      router.replace('/shop/sell', { scroll: false });
    }
  }, [searchParams, router]);
  const [usbOn,setUsbOn]=useState(false),scanQueue=useRef(serialScanner()),alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
  const closeCamera=()=>{setCameraOn(false);searchRef.current?.focus()};
  const [picker, setPicker] = useState<{ productId: string; item: InventoryItem; value: number; source: 'manual' | 'scan' } | null>(null);

  const items = useMemo(() => (catalog.data ?? []).map(item=>({...item,quantity:Math.max(0,item.quantity-(item.reservedQuantity??0)),reservedQuantity:0})).filter((item) => item.product.isActive !== false), [catalog.data]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.product.category)) seen.set(item.product.category, labeledL1(item.product.category, (key) => t(key, key)));
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items, t]);

  const allMatches = useMemo(() => searchSellCatalog(items, query), [items, query]);
  const matches = useMemo(() => searchSellCatalog(items, query, category), [items, query, category]);
  const hits = matches.slice(0, visibleCount);
  const unpricedCount = items.filter(item => item.product.sellingPrice == null).length;
  const canNote = !cartApi.pending && perms.canSell && catalog.isSuccess && !catalog.isError && posSettings.isSuccess && !posSettings.isError && query.trim().length >= 2 && !allMatches.length;
  const demand = useQuery({queryKey:['demandTerms',shopId],enabled:!!shopId&&canNote&&!offline,queryFn:()=>api.getDemandTerms(shopId)});
  const noted = canNote ? matchHomeDemand(demand.data?.terms,query) : null;

  useEffect(() => {
    setHighlight(0);
    setVisibleCount(60);
  }, [query, category]);

  useEffect(() => {
    if (query) highlightedProduct.current?.scrollIntoView?.({block:'nearest'});
  }, [highlight, query]);

  const [ask, setAsk] = useState<'clear' | 'short' | null>(null);
  const [flash, setFlash] = useState<{ productId: string; name: string; seq: number } | null>(null);
  const counterOpen = !!shopId && !cartApi.pending && perms.canSell;
  const sheetOpen = browseOpen || !!picker || !!priceFor || !!ask || cameraOn || usbOn;
  // A USB barcode gun types into whatever has focus: start every visit on the search box.
  useEffect(() => {
    if (counterOpen && !sheetOpen) searchRef.current?.focus();
    // Only on arrival and when the counter becomes usable; later moves keep their own focus.
  }, [counterOpen]);
  useEffect(() => {
    if (!counterOpen || sheetOpen) return;
    const refocus = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key !== '/' && event.key !== 'F2') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', refocus);
    return () => document.removeEventListener('keydown', refocus);
  }, [counterOpen, sheetOpen]);
  const marked = (item: InventoryItem) => setFlash(current => ({ productId: item.productId, name: item.product.name, seq: (current?.seq ?? 0) + 1 }));


  if (!shop) return <Spinner label={uiText("Loading shop")} />;

  const {totals,reviewTax,context:taxContext} = sellBillPreview(cartApi.cart,posSettings.isError?undefined:posSettings.data,shopId);
  const lineCount = cartApi.cart.lines.length;
  const locked = !!cartApi.pending || !perms.canSell;
  const shortfalls = sellStockShortfalls(cartApi.cart,items);
  const amountLabel = reviewTax ? t('gst.tax_details','Review tax details') : formatINR(totals.total);
  const inCartIds = new Set(cartApi.cart.lines.map((line) => line.productId));
  const suggestions = (boughtWith.data?.nudges ?? [])
    .filter((nudge) => {
      const anchor = nudge.evidence?.anchorProductId ?? (typeof nudge.action?.params?.anchorProductId === 'string' ? nudge.action.params.anchorProductId : '');
      return nudge.kind === 'attach' && nudge.status === 'open' && !!nudge.productId && inCartIds.has(anchor) && !inCartIds.has(nudge.productId);
    })
    .slice(0, 3);

  const add = (item: InventoryItem,source:'manual'|'scan'='manual') => {
    if (locked) return;
    const step = stepFor(item.unit);
    const result = cartApi.addProduct(item, step >= 1 ? 1 : step,source);
    if (result.message === 'unpriced') {
      setNotice(t('pos.ask_manager_to_price','{{name}} has no price yet — ask the owner or manager to set one',{name:item.product.name}));
      return;
    }
    if (result.message) setNotice(result.message === 'out_of_stock'
      ? t('pos.out_of_stock_toast', '{{name}} is out of stock', { name: item.product.name })
      : t('pos.capped_toast', 'Only {{n}} {{unit}} of {{name}} in stock', { n: item.quantity, unit: t(`unit_picker.${item.unit}`, item.unit), name: item.product.name }));
    if (result.ok) { setError(null); marked(item); }
  };

  const lookup = (code: string) => scanQueue.current(async()=> {
    if(!alive.current||locked)return;
    setError(null);
    try {
      const cached=cachedBarcodeMatches(items,code);
      if((offline||navigator.onLine===false)&&cached.length!==1)throw Error(t('counter.offline_scan_miss',''));
      const hit=(offline||navigator.onLine===false)?{found:true,item:cached[0]}:await api.lookupBarcode(shop.id,code,hideCost);
      if(!alive.current)return;api.assertSession();
      if (scanMode === 'stock' && perms.canEditProducts) {
        setQuery('');
        if (hit.found && hit.item && hit.item.product.isActive !== false) {
          router.push(`/shop/products/${hit.item.productId}?batch=1`);
          return;
        }
        if (code.startsWith('SB-')) { setNotice(t('barcodes.error.not_found','This code is unavailable in this shop.')); return; }
        router.push(`/shop/products/new?barcode=${encodeURIComponent(code)}`);
        return;
      }
      if (hit.found && hit.item && hit.item.product.isActive !== false) {
        const availableItem = {...hit.item,quantity:Math.max(0,hit.item.quantity-(hit.item.reservedQuantity??0)),reservedQuantity:0};
        choose(availableItem,'scan');
        setQuery('');
        return;
      }
      if(code.startsWith('SB-')){setNotice(t('barcodes.error.not_found','This code is unavailable in this shop.'));return;}
      if (perms.canEditProducts) router.push(`/shop/products/new?barcode=${encodeURIComponent(code)}`);
      else setNotice(t('counter.scanner_not_found',''));
    } catch (caught) {
      if((caught as {code?:string}).code?.startsWith('barcode_'))setNotice(t(barcodeErrorKey(caught),barcodeErrorKey(caught)));else setError(caught);
    }
  });

  const handleSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, Math.max(0, hits.length - 1)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Escape') {
      setQuery('');
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (BARCODE.test(q)||isBarcodeQuery(q)||cachedBarcodeMatches(items,q).length) {
      void lookup(q);
      return;
    }
    const target = hits[highlight] ?? hits[0];
    if (!target) return;
    choose(target);
    setQuery('');
  };

  const choose = (item: InventoryItem, source: 'manual' | 'scan' = 'manual') => {
    if (locked) return;
    const tracked = item.product.trackStock !== false;
    if (tracked && item.quantity <= 0) {
      setNotice(t('pos.out_of_stock_toast', '{{name}} is out of stock', { name: item.product.name }));
      return;
    }
    if (item.product.sellingPrice == null) {
      if(perms.canEditProducts){setBrowseOpen(false);setPriceFor(item);setError(null);}
      else setNotice(t('pos.ask_manager_to_price','{{name}} has no price yet — ask the owner or manager to set one',{name:item.product.name}));
      return;
    }
    if (!isWeightOrVolume(item.unit) && !(item.product.packSize && item.product.packSize > 0)) {
      add(item,source);
      setQuery('');
      if(!browseOpen)searchRef.current?.focus();
      return;
    }
    const inCart = cartApi.cart.lines.find((line) => line.productId === item.productId);
    setBrowseOpen(false);
    setPicker({
      productId: item.productId,
      item,
      value: inCart?.quantity ?? (isWeightOrVolume(item.unit) ? stepFor(item.unit) : 1),
      source,
    });
    setError(null);
  };

  const commitPicker = () => {
    if (!picker || locked) return;
    const item = picker.item;
    const existing = cartApi.cart.lines.find((line) => line.productId === item.productId);
    if (existing) {
      const result = cartApi.setQuantity(existing.key, picker.value);
      if (result.capped) setNotice(t('pos.capped_toast', 'Only {{n}} {{unit}} of {{name}} in stock', { n: existing.available ?? 0, unit: t(`unit_picker.${existing.unit}`, existing.unit), name: existing.name }));
    } else {
      const result = cartApi.addProduct(item, picker.value, picker.source);
      if (result.message === 'unpriced') {
        setNotice(t('pos.ask_manager_to_price','{{name}} has no price yet — ask the owner or manager to set one',{name:item.product.name}));
        return;
      }
      if (result.message) setNotice(result.message === 'out_of_stock'
      ? t('pos.out_of_stock_toast', '{{name}} is out of stock', { name: item.product.name })
      : t('pos.capped_toast', 'Only {{n}} {{unit}} of {{name}} in stock', { n: item.quantity, unit: t(`unit_picker.${item.unit}`, item.unit), name: item.product.name }));
      if (!result.ok) return;
    }
    marked(item);
    setPicker(null);
    setQuery('');
    (usbOn?usbRef.current:searchRef.current)?.focus();
  };

  const savePrice = async (item: InventoryItem) => {
    if(locked||!perms.canEditProducts||priceBusy)return;
    const price = sellAmount(priceDraft[item.productId]??'');
    if (price === null) return;
    setPriceBusy(true);
    setError(null);
    try {
      await api.updateProduct(shop.id, item.productId, { sellingPrice: price });
      await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
      setPriceFor(null);
      choose({ ...item, product: { ...item.product, sellingPrice: price } });
      searchRef.current?.focus();
    } catch (caught) {
      setError(caught);
    } finally {setPriceBusy(false);}
  };

  const clearBill = () => {
    if (lineCount === 0 || locked) return;
    setAsk('clear');
  };

  const checkout = () => {
    if (!lineCount) return;
    if (!locked && shortfalls.length) { setAsk('short'); return; }
    router.push('/shop/sell/checkout');
  };
  const closeAsk = () => { setAsk(null); searchRef.current?.focus(); };
  const confirmAsk = () => {
    const kind = ask;
    setAsk(null);
    if (kind === 'clear') {
      if (lineCount === 0 || locked) return;
      cartApi.clear();
      searchRef.current?.focus();
    } else if (kind === 'short') router.push('/shop/sell/checkout');
  };
  const noteDemand = async () => {
    if(!canNote||noting||offline)return;
    const original=query,term=noted?.term??query.trim();
    setNoting(true);setError(null);
    try {
      await api.postDemand(shopId,term);
      if(!alive.current)return;
      setNotice(t('nudge.demand.noted',"Noted — we'll count how often it's asked for"));
      if(latestQuery.current===original)setQuery('');
      await queryClient.invalidateQueries({queryKey:['demandTerms',shopId]});
    } catch(caught){if(alive.current)setError(caught);}
    finally {if(alive.current)setNoting(false);}
  };

  const openBrowse = () => { setQuery(''); setCategory('all'); setBrowseOpen(true); };
  const closeBrowse = () => { setBrowseOpen(false); setQuery(''); searchRef.current?.focus(); };
  const searchResultsOpen = !!query.trim() && searchActive && !browseOpen;
  const catalogueError = (catalog.isError||posSettings.isError)?<div className="sell-read-error" role="alert"><p>{t('sellweb.load_failed','Products could not be refreshed. Retry before adding items.')}</p><Button tone="quiet" size="sm" onClick={()=>{void posSettings.refetch();void catalog.refetch()}}>{t('common.retry','Try again')}</Button></div>:null;
  const productChoices = <div className="sell-product-choices"><Notice error={error}/>{catalogueError}
        <div className="sell-catalogue-heading">
          <h2>{t('products.title','Products')} · {matches.length}</h2>
          <label><span className="sr-only">{uiText('Categories')}</span><select value={category} onChange={event=>setCategory(event.target.value)}>
            <option value="all">{t('products.all_categories','All categories')}</option>{categories.map(([code,label])=><option key={code} value={code}>{label}</option>)}
          </select></label>
        </div>
        {unpricedCount>0&&!query?<Link className="sell-unpriced" href="/shop/products?filter=unpriced"><Glyph name="alert"/><span>{t('pos.unpriced_banner','{{n}} products have no selling price — fix before selling',{n:unpricedCount})}</span><span aria-hidden="true">↗</span></Link>:null}
        {catalog.isPending&&!catalog.isError&&!posSettings.isError?<Spinner label={uiText('Loading products')}/>:null}
        <div className="pos-grid" id="sell-products" role="listbox" aria-label={uiText('Products')}>
          {hits.map((item,index)=>{
            const unpriced=item.product.sellingPrice==null,tracked=item.product.trackStock!==false,out=tracked&&item.quantity<=0;
            const inCart=cartApi.cart.lines.find(line=>line.productId===item.productId);
            return <button ref={index===highlight?highlightedProduct:undefined} key={item.id} id={`sell-product-${item.id}`} type="button" role="option" aria-selected={index===highlight&&!!query}
              disabled={locked} className={cx('pos-tile',index===highlight&&query&&'is-highlight',out&&'is-out',inCart&&'is-in-cart')} onClick={()=>choose(item)}>
              <ProductImage image={item.product.media?.cover} name={item.product.name} size={48}/>
              <span className="sell-product-copy"><span className="pos-tile-name">{item.product.name}</span>
                <span className={cx('pos-tile-qty',out&&'is-out',tracked&&item.stockStatus==='LOW'&&'is-low')}>
                  {tracked?(out?t('home.stat_out_of_stock','Out of stock'):formatQty(item.quantity,item.unit,{unitLabel:u=>unitLabel(u,t)})):t('pos.no_stock_tracking','Untracked')}
                  {item.product.shortCode?` · ${item.product.shortCode}`:''}
                </span></span>
              <span className="sell-product-price"><span className={cx('pos-tile-price num',unpriced&&'text-warning')}>{unpriced?t('pos.set_price','Set price'):formatINR(item.product.sellingPrice)}</span><small>/{unitLabel(item.unit,t)}</small></span>
              <span className={cx('sell-product-add',inCart&&'has-quantity')} aria-hidden="true">{inCart?`×${r3(inCart.quantity)}`:'+'}</span>
            </button>;
          })}
        </div>
        {matches.length>hits.length?<Button tone="quiet" onClick={()=>setVisibleCount(n=>n+60)}>{t('sellweb.more_products','Show more products')}</Button>:null}
        {catalog.isSuccess&&!catalog.isError&&!posSettings.isError&&!hits.length?<div className="sell-empty">
          <Glyph name="search"/><h2>{t(query?'pos.no_match_title':'pos.empty_catalog_title',query?'No match':'Add your first product')}</h2>
          {category!=='all'&&allMatches.length?<Button tone="quiet" onClick={()=>setCategory('all')}>{t('sellweb.all_categories','Search all categories')}</Button>:<>
            <p>{t(query?'pos.no_match_subtitle':'pos.empty_catalog_subtitle',query?'Try another name or scan a barcode.':'Add products to start making bills.')}</p>
            {noted?<p>{t('nudge.demand.already_noted','Already noted as “{{term}}” — asked {{n}}× by {{people}} this week',{term:noted.term,n:noted.asks,people:noted.people})}</p>:null}
            <div className="shop-actions">{canNote?<Button disabled={noting||offline} onClick={()=>void noteDemand()}>{noting?t('common.saving','Saving…'):noted?t('nudge.demand.count_again','Count as “{{term}}” again',{term:noted.term}):t('nudge.demand.note_it','Not in stock? Note it')}</Button>:null}
              {perms.canEditProducts?<Button tone="ghost" href={`/shop/products/new?name=${encodeURIComponent(query.trim())}`}>{t('products.add','Add product')}</Button>:null}</div>
          </>}
        </div>:null}

  </div>;

  return (
    <div className="sell-workspace sale-workspace">
      <header className="sale-heading">
        <h1>{t('pos.title','Sell')}</h1>
        <div className="shop-actions">
          <Button href="/shop/estimates?from=sell" tone="quiet" size="sm">{t('estimates.mobile.title_short','Estimates')}</Button>
          {perms.canEditProducts?<Button href="/shop/products/new" tone="ghost" size="sm">＋ {t('products.add','Add product')}</Button>:null}
        </div>
      </header>
      {cartApi.pending?<div className="sell-pending" role="status"><div><strong>{t('sellweb.pending_title','The last bill is not confirmed yet')}</strong><p>{t('sellweb.pending_help','The internet may have dropped while it was saving. Open it and check it again before the next bill, so the customer is not charged twice.')}</p></div><Button href="/shop/sell/checkout" size="sm">{t('sellweb.pending_action','Check the saved bill')}</Button></div>:null}
      <section className="sale-sheet" aria-label={uiText('Current bill')}>
        <div className="sale-sheet-heading">
          <h2>{t('bill.bill','Bill')} <span className="sale-count num">{lineCount}</span></h2>
          {!locked?<CustomerAttach presentation="dialog"/>:null}
        </div>
        <div className="sale-entry" onFocusCapture={()=>setSearchActive(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setSearchActive(false)}}>
          <div className="sale-search-row">
            <div className="pos-search">
              <span className="pos-search-icon"><Glyph name="search"/></span>
              <input ref={searchRef} className="shop-field is-lg" type="search" placeholder={t('pos.search_placeholder','Search products or short code')}
                value={query} onChange={event=>{setQuery(event.target.value);setCategory('all');setSearchActive(true)}} onKeyDown={handleSearchKey} aria-label={uiText('Find a product to sell')}
                aria-controls={query&&searchActive?'sell-products':undefined} aria-activedescendant={query&&searchActive&&hits[highlight]?`sell-product-${hits[highlight].id}`:undefined} autoComplete="off" disabled={locked}/>
              {query?<button type="button" className="sell-search-clear" aria-label={t('a11y.clear_search','Clear search')} onClick={()=>{setQuery('');searchRef.current?.focus()}}>×</button>:<span className="pos-search-hint"><Kbd>↑↓</Kbd><Kbd>{uiText('Enter')}</Kbd></span>}
            </div>
            <Button tone="ghost" onClick={openBrowse} disabled={locked}><Glyph name="package"/>{t('sellweb.browse','Browse products')}</Button>
          </div>
          {perms.canEditProducts ? <div className="shop-seg" role="tablist" aria-label={t('scanner.scan_barcode','Scan')}>
            <button type="button" role="tab" aria-selected={scanMode==='bill'} className={scanMode==='bill'?'is-active':undefined} onClick={()=>setScanMode('bill')}>{t('scanner.tab_sell','Sell')}</button>
            <button type="button" role="tab" aria-selected={scanMode==='stock'} className={scanMode==='stock'?'is-active':undefined} onClick={()=>setScanMode('stock')}>{t('scanner.tab_stock','Add stock')}</button>
          </div> : null}
          <p className="text-sm text-muted">{scanMode==='stock'&&perms.canEditProducts?t('scanner.stock_hint','Scan a product to add stock'):t('scanner.cart_hint','Scan items — each scan adds one')}</p>
          <div className="sale-input-methods" role="group" aria-label={t('sellweb.add_items','Add items')}>
            <button type="button" disabled={locked} aria-pressed={cameraOn} onClick={()=>{setQuery('');setUsbOn(false);setCameraOn(v=>!v)}}><Glyph name="scan"/>{t('sellweb.camera','Camera')}</button>
            <button type="button" disabled={locked} aria-pressed={usbOn} onClick={()=>{setQuery('');setCameraOn(false);setUsbOn(v=>!v)}}><Glyph name="barcode"/>{t('sellweb.scanner','USB scanner')}</button>
            <Link href={locked?'#':'/shop/voice?mode=sell'} aria-disabled={locked} tabIndex={locked?-1:undefined} onClick={event=>{if(locked)event.preventDefault()}}><Glyph name="mic"/>{t('a11y.voice','Voice command')}</Link>
          </div>
          {searchResultsOpen?<div className="sale-search-results">{productChoices}</div>:null}
          {usbOn?<UsbCounterScanner inputRef={usbRef} onCode={code=>void lookup(code)} onClose={()=>{setUsbOn(false);searchRef.current?.focus()}}/>:null}
          {cameraOn?<CounterCamera onCode={code=>{closeCamera();void lookup(code)}} onClose={closeCamera}/>:null}
          {!searchResultsOpen&&!browseOpen?<><Notice error={error}/>{catalogueError}</>:null}
          {catalog.isPending&&!catalog.isError&&!posSettings.isError?<Spinner label={uiText('Loading products')}/>:null}
        </div>
        <div className="sale-items">
          {lineCount>0?<div className="sale-column-head" aria-hidden="true"><span>{t('sellweb.item','Item')}</span><span>{t('sellweb.qty_label','Quantity')}</span><span>{t('sellweb.unit_price','Unit price')}</span><span>{t('sellweb.amount','Amount')}</span><span/></div>:null}
          <div className="bill-lines">
            {!lineCount?<div className="bill-empty"><Glyph name="receipt"/><h3>{t('pos.cart_empty','Nothing on the bill yet.')}</h3><p>{t('sellweb.start_help','Search above, scan a barcode or browse your products.')}</p><Button tone="ghost" onClick={openBrowse} disabled={locked}>{t('sellweb.browse','Browse products')}</Button></div>
            :cartApi.cart.lines.map((line,index)=><BillLine key={line.key} line={line} disabled={locked} canEditPrice={perms.canSell}
              flash={flash&&flash.productId===line.productId&&cartApi.cart.lines.findIndex(row=>row.productId===line.productId)===index?flash.seq:0}
              shortfall={shortfalls.some(row=>row.key===line.key)} available={items.find(item=>item.productId===line.productId)?.quantity??line.available}
              onQuantity={qty=>{if(locked)return;const result=cartApi.setQuantity(line.key,qty);if(result.capped)setNotice(t('pos.capped_toast','Only {{n}} {{unit}} of {{name}} in stock',{n:line.available??0,unit:t(`unit_picker.${line.unit}`,line.unit),name:line.name}))}}
              onPrice={price=>{if(!locked)cartApi.setPrice(line.key,price)}} onRemove={()=>{if(!locked)cartApi.removeLine(line.key)}}/>) }
          </div>
          <p className="sr-only" aria-live="polite">{flash?t('sellweb.added','Added {{name}}',{name:flash.name}):''}</p>
          {suggestions.length&&!locked?<div className="sell-suggestions"><p>{t('modal.product_detail.bought_with','Often bought with')}</p><div className="pos-chips">{suggestions.map(nudge=><Chip key={nudge.id} onClick={()=>{const match=items.find(item=>item.productId===nudge.productId);if(match)choose(match)}}>{nudge.productId?<ProductImageById productId={nudge.productId} name={nudge.title} size={24}/>:null}{nudge.title}</Chip>)}</div></div>:null}
          {lineCount>0?<div className="sale-bill-actions"><Button tone="quiet" size="sm" onClick={openBrowse} disabled={locked}>＋ {t('sellweb.add_items','Add items')}</Button><div>
            {!locked?<Link href="/shop/estimates?fromCart=1&from=sell">{t('estimates.save_cart','Save cart as estimate')}</Link>:null}
            <button type="button" disabled={locked} onClick={clearBill}>{t('sellweb.clear_bill','Clear bill')}</button>
          </div></div>:null}
        </div>
        <footer className="sale-checkout">
          <div className="sale-total">
            <span>{t('pos.total','Total')}</span><strong className={cx('num',reviewTax&&'is-review')}>{amountLabel}</strong>
            {(totals.discount>0||totals.tax&&!reviewTax)?<div className="sale-tax-summary"><span>{t('bill.subtotal','Subtotal')} {formatINR(totals.subtotal)}</span>{totals.discount>0?<span>{t('bill.discount','Discount')} −{formatINR(totals.discount)}</span>:null}{totals.tax&&!reviewTax?<span>{uiText(taxContext?.priceMode==='inclusive'?'GST included':'GST added')} {formatINR(totals.tax.tax)}</span>:null}</div>:null}
          </div>
          <div className="sale-checkout-action"><p>{t('sellweb.checkout_help','Review payment, discounts and tax at checkout.')}</p><Button size="lg" disabled={!lineCount} onClick={checkout}>{locked?uiText('Return to checkout'):t('sellweb.review_charge','Review & charge')}<span aria-hidden="true"> →</span></Button></div>
        </footer>
      </section>
      <details className="sale-recovery" open={cartApi.draft.state==='error'||!!cartApi.pending?true:undefined}><summary><span>{t('sellweb.draft_help','Draft & recovery')}</span><span>{t(`counter.draft_${cartApi.draft.state}`,'')}</span></summary><CounterStatus cart={cartApi}/></details>
      {browseOpen?<VoiceSheet title={t('sellweb.browse','Browse products')} closeLabel={t('common.close','Close')} onClose={closeBrowse}><div className="sale-catalogue-dialog">
        <p>{t('sellweb.browse_help','Select products to add them to your bill.')}</p>
        <input className="shop-field" type="search" autoFocus placeholder={t('pos.search_placeholder','Search products or short code')} aria-label={uiText('Find a product to sell')} value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={handleSearchKey}/>
        {productChoices}
        <div className="sale-catalogue-foot"><span>{t('bill.bill','Bill')} · {lineCount}<strong className="num">{amountLabel}</strong></span><Button onClick={closeBrowse}>{t('sellweb.back_to_bill','Back to bill')} →</Button></div>
      </div></VoiceSheet>:null}
      {picker?<VoiceSheet title={t('sellweb.quantity','Choose quantity')} closeLabel={t('common.close','Close')} onClose={()=>{setPicker(null);searchRef.current?.focus();}}><QtyPicker key={picker.productId} item={picker.item} value={picker.value} onChange={value=>setPicker({...picker,value})} onAdd={commitPicker}/></VoiceSheet>:null}
      {ask?<VoiceSheet title={ask==='clear'?t('pos.clear_cart_title','Remove everything from the cart?'):t('pos.short_stock_title','Not enough stock')} closeLabel={t('common.close','Close')} onClose={closeAsk}><div className="sell-confirm">
        <p>{ask==='clear'?t('sellweb.clear_body','{{n}} items will be removed from this bill.',{n:lineCount}):t('pos.short_stock_body','Stock on record is lower than the cart for: {{names}}. You can still charge — stock will show 0 until you adjust it.',{names:shortfalls.map(line=>line.name).join(', ')})}</p>
        <div className="shop-actions"><Button tone={ask==='clear'?'danger':'primary'} onClick={confirmAsk}>{ask==='clear'?t('pos.clear_cart','Clear cart'):t('sellweb.charge_anyway','Charge anyway')}</Button><Button tone="ghost" onClick={closeAsk}>{t('sellweb.keep_editing','Keep editing')}</Button></div>
      </div></VoiceSheet>:null}
      {priceFor?<VoiceSheet title={t('pos.set_price_title','Set a selling price')} closeLabel={t('common.close','Close')} onClose={()=>{if(!priceBusy)setPriceFor(null)}}><form className="sell-price-form" onSubmit={event=>{event.preventDefault();void savePrice(priceFor)}}><div className="pos-picker-product"><ProductImage image={priceFor.product.media?.cover} name={priceFor.product.name}/><h3>{priceFor.product.name}</h3></div><Notice error={error}/><label>{t('sellweb.unit_price','Unit price')}<input className={inputClass} autoFocus inputMode="decimal" value={priceDraft[priceFor.productId]??''} onChange={event=>setPriceDraft({...priceDraft,[priceFor.productId]:event.target.value})}/></label><Button type="submit" disabled={priceBusy||sellAmount(priceDraft[priceFor.productId]??'')===null}>{t('pos.save_price_add','Save price & add')}</Button></form></VoiceSheet>:null}
    </div>
  );
}

function trimQty(n: number) {
  const text = r3(n).toString();
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

function QtyPicker({
  item,
  value,
  onChange,
  onAdd,
}: {
  item: InventoryItem | null;
  value: number;
  onChange: (value: number) => void;
  onAdd: () => void;
}) {
  const uiText = useUiText();
  const { t } = useShop();
  const unit = item?.unit ?? 'piece';
  const alt = altUnit(unit);
  const [displayUnit, setDisplayUnit] = useState(unit);
  const [draft, setDraft] = useState<string | null>(null);
  if (!item) return null;
  const chips = defaultChips(unit, item.product.packSize);
  const tracked = item.product.trackStock !== false;
  const max = tracked ? item.quantity : null;
  const price = item.product.sellingPrice ?? 0;
  const clamp = (next: number) => {
    const rounded = r3(Math.max(stepFor(unit), next));
    return max != null ? Math.min(rounded, max) : rounded;
  };

  return (
    <div className="pos-picker sell-quantity-picker">
      <div className="pos-picker-head">
        <div className="pos-picker-product">
          <ProductImage image={item.product.media?.cover} name={item.product.name}/>
          <div>
          <p className="party-name">{item.product.name}</p>
          <p className="party-meta">
            {formatINR(price)} / {unit}
            {tracked ? ` · ${t('pos.in_stock_fmt','{{qty}} in stock',{qty:formatQty(item.quantity,unit,{packSize:item.product.packSize,packLabel:item.product.packLabel,unitLabel:u=>unitLabel(u,t)})})}` : ` · ${t('pos.no_stock_tracking','Untracked')}`}
          </p>
          </div>
        </div>
      </div>
      <div className="pos-chips" role="group" aria-label={uiText("Quantities")}>
        {chips.map((chip) => (
          <Chip key={chip} active={Math.abs(value - chip) < 1e-9} onClick={() => {setDraft(null);onChange(clamp(chip));}}>
            {chipLabel(chip, unit, item.product)}
          </Chip>
        ))}
      </div>
      <div className="pos-picker-step">
        <button type="button" aria-label={t('a11y.decrease', 'Decrease quantity')} onClick={() => {setDraft(null);onChange(clamp(value - stepFor(unit)));}}>−</button>
        <label><span className="sr-only">{t('sellweb.quantity','Choose quantity')}</span><input autoFocus inputMode="decimal" value={draft??trimQty(convert(value,unit,displayUnit))} onChange={event=>{const raw=event.target.value;setDraft(raw);if(/^\d+(?:\.\d{0,3})?$/.test(raw)&&Number(raw)>0)onChange(clamp(convert(Number(raw),displayUnit,unit)));}} onBlur={()=>setDraft(null)} onKeyDown={event=>{if(event.key==='Enter'&&value>0&&(draft===null||(/^\d+(?:\.\d{0,3})?$/.test(draft)&&Number(draft)>0)))onAdd();}}/><span>{displayUnit}</span></label>
        <button type="button" aria-label={t('a11y.increase', 'Increase quantity')} onClick={() => {setDraft(null);onChange(clamp(value + stepFor(unit)));}}>+</button>
        <span className="num">{formatINR(r3(value * price))}</span>
      </div>
      {alt ? (
        <div className="shop-seg" role="group" aria-label={uiText("Unit")}>
          <button type="button" className={displayUnit === unit ? 'is-active' : undefined} onClick={() => {setDraft(null);setDisplayUnit(unit)}}>{unit}</button>
          <button type="button" className={displayUnit === alt ? 'is-active' : undefined} onClick={() => {setDraft(null);setDisplayUnit(alt)}}>{alt}</button>
        </div>
      ) : null}
      <Button onClick={onAdd} disabled={!(value > 0)||draft!==null&&(!/^\d+(?:\.\d{0,3})?$/.test(draft)||Number(draft)<=0)}>{t('pos.add_to_cart', 'Add')} {chipLabel(value, unit, item.product)}</Button>
    </div>
  );
}

function BillLine({
  line,
  disabled,
  shortfall,
  available,
  canEditPrice,
  flash,
  onQuantity,
  onPrice,
  onRemove,
}: {
  flash: number;
  line: CartLine;
  disabled: boolean;
  shortfall: boolean;
  available: number | null;
  canEditPrice: boolean;
  onQuantity: (quantity: number) => void;
  onPrice: (price: number) => void;
  onRemove: () => void;
}) {
  const { t } = useShop();
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const step = stepFor(line.unit);
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = row.current;
    if (!flash || !element) return;
    element.classList.remove('is-just-added');
    void element.offsetWidth;
    element.classList.add('is-just-added');
    element.scrollIntoView?.({ block: 'nearest' });
  }, [flash]);

  const commitQty = () => {
    if (qtyDraft == null) return;
    const next = Number(qtyDraft);
    if (Number.isFinite(next) && next > 0) onQuantity(r3(next));
    setQtyDraft(null);
  };

  const commitPrice = () => {
    if (priceDraft == null) return;
    const next = sellAmount(priceDraft);
    if (next !== null) onPrice(next);
    setPriceDraft(null);
  };

  return (
    <div className="bill-line" ref={row}>
      <div className="bill-line-name"><ProductImageById productId={line.productId} name={line.name} size={42}/><div><span>{line.name}</span><small>{t(`unit_picker.${line.unit}`,line.unit)}</small>{shortfall?<p className="sell-stock-warning">{t('pos.short_stock_line','Only {{n}} {{unit}} in stock',{n:available??0,unit:t(`unit_picker.${line.unit}`,line.unit)})}</p>:null}{line.listPrice!=null&&line.price<line.listPrice?<p className="sell-price-was">{t('pos.was','was {{price}}',{price:formatINR(line.listPrice)})}</p>:null}</div></div>
      <p className="bill-line-total num">{formatINR(lineGross(line) - lineDiscount(line))}</p>
      <fieldset className="bill-line-controls" disabled={disabled}>
        <div className="sale-quantity-cell"><span className="sale-field-label">{t('sellweb.qty_label','Quantity')}</span><div className="bill-qty" aria-label={`${t('sellweb.quantity','Choose quantity')}: ${line.name}`}>
          <button type="button" aria-label={`${t('a11y.decrease','Decrease quantity')}: ${line.name}`} onClick={() => onQuantity(r3(line.quantity - step))}>−</button>
          <input
            inputMode="decimal"
            aria-label={`${t('sellweb.quantity','Choose quantity')}: ${line.name} (${t(`unit_picker.${line.unit}`,line.unit)})`}
            value={qtyDraft ?? String(r3(line.quantity))}
            onFocus={() => setQtyDraft(String(r3(line.quantity)))}
            onChange={(event) => setQtyDraft(event.target.value)}
            onBlur={commitQty}
            onKeyDown={(event) => {
              if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
            }}
          />
          <button type="button" aria-label={`${t('a11y.increase','Increase quantity')}: ${line.name}`} onClick={() => onQuantity(r3(line.quantity + step))}>+</button>
        </div>
        </div>
        <div className="sale-price-cell"><span className="sale-field-label">{t('sellweb.unit_price','Unit price')}</span><span className="bill-price">
          <span>₹</span>
          {canEditPrice ? (
            <input
              inputMode="decimal"
              aria-label={`${t('sellweb.unit_price','Unit price')}: ${line.name} (${t(`unit_picker.${line.unit}`,line.unit)})`}
              value={priceDraft ?? String(line.price)}
              onFocus={() => setPriceDraft(String(line.price))}
              onChange={(event) => setPriceDraft(event.target.value)}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <span className="num">{line.price}</span>
          )}
        </span></div>
        <button type="button" className="bill-remove" onClick={onRemove} aria-label={`${t('common.remove','Remove')}: ${line.name}`}>
          <span aria-hidden="true">×</span>
        </button>
      </fieldset>
    </div>
  );
}
