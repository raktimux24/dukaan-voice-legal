'use client';

import { useState } from 'react';
import { CATALOG, remapShopCategory, remapShopSubtype, shopType } from '../../../lib/shop/catalog';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Spinner, inputClass } from '../ui';

export function ShopSettingsScreen() {
  const { shop, perms } = useShop();
  if (!shop) return <Spinner />;
  if (!perms.canManageShop) return <NoAccess what="Only the owner can change the shop." />;
  return <ShopSettingsForm key={shop.id} />;
}

function ShopSettingsForm() {
  const { api, shop, refreshShops } = useShop();
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
  const unchanged = name === shop.name && category === remapShopCategory(shop.category) && subtype === remapShopSubtype(shop.category, shop.subtype) && phone === (shop.phone ?? '') && address === (shop.address ?? '') && city === (shop.city ?? '');

  return (
    <div className="shop-page">
    <PageHeader back={{ href: '/shop/settings', label: 'Settings' }} kicker="Settings" title="Shop profile" description="The name and contact details printed on bills and shown to staff." />
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
        <Field label="Shop name"><input className="shop-field is-lg" value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <div className="form-grid is-2">
          <Field label="Type">
            <select className={inputClass} value={category} onChange={(event) => { setCategory(event.target.value); setSubtype(shopType(event.target.value).subtypes[0]?.code ?? ''); }}>
              {CATALOG.shopTypes.map((type) => <option key={type.code} value={type.code}>{type.label}</option>)}
            </select>
          </Field>
          <Field label="Subtype">
            <select className={inputClass} value={subtype} onChange={(event) => setSubtype(event.target.value)}>
              {subtypes.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Phone"><input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" /></Field>
        <div className="form-grid is-2">
          <Field label="Address"><input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} /></Field>
          <Field label="City"><input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} /></Field>
        </div>
        <div className="shop-actions">
          <Button type="submit" disabled={pending || unchanged || !name.trim()}>{pending ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </Card>
    </div>
  );
}
