import { EN_FALLBACK } from './en-fallback';
import source from './locales/en.json';
import gstLocales from './gst-locales.json';
import webLocales from './gst-web-locales.json';

export const APP_LANGUAGES = ['en', 'hi', 'hinglish', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml'] as const;
const mobile = gstLocales as Record<string, Record<string, string>>;
const web = webLocales as Record<string, Record<string, string>>;
const english: Record<string, string> = { ...source, ...EN_FALLBACK, ...web.en };
const keysByText = new Map<string, string[]>();
for (const [key, value] of Object.entries(english)) {
  const keys = keysByText.get(value) ?? [];
  keys.push(key);
  keysByText.set(value, keys);
}

export function translateUi(language: string, dictionary: Record<string, string>, key: string, fallback: string, vars?: Record<string, string | number>) {
  const catalogs = [web[language] ?? {}, mobile[language] ?? {}, dictionary];
  const webKey = 'web.gst.' + fallback.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const candidates = [webKey, key, ...(keysByText.get(fallback) ?? [])];
  let text = fallback;
  outer: for (const candidate of candidates) {
    for (const catalog of catalogs) {
      const value = catalog[candidate];
      const tokens = value?.match(/\{\{?(\w+)\}?\}/g) ?? [];
      const complete = tokens.every(token => vars && token.replace(/[{}]/g, '') in vars);
      if (value && complete && value !== candidate && (language === 'en' || value !== english[candidate])) {
        text = value;
        break outer;
      }
    }
  }
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{{${name}}}`, String(value)).replaceAll(`{${name}}`, String(value));
  return text;
}

// Separate chunks keep every supported language available without shipping all catalogs on first load.
export async function loadBundledLanguage(language: string): Promise<Record<string, string>> {
  switch (language) {
    case 'hi': return (await import('./locales/hi.json')).default;
    case 'hinglish': return (await import('./locales/hinglish.json')).default;
    case 'bn': return (await import('./locales/bn.json')).default;
    case 'ta': return (await import('./locales/ta.json')).default;
    case 'te': return (await import('./locales/te.json')).default;
    case 'mr': return (await import('./locales/mr.json')).default;
    case 'kn': return (await import('./locales/kn.json')).default;
    case 'gu': return (await import('./locales/gu.json')).default;
    case 'ml': return (await import('./locales/ml.json')).default;
    default: return source;
  }
}
