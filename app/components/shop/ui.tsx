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
  size = 'md',
  block,
  href,
  className,
  title,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  href?: string;
  className?: string;
  title?: string;
}) {
  const classes = cx(
    'shop-btn',
    tone === 'primary' && 'shop-btn-primary',
    tone === 'ghost' && 'shop-btn-ghost',
    tone === 'quiet' && 'shop-btn-quiet',
    tone === 'danger' && 'shop-btn-danger',
    size === 'sm' && 'is-sm',
    size === 'lg' && 'is-lg',
    block && 'is-block',
    className,
  );
  if (href) return <Link className={classes} href={href} title={title}>{children}</Link>;
  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  back,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="shop-page-head">
      {back ? (
        <Link href={back.href} className="shop-back">
          ← {back.label}
        </Link>
      ) : null}
      <div className="shop-page-head-text">
        {kicker ? <p className="shop-kicker">{kicker}</p> : null}
        <h1 className="shop-title">{title}</h1>
        {description ? <p className="shop-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="shop-actions">{actions}</div> : null}
    </header>
  );
}

export function SectionHead({
  title,
  sub,
  link,
}: {
  title: string;
  sub?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="shop-section-head">
      <div>
        <h2 className="shop-section-title">{title}</h2>
        {sub ? <p className="shop-section-sub">{sub}</p> : null}
      </div>
      {link ? <Link href={link.href} className="shop-section-link">{link.label}</Link> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx('block', className)}>
      <span className="shop-label">{label}</span>
      {children}
      {hint ? <span className="shop-hint block">{hint}</span> : null}
    </label>
  );
}

export const inputClass = 'shop-field';

export function Card({ children, className, tight, flush }: { children: ReactNode; className?: string; tight?: boolean; flush?: boolean }) {
  return <section className={cx('shop-surface shop-card', tight && 'is-tight', flush && 'is-flush', className)}>{children}</section>;
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'saffron' }) {
  return <span className={cx('shop-pill', tone !== 'neutral' && `shop-pill--${tone}`)}>{children}</span>;
}

export function Chip({ active, onClick, children, href }: { active?: boolean; onClick?: () => void; children: ReactNode; href?: string }) {
  const classes = cx('shop-chip', active && 'is-active');
  if (href) return <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>{children}</Link>;
  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="shop-kbd">{children}</kbd>;
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
      <p className="shop-kicker">Premium</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {feature ? `This needs Premium (${feature.replaceAll('_', ' ')}).` : 'This needs Premium.'} Manage the subscription on the web billing page.
      </p>
      <div className="mt-4">
        <Button href="/shop/settings/subscription">Manage subscription</Button>
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
