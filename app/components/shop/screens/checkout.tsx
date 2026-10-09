'use client';

import {financialScope,retainedRequests,assertScope} from '../../../lib/shop/gst-storage';
import {verifyLocalFiscalReceipt} from '../../../lib/shop/local-fiscal-receipt';
import { useGstText as useUiText } from "../gst-ui";
import {attachCatalogTaxSnapshot,assertCartTaxSnapshots} from '../../../lib/shop/gst-core/gst-tax-cache';
import {RspCheckoutControls} from '../gst-rsp-checkout';
import {checkoutPayable} from '../../../lib/shop/checkout-payable';
import {assertRoundingSelection,roundingSelectionCurrent} from '../../../lib/shop/gst-core/payable-rounding-request';
import {cachedRspProductAt} from '../../../lib/shop/gst-core/gst-rsp-cache';


import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { issueSale } from '../../../lib/shop/gst-issuance';
import {permitsOfflineShopFallback} from '../../../lib/shop/offline-shop-context';
import {premiumAt} from '../../../lib/shop/offline-premium';
import { validateContext, type GstContext } from '../../../lib/shop/gst-core/gst';
import { useGstText } from '../gst-ui';
import { ApiError } from '../../../lib/shop/api';
import { computeTotals, readPending, saleFingerprint, useCart, writePending } from '../../../lib/shop/cart';
import { formatINR, roundPaise } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import type { CreateSalePayload } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PageHeader, PremiumLock, SectionHead, Spinner, cx, inputClass } from '../ui';
import {LocalFiscalReceiptScreen} from './local-fiscal-receipt';
import { CustomerAttach } from '../customer-attach';

const CHIPS = [10, 20, 50, 100, 200, 500, 2000];
type TenderMode = 'cash' | 'upi' | 'card' | 'credit' | 'split';

const MODE_LABELS: Record<TenderMode, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', credit: 'Udhaar', split: 'Split' };

function covers(tendered: number, amount: number) {
  return roundPaise(tendered) + 0.01 >= roundPaise(amount);
}

export function CheckoutScreen() {
  const uiText = useUiText();
  const { api, shop, userId, premium, entitlement,perms, t } = useShop();
  const text=useGstText();
  const router = useRouter();
  const cartApi = useCart(userId, shop?.id ?? null);
  const settings = useQuery({
    queryKey: ['pos', shop?.id],
    enabled: !!shop?.id,
    networkMode:'always',
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const taxRequired=settings.data?.gstAvailable===true&&settings.data.gstSettings?.registration==='regular';
  const productIds=cartApi.cart.lines.map(line=>line.productId);
  const taxSnapshot=useQuery({queryKey:['checkout-tax-snapshot',shop?.id,userId,...productIds],enabled:!!shop?.id&&taxRequired&&productIds.length>0,networkMode:'always',queryFn:()=>api.getTaxSnapshot(shop!.id,productIds)});
  const adoptedSnapshot=useRef<unknown>(null);
  useEffect(()=>{
    if(!shop||!taxSnapshot.data||adoptedSnapshot.current===taxSnapshot.data)return;
    const attached=attachCatalogTaxSnapshot(cartApi.cart.lines.map(line=>({product:{id:line.productId,...line}})),taxSnapshot.data,shop.id);
    const lines=cartApi.cart.lines.map((line,index)=>({...line,gstConfig:line.rsp?null:attached[index].product.gstConfig,gstTaxSnapshot:attached[index].product.gstTaxSnapshot,gstRspSnapshot:attached[index].product.gstRspSnapshot}));
    adoptedSnapshot.current=taxSnapshot.data;cartApi.patch({lines});
  },[taxSnapshot.data,cartApi,shop]);
  const [previewAt,setPreviewAt]=useState(()=>new Date().toISOString());
  const [previewNow,setPreviewNow]=useState(()=>Date.now());
  const roundingEnabled=settings.data?.gstPayableRoundingAvailable===true;
  const rounding=useQuery({queryKey:['gst-rounding-selection',shop?.id,previewAt,userId],enabled:!!shop?.id&&roundingEnabled,networkMode:'always',queryFn:async()=>assertRoundingSelection(shop!.id,previewAt,await api.gst.roundingSelection(shop!.id,previewAt))});
  useEffect(()=>{if(!roundingEnabled)return;const timer=setInterval(()=>{const now=Date.now();setPreviewNow(now);if(rounding.data&&!roundingSelectionCurrent(rounding.data,now))setPreviewAt(new Date(now).toISOString());},1000);return()=>clearInterval(timer);},[roundingEnabled,rounding.data]);
  const [mode, setMode] = useState<TenderMode | null>(null);
  const [cashTendered, setCashTendered] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [split, setSplit] = useState({ cash: '', upi: '', credit: '', tendered: '' });
  const [error, setError] = useState<unknown>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [localReceiptId,setLocalReceiptId]=useState<string|null>(null);
  const [restoringReceipt,setRestoringReceipt]=useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOld, setConfirmOld] = useState(false);
  const charging = useRef(false);
  const wentToBill = useRef(false);
  const chargeRef = useRef<(fresh: boolean) => Promise<void>>(async () => {});
  const queryClient = useQueryClient();
  useEffect(()=>{
    if(!shop||!userId)return;
    let canceled=false;setRestoringReceipt(true);setLocalReceiptId(null);wentToBill.current=false;
    void (async()=>{
      try{
        const scope=financialScope(shop.id);
        const row=(await retainedRequests(scope)).find(row=>row.state==='pending'&&row.path===`/api/shops/${shop.id}/sales`&&row.verification?.localFiscalReceipt);
        assertScope(scope);
        if(row&&cartApi.cart.lines.length===0){await verifyLocalFiscalReceipt(row,scope);assertScope(scope);if(!canceled){wentToBill.current=true;setLocalReceiptId(row.id);}}
      }catch{/* Unverified records remain available through recovery. */}
      finally{if(!canceled)setRestoringReceipt(false);}
    })();
    return()=>{canceled=true;};
  },[shop?.id,userId]);

  useEffect(() => {
    if (!shop || !userId || mode) return;
    const last = localStorage.getItem(`samaan-last-method:${userId}:${shop.id}`) as TenderMode | null;
    const fallback = settings.data?.defaultPaymentMethod ?? 'cash';
    const known = last === 'cash' || last === 'upi' || last === 'card' || last === 'credit' || last === 'split';
    const next = cartApi.cart.paymentHint ?? (known ? last : fallback);
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

  const gstContext:GstContext|null=settings.data?.gstSettings&&['regular','composition'].includes(settings.data.gstSettings.registration)?{settings:settings.data.gstSettings,priceMode:settings.data.gstSettings.priceMode,placeOfSupply:settings.data.gstSettings.stateCode,...cartApi.cart.buyer?{buyer:cartApi.cart.buyer}:{}}:null;
  let gstError:unknown=null;let totals;let roundOff=0;
  try{
    if(taxRequired){if(taxSnapshot.error||!taxSnapshot.data||adoptedSnapshot.current!==taxSnapshot.data)throw taxSnapshot.error??Error('Refreshing product tax details.');assertCartTaxSnapshots({gstTaxSnapshotsRequired:true,lines:cartApi.cart.lines},shop!.id,new Date().toISOString());}
    if(gstContext?.settings.registration==='regular')for(const line of cartApi.cart.lines){if(line.gstRspSnapshot?.profiles.length&&!line.rsp){let active=false;try{cachedRspProductAt(line.gstRspSnapshot,shop!.id,line.productId,new Date().toISOString());active=true;}catch{/* An inactive review does not enable RSP. */}if(active)throw Error('Review package details below before charging this product.');}}
    if(cartApi.cart.lines.some(line=>line.rsp)&&settings.data?.gstRspBillingAvailable!==true)throw Error('RSP billing is unavailable for this shop.');
    totals=computeTotals(cartApi.cart,gstContext);if(gstContext)validateContext(gstContext,totals.total);
    if(roundingEnabled&&(rounding.error||!rounding.data||!roundingSelectionCurrent(rounding.data,previewNow)))throw rounding.error??Error('Loading the current rounding policy.');
    const payable=checkoutPayable(totals.total,shop?.id??'',gstContext,roundingEnabled,rounding.data?.selection?.policy,previewAt);
    roundOff=payable.roundOff;totals={...totals,total:payable.total};
  }catch(e){gstError=e;totals=computeTotals(cartApi.cart);}
  const total = totals.total;

  useEffect(() => {
    if (restoringReceipt || wentToBill.current || charging.current) return;
    if (shop && userId && cartApi.cart.lines.length === 0 && !cartApi.pending) router.replace('/shop/sell');
  }, [restoringReceipt, cartApi.cart.lines.length, cartApi.pending, router, shop, userId]);

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
  const canCharge = !gstError && !!settings.data && (!gstContext||settings.data.gstAvailable===true&&settings.data.gstProtocol===2) && !!mode && !udhaarLocked && Math.abs(remainder) < 0.01 && !cashShort && !creditBlocked && cartApi.cart.lines.length > 0;

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

  if (!shop || !userId) return <Spinner label={uiText("Loading checkout")} />;

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
      gstContext,
      mixedDiscountReview:cartApi.cart.mixedDiscountReview,
      soldAt,
      inputMethod: cartApi.cart.inputMethod ?? 'manual',
      items: cartApi.cart.lines.map((line) => ({
        gstConfig: line.gstConfig,
        rsp:line.rsp,
        listPrice: line.listPrice,
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
    if(creditPortion>0&&!premiumAt(entitlement)){setError(new Error(t('checkout.customer_list_premium','Saved customers and udhaar balances are part of Premium.')));return;}
    const phone = cartApi.cart.customerPhone ? normalizeIndianMobile(cartApi.cart.customerPhone) : null;
    if (phone === 'invalid') {
      setError(new Error('Enter a valid Indian mobile number.'));
      return;
    }
    const existing = fresh ? null : readPending(userId, shop.id);
    let customerClientId = cartApi.cart.customerClientId;
    if (!cartApi.cart.customerId && cartApi.cart.customerName?.trim() && !customerClientId) {
      customerClientId = crypto.randomUUID();
      cartApi.patch({ customerClientId });
    }
    const soldAt = existing?.payload.soldAt ?? new Date().toISOString();
    const body = buildBody(soldAt, customerClientId);
    const fingerprint = saleFingerprint(body);
    if (existing && existing.fingerprint !== fingerprint) {
      setError(new Error('Another bill is being charged. Wait a moment, then retry that bill.'));
      return;
    }
    const clientId = existing?.fingerprint === fingerprint ? existing.clientId : crypto.randomUUID();
    const payload: CreateSalePayload = { ...body, clientId };
    charging.current = true;
    setBusy(true);
    setError(null);
    try {
    writePending(userId, shop.id, {
      clientId,
      payload,
      fingerprint,
      startedAt: existing?.fingerprint === fingerprint ? existing.startedAt : Date.now(),
    });

      const result = await issueSale(api,shop.id,payload);
      try {if (mode) localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, mode);} catch {/* A preference failure must not undo a verified bill. */}
      wentToBill.current = true;
      const recorded = result.deduplicated ? 'again' : 'new';
      router.replace(`/shop/sales/${result.sale.id}?recorded=${recorded}`);
      cartApi.clear();
    } catch (caught) {
      const offline = permitsOfflineShopFallback(caught);
      if (offline) {
        try{
          const scope=financialScope(shop.id);
          const row=(await retainedRequests(scope)).find(row=>row.id===clientId);
          if(row?.verification?.localFiscalReceipt){
            await verifyLocalFiscalReceipt(row,scope);assertScope(scope);
            wentToBill.current=true;
            setLocalReceiptId(clientId);
            cartApi.clear();
            void queryClient.invalidateQueries({queryKey:['catalog',shop.id]});
            return;
          }
        }catch{/* An unverifiable receipt stays in recovery; never claim an issued bill. */}
        setOfflineSaved(true);
        setError(new Error('Connection lost. The server outcome is not confirmed. The saved checkout will retry with the same request ID when the connection returns.'));
      } else if (caught instanceof ApiError && caught.code === 'sold_at_too_old') setConfirmOld(true);
      else {
        // Retain the original uncertain or rejected request for recovery.
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
  if(localReceiptId)return <LocalFiscalReceiptScreen requestId={localReceiptId}/>;
  if(restoringReceipt)return <Spinner label={uiText('Loading checkout')}/>;
  const modes: TenderMode[] = ['cash', 'upi', ...(settings.data?.cardEnabled ? (['card'] as TenderMode[]) : []), 'credit', 'split'];

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Counter"
        title={t('checkout.title', 'Checkout')}
        actions={<Button href="/shop/sell" tone="quiet" size="sm">{uiText("← Back to counter")}</Button>}
      />

      <div className="pos">
        <div className="pos-catalog">
          <Notice error={gstError ?? error} />
          {confirmOld ? (
            <Card>
              <p>{uiText("This bill was started too long ago. Charging it now creates a new bill only after you confirm.")}</p>
              <div className="mt-3">
                <Button href="/shop/settings/gst/recovery">{uiText("Review saved bill")}</Button>
              </div>
            </Card>
          ) : null}

          <RspCheckoutControls available={settings.data?.gstRspBillingAvailable===true} regular={gstContext?.settings.registration==='regular'}/>
          <section>
            <SectionHead title={t('checkout.payment_method', 'Payment')} />
            <div className="shop-seg is-wrap" role="tablist" aria-label={t('checkout.payment_method', 'Payment method')}>
              {modes.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={mode === item} className={cx(mode === item && 'is-active')} onClick={() => remember(item)}>
                  {t(`pos.method.${item}`, MODE_LABELS[item])}
                </button>
              ))}
            </div>
          </section>

          {offlineSaved ? (
            <Card>
              <p>{uiText("Checkout saved on this browser. Server confirmation is pending.")}</p>
              <div className="mt-3">
                <Button onClick={() => void handleCharge(false)} disabled={busy}>{busy ? uiText('Sending…') : uiText('Retry saved checkout')}</Button>
              </div>
            </Card>
          ) : null}

          {mode === 'credit' ? (
            <Card className="grid gap-3">
              <h3 className="shop-section-title">{t('pos.method.credit', 'Udhaar')}</h3>
              {udhaarLocked ? <PremiumLock feature="udhaar" /> : (
                <p className="party-meta">{hasCustomer ? t('checkout.customer_title', 'Customer') + ': ' + cartApi.cart.customerName : uiText('Add a customer. Udhaar needs a name on the bill.')}</p>
              )}
            </Card>
          ) : null}

          {mode === 'card' ? (
            <Card>
              <h3 className="shop-section-title">{t('pos.method.card', 'Card')}</h3>
              <p className="party-meta">{uiText("Record")} {formatINR(total)} {uiText("as paid by card. The terminal is outside this page.")}</p>
            </Card>
          ) : null}

          {mode === 'split' ? (
            <Card className="grid gap-4">
              <div className="form-grid is-3">
                <Field label={t('pos.method.cash', 'Cash')}>
                  <input className={inputClass} inputMode="decimal" value={split.cash} onChange={(event) => setSplit((current) => ({ ...current, cash: event.target.value }))} />
                </Field>
                <Field label={t('pos.method.upi', 'UPI')}>
                  <input className={inputClass} inputMode="decimal" value={split.upi} onChange={(event) => setSplit((current) => ({ ...current, upi: event.target.value }))} />
                </Field>
                <Field label={t('pos.method.credit', 'Udhaar')}>
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
                <h3 className="shop-section-title">{t('pos.method.cash', 'Cash')}</h3>
                <span className="num text-sm text-muted">{uiText("Due")} {formatINR(cashPortion)}</span>
              </div>
              <div className="tender-chips">
                <Button tone="ghost" onClick={() => setTendered(String(cashPortion))}>{t('checkout.exact', 'Exact')}</Button>
                {CHIPS.map((chip) => (
                  <Button key={chip} tone="ghost" onClick={() => setTendered(String(roundPaise(Number(currentTendered || 0) + chip)))}>+{chip}</Button>
                ))}
              </div>
              <div className="form-grid is-2 items-end">
                <Field label={t('checkout.cash_received', 'Cash received')}>
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
                <h3 className="shop-section-title">{t('pos.method.upi', 'UPI')}</h3>
                <span className="num text-sm text-muted">{uiText("Due")} {formatINR(upiPortion)}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                {settings.data?.upiVpa ? (
                  <UpiQr text={upiText} label={settings.data.upiVpa} />
                ) : settings.data?.upiQrImage ? (
                  <img src={settings.data.upiQrImage} alt="Uploaded UPI QR" className="w-52 rounded-lg bg-white p-2" />
                ) : (
                  <p className="text-sm text-muted"> {uiText("No UPI QR is on file. The sale can still be recorded as UPI.")} {perms.canManageShop ? <Link className="ml-2 text-saffron" href="/shop/settings/payments">{t('checkout.setup_upi', 'Add UPI')}</Link> : null}
                  </p>
                )}
                <Field label={t('checkout.upi_ref', 'UPI reference')} hint={`${t('checkout.optional', 'Optional')}. The last digits of the transaction id.`}>
                  <input className={inputClass} value={upiRef} onChange={(event) => setUpiRef(event.target.value)} />
                </Field>
              </div>
            </Card>
          ) : null}

          <Card className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="shop-section-title">{t('checkout.customer_title', 'Customer')}</h3>
              <span className="text-sm text-muted">{creditPortion > 0 ? t('checkout.upi_ref_required', 'Required for udhaar') : t('checkout.optional', 'Optional')}</span>
            </div>
            <CustomerAttach gst />
            {creditBlocked ? <p className="text-sm text-danger">{t('checkout.credit_needs_customer', 'Udhaar needs a customer on the bill.')}</p> : null}
            {udhaarLocked && mode === 'split' ? <PremiumLock feature="udhaar" /> : null}
          </Card>

          {cartApi.cart.lines.some(line=>line.rsp)&&cartApi.cart.billDiscount>0?<Card className="grid gap-3"><Field label={text('Discount review reference')}><input className={inputClass} value={cartApi.cart.mixedDiscountReview?.evidenceReference??''} onChange={e=>cartApi.patch({mixedDiscountReview:e.target.value.trim()?{policy:'commercial_amount_proportional_v1',reviewed:true,evidenceReference:e.target.value}:undefined})}/></Field><p className="text-sm text-muted">{text('The bill discount is shared between products in proportion to their selling value. Confirm the review reference before charging.')}</p></Card>:null}
          <Card className="form-grid is-2">
            <Field label={t('checkout.bill_discount', 'Bill discount')} hint={t('bill.discount', 'Applied to the whole bill.')}>
              <div className="shop-input-wrap">
                <span className="shop-input-prefix">₹</span>
                <input className={cx(inputClass, 'num')} inputMode="decimal" value={cartApi.cart.billDiscount || ''} onChange={(event) => cartApi.patch({ billDiscount: Number(event.target.value || 0) })} />
              </div>
            </Field>
            <Field label={t('checkout.note_placeholder', 'Note')}>
              <input className={inputClass} value={cartApi.cart.note} onChange={(event) => cartApi.patch({ note: event.target.value })} placeholder={t('checkout.note_placeholder', 'Printed on the bill')} />
            </Field>
          </Card>
        </div>

        <aside className="bill shop-surface" aria-label={uiText("Bill summary")}>
          <div className="bill-head">
            <h2>{t('bill.bill', 'Bill')}</h2>
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
              <span>{t('bill.subtotal', 'Subtotal')}</span>
              <span className="num">{formatINR(totals.subtotal)}</span>
            </div>
            {totals.tax?<div className="bill-total-row"><span>{text('GST')} · {text(gstContext?.priceMode==='inclusive'?'GST included':'GST added')}</span><span>{formatINR(totals.tax.tax)}</span></div>:null}
            {totals.mixed?<div className="bill-total-row"><span>{text('GST')}</span><span>{formatINR(Number(totals.mixed.tax))}</span></div>:null}
            {roundingEnabled&&!gstError?<div className="bill-total-row"><span>{text('Round off')}</span><span>{formatINR(roundOff)}</span></div>:null}
            {totals.discount > 0 ? (
              <div className="bill-total-row">
                <span>{t('bill.discount', 'Discount')}</span>
                <span className="num">−{formatINR(totals.discount)}</span>
              </div>
            ) : null}
            {mode ? (
              <div className="bill-total-row">
                <span>{uiText("Paying by")}</span>
                <span>{MODE_LABELS[mode]}</span>
              </div>
            ) : null}
            <div className="bill-total-row is-grand">
              <span>{t('bill.total', 'Total')}</span>
              <strong className="num">{formatINR(total)}</strong>
            </div>
            <div className="bill-charge">
              <Button size="lg" block disabled={!canCharge || busy} onClick={() => void handleCharge(false)}>
                {busy ? 'Charging…' : `Charge ${formatINR(total)}`}
              </Button>
            </div>
            <p className="text-center text-xs text-faint">{uiText("One bill per charge. A retry after a network drop reuses the same bill.")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UpiQr({ text, label }: { text: string; label: string }) {
  const uiText = useUiText();
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
      {src ? <img src={src} alt={`UPI QR for ${label}`} width={200} height={200} className="rounded-lg bg-white p-2" /> : <p className="text-muted">{uiText("Preparing QR…")}</p>}
      <p className="mt-2 text-center text-sm text-muted">{label}</p>
    </div>
  );
}
