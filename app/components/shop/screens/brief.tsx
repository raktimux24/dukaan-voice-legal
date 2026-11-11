"use client";
import {useQuery} from '@tanstack/react-query';
import {useRef,useState} from 'react';
import {useShop} from '../context';
import {HomeNudge} from '../home-nudge';
import {SpeechAudio} from '../voice-capture';
import {Button,Card,NoAccess,Notice,PageHeader,Spinner} from '../ui';
import {useGstText} from '../gst-ui';
import {useShopDates} from '../use-shop-dates';
export function BriefScreen(){const c=useShop();return <BriefWorkspace key={c.shop?.id+':'+c.userId+':'+c.prefs?.appLanguage}/>}
function BriefWorkspace(){
 const {api,shop,userId,prefs,perms,offline,t}=useShop(),text=useGstText(),{formatDay}=useShopDates();
 const [error,setError]=useState<unknown>(null),[refreshing,setRefreshing]=useState(false),[allHistory,setAllHistory]=useState(false),running=useRef(false);
 const brief=useQuery({queryKey:['brief',shop?.id,userId,prefs?.appLanguage],enabled:!!shop&&perms.canSeeReports,queryFn:()=>api.getBrief(shop!.id,prefs?.appLanguage)});
 const audio=useQuery({queryKey:['brief-audio',shop?.id,userId,prefs?.appLanguage],enabled:false,queryFn:()=>api.getBriefAudio(shop!.id,prefs?.appLanguage),retry:false});
 if(!shop)return <Spinner/>;
 if(!perms.canSeeReports)return <NoAccess what={text('The daily brief is for the owner and managers.')}/>;
 const today=brief.data?.today,history=(brief.data?.history??[]).filter(x=>x.id!==today?.id),stock=today?.evidence?.stock;
 const refresh=async()=>{if(running.current||offline)return;running.current=true;setRefreshing(true);setError(null);try{await api.runBrief(shop.id);await brief.refetch();}catch(e){setError(e)}finally{running.current=false;setRefreshing(false)}};
 const shownHistory=allHistory?history:history.slice(0,3);
 return <div className="shop-page brief-workspace"><PageHeader title={t('brief.title','Daily brief')} description={text('A short read on the day, with the actions that matter most.')} back={{href:'/shop',label:t('nav.home','Home')}} actions={<Button tone="ghost" disabled={refreshing||offline} onClick={()=>void refresh()}>{refreshing?t('common.loading','Loading…'):t('brief.refresh','Refresh')}</Button>}/>
 <Notice error={error??brief.error??audio.error}/>{brief.error?<Button onClick={()=>void brief.refetch()}>{t('common.retry','Try again')}</Button>:null}{brief.isPending?<Spinner/>:null}
 {today?<Card className="brief-day"><h2>{today.evidence?.dayLine??today.title}</h2><p>{stock?t('brief.stock_snapshot','',stock):today.body}</p><div className="shop-actions">{stock?<Button href="/shop/products?filter=low_stock">{t('brief.stock_action','Review stock')}</Button>:null}<Button tone="ghost" icon="speaker" disabled={audio.isFetching||offline} onClick={()=>void audio.refetch()}>{audio.isFetching?t('common.loading','Loading…'):t('brief.listen','Listen')}</Button></div><SpeechAudio base64={audio.data?.audioBase64} label={t('brief.listen','Listen')}/></Card>:null}
 {(brief.data?.items??[]).length?<section className="brief-actions"><h2>{t('brief.actions','Actions')}</h2>{brief.data!.items.map(item=><HomeNudge key={item.id} nudge={item} surface="brief"/>)}</section>:brief.isSuccess&&!stock?.low&&!stock?.out?<p className="shop-list-empty">{t(brief.data?.premium?'brief.nothing_urgent':'brief.stock_clear','Nothing urgent today.')}</p>:null}
 {history.length?<section className="brief-history"><h2>{t('brief.earlier','Earlier')}</h2>{shownHistory.map(item=><article key={item.id}><h3>{item.createdAt?formatDay(item.createdAt):item.title}</h3><p>{item.body}</p></article>)}{history.length>3?<Button tone="quiet" onClick={()=>setAllHistory(v=>!v)}>{allHistory?t('common.show_less','Show less'):t('homeweb.show_more','Show more')}</Button>:null}</section>:null}</div>;
}
