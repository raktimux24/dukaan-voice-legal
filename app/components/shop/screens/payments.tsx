'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShop } from '../context';
import { Button, Field, Glyph, Notice, PageHeader, Spinner } from '../ui';
import { PaymentQr } from '../payment-qr';
import { PaymentGst } from '../payment-gst';
import { TabList, syncQuery } from '../settings-tabs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentDraft, paymentChanges, MAX_QR_ENCODED, type PaymentDraft } from '../../../lib/shop/payments/form';
import type { PosSettings } from '../../../lib/shop/types';

const PAYMENT_TABS = ['payments', 'bills', 'gst'];
export function PaymentsScreen() {
  const { shop, userId, photoSessionId } = useShop();
  if (!shop) return <Spinner/>;
  return <PaymentsEditor key={`${userId}:${photoSessionId}:${shop.id}`}/>;
}
function PaymentsEditor() {
  const { api, shop, userId, role, perms, offline, t } = useShop(), cache = useQueryClient(), params = useSearchParams();
  const key = ['pos', shop!.id];
  const settings = useQuery({ queryKey: ['payment-settings', userId, shop!.id], queryFn: () => api.getPosSettings(shop!.id), enabled: !!role && !offline, refetchOnMount: 'always', refetchOnWindowFocus: false, retry: false });
  const [tab, setTabState] = useState(() => PAYMENT_TABS.includes(params.get('tab') ?? '') ? params.get('tab')! : 'payments'), [edits, setEdits] = useState<Partial<PaymentDraft>>({});
  const [pending, setPending] = useState(false), [error, setError] = useState<unknown>(null), [message, setMessage] = useState('');
  const busy = useRef(false), alive = useRef(true), fileInput = useRef<HTMLInputElement>(null), cameraInput = useRef<HTMLInputElement>(null);
  // The tab lives in the address so a link can open Bill details or GST directly.
  const setTab = (next: string) => {setTabState(next);syncQuery('tab', next === 'payments' ? null : next);};
  useEffect(() => {alive.current = true;return () => {alive.current = false;};}, []);
  async function run(job: () => Promise<PosSettings>) {
    if (busy.current || !perms.canManageShop || offline || settings.isFetching || settings.error || !alive.current) return false;
    busy.current = true; setPending(true); setError(null); setMessage('');
    try {
      const next = await job();
      if (!alive.current) return false;
      cache.setQueryData(['payment-settings', userId, shop!.id], next);
      cache.setQueryData(key, next);
      void cache.invalidateQueries({ queryKey: ['gst', userId, shop!.id, 'settings'] });
      setMessage(t('pos_settings.saved', 'Saved')); return true;
    } catch (err) { if (alive.current) setError(err); return false; }
    finally { busy.current = false; if (alive.current) setPending(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    let decoded: Awaited<ReturnType<typeof api.uploadUpiQr>> | undefined;
    const ok = await run(async () => {
      if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) throw Error(t('payweb.image_type', 'Choose a PNG, JPEG or WebP image.'));
      if (file.size > MAX_QR_ENCODED) throw Error(t('payweb.image_size', 'Choose a smaller image. The encoded upload limit is 1.5 MB.'));
      const data = await new Promise<string>((resolve,reject) => {const reader=new FileReader();reader.onload=()=>resolve(String(reader.result??''));reader.onerror=()=>reject(Error(t('payweb.image_read', 'The image could not be read. Try another file.')));reader.readAsDataURL(file);});
      if (!alive.current) throw Error('purchase_request_scope_changed');
      if (data.length > MAX_QR_ENCODED) throw Error(t('payweb.image_size', 'Choose a smaller image. The encoded upload limit is 1.5 MB.'));
      decoded = await api.uploadUpiQr(shop!.id, data);return decoded;
    });
    if (ok && decoded && alive.current) {
      if (decoded.decoded?.isUpi) setEdits(old => {const next={...old};delete next.upiVpa;delete next.upiPayeeName;return next;});
      setMessage(decoded.decoded?.isUpi ? t('pos_settings.qr_decoded','UPI ID found: {{vpa}}',{vpa:decoded.upiVpa??''}) : decoded.decoded?.found ? t('pos_settings.qr_not_upi', 'That QR is not a UPI payment code.') : t('pos_settings.qr_unreadable', 'Could not read a QR in that image. Try a clearer image or enter the UPI ID.'));
    }
  }
  if (!settings.data) return <div className="shop-page payments-workspace"><PageHeader title={t('pos_settings.title','Payments & bills')} back={{href:'/shop/settings?section=shop',label:t('settings.title','Settings')}}/>{offline ? <p role="status">{t('shop.offline_notice','Connect to manage payment and bill settings.')}</p> : settings.isPending ? <Spinner/> : <><Notice error={settings.error}/><Button disabled={settings.isFetching} onClick={()=>void settings.refetch()}>{t('common.retry','Try again')}</Button></>}</div>;
  const current = settings.data, form = {...paymentDraft(current), ...edits}, changes = paymentChanges(current, form);
  const canEdit = perms.canManageShop && !offline, disabled = !canEdit || pending || settings.isFetching || !!settings.error;
  const dirty = Object.keys(edits).length > 0;
  const patch = <K extends keyof PaymentDraft>(name: K, value: PaymentDraft[K]) => {setEdits(old=>({...old,[name]:value}));setMessage('');};
  const invalid = changes.error ? {vpa:t('payweb.vpa_invalid','Enter a UPI ID such as shop@bank.'),phone:t('validation.phone_invalid','Enter a valid 10-digit mobile number'),hours:t('payweb.hours_invalid','Use a whole number between 1 and 720 hours.')}[changes.error] : '';
  return <div className="shop-page payments-workspace">
    <PageHeader title={t('pos_settings.title','Payments & bills')} description={t('payweb.intro','Set up how customers pay and what appears on their bills.')} back={{href:'/shop/settings?section=shop',label:t('settings.title','Settings')}} actions={<Button tone="ghost" disabled={pending || dirty || settings.isFetching || offline} onClick={()=>void settings.refetch()}>{t('common.refresh','Refresh')}</Button>}/>
    {!canEdit && <p className="shop-hint">{t('pos_settings.owner_only','Only the shop owner can change these settings.')}</p>}
    <Notice error={error??settings.error}/>{(pending || message) && <p role="status" className="payments-feedback">{pending ? t('common.saving','Saving…') : message}</p>}
    <div className="payments-summary"><div><span>{t('payweb.next_bill','Next sale number')}</span><strong>#{current.saleCounter+1}</strong></div><div><span>{t('payweb.payment_default','Default payment')}</span><strong>{t('pos.method.'+current.defaultPaymentMethod,current.defaultPaymentMethod)}</strong></div><div><span>{t('payweb.void_window','Cancellation window')}</span><strong>{t('payweb.hours','{n} hours',{n:current.voidWindowHours})}</strong></div></div>
    <TabList className="payments-tabs" label={t('pos_settings.title','Payments & bills')} idPrefix="payments" value={tab} items={[['payments',t('shopux.payments','Payments')],['bills',t('pos_settings.bill_section','Bill details')],['gst','GST']]} onChange={id=>{setTab(id);setMessage('');}}/>
    <form onSubmit={event=>{event.preventDefault();if(changes.error){setTab(changes.error==='phone'?'bills':'payments');return;}if(!Object.keys(changes.patch).length)return;void run(()=>api.updatePosSettings(shop!.id,changes.patch)).then(ok=>{if(ok)setEdits({});});}}>
      <div hidden={tab!=='payments'} className="payments-panel" role="tabpanel" id="payments-panel-payments" aria-labelledby="payments-tab-payments">
        <div className="payments-grid"><section className="payments-section"><h2>{t('pos_settings.upi_section','UPI payments')}</h2><p className="shop-hint">{t('pos_settings.upi_explainer','Add your UPI QR or enter the UPI ID to generate a QR for each bill amount.')}</p><fieldset disabled={disabled}>
          <Field localized label={t('pos_settings.upi_id','UPI ID')}><input className="shop-field" value={form.upiVpa} onChange={e=>patch('upiVpa',e.target.value)} autoCapitalize="none" spellCheck={false} maxLength={100} placeholder="shop@bank" aria-invalid={changes.error==='vpa'}/></Field>
          <Field localized label={t('pos_settings.payee_name','Name shown to customers')}><input className="shop-field" value={form.upiPayeeName} onChange={e=>patch('upiPayeeName',e.target.value)} maxLength={100} placeholder={current.shopName}/></Field>
          <div className="payments-upload"><Button tone="ghost" disabled={disabled} onClick={()=>fileInput.current?.click()}><Glyph name="qr"/>{t('pos_settings.upload_qr','Upload QR image')}</Button><Button tone="ghost" disabled={disabled} onClick={()=>cameraInput.current?.click()}>{t('pos_settings.photo_qr','Photo of QR')}</Button></div>
          <input ref={fileInput} hidden type="file" accept="image/png,image/jpeg,image/webp" aria-label={t('pos_settings.upload_qr','Upload QR image')} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/>
          <input ref={cameraInput} hidden type="file" capture="environment" accept="image/png,image/jpeg,image/webp" aria-label={t('pos_settings.photo_qr','Photo of QR')} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/>
          <p className="shop-hint">{t('payweb.upload_note','Uploading or removing a QR image saves immediately. Other edits use Save changes.')}</p>
          {current.upiQrImage && <Button tone="quiet" disabled={disabled} onClick={()=>void run(()=>api.updatePosSettings(shop!.id,{upiQrImage:null}))}>{t('pos_settings.remove_image','Remove saved image')}</Button>}
        <p className="shop-hint payments-bill-qr-hint">{t('payweb.qr_on_bills','To print this UPI QR on bills, also turn on “Print configured UPI payment details” in Branding & formats → Content.')} <Link className="shop-section-link" href="/shop/settings/payments/branding">{t('documents.title','Branding & formats')} →</Link></p>
        </fieldset></section><PaymentQr vpa={form.upiVpa} payee={form.upiPayeeName.trim()||current.shopName} image={current.upiQrImage}/></div>
        <section className="payments-section payments-defaults"><h2>{t('pos_settings.defaults_section','Defaults')}</h2><fieldset disabled={disabled}><div className="form-grid is-2"><Field localized label={t('payweb.payment_default','Default payment')}><select className="shop-field" value={form.defaultPaymentMethod} onChange={e=>patch('defaultPaymentMethod',e.target.value as 'cash'|'upi')}><option value="cash">{t('pos.method.cash','Cash')}</option><option value="upi">{t('pos.method.upi','UPI')}</option></select></Field><Field localized label={t('payweb.void_hours','Cancellation window (hours)')} hint={t('payweb.void_hours_hint','After this many hours a bill can no longer be cancelled. 24 = one day, 168 = one week.')}><input className="shop-field" value={form.voidWindowHours} onChange={e=>patch('voidWindowHours',e.target.value)} inputMode="numeric" aria-invalid={changes.error==='hours'}/></Field></div><label className="payments-toggle"><span>{t('payweb.cards','Accept card payments')}</span><input type="checkbox" checked={form.cardEnabled} onChange={e=>patch('cardEnabled',e.target.checked)}/></label></fieldset></section>
      </div>
      <div hidden={tab!=='bills'} className="payments-panel" role="tabpanel" id="payments-panel-bills" aria-labelledby="payments-tab-bills"><div className="payments-grid"><section className="payments-section"><h2>{t('pos_settings.bill_section','Bill details')}</h2><fieldset disabled={disabled}>{(['billHeader','shopPhone','shopAddress','billFooter'] as const).map((name,i)=><Field localized key={name} label={t(['pos_settings.bill_header','pos_settings.shop_phone','pos_settings.shop_address','pos_settings.bill_footer'][i],['Shop name on bill','Phone','Address','Footer line'][i])}>{name==='shopAddress'?<textarea className="shop-field" rows={3} value={form[name]} maxLength={300} onChange={e=>patch(name,e.target.value)}/>:<input className="shop-field" type={name==='shopPhone'?'tel':'text'} value={form[name]} maxLength={name==='billHeader'?200:name==='billFooter'?300:20} onChange={e=>patch(name,e.target.value)} aria-invalid={name==='shopPhone'&&changes.error==='phone'}/>}</Field>)}</fieldset></section>
        <aside className="payments-bill-preview"><span>{t('payweb.bill_preview','Bill details preview')}</span><div className="payments-paper"><h3>{form.billHeader.trim()||current.shopName}</h3><p>{form.shopAddress}</p><p>{form.shopPhone}</p><div className="payments-paper-lines" aria-hidden="true"><i/><i/><i/></div><p>{form.billFooter||t('bill.thanks','Thank you!')}</p></div><p className="shop-hint">{t('payweb.bill_note','Text preview only. Choose receipt and invoice layouts in Branding & formats.')}</p></aside>
      </div><Button tone="ghost" href="/shop/settings/payments/branding">{t('documents.title','Branding & formats')} →</Button></div>
      {tab!=='gst' && canEdit && dirty && <div className="payments-savebar">{invalid?<p role="alert">{invalid}</p>:<span>{t('profileweb.unsaved','Unsaved changes')}</span>}<div className="shop-actions"><Button tone="ghost" disabled={pending} onClick={()=>{setEdits({});setError(null);}}>{t('common.cancel','Cancel')}</Button><Button type="submit" disabled={disabled || !!changes.error || !Object.keys(changes.patch).length}>{pending?t('common.saving','Saving…'):t('payweb.save','Save changes')}</Button></div></div>}
    </form>
    <div hidden={tab!=='gst'} role="tabpanel" id="payments-panel-gst" aria-labelledby="payments-tab-gst"><PaymentGst current={current} active={tab==='gst'} disabled={disabled} run={run}/></div>
  </div>;
}
