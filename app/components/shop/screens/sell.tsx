'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { computeTotals, useCart } from '../../../lib/shop/cart';
import { formatINR } from '../../../lib/shop/money';
import type { InventoryItem } from '../../../lib/shop/types';
import { formatQty, stepFor } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Notice, Spinner, inputClass } from '../ui';

export function SellScreen() {
  const { api, shop, userId, perms, hideCost, setNotice } = useShop();
  const shopId = shop?.id ?? '';
  const cartApi = useCart(userId, shop?.id ?? null);
  const catalog = useQuery({
    queryKey: ['catalog', shopId, hideCost],
    enabled: !!shopId,
    queryFn: () => api.getAllInventory(shopId, hideCost),
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [cameraOn, setCameraOn] = useState(false);
  const items = useMemo(
    () => (catalog.data ?? []).filter((item) => item.product.isActive !== false),
    [catalog.data],
  );
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 30);
    return items
      .filter((item) => item.product.name.toLowerCase().includes(q) || item.product.barcode?.includes(q) || item.product.shortCode?.toLowerCase() === q)
      .slice(0, 40);
  }, [items, query]);

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

  const add = (item: InventoryItem) => {
    const result = cartApi.addProduct(item, stepFor(item.unit) >= 1 ? 1 : stepFor(item.unit));
    if (result.message === 'unpriced') {
      if (!perms.canEditProducts) setNotice('Ask a manager to set the price.');
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
        add(hit.item);
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
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d{4,}$/.test(q)) {
      void lookup(q);
      return;
    }
    if (hits.length === 1) add(hits[0]);
  };

  const savePrice = async (item: InventoryItem) => {
    const price = Number(priceDraft[item.productId]);
    if (!(price >= 0)) return;
    setError(null);
    try {
      await api.updateProduct(shop.id, item.productId, { sellingPrice: price });
      await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
      add({ ...item, product: { ...item.product, sellingPrice: price } });
    } catch (caught) {
      setError(caught);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-3xl">Sell</h1>
          <Button tone="ghost" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? 'Close camera' : 'Camera'}</Button>
        </div>
        {cartApi.pending ? (
          <Card>
            <p>A bill is waiting to finish.</p>
            <Link className="text-saffron" href="/shop/sell/checkout">Return to checkout</Link>
          </Card>
        ) : null}
        <Notice error={error} />
        {cameraOn ? <CameraScan onCode={(code) => { setCameraOn(false); void lookup(code); }} /> : null}
        <input
          className={inputClass}
          placeholder="Search or scan a barcode, then press Enter"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKey}
          aria-label="Find a product to sell"
          autoFocus
        />
        {catalog.isLoading ? <Spinner label="Loading products" /> : null}
        <div className="grid gap-2">
          {hits.map((item) => {
            const unpriced = item.product.sellingPrice == null;
            return (
              <div key={item.id} className="shop-row">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted">
                    {formatQty(item.quantity, item.unit)} · {unpriced ? 'No price' : formatINR(item.product.sellingPrice)}
                  </p>
                </div>
                {unpriced && perms.canEditProducts ? (
                  <div className="flex gap-2">
                    <input
                      className="w-28 rounded-lg border border-line bg-elevated px-2 py-2"
                      inputMode="decimal"
                      placeholder="Price"
                      aria-label={`Selling price for ${item.product.name}`}
                      value={priceDraft[item.productId] ?? ''}
                      onChange={(event) => setPriceDraft((current) => ({ ...current, [item.productId]: event.target.value }))}
                    />
                    <Button onClick={() => void savePrice(item)}>Save price</Button>
                  </div>
                ) : unpriced ? (
                  <p className="text-sm text-muted">Ask a manager to set the price.</p>
                ) : (
                  <Button onClick={() => add(item)}>Add</Button>
                )}
              </div>
            );
          })}
          {!catalog.isLoading && hits.length === 0 ? <p className="text-muted">No products match.</p> : null}
        </div>
      </div>
      <Card className="h-fit lg:sticky lg:top-20">
        <h2 className="font-display text-xl">Cart</h2>
        {cartApi.cart.lines.length === 0 ? <p className="mt-3 text-muted">Nothing added yet.</p> : null}
        <div className="mt-3 grid gap-3">
          {cartApi.cart.lines.map((line) => (
            <div key={line.key}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{line.name}</p>
                <button type="button" className="text-sm text-danger" onClick={() => cartApi.removeLine(line.key)} aria-label={`Remove ${line.name}`}>
                  Remove
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" className="rounded-lg border border-line px-2 py-1" aria-label={`Decrease ${line.name}`} onClick={() => cartApi.setQuantity(line.key, line.quantity - stepFor(line.unit))}>−</button>
                <span>{formatQty(line.quantity, line.unit, { packSize: line.packSize, packLabel: line.packLabel })}</span>
                <button type="button" className="rounded-lg border border-line px-2 py-1" aria-label={`Increase ${line.name}`} onClick={() => {
                  const result = cartApi.setQuantity(line.key, line.quantity + stepFor(line.unit));
                  if (result.capped) setNotice(`Only ${line.available} ${line.unit} of ${line.name} can be added.`);
                }}>+</button>
              </div>
              <p className="mt-1 text-sm text-muted">{formatINR(line.price)} · {formatINR(line.price * line.quantity)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-lg font-semibold">{formatINR(totals.total)}</p>
        <div className="mt-3">
          {cartApi.cart.lines.length === 0 ? <Button disabled>Checkout</Button> : <Button href="/shop/sell/checkout">Checkout</Button>}
        </div>
      </Card>
    </div>
  );
}

function CameraScan({ onCode }: { onCode: (code: string) => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  useEffect(() => {
    const Detector = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]> } }).BarcodeDetector;
    const video = document.createElement('video');
    const host = document.getElementById('sell-camera');
    if (!Detector || !host) {
      setMessage('This browser has no camera barcode reader. A USB scanner can type into the search box.');
      return;
    }
    host.appendChild(video);
    video.className = 'mt-2 w-full rounded-lg';
    video.muted = true;
    video.playsInline = true;
    let stop = false;
    let stream: MediaStream | null = null;
    const detector = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'qr_code'] });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(async (next) => {
      stream = next;
      video.srcObject = next;
      await video.play();
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
    }).catch(() => setMessage('Camera permission was blocked. Use a USB scanner instead.'));
    return () => {
      stop = true;
      stream?.getTracks().forEach((track) => track.stop());
      video.remove();
    };
  }, []);
  return (
    <div id="sell-camera">
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
