'use client';

import { createContext, useContext } from 'react';
import type { ShopApi } from '../../lib/shop/api';
import type { Permissions, Role } from '../../lib/shop/permissions';
import type { ShopRecord, UserPreferences } from '../../lib/shop/types';
import type { SubscriptionEntitlement } from '../../lib/subscriptions';

export type ShopContextValue = {
  userId: string | null;
  shops: ShopRecord[];
  shop: ShopRecord | null;
  role: Role | null;
  perms: Permissions;
  entitlement: SubscriptionEntitlement | null;
  premium: boolean;
  api: ShopApi;
  refreshShops: () => Promise<void>;
  selectShop: (shopId: string) => void;
  prefs: UserPreferences | null;
  savePrefs: (partial: Partial<UserPreferences>) => Promise<void>;
  t: (key: string, fallback: string, vars?: Record<string, string | number>) => string;
  notice: string | null;
  setNotice: (notice: string | null) => void;
  hideCost: boolean;
};

export const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop must be used inside the shop workspace.');
  return value;
}
