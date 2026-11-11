'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeletionControl } from '../deletion-control';
import { ProfilePreferences } from '../profile-preferences';
import { CATALOG, labeledShop, labeledSubtype, shopType } from '../../../lib/shop/catalog';
import { EN_FALLBACK } from '../../../lib/shop/en-fallback';
import { profileDraft, profileChanges, type ProfileDraft } from '../../../lib/shop/profile/form';
import { useShop } from '../context';
import { Button, Field, Glyph, Notice, PageHeader, Spinner } from '../ui';

export function ShopSettingsScreen() {
  const { shop, userId } = useShop();
  if (!shop) return <Spinner/>;
  return <ShopProfile key={`${userId}:${shop.id}`}/>;
}
function ShopProfile() {
  const { api, shop, userId, refreshShops, role, perms, shops, selectShop, offline, t } = useShop();
  const cache = useQueryClient(), queryKey = ['shop-profile', userId, shop!.id];
  const fresh = useQuery({ queryKey, queryFn: () => api.getShop(shop!.id), enabled: !offline, refetchOnWindowFocus: false });
  const current = fresh.data?.shop ?? shop!;
  const [draft, setDraft] = useState<ProfileDraft | null>(null), [baseline, setBaseline] = useState(current);
  const [pending, setPending] = useState(false), [error, setError] = useState<unknown>(null), [saved, setSaved] = useState(false), [leaving, setLeaving] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null), nameInput = useRef<HTMLInputElement>(null);
  const editing = !!draft;
  useEffect(() => {
    if (!editing) return;
    const frame = requestAnimationFrame(() => {
      nameInput.current?.focus();
      if (window.innerWidth <= 600) nameInput.current?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [editing]);
  const labels = {
    name: t('modal.shop_settings.name_label', 'Shop name'), ownerName: t('profileweb.owner', 'Owner name'),
    phone: t('modal.shop_settings.phone_label', 'Phone'), address: t('modal.shop_settings.address_label', 'Address'), city: t('modal.shop_settings.city_label', 'City'),
  };
  const catalogText = (key: string) => t(key, EN_FALLBACK[key] ?? key);
  const canEdit = perms.canManageShop && !offline;
  const changes = draft ? profileChanges(baseline, draft) : null;
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(profileDraft(baseline));
  const validation = changes?.error ? { name: t('profileweb.name_required', 'Enter a shop name.'), ownerName: t('profileweb.owner_required', 'Enter an owner name of up to 120 characters.'), phone: t('validation.phone_invalid', 'Enter a valid 10-digit mobile number') }[changes.error] : '';
  function edit() { setBaseline(current); setDraft(profileDraft(current)); setError(null); setSaved(false); }
  function cancel() { setDraft(null); setError(null); requestAnimationFrame(() => editButton.current?.focus()); }
  async function save() {
    if (!draft || !changes || changes.error || !canEdit || pending || !Object.keys(changes.patch).length) return;
    setPending(true); setError(null);
    try {
      const result = await api.updateShop(current.id, changes.patch);
      cache.setQueryData(queryKey, { shop: result.shop, role });
      setDraft(null); setSaved(true);
      await refreshShops();
      requestAnimationFrame(() => editButton.current?.focus());
    } catch (err) { setError(err); } finally { setPending(false); }
  }
  const blank = t('shopux.not_added', 'Not added');
  return <div className="shop-page profile-workspace">
    <PageHeader back={{ href: '/shop/settings?section=shop', label: t('settings.title', 'Settings') }} kicker={t('settings.title', 'Settings')} title={t('settingsweb.shop_profile', 'Shop profile')} description={t('profileweb.intro', 'Your business details and everyday inventory preferences.')}
      actions={!draft && canEdit ? <button ref={editButton} type="button" className="shop-btn shop-btn-primary" onClick={edit}>{t('common.edit', 'Edit')}</button> : undefined}/>
    <Notice error={error}/>
    {fresh.error && <div className="profile-refresh-warning"><Notice error={fresh.error}/><Button tone="ghost" disabled={offline || fresh.isFetching || !!draft} onClick={() => void fresh.refetch()}>{t('common.retry', 'Try again')}</Button></div>}
    {saved && <p role="status" className="profile-saved">{t('modal.shop_settings.toast_updated', 'Shop updated')}</p>}
    <div className="profile-layout">
      <section className="profile-record" aria-labelledby="profile-record-title">
        <div className="profile-identity"><span className="profile-emblem"><Glyph name="store"/></span><div><h2 id="profile-record-title">{current.name}</h2><p>{labeledShop(current.category, catalogText)} · {labeledSubtype(current.category, current.subtype, catalogText)}</p></div><span className="shop-pill">{role ? t(`role.${role.toLowerCase()}`, role) : ''}</span></div>
        {draft ? <form className="profile-form" onSubmit={e => { e.preventDefault(); void save(); }}>
          <fieldset disabled={pending || !canEdit}>
            <div className="profile-form-grid">
              {(['name', 'ownerName', 'phone', 'address', 'city'] as const).map(key => <Field localized key={key} label={labels[key]} className={key === 'address' ? 'profile-span' : ''}>
                <input ref={key === 'name' ? nameInput : undefined} className="shop-field" value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} type={key === 'phone' ? 'tel' : 'text'} maxLength={key === 'ownerName' ? 120 : key === 'address' ? 300 : key === 'city' ? 80 : undefined} autoComplete={key === 'name' ? 'organization' : key === 'phone' ? 'tel' : key === 'address' ? 'street-address' : key === 'city' ? 'address-level2' : 'off'} aria-invalid={changes?.error === key} aria-describedby={changes?.error === key ? 'profile-validation' : undefined}/>
              </Field>)}
              <Field localized label={t('profileweb.business_type', 'Business type')}><select className="shop-field" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value, subtype: shopType(e.target.value).subtypes[0]?.code ?? '' })}>{CATALOG.shopTypes.map(type => <option key={type.code} value={type.code}>{labeledShop(type.code, catalogText)}</option>)}</select></Field>
              <Field localized label={t('profileweb.shop_format', 'Shop format')}><select className="shop-field" value={draft.subtype} onChange={e => setDraft({ ...draft, subtype: e.target.value })}>{shopType(draft.category).subtypes.map(item => <option key={item.code} value={item.code}>{labeledSubtype(draft.category, item.code, catalogText)}</option>)}</select></Field>
            </div>
          </fieldset>
          {validation && <p id="profile-validation" role="alert" className="profile-validation">{validation}</p>}
          <div className="profile-savebar"><span className="shop-hint">{dirty ? t('profileweb.unsaved', 'Unsaved changes') : t('profileweb.edit_hint', 'Edit the details, then save.')}</span><div className="shop-actions"><Button tone="ghost" disabled={pending} onClick={cancel}>{t('common.cancel', 'Cancel')}</Button><Button type="submit" disabled={pending || !canEdit || !!changes?.error || !Object.keys(changes?.patch ?? {}).length}>{pending ? t('common.saving', 'Saving…') : t('common.save', 'Save changes')}</Button></div></div>
        </form> : <><dl className="profile-facts">{(['ownerName', 'phone', 'address', 'city'] as const).map(key => <div key={key}><dt>{labels[key]}</dt><dd>{current[key] || blank}</dd></div>)}</dl>{!canEdit && <p className="shop-hint">{t('profileweb.readonly', 'Only the owner can edit these details while online.')}</p>}</>}
      </section>
      <ProfilePreferences/>
    </div>
    <section className="profile-support">
      <Field localized label={t('modal.shop_settings.switch_shop', 'Switch shop')} hint={draft ? t('profileweb.finish_edit', 'Save or cancel your edits before switching shops.') : undefined}><select className="shop-field" value={shop!.id} disabled={!!draft || pending || offline || shops.length < 2} onChange={e => selectShop(e.target.value)}>{shops.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field>
      <details><summary>{t('profileweb.support', 'Support details')}</summary><dl><dt>{t('profileweb.shop_id', 'Shop ID')}</dt><dd>{current.id}</dd></dl></details>
    </section>
    <details className="profile-danger"><summary>{role === 'OWNER' ? t('modal.shop_settings.delete_shop', 'Delete shop') : t('modal.shop_settings.leave_shop', 'Leave shop')}</summary><div>
      {role === 'OWNER' ? <fieldset disabled={offline || pending || !!draft}><DeletionControl key={current.id} kind="shop" t={key => t(key, EN_FALLBACK[key] ?? key)} removeRecords={() => api.deleteShop(current.id)} onDeleted={() => window.location.assign('/shop')}/></fieldset> : <><p>{t('modal.shop_settings.leave_message', 'You will lose access to this shop’s inventory and data. You can rejoin later with an invite code.')}</p>{leaving ? <div className="shop-actions"><Button tone="ghost" disabled={pending} onClick={() => setLeaving(false)}>{t('common.cancel', 'Cancel')}</Button><Button tone="danger" disabled={offline || pending} onClick={() => { setPending(true); setError(null); void api.leaveShop(current.id).then(() => window.location.assign('/shop')).catch(setError).finally(() => setPending(false)); }}>{t('modal.shop_settings.leave_confirm', 'Leave')}</Button></div> : <Button tone="danger" disabled={offline || pending} onClick={() => setLeaving(true)}>{t('modal.shop_settings.leave_shop', 'Leave shop')}</Button>}</>}
    </div></details>
  </div>;
}
