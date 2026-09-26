'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Nudge } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, Spinner } from '../ui';

function canAct(nudge: Nudge, canEdit: boolean) {
  const type = nudge.action?.type ?? '';
  if (!type) return false;
  if (/price|stock|product|batch/i.test(type)) return canEdit;
  return true;
}

export function BriefScreen() {
  const { api, shop, perms } = useShop();
  const queryClient = useQueryClient();
  const brief = useQuery({
    queryKey: ['brief', shop?.id],
    enabled: !!shop && perms.canSeeReports,
    queryFn: () => api.getBrief(shop!.id),
  });
  const [error, setError] = useState<unknown>(null);
  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what="The daily brief is for the owner and managers." />;
  if (brief.isLoading) return <Spinner label="Loading brief" />;
  if (brief.error) return <Notice error={brief.error} />;

  const items = [brief.data?.today, ...(brief.data?.items ?? [])].filter((item): item is Nudge => !!item);

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Daily brief</h1>
      {items.length === 0 ? <Card><p>No actions today. The brief is still here.</p></Card> : null}
      <Notice error={error} />
      {items.map((item) => (
        <Card key={item.id}>
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 text-muted">{item.body}</p>
          {canAct(item, perms.canEditProducts) ? (
            <div className="mt-3">
              <Button
                onClick={() => {
                  void api.nudgeEvent(shop.id, item.id, 'tapped').catch(() => undefined);
                  void api.actNudge(shop.id, item.id, item.action?.params ?? {}).then(() => queryClient.invalidateQueries({ queryKey: ['brief', shop.id] })).catch(setError);
                }}
              >
                Do this
              </Button>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
