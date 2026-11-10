'use client';
import { useState } from 'react';
import { useShop } from './context';
import { Field, Notice } from './ui';
import { PROFILE_UNITS } from '../../lib/shop/profile/form';
import { unitLabel } from '../../lib/shop/units';
import type { UserPreferences } from '../../lib/shop/types';

export function ProfilePreferences() {
  const { t, prefs, savePrefs, offline } = useShop();
  const [busy, setBusy] = useState(false), [error, setError] = useState<unknown>(null), [saved, setSaved] = useState(false);
  async function change(patch: Partial<UserPreferences>) {
    if (busy || offline) return;
    setBusy(true); setError(null); setSaved(false);
    try { await savePrefs(patch); setSaved(true); } catch (err) { setError(err); } finally { setBusy(false); }
  }
  const currentUnit = prefs?.defaultUnit || 'kg';
  return <aside className="profile-preferences" aria-labelledby="profile-preferences-title">
    <h2 id="profile-preferences-title">{t('modal.shop_settings.inventory_settings', 'Inventory settings')}</h2>
    <p className="shop-hint">{t('profileweb.preferences_hint', 'Your preferences, shared with the mobile app. Changes save automatically.')}</p>
    <Notice error={error}/>
    <fieldset disabled={busy || offline || !prefs} aria-busy={busy}>
      <Field localized label={t('modal.shop_settings.default_unit', 'Default unit')}><select className="shop-field" value={currentUnit} onChange={e => void change({ defaultUnit: e.target.value })}>
        {!PROFILE_UNITS.includes(currentUnit as typeof PROFILE_UNITS[number]) && <option value={currentUnit}>{unitLabel(currentUnit, t)}</option>}
        {PROFILE_UNITS.map(unit => <option key={unit} value={unit}>{unitLabel(unit, t)}</option>)}
      </select></Field>
      {(['lowStockNotifications', 'autoSuggestBuyList'] as const).map((key, i) => <label className="profile-toggle" key={key}>
        <span>{i === 0 ? t('modal.shop_settings.low_stock_notifications', 'Low stock notifications') : t('modal.shop_settings.auto_suggest', 'Auto-suggest buy list')}</span>
        <input type="checkbox" role="switch" checked={prefs?.[key] ?? true} onChange={e => void change({ [key]: e.target.checked })}/>
      </label>)}
    </fieldset>
    <p role="status" className="shop-hint">{busy ? t('common.saving', 'Saving…') : saved ? t('profileweb.preference_saved', 'Preference saved') : ''}</p>
  </aside>;
}
