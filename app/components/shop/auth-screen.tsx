'use client';

import { useSignIn, useSignUp } from '@clerk/nextjs';
import { cloneElement, isValidElement, useEffect, useId, useState, type FormEvent, type ReactElement, type ReactNode } from 'react';
import { isLocale } from '../../i18n';

type View = 'sign-in' | 'sign-up' | 'verify' | 'forgot' | 'reset' | 'reset-done';
type Copy = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

const SHOP_LANGS = ['hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml'] as const;

function browserShopLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const code = navigator.language.toLowerCase();
  return SHOP_LANGS.find((lang) => code.startsWith(lang)) ?? 'en';
}

function useAuthCopy(): Copy {
  const [dict, setDict] = useState<Record<string, string>>({});

  useEffect(() => {
    const lang = browserShopLanguage();
    if (lang === 'en') return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    if (!base) return;
    let cancelled = false;
    fetch(`${base}/api/translations/${lang}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: unknown) => {
        if (cancelled || !payload || typeof payload !== 'object') return;
        const record = payload as Record<string, unknown>;
        const bag = record.translations && typeof record.translations === 'object' ? record.translations : record;
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(bag as Record<string, unknown>)) {
          if (typeof value === 'string') next[key] = value;
        }
        setDict(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (key, fallback, vars) => {
    let text = dict[key] && dict[key] !== key ? dict[key] : fallback;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        const next = String(value);
        text = text.replaceAll(`{{${name}}}`, next).replaceAll(`{${name}}`, next);
      }
    }
    return text;
  };
}

function clerkMessage(error: { longMessage?: string; message?: string } | null | undefined, fallback: string) {
  return error?.longMessage || error?.message || fallback;
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#94949C" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" stroke="#94949C" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#94949C" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#94949C" strokeWidth="1.8" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="#94949C" strokeWidth="1.8" />
      <path d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4" stroke="#94949C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEye({ off }: { off: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.5 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.8-2" stroke="#94949C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 7-0.4 1.1-1.2 2.5-2.3 3.7M6.1 6.7C4.2 8.1 2.9 10 2.5 12c1 2.8 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" stroke="#94949C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12C3.5 8.2 7 4 12 4s8.5 4.2 9.5 8c-1 3.8-4.5 8-9.5 8s-8.5-4.2-9.5-8z" stroke="#94949C" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="#94949C" strokeWidth="1.8" />
    </svg>
  );
}

function emailError(value: string, t: Copy) {
  if (!value.trim()) return t('validation.email_required', 'Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return t('validation.email_invalid', 'Enter a valid email address');
  return '';
}

function passwordError(value: string, t: Copy) {
  if (!value) return t('validation.password_required', 'Password is required');
  if (value.length < 8) return t('validation.password_min', 'Password must be at least 8 characters');
  if (!/\d/.test(value)) return t('validation.password_number', 'Password must contain at least one number');
  return '';
}

function useMarketingHome() {
  const [href, setHref] = useState('/');
  useEffect(() => {
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return;
      const [first] = ref.pathname.split('/').filter(Boolean);
      if (first && isLocale(first)) setHref(`/${first}`);
    } catch {
      /* A direct visit opens the English landing page. */
    }
  }, []);
  return href;
}

function AuthMark() {
  return (
    <div className="auth-mark">
      <img src="/logo1.svg" width={48} height={48} alt="" />
    </div>
  );
}

function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="auth-heading">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  aside,
  trailing,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  aside?: ReactNode;
  trailing?: ReactNode;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children, { id }) : children;
  return (
    <div className={`auth-field${error ? ' is-error' : ''}`}>
      <span className="auth-label">
        <label htmlFor={id}>{label}</label>
        {aside}
      </span>
      <span className="auth-control">
        {icon}
        {control}
        {trailing}
      </span>
      {error ? <span className="auth-error">{error}</span> : null}
    </div>
  );
}

function SaffronButton({ children, disabled, loading }: { children: string; disabled?: boolean; loading?: boolean }) {
  return (
    <button className="auth-submit" type="submit" disabled={disabled || loading}>
      {children}
      {loading ? null : <IconArrow />}
    </button>
  );
}

function SocialButtons({
  t,
  busy,
  mode,
  onGoogle,
  onApple,
}: {
  t: Copy;
  busy: boolean;
  mode: 'sign-in' | 'sign-up';
  onGoogle: () => void;
  onApple: () => void;
}) {
  const google = mode === 'sign-in' ? t('auth.sign_in.google', 'Sign in with Google') : t('auth.sign_up.google', 'Sign up with Google');
  const apple = mode === 'sign-in' ? t('auth.sign_in.apple', 'Sign in with Apple') : 'Sign up with Apple';
  return (
    <>
      <div className="auth-divider"><span>{t('common.or', 'or')}</span></div>
      <button className="auth-social" type="button" onClick={onGoogle} disabled={busy}>
        <span className="auth-g">G</span>
        {google}
      </button>
      <button className="auth-social is-apple" type="button" onClick={onApple} disabled={busy}>
        <svg width="16" height="18" viewBox="0 0 14 17" aria-hidden="true">
          <path fill="currentColor" d="M11.4 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.7-3.1.7s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.2-.8-2.2-3.2zM9.6 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
        </svg>
        {apple}
      </button>
    </>
  );
}

function FooterSwitch({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="auth-switch">
      {prompt}{' '}
      <button type="button" onClick={onClick}>{action}</button>
    </p>
  );
}

export function AuthScreen({ redirectUrl }: { redirectUrl: string }) {
  const t = useAuthCopy();
  const home = useMarketingHome();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [view, setView] = useState<View>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clear = (field: string) => {
    setFormError('');
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const destination = redirectUrl || '/shop';

  const oauth = async (strategy: 'oauth_google' | 'oauth_apple', mode: 'sign-in' | 'sign-up') => {
    setBusy(true);
    setFormError('');
    const params = { strategy, redirectUrl: destination, redirectCallbackUrl: '/shop/sso-callback' };
    const result = mode === 'sign-up' ? await signUp.sso(params) : await signIn.sso(params);
    if (result.error) {
      setFormError(clerkMessage(result.error, strategy === 'oauth_apple' ? t('auth.error_apple', 'Apple Sign In failed') : t('auth.error_google', 'Google sign-in failed')));
      setBusy(false);
    }
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    const next = {
      email: emailError(email, t),
      password: password.trim() ? '' : t('validation.field_required', '{{field}} is required', { field: t('auth.sign_in.password_label', 'Password') }),
    };
    setErrors(next);
    if (next.email || next.password) return;
    setBusy(true);
    setFormError('');
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (result.error) {
      setFormError(clerkMessage(result.error, t('auth.error_sign_in', 'Sign in failed')));
      setBusy(false);
      return;
    }
    if (signIn.status === 'complete') {
      const finalized = await signIn.finalize();
      if (finalized.error) setFormError(clerkMessage(finalized.error, t('auth.error_sign_in', 'Sign in failed')));
    } else {
      setFormError(t('auth.error_sign_in', 'Sign in failed'));
    }
    setBusy(false);
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    const next = {
      fullName: fullName.trim() ? '' : t('validation.field_required', '{{field}} is required', { field: t('auth.sign_up.name_label', 'Full Name') }),
      email: emailError(email, t),
      password: passwordError(password, t),
      confirm: password === confirm ? '' : t('validation.password_match', 'Passwords do not match'),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    setFormError('');
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const result = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName,
      lastName: rest.join(' ') || undefined,
    });
    if (result.error) {
      setFormError(clerkMessage(result.error, t('auth.error_sign_up', 'Sign up failed')));
      setBusy(false);
      return;
    }
    if (signUp.status === 'complete') {
      const finalized = await signUp.finalize();
      if (finalized.error) setFormError(clerkMessage(finalized.error, t('auth.error_sign_up', 'Sign up failed')));
      setBusy(false);
      return;
    }
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) setFormError(clerkMessage(sent.error, t('auth.error_sign_up', 'Sign up failed')));
    else {
      setCode('');
      setView('verify');
    }
    setBusy(false);
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (code.trim().length < 4) {
      setErrors({ code: t('auth.common.code_placeholder', 'Enter 6-digit code') });
      return;
    }
    setBusy(true);
    setFormError('');
    const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (result.error) {
      setFormError(clerkMessage(result.error, t('auth.error_sign_up', 'Sign up failed')));
      setBusy(false);
      return;
    }
    if (signUp.status === 'complete') {
      const finalized = await signUp.finalize();
      if (finalized.error) setFormError(clerkMessage(finalized.error, t('auth.error_sign_up', 'Sign up failed')));
    } else {
      setFormError(t('auth.error_sign_up', 'Sign up failed'));
    }
    setBusy(false);
  };

  const handleForgot = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = emailError(email, t);
    setErrors({ email: invalid });
    if (invalid) return;
    setBusy(true);
    setFormError('');
    const created = await signIn.create({ identifier: email.trim() });
    if (created.error) {
      setFormError(clerkMessage(created.error, t('auth.forgot.toast_fail', 'Failed to send reset link')));
      setBusy(false);
      return;
    }
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) setFormError(clerkMessage(sent.error, t('auth.forgot.toast_fail', 'Failed to send reset link')));
    else {
      setCode('');
      setPassword('');
      setConfirm('');
      setView('reset');
    }
    setBusy(false);
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    const next = {
      code: code.trim().length < 4 ? t('auth.common.code_placeholder', 'Enter 6-digit code') : '',
      password: passwordError(password, t),
      confirm: password === confirm ? '' : t('validation.password_match', 'Passwords do not match'),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    setFormError('');
    const verified = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (verified.error) {
      setFormError(clerkMessage(verified.error, t('auth.reset.fail', 'Failed to reset password')));
      setBusy(false);
      return;
    }
    const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (submitted.error) {
      setFormError(clerkMessage(submitted.error, t('auth.reset.fail', 'Failed to reset password')));
      setBusy(false);
      return;
    }
    if (signIn.status === 'complete') {
      const finalized = await signIn.finalize();
      if (finalized.error) setFormError(clerkMessage(finalized.error, t('auth.reset.fail', 'Failed to reset password')));
      else setView('reset-done');
    } else {
      setFormError(t('auth.reset.fail', 'Failed to reset password'));
    }
    setBusy(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-glow" aria-hidden="true" />
      <a className="auth-home" href={home}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Samaan Bol
      </a>
      <div className="auth-panel">
        {view === 'sign-in' ? (
          <form onSubmit={(event) => void handleSignIn(event)}>
            <AuthMark />
            <AuthHeading title={t('auth.sign_in.title', 'Welcome back')} subtitle={t('auth.sign_in.subtitle', 'Sign in to your account')} />
            {formError ? <p className="auth-banner" role="alert">{formError}</p> : null}
            <div className="auth-fields">
              <Field label={t('auth.sign_in.email_label', 'Email')} icon={<IconMail />} error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.sign_in.email_placeholder', 'you@example.com')}
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); clear('email'); }}
                />
              </Field>
              <Field
                label={t('auth.sign_in.password_label', 'Password')}
                icon={<IconLock />}
                error={errors.password}
                aside={<button className="auth-forgot" type="button" onClick={() => { setFormError(''); setView('forgot'); }}>{t('auth.sign_in.forgot', 'Forgot?')}</button>}
                trailing={
                  <button
                    className="auth-eye"
                    type="button"
                    aria-label={showPassword ? t('a11y.hide_password', 'Hide password') : t('a11y.show_password', 'Show password')}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <IconEye off={!showPassword} />
                  </button>
                }
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.sign_in.password_placeholder', 'Enter your password')}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); clear('password'); }}
                />
              </Field>
            </div>
            <SaffronButton loading={busy}>{busy ? t('auth.sign_in.button_loading', 'Signing In...') : t('auth.sign_in.button', 'Sign In')}</SaffronButton>
            <SocialButtons t={t} busy={busy} mode="sign-in" onGoogle={() => void oauth('oauth_google', 'sign-in')} onApple={() => void oauth('oauth_apple', 'sign-in')} />
            <FooterSwitch prompt={t('auth.sign_in.no_account', "Don't have an account?")} action={t('auth.sign_in.sign_up_link', 'Sign Up')} onClick={() => { setFormError(''); setErrors({}); setView('sign-up'); }} />
            <div id="clerk-captcha" className="auth-captcha" />
          </form>
        ) : null}

        {view === 'sign-up' ? (
          <form onSubmit={(event) => void handleSignUp(event)}>
            <AuthMark />
            <AuthHeading title={t('auth.sign_up.title', 'Create account')} subtitle={t('auth.sign_up.subtitle', 'Set up your shop in minutes')} />
            {formError ? <p className="auth-banner" role="alert">{formError}</p> : null}
            <div className="auth-fields">
              <Field label={t('auth.sign_up.name_label', 'Full Name')} icon={<IconUser />} error={errors.fullName}>
                <input autoComplete="name" placeholder={t('auth.sign_up.name_placeholder', 'Your full name')} value={fullName} onChange={(event) => { setFullName(event.target.value); clear('fullName'); }} />
              </Field>
              <Field label={t('auth.sign_up.email_label', 'Email')} icon={<IconMail />} error={errors.email}>
                <input type="email" autoComplete="email" placeholder={t('auth.sign_up.email_placeholder', 'you@example.com')} value={email} onChange={(event) => { setEmail(event.target.value); clear('email'); }} />
              </Field>
              <Field label={t('auth.sign_up.password_label', 'Password')} icon={<IconLock />} error={errors.password}>
                <input type="password" autoComplete="new-password" placeholder={t('auth.sign_up.password_placeholder', 'Create a password')} value={password} onChange={(event) => { setPassword(event.target.value); clear('password'); }} />
              </Field>
              <Field label={t('auth.sign_up.confirm_label', 'Confirm Password')} icon={<IconLock />} error={errors.confirm}>
                <input type="password" autoComplete="new-password" placeholder={t('auth.sign_up.confirm_placeholder', 'Confirm your password')} value={confirm} onChange={(event) => { setConfirm(event.target.value); clear('confirm'); }} />
              </Field>
            </div>
            <SaffronButton loading={busy}>{busy ? t('auth.sign_up.button_loading', 'Creating Account...') : t('auth.sign_up.button', 'Create Account')}</SaffronButton>
            <SocialButtons t={t} busy={busy} mode="sign-up" onGoogle={() => void oauth('oauth_google', 'sign-up')} onApple={() => void oauth('oauth_apple', 'sign-up')} />
            <FooterSwitch prompt={t('auth.sign_up.has_account', 'Already have an account?')} action={t('auth.sign_up.sign_in_link', 'Sign In')} onClick={() => { setFormError(''); setErrors({}); setView('sign-in'); }} />
            <div id="clerk-captcha" className="auth-captcha" />
          </form>
        ) : null}

        {view === 'verify' ? (
          <form onSubmit={(event) => void handleVerify(event)}>
            <div className="auth-badge" aria-hidden="true"><IconLock /></div>
            <AuthHeading title="Verify your email" subtitle={`We sent a verification code to ${email}`} />
            {formError ? <p className="auth-banner" role="alert">{formError}</p> : null}
            <div className="auth-fields">
              <Field label="Verification Code" icon={<IconLock />} error={errors.code}>
                <input inputMode="numeric" autoComplete="one-time-code" placeholder={t('auth.common.code_placeholder', 'Enter 6-digit code')} value={code} onChange={(event) => { setCode(event.target.value); clear('code'); }} />
              </Field>
            </div>
            <SaffronButton loading={busy} disabled={code.trim().length < 4}>{busy ? 'Verifying...' : 'Verify Email'}</SaffronButton>
            <FooterSwitch prompt={t('auth.common.wrong_email', 'Wrong email?')} action={t('auth.common.go_back', 'Go back')} onClick={() => setView('sign-up')} />
          </form>
        ) : null}

        {view === 'forgot' ? (
          <form onSubmit={(event) => void handleForgot(event)}>
            <AuthMark />
            <AuthHeading title={t('auth.forgot.title', 'Reset Password')} subtitle={t('auth.forgot.subtitle', 'Enter your email to receive a reset link')} />
            {formError ? <p className="auth-banner" role="alert">{formError}</p> : null}
            <div className="auth-fields">
              <Field label={t('auth.forgot.email_label', 'Email')} icon={<IconMail />} error={errors.email}>
                <input type="email" autoComplete="email" placeholder={t('auth.forgot.email_placeholder', 'you@example.com')} value={email} onChange={(event) => { setEmail(event.target.value); clear('email'); }} />
              </Field>
            </div>
            <SaffronButton loading={busy}>{busy ? t('auth.forgot.button_loading', 'Sending...') : t('auth.forgot.button', 'Send Reset Link')}</SaffronButton>
            <FooterSwitch prompt={t('auth.forgot.remember', 'Remember your password?')} action={t('auth.sign_in_link', 'Sign In')} onClick={() => { setFormError(''); setView('sign-in'); }} />
          </form>
        ) : null}

        {view === 'reset' ? (
          <form onSubmit={(event) => void handleReset(event)}>
            <div className="auth-badge" aria-hidden="true"><IconLock /></div>
            <AuthHeading title={t('auth.forgot.title', 'Reset Password')} subtitle={`Enter the code sent to ${email}`} />
            {formError ? <p className="auth-banner" role="alert">{formError}</p> : null}
            <div className="auth-fields">
              <Field label="Verification Code" icon={<IconLock />} error={errors.code}>
                <input inputMode="numeric" autoComplete="one-time-code" placeholder={t('auth.common.code_placeholder', 'Enter 6-digit code')} value={code} onChange={(event) => { setCode(event.target.value); clear('code'); }} />
              </Field>
              <Field label={t('auth.reset.password_label', 'New Password')} icon={<IconLock />} error={errors.password}>
                <input type="password" autoComplete="new-password" placeholder={t('auth.common.new_password_placeholder', 'Enter new password')} value={password} onChange={(event) => { setPassword(event.target.value); clear('password'); }} />
              </Field>
              <Field label={t('auth.reset.confirm_label', 'Confirm Password')} icon={<IconLock />} error={errors.confirm}>
                <input type="password" autoComplete="new-password" placeholder={t('auth.common.confirm_password_placeholder', 'Re-enter new password')} value={confirm} onChange={(event) => { setConfirm(event.target.value); clear('confirm'); }} />
              </Field>
            </div>
            <SaffronButton loading={busy}>{busy ? t('auth.reset.button_loading', 'Resetting...') : t('auth.reset.button', 'Reset Password')}</SaffronButton>
            <FooterSwitch prompt={t('auth.forgot.back_to', 'Back to')} action={t('auth.sign_in_link', 'Sign In')} onClick={() => { setFormError(''); setView('sign-in'); }} />
          </form>
        ) : null}

        {view === 'reset-done' ? (
          <div className="auth-done">
            <h1>{t('auth.reset.success', 'Password reset successfully!')}</h1>
            <p>Signing you in...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
