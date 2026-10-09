'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useShop} from '../context';
import {VoiceCapture,SpeechAudio} from '../voice-capture';
import {useGstText} from '../gst-ui';
import {Button,Card,Field,Notice,PageHeader,PremiumLock,Spinner,inputClass} from '../ui';
import {readCart,writeCart} from '../../../lib/shop/cart';
import {appendVoiceSale,confirmStockOnce,editVoiceEntity,voiceEntityValid,voiceSalePlan,type VoiceStockAttempt} from '../../../lib/shop/voice-review';
import type {VoiceProcessResponse,VoiceConfirmResponse,VoiceEntityWithMatch} from '../../../lib/shop/voice-types';

export function VoiceScreen(){
  const {userId,shop,prefs}=useShop();
  const params=useSearchParams();
  const context=params.get('mode')==='sell'?'counter':'inventory';
  return <VoiceWorkspace key={`${userId}:${shop?.id}:${prefs?.voiceLanguage}:${context}`} context={context}/>;
}
function VoiceWorkspace({context}:{context:'counter'|'inventory'}) {
  const {api,userId,shop,prefs,perms,premium,t,hideCost}=useShop();
  const text=useGstText();const router=useRouter();const client=useQueryClient();
  const alive=useRef(true);const attempted=useRef(false);
  const stockAttempt=useRef<VoiceStockAttempt>({status:'ready'});
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  const [response,setResponse]=useState<VoiceProcessResponse|null>(null);
  const [entities,setEntities]=useState<VoiceEntityWithMatch[]>([]);
  const [result,setResult]=useState<VoiceConfirmResponse|null>(null);
  const [error,setError]=useState<unknown>(null);
  const [busy,setBusy]=useState(false);
  const [uncertain,setUncertain]=useState(false);
  const [retrySale,setRetrySale]=useState(false);
  const catalog=useQuery({queryKey:['voice-catalog',userId,shop?.id,hideCost],enabled:!!shop&&premium,queryFn:()=>api.getAllInventory(shop!.id,hideCost)});
  if(!shop||!userId)return <Spinner/>;
  const hasSales=entities.some(row=>row.action==='sell');
  const mutations=entities.filter(row=>row.action!=='sell'&&row.action!=='query');
  const valid=entities.length>0&&entities.filter(row=>row.action!=='query').every(voiceEntityValid);
  const actionLabel=(action:string)=>t(action==='sell'?'badge.sale':action==='query'?'modal.voice.in_stock':`badge.${action}`,action);
  const confirm=async()=>{
    if(!valid||busy||(attempted.current&&!retrySale))return;
    attempted.current=true;setBusy(true);setError(null);setRetrySale(false);
    let stockWritten=false;
    try {
      if(mutations.length) {
        if(!perms.canAdjustStock)throw Error('Insufficient permissions');
        stockWritten=true;
        const confirmed=await confirmStockOnce(stockAttempt.current,mutations,()=>api.confirmVoice(shop.id,{entities:mutations,transcript:response!.transcript,language:prefs?.voiceLanguage??'en',voiceFeedbackEnabled:prefs?.voiceFeedbackEnabled!==false}));
        if(!alive.current)return;
        setResult(confirmed);
        await client.invalidateQueries({queryKey:['catalog',shop.id]});
        await client.invalidateQueries({queryKey:['inventory']});
        if(stockAttempt.current.status!=='succeeded')return;
      }
      if(hasSales) {
        const current=await api.getAllInventory(shop.id,hideCost);
        if(!alive.current)return;
        const plan=voiceSalePlan(entities,current,shop.id);
        const cart=appendVoiceSale(readCart(userId,shop.id),plan);
        const sale=response?.sale;
        if(sale?.matchedCustomer) {
          cart.customerId=sale.matchedCustomer.id;cart.customerName=sale.matchedCustomer.name;cart.customerPhone=sale.matchedCustomer.phone;cart.customerClientId=null;
          cart.buyer=undefined;
        } else if(sale?.customerName) {
          cart.customerId=null;cart.customerName=sale.customerName;cart.customerPhone=null;cart.customerClientId=crypto.randomUUID();cart.buyer=undefined;
        }
        cart.paymentHint=sale?.paymentHint??undefined;
        writeCart(userId,shop.id,cart);
        router.push('/shop/checkout');
      }
    } catch(caught) {
      if(alive.current){
        setError(caught);
        setUncertain(stockWritten&&stockAttempt.current.status==='unknown');
        if(stockAttempt.current.status==='succeeded'&&hasSales)setRetrySale(true);
        else if(!stockWritten)attempted.current=false;
      }
    } finally {if(alive.current)setBusy(false);}
  };
  return <div className="shop-page">
    <PageHeader title={t('a11y.voice','Voice command')} back={{href:context==='counter'?'/shop/sell':'/shop',label:t(context==='counter'?'nav.sell':'nav.home',context==='counter'?'Sell':'Home')}} description={t('modal.voice.verify_command','Please verify the command')}/>
    {!premium?<PremiumLock feature="voice"/>:<>
      <Notice error={error}/>
      {!response?<Card><VoiceCapture disabled={busy} onRecorded={async recording=>{
        setError(null);setBusy(true);
        try {const processed=await api.processVoice(shop.id,recording,prefs?.voiceLanguage??'en',context,prefs?.voiceFeedbackEnabled!==false);if(alive.current){if(processed.error)throw Error(processed.code??'voice_failed');setResponse(processed);setEntities(processed.entities);}}
        catch(caught){if(alive.current)setError(caught);throw caught;}finally{if(alive.current)setBusy(false);}
      }}/></Card>:<>
        <Card><p>{t('modal.voice.heard','Heard: "{{transcript}}"',{transcript:response.transcript})}</p>
          {response.analyticsResult?<p>{response.analyticsResult.answer}</p>:null}
          <SpeechAudio base64={response.analyticsResult?.ttsAudioBase64??response.sale?.ttsAudioBase64??response.ttsAudioBase64} label={t('brief.listen','Listen')}/>
        </Card>
        {!entities.length&&!response.analyticsResult?<Card><p>{t('modal.voice.err.not_understood',"Couldn't understand the command. Please try again.")}</p></Card>:null}
        {entities.map((entity,index)=><Card key={index} className="stack-form">
          <div className="form-grid is-2"><Field label={t('modal.voice.entity_product','Product')}>
            <select className={inputClass} disabled={busy||attempted.current||entity.action==='query'} value={entity.matchedProduct?.id??''} onChange={event=>{
              const item=catalog.data?.find(row=>row.productId===event.target.value);if(!item)return;
              setEntities(rows=>rows.map((row,i)=>i===index?editVoiceEntity(row,{product:item.product.name,unit:item.unit,unitMismatch:false,matchedProduct:item.product,inventoryItem:{id:item.id,quantity:item.quantity,stockStatus:item.stockStatus}}):row));
            }}><option value="">{t('modal.voice.not_found_short','Not found')}</option>{(catalog.data??[]).map(item=><option key={item.id} value={item.productId}>{item.product.name}</option>)}</select>
          </Field><Field label={t('modal.voice.entity_quantity','Quantity')}><input className={inputClass} type="number" step="0.001" min={entity.action==='update'?0:0.001} disabled={busy||attempted.current||entity.action==='query'} value={Number.isFinite(entity.quantity)?entity.quantity:''} onChange={event=>setEntities(rows=>rows.map((row,i)=>i===index?editVoiceEntity(row,{quantity:event.target.value===''?NaN:Number(event.target.value)}):row))}/></Field></div>
          <p>{actionLabel(entity.action)} · {entity.matchedProduct?.unit??entity.unit}</p>
          {entity.unitMismatch?<p className="text-danger">{t('modal.voice.unit_mismatch','Heard {{spoken}}; this product uses {{unit}}',{spoken:entity.spokenUnit??entity.unit,unit:entity.matchedProduct?.unit??entity.unit})}</p>:null}
          {entity.action==='query'?<p>{entity.inventoryItem?.quantity??'—'} {entity.unit} {t('modal.voice.in_stock','in stock')}</p>:null}
        </Card>)}
        {response.sale?.customerName?<p>{t('modal.voice.entity_customer','Customer')}: {response.sale.matchedCustomer?.name??response.sale.customerName}</p>:null}
        {response.sale?.paymentHint?<p>{t('modal.voice.entity_payment','Payment')}: {t(`modal.voice.payment_hint.${response.sale.paymentHint}`,response.sale.paymentHint)}</p>:null}
        {catalog.error?<Notice error={catalog.error}/>:null}
        {retrySale?<Card><p>{t('voice.stock_saved','Stock changes are saved. Retry adding the sale to your cart; stock will not be updated again.')}</p></Card>:null}
        {hasSales||mutations.length?<Button disabled={!valid||busy||(attempted.current&&!retrySale)} onClick={()=>void confirm()}>{busy?t('common.loading','Loading...'):hasSales?t('modal.voice.to_checkout','Add to cart & checkout'):t('modal.voice.update_stock_not_sale','Update stock (not a sale)')}</Button>:null}
        {result?<Card>{result.results.map((row,index)=><p key={index}>{t('modal.voice.stock_change','{{product}}: {{old}} → {{new}}',{product:row.product,old:row.previousQuantity,new:row.newQuantity})} · {row.success?t('modal.voice.done_title','Done!'):t('modal.voice.error_title','Something went wrong')}</p>)}<SpeechAudio base64={result.ttsAudioBase64} label={t('brief.listen','Listen')}/></Card>:null}
        {uncertain?<Card><p>{t('voice.stock_outcome_unknown','The stock update could not be confirmed. Check your products and activity before trying the command again.')}</p><Button href="/shop/products" tone="ghost">{text('Products')}</Button></Card>:null}
        {!attempted.current?<Button tone="ghost" onClick={()=>{setResponse(null);setEntities([]);setError(null);}}>{t('common.cancel','Cancel')}</Button>:<Button href="/shop/products" tone="ghost">{t('modal.voice.done_button','Done')}</Button>}
      </>}
    </>}
  </div>;
}
