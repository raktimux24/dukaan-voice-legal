'use client';

import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { SpeechAudio } from '../voice-capture';
import type { Nudge } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Card, NoAccess, Notice, PageHeader, Spinner } from '../ui';

function canAct(nudge: Nudge, canEdit: boolean) {
  const type = nudge.action?.type ?? '';
  if (!type) return false;
  if (/price|stock|product|batch/i.test(type)) return canEdit;
  return true;
}

export function BriefScreen() {
  const uiText = useUiText();
  const { api, shop, userId, prefs, premium, perms, t } = useShop();
  const queryClient = useQueryClient();
  const brief = useQuery({
    queryKey: ['brief', userId, shop?.id, prefs?.appLanguage],
    enabled: !!shop && perms.canSeeReports,
    queryFn: () => api.getBrief(shop!.id),
  });
  const audio = useQuery({queryKey:['brief-audio',userId,shop?.id,prefs?.appLanguage],enabled:false,queryFn:()=>api.getBriefAudio(shop!.id),retry:false});
  const [error, setError] = useState<unknown>(null);
  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what={uiText("The daily brief is for the owner and managers.")} />;
  if (brief.isLoading) return <Spinner label={uiText("Loading brief")} />;
  if (brief.error) return <Notice error={brief.error} />;

  const items = [brief.data?.today, ...(brief.data?.items ?? [])].filter((item): item is Nudge => !!item);

  return (
    <div className="shop-page">
      <PageHeader kicker="Insights" title={t('brief.title', 'Daily brief')} description={uiText("A short read on the day, with the actions that matter most.")} />
      {items.length === 0 ? <Card><p>{uiText("No actions today. The brief is still here.")}</p></Card> : null}
      <Notice error={error ?? audio.error} />
      {premium ? <Card><Button tone="ghost" disabled={audio.isFetching} onClick={()=>void audio.refetch()}>{audio.isFetching?t('common.loading','Loading'):t('brief.listen','Listen')}</Button><SpeechAudio base64={audio.data?.audioBase64} label={t('brief.listen','Listen')} /></Card> : null}
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
              > {uiText("Do this")} </Button>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
