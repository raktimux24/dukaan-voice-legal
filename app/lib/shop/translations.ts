import retailLocales from './retail-locales.json';
import {SUPPORTED_LANGUAGES} from './languages';
import { EN_FALLBACK } from './en-fallback';
import source from './locales/en.json';
import gstLocales from './gst-locales.json';
import webLocales from './gst-web-locales.json';

export const APP_LANGUAGES = SUPPORTED_LANGUAGES.map(language=>language.code);
const retail = retailLocales as Record<string, Record<string, string>>;
const mobile = gstLocales as Record<string, Record<string, string>>;
const web = webLocales as Record<string, Record<string, string>>;
const english: Record<string, string> = { ...source, ...EN_FALLBACK, ...web.en, ...retail.en };
const currentEnglishGst = Object.fromEntries(Object.entries(english).filter(([key]) => key.startsWith('gst.')));
const keysByText = new Map<string, string[]>();
for (const [key, value] of Object.entries(english)) {
  const keys = keysByText.get(value) ?? [];
  keys.push(key);
  keysByText.set(value, keys);
}

/** Prefer reviewed Roman Hinglish over stale server translations, while retaining server-only keys. */
export function mergeLanguageCatalog(language: string, bundled: Record<string, string>, fresh: Record<string, string>) {
  if (language !== 'hinglish') return { ...bundled, ...fresh };
  const romanFresh = Object.fromEntries(Object.entries(fresh).filter(([, value]) => !/[\u0900-\u097f]/u.test(value)));
  return { ...romanFresh, ...bundled };
}

export function translateUi(language: string, dictionary: Record<string, string>, key: string, fallback: string, vars?: Record<string, string | number>) {
  const catalogs = [retail[language] ?? {}, web[language] ?? {}, mobile[language] ?? {}, ...(language === 'en' ? [currentEnglishGst] : []), dictionary];
  const webKey = 'web.gst.' + fallback.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  // New dashboard copy has explicit translations; older text aliases can have
  // different meaning (for example "Recent bills" used to resolve to "Sales").
  const explicitHomeCopy = key.startsWith('deletion.') || key.startsWith('settings.delete') || key.startsWith('utility.') || key.startsWith('debit.') || key.startsWith('modal.alerts.') || key.startsWith('brief.') || key.startsWith('brandweb.') || key.startsWith('documents.') || key.startsWith('pos_settings.') || key.startsWith('payweb.') || key.startsWith('profileweb.') || key.startsWith('catalog.shop.') || key.startsWith('catalog.subtype.') || key.startsWith('invoiceweb.') || key.startsWith('poweb.') || key.startsWith('po.') || key.startsWith('unit_picker.') || key.startsWith('gst.product_price_') || key.startsWith('productform.') || key.startsWith('modal.add_product.') || key.startsWith('billingweb.') || key.startsWith('settingsweb.') || key.startsWith('activityweb.') || key.startsWith('activity.') || key.startsWith('homeweb.') || key.startsWith('sellweb.') || key.startsWith('checkoutweb.') || key.startsWith('salesweb.') || key.startsWith('reports.') || key.startsWith('sales.summary.') || key.startsWith('reportweb.') || key.startsWith('staffweb.') || key.startsWith('customerweb.') || key.startsWith('customers.') || key.startsWith('supplierweb.') || key.startsWith('suppliers.') || key.startsWith('directoryUI.') || key.startsWith('buyweb.') || key.startsWith('buy_list.') || key.startsWith('modal.buy_list_item.') || key.startsWith('nudge.') || key.startsWith('recordsUI.') || key.startsWith('productsweb.') || key.startsWith('products.') || key.startsWith('modal.product_detail.') || key.startsWith('modal.add_batch.') || key.startsWith('stockUI.') || key.startsWith('adjust.') || key.startsWith('sale_detail.') || key.startsWith('sale_return.') || key.startsWith('home.search_');
  const candidates = explicitHomeCopy ? [key, webKey, ...(keysByText.get(fallback) ?? [])] : [webKey, key, ...(keysByText.get(fallback) ?? [])];
  let text = fallback;
  outer: for (const candidate of candidates) {
    for (const catalog of catalogs) {
      const value = catalog[candidate];
      const tokens = value?.match(/\{\{?(\w+)\}?\}/g) ?? [];
      const complete = tokens.every(token => vars && token.replace(/[{}]/g, '') in vars);
      if (value && complete && value !== candidate && (language === 'en' || value !== english[candidate] || (candidate === key && key.startsWith('nav.')) || retail[language]?.[candidate] === value || (explicitHomeCopy && candidate === key && web[language]?.[candidate] === value))) {
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
