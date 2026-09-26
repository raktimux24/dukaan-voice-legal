'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { computeTotals, readPending, saleFingerprint, useCart, writePending } from '../../../lib/shop/cart';
import { formatINR, roundPaise } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import type { CreateSalePayload } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PageHeader, PremiumLock, SectionHead, Spinner, cx, inputClass } from '../ui';
import { CustomerAttach } from '../customer-attach';

const CHIPS = [10, 20, 50, 100, 200, 500, 2000];
type TenderMode = 'cash' | 'upi' | 'card' | 'credit' | 'split';

const MODE_LABELS: Record<TenderMode, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', credit: 'Udhaar', split: 'Split' };

function covers(tendered: number, amount: number) {
  return roundPaise(tendered) + 0.01 >= roundPaise(amount);
}

export function CheckoutScreen() {
  const { api, shop, userId, premium, perms } = useShop();
  const router = useRouter();
  const cartApi = useCart(userId, shop?.id ?? null);
  const settings = useQuery({
    queryKey: ['pos', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const [mode, setMode] = useState<TenderMode | null>(null);
  const [cashTendered, setCashTendered] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [split, setSplit] = useState({ cash: '', upi: '', credit: '', tendered: '' });
  const [error, setError] = useState<unknown>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmOld, setConfirmOld] = useState(false);
  const charging = useRef(false);
  const wentToBill = useRef(false);
  const chargeRef = useRef<(fresh: boolean) => Promise<void>>(async () => {});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shop || !userId || mode) return;
    const last = localStorage.getItem(`samaan-last-method:${userId}:${shop.id}`) as TenderMode | null;
    const fallback = settings.data?.defaultPaymentMethod ?? 'cash';
    const known = last === 'cash' || last === 'upi' || last === 'card' || last === 'credit' || last === 'split';
    const next = known ? last : fallback;
    setMode(next === 'card' && !settings.data?.cardEnabled ? 'cash' : next);
  }, [mode, settings.data?.cardEnabled, settings.data?.defaultPaymentMethod, shop, userId]);

  useEffect(() => {
    if (!offlineSaved) return;
    const retry = () => {
      if (charging.current) return;
      void chargeRef.current(false);
    };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [offlineSaved]);

  const totals = computeTotals(cartApi.cart);
  const total = totals.total;

  useEffect(() => {
    if (wentToBill.current || charging.current) return;
    if (shop && userId && cartApi.cart.lines.length === 0 && !cartApi.pending) router.replace('/shop/sell');
  }, [cartApi.cart.lines.length, cartApi.pending, router, shop, userId]);

  const cashPortion = mode === 'cash' ? total : mode === 'split' ? Number(split.cash || 0) : 0;
  const upiPortion = mode === 'upi' ? total : mode === 'split' ? Number(split.upi || 0) : 0;
  const creditPortion = mode === 'credit' ? total : mode === 'split' ? Number(split.credit || 0) : 0;
  const cardPortion = mode === 'card' ? total : 0;
  const tendered = mode === 'split' ? Number(split.tendered || 0) : Number(cashTendered || 0);
  const remainder = roundPaise(total - roundPaise(cashPortion) - roundPaise(upiPortion) - roundPaise(creditPortion) - roundPaise(cardPortion));
  const cashShort = cashPortion > 0 && !covers(tendered, cashPortion);
  const hasCustomer = !!(cartApi.cart.customerId || cartApi.cart.customerName?.trim());
  const udhaarLocked = creditPortion > 0 && !premium;
  const creditBlocked = creditPortion > 0 && premium && !hasCustomer;
  const canCharge = !!mode && !udhaarLocked && Math.abs(remainder) < 0.01 && !cashShort && !creditBlocked && cartApi.cart.lines.length > 0;

  const upiText = useMemo(() => {
    const vpa = settings.data?.upiVpa;
    if (!vpa) return '';
    const params = new URLSearchParams({
      pa: vpa,
      pn: settings.data?.upiPayeeName || shop?.name || 'Shop',
      am: String(upiPortion || total),
      cu: 'INR',
    });
    return `upi://pay?${params.toString()}`;
  }, [settings.data?.upiPayeeName, settings.data?.upiVpa, shop?.name, total, upiPortion]);

  if (!shop || !userId) return <Spinner label="Loading checkout" />;

  const remember = (next: TenderMode) => {
    setMode(next);
    localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, next);
  };

  const buildBody = (soldAt: string, customerClientId: string | null): Omit<CreateSalePayload, 'clientId'> => {
    const phone = cartApi.cart.customerPhone ? normalizeIndianMobile(cartApi.cart.customerPhone) : null;
    const payments = [
      cashPortion > 0 ? { method: 'cash' as const, amount: roundPaise(cashPortion), tendered: roundPaise(tendered) } : null,
      upiPortion > 0 ? { method: 'upi' as const, amount: roundPaise(upiPortion), reference: upiRef.trim() || undefined } : null,
      cardPortion > 0 ? { method: 'card' as const, amount: roundPaise(cardPortion) } : null,
      creditPortion > 0 ? { method: 'credit' as const, amount: roundPaise(creditPortion) } : null,
    ].filter((part) => part != null);
    if (payments.length === 0) payments.push({ method: 'cash', amount: 0, tendered: 0 });
    const draftName = cartApi.cart.customerName?.trim() ?? '';
    const customer = !cartApi.cart.customerId && draftName
      ? { name: draftName, phone: phone && phone !== 'invalid' ? phone : null, clientId: customerClientId ?? crypto.randomUUID() }
      : null;
    return {
      soldAt,
      inputMethod: 'manual',
      items: cartApi.cart.lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        unit: line.unit,
        quantity: line.quantity,
        price: line.price,
        discount: line.discount,
      })),
      payments,
      discountAmount: totals.billDiscount,
      customerId: cartApi.cart.customerId,
      customer,
      note: cartApi.cart.note.trim() || null,
    };
  };

  const handleCharge = async (fresh: boolean) => {
    if (charging.current || !canCharge) return;
    const phone = cartApi.cart.customerPhone ? normalizeIndianMobile(cartApi.cart.customerPhone) : null;
    if (phone === 'invalid') {
      setError(new Error('Enter a valid Indian mobile number.'));
      return;
    }
    const lockKey = `samaan-charge-lock:${userId}:${shop.id}`;
    const existing = fresh ? null : readPending(userId, shop.id);
    let customerClientId = cartApi.cart.customerClientId;
    if (!cartApi.cart.customerId && cartApi.cart.customerName?.trim() && !customerClientId) {
      customerClientId = crypto.randomUUID();
      cartApi.patch({ customerClientId });
    }
    const soldAt = existing?.payload.soldAt ?? new Date().toISOString();
    const body = buildBody(soldAt, customerClientId);
    const fingerprint = saleFingerprint(body);
    if (existing && existing.fingerprint !== fingerprint && Date.now() - existing.startedAt < 20_000) {
      setError(new Error('Another bill is being charged. Wait a moment, then retry that bill.'));
      return;
    }
    const clientId = existing?.fingerprint === fingerprint ? existing.clientId : crypto.randomUUID();
    const held = localStorage.getItem(lockKey);
    const heldId = held?.split(':')[1];
    if (held && Date.now() - Number(held.split(':')[0]) < 20_000 && heldId && heldId !== clientId) {
      setError(new Error('Another bill is being charged in this browser.'));
      return;
    }
    const payload: CreateSalePayload = { ...body, clientId };
    charging.current = true;
    setBusy(true);
    setError(null);
    writePending(userId, shop.id, {
      clientId,
      payload,
      fingerprint,
      startedAt: existing?.fingerprint === fingerprint ? existing.startedAt : Date.now(),
    });
    localStorage.setItem(lockKey, `${Date.now()}:${clientId}`);
    try {
      const result = await api.createSale(shop.id, payload);
      localStorage.removeItem(lockKey);
      if (mode) localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, mode);
      wentToBill.current = true;
      const recorded = result.deduplicated ? 'again' : 'new';
      router.replace(`/shop/sales/${result.sale.id}?recorded=${recorded}`);
      cartApi.clear();
    } catch (caught) {
      const offline = caught instanceof TypeError || (caught instanceof ApiError && caught.status === 0) || (caught instanceof DOMException && caught.name === 'TimeoutError');
      localStorage.removeItem(lockKey);
      if (offline) {
        setOfflineSaved(true);
        setError(new Error('No connection. This bill stays on this browser and sends again when you are back online.'));
      } else if (caught instanceof ApiError && caught.code === 'sold_at_too_old') setConfirmOld(true);
      else {
        writePending(userId, shop.id, null);
        if (caught instanceof ApiError && (caught.code === 'product_archived' || caught.code === 'product_not_found')) {
          await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
        }
        setError(caught);
      }
    } finally {
      charging.current = false;
      setBusy(false);
    }
  };

  const setTendered = (value: string) => {
    if (mode === 'split') setSplit((current) => ({ ...current, tendered: value }));
    else setCashTendered(value);
  };
  const currentTendered = mode === 'split' ? split.tendered : cashTendered;
  chargeRef.current = handleCharge;
  const modes: TenderMode[] = ['cash', 'upi', ...(settings.data?.cardEnabled ? (['card'] as TenderMode[]) : []), 'credit', 'split'];

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Counter"
        title="Checkout"
        actions={<Button href="/shop/sell" tone="quiet" size="sm">← Back to counter</Button>}
      />

      <div className="pos">
        <div className="pos-catalog">
          <Notice error={error} />
          {confirmOld ? (
            <Card>
              <p>This bill was started too long ago. Charging it now creates a new bill only after you confirm.</p>
              <div className="mt-3">
                <Button onClick={() => { writePending(userId, shop.id, null); setConfirmOld(false); void handleCharge(true); }}>Charge as a new bill</Button>
              </div>
            </Card>
          ) : null}

          <section>
            <SectionHead title="Payment" sub="How is the customer paying?" />
            <div className="shop-seg is-wrap" role="tablist" aria-label="Payment method">
              {modes.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={mode === item} className={cx(mode === item && 'is-active')} onClick={() => remember(item)}>
                  {MODE_LABELS[item]}
                </button>
              ))}
            </div>
          </section>

          {offlineSaved ? (
            <Card>
              <p>This bill is saved on this browser.</p>
              <div className="mt-3">
                <Button onClick={() => void handleCharge(false)} disabled={busy}>{busy ? 'Sending…' : 'Send bill now'}</Button>
              </div>
            </Card>
          ) : null}

          {mode === 'credit' ? (
            <Card className="grid gap-3">
              <h3 className="shop-section-title">Udhaar</h3>
              {udhaarLocked ? <PremiumLock feature="udhaar" /> : (
                <p className="party-meta">{hasCustomer ? `This bill goes on ${cartApi.cart.customerName}'s balance.` : 'Add a customer. Udhaar needs a name on the bill.'}</p>
              )}
            </Card>
          ) : null}

          {mode === 'card' ? (
            <Card>
              <h3 className="shop-section-title">Card</h3>
              <p className="party-meta">Record {formatINR(total)} as paid by card. The terminal is outside this page.</p>
            </Card>
          ) : null}

          {mode === 'split' ? (
            <Card className="grid gap-4">
              <div className="form-grid is-3">
                <Field label="Cash">
                  <input className={inputClass} inputMode="decimal" value={split.cash} onChange={(event) => setSplit((current) => ({ ...current, cash: event.target.value }))} />
                </Field>
                <Field label="UPI">
                  <input className={inputClass} inputMode="decimal" value={split.upi} onChange={(event) => setSplit((current) => ({ ...current, upi: event.target.value }))} />
                </Field>
                <Field label="Udhaar">
                  <input className={inputClass} inputMode="decimal" value={split.credit} onChange={(event) => setSplit((current) => ({ ...current, credit: event.target.value }))} />
                </Field>
              </div>
              <p className={cx('text-sm num', Math.abs(remainder) < 0.01 ? 'text-ok' : 'text-warn')}>
                {Math.abs(remainder) < 0.01 ? 'Fully assigned.' : `Left to assign ${formatINR(remainder)}`}
              </p>
            </Card>
          ) : null}

          {mode === 'cash' || mode === 'split' ? (
            <Card className="grid gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="shop-section-title">Cash</h3>
                <span className="num text-sm text-muted">Due {formatINR(cashPortion)}</span>
              </div>
              <div className="tender-chips">
                <Button tone="ghost" onClick={() => setTendered(String(cashPortion))}>Exact</Button>
                {CHIPS.map((chip) => (
                  <Button key={chip} tone="ghost" onClick={() => setTendered(String(roundPaise(Number(currentTendered || 0) + chip)))}>+{chip}</Button>
                ))}
              </div>
              <div className="form-grid is-2 items-end">
                <Field label="Cash received">
                  <input className="shop-field is-lg num" inputMode="decimal" value={currentTendered} onChange={(event) => setTendered(event.target.value)} autoFocus />
                </Field>
                <div className={cx('tender-change', cashShort && 'is-short')}>
                  <span className="text-sm text-muted">{cashShort ? 'Still short' : 'Change to return'}</span>
                  <strong className="num">{cashShort ? formatINR(roundPaise(cashPortion - tendered)) : formatINR(roundPaise(Math.max(0, tendered - cashPortion)))}</strong>
                </div>
              </div>
            </Card>
          ) : null}

          {mode === 'upi' || mode === 'split' ? (
            <Card className="grid gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="shop-section-title">UPI</h3>
                <span className="num text-sm text-muted">Due {formatINR(upiPortion)}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                {settings.data?.upiVpa ? (
                  <UpiQr text={upiText} label={settings.data.upiVpa} />
                ) : settings.data?.upiQrImage ? (
                  <img src={settings.data.upiQrImage} alt="Uploaded UPI QR" className="w-52 rounded-lg bg-white p-2" />
                ) : (
                  <p className="text-sm text-muted">
                    No UPI QR is on file. The sale can still be recorded as UPI.
                    {perms.canManageShop ? <Link className="ml-2 text-saffron" href="/shop/settings/payments">Add UPI</Link> : null}
                  </p>
                )}
                <Field label="UPI reference" hint="Optional. The last digits of the transaction id.">
                  <input className={inputClass} value={upiRef} onChange={(event) => setUpiRef(event.target.value)} />
                </Field>
              </div>
            </Card>
          ) : null}

          <Card className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="shop-section-title">Customer</h3>
              <span className="text-sm text-muted">{creditPortion > 0 ? 'Required for udhaar' : 'Optional'}</span>
            </div>
            <CustomerAttach />
            {creditBlocked ? <p className="text-sm text-danger">Udhaar needs a customer on the bill.</p> : null}
            {udhaarLocked && mode === 'split' ? <PremiumLock feature="udhaar" /> : null}
          </Card>

          <Card className="form-grid is-2">
            <Field label="Bill discount" hint="Applied to the whole bill, on top of any line discounts.">
              <div className="shop-input-wrap">
                <span className="shop-input-prefix">₹</span>
                <input className={cx(inputClass, 'num')} inputMode="decimal" value={cartApi.cart.billDiscount || ''} onChange={(event) => cartApi.patch({ billDiscount: Number(event.target.value || 0) })} />
              </div>
            </Field>
            <Field label="Note">
              <input className={inputClass} value={cartApi.cart.note} onChange={(event) => cartApi.patch({ note: event.target.value })} placeholder="Printed on the bill" />
            </Field>
          </Card>
        </div>

        <aside className="bill shop-surface" aria-label="Bill summary">
          <div className="bill-head">
            <h2>Bill</h2>
            <span className="text-sm text-muted">{cartApi.cart.lines.length} {cartApi.cart.lines.length === 1 ? 'line' : 'lines'}</span>
          </div>
          <div className="bill-lines">
            {cartApi.cart.lines.map((line) => (
              <div key={line.key} className="bill-line">
                <p className="bill-line-name">{line.name}</p>
                <p className="bill-line-total num">{formatINR(line.price * line.quantity)}</p>
                <p className="text-sm text-muted num" style={{ gridColumn: '1 / -1' }}>
                  {formatQty(line.quantity, line.unit, { packSize: line.packSize, packLabel: line.packLabel })} × {formatINR(line.price)}
                </p>
              </div>
            ))}
          </div>
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
            {mode ? (
              <div className="bill-total-row">
                <span>Paying by</span>
                <span>{MODE_LABELS[mode]}</span>
              </div>
            ) : null}
            <div className="bill-total-row is-grand">
              <span>Total</span>
              <strong className="num">{formatINR(total)}</strong>
            </div>
            <div className="bill-charge">
              <Button size="lg" block disabled={!canCharge || busy} onClick={() => void handleCharge(false)}>
                {busy ? 'Charging…' : `Charge ${formatINR(total)}`}
              </Button>
            </div>
            <p className="text-center text-xs text-faint">One bill per charge. A retry after a network drop reuses the same bill.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UpiQr({ text, label }: { text: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import('qrcode').then((qr) => qr.toDataURL(text, { margin: 1, width: 200 })).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  return (
    <div>
      {src ? <img src={src} alt={`UPI QR for ${label}`} width={200} height={200} className="rounded-lg bg-white p-2" /> : <p className="text-muted">Preparing QR…</p>}
      <p className="mt-2 text-center text-sm text-muted">{label}</p>
    </div>
  );
}
