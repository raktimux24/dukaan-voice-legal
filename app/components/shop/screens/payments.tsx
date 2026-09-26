'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PageHeader, Spinner, inputClass } from '../ui';

const VPA = /^[a-z0-9._-]{2,}@[a-z0-9.-]{2,}$/;
const MAX_QR = 1_500_000;

export function PaymentsScreen() {
  const { api, shop, perms } = useShop();
  const queryClient = useQueryClient();
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
  if (!perms.canManageShop) return <NoAccess what="Only the owner can change payments." />;
  if (settings.isLoading || !settings.data) return <Spinner label="Loading payments" />;
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
      <PageHeader back={{ href: '/shop/settings', label: 'Settings' }} kicker="Settings" title="Payments" description="The UPI ID and QR shown at checkout, the default tender, and how long a bill can be voided." />
      <Notice error={error ?? settings.error} />
      <Card>
        <form
          className="grid gap-3"
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
          <Field label="UPI ID"><input className={inputClass} value={form.upiVpa} onChange={(event) => setVpa(event.target.value)} placeholder="name@bank" /></Field>
          {vpaInvalid ? <p className="text-sm text-danger">Enter a UPI ID like name@bank.</p> : null}
          <Field label="Payee name"><input className={inputClass} value={form.upiPayeeName} onChange={(event) => setPayee(event.target.value)} /></Field>
          <Field label="Bill phone"><input className={inputClass} value={form.shopPhone} onChange={(event) => setPhone(event.target.value)} /></Field>
          <Field label="Bill address"><input className={inputClass} value={form.shopAddress} onChange={(event) => setAddress(event.target.value)} /></Field>
          <Field label="Bill header"><input className={inputClass} value={form.billHeader} onChange={(event) => setHeader(event.target.value)} /></Field>
          <Field label="Bill footer"><input className={inputClass} value={form.billFooter} onChange={(event) => setFooter(event.target.value)} /></Field>
          <Field label="Default payment">
            <select className={inputClass} value={form.defaultPaymentMethod} onChange={(event) => setMethod(event.target.value as 'cash' | 'upi')}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </Field>
          <Field label="Void window (hours)"><input className={inputClass} inputMode="numeric" value={form.voidWindowHours} onChange={(event) => setHours(event.target.value)} /></Field>
          {hoursInvalid ? <p className="text-sm text-danger">The void window must be between 1 and 720 hours.</p> : null}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.cardEnabled} onChange={(event) => setCard(event.target.checked)} /> Accept card</label>
          <Button type="submit" disabled={pending || vpaInvalid || hoursInvalid}>{pending ? 'Saving…' : 'Save payments'}</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-semibold">UPI QR image</h2>
        {current.upiQrImage ? <img src={current.upiQrImage} alt="Saved UPI QR" className="mt-3 w-40 rounded-lg bg-white p-2" /> : <p className="mt-2 text-sm text-muted">No image uploaded. A VPA still generates a QR at checkout.</p>}
        <input
          className="mt-3 block text-sm"
          type="file"
          accept="image/*"
          aria-label="Upload UPI QR"
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
      </Card>
    </div>
  );
}
