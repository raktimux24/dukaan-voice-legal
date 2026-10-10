'use client';

import Link from 'next/link';
import {useState, type ReactNode} from 'react';
import type {StockReport} from '../../lib/shop/types';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import {formatINR} from '../../lib/shop/money';
import {labeledL1} from '../../lib/shop/catalog';
import {useShop} from './context';
import {Button, Card} from './ui';

export function StockInsights({report, showCost}: {report:StockReport; showCost:boolean}) {
  const {t}=useShop();
  const [showAll,setShowAll]=useState(false);
  const label=(key:string,vars?:Record<string,string|number>)=>t(key,EN_FALLBACK[key],vars);
  const section=(key:string,children:ReactNode,vars?:Record<string,string|number>)=><Card className="space-y-4"><h2 className="shop-section-title">{label(key,vars)}</h2>{children}</Card>;
  const metric=(key:string,value:ReactNode)=><div className="kpi"><p className="kpi-label">{label(key)}</p><p className="kpi-value">{value}</p></div>;
  const productLink=(id:string,name:string)=><Link className="shop-section-link whitespace-normal" href={`/shop/products/${id}`}>{name}</Link>;
  if(!report.premium)return null;
  return <>
    {report.byProduct?.length?section('reports.stock.by_product',<>
      <div className="overflow-x-auto"><table className="shop-table"><thead><tr>{['col_product','col_in','col_sold','col_adj','col_closing'].map(key=><th key={key}>{label(`reports.stock.${key}`)}</th>)}</tr></thead><tbody>
        {(showAll?report.byProduct:report.byProduct.slice(0,8)).map(row=><tr key={row.productId}><td>{productLink(row.productId,row.name)}<p className="shop-hint">{row.unit}{row.sellThroughPct!=null?` · ${label('reports.stock.sell_through',{pct:row.sellThroughPct})}`:''}{row.daysOfCover!=null?` · ${label('reports.stock.days_of_cover',{n:row.daysOfCover})}`:''}</p></td><td>{row.unitsIn}</td><td>{row.unitsSold}</td><td>{row.unitsAdjusted}</td><td>{row.closing}</td></tr>)}
      </tbody></table></div>
      {report.byProduct.length>8?<Button tone="ghost" onClick={()=>setShowAll(!showAll)}>{showAll?label('common.show_less'):label('reports.stock.show_all_n',{n:report.byProduct.length})}</Button>:null}
    </>):null}
    {report.movementByCategory?.length?section('reports.stock.by_category_movement',<div className="overflow-x-auto"><table className="shop-table"><thead><tr><th>{label('reports.sales.by_category')}</th>{['col_in','col_sold','col_adj'].map(key=><th key={key}>{label(`reports.stock.${key}`)}</th>)}<th>{label('sales.summary.revenue')}</th></tr></thead><tbody>{report.movementByCategory.map(row=><tr key={row.category}><td>{labeledL1(row.category,key=>label(key))}</td><td>{row.unitsIn}</td><td>{row.unitsSold}</td><td>{row.unitsAdjusted}</td><td>{formatINR(row.revenue)}</td></tr>)}</tbody></table></div>):null}
    {section('reports.stock.shrinkage',report.shrinkage?.totalUnits?<>
      <div className="kpi-grid">{metric('reports.stock.units_lost',report.shrinkage.totalUnits)}{showCost?metric('reports.stock.cost_lost',formatINR(report.shrinkage.totalCost)):null}{showCost&&report.shrinkage.pctOfCogs!=null?metric('reports.stock.pct_of_cogs',`${report.shrinkage.pctOfCogs}%`):null}</div>
      <div className="grid gap-3">{report.shrinkage.rows.map(row=><div key={row.reason} className="flex flex-wrap justify-between gap-3"><span>{EN_FALLBACK[`adjust.reason.${row.reason}`]?label(`adjust.reason.${row.reason}`):row.reason.replaceAll('_',' ')}</span><strong>{row.units} {label('reports.stock.units_short')}{showCost&&row.costValue!=null?` · ${formatINR(row.costValue)}`:''}</strong></div>)}</div>
    </>:<p className="shop-hint">{label('reports.stock.no_shrinkage')}</p>)}
    {section('reports.stock.slow_stock',report.slowStock?.items.length?<>
      {showCost?<p className="shop-hint">{label('reports.stock.value_tied_up',{amount:formatINR(report.slowStock.valueTiedUp)})}</p>:null}
      <div className="grid gap-3">{report.slowStock.items.slice(0,8).map(row=><div key={row.productId} className="flex flex-wrap justify-between gap-3">{productLink(row.productId,row.name)}<span>{row.onHand} {row.unit}{showCost&&row.costValue!=null?` · ${formatINR(row.costValue)}`:''} · {row.daysSinceSale==null?label('reports.stock.never_sold'):label('reports.stock.last_sold_days',{n:row.daysSinceSale})}</span></div>)}</div>
    </>:<p className="shop-hint">{label('reports.stock.no_slow_stock')}</p>,{days:report.slowStock?.thresholdDays??30})}
    {report.fastMovers?.length?section('reports.stock.fast_movers',<div className="grid gap-3">{report.fastMovers.slice(0,6).map(row=><div key={row.productId} className="flex flex-wrap justify-between gap-3">{productLink(row.productId,row.name)}<span>{row.onHand} {row.unit} · {label('reports.stock.per_day',{n:row.avgDailySold})} · {label('reports.stock.days_of_cover',{n:row.daysOfCover})}</span></div>)}</div>):null}
    {report.ageing?section('reports.stock.ageing',<>
      <div className="kpi-grid">{report.ageing.map(row=><div key={row.bucket} className="kpi"><p className="kpi-label">{label('reports.stock.age_days',{range:row.bucket})}</p><p className="kpi-value">{showCost?formatINR(row.costValue):row.units}</p></div>)}</div>
      {report.turnover?.turns!=null?<p className="shop-hint">{label('reports.stock.turnover',{turns:report.turnover.turns,days:report.turnover.daysOfInventory??'—'})}</p>:null}
    </>):null}
    {report.suppliers?.length?section('reports.stock.suppliers',<div className="grid gap-3">{report.suppliers.map(row=><div key={row.supplier} className="flex flex-wrap justify-between gap-3"><div><Link className="shop-section-link whitespace-normal" href={`/shop/suppliers/${encodeURIComponent(row.supplier)}`}>{row.supplier}</Link><p className="shop-hint">{label('reports.stock.supplier_line',{batches:row.batches,products:row.products,units:Math.round(row.units)})}</p></div>{showCost?<strong>{formatINR(row.costValue)}</strong>:null}</div>)}</div>):null}
  </>;
}
