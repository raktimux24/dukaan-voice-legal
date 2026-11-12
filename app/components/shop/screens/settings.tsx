"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DeletionControl } from "../deletion-control";
import { TabList, syncQuery } from "../settings-tabs";
import { BrowserNotifications } from "../browser-notifications";
import { downloadText, inventoryCsv } from "../../../lib/shop/csv";
import { activityCsv } from "../../../lib/shop/activity";
import {
  SETTINGS_SECTIONS,
  TEXT_SIZES,
  settingsSection,
  settingsLegalPath,
  preferenceValues,
  settingsLinks,
  settingsImports,
  type SettingsLink,
} from "../../../lib/shop/settings";
import { SUPPORTED_LANGUAGES } from "../../../lib/shop/languages";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import {
  shopType,
  remapShopCategory,
  remapShopSubtype,
} from "../../../lib/shop/catalog";
import type { UserPreferences } from "../../../lib/shop/types";
import { useShop } from "../context";
import {
  Button,
  Field,
  Glyph,
  Notice,
  PageHeader,
  Spinner,
  inputClass,
} from "../ui";

// Same names as the mobile settings list where the web label differs.
const DESTINATION_LABELS: Record<string, [string, string]> = {
  "/shop/settings/gst": ["web.gst.gst_records", "GST records"],
};
function SettingsDestination({ item }: { item: SettingsLink }) {
  const { t } = useShop();
  const [key, fallback] = DESTINATION_LABELS[item.href] ?? [
    item.key,
    item.fallback,
  ];
  return (
    <Link href={item.href} className="settings-destination">
      <span aria-hidden="true">
        <Glyph name={item.icon} />
      </span>
      <strong>{t(key, fallback)}</strong>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
function SettingToggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="settings-toggle">
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
function SettingsGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-group">
      <header>
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}
export function SettingsScreen() {
  const { userId, shop, role, offline } = useShop();
  return <SettingsWorkspace key={`${userId}:${shop?.id}:${role}:${offline}`} />;
}
function SettingsWorkspace() {
  const { user, isLoaded } = useUser(),
    clerk = useClerk(),
    params = useSearchParams();
  const {
    api,
    shop,
    shops,
    userId,
    perms,
    role,
    prefs,
    savePrefs,
    signOutShop,
    premium,
    entitlement,
    hideCost,
    offline,
    selectShop,
    t,
  } = useShop();
  const [section, setSection] = useState(() =>
      settingsSection(params.get("section")),
    ),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState<string | null>(null),
    [status, setStatus] = useState<string | null>(null),
    [leaving, setLeaving] = useState(false);
  const alive = useRef(true),
    lock = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const text = (key: string, vars?: Record<string, string | number>) =>
    t(key, EN_FALLBACK[key] ?? "", vars);
  const run = async (
    id: string,
    task: () => Promise<void>,
    success?: string,
  ) => {
    if (lock.current || (offline && id !== "signout")) return;
    lock.current = true;
    setBusy(id);
    setError(null);
    setStatus(null);
    try {
      if (id !== "signout") api.assertSession();
      await task();
      if (alive.current && success) setStatus(success);
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) {
        lock.current = false;
        setBusy(null);
      }
    }
  };
  const save = (patch: Partial<UserPreferences>) =>
    void run("preference", () => savePrefs(patch), "settingsweb.saved");
  const values = preferenceValues(prefs),
    disabled = !!busy || offline,
    links = settingsLinks(perms, offline),
    imports = settingsImports(perms, offline);
  if (!shop || !isLoaded) return <Spinner />;
  const plan = !entitlement
    ? "—"
    : entitlement?.status === "trialing" && !entitlement.temporaryPremium
      ? t("subscription.status.trialing", "Trial")
      : premium
        ? t("subscription.status.active", "Premium")
        : t("subscription.status.legacy_free", "Free plan");
  const exportData = (kind: "inventory" | "activity" | "sales") =>
    void run(
      kind,
      async () => {
        if (kind === "sales" && (!perms.canSeeReports || !premium)) return;
        const csv =
          kind === "inventory"
            ? inventoryCsv(
                await api.getAllInventory(shop.id, hideCost),
                hideCost,
                prefs?.appLanguage,
              )
            : kind === "activity"
              ? activityCsv(
                  await api.getAllAudit(shop.id),
                  text,
                  prefs?.appLanguage,
                )
              : await api.salesCsv(shop.id, { period: "month" });
        api.assertSession();
        if (alive.current)
          downloadText(
            `${kind}-${kind === "sales" ? "month" : new Date().toISOString().slice(0, 10)}.csv`,
            csv,
          );
      },
      "settingsweb.downloaded",
    );
  const category = shopType(shop.category),
    subtype = category.subtypes.find(
      (s) => s.code === remapShopSubtype(shop.category, shop.subtype),
    );
  return (
    <div className="shop-page settings-workspace">
      <PageHeader
        title={t("settings.title", "Settings")}
        description={t(
          "settingsweb.intro",
          "Your preferences, your shop and the records behind it.",
        )}
      />
      <div className="settings-identity">
        <div className="settings-identity-person">
          <span className="settings-avatar" aria-hidden="true">
            {(user?.fullName || user?.primaryEmailAddress?.emailAddress || "—")
              .charAt(0)
              .toUpperCase()}
          </span>
          <div>
            <strong>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress || "—"}
            </strong>
            <p>{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="settings-shop-context">
          <small>{t("settingsweb.current_shop", "Current shop")}</small>
          <strong>{shop.name}</strong>
          <span>
            {role ? text("role." + role.toLowerCase()) : "—"}
            <i aria-hidden="true"> · </i>
            {plan}
          </span>
        </div>
      </div>
      {offline ? (
        <p className="settings-offline" role="status">
          {t(
            "settingsweb.offline",
            "Reconnect to change settings or download records.",
          )}
        </p>
      ) : null}
      <div className="settings-layout">
        <TabList
          className="settings-nav"
          label={t("settingsweb.navigation", "Settings sections")}
          idPrefix="settings"
          vertical
          value={section}
          items={SETTINGS_SECTIONS.map(
            (id) =>
              [
                id,
                t(
                  "settingsweb." + id,
                  {
                    preferences: "Preferences",
                    shop: "Shop",
                    data: "Data",
                    account: "Account",
                  }[id],
                ),
              ] as const,
          )}
          renderLabel={(_, label) => (
            <>
              {label}
              <span aria-hidden="true">→</span>
            </>
          )}
          onChange={(id) => {
            const next = settingsSection(id);
            setSection(next);
            setError(null);
            setStatus(null);
            // Keep the section in the address so "← Settings" and reloads return here.
            syncQuery("section", next === "preferences" ? null : next);
          }}
        />
        <div
          className="settings-panel"
          id={"settings-panel-" + section}
          role="tabpanel"
          aria-labelledby={"settings-tab-" + section}
        >
          <Notice error={error} />
          {busy ? (
            <p className="settings-status" role="status">
              {busy === "preference"
                ? t("common.saving", "Saving…")
                : t("common.loading", "Loading…")}
            </p>
          ) : status ? (
            <p className="settings-status" role="status">
              {text(status)}
            </p>
          ) : null}
          {section === "preferences" ? (
            <>
              <SettingsGroup
                title={t("settingsweb.language_voice", "Language & voice")}
                hint={t(
                  "settingsweb.preference_scope",
                  "Saved to your account and used on devices where you sign in.",
                )}
              >
                <div className="settings-fields">
                  <Field label={t("settingsweb.app_language", "App language")}>
                    <select
                      className={inputClass}
                      disabled={disabled}
                      value={values.appLanguage}
                      onChange={(e) => save({ appLanguage: e.target.value })}
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label={t("settingsweb.voice_language", "Voice language")}
                  >
                    <select
                      className={inputClass}
                      disabled={disabled}
                      value={values.voiceLanguage}
                      onChange={(e) => save({ voiceLanguage: e.target.value })}
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <SettingToggle
                  label={t("settingsweb.voice_feedback", "Voice feedback")}
                  hint={t(
                    "settingsweb.voice_hint",
                    "Play spoken responses after voice commands. Voice requires Premium and internet.",
                  )}
                  checked={values.voiceFeedbackEnabled}
                  disabled={disabled}
                  onChange={(v) => save({ voiceFeedbackEnabled: v })}
                />
              </SettingsGroup>
              <SettingsGroup title={t("settingsweb.display", "Display")}>
                <div className="settings-select-row">
                  <span>{t("settingsweb.text_size", "Text size")}</span>
                  <select
                    aria-label={t("settingsweb.text_size", "Text size")}
                    className={inputClass}
                    disabled={disabled}
                    value={values.textSize}
                    onChange={(e) => save({ textSize: e.target.value })}
                  >
                    {TEXT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {t("text_size." + size, size.replace("_", " "))}
                      </option>
                    ))}
                  </select>
                </div>
                <SettingToggle
                  label={t("settingsweb.high_contrast", "High contrast")}
                  hint={t(
                    "settingsweb.contrast_hint",
                    "Stronger borders and clearer separation between controls.",
                  )}
                  checked={values.highContrastMode}
                  disabled={disabled}
                  onChange={(v) => save({ highContrastMode: v })}
                />
              </SettingsGroup>
              <SettingsGroup
                title={t("settingsweb.notifications", "Notifications")}
              >
                {role === "OWNER" ? (
                  <SettingToggle
                    label={t("settingsweb.daily_recap", "Daily evening recap")}
                    hint={t(
                      "settingsweb.recap_hint",
                      "Receive an evening shop summary on supported devices with notifications enabled.",
                    )}
                    checked={values.dailyRecapEnabled}
                    disabled={disabled}
                    onChange={(v) => save({ dailyRecapEnabled: v })}
                  />
                ) : null}
                <div className="settings-browser-notifications">
                  <BrowserNotifications />
                </div>
              </SettingsGroup>
            </>
          ) : null}
          {section === "shop" ? (
            <>
              <SettingsGroup
                title={t("settingsweb.current_shop", "Current shop")}
                hint={t(
                  "settingsweb.shop_scope",
                  "Shop controls follow your role. Only the owner can change billing and shop setup.",
                )}
              >
                <Field
                  label={t("modal.shop_settings.switch_shop", "Switch shop")}
                >
                  <select
                    className={inputClass}
                    disabled={disabled || shops.length < 2}
                    value={shop.id}
                    onChange={(e) => selectShop(e.target.value)}
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {!offline ? (
                  <Link className="settings-text-link" href="/shop/onboarding">
                    {t("settingsweb.join", "Create or join another shop")} →
                  </Link>
                ) : null}
                <div className="settings-destinations">
                  {links.map((item) => (
                    <SettingsDestination key={item.href} item={item} />
                  ))}
                </div>
              </SettingsGroup>
              {!perms.canManageShop ? (
                <p className="settings-footnote">
                  {t(
                    "settingsweb.owner_billing",
                    "The owner manages this shop’s subscription and payment settings.",
                  )}
                </p>
              ) : null}
            </>
          ) : null}
          {section === "data" ? (
            <>
              {imports.length ? (
                <SettingsGroup
                  title={t("settingsweb.bring_records", "Bring your records")}
                  hint={t(
                    "settingsweb.import_hint",
                    "Import lists first, then review opening balances. Access and Premium requirements apply inside each tool.",
                  )}
                >
                  <div className="settings-destinations">
                    {imports.map((item) => (
                      <SettingsDestination key={item.href} item={item} />
                    ))}
                  </div>
                </SettingsGroup>
              ) : null}
              <SettingsGroup
                title={t("settings.export_data", "Export data")}
                hint={t(
                  "settingsweb.export_hint",
                  "Download CSV files for Excel or Google Sheets. Exports respect your access and available history.",
                )}
              >
                <div className="settings-export-row">
                  <div>
                    <h3>{t("settingsweb.inventory", "Inventory")}</h3>
                    <p>
                      {t(
                        "settingsweb.inventory_hint",
                        "All current products and stock. Cost is included only when your role allows it.",
                      )}
                    </p>
                  </div>
                  <Button
                    tone="ghost"
                    disabled={disabled}
                    onClick={() => exportData("inventory")}
                  >
                    {t("settingsweb.download", "Download CSV")} ↓
                  </Button>
                </div>
                <div className="settings-export-row">
                  <div>
                    <h3>{t("activity.title", "Activity log")}</h3>
                    <p>
                      {t(
                        "settingsweb.activity_hint",
                        "Available activity history. Free shops are limited to the last seven days.",
                      )}
                    </p>
                  </div>
                  <Button
                    tone="ghost"
                    disabled={disabled}
                    onClick={() => exportData("activity")}
                  >
                    {t("settingsweb.download", "Download CSV")} ↓
                  </Button>
                </div>
                {perms.canSeeReports ? (
                  <div className="settings-export-row">
                    <div>
                      <h3>
                        {t("settings.export_sales", "Sales CSV (this month)")}
                      </h3>
                      <p>
                        {t(
                          "settingsweb.sales_hint",
                          "This calendar month. Premium is required for sales exports.",
                        )}
                      </p>
                    </div>
                    {premium ? (
                      <Button
                        tone="ghost"
                        disabled={disabled}
                        onClick={() => exportData("sales")}
                      >
                        {t("settingsweb.download", "Download CSV")} ↓
                      </Button>
                    ) : (
                      <Link
                        className="settings-text-link"
                        href="/shop/settings/subscription"
                      >
                        {t("settingsweb.view_plan", "View plan")} →
                      </Link>
                    )}
                  </div>
                ) : null}
              </SettingsGroup>
            </>
          ) : null}
          {section === "account" ? (
            <>
              <SettingsGroup
                title={t("settingsweb.profile", "Your profile")}
                hint={t(
                  "settingsweb.profile_hint",
                  "Your identity and role in the selected shop.",
                )}
              >
                <dl className="settings-facts">
                  {[
                    [t("settingsweb.name", "Name"), user?.fullName || "—"],
                    [
                      t("settingsweb.email", "Email"),
                      user?.primaryEmailAddress?.emailAddress || "—",
                    ],
                    [t("settingsweb.shop", "Shop"), shop.name],
                    [
                      t("settingsweb.shop_type", "Shop type"),
                      [
                        t(
                          "settingsweb.type_" +
                            remapShopCategory(shop.category),
                          category.label,
                        ),
                        subtype
                          ? t("catalog.subtype." + subtype.code, subtype.label)
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · "),
                    ],
                    [
                      t("modal.shop_settings.phone_label", "Phone"),
                      shop.phone || "—",
                    ],
                    [
                      t("modal.shop_settings.address_label", "Address"),
                      [shop.address, shop.city].filter(Boolean).join(", ") ||
                        "—",
                    ],
                    [
                      t("settingsweb.shop_language", "Shop language"),
                      SUPPORTED_LANGUAGES.find((l) => l.code === shop.language)
                        ?.label ||
                        shop.language ||
                        "—",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <Button
                  tone="ghost"
                  disabled={!!busy || !user}
                  onClick={() => void run("signout", signOutShop)}
                >
                  {t("settings.sign_out", "Sign out")}
                </Button>
              </SettingsGroup>
              <SettingsGroup title={t("settings.section_legal", "Legal")}>
                <div className="settings-legal">
                  <Link
                    href={settingsLegalPath(
                      "privacy-policy",
                      prefs?.appLanguage,
                    )}
                  >
                    {t("settings.privacy_policy", "Privacy policy")} ↗
                  </Link>
                  <Link
                    href={settingsLegalPath(
                      "terms-of-service",
                      prefs?.appLanguage,
                    )}
                  >
                    {t("settings.terms_of_service", "Terms of service")} ↗
                  </Link>
                </div>
              </SettingsGroup>
              {!offline ? (
                <details className="settings-danger">
                  <summary>
                    {t(
                      "settingsweb.access_changes",
                      "Leaving & account deletion",
                    )}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <div>
                    {role !== "OWNER" ? (
                      <section>
                        <h3>
                          {t(
                            "modal.shop_settings.leave_shop",
                            "Leave this shop",
                          )}
                        </h3>
                        <p>
                          {t(
                            "settingsweb.leave_hint",
                            "Leaving removes your access to this shop. You can rejoin with a new invitation.",
                          )}
                        </p>
                        {leaving ? (
                          <div className="settings-leave-confirm">
                            <p>
                              {t(
                                "modal.shop_settings.leave_message",
                                "You will lose access to this shop's inventory and data. You can rejoin later with an invite code.",
                              )}
                            </p>
                            <Button
                              tone="ghost"
                              disabled={disabled}
                              onClick={() => setLeaving(false)}
                            >
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button
                              tone="danger"
                              disabled={disabled}
                              onClick={() =>
                                void run("leave", async () => {
                                  await api.leaveShop(shop.id);
                                  if (alive.current)
                                    window.location.assign("/shop");
                                })
                              }
                            >
                              {t(
                                "modal.shop_settings.leave_confirm",
                                "Leave shop",
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            tone="danger"
                            disabled={disabled}
                            onClick={() => setLeaving(true)}
                          >
                            {t(
                              "modal.shop_settings.leave_shop",
                              "Leave this shop",
                            )}
                          </Button>
                        )}
                      </section>
                    ) : null}
                    <section>
                      <h3>{t("settings.delete_account", "Delete account")}</h3>
                      <DeletionControl
                        key={user?.id}
                        kind="account"
                        isCurrent={() => !!user && clerk.user?.id === user.id}
                        t={(key) => t(key, key)}
                        removeRecords={async () => {
                          if (!user) throw Error("identity_unavailable");
                          return api.deleteAccount();
                        }}
                        removeIdentity={async () => {
                          if (!user) throw Error("identity_unavailable");
                          await user.delete();
                        }}
                        onDeleted={() => window.location.assign("/")}
                      />
                    </section>
                  </div>
                </details>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
