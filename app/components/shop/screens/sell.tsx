'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { catalogL1Label } from '../../../lib/shop/catalog';
import { computeTotals, useCart, type CartLine } from '../../../lib/shop/cart';
import { formatINR } from '../../../lib/shop/money';
import type { InventoryItem } from '../../../lib/shop/types';
import { chipLabel, convert, defaultChips, altUnit, formatQty, isWeightOrVolume, r3, stepFor } from '../../../lib/shop/units';
import { useShop } from '../context';
import { CustomerAttach } from '../customer-attach';
import { Button, Card, Chip, Kbd, Notice, Spinner, cx, inputClass } from '../ui';

const BARCODE = /^\d{4,}$/;

export function SellScreen() {
  const { api, shop, userId, perms, hideCost, setNotice } = useShop();
  const shopId = shop?.id ?? '';
  const cartApi = useCart(userId, shop?.id ?? null);
  const catalog = useQuery({
    queryKey: ['catalog', shopId, hideCost],
    enabled: !!shopId,
    queryFn: () => api.getAllInventory(shopId, hideCost),
  });
  const boughtWith = useQuery({
    queryKey: ['nudges', shopId, 'checkout'],
    enabled: !!shopId && cartApi.cart.lines.length > 0,
    queryFn: () => api.getNudges(shopId, 'checkout'),
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [highlight, setHighlight] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [cameraOn, setCameraOn] = useState(false);
  const [picker, setPicker] = useState<{ productId: string; value: number } | null>(null);

  const items = useMemo(() => (catalog.data ?? []).filter((item) => item.product.isActive !== false), [catalog.data]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.product.category)) seen.set(item.product.category, catalogL1Label(item.product.category));
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = category === 'all' ? items : items.filter((item) => item.product.category === category);
    if (!q) return pool.slice(0, 60);
    return pool
      .filter((item) => item.product.name.toLowerCase().includes(q) || item.product.barcode?.includes(q) || item.product.shortCode?.toLowerCase() === q)
      .sort((a, b) => {
        const aStarts = a.product.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.product.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, 60);
  }, [items, query, category]);

  useEffect(() => {
    setHighlight(0);
  }, [query, category]);

  useEffect(() => {
    const term = query.trim();
    if (!shopId || term.length < 2 || hits.length > 0) return;
    const timer = window.setTimeout(() => {
      void api.postDemand(shopId, term).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [api, hits.length, query, shopId]);

  if (!shop) return <Spinner label="Loading shop" />;

  const totals = computeTotals(cartApi.cart);
  const lineCount = cartApi.cart.lines.length;
  const inCartIds = new Set(cartApi.cart.lines.map((line) => line.productId));
  const suggestions = (boughtWith.data?.nudges ?? [])
    .filter((nudge) => {
      const anchor = nudge.evidence?.anchorProductId ?? (typeof nudge.action?.params?.anchorProductId === 'string' ? nudge.action.params.anchorProductId : '');
      return nudge.kind === 'attach' && nudge.status === 'open' && !!nudge.productId && inCartIds.has(anchor) && !inCartIds.has(nudge.productId);
    })
    .slice(0, 3);

  const add = (item: InventoryItem) => {
    const step = stepFor(item.unit);
    const result = cartApi.addProduct(item, step >= 1 ? 1 : step);
    if (result.message === 'unpriced') {
      setNotice(perms.canEditProducts ? 'Set a selling price on the tile first.' : 'Ask a manager to set the price.');
      return;
    }
    if (result.message) setNotice(result.message);
    if (result.ok) setError(null);
  };

  const lookup = async (code: string) => {
    setError(null);
    try {
      const hit = await api.lookupBarcode(shop.id, code, hideCost);
      if (hit.found && hit.item && hit.item.product.isActive !== false) {
        if (isWeightOrVolume(hit.item.unit) || (hit.item.product.packSize ?? 0) > 0) choose(hit.item);
        else add(hit.item);
        setQuery('');
        return;
      }
      if (perms.canEditProducts) router.push(`/shop/products/new?barcode=${encodeURIComponent(code)}`);
      else setNotice('No product for that barcode. Ask a manager to add it.');
    } catch (caught) {
      setError(caught);
    }
  };

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
    if (BARCODE.test(q)) {
      void lookup(q);
      return;
    }
    const target = hits[highlight] ?? hits[0];
    if (!target) return;
    if (target.product.sellingPrice == null) {
      setNotice(perms.canEditProducts ? 'Set a selling price on the tile first.' : 'Ask a manager to set the price.');
      return;
    }
    choose(target);
    setQuery('');
  };

  const choose = (item: InventoryItem) => {
    const tracked = item.product.trackStock !== false;
    if (tracked && item.quantity <= 0) {
      setNotice(`${item.product.name} is out of stock.`);
      return;
    }
    if (item.product.sellingPrice == null) {
      setNotice(perms.canEditProducts ? 'Set a selling price on the tile first.' : 'Ask a manager to set the price.');
      return;
    }
    const inCart = cartApi.cart.lines.find((line) => line.productId === item.productId);
    setPicker({
      productId: item.productId,
      value: inCart?.quantity ?? (isWeightOrVolume(item.unit) ? stepFor(item.unit) : 1),
    });
    setError(null);
  };

  const commitPicker = () => {
    if (!picker) return;
    const item = items.find((row) => row.productId === picker.productId);
    if (!item) return;
    const existing = cartApi.cart.lines.find((line) => line.productId === item.productId);
    if (existing) {
      const result = cartApi.setQuantity(existing.key, picker.value);
      if (result.capped) setNotice(`Only ${existing.available} ${existing.unit} of ${existing.name} on hand.`);
    } else {
      const result = cartApi.addProduct(item, picker.value);
      if (result.message === 'unpriced') {
        setNotice(perms.canEditProducts ? 'Set a selling price on the tile first.' : 'Ask a manager to set the price.');
        return;
      }
      if (result.message) setNotice(result.message);
      if (!result.ok) return;
    }
    setPicker(null);
    setQuery('');
    searchRef.current?.focus();
  };

  const savePrice = async (item: InventoryItem) => {
    const price = Number(priceDraft[item.productId]);
    if (!(price >= 0)) return;
    setError(null);
    try {
      await api.updateProduct(shop.id, item.productId, { sellingPrice: price });
      await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
      add({ ...item, product: { ...item.product, sellingPrice: price } });
      searchRef.current?.focus();
    } catch (caught) {
      setError(caught);
    }
  };

  const clearBill = () => {
    if (lineCount === 0) return;
    if (!window.confirm('Clear this bill?')) return;
    cartApi.clear();
    searchRef.current?.focus();
  };

  return (
    <div className="pos">
      <div className="pos-catalog">
        <div className="shop-page-head">
          <div className="shop-page-head-text">
            <p className="shop-kicker">Counter</p>
            <h1 className="shop-title">Sell</h1>
          </div>
          <div className="shop-actions">
            {perms.canEditProducts ? <Button href="/shop/products/new" tone="quiet" size="sm">Add product</Button> : null}
            <Button tone="ghost" size="sm" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? 'Close camera' : 'Scan with camera'}</Button>
          </div>
        </div>

        {cartApi.pending ? (
          <Card tight className="flex flex-wrap items-center justify-between gap-3">
            <p>A bill is waiting to finish.</p>
            <Button href="/shop/sell/checkout" tone="ghost" size="sm">Return to checkout</Button>
          </Card>
        ) : null}
        <Notice error={error} />
        {cameraOn ? <CameraScan onCode={(code) => { setCameraOn(false); void lookup(code); }} /> : null}

        <div className="pos-toolbar">
          <div className="pos-search">
            <svg className="pos-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              className="shop-field is-lg"
              placeholder="Search or scan a barcode"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKey}
              aria-label="Find a product to sell"
              autoComplete="off"
              autoFocus
            />
            <div className="pos-search-hint">
              <Kbd>↑↓</Kbd>
              <Kbd>Enter</Kbd>
            </div>
          </div>
          {categories.length > 1 ? (
            <div className="pos-chips" role="tablist" aria-label="Categories">
              <Chip active={category === 'all'} onClick={() => setCategory('all')}>All</Chip>
              {categories.map(([code, label]) => (
                <Chip key={code} active={category === code} onClick={() => setCategory(code)}>{label}</Chip>
              ))}
            </div>
          ) : null}
        </div>

        {catalog.isLoading ? <Spinner label="Loading products" /> : null}
        {picker ? <QtyPicker key={picker.productId} item={items.find((row) => row.productId === picker.productId) ?? null} value={picker.value} onChange={(value) => setPicker({ productId: picker.productId, value })} onAdd={commitPicker} onClose={() => setPicker(null)} /> : null}
        <div className="pos-grid" role="listbox" aria-label="Products">
          {hits.map((item, index) => {
            const unpriced = item.product.sellingPrice == null;
            const tracked = item.product.trackStock !== false;
            const out = tracked && item.quantity <= 0;
            const low = tracked && !out && item.stockStatus === 'LOW';
            const inCart = cartApi.cart.lines.find((line) => line.productId === item.productId);
            if (unpriced && perms.canEditProducts) {
              return (
                <div key={item.id} className={cx('pos-tile', index === highlight && query && 'is-highlight')}>
                  <p className="pos-tile-name">{item.product.name}</p>
                  <div className="grid gap-2">
                    <p className="pos-tile-qty">{formatQty(item.quantity, item.unit)} · no price</p>
                    <form
                      className="pos-tile-price-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void savePrice(item);
                      }}
                    >
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        placeholder="₹"
                        aria-label={`Selling price for ${item.product.name}`}
                        value={priceDraft[item.productId] ?? ''}
                        onChange={(event) => setPriceDraft((current) => ({ ...current, [item.productId]: event.target.value }))}
                      />
                      <Button type="submit" size="sm">Save</Button>
                    </form>
                  </div>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={index === highlight && !!query}
                className={cx('pos-tile', index === highlight && query && 'is-highlight', out && 'is-out')}
                onClick={() => choose(item)}
                title={out ? 'Out of stock' : `Add ${item.product.name}`}
              >
                <p className="pos-tile-name">
                  {item.product.name}
                  {inCart ? <span className="ml-2 text-saffron">×{formatQty(inCart.quantity, inCart.unit)}</span> : null}
                </p>
                <div className="pos-tile-foot">
                  <span className={cx('pos-tile-qty', low && 'is-low', out && 'is-out')}>
                    {tracked ? (out ? 'Out of stock' : formatQty(item.quantity, item.unit)) : 'Untracked'}
                  </span>
                  <span className="pos-tile-price num">{unpriced ? 'No price' : formatINR(item.product.sellingPrice)}</span>
                </div>
              </button>
            );
          })}
        </div>
        {!catalog.isLoading && hits.length === 0 ? (
          <Card className="text-center text-muted">
            No products match “{query.trim()}”.
            {perms.canEditProducts ? (
              <>
                {' '}
                <Link href={`/shop/products/new?name=${encodeURIComponent(query.trim())}`} className="text-saffron">Add it</Link>.
              </>
            ) : null}
          </Card>
        ) : null}
      </div>

      <aside className="bill shop-surface" aria-label="Current bill">
        <div className="bill-head">
          <h2>Bill</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            {lineCount > 0 ? <button type="button" className="bill-remove" onClick={clearBill}>Clear</button> : null}
          </div>
        </div>
        <div className="bill-lines">
          {lineCount === 0 ? (
            <div className="bill-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16l-1.5 9H5.5z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              <p>Nothing on the bill yet.</p>
              <p className="text-xs text-faint">Search above, scan a barcode, or click a product.</p>
            </div>
          ) : (
            cartApi.cart.lines.map((line) => (
              <BillLine
                key={line.key}
                line={line}
                canEditPrice={perms.canEditProducts}
                onQuantity={(qty) => {
                  const result = cartApi.setQuantity(line.key, qty);
                  if (result.capped) setNotice(`Only ${line.available} ${line.unit} of ${line.name} on hand.`);
                }}
                onPrice={(price) => cartApi.setPrice(line.key, price)}
                onRemove={() => cartApi.removeLine(line.key)}
              />
            ))
          )}
        </div>
        {suggestions.length > 0 ? (
          <div className="pos-chips" aria-label="Often bought with">
            {suggestions.map((nudge) => (
              <Chip
                key={nudge.id}
                onClick={() => {
                  const match = items.find((row) => row.productId === nudge.productId);
                  if (match) choose(match);
                }}
              >
                {nudge.title}
              </Chip>
            ))}
          </div>
        ) : null}
        <div className="bill-foot">
          <div className="bill-total-row">
            <span>Subtotal</span>
            <span className="num">{formatINR(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="bill-total-row">
              <span>Discount</span>
              <span className="num">−{formatINR(totals.discount)}</span>
            </div>
          ) : null}
          <div className="bill-total-row is-grand">
            <span>Total</span>
            <strong className="num">{formatINR(totals.total)}</strong>
          </div>
          <div className="bill-charge">
            <CustomerAttach />
            {lineCount === 0 ? (
              <Button size="lg" block disabled>Charge</Button>
            ) : (
              <Button size="lg" block href="/shop/sell/checkout">Charge {formatINR(totals.total)}</Button>
            )}
          </div>
        </div>
      </aside>

      {lineCount > 0 ? (
        <div className="pos-mobile-bar no-print">
          <div>
            <p className="text-xs text-muted">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</p>
            <p className="num font-display text-lg font-bold">{formatINR(totals.total)}</p>
          </div>
          <Button href="/shop/sell/checkout">Charge</Button>
        </div>
      ) : null}
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
  onClose,
}: {
  item: InventoryItem | null;
  value: number;
  onChange: (value: number) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const unit = item?.unit ?? 'piece';
  const alt = altUnit(unit);
  const [displayUnit, setDisplayUnit] = useState(unit);
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
    <div className="pos-picker" role="dialog" aria-label={`Choose a quantity of ${item.product.name}`}>
      <div className="pos-picker-head">
        <div>
          <p className="party-name">{item.product.name}</p>
          <p className="party-meta">
            {formatINR(price)} / {unit}
            {tracked ? ` · ${formatQty(item.quantity, unit, { packSize: item.product.packSize, packLabel: item.product.packLabel })} on hand` : ' · not tracked'}
          </p>
        </div>
        <button type="button" className="bill-remove" onClick={onClose}>Close</button>
      </div>
      <div className="pos-chips" role="group" aria-label="Quantities">
        {chips.map((chip) => (
          <Chip key={chip} active={Math.abs(value - chip) < 1e-9} onClick={() => onChange(clamp(chip))}>
            {chipLabel(chip, unit, item.product)}
          </Chip>
        ))}
      </div>
      <div className="pos-picker-step">
        <button type="button" aria-label="Decrease quantity" onClick={() => onChange(clamp(value - stepFor(unit)))}>−</button>
        <strong>{trimQty(convert(value, unit, displayUnit))} {displayUnit}</strong>
        <button type="button" aria-label="Increase quantity" onClick={() => onChange(clamp(value + stepFor(unit)))}>+</button>
        <span className="num">{formatINR(r3(value * price))}</span>
      </div>
      {alt ? (
        <div className="shop-seg" role="group" aria-label="Unit">
          <button type="button" className={displayUnit === unit ? 'is-active' : undefined} onClick={() => setDisplayUnit(unit)}>{unit}</button>
          <button type="button" className={displayUnit === alt ? 'is-active' : undefined} onClick={() => setDisplayUnit(alt)}>{alt}</button>
        </div>
      ) : null}
      <Button onClick={onAdd} disabled={!(value > 0)}>Add {chipLabel(value, unit, item.product)}</Button>
    </div>
  );
}

function BillLine({
  line,
  canEditPrice,
  onQuantity,
  onPrice,
  onRemove,
}: {
  line: CartLine;
  canEditPrice: boolean;
  onQuantity: (quantity: number) => void;
  onPrice: (price: number) => void;
  onRemove: () => void;
}) {
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const step = stepFor(line.unit);

  const commitQty = () => {
    if (qtyDraft == null) return;
    const next = Number(qtyDraft);
    if (Number.isFinite(next) && next > 0) onQuantity(r3(next));
    setQtyDraft(null);
  };

  const commitPrice = () => {
    if (priceDraft == null) return;
    const next = Number(priceDraft);
    if (Number.isFinite(next) && next >= 0) onPrice(next);
    setPriceDraft(null);
  };

  return (
    <div className="bill-line">
      <p className="bill-line-name">{line.name}</p>
      <p className="bill-line-total num">{formatINR(line.price * line.quantity)}</p>
      <div className="bill-line-controls">
        <div className="bill-qty" aria-label={`Quantity of ${line.name}`}>
          <button type="button" aria-label={`Decrease ${line.name}`} onClick={() => onQuantity(r3(line.quantity - step))}>−</button>
          <input
            inputMode="decimal"
            aria-label={`Quantity of ${line.name} in ${line.unit}`}
            value={qtyDraft ?? String(r3(line.quantity))}
            onFocus={() => setQtyDraft(String(r3(line.quantity)))}
            onChange={(event) => setQtyDraft(event.target.value)}
            onBlur={commitQty}
            onKeyDown={(event) => {
              if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
            }}
          />
          <button type="button" aria-label={`Increase ${line.name}`} onClick={() => onQuantity(r3(line.quantity + step))}>+</button>
        </div>
        <span className="bill-price">
          <span>{line.unit} × ₹</span>
          {canEditPrice ? (
            <input
              inputMode="decimal"
              aria-label={`Price per ${line.unit} for ${line.name}`}
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
        </span>
        <button type="button" className="bill-remove" onClick={onRemove} aria-label={`Remove ${line.name}`}>
          Remove
        </button>
      </div>
    </div>
  );
}

function CameraScan({ onCode }: { onCode: (code: string) => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  useEffect(() => {
    const video = document.createElement('video');
    const host = document.getElementById('sell-camera');
    if (!host) return;
    host.appendChild(video);
    video.className = 'mt-2 w-full rounded-lg';
    video.muted = true;
    video.playsInline = true;
    let stop = false;
    let stream: MediaStream | null = null;
    const formats = ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'qr_code'] as const;
    void (async () => {
      const native = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]> } }).BarcodeDetector;
      const Detector = native ?? (await import('barcode-detector')).BarcodeDetector;
      if (stop) return;
      const detector = new Detector({ formats: [...formats] });
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        await video.play();
      } catch {
        if (!stop) setMessage('Camera permission was blocked. Use a USB scanner instead.');
        return;
      }
      const tick = async () => {
        if (stop) return;
        const codes = await detector.detect(video).catch(() => []);
        const value = codes[0]?.rawValue;
        if (value) {
          onCodeRef.current(value);
          return;
        }
        requestAnimationFrame(() => void tick());
      };
      void tick();
    })().catch(() => {
      if (!stop) setMessage('The camera reader could not start. A USB scanner can type into the search box.');
    });
    return () => {
      stop = true;
      stream?.getTracks().forEach((track) => track.stop());
      video.remove();
    };
  }, []);
  return (
    <Card tight>
      <div id="sell-camera">
        {message ? <p className="text-sm text-muted">{message}</p> : <p className="text-sm text-muted">Point the camera at a barcode.</p>}
      </div>
    </Card>
  );
}
