'use client';

import { useGstText as useUiText } from "../gst-ui";


import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsFields, Section, emptySettings, useGstText } from '../gst-ui';
import type { GstSettings } from '../../../lib/shop/gst-types';
import { validateSettings } from '../../../lib/shop/gst-core/gst';
import { useState } from 'react';
import { ReadState, useGstQuery } from '../gst-workspace';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Spinner, inputClass } from '../ui';

const VPA = /^[a-z0-9._-]{2,}@[a-z0-9.-]{2,}$/;
const MAX_QR = 1_500_000;

export function PaymentsScreen() {
  const uiText = useUiText();
  const { api, shop, perms, t } = useShop();
  const queryClient = useQueryClient();
  const text=useGstText();
  const readiness = useGstQuery(['readiness'], () => api.gst.readiness(shop!.id), perms.canManageShop);
  const [gstDraft,setGstDraft]=useState<GstSettings|null>(null);
  const settings = useQuery({ queryKey: ['pos', shop?.id], enabled: !!shop && perms.canManageShop, queryFn: () => api.getPosSettings(shop!.id) });
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [vpa, setVpa] = useState<string | null>(null);
  const [payee, setPayee] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [header, setHeader] = useState<string | null>(null);
  const [footer, setFooter] = useState<string | null>(null);
  const [method, setMethod] = useState<'cash' | 'upi' | null>(null);
  const [hours, setHours] = useState<string | null>(null);
  const [card, setCard] = useState<boolean | null>(null);

  if (!shop) return <Spinner />;
  if (!perms.canManageShop) return <NoAccess what={uiText("Only the owner can change payments.")} />;
  if (settings.isLoading) return <Spinner label={uiText("Loading payments")} />;
  if (!settings.data) return <><Notice error={settings.error}/><Button onClick={()=>void settings.refetch()}>{text('Retry')}</Button></>;
  const current = settings.data;
  const form = {
    upiVpa: vpa ?? current.upiVpa ?? '',
    upiPayeeName: payee ?? current.upiPayeeName ?? '',
    shopPhone: phone ?? current.shopPhone ?? '',
    shopAddress: address ?? current.shopAddress ?? '',
    billHeader: header ?? current.billHeader ?? '',
    billFooter: footer ?? current.billFooter ?? '',
    defaultPaymentMethod: method ?? current.defaultPaymentMethod,
    voidWindowHours: hours ?? String(current.voidWindowHours),
    cardEnabled: card ?? current.cardEnabled,
  };
  const vpaInvalid = form.upiVpa.trim() !== '' && !VPA.test(form.upiVpa.trim().toLowerCase());
  const hoursNumber = Number(form.voidWindowHours);
  const hoursInvalid = !Number.isInteger(hoursNumber) || hoursNumber < 1 || hoursNumber > 720;

  return (
    <div className="shop-page">
      <PageHeader back={{ href: '/shop/settings', label: t('settings.title', 'Settings') }} kicker={t('settings.title', 'Settings')} title={t('pos_settings.title', 'Payments & bills')} description={t('pos_settings.upi_explainer', 'The UPI ID and QR shown at checkout.')} />
      <Notice error={error ?? settings.error} />
        <form id="payment-preferences"
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (vpaInvalid || hoursInvalid) return;
            setPending(true);
            setError(null);
            void api.updatePosSettings(shop.id, {
              upiVpa: form.upiVpa.trim().toLowerCase() || null,
              upiPayeeName: form.upiPayeeName.trim() || null,
              shopPhone: form.shopPhone.trim() || null,
              shopAddress: form.shopAddress.trim() || null,
              billHeader: form.billHeader.trim() || null,
              billFooter: form.billFooter.trim() || null,
              defaultPaymentMethod: form.defaultPaymentMethod,
              voidWindowHours: hoursNumber,
              cardEnabled: form.cardEnabled,
            }).then(() => queryClient.invalidateQueries({ queryKey: ['pos', shop.id] })).catch(setError).finally(() => setPending(false));
          }}
        >
          <Section title={t('pos_settings.upi_section', 'UPI payments')} summary={form.upiVpa || t('pos_settings.not_set', 'Not set')}>
          <Field label={t('pos_settings.upi_id', 'UPI ID')}><input className={inputClass} value={form.upiVpa} onChange={(event) => setVpa(event.target.value)} placeholder={uiText("name@bank")} /></Field>
          {vpaInvalid ? <p className="text-sm text-danger">{t('pos_settings.upi_id', 'Enter a UPI ID like name@bank.')}</p> : null}
          <Field label={t('pos_settings.payee_name', 'Payee name')}><input className={inputClass} value={form.upiPayeeName} onChange={(event) => setPayee(event.target.value)} /></Field>
        <h2 className="font-semibold">{t('pos_settings.upload_qr', 'UPI QR image')}</h2>
        {current.upiQrImage ? <img src={current.upiQrImage} alt="Saved UPI QR" className="mt-3 w-40 rounded-lg bg-white p-2" /> : <p className="mt-2 text-sm text-muted">{uiText("No image uploaded. A VPA still generates a QR at checkout.")}</p>}
        <input
          className="mt-3 block text-sm"
          type="file"
          accept="image/*"
          aria-label={uiText("Upload UPI QR")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const imageBase64 = String(reader.result ?? '');
              if (imageBase64.length > MAX_QR) {
                setError(new Error('That QR image is too large. The limit is 1.5 MB of encoded data.'));
                return;
              }
              setPending(true);
              void api.uploadUpiQr(shop.id, imageBase64).then(() => queryClient.invalidateQueries({ queryKey: ['pos', shop.id] })).catch(setError).finally(() => setPending(false));
            };
            reader.readAsDataURL(file);
          }}
        />
          </Section>
          <Section title={t('pos_settings.bill_section', 'Bill details')} summary={form.billHeader || shop.name}>
          <Field label={t('pos_settings.shop_phone', 'Bill phone')}><input className={inputClass} value={form.shopPhone} onChange={(event) => setPhone(event.target.value)} /></Field>
          <Field label={t('pos_settings.shop_address', 'Bill address')}><input className={inputClass} value={form.shopAddress} onChange={(event) => setAddress(event.target.value)} /></Field>
          <Field label={t('pos_settings.bill_header', 'Bill header')}><input className={inputClass} value={form.billHeader} onChange={(event) => setHeader(event.target.value)} /></Field>
          <Field label={t('pos_settings.bill_footer', 'Bill footer')}><input className={inputClass} value={form.billFooter} onChange={(event) => setFooter(event.target.value)} /></Field>
          </Section>
          <Section title={t('pos_settings.defaults_section', 'Defaults')} summary={t(`pos.method.${form.defaultPaymentMethod}`, form.defaultPaymentMethod)}>
          <Field label={t('pos_settings.defaults_section', 'Default payment')}>
            <select className={inputClass} value={form.defaultPaymentMethod} onChange={(event) => setMethod(event.target.value as 'cash' | 'upi')}>
              <option value="cash">{t('pos.method.cash', 'Cash')}</option>
              <option value="upi">{t('pos.method.upi', 'UPI')}</option>
            </select>
          </Field>
          <Field label={t('pos_settings.void_window', 'Void window (hours)', { hours: form.voidWindowHours || '—' })}><input className={inputClass} inputMode="numeric" value={form.voidWindowHours} onChange={(event) => setHours(event.target.value)} /></Field>
          {hoursInvalid ? <p className="text-sm text-danger">{uiText("The void window must be between 1 and 720 hours.")}</p> : null}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.cardEnabled} onChange={(event) => setCard(event.target.checked)} /> {uiText("Accept card")}</label>
          </Section>

        </form>

      <Section title={t('pos_settings.gst_checks_section', 'GST checks')} summary={t('pos_settings.gst_checks_summary', 'Review billing readiness and product tax details')}>
        <ReadState query={readiness}>
          {readiness.data ? <><p className="shop-hint">{t('gst.core_readiness_notice', 'Checks cover saved setup, not filing or tax-policy approval.')}</p><p>{t(readiness.data.configurationReady ? 'gst.readiness_configured' : 'gst.readiness_incomplete', readiness.data.configurationReady ? 'GST setup reviewed' : 'GST setup needs attention')}</p><p>{t('gst.readiness_profile', 'Shop profile')}: {t(`gst.readiness_status.${readiness.data.profile.status}`, readiness.data.profile.status)}</p><p>{t('gst.readiness_catalog', '{n} of {total} products reviewed', {n: readiness.data.catalog.reviewed, total: readiness.data.catalog.total})}</p><p className="shop-hint">{t(readiness.data.catalog.taxProfilesRequired ? 'gst.readiness_required' : 'gst.readiness_optional', 'Confirm product tax details before GST billing.')}</p>{readiness.data.catalog.incomplete.slice(0,10).map(product => <p key={product.productId} className="text-warn">{product.name} · {t(`gst.readiness_product.${product.reason}`, product.reason)}</p>)}</> : null}
        </ReadState>
        <Button tone="quiet" onClick={() => void readiness.refetch()}>{text('Refresh report')}</Button>
        <div className="shop-list"><Button tone="ghost" href="/shop/products/gst">{t('gst.bulk_title', 'Review product GST in bulk')}</Button><Button tone="ghost" href="/shop/settings/gst">{t('gst.health_title', 'GST records & invoice numbers')}</Button></div>
      </Section>
      <Section title={text('GST setup')} summary={t(`gst.registration.${current.gstSettings?.registration ?? 'unknown'}`, 'Set up later')}>
        <Notice error={error}/><SettingsFields value={gstDraft??current.gstSettings??emptySettings()} onChange={setGstDraft}/>
        <Button disabled={pending||current.gstSetupAvailable!==true} onClick={()=>{const config=gstDraft??current.gstSettings??emptySettings();try{if(config.registration==='unknown')throw Error(text('Choose your actual GST registration before saving.'));validateSettings({...config,version:config.version||crypto.randomUUID()});}catch(e){setError(e);return;}setPending(true);void api.updatePosSettings(shop.id,{gstSettings:config}).then(()=>{setGstDraft(null);void readiness.refetch(); return settings.refetch();}).catch(setError).finally(()=>setPending(false));}}>{text('Save GST settings')}</Button>
        {current.gstSetupAvailable!==true?<p className="shop-hint">{text('GST setup is unavailable on this server.')}</p>:null}
      </Section>
      <button form="payment-preferences" type="submit" className="shop-btn shop-btn-primary" disabled={pending || vpaInvalid || hoursInvalid}>{pending ? t('common.saving', 'Saving…') : t('common.save', 'Save payments')}</button>
    </div>
  );
}
