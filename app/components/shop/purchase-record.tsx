"use client";
import type { PurchaseDetail } from '../../lib/shop/gst-types';
import { EN_FALLBACK } from '../../lib/shop/en-fallback';
import { formatINR } from '../../lib/shop/money';
import { formatQty, unitLabel } from '../../lib/shop/units';
import { reviewedCredit } from '../../lib/shop/purchases/presentation';
import { useShop } from './context';
import { useGstText, useFiscalDate } from './gst-ui';
import { ProductImageById } from './product-image';

export function PurchaseOverview({ detail }: { detail: PurchaseDetail }) {
  const {t} = useShop(), text = useGstText(), date = useFiscalDate();
  return <>
    <div className="invoice-overview"><div className="invoice-total"><span>{text("Invoice total")}</span><strong>{formatINR(Number(detail.grossAmount))}</strong><small>{date(detail.issuedAt)}</small></div>
      <dl className="invoice-balances"><div><dt>{t("invoiceweb.payable", "Owed to supplier")}</dt><dd>{formatINR(Number(detail.settlement.outstanding))}</dd></div><div><dt>{text("Recoverable")}</dt><dd>{formatINR(Number(detail.settlement.recoverable))}</dd></div><div><dt>{text("Purchase tax")}</dt><dd>{formatINR(Number(detail.taxAmount))}</dd></div><div><dt>{t("purchase.reviewed_itc", "Reviewed input tax credit")}</dt><dd>{formatINR(reviewedCredit(detail.ledger))}</dd></div></dl>
    </div>
    <section className="invoice-lines"><h2 className="shop-section-title">{t("products.title", "Products")} <small>· {detail.items.length}</small></h2>
      {detail.items.map(item => { const key=`gst.stock_action.${detail.snapshot.stockActions?.find(a=>a.purchaseItemId===item.id)?.action ?? (item.batchId ? 'legacy':'invoice_only')}`;
        return <article className="invoice-line" key={item.id}><div className="invoice-line-main"><ProductImageById productId={item.productId} name={item.name} size={42}/><div><strong>{item.name}</strong><small>{formatQty(Number(item.quantity), item.unit, {unitLabel:unit=>unitLabel(unit,t)})}</small></div><b>{formatINR(Number(item.grossAmount))}</b></div><div className="invoice-line-meta"><span>{t(key,EN_FALLBACK[key])}</span><span>{text("Purchase tax")} · {formatINR(Number(item.taxAmount))}</span></div></article>;
      })}
    </section>
  </>;
}
export function PurchaseHistory({detail}: {detail:PurchaseDetail}) {
  const {t} = useShop(), text=useGstText(), date=useFiscalDate();
  const method=(value:string)=>text(({cash:'Cash',upi:'UPI',bank:'Bank transfer',card:'Card'} as Record<string,string>)[value] ?? 'Unavailable');
  const kind=(value:string)=>text(({payment:'Payment to supplier',supplier_refund:'Refund received from supplier',payment_reversal:'Payment entry reversed',supplier_refund_reversal:'Refund entry reversed'} as Record<string,string>)[value] ?? 'Unavailable');
  return <section className="invoice-history">
    {!detail.settlements.length&&!detail.reviews.length&&!detail.returns.length&&!detail.costAdjustments.length ? <p className="invoice-empty">{t('empty.history_title','No history yet')}</p> : null}
    {!!detail.settlements.length && <section><h2>{text('Supplier payments and refunds')}</h2>{detail.settlements.map(row=><article key={row.id}><div><strong>{kind(row.kind)}</strong><b>{formatINR(Number(row.amount))}</b></div><p>{date(row.occurredAt)} · {method(row.method)}</p><p>{row.note}</p><small>{text('Evidence reference')} · {row.evidenceReference}</small></article>)}</section>}
    {!!detail.returns.length && <section><h2>{text('Supplier credit and return')}</h2>{detail.returns.map(row=><article key={row.id}><div><strong>{row.supplierCreditNumber}</strong><b>−{formatINR(Number(row.grossAmount))}</b></div><p>{date(row.issuedAt)}</p><p>{row.reason}</p><small>{text('Evidence reference')} · {row.evidenceReference}</small></article>)}</section>}
    {!!detail.reviews.length && <section><h2>{text('Review input tax')}</h2>{detail.reviews.map(row=><article key={row.id}><strong>{t(`purchase.decision_${row.decision}`,EN_FALLBACK[`purchase.decision_${row.decision}`])}</strong><p>{date(row.createdAt)}</p><p>{row.note}</p><small>{text('Evidence reference')} · {row.evidenceReference}</small></article>)}</section>}
    {!!detail.costAdjustments.length && <section><h2>{t('purchase.cost_adjustment',EN_FALLBACK['purchase.cost_adjustment'])}</h2>{detail.costAdjustments.map(row=><article key={row.id}><strong>{detail.items.find(item=>item.id===row.purchaseItemId)?.name}</strong><p>{date(row.createdAt)}</p><dl className="invoice-balances"><div><dt>{t('purchase.inventory',EN_FALLBACK['purchase.inventory'])}</dt><dd>{formatINR(Number(row.inventoryAdjustment))}</dd></div><div><dt>{t('purchase.consumed',EN_FALLBACK['purchase.consumed'])}</dt><dd>{formatINR(Number(row.consumedAdjustment))}</dd></div></dl></article>)}</section>}
  </section>;
}
