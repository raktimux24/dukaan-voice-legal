'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../lib/shop/api';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, Spinner } from '../ui';

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
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Staff</h1>
      <Notice error={error ?? members.error} />
      <Card className="grid gap-3">
        <p>Manager code: {shop.managerInviteCode ?? 'Hidden'}</p>
        <p>Helper code: {shop.helperInviteCode ?? 'Hidden'}</p>
        <div className="flex flex-wrap gap-2">
          <Button tone="ghost" onClick={() => void copy(shop.managerInviteCode)}>Copy manager code</Button>
          <Button tone="ghost" onClick={() => void copy(shop.helperInviteCode)}>Copy helper code</Button>
          <Button
            tone="ghost"
            onClick={() => {
              setPending(true);
              void api.regenerateInvite(shop.id).then(() => refreshShops()).catch(setError).finally(() => setPending(false));
            }}
            disabled={pending}
          >
            New codes
          </Button>
        </div>
      </Card>
      {members.isLoading ? <Spinner label="Loading staff" /> : null}
      {(members.data ?? []).map((member) => (
        <Card key={member.id}>
          <p className="font-semibold">{member.user.fullName || member.user.email}</p>
          <p className="text-sm text-muted">{member.user.email} · {member.role.toLowerCase()}</p>
          {member.role !== 'OWNER' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                tone="ghost"
                onClick={() => void api.updateMemberRole(shop.id, member.id, member.role === 'MANAGER' ? 'HELPER' : 'MANAGER').then(() => queryClient.invalidateQueries({ queryKey: ['members', shop.id] })).catch(setError)}
              >
                Make {member.role === 'MANAGER' ? 'helper' : 'manager'}
              </Button>
              <Button
                tone="danger"
                onClick={() => {
                  if (!window.confirm(`Remove ${member.user.fullName || 'this person'}?`)) return;
                  void api.removeMember(shop.id, member.id).then(() => queryClient.invalidateQueries({ queryKey: ['members', shop.id] })).catch(setError);
                }}
              >
                Remove
              </Button>
            </div>
          ) : null}
        </Card>
      ))}
      <Card>
        <h2 className="font-semibold">Delete shop</h2>
        <p className="mt-2 text-sm text-muted">The subscription is cancelled first. If that fails, the shop stays.</p>
        <div className="mt-3">
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
                if (caught instanceof ApiError && caught.code === 'subscription_cancel_failed') setError(caught);
                else setError(caught);
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
