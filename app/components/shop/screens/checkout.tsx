'use client';
import {ProductPhotos} from '../product-photos';
import {checkoutMoney,checkoutPayment,checkoutDefault,checkoutUpiUri,type TenderMode} from '../../../lib/shop/checkout';
import {CheckoutSuggestions, CheckoutCustomerHistory} from '../checkout-context';
import {useCheckoutCredit,CheckoutCreditView} from '../../../lib/shop/credit/checkout';
import {cashWebUi} from './cashbook';
import {assertEstimateCart} from '../../../lib/shop/estimates/handoff';
import {hasLocalIssuedReceipt,verifyLocalIssuedReceipt} from '../../../lib/shop/local-issued-receipt';

import {CounterStatus} from '../counter-status';
import {canonicalJson} from '../../../lib/shop/gst-core/sale-request-canonical';
import {withFinancialLock,financialScope,retainedRequests,assertScope} from '../../../lib/shop/gst-storage';
import { useGstText as useUiText } from "../gst-ui";
import {attachCatalogTaxSnapshot,assertCartTaxSnapshots} from '../../../lib/shop/gst-core/gst-tax-cache';
import {RspCheckoutControls} from '../gst-rsp-checkout';
import {checkoutPayable} from '../../../lib/shop/checkout-payable';
import {assertRoundingSelection,roundingSelectionCurrent} from '../../../lib/shop/gst-core/payable-rounding-request';
import {cachedRspProductAt} from '../../../lib/shop/gst-core/gst-rsp-cache';


import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useBillingRouter as useRouter } from '../billing-shell';
import { useEffect, useRef, useState } from 'react';
import { issueSale } from '../../../lib/shop/gst-issuance';
import {releaseRejectedMixedCheckout} from '../../../lib/shop/checkout-rejection';
import {permitsOfflineShopFallback} from '../../../lib/shop/offline-shop-context';
import {premiumAt} from '../../../lib/shop/offline-premium';
import { validateContext, type GstContext } from '../../../lib/shop/gst-core/gst';
import { useGstText } from '../gst-ui';
import { ApiError } from '../../../lib/shop/api';
import { computeTotals, readCart, readPending, saleFingerprint, useCart, writePending } from '../../../lib/shop/cart';
import { formatINR, roundPaise } from '../../../lib/shop/money';
import { normalizeIndianMobile } from '../../../lib/shop/phone';
import type { CreateSalePayload } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PremiumLock, Spinner, Glyph, cx, inputClass } from '../ui';
import {LocalFiscalReceiptScreen} from './local-fiscal-receipt';
import {checkoutCustomer} from '../../../lib/shop/checkout-customer';
import {assertCartMrp,captureCartMrp,missingCartMrp,restoreCartMrp} from '../../../lib/shop/checkout-mrp';
import { CustomerAttach } from '../customer-attach';

// Same as the app: the next round sums a customer is likely to hand over.
// ₹87 → ₹90, ₹100, ₹500, ₹1,000; ₹640 → ₹650, ₹700, ₹1,000, ₹2,000.
function quickCashOptions(total: number): number[] {
  if (!Number.isFinite(total) || total <= 0) return [];
  const out = new Set<number>();
  for (const step of [10, 50, 100, 500, 1000, 2000]) {
    if (step < total / 100) continue;
    const value = Math.ceil(total / step) * step;
    if (value > total) out.add(value);
  }
  return [...out].sort((a, b) => a - b).slice(0, 4);
}


const MODE_LABELS: Record<TenderMode, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', credit: 'Udhaar', split: 'Split' };

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
  const missingMrp=missingCartMrp(cartApi.cart);
  const mrpRequired=!!settings.data?.gstSettings&&['regular','composition'].includes(settings.data.gstSettings.registration);
  // New carts carry their limit. Only older working drafts need a catalogue read;
  // the existing actor/session-scoped offline catalogue can recover them offline.
  const mrpSnapshot=useQuery({queryKey:['checkout-mrp',shop?.id,userId,...missingMrp],enabled:!!shop?.id&&!!userId&&mrpRequired&&!cartApi.pending&&missingMrp.length>0,networkMode:'always',queryFn:async()=>captureCartMrp(await api.getAllInventory(shop!.id,true),shop!.id,missingMrp)});
  useEffect(()=>{
    if(!shop||cartApi.pending||!mrpSnapshot.data||!missingMrp.length)return;
    const restored=restoreCartMrp(cartApi.cart,mrpSnapshot.data,shop.id);
    if(restored.lines.some((line,index)=>line!==cartApi.cart.lines[index]))cartApi.patch({lines:restored.lines});
  },[mrpSnapshot.data,cartApi,shop,missingMrp.length]);
  const productIds=cartApi.cart.lines.map(line=>line.productId);
  const taxSnapshot=useQuery({queryKey:['checkout-tax-snapshot',shop?.id,userId,...productIds],enabled:!!shop?.id&&!cartApi.pending&&taxRequired&&productIds.length>0,networkMode:'always',queryFn:()=>api.getTaxSnapshot(shop!.id,productIds)});
  const adoptedSnapshot=useRef<unknown>(null),attemptedSnapshot=useRef<unknown>(null);
  const [taxAdoptionError,setTaxAdoptionError]=useState<unknown>(null);
  useEffect(()=>{
    if(!shop||cartApi.pending||!taxSnapshot.data||attemptedSnapshot.current===taxSnapshot.data)return;
    attemptedSnapshot.current=taxSnapshot.data;
    try {
    const attached=attachCatalogTaxSnapshot(cartApi.cart.lines.map(line=>({product:{id:line.productId,...line}})),taxSnapshot.data,shop.id);
    const lines=cartApi.cart.lines.map((line,index)=>({...line,gstConfig:line.rsp?null:attached[index].product.gstConfig,gstTaxSnapshot:attached[index].product.gstTaxSnapshot,gstRspSnapshot:attached[index].product.gstRspSnapshot}));
    adoptedSnapshot.current=taxSnapshot.data;setTaxAdoptionError(null);cartApi.patch({lines});
    }catch(error){setTaxAdoptionError(error);}
  },[taxSnapshot.data,cartApi,shop]);
  const [previewAt,setPreviewAt]=useState(()=>new Date().toISOString());
  const [previewNow,setPreviewNow]=useState(()=>Date.now());
  const roundingEnabled=settings.data?.gstPayableRoundingAvailable===true;
  const rounding=useQuery({queryKey:['gst-rounding-selection',shop?.id,previewAt,userId],enabled:!!shop?.id&&roundingEnabled,networkMode:'always',queryFn:async()=>assertRoundingSelection(shop!.id,previewAt,await api.gst.roundingSelection(shop!.id,previewAt))});
  useEffect(()=>{if(!roundingEnabled)return;const timer=setInterval(()=>{const now=Date.now();setPreviewNow(now);if(rounding.data&&!roundingSelectionCurrent(rounding.data,now))setPreviewAt(new Date(now).toISOString());},1000);return()=>clearInterval(timer);},[roundingEnabled,rounding.data]);
  const [mode, setMode] = useState<TenderMode | null>(null);
  const [cashTendered, setCashTendered] = useState('');
  const [discountInput,setDiscountInput]=useState(()=>String(cartApi.cart.billDiscount||''));
  const discountValue=discountInput.trim()?checkoutMoney(discountInput):0;
  const discountValid=discountValue!==null;
  useEffect(()=>setDiscountInput(String(cartApi.cart.billDiscount||'')),[shop?.id,userId]);
  const [upiRef, setUpiRef] = useState('');
  const [split, setSplit] = useState({ cash: '', upi: '', credit: '', tendered: '' });
  const [error, setError] = useState<unknown>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const counterLease=useRef(false);
  const [localReceiptId,setLocalReceiptId]=useState<string|null>(null);
  const [restoringReceipt,setRestoringReceipt]=useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOld, setConfirmOld] = useState(false);
  const [collectionReviewed,setCollectionReviewed]=useState(false);
  const commerceCheckout=!!cartApi.cart.estimateSource?.commerceOrderId;
  useEffect(()=>setCollectionReviewed(false),[mode,cartApi.cart.estimateSource?.commerceOrderId,cartApi.cart.lines,cartApi.cart.billDiscount]);
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
        const row=(await retainedRequests(scope)).find(row=>row.state==='pending'&&row.path===`/api/shops/${shop.id}/sales`&&hasLocalIssuedReceipt(row));
        assertScope(scope);
        if(row&&cartApi.cart.lines.length===0){await verifyLocalIssuedReceipt(row,scope);assertScope(scope);if(!canceled){wentToBill.current=true;setLocalReceiptId(row.id);}}
      }catch{/* Unverified records remain available through recovery. */}
      finally{if(!canceled)setRestoringReceipt(false);}
    })();
    return()=>{canceled=true;};
  },[shop?.id,userId]);

  useEffect(() => {
    if(commerceCheckout){if(mode!=='cash'&&mode!=='upi')setMode('cash');return;}
    if (!shop || !userId || mode || !settings.data) return;
    let last:string|null=null;
    try {last=localStorage.getItem(`samaan-last-method:${userId}:${shop.id}`);} catch {/* Preferences are optional. */}
    setMode(checkoutDefault(cartApi.cart.paymentHint,last,settings.data.defaultPaymentMethod ?? 'cash',!!settings.data.cardEnabled));
  }, [mode, settings.data, shop, userId,commerceCheckout,cartApi.cart.paymentHint]);

  useEffect(() => {
    if (!offlineSaved) return;
    const retry = () => {
      if (charging.current) return;
      void chargeRef.current(false);
    };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [offlineSaved]);

  const gstContext:GstContext|null=settings.data?.gstSettings&&['regular','composition'].includes(settings.data.gstSettings.registration)?{settings:settings.data.gstSettings,priceMode:cartApi.cart.gstPriceMode??settings.data.gstSettings.priceMode,placeOfSupply:settings.data.gstSettings.stateCode,...cartApi.cart.buyer?{buyer:cartApi.cart.buyer}:{}}:null;
  let gstError:unknown=null;let totals;let roundOff=0;let gstLoading=false;
  try{
    if(taxAdoptionError&&taxRequired)throw taxAdoptionError;
    if(taxRequired){if(taxSnapshot.error||!taxSnapshot.data||adoptedSnapshot.current!==taxSnapshot.data){gstLoading=!taxSnapshot.error;throw taxSnapshot.error??Error('Refreshing product tax details.');}assertCartTaxSnapshots({gstTaxSnapshotsRequired:true,lines:cartApi.cart.lines},shop!.id,new Date().toISOString());}
    if(gstContext?.settings.registration==='regular')for(const line of cartApi.cart.lines){if(line.gstRspSnapshot?.profiles.length&&!line.rsp){let active=false;try{cachedRspProductAt(line.gstRspSnapshot,shop!.id,line.productId,new Date().toISOString());active=true;}catch{/* An inactive review does not enable RSP. */}if(active)throw Error('Review package details below before charging this product.');}}
    if(cartApi.cart.lines.some(line=>line.rsp)&&settings.data?.gstRspBillingAvailable!==true)throw Error('RSP billing is unavailable for this shop.');
    totals=computeTotals(cartApi.cart,gstContext);if(gstContext)validateContext(gstContext,totals.total);
    if(!cartApi.pending){if(missingMrp.length&&mrpSnapshot.error)throw mrpSnapshot.error;assertCartMrp(cartApi.cart,totals,gstContext);}
    if(roundingEnabled&&(rounding.error||!rounding.data||!roundingSelectionCurrent(rounding.data,previewNow))){gstLoading=!rounding.error;throw rounding.error??Error('Loading the current rounding policy.');}
    const payable=checkoutPayable(totals.total,shop?.id??'',gstContext,roundingEnabled,rounding.data?.selection?.policy,previewAt);
    roundOff=payable.roundOff;totals={...totals,total:payable.total};
  }catch(e){gstError=e;totals=computeTotals(cartApi.cart);}
  const total = totals.total;

  useEffect(() => {
    if (restoringReceipt || wentToBill.current || charging.current) return;
    if (shop && userId && cartApi.cart.lines.length === 0 && !cartApi.pending) router.replace('/shop/sell');
  }, [restoringReceipt, cartApi.cart.lines.length, cartApi.pending, router, shop, userId]);

  const payment=checkoutPayment(total,mode,cashTendered,split);
  const {cashPortion,upiPortion,creditPortion,cardPortion,tendered,remainder,cashShort}=payment;
  const hasCustomer = !!(cartApi.cart.customerId || cartApi.cart.customerName?.trim());
  const udhaarLocked = creditPortion > 0 && !premium;
  const creditBlocked = creditPortion > 0 && !hasCustomer;
  const creditReview=useCheckoutCredit(api.credit,shop?.id??'',userId??'',cartApi.cart.customerId??null,cartApi.cart.customerPhone??null,hasCustomer&&!cartApi.pending&&premium,creditPortion);
  const [estimateReviewed,setEstimateReviewed]=useState(false);
  const amountUnavailable=!!gstError||!settings.data||settings.isError||!!gstContext&&(settings.data.gstAvailable!==true||settings.data.gstProtocol!==2);
  const zeroRounded=!amountUnavailable&&total===0&&roundOff<0;
  // Waiting for tax details is not a failure: show it calmly, and only report a problem
  // when a read fails or it is still not ready after a few seconds.
  const amountLoading=amountUnavailable&&!cartApi.pending&&!settings.isError&&!(gstContext&&(settings.data?.gstAvailable!==true||settings.data?.gstProtocol!==2))&&(gstLoading||!settings.data&&settings.isPending);
  const [loadingSlow,setLoadingSlow]=useState(false);
  useEffect(()=>{if(!amountLoading){setLoadingSlow(false);return;}const timer=setTimeout(()=>setLoadingSlow(true),8000);return()=>clearTimeout(timer);},[amountLoading]);
  const calmLoading=amountLoading&&!loadingSlow;
  const cashInput=useRef<HTMLInputElement>(null),cashFocused=useRef(false);
  useEffect(()=>{
    // Put the cursor in "Cash received" once, when it first appears, unless the cashier is already typing elsewhere.
    const input=cashInput.current;if(cashFocused.current||!input)return;cashFocused.current=true;
    if(!document.activeElement||document.activeElement===document.body)input.focus();
  });
  const macKeys=typeof navigator!=='undefined'&&/Mac|iPhone|iPad/.test(navigator.platform??'');
  const upiReady=!!(settings.data?.upiVpa||settings.data?.upiQrImage);
  const upiBlocked=upiPortion>0&&!upiReady&&upiRef.trim().length<4;
  const canCharge = perms.canSell && !cartApi.pending && discountValid && payment.valid && (total>0||zeroRounded) && (!commerceCheckout||collectionReviewed) && cartApi.draft.state==='saved' && creditReview.valid && (!cartApi.cart.estimateSource||estimateReviewed) && !amountUnavailable && !!mode && (mode!=='card'||!!settings.data?.cardEnabled) && !udhaarLocked && remainder===0 && !cashShort && !creditBlocked && !upiBlocked && cartApi.cart.lines.length>0;
  const upiText=checkoutUpiUri(settings.data?.upiVpa,settings.data?.upiPayeeName||shop?.name||'Shop',upiPortion,!amountUnavailable&&payment.valid);
  if (!shop || !userId) return <Spinner label={uiText("Loading checkout")} />;

  const remember = (next: TenderMode) => {
    setMode(next);
    try {localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, next);} catch {/* Preferences are optional. */}
  };

  const buildBody = (soldAt: string, customerClientId: string | null, retained?:CreateSalePayload): Omit<CreateSalePayload, 'clientId'> => {
    const phone = cartApi.cart.customerPhone ? normalizeIndianMobile(cartApi.cart.customerPhone) : null;
    const payments = [
      cashPortion > 0 ? { method: 'cash' as const, amount: roundPaise(cashPortion), tendered: roundPaise(tendered) } : null,
      upiPortion > 0 ? { method: 'upi' as const, amount: roundPaise(upiPortion), reference: upiRef.trim() || undefined } : null,
      cardPortion > 0 ? { method: 'card' as const, amount: roundPaise(cardPortion) } : null,
      creditPortion > 0 ? { method: 'credit' as const, amount: roundPaise(creditPortion) } : null,
    ].filter((part) => part != null);
    if (payments.length === 0) payments.push({ method: 'cash', amount: 0, tendered: 0 });
    const customer=checkoutCustomer({...cartApi.cart,customerPhone:phone&&phone!=='invalid'?phone:null},customerClientId,retained);
    return {
      ...(cartApi.cart.estimateSource?{estimateSource:{...cartApi.cart.estimateSource,reviewed:estimateReviewed,...(commerceCheckout?{collectionConfirmed:collectionReviewed}:{})}}:{}),
      ...((retained?retained.documentPresentation:settings.data?.documentBranding?.ref)?{documentPresentation:retained?retained.documentPresentation:settings.data?.documentBranding?.ref}:{}),
      gstContext,
      mixedDiscountReview:cartApi.cart.mixedDiscountReview,
      ...(creditPortion>0&&creditReview.terms?{creditTerms:creditReview.terms}:{}),
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

  const chargeInsideLease = async (fresh: boolean) => {
    if(charging.current)return;
    if(!perms.canSell)return;
    let existing=readPending(userId,shop.id);
    if(existing && await releaseRejectedMixedCheckout(shop.id,existing)) {
      setError(new Error(t('checkoutweb.review_again','Review this bill again before confirming.')));
      return;
    }
    let payload:CreateSalePayload;
    let submittedCart=cartApi.cart;
    if(existing) {
      // Retry the immutable request, including original payments, tax and customer.
      // Current form values and refreshed settings must never rebuild a submitted bill.
      payload=existing.payload;
    } else {
      if(!canCharge)return;
      if(creditPortion>0&&!premiumAt(entitlement)){setError(new Error(t('checkout.customer_list_premium','Saved customers and udhaar balances are part of Premium.')));return;}
      const phone=cartApi.cart.customerPhone?normalizeIndianMobile(cartApi.cart.customerPhone):null;
      if(phone==='invalid'){setError(new Error(uiText('Enter a valid Indian mobile number.')));return;}
      let customerClientId=cartApi.cart.customerClientId;
      if(!cartApi.cart.customerId&&cartApi.cart.customerName?.trim()&&!customerClientId){customerClientId=crypto.randomUUID();cartApi.patch({customerClientId});submittedCart={...cartApi.cart,customerClientId};}
      assertCartMrp(cartApi.cart,computeTotals(cartApi.cart,gstContext),gstContext);
      const body=buildBody(new Date().toISOString(),customerClientId);
      payload={...body,clientId:cartApi.cart.estimateSource?.saleClientId??crypto.randomUUID()};
    }
    const clientId=payload.clientId;
    charging.current = true;
    setBusy(true);
    setError(null);
    try {
    if(payload.estimateSource&&!existing)assertEstimateCart(await api.estimates.get(shop.id,payload.estimateSource.estimateId),cartApi.cart);
    if(!existing)writePending(userId, shop.id, {clientId,payload,fingerprint:saleFingerprint((({clientId:_id,...body})=>body)(payload)),startedAt:Date.now()});

      const result = await issueSale(api,shop.id,payload);
      try {if (mode) localStorage.setItem(`samaan-last-method:${userId}:${shop.id}`, mode);} catch {/* A preference failure must not undo a verified bill. */}
      wentToBill.current = true;
      const recorded = result.deduplicated ? 'again' : 'new';
      router.replace(`/shop/sales/${result.sale.id}?recorded=${recorded}`);
      cartApi.clearCharged(clientId,submittedCart);
    } catch (caught) {
      const offline = permitsOfflineShopFallback(caught);
      if (offline) {
        try{
          const scope=financialScope(shop.id);
          const row=(await retainedRequests(scope)).find(row=>row.id===clientId);
          if(!payload.estimateSource&&row && hasLocalIssuedReceipt(row)){
            await verifyLocalIssuedReceipt(row,scope);assertScope(scope);
            wentToBill.current=true;
            setLocalReceiptId(clientId);
            cartApi.clearCharged(clientId,submittedCart);
            void queryClient.invalidateQueries({queryKey:['catalog',shop.id]});
            return;
          }
        }catch{/* An unverifiable receipt stays in recovery; never claim an issued bill. */}
        setOfflineSaved(true);
        setError(new Error(t('counter.outcome_unknown','')));
      } else if (caught instanceof ApiError && caught.code === 'sold_at_too_old') setConfirmOld(true);
      else if(((caught as any)?.code??(caught as any)?.message)?.startsWith('credit_'))setError(new Error(t('credit.error.'+((caught as any).code??(caught as any).message).slice(7),'')));
      else if(((caught as any)?.code??(caught as any)?.message)?.startsWith('commerce_'))setError(new Error(t('commerce.error.'+((caught as any).code??(caught as any).message).slice(9),'')));
      else if(((caught as any)?.code??(caught as any)?.message)?.startsWith('estimates_'))setError(new Error(t('estimates.error.'+((caught as any).code??(caught as any).message).slice(10),'')));
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

  const handleCharge=async(fresh:boolean)=>{if(counterLease.current)return;counterLease.current=true;setBusy(true);setError(null);const expected=canonicalJson(cartApi.cart);try{const active=financialScope(shop.id);await withFinancialLock(active,async()=>{api.assertSession();assertScope(active);if(canonicalJson(readCart(userId,shop.id))!==expected)throw Error(t('counter.draft_changed',''));await chargeInsideLease(fresh)},'counter-checkout')}catch(e){setError(e)}finally{counterLease.current=false;setBusy(false)}};

  const setTendered = (value: string) => {
    if (mode === 'split') setSplit((current) => ({ ...current, tendered: value }));
    else setCashTendered(value);
  };
  const currentTendered = mode === 'split' ? split.tendered : cashTendered;
  chargeRef.current = handleCharge;
  if(localReceiptId)return <LocalFiscalReceiptScreen requestId={localReceiptId}/>;
  if(restoringReceipt)return <Spinner label={uiText('Loading checkout')}/>;
  const modes: TenderMode[] = cartApi.cart.estimateSource?.commerceOrderId?['cash','upi']:['cash', 'upi', ...(settings.data?.cardEnabled ? (['card'] as TenderMode[]) : []), 'credit', 'split'];

  const tr=(key:string,fallback:string,values?:Record<string,string|number>)=>t('checkoutweb.'+key,fallback,values);
  const locked=busy||!!cartApi.pending||!perms.canSell;
  const reviewedLines=cartApi.pending?cartApi.pending.payload.items.map((item,index)=>({...item,key:String(index),name:item.name??t('bill.item','Item'),unit:item.unit??'',price:item.price??0,discount:item.discount??0,packSize:null,packLabel:null})):cartApi.cart.lines;
  const displayTotal=cartApi.pending?cartApi.pending.payload.payments.reduce((sum,p)=>sum+p.amount,0):total;
  const amountLabel=calmLoading?'…':amountUnavailable&&!cartApi.pending?t('checkout.amount_unavailable','Unavailable'):formatINR(displayTotal);
  const taxShown=!amountUnavailable&&!cartApi.pending?(totals.tax?.tax??(totals.mixed?Number(totals.mixed.tax??0):0)):0;
  const amountExplain=!amountUnavailable&&!cartApi.pending&&(taxShown>0||roundingEnabled&&roundOff!==0)?[taxShown>0?tr('includes_gst','Includes GST {{amount}}',{amount:formatINR(taxShown)}):null,roundingEnabled&&roundOff!==0?tr('round_off_line','Round off {{amount}}',{amount:formatINR(roundOff)}):null].filter(Boolean).join(' · '):'';
  const finalLabel=zeroRounded?t('checkout.no_payment_due','No payment due'):mode==='credit'?tr('record_credit','Record udhaar'):tr('confirm_payment','Confirm payment');
  const blockedReason=calmLoading?tr('getting_tax','Getting tax rates…'):amountUnavailable?tr('review_setup','Review billing details to see the amount due.'):
    !discountValid||!payment.valid?t('checkout.valid_money','Enter a valid amount with up to two decimal places.'):
    total<=0&&!zeroRounded?t('checkout.zero_total','Set a price before completing the bill.'):
    udhaarLocked?tr('premium_credit','Udhaar needs Premium access.'):
    creditBlocked?t('checkout.credit_needs_customer','Udhaar needs a customer on the bill.'):
    upiBlocked?tr('upi_required','Add a UPI reference of at least 4 characters, or set up your shop’s QR.'):
    remainder!==0?t(remainder>0?'checkout.split_remaining':'checkout.split_over','{{amount}}',{amount:formatINR(Math.abs(remainder))}):
    cashShort?t('checkout.cash_short','Cash received must cover the amount due. Use Split or Udhaar for an unpaid balance.'):
    creditPortion>0&&!creditReview.valid?tr('review_credit','Review the customer’s credit terms below.'):
    cartApi.cart.estimateSource&&!estimateReviewed?t('estimates.checkout_review','Review the estimate before billing.'):
    commerceCheckout&&!collectionReviewed?t('commerce.payment_help','Confirm collection before completing the bill.'):
    cartApi.draft.state!=='saved'?t('counter.draft_'+cartApi.draft.state,''):'';
  const methodIcons={cash:'wallet',upi:'qr',card:'card',credit:'user',split:'clipboard'} as const;
  const applyDiscount=(value:string)=>{setDiscountInput(value);const amount=value.trim()?checkoutMoney(value):0;if(amount!==null)cartApi.patch({billDiscount:amount});};
  const confirmKey=(event:React.KeyboardEvent)=>{if(event.key!=='Enter'||!(event.ctrlKey||event.metaKey)||event.defaultPrevented||event.repeat)return;event.preventDefault();if(!busy&&perms.canSell&&canCharge&&!cartApi.pending)void handleCharge(false);};
  const refreshBilling=()=>{void settings.refetch();if(taxRequired)void taxSnapshot.refetch();if(roundingEnabled)void rounding.refetch();if(missingMrp.length)void mrpSnapshot.refetch();};
  return (
    <div className="shop-page checkout-workspace" onKeyDown={confirmKey}>
      <header className="checkout-heading">
        <div><Button href="/shop/sell" tone="quiet" size="sm">← {tr('back','Back to bill')}</Button><h1>{t('checkout.title','Checkout')}</h1></div>
        <p>{tr('intro','Check the amount. Choose payment. Finish the bill.')}</p>
      </header>
      <Notice error={error}/>
      {cartApi.pending?<div className="checkout-pending" role="status"><Glyph name="shield"/><div><strong>{tr('pending_title','This bill is waiting for confirmation')}</strong><p>{tr('pending_help','Its items and payment are saved. Check the same bill again before starting another.')}</p></div><Button href="/shop/settings/gst/recovery" tone="ghost">{t('counter.recovery','Saved requests & recovery')}</Button></div>:null}
      {confirmOld?<Card><p>{uiText('This bill was started too long ago. Charging it now creates a new bill only after you confirm.')}</p><Button href="/shop/settings/gst/recovery">{uiText('Review saved bill')}</Button></Card>:null}
      <div className="checkout-sheet">
        <section className="checkout-amount" aria-label={t('checkout.amount_due','Amount due')}>
          <div><p>{t('checkout.amount_due','Amount due')}</p><strong className={cx('num',calmLoading&&'is-loading')} data-checkout-total aria-busy={calmLoading||undefined}>{amountLabel}</strong>{calmLoading?<p className="checkout-amount-note" role="status">{tr('getting_tax','Getting tax rates…')}</p>:amountExplain?<p className="checkout-amount-note">{amountExplain}</p>:null}</div>
          <div className="checkout-amount-meta"><Glyph name="receipt"/><span>{tr('item_count','Items on this bill · {{n}}',{n:reviewedLines.length})}</span>{gstContext&&!amountUnavailable?<small>{text(gstContext.settings.registration==='composition'?'Bill of supply':gstContext.priceMode==='inclusive'?'GST included':'GST added')}</small>:null}</div>
        </section>
        <details className="checkout-review" open={reviewedLines.length<=5||undefined}>
          <summary>{tr('review_bill','Review items & totals')}<span aria-hidden="true">＋</span></summary>
          <div className="checkout-review-body">
            {reviewedLines.map(line=><div className="checkout-review-line" key={line.key}><span><strong>{line.name}</strong><small>{formatQty(line.quantity,line.unit,{packSize:line.packSize,packLabel:line.packLabel})} × {formatINR(line.price)}</small></span><span className="num">{formatINR(Math.max(0,roundPaise(line.price*line.quantity-line.discount)))}</span></div>)}
            <ProductPhotos rows={(cartApi.pending?.payload.items??cartApi.cart.lines).map(item=>({productId:item.productId,name:item.name??t('bill.item','Item'),quantity:item.quantity,unit:item.unit??''}))} historical={false}/>
            {cartApi.pending?<div className="checkout-totals">{cartApi.pending.payload.payments.map((part,index)=><p key={index}><span>{t('pos.method.'+part.method,part.method==='credit'?'Udhaar':part.method)}</span><span>{formatINR(part.amount)}</span></p>)}</div>:null}
            {!amountUnavailable&&!cartApi.pending?<div className="checkout-totals"><p><span>{t('bill.subtotal','Subtotal')}</span><span>{formatINR(totals.subtotal)}</span></p>{totals.discount>0?<p><span>{t('bill.discount','Discount')}</span><span>−{formatINR(totals.discount)}</span></p>:null}{totals.tax||totals.mixed?<p><span>{text('GST')}</span><span>{formatINR(totals.tax?.tax??Number(totals.mixed?.tax??0))}</span></p>:null}{roundingEnabled?<p><span>{text('Round off')}</span><span>{formatINR(roundOff)}</span></p>:null}<p><strong>{t('bill.total','Total')}</strong><strong>{amountLabel}</strong></p></div>:null}
          </div>
        </details>
        {!cartApi.pending?<fieldset className="checkout-form" disabled={locked}>
          <legend className="sr-only">{t('checkout.payment_method','Payment method')}</legend>
          {amountUnavailable&&!cartApi.pending&&!calmLoading?<div className="checkout-setup" role="alert"><Notice error={gstError??settings.error}/><p>{tr('review_setup','Review billing details to see the amount due.')}</p><Button tone="ghost" onClick={refreshBilling}>{tr('refresh_billing','Refresh billing details')}</Button></div>:null}
          {!amountUnavailable&&!zeroRounded&&!cartApi.pending?<>
            <section className="checkout-payment">
              <h2><span className="checkout-step">01</span>{tr('how_paying','How is the customer paying?')}</h2>
              <div className="checkout-methods" role="group" aria-label={t('checkout.payment_method','Payment method')}>
                {modes.map(item=><button key={item} type="button" aria-pressed={mode===item} onClick={()=>remember(item)} className={cx(mode===item&&'is-active')}><Glyph name={methodIcons[item]}/><span>{t('pos.method.'+item,MODE_LABELS[item])}</span><i aria-hidden="true">{mode===item?'✓':''}</i></button>)}
              </div>
              {mode==='split'?<div className="checkout-split"><div className="form-grid is-3">{(['cash','upi','credit'] as const).map(part=><Field key={part} label={t('pos.method.'+part,MODE_LABELS[part])}><div className="checkout-rest"><input className={inputClass} aria-label={t('pos.method.'+part,MODE_LABELS[part])} inputMode="decimal" placeholder="0.00" value={split[part]} onChange={e=>setSplit(current=>({...current,[part]:e.target.value}))}/><button type="button" disabled={!payment.valid||remainder<=0} onClick={()=>setSplit(current=>({...current,[part]:String(roundPaise((checkoutMoney(current[part])??0)+remainder))}))}>{t('checkout.rest','Rest')}</button></div></Field>)}</div><p role="status" className={cx('shop-hint',payment.valid&&remainder===0?'text-ok':'text-warn')}>{!payment.valid?t('checkout.valid_money','Enter a valid amount with up to two decimal places.'):remainder===0?t('checkout.split_ok','Fully assigned'):t(remainder>0?'checkout.split_remaining':'checkout.split_over','{{amount}}',{amount:formatINR(Math.abs(remainder))})}</p></div>:null}
              {(mode==='cash'||mode==='split'&&cashPortion>0)?<div className="checkout-tender">
                <div><Field label={t('checkout.cash_received','Cash received')} hint={tr('exact_hint','Leave blank for the exact amount.')}><div className="shop-input-wrap"><span className="shop-input-prefix">₹</span><input ref={cashInput} className="shop-field is-lg num" inputMode="decimal" placeholder={cashPortion.toFixed(2)} value={currentTendered} onChange={e=>setTendered(e.target.value)}/></div></Field><div className="tender-chips"><Button tone="ghost" size="sm" onClick={()=>setTendered(cashPortion.toFixed(2))}>{t('checkout.exact','Exact')}</Button>{quickCashOptions(cashPortion).map(chip=><Button key={chip} tone="ghost" size="sm" onClick={()=>setTendered(String(chip))}>{formatINR(chip)}</Button>)}</div></div>
                <div className={cx('checkout-change',cashShort&&'is-short')} aria-live="polite"><span>{cashShort?tr('short','Still to receive'):t('checkout.change','Change to return')}</span><strong className="num">{payment.valid?formatINR(cashShort?roundPaise(cashPortion-tendered):payment.change):'—'}</strong><small>{tr('cash_due','Cash due: {{amount}}',{amount:formatINR(cashPortion)})}</small></div>
              </div>:null}
              {upiPortion>0&&payment.valid?<div className="checkout-upi">
                {upiText?<UpiQr text={upiText} label={settings.data!.upiVpa!} fallbackImage={settings.data?.upiQrImage??null}/>:settings.data?.upiQrImage?<img src={settings.data.upiQrImage} alt={tr('qr_alt','Shop payment QR code')} width={180} height={180}/>:<div className="checkout-qr-empty"><Glyph name="qr"/><p>{tr('no_qr','No shop QR is set up.')}</p>{perms.canManageShop?<Link href="/shop/settings/payments">{t('checkout.setup_upi','Set up UPI')}</Link>:null}</div>}
                <div><h3>{tr('upi_amount','Receive {{amount}} by UPI',{amount:formatINR(upiPortion)})}</h3><p className="shop-hint">{tr('upi_check','Check the payment in your UPI app before confirming this bill.')}</p>{!settings.data?.upiVpa&&settings.data?.upiQrImage?<p className="shop-hint">{tr('static_qr','Ask the customer to enter this amount when scanning.')}</p>:null}<Field label={t('checkout.upi_ref','UPI reference')} hint={upiReady?t('checkout.optional','Optional'):tr('upi_required','Add a UPI reference of at least 4 characters, or set up your shop’s QR.')}><input className={inputClass} value={upiRef} onChange={e=>setUpiRef(e.target.value)}/></Field></div>
              </div>:null}
              {mode==='card'?<div className="checkout-method-note"><Glyph name="card"/><p>{tr('card_help','Take {{amount}} on your card terminal, then confirm it here.',{amount:amountLabel})}</p></div>:null}
              {mode==='credit'?<div className="checkout-method-note"><Glyph name="user"/><p>{tr('credit_help','This amount goes on the customer’s udhaar. No payment is collected now.')}</p></div>:null}
            </section>
          </>:null}
          <section className="checkout-customer">
            <div className="checkout-section-head"><h2><span className="checkout-step">02</span>{t('checkout.customer_title','Customer')}</h2><span>{creditPortion>0?tr('credit_required','Required for udhaar'):t('checkout.optional','Optional')}</span></div>
            <CustomerAttach gst={!!gstContext} presentation="dialog" creditHistory buyerState={gstContext?.settings.stateCode} buyerDetailsRequired={!!gstContext&&(!!cartApi.cart.buyer?.gstin||total>=50000||!!gstError)}/>
            {hasCustomer?<CheckoutCustomerHistory customerId={cartApi.cart.customerId}/>:null}
            {creditBlocked?<p className="shop-hint text-warn">{t('checkout.credit_needs_customer','Udhaar needs a customer on the bill.')}</p>:null}
            {udhaarLocked?<PremiumLock feature="udhaar"/>:<CheckoutCreditView w={creditReview} ui={cashWebUi} t={(k,v)=>t(k,k,v)}/>}
          </section>
          <details className="checkout-adjustments" open={!discountValid||undefined}><summary>{tr('adjustments','Discount & bill note')}<span>{cartApi.cart.billDiscount?`−${formatINR(cartApi.cart.billDiscount)}`:'＋'}</span></summary><div className="form-grid is-2"><Field label={t('checkout.bill_discount','Bill discount')}><div className="shop-input-wrap"><span className="shop-input-prefix">₹</span><input className={inputClass} inputMode="decimal" value={discountInput} onChange={e=>applyDiscount(e.target.value)}/></div></Field><Field label={tr('note','Note on the bill')}><input className={inputClass} value={cartApi.cart.note} onChange={e=>cartApi.patch({note:e.target.value})}/></Field></div>{!discountValid?<p role="alert">{t('checkout.valid_money','Enter a valid amount with up to two decimal places.')}</p>:null}</details>
          {gstContext?<details className="checkout-adjustments"><summary>{t('gst.tax_details','Tax details')}<span>{gstContext.settings.registration==='composition'?text('Bill of supply'):text(gstContext.priceMode==='inclusive'?'GST included':'GST added')}</span></summary><div className="checkout-tax-body">{gstContext.settings.registration==='regular'?<Field label={t('checkout.change_price_mode','Change price mode')} hint={t('checkout.price_mode_help',"Use the shop's price basis unless the prices entered for this bill use a different basis. Included: ₹100 stays ₹100. Added: ₹100 at 5% becomes ₹105.")}><select className={inputClass} value={gstContext.priceMode} onChange={e=>cartApi.patch({gstPriceMode:e.target.value as 'inclusive'|'exclusive'})}><option value="inclusive">{text('GST included')}</option><option value="exclusive">{text('GST added')}</option></select></Field>:<p>{t('gst.product_price_no_collection','No GST is collected on this bill.')}</p>}</div></details>:null}
          <RspCheckoutControls available={settings.data?.gstRspBillingAvailable===true} regular={gstContext?.settings.registration==='regular'}/>
          {cartApi.cart.lines.some(line=>line.rsp)&&cartApi.cart.billDiscount>0?<Card><Field label={text('Discount review reference')}><input className={inputClass} value={cartApi.cart.mixedDiscountReview?.evidenceReference??''} onChange={e=>cartApi.patch({mixedDiscountReview:e.target.value.trim()?{policy:'commercial_amount_proportional_v1',reviewed:true,evidenceReference:e.target.value}:undefined})}/></Field><p className="shop-hint">{text('The bill discount is shared between products in proportion to their selling value. Confirm the review reference before charging.')}</p></Card>:null}
          {cartApi.cart.estimateSource?<Card><h2>{t('estimates.origin','',{number:cartApi.cart.estimateSource.number})}</h2><p>{t('estimates.checkout_help','')}</p><label className="opening-check"><input type="checkbox" checked={estimateReviewed} onChange={e=>setEstimateReviewed(e.target.checked)}/>{t('estimates.checkout_review','')}</label><Button tone="ghost" href={'/shop/estimates?id='+cartApi.cart.estimateSource.estimateId}>{t('estimates.bill_source','')}</Button></Card>:null}
          {commerceCheckout&&!amountUnavailable?<Card><label className="opening-check"><input type="checkbox" checked={collectionReviewed} onChange={e=>setCollectionReviewed(e.target.checked)}/>{t('commerce.confirm_collection','',{amount:total.toFixed(2)})}</label><p className="shop-hint">{t('commerce.payment_help','')}</p></Card>:null}
          {!cartApi.pending?<CheckoutSuggestions cartApi={cartApi}/>:null}
        </fieldset>:null}
        <footer className="checkout-confirm">
          <div><span>{cartApi.pending?tr('saved_bill','Saved bill'):t('checkout.amount_due','Amount due')}</span><strong className="num">{amountLabel}</strong></div>
          <div><Button size="lg" block disabled={busy||!perms.canSell||(!cartApi.pending&&!canCharge)} onClick={()=>void handleCharge(false)}>{busy?tr('confirming','Confirming…'):cartApi.pending?tr('retry','Check saved bill'):finalLabel}<span aria-hidden="true"> →</span></Button>{canCharge&&!busy?<p className="checkout-shortcut"><kbd className="shop-kbd">{macKeys?'⌘':tr('ctrl','Ctrl')}</kbd><kbd className="shop-kbd">{uiText('Enter')}</kbd> {tr('shortcut_confirm','confirms')}</p>:null}<p role="status">{!cartApi.pending&&blockedReason?blockedReason:mode==='credit'&&!cartApi.pending?tr('credit_help','This amount goes on the customer’s udhaar. No payment is collected now.'):zeroRounded?t('checkout.no_payment_due','No payment due'):cartApi.pending?tr('pending_title','This bill is waiting for confirmation'):tr('confirm_help','Confirm only after you have checked the payment.')}</p></div>
        </footer>
      </div>
      <details className="checkout-recovery" open={cartApi.draft.state==='error'||!!cartApi.pending||undefined}><summary>{t('counter.recovery','Saved requests & recovery')}</summary><CounterStatus cart={cartApi}/></details>
    </div>
  );

}

function UpiQr({ text, label, fallbackImage }: { text: string; label: string; fallbackImage: string|null }) {
  const uiText = useUiText();
  const {t}=useShop();
  const [qrImage,setQrImage]=useState<{text:string;src:string}|null>(null);
  const [attempt,setAttempt]=useState(0);
  const src=qrImage?.text===text?qrImage.src:null;
  useEffect(() => {
    let cancelled = false;setQrImage(null);
    void import('qrcode').then((qr) => qr.toDataURL(text, { margin: 1, width: 200 })).then((url) => {
      if (!cancelled) setQrImage({text,src:url});
    }).catch(()=>{if(!cancelled)setQrImage({text,src:''});});
    return () => {
      cancelled = true;
    };
  }, [text,attempt]);
  return (
    <div>
      {src ? <img src={src} alt={uiText("UPI QR")} width={200} height={200} className="rounded-lg bg-white p-2" /> : src===null ? <p className="text-muted" role="status">{uiText("Preparing QR…")}</p> : <div className="checkout-qr-failed">
        {fallbackImage?<><img src={fallbackImage} alt={t('checkoutweb.qr_alt','Shop payment QR code')} width={180} height={180}/><p className="shop-hint">{t('checkoutweb.static_qr','Ask the customer to enter this amount when scanning.')}</p></>:<p className="text-muted" role="alert">{t('checkoutweb.qr_failed','The QR could not be shown.')}</p>}
        <Button tone="ghost" size="sm" onClick={()=>setAttempt(n=>n+1)}>{t('checkoutweb.qr_again','Show QR again')}</Button>
      </div>}
      <p className="mt-2 text-center text-sm text-muted">{label}</p>
    </div>
  );
}
