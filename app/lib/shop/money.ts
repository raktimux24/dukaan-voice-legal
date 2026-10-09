export const roundPaise = (n: number) => Math.round(n * 100) / 100;

export function formatINR(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function dateLocale(language?: string | null) {
  return ({hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', gu: 'gu-IN'} as Record<string,string>)[language ?? ''] ?? 'en-IN';
}

function dateText(value: string | null | undefined, language: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(dateLocale(language), { ...options, timeZone: 'Asia/Kolkata' }).format(date);
}

export function formatWhen(value: string | null | undefined, language?: string | null) {
  return dateText(value, language, {dateStyle: 'medium', timeStyle: 'short'});
}
export function formatTime(value: string | null | undefined, language?: string | null) {
  return dateText(value, language, {timeStyle: 'short'});
}
export function formatDay(value: string | null | undefined, language?: string | null) {
  return dateText(value, language, {dateStyle: 'medium'});
}
