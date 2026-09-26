'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { formatDay } from '../../../lib/shop/money';
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
  const { api, shop, perms, refreshShops, userId } = useShop();
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ['members', shop?.id],
    enabled: !!shop && perms.canManageStaff,
    queryFn: () => api.getMembers(shop!.id),
  });
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  if (!shop) return <Spinner />;
  if (!perms.canManageStaff) return <NoAccess what="Only the owner can manage staff." />;

  const copy = async (value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/settings', label: 'Settings' }}
        kicker="People"
        title="Staff"
        description="Members of this shop, their roles, and the invite codes they join with."
      />
      <Notice error={error ?? members.error} />
      <Card className="stack-form">
        <div>
          <h2 className="shop-section-title">Invite codes</h2>
          <p className="shop-section-sub">Managers see cost and can edit the catalog. Helpers can sell and remove stock.</p>
        </div>
        <div className="party-stats invite-pair">
          <div className="party-stat">
            <span>Manager</span>
            <b className="invite-code">{shop.managerInviteCode ?? 'Hidden'}</b>
          </div>
          <div className="party-stat">
            <span>Helper</span>
            <b className="invite-code">{shop.helperInviteCode ?? 'Hidden'}</b>
          </div>
        </div>
        <div className="shop-actions">
          <Button tone="ghost" onClick={() => void copy(shop.managerInviteCode)}>Copy manager code</Button>
          <Button tone="ghost" onClick={() => void copy(shop.helperInviteCode)}>Copy helper code</Button>
          <Button
            tone="ghost"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void api.regenerateInvite(shop.id).then(() => refreshShops()).catch(setError).finally(() => setPending(false));
            }}
          >
            New codes
          </Button>
        </div>
      </Card>
      {members.isLoading ? <Spinner label="Loading staff" /> : null}
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
                <Pill tone={roleTone(member.role)}>{member.role.toLowerCase()}</Pill>
              </div>
              <div className="party-stats">
                <div className="party-stat"><span>Joined</span><b>{formatDay(member.joinedAt)}</b></div>
                <div className="party-stat"><span>Last active</span><b>{formatDay(member.lastActiveAt)}</b></div>
                <div className="party-stat"><span>Phone</span><b>{member.user.phoneNumber || '—'}</b></div>
              </div>
              {member.role !== 'OWNER' ? (
                <div className="shop-actions">
                  <Button
                    size="sm"
                    tone="ghost"
                    onClick={() => void api.updateMemberRole(shop.id, member.id, member.role === 'MANAGER' ? 'HELPER' : 'MANAGER').then(() => queryClient.invalidateQueries({ queryKey: ['members', shop.id] })).catch(setError)}
                  >
                    Make {member.role === 'MANAGER' ? 'helper' : 'manager'}
                  </Button>
                  <Button
                    size="sm"
                    tone="danger"
                    onClick={() => {
                      if (!window.confirm(`Remove ${name}?`)) return;
                      void api.removeMember(shop.id, member.id).then(() => queryClient.invalidateQueries({ queryKey: ['members', shop.id] })).catch(setError);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <Card className="danger-zone stack-form">
        <h2 className="shop-section-title">Delete shop</h2>
        <p className="shop-section-sub">The subscription is cancelled first. If that fails, the shop stays.</p>
        <div className="shop-actions">
          <Button
            tone="danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Delete ${shop.name}?`)) return;
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
            Delete shop
          </Button>
        </div>
      </Card>
    </div>
  );
}
