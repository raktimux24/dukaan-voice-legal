'use client';

import Link from 'next/link';
import { useState } from 'react';
import { auditCsv, downloadText, inventoryCsv } from '../../../lib/shop/csv';
import { useShop } from '../context';
import { Button, Card, Field, Notice, PageHeader, Spinner, inputClass } from '../ui';

const LANGUAGES = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['bn', 'বাংলা'],
  ['ta', 'தமிழ்'],
  ['te', 'తెలుగు'],
  ['mr', 'मराठी'],
  ['kn', 'ಕನ್ನಡ'],
  ['gu', 'ગુજરાતી'],
  ['ml', 'മലയാളം'],
  ['pa', 'ਪੰਜਾਬੀ'],
  ['or', 'ଓଡ଼ିଆ'],
] as const;

const SIZES = ['small', 'medium', 'large', 'extra_large'] as const;

export function SettingsScreen() {
  const { api, shop, perms, role, prefs, savePrefs, premium, hideCost, setNotice, t } = useShop();
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(0);
  const [deleting, setDeleting] = useState(false);
  if (!shop) return <Spinner />;

  return (
    <div className="shop-page">
      <PageHeader back={{ href: '/shop', label: t('nav.home', 'Home') }} kicker={shop.name} title={t('settings.title', 'Settings')} description={`You are signed in as ${role ? t(`role.${role.toLowerCase()}`, role.toLowerCase()) : 'a member'} of this shop.`} />
      <Notice error={error} />
      {perms.canManageShop ? (
        <Card flush>
          <div className="shop-list">
            <Link href="/shop/settings/shop" className="shop-list-row">
              <div className="shop-list-main"><p className="shop-list-title">{t('settings.shop_settings', 'Shop profile')}</p><p className="shop-list-meta">Name, type, contact details</p></div>
              <span className="text-muted">›</span>
            </Link>
            <Link href="/shop/settings/payments" className="shop-list-row">
              <div className="shop-list-main"><p className="shop-list-title">{t('settings.payments_bills', 'Payments and UPI')}</p><p className="shop-list-meta">UPI ID, QR, default tender, void window</p></div>
              <span className="text-muted">›</span>
            </Link>
            <Link href="/shop/settings/staff" className="shop-list-row">
              <div className="shop-list-main"><p className="shop-list-title">{t('settings.manage_staff', 'Staff and invites')}</p><p className="shop-list-meta">Members, roles, invite codes</p></div>
              <span className="text-muted">›</span>
            </Link>
            <Link href="/shop/settings/subscription" className="shop-list-row">
              <div className="shop-list-main"><p className="shop-list-title">{t('subscription.section_title', 'Subscription')}</p><p className="shop-list-meta">{premium ? 'Premium is active' : 'Free plan'} · plans, invoices, and Razorpay</p></div>
              <span className="text-muted">›</span>
            </Link>
          </div>
        </Card>
      ) : null}
      {role === 'MANAGER' && shop.helperInviteCode ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Helper invite code</p>
            <p className="text-sm text-muted">Share this with a new helper. They join from the phone or at /shop/onboarding.</p>
          </div>
          <Button tone="ghost" onClick={() => void navigator.clipboard.writeText(shop.helperInviteCode || '')}>Copy {shop.helperInviteCode}</Button>
        </Card>
      ) : null}
      <Card className="grid gap-4">
        <div>
          <h2 className="shop-section-title">Preferences</h2>
          <p className="shop-section-sub">These apply to this shop workspace on every device you sign in on.</p>
        </div>
        <div className="form-grid is-2">
        <Field label={t('settings.app_language', 'App language')}>
          <select className={inputClass} value={prefs?.appLanguage ?? 'en'} onChange={(event) => void savePrefs({ appLanguage: event.target.value }).catch(setError)}>
            {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </Field>
        <Field label={t('settings.text_size', 'Text size')}>
          <select className={inputClass} value={prefs?.textSize ?? 'medium'} onChange={(event) => void savePrefs({ textSize: event.target.value }).catch(setError)}>
            {SIZES.map((size) => <option key={size} value={size}>{size.replace('_', ' ')}</option>)}
          </select>
        </Field>
        <label className="shop-toggle">
          <span>{t('settings.high_contrast', 'High contrast')}<span className="block text-xs text-muted">Stronger borders inside the shop workspace.</span></span>
          <input type="checkbox" className="shop-field" checked={!!prefs?.highContrastMode} onChange={(event) => void savePrefs({ highContrastMode: event.target.checked }).catch(setError)} />
        </label>
        {role === 'OWNER' ? (
          <label className="shop-toggle">
            <span>{t('settings.daily_recap', 'Daily recap')}<span className="block text-xs text-muted">Sent to the phone each evening.</span></span>
            <input type="checkbox" className="shop-field" checked={!!prefs?.dailyRecapEnabled} onChange={(event) => void savePrefs({ dailyRecapEnabled: event.target.checked }).catch(setError)} />
          </label>
        ) : null}
        </div>
      </Card>
      <Card className="grid gap-4">
        <div>
          <h2 className="shop-section-title">Exports</h2>
          <p className="shop-section-sub">CSV files open in Excel or Google Sheets.</p>
        </div>
        <div className="shop-actions">
          <Button
            tone="ghost"
            onClick={() => {
              void api.getAllInventory(shop.id, hideCost).then((items) => downloadText(`products-${shop.name}.csv`, inventoryCsv(items, hideCost))).catch(setError);
            }}
          >
            {t('settings.export_inventory', 'Inventory CSV')}
          </Button>
          <Button tone="ghost" onClick={() => void api.getAllAudit(shop.id).then((rows) => downloadText(`activity-${shop.name}.csv`, auditCsv(rows))).catch(setError)}>{t('settings.export_activity_log', 'Activity CSV')}</Button>
          {perms.canSeeReports ? (
            premium ? <Button tone="ghost" onClick={() => void api.salesCsv(shop.id, { period: 'month' }).then((csv) => downloadText('sales-month.csv', csv)).catch(setError)}>{t('settings.export_sales', 'Sales CSV (this month)')}</Button> : <Button tone="ghost" href="/shop/settings/subscription">Sales CSV needs Premium</Button>
          ) : null}
        </div>
      </Card>
      {!perms.canManageShop ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Leave this shop</p>
            <p className="text-sm text-muted">You lose access to {shop.name}. The owner can invite you again.</p>
          </div>
          <Button
            tone="danger"
            onClick={() => {
              if (!window.confirm('Leave this shop?')) return;
              void api.leaveShop(shop.id).then(() => window.location.assign('/shop')).catch(setError);
            }}
          >
            Leave shop
          </Button>
        </Card>
      ) : null}
      <Card>
        <h2 className="shop-section-title">Delete account</h2>
        <p className="shop-section-sub mt-1">This removes your Samaan Bol account. Confirm twice. It does not cancel a shop subscription by itself.</p>
        <div className="mt-4">
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
