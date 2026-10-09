/** The absence of loaded results is not evidence that no scan has run. */
export function gstMonitorView(input: {
  hasData: boolean;
  pending: boolean;
  fetchStatus: string;
  error: boolean;
  completed: boolean;
  truncated: boolean;
  issueCount: number;
}) {
  if (!input.hasData)
    return input.fetchStatus === "paused"
      ? "offline"
      : input.error
        ? "unavailable"
        : "loading";
  if (input.error) return "stale";
  if (!input.completed) return "never_checked";
  if (input.issueCount) return "attention";
  if (input.truncated) return "partial";
  return "checked";
}
export const CORE_MONITOR_KINDS = new Set([
  "integrityMismatch",
  "legacyHashes",
  "missingProfiles",
  "numberConflict",
  "missingInvoices",
  "missingCreditNotes",
  "unbalancedSales",
]);
