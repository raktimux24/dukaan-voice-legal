'use client';
import { useState } from 'react';
import { useShop } from './context';
import { Button, Notice } from './ui';
import { SettingsFields, emptySettings, useGstText } from './gst-ui';
import { ReadState, useGstQuery } from './gst-workspace';
import { validateSettings } from '../../lib/shop/gst-core/gst';
import { activeGstProfile } from '../../lib/shop/payments/form';
import type { PosSettings } from '../../lib/shop/types';
import type { GstSettings } from '../../lib/shop/gst-types';
export function PaymentGst({ current, active, disabled, run }: { current: PosSettings; active: boolean; disabled: boolean; run: (job: () => Promise<PosSettings>) => Promise<boolean> }) {
  const { t, api, shop, perms, offline } = useShop(), text = useGstText();
  const [draft, setDraft] = useState<GstSettings | null>(null), [error, setError] = useState<unknown>(null);
  const readiness = useGstQuery(['readiness'], () => api.gst.readiness(shop!.id), active && perms.canSeeReports && !offline);
  const locked = activeGstProfile(current.gstSettings?.registration);
  const config = draft ?? current.gstSettings ?? emptySettings();
  return <div className="payments-gst-grid"><section className="payments-section"><h2>{text('GST setup')}</h2>
    {current.gstSetupAvailable && current.gstAvailable === false && <p role="status" className="shop-hint">{t('gst.billing_disabled_setup_available', 'GST setup is available, but GST billing is switched off on this server.')}</p>}
    {locked && <p className="shop-hint">{t('gst.active_profile', 'GST profile is active. Contact support to change registration or legal details.')}</p>}
    <Notice error={error}/><fieldset disabled={disabled || locked || current.gstSetupAvailable !== true}><SettingsFields value={config} onChange={value => { setDraft(value); setError(null); }}/></fieldset>
    {!locked && perms.canManageShop && <div className="payments-actions"><Button disabled={disabled || !draft || current.gstSetupAvailable !== true} onClick={() => { try { if (config.registration === 'unknown') throw Error(text('Choose your actual GST registration before saving.')); validateSettings({...config, version: config.version || crypto.randomUUID()}); } catch (err) { setError(err); return; } void run(() => api.updatePosSettings(shop!.id, { gstSettings: config })).then(ok => { if (ok) { setDraft(null); void readiness.refetch(); } }); }}>{text('Save GST settings')}</Button><Button tone="ghost" disabled={disabled || !draft} onClick={() => {setDraft(null);setError(null);}}>{t('common.cancel', 'Cancel')}</Button></div>}
    {current.gstSetupAvailable !== true && <p className="shop-hint">{text('GST setup is unavailable on this server.')}</p>}
  </section><section className="payments-section"><h2>{t('pos_settings.gst_checks_section', 'GST checks')}</h2>
    <p className="shop-hint">{t('gst.core_readiness_notice', 'Checks cover saved setup, not filing or tax-policy approval.')}</p>
    {perms.canSeeReports && !offline ? <ReadState query={readiness}>{readiness.data && <><p className="payments-readiness">{t(readiness.data.configurationReady ? 'gst.readiness_configured' : 'gst.readiness_incomplete', readiness.data.configurationReady ? 'GST setup reviewed' : 'GST setup needs attention')}</p><dl className="payments-checks"><div><dt>{t('gst.readiness_profile','Shop profile')}</dt><dd>{t(`gst.readiness_status.${readiness.data.profile.status}`,readiness.data.profile.status)}</dd></div><div><dt>{t('products.title','Products')}</dt><dd>{t('gst.readiness_catalog','{n} of {total} products reviewed',{n:readiness.data.catalog.reviewed,total:readiness.data.catalog.total})}</dd></div></dl><p className="shop-hint">{t(readiness.data.catalog.taxProfilesRequired ? 'gst.readiness_required' : 'gst.readiness_optional',readiness.data.catalog.taxProfilesRequired ? 'Tax profiles are required for this registration.' : 'Product tax coverage is shown for review; this registration does not use registered GST billing.')}</p>{readiness.data.catalog.incomplete.slice(0,10).map(product=><p key={product.productId}>{product.name} · {t(`gst.readiness_product.${product.reason}`,product.reason)}</p>)}</>}</ReadState> : <p className="shop-hint">{t('payweb.checks_access','Connect as an owner or manager to view GST checks.')}</p>}
    {perms.canSeeReports && <div className="payments-links"><Button tone="ghost" disabled={offline || readiness.isFetching} onClick={() => void readiness.refetch()}>{text('Refresh report')}</Button><Button tone="quiet" href="/shop/products/gst">{t('gst.bulk_title','Review product GST in bulk')}</Button><Button tone="quiet" href="/shop/settings/gst">{t('gst.health_title','GST records & invoice numbers')}</Button>{perms.canManageShop && <Button tone="quiet" href="/shop/settings/gst/exports">{t('gst.export','GST exports')}</Button>}</div>}
  </section></div>;
}
