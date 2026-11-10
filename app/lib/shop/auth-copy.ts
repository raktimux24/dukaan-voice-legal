import locales from './auth-locales.json';

export type AuthLanguage = keyof typeof locales;
export type AuthCopy = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
export const AUTH_LANGUAGE_STORAGE_KEY = 'samaan-auth-language';

export function authLanguage(code?: string | null): AuthLanguage | undefined {
  if (!code) return;
  const normalized = code.toLowerCase();
  if (normalized === 'hinglish' || normalized.startsWith('hi-latn')) return 'hinglish';
  const language = normalized.split('-')[0];
  return Object.hasOwn(locales, language) ? language as AuthLanguage : undefined;
}

export function resolveAuthLanguage({ requested, referrer, origin, saved, browser }: {
  requested?: string | null;
  referrer?: string;
  origin?: string;
  saved?: string | null;
  browser?: string;
}): AuthLanguage {
  const explicit = authLanguage(requested);
  if (explicit) return explicit;
  try {
    const url = new URL(referrer ?? '');
    if (url.origin === origin) {
      const first = url.pathname.split('/').filter(Boolean)[0];
      if (!first) return 'en';
      const fromWebsite = authLanguage(first);
      if (fromWebsite) return fromWebsite;
    }
  } catch { /* Direct visits have no referrer. */ }
  return authLanguage(saved) ?? authLanguage(browser) ?? 'en';
}

export function authCopy(language: AuthLanguage): AuthCopy {
  const dictionary: Record<string, string> = locales[language];
  return (key, fallback, vars) => {
    let text = dictionary[key] || fallback;
    if (vars) for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{{${name}}}`, String(value)).replaceAll(`{${name}}`, String(value));
    }
    return text;
  };
}

// Clerk error codes: https://clerk.com/docs/guides/development/errors/frontend-api
const ERROR_COPY: Record<string, string> = {
  form_password_incorrect: 'auth.error.credentials',
  form_identifier_not_found: 'auth.error.credentials',
  form_password_or_identifier_incorrect: 'auth.error.credentials',
  form_identifier_exists: 'auth.error.email_exists',
  form_password_pwned: 'auth.error.password_unsafe',
  form_password_compromised: 'auth.error.password_unsafe',
  form_code_incorrect: 'auth.verify.invalid',
  verification_expired: 'auth.verify.expired',
  too_many_requests: 'auth.verify.rate_limit',
  captcha_invalid: 'auth.error.captcha',
};

export function authErrorMessage(error: { code?: string; longMessage?: string; message?: string } | null | undefined, fallback: string, language: AuthLanguage): string {
  const key = error?.code && ERROR_COPY[error.code];
  if (key) return authCopy(language)(key, fallback);
  // Keep unknown provider details in English; use the translated action error otherwise.
  return language === 'en' ? error?.longMessage || error?.message || fallback : fallback;
}
