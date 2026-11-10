import type { BrandingDraft } from './contract';
export function sameBranding(a: BrandingDraft, b: BrandingDraft) {
  return (Object.keys(a) as (keyof BrandingDraft)[]).every(key => a[key] === b[key]);
}
export function validateBrandImage(file: { type: string; size: number }) {
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw Error('document_image_invalid');
  if (!file.size) throw Error('document_image_invalid');
  if (file.size > 2_000_000) throw Error('document_image_size');
}
export const brandingScope = (shopId: string | null | undefined, userId: string | null | undefined, session: string | null | undefined) => `${shopId}:${userId}:${session}`;
