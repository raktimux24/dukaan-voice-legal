import React, {useRef, useState, type ComponentType, type ReactNode} from 'react';
import {deletionFailure, performDeletion, type DeletionKind, type DeletionFailure} from './workflow';

export type DeletionUi = {
  Box: ComponentType<{children: ReactNode; row?: boolean}>;
  Text: ComponentType<{children: ReactNode; danger?: boolean; live?: boolean}>;
  Button: ComponentType<{label: string; onPress: () => void; disabled?: boolean; danger?: boolean}>;
};

export function DeletionView({kind, ui, t, removeRecords, removeIdentity, isCurrent, onDeleted, support, policy}: {
  kind: DeletionKind; ui: DeletionUi; t: (key: string) => string;
  removeRecords: () => Promise<unknown>; removeIdentity?: () => Promise<unknown>;
  isCurrent?: () => boolean;
  onDeleted: () => void; support: () => void; policy: () => void;
}) {
  const {Box, Text, Button} = ui;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<DeletionFailure | null>(null);
  const running = useRef(false);
  const title = t(kind === 'account' ? 'settings.delete_account' : 'modal.shop_settings.delete_shop');
  const run = async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setFailure(null);
    try {
      await performDeletion(removeRecords, removeIdentity, isCurrent);
      onDeleted();
    } catch (error) {
      setFailure(deletionFailure(error));
      setConfirm(false);
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return <Box>
    <Text>{t(kind === 'account' ? 'settings.delete_account_message' : 'modal.shop_settings.delete_message')}</Text>
    {failure ? <Box>
      <Text danger live>{t(failure === 'retained' ? 'deletion.retained' : failure === 'check' ? 'deletion.check_failed' : 'deletion.failed')}</Text>
    </Box> : null}
    {failure === 'retained' ? null : confirm ? <Box>
      <Text live>{t('deletion.confirm')}</Text>
      <Box row>
        <Button label={t('common.cancel')} onPress={() => setConfirm(false)} disabled={busy} />
        <Button label={busy ? t('settings.deleting') : t('settings.delete_forever')} onPress={() => void run()} disabled={busy} danger />
      </Box>
    </Box> : <Button label={title} onPress={() => {setFailure(null); setConfirm(true);}} disabled={busy} danger />}
    <Box row>
      <Button label={t('deletion.support')} onPress={support} disabled={busy} />
      <Button label={t('settings.privacy_policy')} onPress={policy} disabled={busy} />
    </Box>
    <Text>meetslimshady07@gmail.com</Text>
  </Box>;
}
