"use client";
import { useShop } from './context';
import { formatWhen, formatTime, formatDay } from '../../lib/shop/money';
export function useShopDates() {
  const { prefs } = useShop();
  const language = prefs?.appLanguage;
  return {
    formatWhen: (value: string | null | undefined) => formatWhen(value, language),
    formatTime: (value: string | null | undefined) => formatTime(value, language),
    formatDay: (value: string | null | undefined) => formatDay(value, language),
  };
}
