'use client';

import Link from 'next/link';
import { useState } from 'react';
import { auditCsv, downloadText, inventoryCsv } from '../../../lib/shop/csv';
import { useShop } from '../context';
import { Button, Card, Field, Notice, Spinner, inputClass } from '../ui';

const LANGUAGES = [
  ['en', 'English'],
  ['hi', 'Hindi'],
  ['bn', 'Bengali'],
  ['ta', 'Tamil'],
  ['te', 'Telugu'],
  ['mr', 'Marathi'],
  ['kn', 'Kannada'],
  ['gu', 'Gujarati'],
  ['ml', 'Malayalam'],
  ['pa', 'Punjabi'],
  ['or', 'Odia'],
] as const;

const SIZES = ['small', 'medium', 'large', 'extra_large'] as const;

export function SettingsScreen() {
  const { api, shop, perms, role, prefs, savePrefs, premium, hideCost, setNotice } = useShop();
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(0);
  const [deleting, setDeleting] = useState(false);
  if (!shop) return <Spinner />;

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Settings</h1>
      <Notice error={error} />
      <Card className="grid gap-2">
        <p className="text-sm text-muted">Signed in as {role?.toLowerCase()}</p>
        {perms.canManageStaff ? <Link href="/shop/settings/staff">Staff and invites</Link> : null}
        {perms.canManageShop ? <Link href="/shop/settings/shop">Shop profile</Link> : null}
        {perms.canManageShop ? <Link href="/shop/settings/payments">Payments and UPI</Link> : null}
        {perms.canManageShop ? <Link href={`/account?shopId=${shop.id}`}>Subscription</Link> : null}
        {role === 'MANAGER' && shop.helperInviteCode ? (
          <p>
            Helper invite: <button type="button" className="text-saffron" onClick={() => void navigator.clipboard.writeText(shop.helperInviteCode || '')}>{shop.helperInviteCode}</button>
          </p>
        ) : null}
        {!perms.canManageShop ? (
          <Button
            tone="danger"
            onClick={() => {
              if (!window.confirm('Leave this shop?')) return;
              void api.leaveShop(shop.id).then(() => window.location.assign('/shop')).catch(setError);
            }}
          >
            Leave shop
          </Button>
        ) : null}
      </Card>
      <Card className="grid gap-3">
        <h2 className="font-semibold">Preferences</h2>
        <Field label="App language">
          <select className={inputClass} value={prefs?.appLanguage ?? 'en'} onChange={(event) => void savePrefs({ appLanguage: event.target.value }).catch(setError)}>
            {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </Field>
        <Field label="Text size">
          <select className={inputClass} value={prefs?.textSize ?? 'medium'} onChange={(event) => void savePrefs({ textSize: event.target.value }).catch(setError)}>
            {SIZES.map((size) => <option key={size} value={size}>{size.replace('_', ' ')}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!prefs?.highContrastMode} onChange={(event) => void savePrefs({ highContrastMode: event.target.checked }).catch(setError)} />
          High contrast
        </label>
        {role === 'OWNER' ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!prefs?.dailyRecapEnabled} onChange={(event) => void savePrefs({ dailyRecapEnabled: event.target.checked }).catch(setError)} />
            Daily recap on the phone
          </label>
        ) : null}
      </Card>
      <Card className="grid gap-3">
        <h2 className="font-semibold">Exports</h2>
        <Button
          tone="ghost"
          onClick={() => {
            void api.getAllInventory(shop.id, hideCost).then((items) => downloadText(`products-${shop.name}.csv`, inventoryCsv(items, hideCost))).catch(setError);
          }}
        >
          Inventory CSV
        </Button>
        <Button tone="ghost" onClick={() => void api.getAllAudit(shop.id).then((rows) => downloadText(`activity-${shop.name}.csv`, auditCsv(rows))).catch(setError)}>Activity CSV</Button>
        {perms.canSeeReports ? (
          premium ? <Button tone="ghost" onClick={() => void api.salesCsv(shop.id, { period: 'month' }).then((csv) => downloadText('sales-month.csv', csv)).catch(setError)}>Sales CSV</Button> : <Link href={`/account?shopId=${shop.id}`}>Sales CSV needs Premium</Link>
        ) : null}
      </Card>
      <Card>
        <h2 className="font-semibold">Delete account</h2>
        <p className="mt-2 text-sm text-muted">This removes your Samaan Bol account. Confirm twice. It does not cancel a shop subscription by itself.</p>
        <div className="mt-3">
          <Button
            tone="danger"
            disabled={deleting}
            onClick={() => {
              if (confirm === 0) {
                if (!window.confirm('Delete your account? This cannot be undone.')) return;
                setConfirm(1);
                setNotice('Confirm delete account one more time.');
                return;
              }
              if (!window.confirm('Delete the account now?')) return;
              setDeleting(true);
              void api.deleteAccount().then(() => window.location.assign('/')).catch((caught: unknown) => {
                setError(caught);
                setDeleting(false);
              });
            }}
          >
            {deleting ? 'Deleting…' : confirm === 0 ? 'Delete account' : 'Confirm delete account'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
