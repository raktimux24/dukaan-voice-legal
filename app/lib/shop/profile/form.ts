import type { ShopRecord } from '../types';
import { remapShopCategory, remapShopSubtype } from '../catalog';
import { normalizeIndianMobile } from '../phone';

export function profileDraft(shop: ShopRecord) {
  return { name: shop.name, ownerName: shop.ownerName ?? '', phone: shop.phone ?? '', address: shop.address ?? '', city: shop.city ?? '', category: remapShopCategory(shop.category), subtype: remapShopSubtype(shop.category, shop.subtype) };
}
export type ProfileDraft = ReturnType<typeof profileDraft>;
export function profileChanges(shop: ShopRecord, draft: ProfileDraft) {
  const patch: Record<string, string | null> = {};
  const phone = normalizeIndianMobile(draft.phone);
  if (!draft.name.trim()) return { patch, error: 'name' as const };
  if (draft.ownerName.trim() !== (shop.ownerName ?? '') && (!draft.ownerName.trim() || draft.ownerName.trim().length > 120)) return { patch, error: 'ownerName' as const };
  if (phone === 'invalid') return { patch, error: 'phone' as const };
  const next = { name: draft.name.trim(), phone, address: draft.address.trim().slice(0, 300) || null, city: draft.city.trim().slice(0, 80) || null };
  for (const key of ['name', 'phone', 'address', 'city'] as const) if (next[key] !== (shop[key] || null)) patch[key] = next[key];
  if (draft.ownerName.trim() !== (shop.ownerName ?? '')) patch.ownerName = draft.ownerName.trim();
  const category = remapShopCategory(draft.category), subtype = remapShopSubtype(category, draft.subtype);
  if (category !== remapShopCategory(shop.category) || subtype !== remapShopSubtype(shop.category, shop.subtype)) Object.assign(patch, { category, subtype });
  return { patch, error: undefined };
}
export const PROFILE_UNITS = ['kg', 'g', 'liter', 'ml', 'piece', 'dozen', 'pack', 'box'] as const;
