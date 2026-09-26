'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ApiError } from '../../lib/shop/api';

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Button({
  children,
  type = 'button',
  onClick,
  disabled,
  tone = 'primary',
  href,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'danger';
  href?: string;
}) {
  const className = cx(
    'shop-btn',
    tone === 'primary' && 'shop-btn-primary',
    tone === 'ghost' && 'shop-btn-ghost',
    tone === 'danger' && 'shop-btn-danger',
  );
  if (href) return <Link className={className} href={href}>{children}</Link>;
  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = 'shop-field outline-none focus:border-saffron';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('shop-surface shop-card', className)}>{children}</section>;
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function Notice({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}

export function isPremiumError(error: unknown): error is ApiError {
  return error instanceof ApiError && (error.status === 402 || error.code === 'premium_required');
}

export function isDenied(error: unknown) {
  return error instanceof ApiError && error.status === 403;
}

export function PremiumLock({ shopId, feature }: { shopId?: string; feature?: string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-xl">Premium</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {feature ? `This needs Premium (${feature.replaceAll('_', ' ')}).` : 'This needs Premium.'} Manage the subscription on the web billing page.
      </p>
      <div className="mt-4">
        <Button href={`/account?shopId=${encodeURIComponent(shopId ?? '')}`}>Manage subscription</Button>
      </div>
    </Card>
  );
}

export function NoAccess({ what }: { what: string }) {
  return (
    <Card>
      <h2 className="font-display text-xl">You do not have access</h2>
      <p className="mt-2 text-muted">{what}</p>
    </Card>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <p className="text-sm text-muted" role="status">{label}…</p>;
}
