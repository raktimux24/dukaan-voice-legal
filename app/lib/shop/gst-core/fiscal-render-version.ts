// Persist this contract with new fiscal evidence; never upgrade retained payloads.
export const FISCAL_RENDER_VERSION = 'gst_bill_v2' as const;
export function fiscalRenderVersion(version: unknown): 'legacy' | 'gst_bill_v1' | typeof FISCAL_RENDER_VERSION {
  if (version === undefined || version === null) return 'legacy';
  if (version === 'gst_bill_v1' || version === FISCAL_RENDER_VERSION) return version;
  throw new Error('unsupported_fiscal_render_version');
}
