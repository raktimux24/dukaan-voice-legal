'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useShop } from './context';
import { cx } from './ui';

const NAV = [
  { href: '/shop', label: 'Home', key: 'nav.home' },
  { href: '/shop/sell', label: 'Sell', key: 'nav.sell' },
  { href: '/shop/sales', label: 'Sales', key: 'nav.sales' },
  { href: '/shop/activity', label: 'Activity', key: 'nav.activity' },
  { href: '/shop/settings', label: 'Settings', key: 'nav.settings' },
];

export function ShopChrome({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const pathname = usePathname();
  const { shop, shops, role, selectShop, t, perms } = useShop();
  const onboarding = pathname.startsWith('/shop/onboarding');
  const showNav = !onboarding && !!shop;

  return (
    <div className="shop-shell md:grid md:grid-cols-[232px_1fr]">
      {showNav ? (
        <aside className="no-print hidden min-h-screen border-r border-line bg-card p-4 md:block">
          <Link href="/shop" className="shop-brand">
            <span className="shop-mark" aria-hidden="true">S</span>
            <span>Samaan<span className="text-saffron">Bol</span></span>
          </Link>
          <nav className="mt-8 grid gap-1" aria-label="Shop">
            {NAV.map((item) => {
              const active = item.href === '/shop' ? pathname === '/shop' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx('shop-nav-link', active && 'is-active')}
                >
                  {t(item.key, item.label)}
                </Link>
              );
            })}
          </nav>
          {perms.canManageShop ? (
            <Link href={`/account?shopId=${shop?.id ?? ''}`} className="shop-nav-link mt-6">
              Billing
            </Link>
          ) : null}
        </aside>
      ) : null}
      <div className="min-h-screen pb-24 md:pb-0">
        <header className="shop-header no-print">
          <div>
            {onboarding ? (
              <Link href="/" className="shop-brand">Samaan<span className="text-saffron">Bol</span></Link>
            ) : (
              <>
                <p className="font-display text-lg font-semibold">{shop?.name ?? 'Shop'}</p>
                <p className="shop-kicker">{role ? t(`role.${role.toLowerCase()}`, role.toLowerCase()) : ''}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {shops.length > 1 && !onboarding ? (
              <label className="text-sm text-muted">
                <span className="sr-only">Switch shop</span>
                <select
                  className="rounded-lg border border-line bg-elevated px-2 py-2 text-ink"
                  value={shop?.id ?? ''}
                  onChange={(event) => selectShop(event.target.value)}
                >
                  {shops.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <UserButton />
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
      {showNav ? (
        <nav className="shop-tabs no-print md:hidden" aria-label="Shop">
          {NAV.map((item) => {
            const active = item.href === '/shop' ? pathname === '/shop' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cx('shop-tab', active && 'is-active')}>
                {t(item.key, item.label)}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
