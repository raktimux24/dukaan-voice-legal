'use client';
import {unitLabel,formatQty} from '../../../lib/shop/units';
import {formatINR} from '../../../lib/shop/money';
import {ProductImageById} from "../product-image";
import {ProductSelect} from "../product-select";
import {useEffect,useRef,useState} from 'react';
import {VoiceSheet} from '../voice-sheet';
import {useRouter,useSearchParams} from 'next/navigation';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useShop} from '../context';
import {VoiceCapture,SpeechAudio} from '../voice-capture';
import {useGstText} from '../gst-ui';
import {Button,Card,Field,Notice,PremiumLock,Spinner,inputClass} from '../ui';
import {ApiError} from '../../../lib/shop/api';
import {SUPPORTED_LANGUAGES} from '../../../lib/shop/languages';
import {readCart,writeCart} from '../../../lib/shop/cart';
import {appendVoiceSale,confirmStockOnce,editVoiceEntity,voiceEntityValid,voiceSalePlan,type VoiceStockAttempt} from '../../../lib/shop/voice-review';
import type {VoiceProcessResponse,VoiceConfirmResponse,VoiceEntityWithMatch} from '../../../lib/shop/voice-types';

/** Same phrases as the mobile app (src/constants/voice-examples.ts): a sale, a delivery, a stock question. */
const VOICE_EXAMPLES: Record<string, readonly [string, string, string]> = {
  en: ['Sold 2 packets of Maggi', '5 kg rice came in', 'How much sugar is left?'],
  hinglish: ['Maggi 2 packet becha', 'Chawal 5 kilo aaya hai', 'Cheeni kitni bachi hai?'],
  hi: ['मैगी 2 पैकेट बेचा', 'चावल 5 किलो आया है', 'चीनी कितनी बची है?'],
  bn: ['ম্যাগি 2 প্যাকেট বিক্রি করেছি', 'চাল 5 কেজি এসেছে', 'চিনি কতটা বাকি আছে?'],
  ta: ['மேகி 2 பாக்கெட் விற்றேன்', 'அரிசி 5 கிலோ வந்தது', 'சர்க்கரை எவ்வளவு இருக்கு?'],
  te: ['మ్యాగీ 2 ప్యాకెట్లు అమ్మాను', 'బియ్యం 5 కిలోలు వచ్చాయి', 'చక్కెర ఎంత మిగిలింది?'],
  mr: ['मॅगी 2 पॅकेट विकले', 'तांदूळ 5 किलो आले', 'साखर किती उरली आहे?'],
  kn: ['ಮ್ಯಾಗಿ 2 ಪ್ಯಾಕೆಟ್ ಮಾರಿದೆ', 'ಅಕ್ಕಿ 5 ಕಿಲೋ ಬಂದಿದೆ', 'ಸಕ್ಕರೆ ಎಷ್ಟು ಉಳಿದಿದೆ?'],
  gu: ['મેગી 2 પેકેટ વેચ્યા', 'ચોખા 5 કિલો આવ્યા', 'ખાંડ કેટલી બાકી છે?'],
  ml: ['മാഗി 2 പാക്കറ്റ് വിറ്റു', 'അരി 5 കിലോ വന്നു', 'പഞ്ചസാര എത്ര ബാക്കിയുണ്ട്?'],
};

/** Server voice codes (and browser failures) mapped to the app's own voice messages, never GST copy. */
const VOICE_ERRORS: Record<string, readonly [string, string]> = {
  voice_upstream: ['modal.voice.err.voice_upstream', 'Voice service is temporarily unavailable. Please try again shortly.'],
  voice_busy: ['modal.voice.err.voice_busy', 'Voice service is busy. Please wait a moment and try again.'],
  voice_timeout: ['modal.voice.err.voice_timeout', 'That took too long. Please try again.'],
  voice_failed: ['modal.voice.err.voice_failed', "Couldn't process that. Please try again."],
  not_understood: ['modal.voice.err.not_understood', "Couldn't understand the command. Please try again."],
  network: ['modal.voice.err.network', "Can't reach the server. Check your internet connection."],
  session: ['modal.voice.err.session', 'Your session expired. Please sign in again.'],
};
const VOICE_FALLBACK = VOICE_ERRORS.voice_failed;

function voiceErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (VOICE_ERRORS[error.code]) return error.code;
    if (error.status === 401) return 'session';
    if (error.status === 429) return 'voice_busy';
    if (error.status >= 500) return 'voice_upstream';
    return null;
  }
  if (error instanceof TypeError) return 'network';
  if (error instanceof Error) {
    if (error.name === 'TimeoutError') return 'voice_timeout';
    if (VOICE_ERRORS[error.message]) return error.message;
  }
  return null;
}

export function VoiceScreen({intercepted=false}:{intercepted?:boolean}){
  const {userId,shop,prefs,t}=useShop();
  const router=useRouter();
  const params=useSearchParams();
  const context=params.get('mode')==='sell'?'counter':'inventory';
  // Like the mobile app, closing (or Done) returns to wherever voice was opened from.
  const close=()=>intercepted?router.back():router.replace(context==='counter'?'/shop/sell':'/shop');
  return <VoiceSheet title={t('a11y.voice','Voice command')} closeLabel={t('common.close','Close')} onClose={close}><VoiceWorkspace key={`${userId}:${shop?.id}:${prefs?.voiceLanguage}:${context}`} context={context} onDone={close}/></VoiceSheet>;
}
function VoiceWorkspace({context,onDone}:{context:'counter'|'inventory';onDone:()=>void}) {
  const {api,userId,shop,prefs,perms,premium,t,hideCost,offline}=useShop();
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
  const catalog=useQuery({queryKey:['voice-catalog',userId,shop?.id,hideCost],enabled:!!shop&&premium&&!offline,queryFn:()=>api.getAllInventory(shop!.id,hideCost)});
  if(!shop||!userId)return <Spinner/>;
  const hasSales=entities.some(row=>row.action==='sell');
  const mutations=entities.filter(row=>row.action!=='sell'&&row.action!=='query');
  const valid=entities.length>0&&entities.filter(row=>row.action!=='query').every(voiceEntityValid);
  const actionLabel=(action:string)=>t(action==='sell'?'badge.sale':action==='query'?'modal.voice.in_stock':`badge.${action}`,action);
  const confirm=async()=>{
    if(offline||!valid||busy||(attempted.current&&!retrySale))return;
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
        router.push('/shop/sell/checkout');
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
  const voiceLanguage=prefs?.voiceLanguage??'en';
  const languageName=SUPPORTED_LANGUAGES.find(item=>item.code===voiceLanguage)?.label??voiceLanguage;
  // After a command is heard, only map explicit voice codes; other save errors keep their own message.
  const errorCode=response?(error instanceof ApiError&&VOICE_ERRORS[error.code]?error.code:error instanceof TypeError?'network':null):voiceErrorCode(error);
  const examplesLang=voiceLanguage==='hinglish'?'hi-Latn':voiceLanguage;
  return <div className="shop-page shop-voice-content">
    <nav className="voice-stages" aria-label={t('a11y.voice','Voice command')}>{[t('a11y.voice','Voice'),t('modal.voice.verify','Please verify'),t('modal.voice.done_title','Done!')].map((label,i)=><span key={i} aria-current={i===(result?2:response?1:0)?'step':undefined}><b>0{i+1}</b>{label}</span>)}</nav>
    {response&&!result?<p className="shop-hint">{t('modal.voice.verify_command','Please verify the command')}</p>:null}{offline?<p role="status">{t('voiceweb.offline','Connect to the internet to use voice.')}</p>:null}
    {!premium?<PremiumLock feature="voice"/>:<>
      {/* Before a command is heard every failure is a voice failure; afterwards unknown save errors keep their own message. */}
      <Notice error={errorCode?Error(errorCode):error} messages={VOICE_ERRORS} fallback={response?undefined:VOICE_FALLBACK}/>
      {!response?<Card className="voice-record-panel">
        <div className="voice-intro">
          <p className="voice-intro-title">{t('homeweb.voice_prompt','Say what you sold, what came in, or ask about stock.')}</p>
          <p className="shop-hint">{t('lang_picker.voice_language','Voice Language')}: <span lang={examplesLang}>{languageName}</span></p>
        </div>
        <VoiceCapture disabled={busy||offline} onRecorded={async recording=>{
        setError(null);setBusy(true);
        try {const processed=await api.processVoice(shop.id,recording,voiceLanguage,context,prefs?.voiceFeedbackEnabled!==false);if(alive.current){if(processed.error)throw Error(processed.code??'voice_failed');setResponse(processed);setEntities(processed.entities);}}
        catch(caught){if(alive.current)setError(caught);throw caught;}finally{if(alive.current)setBusy(false);}
      }}/>
        <div className="voice-examples">
          <p className="shop-hint">{t('homeweb.voice_try_saying','Try saying')}</p>
          <ul lang={examplesLang}>{(VOICE_EXAMPLES[voiceLanguage]??VOICE_EXAMPLES.en).map(phrase=><li key={phrase}>“{phrase}”</li>)}</ul>
        </div>
      </Card>:<>
        <Card className="voice-transcript"><p>{t('modal.voice.heard','Heard: "{{transcript}}"',{transcript:response.transcript})}</p>
          <p className="shop-hint">{t(response.overallConfidence>80?'modal.voice.high_confidence':'modal.voice.verify',response.overallConfidence>80?'High Confidence':'Please verify')}</p>{response.analyticsResult?<p>{response.analyticsResult.answer}</p>:null}
          <SpeechAudio base64={response.analyticsResult?.ttsAudioBase64??response.sale?.ttsAudioBase64??response.ttsAudioBase64} label={t('brief.listen','Listen')}/>
        </Card>
        {!entities.length&&!response.analyticsResult?<Card><p><strong>{t('homeweb.voice_not_understood_title',"Didn't catch a command")}</strong></p><p className="shop-hint">{t('homeweb.voice_not_understood_body','Say the item, how much, and what happened.')}</p></Card>:null}
        {entities.map((entity,index)=><Card key={index} className="stack-form voice-review-line">
          <ProductImageById productId={entity.matchedProduct?.id} name={entity.matchedProduct?.name??entity.product} size={40}/>
          {!entity.matchedProduct?<p className="shop-hint">{entity.product}</p>:null}
          <div className="form-grid is-2"><Field label={t('modal.voice.entity_product','Product')}>
            <ProductSelect label={t('modal.voice.entity_product','Product')} disabled={busy||attempted.current||entity.action==='query'} value={entity.matchedProduct?.id??''} onChange={id=>{
              const item=catalog.data?.find(row=>row.productId===id);if(!item)return;
              setEntities(rows=>rows.map((row,i)=>i===index?editVoiceEntity(row,{product:item.product.name,unit:item.unit,unitMismatch:false,matchedProduct:item.product,inventoryItem:{id:item.id,quantity:item.quantity,stockStatus:item.stockStatus}}):row));
            }} options={(catalog.data??[]).map(item=>[item.productId,item.product.name] as const)}/>
          </Field><Field label={t('modal.voice.entity_quantity','Quantity')}><input className={inputClass} type="number" step="0.001" min={entity.action==='update'?0:0.001} disabled={busy||attempted.current||entity.action==='query'} value={Number.isFinite(entity.quantity)?entity.quantity:''} onChange={event=>setEntities(rows=>rows.map((row,i)=>i===index?editVoiceEntity(row,{quantity:event.target.value===''?NaN:Number(event.target.value)}):row))}/></Field></div>
          <p className="voice-line-action">{actionLabel(entity.action)} · {unitLabel(entity.matchedProduct?.unit??entity.unit,t)}</p>{entity.action==='sell'?<p className="voice-line-price">{t('modal.voice.entity_price','Price')}: {entity.matchedProduct?.sellingPrice!=null?formatINR(entity.matchedProduct.sellingPrice)+' × '+formatQty(entity.quantity,entity.matchedProduct.unit,{unitLabel:u=>unitLabel(u,t)})+' = '+formatINR(Math.round(entity.matchedProduct.sellingPrice*entity.quantity*100)/100):t('pos.set_price','Set price')}</p>:null}{entity.action==='remove'&&entity.reason?<p>{t('adjust.reason_label','Reason')}: {t('adjust.reason.'+entity.reason,entity.reason)}</p>:null}
          {entity.unitMismatch?<p className="text-danger">{t('modal.voice.unit_mismatch','Heard {{spoken}}; this product uses {{unit}}',{spoken:entity.spokenUnit??entity.unit,unit:entity.matchedProduct?.unit??entity.unit})}</p>:null}
          {entity.action==='query'?<p>{entity.inventoryItem?.quantity??'—'} {unitLabel(entity.unit,t)} {t('modal.voice.in_stock','in stock')}</p>:null}
        </Card>)}
        {response.sale?.customerName?<p>{t('modal.voice.entity_customer','Customer')}: {response.sale.matchedCustomer?.name??response.sale.customerName}</p>:null}
        {response.sale?.paymentHint?<p>{t('modal.voice.entity_payment','Payment')}: {t(`modal.voice.payment_hint.${response.sale.paymentHint}`,response.sale.paymentHint)}</p>:null}
        {catalog.error?<Notice error={catalog.error}/>:null}
        {retrySale?<Card><p>{t('voice.stock_saved','Stock changes are saved. Retry adding the sale to your cart; stock will not be updated again.')}</p></Card>:null}
        {hasSales||mutations.length?<Button disabled={offline||!valid||busy||(attempted.current&&!retrySale)} onClick={()=>void confirm()}>{busy?(hasSales?t('modal.voice.processing','Processing...'):t('modal.voice.confirming','Updating inventory...')):hasSales?t('modal.voice.to_checkout','Add to cart & checkout'):t('modal.voice.update_stock_not_sale','Update stock (not a sale)')}</Button>:null}
        {result?<Card>{result.results.map((row,index)=><p key={index}>{t('modal.voice.stock_change','{{product}}: {{old}} → {{new}}',{product:row.product,old:row.previousQuantity,new:row.newQuantity})} · {row.success?t('modal.voice.done_title','Done!'):t('modal.voice.error_title','Something went wrong')}</p>)}<SpeechAudio base64={result.ttsAudioBase64} label={t('brief.listen','Listen')}/></Card>:null}
        {uncertain?<Card><p>{t('voice.stock_outcome_unknown','The stock update could not be confirmed. Check your products and activity before trying the command again.')}</p><Button href="/shop/products" tone="ghost">{text('Products')}</Button></Card>:null}
        {!attempted.current?<Button tone="ghost" onClick={()=>{setResponse(null);setEntities([]);setError(null);}}>{t('common.cancel','Cancel')}</Button>:<Button tone="ghost" onClick={onDone}>{t('modal.voice.done_button','Done')}</Button>}
      </>}
    </>}
  </div>;
}
