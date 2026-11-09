'use client';
import {useInfiniteQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {useShop} from '../context';
import {useFiscalDate} from '../gst-ui';
import {formatINR} from '../../../lib/shop/money';
import {CounterNotice,CounterFiltersView,useCounterFilters} from '../counter-filters';
import {Button,Card,PageHeader,PremiumLock,Spinner,isPremiumError} from '../ui';
export function RefundsScreen(){
 const {api,shop,userId,perms,t}=useShop(),when=useFiscalDate(),{filters,params,href,change}=useCounterFilters('refunds'),tr=(k:string,v?:Record<string,string|number>)=>t('counter.'+k,'',v);
 const awaitingRange=filters.period==='custom'&&(!filters.from||!filters.to||filters.from>filters.to);
 const refunds=useInfiniteQuery({queryKey:['refunds',shop?.id,userId,params],enabled:!!shop&&!!userId&&perms.canSeeReports&&!awaitingRange,initialPageParam:null as string|null,queryFn:({pageParam})=>api.getReturns(shop!.id,{...params,limit:50,cursor:pageParam??undefined}),getNextPageParam:last=>last.nextCursor??undefined});
 if(!shop)return <Spinner/>;if(!perms.canSeeReports)return <Card><h2>{tr('access_denied')}</h2><p>{tr('refunds_no_access')}</p></Card>;
 const rows=refunds.data?.pages.flatMap(p=>p.refunds)??[],first=refunds.data?.pages[0],summary=first?.summary;
 return <div className="shop-page sales-workspace refunds-workspace"><PageHeader title={tr('refunds_title')} back={{href:'/shop/sales',label:t('sales.title','Sales')}} description={tr('refund_period_help')} actions={<Button tone="ghost" disabled={refunds.isFetching||awaitingRange} onClick={()=>void refunds.refetch()}>{tr('refresh')}</Button>}/>
 {summary?<><dl className="sales-metrics"><div className="is-leading"><dt>{tr('return_value')}</dt><dd>{formatINR(summary.amount)}</dd></div><div><dt>{t('refunds.summary.count','')}</dt><dd>{summary.count}</dd></div><div><dt>{tr('money_refunded')}</dt><dd>{formatINR(summary.moneyRefund??0)}</dd></div><div><dt>{tr('credit_reduced')}</dt><dd>{formatINR(summary.creditReduction??0)}</dd></div></dl><div className="refund-methods">{Object.entries(summary.byMethod).filter(([method,value])=>method!=='credit'&&value>0).map(([method,value])=><span key={method}>{t('pos.method.'+method,method)} <b className="num">{formatINR(value)}</b></span>)}</div></>:null}
 {first?.limitedToDays?<p className="shop-hint">{t('activity.free_limit_title','',{days:first.limitedToDays})}</p>:null}
 <section className="sales-register"><CounterFiltersView kind="refunds" value={filters} onChange={change}/>
 {isPremiumError(refunds.error)?<PremiumLock feature="pos_reports"/>:<CounterNotice error={refunds.error}/>}{awaitingRange?<p role="status">{tr('error.invalid_range')}</p>:null}{!awaitingRange&&refunds.isPending?<Spinner/>:null}
 <div className="refund-ledger">{rows.map(row=>{const money=row.moneyRefund??Number(row.settlement?.moneyRefund??0),credit=row.creditReduction??Number(row.settlement?.creditReduction??0);return <article key={row.id} className="refund-entry"><Link href={'/shop/sales/'+row.saleId+'?returnId='+row.id+'&returnTo='+encodeURIComponent(href)} className="refund-entry-link"><div><h2>{row.invoiceNumber??'#'+row.saleNumber}</h2><p className="shop-hint">{when(row.createdAt)}</p><p>{row.firstItem&&row.itemCount===1?row.firstItem:tr('refund_items',{n:row.itemCount})}{row.customerName?' · '+row.customerName:''}</p></div><div className="refund-entry-amount"><strong className="num">−{formatINR(row.refundAmount)}</strong><span>{tr('open_original')} ↗</span></div></Link><dl className="refund-settlement"><div><dt>{tr('money_refunded')}{row.refundMethod&&money?' · '+t('pos.method.'+row.refundMethod,row.refundMethod):''}</dt><dd>{formatINR(money)}</dd></div><div><dt>{tr('credit_reduced')}</dt><dd>{formatINR(credit)}</dd></div></dl><details className="refund-reference"><summary>{tr('return_reference')}</summary><p>{row.id}</p>{row.reason?<p>{row.reason}</p>:null}</details></article>})}{refunds.isSuccess&&!rows.length?<p className="shop-list-empty">{tr('no_refunds')}</p>:null}</div>
 <footer className="sales-register-footer"><p className="shop-hint">{tr('snapshot_help')}</p>{refunds.hasNextPage?<Button tone="ghost" disabled={refunds.isFetchingNextPage} onClick={()=>void refunds.fetchNextPage()}>{refunds.isFetchingNextPage?t('common.loading',''):tr('more')}</Button>:null}</footer></section></div>;
}
