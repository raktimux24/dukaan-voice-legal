'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATALOG, remapShopSubtype, shopType } from '../../../lib/shop/catalog';
import { Button, Card, Field, inputClass, Notice } from '../ui';
import { useShop } from '../context';

export function OnboardingScreen() {
  const { api, refreshShops, selectShop, shops } = useShop();
  const router = useRouter();
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
      <h1 className="font-display text-3xl">Open your shop</h1>
      <p className="text-muted">Create a shop or join one with an invite code. Voice stays on the phone.</p>
      <div className="flex gap-2">
        <Button tone={mode === 'create' ? 'primary' : 'ghost'} onClick={() => setMode('create')}>Create shop</Button>
        <Button tone={mode === 'join' ? 'primary' : 'ghost'} onClick={() => setMode('join')}>Join with code</Button>
      </div>
      <Notice error={error} />
      {mode === 'create' ? (
        <Card>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              void api
                .createShop({
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
            <Field label="Shop name"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
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
            <Field label="Phone"><input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" /></Field>
            <Field label="Address"><input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} required /></Field>
            <Field label="City"><input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} required /></Field>
            <Button type="submit" disabled={pending || !name.trim()}>{pending ? 'Creating…' : 'Create shop'}</Button>
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
            <Field label="Invite code"><input className={inputClass} value={code} onChange={(event) => setCode(event.target.value)} required autoCapitalize="characters" /></Field>
            <Button type="submit" disabled={pending || !code.trim()}>{pending ? 'Joining…' : 'Join shop'}</Button>
          </form>
        </Card>
      )}
      {shops.length > 0 ? <Button tone="ghost" href="/shop">Back to {shops[0]?.name}</Button> : null}
    </div>
  );
}
