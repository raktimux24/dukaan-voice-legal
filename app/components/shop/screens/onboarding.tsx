'use client';


import { SettingsFields, emptySettings, useGstText } from '../gst-ui';
import { validateSettings } from '../../../lib/shop/gst-core/gst';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATALOG, remapShopSubtype, shopType } from '../../../lib/shop/catalog';
import { Button, Card, Field, inputClass, Notice } from '../ui';
import { useShop } from '../context';

export function OnboardingScreen() {
  const { api, refreshShops, selectShop, shops, t } = useShop();
  const router = useRouter();
  const text=useGstText();
  const [gst,setGst]=useState(emptySettings);
  const [gstStep,setGstStep]=useState(false);
  const [defer,setDefer]=useState(false);
  const [mode, setMode] = useState<'create' | 'join'>(shops.length ? 'join' : 'create');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATALOG.shopTypes[0]?.code ?? 'general');
  const [subtype, setSubtype] = useState(shopType(category).subtypes[0]?.code ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [code, setCode] = useState('');

  const subtypes = shopType(category).subtypes;

  const finish = async (shopId: string) => {
    await refreshShops();
    selectShop(shopId);
    router.replace('/shop');
  };

  return (
    <div className="mx-auto grid max-w-xl gap-4">
      <h1 className="font-display text-3xl">{t('onboarding.create.title', 'Open your shop')}</h1>
      <p className="text-muted">{t('onboarding.create.subtitle', 'Create a shop or join one with an invite code.')}</p>
      <div className="flex gap-2">
        <Button tone={mode === 'create' ? 'primary' : 'ghost'} onClick={() => setMode('create')}>{t('onboarding.create.button', 'Create shop')}</Button>
        <Button tone={mode === 'join' ? 'primary' : 'ghost'} onClick={() => setMode('join')}>{t('onboarding.join.button', 'Join with code')}</Button>
      </div>
      <Notice error={error} />
      {mode === 'create' ? (
        <Card>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if(!gstStep){setGstStep(true);return;}
              if(!defer){try{if(!gst.reviewed)throw Error(text('Confirm the GST details before saving.'));if(gst.registration==='unknown')throw Error(text('Choose your GST registration or skip setup for now.'));validateSettings({...gst,version:gst.version||crypto.randomUUID()});}catch(e){setError(e);return;}}
              setPending(true);
              setError(null);
              void api
                .createShop({
                  ...(!defer?{gstSettings:gst}:{}),
                  name: name.trim(),
                  category,
                  subtype: remapShopSubtype(category, subtype),
                  phone: phone.trim(),
                  address: address.trim(),
                  city: city.trim(),
                })
                .then((result) => finish(result.shop.id))
                .catch(setError)
                .finally(() => setPending(false));
            }}
          >
            {!gstStep?<>            <Field label={t('onboarding.create.name_label', 'Shop name')}><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
            <Field label={t('onboarding.create.category_label', 'Type')}>
              <select className={inputClass} value={category} onChange={(event) => { setCategory(event.target.value); setSubtype(shopType(event.target.value).subtypes[0]?.code ?? ''); }}>
                {CATALOG.shopTypes.map((type) => <option key={type.code} value={type.code}>{type.label}</option>)}
              </select>
            </Field>
            <Field label={t('onboarding.create.subtype_label', 'Subtype')}>
              <select className={inputClass} value={subtype} onChange={(event) => setSubtype(event.target.value)}>
                {subtypes.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </Field>
            <Field label={t('onboarding.create.phone_label', 'Phone')}><input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" placeholder={t('onboarding.create.phone_placeholder', '10-digit mobile number')} /></Field>
            <Field label={t('onboarding.create.address_label', 'Address')}><input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} required placeholder={t('onboarding.create.address_placeholder', 'Shop street, area, landmark')} /></Field>
            <Field label={t('onboarding.create.city_label', 'City')}><input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} required placeholder={t('onboarding.create.city_placeholder', 'e.g. Kanpur')} /></Field>
</>:<div className="grid gap-4"><SettingsFields value={gst} onChange={value=>{setGst(value);setDefer(false);}}/><button type="button" className="shop-section-link" onClick={()=>{setDefer(true);}}>{text('Skip for now — set up in Settings')}</button>{defer?<p role="status">{text('Your shop will be created without a GST declaration.')}</p>:null}</div>}
            <Button type="submit" disabled={pending || !name.trim()}>{pending ? t('onboarding.create.button_loading', 'Creating…') : !gstStep ? text('Continue to GST setup') : defer ? text('Create shop without GST setup') : text('Save GST & create shop')}</Button>
          {gstStep?<Button tone="quiet" onClick={()=>{setGstStep(false);setDefer(false);}}>{text('Back to shop details')}</Button>:null}
          </form>
        </Card>
      ) : (
        <Card>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              void api
                .joinShop(code.trim())
                .then((result) => finish(result.shop.id))
                .catch(setError)
                .finally(() => setPending(false));
            }}
          >
            <Field label={t('onboarding.join.code_label', 'Invite code')}><input className={inputClass} value={code} onChange={(event) => setCode(event.target.value)} required autoCapitalize="characters" /></Field>
            <Button type="submit" disabled={pending || !code.trim()}>{pending ? t('onboarding.join.button_loading', 'Joining…') : t('onboarding.join.button', 'Join shop')}</Button>
          </form>
        </Card>
      )}
      {shops.length > 0 ? <Button tone="ghost" href="/shop">Back to {shops[0]?.name}</Button> : null}
    </div>
  );
}
