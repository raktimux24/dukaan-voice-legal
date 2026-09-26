'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { computeTotals, readPending, saleFingerprint, useCart, writePending } from '../../../lib/shop/cart';
import { formatINR, roundPaise } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import type { CreateSalePayload } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PremiumLock, Spinner, inputClass } from '../ui';

const CHIPS = [10, 20, 50, 100, 200, 500, 2000];
type TenderMode = 'cash' | 'upi' | 'credit' | 'split';

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
  const [customerQuery, setCustomerQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOld, setConfirmOld] = useState(false);
  const charging = useRef(false);
  const queryClient = useQueryClient();

  const customers = useQuery({
    queryKey: ['customer-search', shop?.id, customerQuery],
    enabled: !!shop?.id && premium && customerQuery.trim().length > 1,
    queryFn: () => api.getCustomers(shop!.id, { q: customerQuery.trim(), limit: 8 }),
  });

  useEffect(() => {
    if (!shop || !userId || mode) return;
    const last = localStorage.getItem(`samaan-last-method:${userId}:${shop.id}`) as TenderMode | null;
    const fallback = settings.data?.defaultPaymentMethod ?? 'cash';
    const next = last === 'cash' || last === 'upi' || last === 'credit' || last === 'split' ? last : fallback;
    setMode(next === 'credit' && !premium ? 'cash' : next);
  }, [mode, premium, settings.data?.defaultPaymentMethod, shop, userId]);

  const totals = computeTotals(cartApi.cart);
  const total = totals.total;

  useEffect(() => {
    if (shop && userId && cartApi.cart.lines.length === 0 && !cartApi.pending) router.replace('/shop/sell');
  }, [cartApi.cart.lines.length, cartApi.pending, router, shop, userId]);

  const cashPortion = mode === 'cash' ? total : mode === 'split' ? Number(split.cash || 0) : 0;
  const upiPortion = mode === 'upi' ? total : mode === 'split' ? Number(split.upi || 0) : 0;
  const creditPortion = mode === 'credit' ? total : mode === 'split' ? Number(split.credit || 0) : 0;
  const tendered = mode === 'split' ? Number(split.tendered || 0) : Number(cashTendered || 0);
  const remainder = roundPaise(total - roundPaise(cashPortion) - roundPaise(upiPortion) - roundPaise(creditPortion));
  const cashShort = cashPortion > 0 && !covers(tendered, cashPortion);
  const creditBlocked = creditPortion > 0 && !cartApi.cart.customerId && !newName.trim();
  const canCharge = !!mode && Math.abs(remainder) < 0.01 && !cashShort && !creditBlocked && (mode !== 'credit' || premium) && cartApi.cart.lines.length > 0;

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
  if (!premium && mode === 'credit') return <PremiumLock shopId={shop.id} feature="udhaar" />;

  const remember = (next: TenderMode) => {
    setMode(next);
    localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, next);
  };

  const buildBody = (soldAt: string, customerClientId: string | null): Omit<CreateSalePayload, 'clientId'> => {
    const phone = normalizeIndianMobile(newPhone);
    const payments = [
      cashPortion > 0 ? { method: 'cash' as const, amount: roundPaise(cashPortion), tendered: roundPaise(tendered) } : null,
      upiPortion > 0 ? { method: 'upi' as const, amount: roundPaise(upiPortion), reference: upiRef.trim() || undefined } : null,
      creditPortion > 0 ? { method: 'credit' as const, amount: roundPaise(creditPortion) } : null,
    ].filter((part) => part != null);
    if (payments.length === 0) payments.push({ method: 'cash', amount: 0, tendered: 0 });
    const customer = !cartApi.cart.customerId && newName.trim()
      ? { name: newName.trim(), phone: phone === 'invalid' ? null : phone, clientId: customerClientId ?? crypto.randomUUID() }
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
    const phone = normalizeIndianMobile(newPhone);
    if ((creditPortion > 0 || newName.trim()) && phone === 'invalid') {
      setPhoneError('Enter a valid Indian mobile number.');
      return;
    }
    setPhoneError(null);
    const lockKey = `samaan-charge-lock:${userId}:${shop.id}`;
    const existing = fresh ? null : readPending(userId, shop.id);
    let customerClientId = cartApi.cart.customerClientId;
    if (!cartApi.cart.customerId && newName.trim() && !customerClientId) {
      customerClientId = crypto.randomUUID();
      cartApi.patch({ customerClientId, customerName: newName.trim(), customerPhone: phone });
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
      cartApi.clear();
      router.push(`/shop/sales/${result.sale.id}?recorded=${result.deduplicated ? 'again' : 'new'}`);
    } catch (caught) {
      localStorage.removeItem(lockKey);
      if (caught instanceof ApiError && caught.code === 'sold_at_too_old') setConfirmOld(true);
      else {
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

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-4">
        <h1 className="font-display text-3xl">Checkout</h1>
        <Notice error={error} />
        {confirmOld ? (
          <Card>
            <p>This bill was started too long ago. Charging it now creates a new bill only after you confirm.</p>
            <div className="mt-3">
              <Button onClick={() => { writePending(userId, shop.id, null); setConfirmOld(false); void handleCharge(true); }}>Charge as a new bill</Button>
            </div>
          </Card>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(['cash', 'upi', ...(premium ? ['credit' as const] : []), 'split'] as TenderMode[]).map((item) => (
            <Button key={item} tone={mode === item ? 'primary' : 'ghost'} onClick={() => remember(item)}>{item === 'upi' ? 'UPI' : item[0].toUpperCase() + item.slice(1)}</Button>
          ))}
        </div>
        {mode === 'cash' || mode === 'split' ? (
          <Card className="grid gap-3">
            <p className="text-sm text-muted">Cash {formatINR(cashPortion)}</p>
            <div className="flex flex-wrap gap-2">
              <Button tone="ghost" onClick={() => {
                const exact = String(cashPortion);
                if (mode === 'split') setSplit((current) => ({ ...current, tendered: exact }));
                else setCashTendered(exact);
              }}>Exact</Button>
              {CHIPS.map((chip) => (
                <Button key={chip} tone="ghost" onClick={() => {
                  if (mode === 'split') setSplit((current) => ({ ...current, tendered: String(roundPaise(Number(current.tendered || 0) + chip)) }));
                  else setCashTendered(String(roundPaise(Number(cashTendered || 0) + chip)));
                }}>+{chip}</Button>
              ))}
            </div>
            <Field label="Cash received">
              <input className={inputClass} inputMode="decimal" value={mode === 'split' ? split.tendered : cashTendered} onChange={(event) => mode === 'split' ? setSplit((current) => ({ ...current, tendered: event.target.value })) : setCashTendered(event.target.value)} />
            </Field>
            <p>Change {cashShort ? '—' : formatINR(roundPaise(tendered - cashPortion))}</p>
          </Card>
        ) : null}
        {mode === 'upi' || mode === 'split' ? (
          <Card className="grid gap-3">
            {settings.data?.upiVpa ? <UpiQr text={upiText} label={settings.data.upiVpa} /> : settings.data?.upiQrImage ? (
              <img src={settings.data.upiQrImage} alt="Uploaded UPI QR" className="w-52 rounded-lg bg-white p-2" />
            ) : (
              <p className="text-muted">No UPI QR is on file. The sale can still be recorded as UPI.{perms.canManageShop ? <a className="ml-2 text-saffron" href="/shop/settings/payments">Add UPI</a> : null}</p>
            )}
            <Field label="UPI reference"><input className={inputClass} value={upiRef} onChange={(event) => setUpiRef(event.target.value)} /></Field>
          </Card>
        ) : null}
        {mode === 'split' ? (
          <Card className="grid gap-3">
            <Field label="Cash amount"><input className={inputClass} inputMode="decimal" value={split.cash} onChange={(event) => setSplit((current) => ({ ...current, cash: event.target.value }))} /></Field>
            <Field label="UPI amount"><input className={inputClass} inputMode="decimal" value={split.upi} onChange={(event) => setSplit((current) => ({ ...current, upi: event.target.value }))} /></Field>
            {premium ? <Field label="Credit amount"><input className={inputClass} inputMode="decimal" value={split.credit} onChange={(event) => setSplit((current) => ({ ...current, credit: event.target.value }))} /></Field> : null}
            <p className={Math.abs(remainder) < 0.01 ? 'text-ok' : 'text-danger'}>Left to assign {formatINR(remainder)}</p>
          </Card>
        ) : null}
        {premium ? (
          <Card className="grid gap-3">
            <h2 className="font-semibold">Customer</h2>
            {cartApi.cart.customerId ? (
              <p>{cartApi.cart.customerName} <button type="button" className="ml-2 text-saffron" onClick={() => cartApi.patch({ customerId: null, customerName: null, customerPhone: null })}>Clear</button></p>
            ) : (
              <>
                <input className={inputClass} placeholder="Search customers" value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} aria-label="Search customers" />
                {(customers.data?.customers ?? []).map((customer) => (
                  <button key={customer.id} type="button" className="text-left" onClick={() => cartApi.patch({ customerId: customer.id, customerName: customer.name, customerPhone: customer.phone })}>
                    {customer.name} · {formatINR(customer.balance)}
                  </button>
                ))}
                <Field label="New customer name"><input className={inputClass} value={newName} onChange={(event) => setNewName(event.target.value)} /></Field>
                <Field label="Phone"><input className={inputClass} value={newPhone} onChange={(event) => setNewPhone(event.target.value)} inputMode="tel" /></Field>
                {phoneError ? <p className="text-sm text-danger">{phoneError}</p> : null}
              </>
            )}
            {creditBlocked ? <p className="text-sm text-danger">Udhaar needs a customer on the bill.</p> : null}
          </Card>
        ) : null}
        <Card className="grid gap-3">
          <Field label="Bill discount">
            <input className={inputClass} inputMode="decimal" value={cartApi.cart.billDiscount || ''} onChange={(event) => cartApi.patch({ billDiscount: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Note">
            <textarea className={inputClass} value={cartApi.cart.note} onChange={(event) => cartApi.patch({ note: event.target.value })} />
          </Field>
        </Card>
      </div>
      <Card className="h-fit">
        <p className="text-sm text-muted">Total</p>
        <p className="font-display text-4xl">{formatINR(total)}</p>
        {totals.discount > 0 ? <p className="text-sm text-muted">Discount {formatINR(totals.discount)}</p> : null}
        <ul className="mt-4 grid gap-2 text-sm">
          {cartApi.cart.lines.map((line) => <li key={line.key} className="flex justify-between gap-3"><span>{line.name}</span><span>{formatINR(line.price * line.quantity)}</span></li>)}
        </ul>
        <div className="mt-4">
          <Button disabled={!canCharge || busy} onClick={() => void handleCharge(false)}>{busy ? 'Charging…' : 'Charge'}</Button>
        </div>
      </Card>
    </div>
  );
}

function UpiQr({ text, label }: { text: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import('qrcode').then((qr) => qr.toDataURL(text, { margin: 1, width: 220 })).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  return (
    <div>
      {src ? <img src={src} alt={`UPI QR for ${label}`} width={220} height={220} className="rounded-lg bg-white p-2" /> : <p className="text-muted">Preparing QR…</p>}
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}
