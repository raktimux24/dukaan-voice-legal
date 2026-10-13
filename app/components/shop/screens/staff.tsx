'use client';

import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { useShopDates } from '../use-shop-dates';
import type { Role } from '../../../lib/shop/permissions';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, PageHeader, Pill, Spinner } from '../ui';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  return letters || '?';
}

function roleTone(role: Role): 'saffron' | 'ok' | 'neutral' {
  if (role === 'OWNER') return 'saffron';
  if (role === 'MANAGER') return 'ok';
  return 'neutral';
}

export function StaffScreen() {
  const uiText = useUiText();
  const { formatDay } = useShopDates();
  const { api, shop, perms, refreshShops, userId, t } = useShop();
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ['members', userId, shop?.id],
    enabled: !!shop && perms.canManageStaff,
    queryFn: () => api.getMembers(shop!.id),
  });
  const taxAuthorizations = useQuery({
    queryKey: ['product-tax-authorizations', userId, shop?.id],
    enabled: !!shop && perms.canManageStaff,
    queryFn: () => api.getProductTaxAuthorizations(shop!.id),
  });
  const [authorizing, setAuthorizing] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  if (!shop) return <Spinner />;
  if (!perms.canManageStaff) return <NoAccess what={uiText("Only the owner can manage staff.")} />;

  const copy = async (value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/settings', label: t('settings.title', 'Settings') }}
        kicker={t('customers.title', 'People')}
        title={t('modal.staff.title', 'Staff')}
        description={uiText("Members of this shop, their roles, and the invite codes they join with.")}
      />
      <Notice error={error ?? members.error} />
      <Card className="stack-form">
        <div>
          <h2 className="shop-section-title">{t('onboarding.invite.title', 'Invite codes')}</h2>
          <p className="shop-section-sub">{t('onboarding.invite.manager_desc', 'Managers see cost and can edit the catalog.')} {t('onboarding.invite.helper_desc', 'Helpers can sell and remove stock.')}</p>
        </div>
        <div className="party-stats invite-pair">
          <div className="party-stat">
            <span>{t('role.manager', 'Manager')}</span>
            <b className="invite-code">{shop.managerInviteCode ?? 'Hidden'}</b>
          </div>
          <div className="party-stat">
            <span>{t('role.helper', 'Helper')}</span>
            <b className="invite-code">{shop.helperInviteCode ?? 'Hidden'}</b>
          </div>
        </div>
        <div className="shop-actions">
          <Button tone="ghost" onClick={() => void copy(shop.managerInviteCode)}>{t('onboarding.invite.copy_link', 'Copy')} {t('role.manager', 'manager')}</Button>
          <Button tone="ghost" onClick={() => void copy(shop.helperInviteCode)}>{t('onboarding.invite.copy_link', 'Copy')} {t('role.helper', 'helper')}</Button>
          <Button
            tone="ghost"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void api.regenerateInvite(shop.id).then(() => refreshShops()).catch(setError).finally(() => setPending(false));
            }}
          > {uiText("New codes")} </Button>
        </div>
      </Card>
      {members.isLoading ? <Spinner label={uiText("Loading staff")} /> : null}
      <div className="party-grid">
        {(members.data ?? []).map((member) => {
          const name = member.user.fullName || member.user.email || 'Staff';
          return (
            <article key={member.id} className="party-card">
              <div className="member-row">
                <span className="avatar" aria-hidden="true">{initials(name)}</span>
                <div>
                  <p className="party-name">{name}</p>
                  <p className="party-meta">{member.user.email}</p>
                </div>
                <Pill tone={roleTone(member.role)}>{t(`role.${member.role.toLowerCase()}`, member.role.toLowerCase())}</Pill>
              </div>
              <div className="party-stats">
                <div className="party-stat"><span>{uiText("Joined")}</span><b>{formatDay(member.joinedAt)}</b></div>
                <div className="party-stat"><span>{uiText("Last active")}</span><b>{formatDay(member.lastActiveAt)}</b></div>
                <div className="party-stat"><span>{t('pos_settings.shop_phone', 'Phone')}</span><b>{member.user.phoneNumber || '—'}</b></div>
              </div>
              {member.role === 'MANAGER' ? (
                <div className="mt-4 border-t border-line pt-4 grid gap-2">
                  <h3 className="font-semibold">{t('gst.manager_authorization_title', 'Product tax confirmation permission')}</h3>
                  <p className="party-meta">{t('gst.manager_authorization_hint', 'Authorize this manager to confirm product tax data for this shop. Grants, revocations and confirmations are recorded. Shop registration remains owner-only.')}</p>
                  {taxAuthorizations.isLoading ? <Spinner /> : taxAuthorizations.isError ? <>
                    <Notice error={taxAuthorizations.error} />
                    <Button size="sm" tone="ghost" onClick={() => void taxAuthorizations.refetch()}>{t('common.retry', 'Try again')}</Button>
                  </> : taxAuthorizations.data ? (() => {
                    const entry = taxAuthorizations.data.managers.find(row => row.memberId === member.id);
                    if (!entry) return <p role="status" className="party-meta">{t('gst.manager_authorization_unavailable', 'Tax confirmation permission could not be loaded or saved')}</p>;
                    const authorized = !!entry.authorization?.authorized;
                    return <>
                      <p className="party-meta">{t(authorized ? 'gst.manager_authorized' : 'gst.manager_not_authorized', authorized ? 'Authorized to confirm product tax data' : 'Can edit products; cannot confirm new tax data')}</p>
                      <Button size="sm" tone="ghost" disabled={authorizing !== null} onClick={() => {
                        setAuthorizing(member.id); setError(null);
                        void api.setProductTaxAuthorization(shop.id, {managerId: entry.managerId, authorized: !authorized, requestId: crypto.randomUUID(), expectedMemberId: member.id, expectedEventId: entry.authorization?.id ?? null})
                          .then(async () => { await taxAuthorizations.refetch(); queryClient.invalidateQueries({queryKey: ['product-tax']}); })
                          .catch(async caught => { setError(caught); await taxAuthorizations.refetch(); })
                          .finally(() => setAuthorizing(null));
                      }}>{t(authorized ? 'gst.manager_revoke' : 'gst.manager_authorize', authorized ? 'Revoke tax confirmation' : 'Authorize tax confirmation')}</Button>
                    </>;
                  })() : null}
                </div>
              ) : null}
              {member.role !== 'OWNER' ? (
                <div className="shop-actions">
                  <Button
                    size="sm"
                    tone="ghost"
                    onClick={() => void api.updateMemberRole(shop.id, member.id, member.role === 'MANAGER' ? 'HELPER' : 'MANAGER').then(() => Promise.all([queryClient.invalidateQueries({ queryKey: ['members'] }), queryClient.invalidateQueries({ queryKey: ['product-tax-authorizations', userId, shop.id] })])).catch(setError)}
                  >
                    {t('modal.staff.make_role', 'Make {{role}}', { role: t(`role.${member.role === 'MANAGER' ? 'helper' : 'manager'}`, member.role === 'MANAGER' ? 'helper' : 'manager') })}
                  </Button>
                  <Button
                    size="sm"
                    tone="danger"
                    onClick={() => {
                      if (!window.confirm(t('modal.staff.remove_message','Remove {{name}} from the shop? They can rejoin with a new invite.',{name}))) return;
                      void api.removeMember(shop.id, member.id).then(() => Promise.all([queryClient.invalidateQueries({ queryKey: ['members'] }), queryClient.invalidateQueries({ queryKey: ['product-tax-authorizations', userId, shop.id] })])).catch(setError);
                    }}
                  >
                    {t('common.remove', 'Remove')}
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <Card className="danger-zone stack-form">
        <h2 className="shop-section-title">{t('modal.shop_settings.delete_shop', 'Delete shop')}</h2>
        <p className="shop-section-sub">{uiText("The subscription is cancelled first. If that fails, the shop stays.")}</p>
        <div className="shop-actions">
          <Button
            tone="danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`${shop.name}\n\n${t('modal.shop_settings.delete_message','Are you sure you want to permanently delete this shop and all its data? This cannot be undone.')}`)) return;
              setPending(true);
              void api.deleteShop(shop.id).then(() => {
                if (userId) localStorage.removeItem(`samaan-active-shop:${userId}`);
                window.location.assign('/shop');
              }).catch((caught: unknown) => {
                setError(caught instanceof ApiError ? caught : caught);
                setPending(false);
              });
            }}
          >
            {t('modal.shop_settings.delete_shop', 'Delete shop')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
