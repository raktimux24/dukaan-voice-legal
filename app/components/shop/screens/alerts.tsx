'use client';

import {ProductImageById} from "../product-image";
import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useShopDates } from '../use-shop-dates';
import { formatQty,unitLabel } from '../../../lib/shop/units';
import { useShop } from '../context';
import { Button, Notice, PageHeader, Pill, PremiumLock, Spinner, isPremiumError } from '../ui';

function alertTabLabel(id: string, fallback: string, t: (key: string, fallback: string) => string) {
  if (id === 'all') return t('home.filter_all', fallback);
  if (id === 'stock') return t('activity.filter_stock', fallback);
  if (id === 'expiry') return t('modal.alerts.section_expiring', fallback);
  if (id === 'ai') return t('modal.alerts.section_ai', fallback);
  return fallback;
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'stock', label: 'Stock' },
  { id: 'expiry', label: 'Expiry' },
  { id: 'ai', label: 'Predictions' },
] as const;

export function AlertsScreen(){const c=useShop();return <AlertsWorkspace key={c.shop?.id+":"+c.userId}/>;}
function AlertsWorkspace() {
  const uiText = useUiText();
  const { formatDay } = useShopDates();
  const { api, shop, premium, perms, offline, t } = useShop();
  const queryClient = useQueryClient();
  const [generating,setGenerating]=useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const active = useRef(new Set<string>()),[pending,setPending]=useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);
  const alerts = useQuery({ queryKey: ['alerts', shop?.id], enabled: !!shop, queryFn: () => api.getAlerts(shop!.id) });
  const predictions = useQuery({ queryKey: ['predictions', shop?.id], enabled: !!shop && premium, queryFn: () => api.getPredictions(shop!.id) });
  const buyList = useQuery({
    queryKey: ['buy-list', shop?.id],
    enabled: !!shop && perms.canEditProducts,
    queryFn: () => api.getBuyList(shop!.id),
  });

  const listed = useMemo(() => new Set((buyList.data ?? []).filter((row) => row.status === 'pending' && row.productId).map((row) => row.productId as string)), [buyList.data]);

  if (!shop) return <Spinner />;

  const stock = [
    ...(alerts.data?.stock.outOfStock ?? []).map((row) => ({ ...row, tone: 'out' as const })),
    ...(alerts.data?.stock.lowStock ?? []).map((row) => ({ ...row, tone: 'low' as const })),
  ];
  const expiry = alerts.data?.expiry ?? [];
  const ai = predictions.data?.predictions ?? alerts.data?.predictions ?? [];
  const counts = alerts.data?.counts;
  const qty=(n:number,u:string)=>formatQty(n,u,{unitLabel:v=>unitLabel(v,t)});

  const addToBuyList = async (productId: string, name: string, quantity: number, unit: string) => {
    if(offline||!perms.canEditProducts||active.current.has(productId)||listed.has(productId)||buyList.isPending||buyList.error)return;
    active.current.add(productId);setPending([...active.current]);setError(null);
    try{await api.addBuyListItem(shop.id,{itemName:name,quantity:quantity>0?quantity:1,unit,productId});await queryClient.invalidateQueries({queryKey:['buy-list',shop.id]});}
    catch(e){setError(e);}finally{active.current.delete(productId);setPending([...active.current]);}
  };
  const actionable=[...stock.map(x=>({id:x.productId,name:x.productName,quantity:x.minStockLevel,unit:x.unit})),...ai.filter(x=>x.isActionable&&x.productId).map(x=>({id:x.productId!,name:x.productName??x.title,quantity:x.metadata?.suggestedOrderQty??10,unit:x.productUnit??'kg'}))].filter((x,i,a)=>!listed.has(x.id)&&a.findIndex(y=>y.id===x.id)===i);

  return (
    <div className="shop-page alerts-workspace">
      <PageHeader
        kicker={t('nav.home','Home')}
        back={{href:'/shop',label:t('nav.home','Home')}}
        title={t('settings.section_notifications', 'Notifications')}
        description={`${t('home.stat_out_of_stock', 'Out of stock')}, ${t('home.stat_low_stock', 'running low')}, ${t('reports.stock.expiry', 'batches that are about to expire')}.`}
        actions={
          perms.canSeeReports && premium ? (
            <Button tone="ghost" disabled={offline||generating} onClick={()=>{if(active.current.has('generate'))return;active.current.add('generate');setGenerating(true);void api.generatePredictions(shop.id).then(()=>queryClient.invalidateQueries({queryKey:['predictions',shop.id]})).catch(setError).finally(()=>{active.current.delete('generate');setGenerating(false)})}}>{uiText("Refresh predictions")}</Button>
          ) : null
        }
      />
      <div className="shop-seg" role="tablist" aria-label={uiText("Notifications")}>
        {TABS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : undefined} onClick={() => setTab(item.id)}>
            {alertTabLabel(item.id, item.label, t)}
            {item.id === 'all' && counts ? ` ${counts.total}` : null}
            {item.id === 'stock' && counts ? ` ${counts.stock}` : null}
            {item.id === 'expiry' && counts ? ` ${counts.expiry}` : null}
          </button>
        ))}
      </div>
      <Notice error={error ?? alerts.error ?? buyList.error ?? (tab==='ai'?predictions.error:null)} />
      {alerts.error?<Button onClick={()=>void alerts.refetch()}>{t('common.retry','Try again')}</Button>:null}
      {perms.canEditProducts&&actionable.length?<div className="alerts-bulk"><p>{t('modal.alerts.add_to_buy_list','Add {{n}} item(s) to Buy List',{n:actionable.length})}</p><Button disabled={offline||pending.length>0||buyList.isPending||!!buyList.error} onClick={()=>void(async()=>{for(const row of actionable)await addToBuyList(row.id,row.name,row.quantity,row.unit)})()}>{t('nudge.action.add_to_buy_list','Add to buy list')}</Button></div>:null}
      {alerts.isLoading ? <Spinner label={uiText("Loading notifications")} /> : null}

      {(tab === 'all' || tab === 'stock') && stock.length > 0 ? (
        <section className="alert-group">
          {tab === 'all' ? <h2 className="timeline-day">{uiText("Stock")}</h2> : null}
          {stock.map((row) => (
            <article key={row.productId} className={row.tone === 'out' ? 'alert-card is-out' : 'alert-card is-low'}>
              <div>
                <Link href={`/shop/products/${row.productId}`} className="shop-list-title flex items-center gap-3"><ProductImageById productId={row.productId} name={row.productName} size={40}/>{row.productName}</Link>
                <p className="shop-list-meta">
                  {row.tone === 'out' ? qty(0,row.unit) : qty(row.quantity, row.unit)} {uiText("· alert at")} {qty(row.minStockLevel, row.unit)}
                </p>
              </div>
              {perms.canEditProducts ? (
                <Button size="sm" tone="ghost" disabled={offline||pending.includes(row.productId)||listed.has(row.productId)||buyList.isPending||!!buyList.error} onClick={() => addToBuyList(row.productId, row.productName, row.minStockLevel, row.unit)}>
                  {t(listed.has(row.productId)?'modal.alerts.badge_added':'modal.alerts.badge_buy_list','Buy list')}
                </Button>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {(tab === 'all' || tab === 'expiry') && expiry.length > 0 ? (
        <section className="alert-group">
          {tab === 'all' ? <h2 className="timeline-day">{uiText("Expiry")}</h2> : null}
          {expiry.map((row) => (
            <article key={`${row.productId}-${row.expiryDate}`} className={row.daysRemaining <= 7 ? 'alert-card is-out' : 'alert-card is-low'}>
              <div>
                <Link href={`/shop/products/${row.productId}`} className="shop-list-title flex items-center gap-3"><ProductImageById productId={row.productId} name={row.productName} size={40}/>{row.productName}</Link>
                <p className="shop-list-meta">{qty(row.quantity, row.unit)} {uiText("· expires")} {formatDay(row.expiryDate)}</p>
              </div>
              <div className="alert-side">
                <Pill tone={row.daysRemaining <= 7 ? 'danger' : 'warn'}>{row.daysRemaining <= 0 ? t('expiry.expired','Expired') : t('expiry.days_left','{{n}}d left',{n:row.daysRemaining})}</Pill>
                {perms.canEditProducts ? (
                  <Button size="sm" tone="ghost" disabled={offline||pending.includes(row.productId)||listed.has(row.productId)||buyList.isPending||!!buyList.error} onClick={() => addToBuyList(row.productId, row.productName, row.quantity, row.unit)}>
                    {t(listed.has(row.productId)?'modal.alerts.badge_added':'modal.alerts.badge_buy_list','Buy list')}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'ai' || tab === 'all' ? (
        premium ? (
          isPremiumError(predictions.error) ? <PremiumLock feature="predictions" /> : (
            <section className="alert-group">
              <h2 className="timeline-day">{t('modal.alerts.section_ai','AI Insights')}</h2>{predictions.isPending?<Spinner/>:null}
              {!predictions.isPending&&!predictions.error&&ai.length === 0 ? <p className="shop-list-empty">{uiText("No predictions yet.")}</p> : null}
              {ai.map((row) => (
                <article key={row.id} className="alert-card">
                  <div>
                    <p className="shop-list-title flex items-center gap-3">{row.productId?<ProductImageById productId={row.productId} name={row.title} size={40}/>:null}{row.title}</p>
                    <p className="shop-list-meta">{row.description}</p>
                  </div>
                  {row.isActionable&&row.productId&&perms.canEditProducts?<Button size="sm" tone="ghost" disabled={offline||pending.includes(row.productId)||listed.has(row.productId)} onClick={()=>void addToBuyList(row.productId!,row.productName??row.title,row.metadata?.suggestedOrderQty??10,row.productUnit??'kg')}>{t('nudge.action.add_to_buy_list','Add to buy list')}</Button>:null}
                  <Button size="sm" tone="ghost" disabled={offline} onClick={() => void api.dismissPrediction(shop.id, row.id).then(() => {
                    void queryClient.invalidateQueries({ queryKey: ['predictions', shop.id] });
                    void queryClient.invalidateQueries({ queryKey: ['alerts', shop.id] });
                  }).catch(setError)}>{uiText("Dismiss")}</Button>
                </article>
              ))}
            </section>
          )
        ) : <PremiumLock feature="predictions" />
      ) : null}

      {alerts.isSuccess && tab === 'all' && stock.length === 0 && expiry.length === 0 && ai.length === 0 ? (
        <p className="shop-list-empty">{uiText("Nothing needs attention.")}</p>
      ) : null}
      {alerts.isSuccess && tab === 'stock' && stock.length === 0 ? <p className="shop-list-empty">{uiText("Stock looks fine.")}</p> : null}
      {alerts.isSuccess && tab === 'expiry' && expiry.length === 0 ? <p className="shop-list-empty">{uiText("Nothing is close to expiry.")}</p> : null}
    </div>
  );
}
