export type DeletionKind = 'account' | 'shop';
export type DeletionFailure = 'retained' | 'check' | 'failed';

export function deletionFailure(error: unknown): DeletionFailure {
  const code = (error as {code?: string})?.code;
  if (code === 'fiscal_retention_required') return 'retained';
  if (code === 'account_retention_check_failed') return 'check';
  return 'failed';
}

/** Identity deletion must never run after a failed or uncertain server cleanup. */
export async function performDeletion(removeRecords: () => Promise<unknown>, removeIdentity?: () => Promise<unknown>, isCurrent = () => true) {
  if (!isCurrent()) throw new Error('deletion_session_changed');
  const receipt = await removeRecords() as {ok?: boolean; success?: boolean} | null;
  if (receipt?.ok !== true && receipt?.success !== true) throw new Error('deletion_unconfirmed');
  if (!isCurrent()) throw new Error('deletion_session_changed');
  await removeIdentity?.();
}

export const DELETION_SUPPORT_URL = 'mailto:meetslimshady07@gmail.com';
export function deletionSupportUrl(title: string) {
  return DELETION_SUPPORT_URL + '?subject=' + encodeURIComponent('Samaan Bol — ' + title);
}
export function deletionPolicyUrl(language = 'en') {
  const prefix = ['hi','bn','ta','te','mr','kn','gu','ml'].includes(language) ? '/' + language : '';
  return 'https://samaanbol.space' + prefix + '/privacy-policy#s6';
}
