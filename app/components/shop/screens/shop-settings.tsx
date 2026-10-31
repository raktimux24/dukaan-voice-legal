'use client';

import { useGstText as useUiText } from "../gst-ui";

import { useState } from 'react';
import {DeletionControl} from '../deletion-control';
import { CATALOG, remapShopCategory, remapShopSubtype, shopType } from '../../../lib/shop/catalog';
import { useShop } from '../context';
import { Button, Card, Field, Glyph, GroupLabel, NoAccess, Notice, PageHeader, Spinner, inputClass } from '../ui';

export function ShopSettingsScreen() {
  const uiText = useUiText();
  const { shop, perms } = useShop();
  if (!shop) return <Spinner />;
  if (!perms.canManageShop) return <NoAccess what={uiText("Only the owner can change the shop.")} />;
  return <ShopSettingsForm key={shop.id} />;
}

function ShopSettingsForm() {
  const uiText = useUiText();
  const { api, shop, refreshShops, role, prefs, t } = useShop();
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(shop?.name ?? '');
  const [category, setCategory] = useState(remapShopCategory(shop?.category));
  const [subtype, setSubtype] = useState(remapShopSubtype(shop?.category, shop?.subtype));
  const [phone, setPhone] = useState(shop?.phone ?? '');
  const [address, setAddress] = useState(shop?.address ?? '');
  const [city, setCity] = useState(shop?.city ?? '');
  if (!shop) return <Spinner />;
  const subtypes = shopType(category).subtypes;
  const savedType = shopType(shop.category);
  const savedSubtype = savedType.subtypes.find((item) => item.code === remapShopSubtype(shop.category, shop.subtype))?.label;
  const languages: Record<string, string> = { en: 'English', hi: 'हिन्दी', hinglish: 'Hinglish', bn: 'বাংলা', ta: 'தமிழ்', te: 'తెలుగు', mr: 'मराठी', kn: 'ಕನ್ನಡ', gu: 'ગુજરાતી', ml: 'മലയാളം' };
  const blank = t('shopux.not_added', 'Not added');
  const unchanged = name === shop.name && category === remapShopCategory(shop.category) && subtype === remapShopSubtype(shop.category, shop.subtype) && phone === (shop.phone ?? '') && address === (shop.address ?? '') && city === (shop.city ?? '');

  return (
    <div className="shop-page">
    <PageHeader back={{ href: '/shop/settings', label: t('settings.title', 'Settings') }} kicker={t('settings.title', 'Settings')} title={t('settings.shop_settings', 'Shop profile')} description={t('shopux.profile_hint', 'These details are printed on bills and shown to staff.')} />
    <Card>
      <div className="shop-profile-hero">
        <span className="shop-avatar" aria-hidden="true">{shop.name.trim().charAt(0).toUpperCase() || 'S'}</span>
        <div>
          <h2>{shop.name}</h2>
          <p>{savedType.label}{savedSubtype ? ` · ${savedSubtype}` : ''}</p>
        </div>
      </div>
      <div className="shop-facts">
        <div className="shop-fact"><small><Glyph name="phone" />{t('modal.shop_settings.phone_label', 'Phone')}</small><b>{shop.phone || blank}</b></div>
        <div className="shop-fact"><small><Glyph name="pin" />{t('modal.shop_settings.city_label', 'City')}</small><b>{[shop.address, shop.city].filter(Boolean).join(', ') || blank}</b></div>
        <div className="shop-fact"><small><Glyph name="user" />{t('shopux.role', 'Role')}</small><b>{role ? t(`role.${role.toLowerCase()}`, role) : blank}</b></div>
        <div className="shop-fact"><small><Glyph name="languages" />{t('settings.app_language', 'App language')}</small><b>{languages[prefs?.appLanguage ?? 'en'] ?? prefs?.appLanguage ?? 'English'}</b></div>
      </div>
    </Card>
    <GroupLabel title={t('shopux.edit_shop', 'Edit shop details')} />
    <Card className="max-w-2xl">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            setError(new Error('Shop name cannot be empty.'));
            return;
          }
          setPending(true);
          setError(null);
          void api.updateShop(shop.id, {
            name: name.trim(),
            category,
            subtype: remapShopSubtype(category, subtype),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
          }).then(() => refreshShops()).catch(setError).finally(() => setPending(false));
        }}
      >
        <Notice error={error} />
        <Field label={t('modal.shop_settings.name_label', 'Shop name')}><input className="shop-field is-lg" value={name} onChange={(event) => setName(event.target.value)} required placeholder={t('modal.shop_settings.name_placeholder', 'Enter shop name')} /></Field>
        <div className="form-grid is-2">
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
        </div>
        <Field label={t('modal.shop_settings.phone_label', 'Phone')}><input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder={t('modal.shop_settings.phone_placeholder', '10-digit mobile number')} /></Field>
        <div className="form-grid is-2">
          <Field label={t('modal.shop_settings.address_label', 'Address')}><input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} placeholder={t('modal.shop_settings.address_placeholder', 'Shop street, area, landmark')} /></Field>
          <Field label={t('modal.shop_settings.city_label', 'City')}><input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} placeholder={t('modal.shop_settings.city_placeholder', 'e.g. Kanpur')} /></Field>
        </div>
        <div className="shop-actions">
          <Button type="submit" disabled={pending || unchanged || !name.trim()}>{pending ? t('common.saving', 'Saving…') : t('common.save', 'Save changes')}</Button>
        </div>
      </form>
    </Card>
    <Card className="max-w-2xl border-danger/20">
      <h2 className="shop-section-title">{t('modal.shop_settings.delete_shop','Delete shop')}</h2>
      <DeletionControl key={shop.id} kind="shop" t={(key) => t(key,key)} removeRecords={() => api.deleteShop(shop.id)} onDeleted={() => window.location.assign('/shop')} />
    </Card>
    </div>
  );
}
