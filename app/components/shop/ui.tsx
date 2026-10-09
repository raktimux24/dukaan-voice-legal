'use client';

import Link from 'next/link';
import {useContext, type ReactNode} from 'react';
import { ApiError } from '../../lib/shop/api';
import { useShop,ShopContext } from './context';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';

function useOptionalUiText() {
  const context = useContext(ShopContext);
  return (value: ReactNode): ReactNode => typeof value === 'string' && context
    ? context.t('web.gst.' + value.toLowerCase().replace(/[^a-z0-9]+/g, '_'), value)
    : value;
}

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
  const display = useOptionalUiText();
  return (
    <header className="shop-page-head">
      {back ? (
        <Link href={back.href} className="shop-back">
          ← {display(back.label)}
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
  const display = useOptionalUiText();
  return (
    <div className="shop-section-head">
      <div>
        <h2 className="shop-section-title">{display(title)}</h2>
        {sub ? <p className="shop-section-sub">{display(sub)}</p> : null}
      </div>
      {link ? <Link href={link.href} className="shop-section-link">{display(link.label)}</Link> : null}
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
  const display = useOptionalUiText();
  return (
    <label className={cx('block', className)}>
      <span className="shop-label">{display(label)}</span>
      {children}
      {hint ? <span className="shop-hint block">{display(hint)}</span> : null}
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
  const display = useOptionalUiText();
  return (
    <Card>
      <h2 className="font-display text-xl text-ink">{display(title)}</h2>
      <p className="mt-2 text-muted">{display(body)}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function Notice({ error }: { error: unknown }) {
  const context=useContext(ShopContext);
  if (!error) return null;
  const raw=error instanceof Error?error.message:'Something went wrong.';
  const code=error instanceof ApiError?error.code:raw;
  const fallback=(EN_FALLBACK as Record<string,string>)['gst.error.'+code]??(/^[a-z]+(?:_[a-z0-9]+)+$/.test(code)?EN_FALLBACK['gst.error.action_failed']:undefined);
  const key=fallback?((EN_FALLBACK as Record<string,string>)['gst.error.'+code]?'gst.error.'+code:'gst.error.action_failed'):'web.gst.'+raw.toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const message=context?context.t(key,fallback??raw):fallback??raw;
  return (
    <p role="alert" className="shop-notice">
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

export function PremiumLock({ feature }: { shopId?: string; feature?: string }) {
  const { t } = useShop();
  const title = feature ? t(`subscription.gate.${feature}.title`, 'Premium') : 'Premium';
  const body = feature
    ? t(`subscription.gate.${feature}.body`, 'This needs Premium.')
    : t('subscription.web_only_message', 'Subscriptions are managed on the web.');
  return (
    <Card className="text-center">
      <p className="shop-kicker">{t('subscription.status.active', 'Premium')}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{title}. {body}</p>
      <div className="mt-4">
        <Button href="/shop/settings/subscription">{t('subscription.cta.manage', 'Manage subscription')}</Button>
      </div>
    </Card>
  );
}

export function NoAccess({ what }: { what: string }) {
  const display = useOptionalUiText();
  return (
    <Card>
      <h2 className="font-display text-xl">{display('You do not have access')}</h2>
      <p className="mt-2 text-muted">{display(what)}</p>
    </Card>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  const display = useOptionalUiText();
  return <p className="text-sm text-muted" role="status">{display(label)}…</p>;
}
