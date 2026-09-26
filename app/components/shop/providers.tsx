'use client';

import { SignIn, useAuth, useClerk } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bindApi } from '../../lib/shop/api';
import { permissionsFor, parseRole } from '../../lib/shop/permissions';
import type { ShopRecord, UserPreferences } from '../../lib/shop/types';
import { ShopChrome } from './chrome';
import { ShopContext, type ShopContextValue } from './context';

function flattenStrings(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') {
    if (prefix) out[prefix] = value;
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  const record = value as Record<string, unknown>;
  const nested = record.translations && typeof record.translations === 'object' ? record.translations : record;
  for (const [key, child] of Object.entries(nested)) {
    if (key === 'translations') continue;
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') out[next] = child;
    else if (child && typeof child === 'object') flattenStrings(child, next, out);
  }
  return out;
}

function ShopSession({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const [shops, setShops] = useState<ShopRecord[] | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dict, setDict] = useState<Record<string, string>>({});

  const api = useMemo(() => bindApi(async (opts) => getToken(opts)), [getToken]);

  const refreshShops = useCallback(async () => {
    const list = await api.getShops();
    setShops(list);
    setShopId((current) => {
      const stored = userId ? localStorage.getItem(`samaan-active-shop:${userId}`) : null;
      const next =
        (current && list.some((shop) => shop.id === current) ? current : null) ??
        list.find((shop) => shop.id === stored)?.id ??
        list.find((shop) => shop.isActive)?.id ??
        list[0]?.id ??
        null;
      if (userId && next) localStorage.setItem(`samaan-active-shop:${userId}`, next);
      return next;
    });
  }, [api, userId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    let cancelled = false;
    setLoadError(null);
    refreshShops().catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load shops.');
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, refreshShops]);

  const selectShop = useCallback(
    (nextId: string) => {
      setShopId(nextId);
      if (userId) localStorage.setItem(`samaan-active-shop:${userId}`, nextId);
    },
    [userId],
  );

  const shop = shops?.find((item) => item.id === shopId) ?? null;
  const role = parseRole(shop?.role);
  const perms = permissionsFor(role);

  const entitlementQuery = useQuery({
    queryKey: ['entitlement', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getEntitlement(shop!.id),
  });

  const prefsQuery = useQuery({
    queryKey: ['preferences', userId],
    enabled: !!userId,
    queryFn: () => api.getPreferences(),
  });
  const prefs = prefsQuery.data?.preferences ?? null;

  useEffect(() => {
    const lang = prefs?.appLanguage;
    if (!lang || lang === 'en') {
      setDict({});
      return;
    }
    let cancelled = false;
    api
      .getTranslations(lang)
      .then((payload) => {
        if (!cancelled) setDict(flattenStrings(payload));
      })
      .catch(() => {
        if (!cancelled) setDict({});
      });
    return () => {
      cancelled = true;
    };
  }, [api, prefs?.appLanguage]);

  useEffect(() => {
    if (!shops || pathname.startsWith('/shop/onboarding')) return;
    if (shops.length === 0) router.replace('/shop/onboarding');
  }, [shops, pathname, router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const onRemoved = () => {
      setShopId(null);
      void refreshShops();
    };
    window.addEventListener('samaan-not-member', onRemoved);
    return () => window.removeEventListener('samaan-not-member', onRemoved);
  }, [refreshShops]);

  const savePrefs = useCallback(
    async (partial: Partial<UserPreferences>) => {
      await api.updatePreferences(partial);
      await prefsQuery.refetch();
    },
    [api, prefsQuery],
  );

  const t = useCallback((key: string, fallback: string, vars?: Record<string, string | number>) => {
    const translated = dict[key];
    let text = translated && translated !== key ? translated : fallback;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }, [dict]);

  const value: ShopContextValue = {
    userId: userId ?? null,
    shops: shops ?? [],
    shop,
    role,
    perms,
    entitlement: entitlementQuery.data ?? null,
    premium: !!entitlementQuery.data?.isPremium,
    api,
    refreshShops,
    selectShop,
    prefs,
    savePrefs,
    t,
    notice,
    setNotice,
    hideCost: !perms.canSeeCost,
  };

  if (!isLoaded || (isSignedIn && shops === null && !loadError)) {
    return <div className="shop-root grid min-h-screen place-items-center text-muted">Loading your shop…</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="shop-root grid min-h-screen place-items-center p-6">
        <SignIn routing="hash" forceRedirectUrl={pathname || '/shop'} signUpForceRedirectUrl={pathname || '/shop'} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="shop-root grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <p role="alert" className="text-danger">{loadError}</p>
          <button className="mt-4 rounded-lg bg-saffron px-4 py-2 font-semibold text-white" type="button" onClick={() => void refreshShops()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ShopContext.Provider value={value}>
      <div
        className="shop-root"
        data-text={prefs?.textSize || 'medium'}
        data-contrast={prefs?.highContrastMode ? 'high' : 'normal'}
      >
        <ShopChrome onSignOut={() => void signOut({ redirectUrl: '/' })}>{children}</ShopChrome>
        {notice ? (
          <div className="shop-toast no-print" role="status">
            {notice}
          </div>
        ) : null}
      </div>
    </ShopContext.Provider>
  );
}

export function ShopProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ShopSession>{children}</ShopSession>
    </QueryClientProvider>
  );
}

