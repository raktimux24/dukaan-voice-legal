'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import type {SalesReport} from '../../lib/shop/types';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import {formatDay,formatINR} from '../../lib/shop/money';
import {useShop} from './context';
import {Card} from './ui';

/** Uses the same server-authorized premium payload and cost visibility as mobile. */
export function SalesInsights({report,showCost}:{report:SalesReport;showCost:boolean}) {
  const {t,prefs}=useShop();
  const label=(key:string,vars?:Record<string,string|number>)=>t(key,EN_FALLBACK[key],vars);
  const section=(key:string,children:ReactNode)=><Card><h2 className="shop-section-title">{label(key)}</h2>{children}</Card>;
  const metric=(key:string,value:ReactNode)=><div className="kpi"><p className="kpi-label">{label(key)}</p><p className="kpi-value">{value}</p></div>;
  const correction=(amount?:number)=>amount?<p className="shop-hint">{label('reports.sales.value_corrections')}: {formatINR(amount)}</p>:null;
  return <>
    {report.runRate?section('reports.sales.projected_month',<><p className="kpi-value">{formatINR(report.runRate.projected)}</p><p className="shop-hint">{label('reports.sales.run_rate_note',{d:report.runRate.daysElapsed,n:report.runRate.daysInMonth})}</p></>):null}
    {report.premium&&report.customers?section('reports.sales.customers',<>
      <div className="kpi-grid">{metric('reports.sales.named_bills',`${report.customers.billsWithCustomer}/${report.customers.bills}`)}{metric('reports.sales.unique_customers',report.customers.uniqueCustomers)}{metric('reports.sales.new_customers',report.customers.newCustomers)}{metric('reports.sales.returning',report.customers.returningCustomers)}</div>
      <div className="grid gap-3">{report.customers.top.slice(0,5).map(row=><Link key={row.customerId} href={`/shop/customers/${row.customerId}`} className="shop-surface shop-card flex flex-wrap justify-between gap-3"><div><strong>{row.name}</strong><p className="shop-hint">{label('reports.sales.bills_n',{n:row.bills})}{row.owes>0?` · ${label('customers.owes',{amount:formatINR(row.owes)})}`:''}</p>{correction(row.fiscalCorrectionNet)}</div><strong>{formatINR(row.revenue)}</strong></Link>)}</div>
    </>):null}
    {report.premium&&report.summary.udhaar&&report.udhaarAgeing?section('reports.sales.udhaar',<>
      <div className="kpi-grid">{metric('reports.sales.udhaar_given',formatINR(report.summary.udhaar.givenInRange))}{metric('reports.sales.udhaar_collected',formatINR(report.summary.udhaar.collectedInRange))}{metric('reports.sales.collection_rate',report.udhaarAgeing.collectionRatePct==null?'—':`${Math.round(report.udhaarAgeing.collectionRatePct)}%`)}{metric('customers.outstanding',formatINR(report.udhaarAgeing.outstanding))}</div>
      <div className="grid gap-3">{report.udhaarAgeing.buckets.map(row=><div key={row.bucket} className="flex flex-wrap justify-between gap-3"><span>{row.bucket}</span><strong>{formatINR(row.amount)}</strong></div>)}</div>
      {report.udhaarAgeing.stale.length?<p className="shop-hint">{label('reports.sales.stale_udhaar',{n:report.udhaarAgeing.stale.length,names:report.udhaarAgeing.stale.slice(0,3).map(row=>row.name).join(', ')})}</p>:null}
      <Link className="shop-back" href="/shop/customers">{label('reports.sales.customers')} ›</Link>
    </>):null}
    {report.premium&&showCost&&report.marginByProduct?.products.length?section('reports.sales.margin_by_product',<>
      <div className="grid gap-3">{report.marginByProduct.products.slice(0,6).map((row,index)=><div key={row.productId??`${row.name}-${index}`} className="flex flex-wrap justify-between gap-3"><div><strong>{row.name}</strong><p className="shop-hint">{formatINR(row.revenue)} · {row.marginPct==null?'—':`${row.marginPct}%`}</p>{correction(row.fiscalCorrectionNet)}</div><strong>{formatINR(row.grossProfit)}</strong></div>)}</div>
      {report.marginByProduct.lowMarginBestSellers.length?<p className="shop-hint">{label('reports.sales.low_margin_sellers')}: {report.marginByProduct.lowMarginBestSellers.map(row=>`${row.name} (${row.marginPct??'—'}%)`).join(', ')} · {label('reports.sales.shop_margin',{pct:report.marginByProduct.overallMarginPct??0})}</p>:null}
    </>):null}
    {report.premium&&report.staff?.length?section('reports.sales.by_staff',<div className="grid gap-3">{report.staff.map(row=><div key={row.userId} className="shop-surface shop-card"><strong>{row.name}</strong><p className="shop-hint">{formatINR(row.revenue)} · {row.itemsPerBill} {label('reports.sales.items_short')}{row.voids?` · ${label('reports.sales.voids_n',{n:row.voids})}`:''}</p>{correction(row.fiscalCorrectionNet)}<dl className="grid gap-3 sm:grid-cols-3"><div><dt>{label('sales.summary.bills')}</dt><dd>{row.bills}</dd></div><div><dt>{label('sales.summary.avg_bill')}</dt><dd>{formatINR(row.avgBill)}</dd></div><div><dt>{label('reports.sales.disc_short')}</dt><dd>{formatINR(row.discounts)}</dd></div></dl></div>)}</div>):null}
    {report.premium&&report.paymentByDay&&report.paymentByDay.length>1&&report.paymentByDay.some(row=>row.cash!==0||row.upi!==0||row.card!==0||row.credit!==0)?section('reports.sales.payment_by_day',<div className="overflow-x-auto"><table className="gst-table"><thead><tr><th>{label('reports.sales.by_day')}</th>{(['cash','upi','card','credit'] as const).map(method=><th key={method}>{label(`pos.method.${method}`)}</th>)}</tr></thead><tbody>{report.paymentByDay.map(row=><tr key={row.date}><td>{formatDay(row.date,prefs?.appLanguage)}</td>{(['cash','upi','card','credit'] as const).map(method=><td key={method}>{formatINR(row[method])}</td>)}</tr>)}</tbody></table></div>):null}
    {report.premium&&report.boughtTogether?.length?section('reports.sales.bought_together',<div className="grid gap-3">{report.boughtTogether.slice(0,6).map((row,index)=><div key={`${row.a}-${row.b}-${index}`} className="flex flex-wrap justify-between gap-3"><span>{row.a} + {row.b}</span><strong>{label('reports.sales.times_n',{n:row.times})}</strong></div>)}</div>):null}
  </>;
}
