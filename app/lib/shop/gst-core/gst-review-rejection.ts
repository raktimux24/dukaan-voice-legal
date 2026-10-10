/** These handlers lock the shop, replay an existing client ID first, then reject
 * stale revisions before inserting anything. Other 4xx responses do not prove
 * that an earlier attempt failed and must keep their pending evidence. */
export function gstReviewRejection(kind: 'turnover' | 'period', error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const { status, code } = error as { status?: unknown; code?: unknown };
  if (status !== 409) return null;
  if (kind === 'turnover' && code === 'turnover_sequence_conflict') return code;
  if (kind === 'period' && (code === 'period_sequence_conflict' || code === 'period_sources_changed_conflict')) return code;
  return null;
}
