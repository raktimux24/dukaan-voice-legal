'use client';
import {saleCollectionStatus,saleCollectionLabel} from '../../../lib/shop/sale-collection';
import Link from 'next/link';
import {printDocument} from '../../../lib/shop/gst-print';
import {textFontCss} from '../../../lib/shop/documents/fonts';
import {counterReturn} from '../../../lib/shop/counter/query';
import {IssuedDocumentButton} from '../document-preview';

import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {useRef,useEffect, useState } from 'react';
import { GstDocuments } from '../gst-documents';
import { GstSaleAdjustments } from '../gst-sale-adjustments';
import { ApiError } from '../../../lib/shop/api';
import { formatINR } from '../../../lib/shop/money';
import { useShopDates } from '../use-shop-dates';
import type { PaymentMethod } from '../../../lib/shop/types';
import { formatQty } from '../../../lib/shop/units';
import { shareBill, type ShareBillInput } from '../../../lib/shop/share-bill';
import {recoverFinancialRequest} from '../../../lib/shop/gst-recovery';
import { financialScope, assertScope,retainedRequests } from '../../../lib/shop/gst-storage';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Pill, Spinner, inputClass, isDenied } from '../ui';

const METHOD: Record<string, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', credit: 'Udhaar' };

export function SaleDetailScreen({ saleId }: { saleId: string }) {
  const uiText = useUiText();
  const { formatWhen } = useShopDates();
  const { api, shop,userId,offline, perms, hideCost, setNotice, t } = useShop();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const saleQuery = useQuery({
    queryKey: ['sale', shop?.id, saleId],
    enabled: !!shop?.id,
    queryFn: () => api.getSale(shop!.id, saleId),
  });
  const settings = useQuery({
    queryKey: ['pos', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getPosSettings(shop!.id),
  });
  const savedReturn=useQuery({queryKey:['counterReturnPending',shop?.id,userId,saleId],enabled:!!shop&&perms.canVoidOrReturn,networkMode:'always',queryFn:async()=>{const scope=financialScope(shop!.id);const rows=await retainedRequests(scope);assertScope(scope);return rows.find(r=>r.state==='pending'&&r.path===`/api/shops/${shop!.id}/sales/${saleId}/returns`)??null}});
  const [voidReason, setVoidReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returns, setReturns] = useState<Record<string, string>>({});
  const [refund, setRefund] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const receipt=useRef<HTMLElement>(null),alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
  const [printing,setPrinting]=useState(false);
  const sale = saleQuery.data;

  if (!shop) return <Spinner />;
  if (saleQuery.isLoading) return <Spinner label={uiText("Loading bill")} />;
  if (isDenied(saleQuery.error)) return <NoAccess what={uiText("You cannot open this bill.")} />;
  if(saleQuery.error)return <Card><Notice error={saleQuery.error}/><p>{t('counter.bill_connection','')}</p><div className="shop-actions"><Button tone="ghost" onClick={()=>void saleQuery.refetch()}>{t('common.retry','')}</Button><Button href="/shop/settings/gst/recovery" tone="ghost">{t('counter.recovery','')}</Button></div></Card>;
  if (!sale) return <Card><p>{uiText("That bill was not found.")}</p></Card>;

  const shortfalls = sale.items.filter((item) => (item.shortfall ?? 0) > 0);
  const windowHours = settings.data?.voidWindowHours;
  const withinWindow = windowHours == null || Date.now() - new Date(sale.soldAt).getTime() <= windowHours * 60 * 60 * 1000;
  const returnable = sale.items.filter((item) => item.quantity - item.returnedQuantity > 0);
  const pos = settings.data;
  const showCost = !hideCost && sale.showCost !== false && sale.costTotal != null;
  const recorded = params.get('recorded');
  const methods = [...new Set(sale.payments.filter(payment=>payment.kind!=='refund').map((payment) => t('pos.method.'+payment.method,payment.method)))];

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sale', shop.id, saleId] });
    await queryClient.invalidateQueries({ queryKey: ['sales', shop.id] });
    await queryClient.invalidateQueries({ queryKey: ['catalog', shop.id] });
    await Promise.all(['refunds','counterReturnPending','cashbook','customerCredit','followup','followups'].map(k=>queryClient.invalidateQueries({queryKey:[k,shop.id]})));
  };

  const share = async () => {
    const payload: ShareBillInput = {
      shopName: pos?.shopName || shop.name,
      address: pos?.shopAddress,
      phone: pos?.shopPhone,
      saleNumber: sale.saleNumber,
      when: formatWhen(sale.soldAt),
      lines: sale.items.map((item) => ({
        name: item.name,
        detail: `${formatQty(item.quantity, item.unit)} × ${formatINR(item.unitPrice)}`,
        amount: formatINR(item.lineTotal),
      })),
      subtotal: formatINR(sale.subtotal),
      discount: sale.discountAmount > 0 ? `−${formatINR(sale.discountAmount)}` : null,
      total: formatINR(sale.total),
      payments: sale.payments.map((payment) => {
        const label = t(`pos.method.${payment.method}`, METHOD[payment.method] ?? payment.method);
        const extra = [
          payment.tendered != null ? `${t('checkout.cash_received', 'Cash received')} ${formatINR(payment.tendered)}` : null,
          payment.changeGiven ? `${t('checkout.change', 'Change to return')} ${formatINR(payment.changeGiven)}` : null,
        ].filter(Boolean).join(' · ');
        return extra ? `${label} · ${extra} · ${formatINR(payment.amount)}` : `${label} · ${formatINR(payment.amount)}`;
      }),
      footer: pos?.billFooter,
      labels: {
        bill: t('bill.bill', 'Bill'),
        subtotal: t('bill.subtotal', 'Subtotal'),
        discount: t('bill.discount', 'Discount'),
        total: t('bill.total', 'Total'),
        thanks: t('bill.thanks', 'Thank you'),
      },
    };
    if(sale.gstSnapshot||sale.mixedGstSnapshot){setError(new Error(t("bill.use_verified_gst_document", "Use the verified GST document above to print or download this bill.")));return;}
    setSharing(true);
    try {
      const scope = financialScope(shop.id);
      const result = await shareBill(payload, () => { api.assertSession(); assertScope(scope); });
      if (result === 'copied') setNotice(t('bill.share_copied', 'Bill text copied.'));
      if (result === 'downloaded') setNotice(t('bill.share_downloaded', 'Bill image downloaded.'));
    } catch (error) {
      setError(error instanceof Error && error.message === 'Could not share or download this bill. Try again.'
        ? new Error(t('bill.share_failed', error.message)) : error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="shop-page">
      <div className="no-print">
        <PageHeader
          back={{ href: counterReturn(params.get('returnTo')), label: t('sales.title','Sales') }}
          kicker={t('counter.'+(recorded==='new'?'sale_recorded':recorded==='again'?'already_recorded':'bill'),'')}
          title={t('counter.bill_number','',{number:sale.saleNumber})}
          description={`${formatWhen(sale.soldAt)}${sale.customer ? ` · ${sale.customer.name}` : ''}`}
        />
      </div>
      <Notice error={error} />
      <Card className="no-print bill-current-summary"><p className="sale-complete-total num">{formatINR(sale.total)}</p><p className="party-meta">{t('collection.at_checkout','')}{': '}{methods.join(' + ')}</p><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="shop-section-title">{t('collection.current','')}</h2><Pill tone={sale.status==='voided'?'danger':['paid','settled'].includes(saleCollectionStatus(sale))?'ok':'warn'}>{t(saleCollectionLabel(saleCollectionStatus(sale)),'')}</Pill></div>
        {sale.status!=='voided'&&sale.collection?.remainingCredit!=null?<p className="mt-2">{t('collection.balance_due','',{amount:formatINR(Number(sale.collection.remainingCredit))})}</p>:null}
        <Button tone="ghost" disabled={saleQuery.isFetching||offline} onClick={()=>void saleQuery.refetch()}>{t('sale_detail.refresh_balance','')}</Button>
      </Card>
      {savedReturn.isError?<Card><p role="alert">{t('counter.recovery_storage_error','')}</p></Card>:null}
      {savedReturn.data?<Card><p>{t('counter.pending_outcomes','',{n:1})}</p><Button disabled={pending||offline} onClick={()=>{setPending(true);setError(null);void recoverFinancialRequest(api,shop.id,savedReturn.data!).then(refresh).catch(setError).finally(()=>setPending(false))}}>{t('credit.retry','')}</Button><Button href="/shop/settings/gst/recovery" tone="ghost">{t('counter.recovery','')}</Button></Card>:null}
      {sale.estimateId?<Link className="button button-muted" href={'/shop/estimates?id='+sale.estimateId}>{t('estimates.bill_source','View source estimate')}</Link>:null}
      {sale.gstSnapshot||sale.mixedGstSnapshot?<><details className="retail-details"><summary>{t('web.gst.verified_documents','')}</summary><div><GstDocuments saleId={sale.id}/></div></details>{<GstSaleAdjustments sale={sale}/>}</>:null}
      <div className={sale.documentPresentation||sale.gstSnapshot||sale.mixedGstSnapshot?"sale-stage has-issued-document":"sale-stage"}>
        <article ref={receipt} className={sale.documentPresentation||sale.gstSnapshot||sale.mixedGstSnapshot?"receipt legacy-receipt-hidden":"receipt"} aria-label={t('counter.bill_number','',{number:sale.saleNumber})}>
          <header className="receipt-head">
            <p className="receipt-shop">{pos?.shopName || shop.name}</p>
            {pos?.shopAddress ? <p>{pos.shopAddress}</p> : null}
            {pos?.shopPhone ? <p>{pos.shopPhone}</p> : null}
            {pos?.billHeader ? <p>{pos.billHeader}</p> : null}
          </header>
          <div className="receipt-rule" />
          <div className="receipt-meta">
            <span>{uiText("Bill #")}{sale.saleNumber}</span>
            <span>{formatWhen(sale.soldAt)}</span>
          </div>
          <p className={sale.status === 'voided' ? 'receipt-status is-voided' : 'receipt-status'}>
            {t('collection.at_checkout','')}{': '}{sale.status === 'voided'?t('sales.status_filter.voided',''):sale.paymentStatus==='credit'?t('counter.unpaid',''):sale.paymentStatus==='partial'?t('counter.part_paid',''):t('bill.paid','')}
          </p>
          {sale.customer ? <p className="receipt-customer">{sale.customer.name}{sale.customer.phone ? ` · ${sale.customer.phone}` : ''}</p> : null}
          <div className="receipt-rule" />
          <ul className="receipt-lines">
            {sale.items.map((item) => (
              <li key={item.id}>
                <div>
                  <p>{item.name}</p>
                  <p className="receipt-qty">
                    {formatQty(item.quantity, item.unit)} × {formatINR(item.unitPrice)}
                    {item.discountAmount > 0 ? ' · '+t('bill.discount','')+' '+formatINR(item.discountAmount) : ''}
                    {item.returnedQuantity > 0 ? ' · '+t('counter.returned_quantity','')+' '+formatQty(item.returnedQuantity,item.unit) : ''}
                  </p>
                </div>
                <b>{formatINR(item.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <div className="receipt-rule" />
          <dl className="receipt-totals">
            <div><dt>{uiText("Subtotal")}</dt><dd>{formatINR(sale.subtotal)}</dd></div>
            {sale.discountAmount > 0 ? <div><dt>{uiText("Discount")}</dt><dd>−{formatINR(sale.discountAmount)}</dd></div> : null}
            <div className="is-total"><dt>{uiText("Total")}</dt><dd>{formatINR(sale.total)}</dd></div>
          </dl>
          <ul className="receipt-pays">
            {sale.payments.map((payment) => (
              <li key={payment.id} className="receipt-pay">
                <span>
                  {t('pos.method.'+payment.method,payment.method)}
                  {payment.tendered != null || payment.changeGiven ? (
                    <span className="receipt-qty">
                      {payment.tendered != null ? t('checkout.cash_received','')+' '+formatINR(payment.tendered) : ''}
                      {payment.changeGiven ? `${payment.tendered != null ? ' · ' : ''}${t('checkout.change','')} ${formatINR(payment.changeGiven)}` : ''}
                    </span>
                  ) : null}
                </span>
                <b>{formatINR(payment.amount)}</b>
              </li>
            ))}
          </ul>
          {sale.creditTotal > 0 ? <p className="receipt-pay"><span>{uiText("On credit")}</span><span>{formatINR(sale.creditTotal)}</span></p> : null}
          {sale.returns.map((entry) => (
            <p key={entry.id} className="receipt-qty"> {uiText("Return")} {formatWhen(entry.createdAt)} · {formatINR(entry.refundAmount)}
              {entry.refundMethod ? ` by ${METHOD[entry.refundMethod] ?? entry.refundMethod}` : ''}
              {entry.reason ? ` · ${entry.reason}` : ''}
            </p>
          ))}
          {sale.returns.filter(r=>r.documentPresentation).map(r=><IssuedDocumentButton key={r.id} issued={r.documentPresentation!}/>)}
          {sale.note ? <p className="receipt-qty">{sale.note}</p> : null}
          {sale.voidReason ? <p className="receipt-qty">{uiText("Voided:")} {sale.voidReason}</p> : null}
          {showCost ? <p className="receipt-cost">{uiText("Cost")} {formatINR(sale.costTotal)}</p> : null}
          <p className="receipt-foot">{pos?.billFooter || 'Thank you'}</p>
        </article>
        <div className="sale-side no-print">
          <Card className="sale-summary">
            {recorded ? <p className="sale-complete-mark" aria-hidden="true">✓</p> : null}

            <div className="shop-actions">
              {sale.documentPresentationError?<p role="alert" className="text-danger">{t("documents.error.integrity","")}</p>:sale.documentPresentation?<IssuedDocumentButton issued={sale.documentPresentation}/>:<><Button onClick={() => void share()} disabled={sharing||!!sale.gstSnapshot||!!sale.mixedGstSnapshot}>{sharing ? t('common.loading','') : t('bill.share', 'Share bill')}</Button>
              <p className="text-sm text-muted">{t('counter.legacy_print','')}</p><Button tone="ghost" disabled={printing||!!(sale.gstSnapshot||sale.mixedGstSnapshot)} onClick={()=>{setPrinting(true);setError(null);const check=()=>{api.assertSession();if(!alive.current||!receipt.current)throw Error('counter_print_failed')};void textFontCss(JSON.stringify(sale)).then(fonts=>{check();return printDocument(receipt.current!,'#'+sale.saleNumber,fonts,check)}).catch(()=>setError(new Error(t('counter.print_failed','')))).finally(()=>{if(alive.current)setPrinting(false)})}}>{t('counter.print','')}</Button></>}
              {recorded ? <Button href="/shop/sell">{t('sale_complete.new_sale', 'New sale')}</Button> : null}
            </div>
          </Card>
          {sale.documentPresentation||sale.gstSnapshot||sale.mixedGstSnapshot?<Card><h2 className="shop-section-title">{t('estimates.mobile.items','')}</h2><div className="shop-list">{sale.items.map(item=><div key={item.id} className="shop-list-row"><div className="shop-list-main"><p className="shop-list-title">{item.name}</p><p className="shop-list-meta">{formatQty(item.quantity,item.unit)} × {formatINR(item.unitPrice)}{item.returnedQuantity>0?' · '+t('counter.returned_quantity','')+' '+formatQty(item.returnedQuantity,item.unit):''}</p></div><b className="num">{formatINR(item.lineTotal)}</b></div>)}</div></Card>:null}
          {shortfalls.length ? (
            <Card>
              <p className="font-semibold text-warn">{uiText("Sold more than was on hand")}</p>
              {shortfalls.map((item) => <p key={item.id} className="party-meta">{item.name}{uiText(": short by")} {formatQty(item.shortfall ?? 0, item.unit)}</p>)}
            </Card>
          ) : null}
        {perms.canVoidOrReturn && !sale.gstSnapshot && !sale.mixedGstSnapshot && sale.status === 'completed' ? (
          <div className="stack-form">
            <Card className="stack-form">
              <h2 className="shop-section-title">{t('sale_detail.void', 'Void')}</h2>
              <p className="shop-section-sub">
                {withinWindow
                  ? `Open for ${windowHours ?? 'the configured'} hours after the sale.`
                  : `The ${windowHours}-hour void window has closed.`}
              </p>
              <Field label={uiText("Reason")}>
                <input className={inputClass} value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder={uiText("Optional")} />
              </Field>
              <Button
                tone="danger"
                disabled={pending || !withinWindow}
                onClick={() => {
                  setPending(true);
                  setError(null);
                  void api.voidSale(shop.id, sale.id, voidReason || undefined).then(refresh).catch((caught: unknown) => {
                    if (caught instanceof ApiError && caught.code === 'already_voided') void refresh();
                    setError(caught);
                  }).finally(() => setPending(false));
                }}
              >
                {t('sale_detail.void', 'Void bill')}
              </Button>
            </Card>
            <Card className="stack-form">
              <h2 className="shop-section-title">{t('sale_return.title', 'Return')}</h2>
              <p className="shop-section-sub">{uiText("Enter how much of each line comes back. Returned stock is put on the shelf again.")}</p>
              {returnable.length === 0 ? <p className="party-meta">{uiText("Every line on this bill has already been returned.")}</p> : null}
              {returnable.map((item) => {
                const left = item.quantity - item.returnedQuantity;
                return (
                  <Field key={item.id} label={item.name} hint={`Up to ${formatQty(left, item.unit)}`}>
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={returns[item.id] ?? ''}
                      onChange={(event) => setReturns((current) => ({ ...current, [item.id]: event.target.value }))}
                    />
                  </Field>
                );
              })}
              <Field label={uiText("Refund")}>
                <select className={inputClass} value={refund} onChange={(event) => setRefund(event.target.value as PaymentMethod)}>
                  <option value="cash">{uiText("Cash")}</option>
                  <option value="upi">UPI</option>
                  {sale.customer ? <option value="credit">{uiText("Credit")}</option> : null}
                </select>
              </Field>
              <Field label={uiText("Reason")}>
                <input className={inputClass} value={returnReason} onChange={(event) => setReturnReason(event.target.value)} placeholder={uiText("Optional")} />
              </Field>
              <Button
                disabled={pending||offline||!savedReturn.isSuccess||!!savedReturn.data||returnable.length===0||!Object.values(returns).some(v=>Number(v)>0)||sale.items.some(i=>{const n=Number(returns[i.id]||0);return !Number.isFinite(n)||n<0||n>i.quantity-i.returnedQuantity||Math.abs(n*1000-Math.round(n*1000))>1e-6})}
                onClick={() => {
                  const items = sale.items
                    .map((item) => ({ saleItemId: item.id, quantity: Number(returns[item.id] || 0), restock: true }))
                    .filter((item) => item.quantity > 0);
                  if (!items.length) return;
                  setPending(true);
                  setError(null);
                  const total=Math.round(items.reduce((sum,r)=>{const item=sale.items.find(i=>i.id===r.saleItemId)!;return sum+item.lineTotal/item.quantity*r.quantity},0)*100)/100;
                  void api.gst.returnSale(shop.id,sale.id,{requestId:crypto.randomUUID(),items,refundMethod:refund,reason:returnReason},total).then(async () => {
                    setReturns({});
                    setReturnReason('');
                    await refresh();
                  }).catch(caught=>{setError(caught);void savedReturn.refetch()}).finally(() => setPending(false));
                }}
              >
                {t('sale_detail.return_items', 'Return items')}
              </Button>
            </Card>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
