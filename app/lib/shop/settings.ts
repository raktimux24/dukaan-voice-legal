import type { Permissions } from "./permissions";
import type { UserPreferences } from "./types";
import { SUPPORTED_LANGUAGES } from "./languages";
export const SETTINGS_SECTIONS = [
  "preferences",
  "shop",
  "data",
  "account",
] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
export function settingsSection(value: string | null): SettingsSection {
  return SETTINGS_SECTIONS.includes(value as SettingsSection)
    ? (value as SettingsSection)
    : "preferences";
}
export const TEXT_SIZES = ["small", "medium", "large", "extra_large"] as const;
export function preferenceValues(p: Partial<UserPreferences> | null) {
  return {
    appLanguage: SUPPORTED_LANGUAGES.some((l) => l.code === p?.appLanguage)
      ? p!.appLanguage!
      : "en",
    voiceLanguage: SUPPORTED_LANGUAGES.some((l) => l.code === p?.voiceLanguage)
      ? p!.voiceLanguage!
      : "en",
    voiceFeedbackEnabled: p?.voiceFeedbackEnabled !== false,
    highContrastMode: p?.highContrastMode === true,
    textSize: TEXT_SIZES.includes(p?.textSize as (typeof TEXT_SIZES)[number])
      ? p!.textSize!
      : "medium",
    dailyRecapEnabled: p?.dailyRecapEnabled !== false,
  };
}
export type SettingsLink = {
  href: string;
  icon:
    | "store"
    | "qr"
    | "staff"
    | "card"
    | "wallet"
    | "shield"
    | "receipt"
    | "users"
    | "bag"
    | "landmark"
    | "package"
    | "truck";
  key: string;
  fallback: string;
};
export function settingsLinks(
  p: Permissions,
  offline: boolean,
): SettingsLink[] {
  if (offline) return [];
  return [
    {
      href: "/shop/settings/shop",
      icon: "store",
      key: "settingsweb.shop_profile",
      fallback: "Shop profile",
    },
    {
      href: "/shop/settings/payments",
      icon: "qr",
      key: "settings.payments_bills",
      fallback: "Payments & bills",
    },
    ...(p.canManageShop
      ? ([
          {
            href: "/shop/settings/subscription",
            icon: "card",
            key: "subscription.section_title",
            fallback: "Subscription",
          },
        ] as SettingsLink[])
      : []),
    ...(p.canManageStaff || p.role === "MANAGER"
      ? ([
          {
            href: "/shop/settings/staff",
            icon: "staff",
            key: "settings.manage_staff",
            fallback: "Staff and invites",
          },
        ] as SettingsLink[])
      : []),
    // Customers and Cashbook are daily work with their own sidebar items, so
    // they are not repeated here. Purchases and Online store stay, as on mobile.
    ...(p.canSeeReports
      ? ([
          {
            href: "/shop/settings/gst",
            icon: "shield",
            key: "gst.health_title",
            fallback: "GST records & invoice numbers",
          },
        ] as SettingsLink[])
      : []),
    ...(p.canSeeCost
      ? ([
          {
            href: "/shop/purchases",
            icon: "receipt",
            key: "purchase.title",
            fallback: "Supplier invoices & purchase tax",
          },
        ] as SettingsLink[])
      : []),
    ...(p.canEditProducts
      ? ([
          {
            href: "/shop/online-store",
            icon: "bag",
            key: "commerce.title",
            fallback: "Online store & orders",
          },
        ] as SettingsLink[])
      : []),
  ];
}
export function settingsImports(
  p: Permissions,
  offline: boolean,
): SettingsLink[] {
  if (offline) return [];
  return [
    ...(p.canEditProducts
      ? ([
          {
            href: "/shop/products/import",
            icon: "package",
            key: "imports.title",
            fallback: "Import products & stock",
          },
          {
            href: "/shop/settings/opening-balances",
            icon: "landmark",
            key: "opening.title",
            fallback: "Opening balances & migration",
          },
        ] as SettingsLink[])
      : []),
    ...(p.canManageCustomers
      ? ([
          {
            href: "/shop/customers/import",
            icon: "users",
            key: "partiesImport.customer_title",
            fallback: "Import customers",
          },
        ] as SettingsLink[])
      : []),
    ...(p.canSeeCost
      ? ([
          {
            href: "/shop/suppliers/import",
            icon: "truck",
            key: "partiesImport.supplier_title",
            fallback: "Import suppliers",
          },
        ] as SettingsLink[])
      : []),
  ];
}

export function settingsLegalPath(
  page: "privacy-policy" | "terms-of-service",
  language?: string,
) {
  const locale = language === "hinglish" ? "hi" : language;
  return (
    (locale &&
    locale !== "en" &&
    SUPPORTED_LANGUAGES.some((l) => l.code === locale)
      ? "/" + locale
      : "") +
    "/" +
    page
  );
}
