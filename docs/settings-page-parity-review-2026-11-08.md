# Settings parity and redesign — 8 November 2026

## Evidence and scope

Compared the native `app/(tabs)/settings.tsx`, profile modal, preferences API, schema defaults and recap recipient logic in `dukaan_voice_mobile` with the web Settings screen and its existing destinations. This is a source-backed parity review, not a new native simulator acceptance run.

Implemented in the `codex/web-home-parity-design-20261107` worktree alongside the previous web screen updates. No production deployment or live account mutation was performed.

## Parity decisions

| Area | Web result |
| --- | --- |
| App language and display | Retained app language, four text sizes and high contrast. Controls reflect confirmed preferences and retain saved values on failure. |
| Voice | Added voice language and spoken-response controls using the existing preferences API consumed by web voice flows. Premium/connectivity requirements remain explicit. |
| Preference scope | Clarified that these preferences belong to the signed-in account. Daily recap remains owner-only; browser notification permission is presented separately as “This browser.” |
| Identity and plan | Persistent identity/current-shop/role/plan summary; Account shows read-only identity and shop details, matching native profile behavior. |
| Shop tools | Role-aware access to shop profile, payments, billing, staff/invites, customers, cashbook, GST, purchasing and online store. Managers reach helper invitations through Staff. |
| Migration tools | Added product, customer and supplier import and opening-balance shortcuts with their existing permissions. Destination pages retain their own entitlement, review and confirmation rules. |
| Records | Inventory and Activity exports for members; sales export for permitted Premium members. Helper inventory export omits purchase costs. Activity uses the localized, formula-safe Activity exporter. Inventory column headers remain the existing English format; Sales CSV remains server-generated. |
| Account access | Shop switch/join, non-owner leave confirmation, legal links, sign-out and existing retained-record account deletion flow remain available. Sign-out uses the provider's existing billing/offline/push cleanup. |
| Native updates | Native build/OTA controls are platform-specific and are not presented as web features. |

## Design

Four focused sections—Preferences, Shop, Data and Account—replace the card stack. The page uses the shared dark palette, saffron selection rules, restrained typography and ruled rows used by the newer web screens. Account-removal controls sit in an explicit disclosure away from everyday settings.

The desktop section navigation becomes a wrapping row on mobile. Fields, toggles, exports and profile facts adapt to narrow widths and larger text. A shared header overflow found with Tamil at extra-large text on 320px screens was corrected with a wrapping mobile header and bounded shop selector. The redundant header New sale shortcut remains available from 640px upward.

## Localization

Added 54 `settingsweb.*` labels in all ten app languages: English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Reused existing translated destination labels. Legal links use the selected locale; Hinglish points to Hindi legal pages. User/shop data is displayed as entered.

## Verification

- `npm run build:verified` — passed after the final changes.
- `npm run test:settings` — 7 passed: API defaults, false-value preservation, invalid-value normalization, role permissions, import permissions, offline destinations, section parsing and legal URLs.
- `npm run test:translations` — passed, 1,901 web labels across nine translated languages plus English.
- `git diff --check` — passed.
- Synthetic preview uses the actual Settings, provider-context consumers and shared UI components, with mocked APIs and identity. It is not a live authenticated acceptance test.
- 120 layout checks: all ten languages, four sections, widths 320/768/1135. No horizontal overflow or raw translation keys.
- 40 additional checks: all ten languages, four sections, 320px and extra-large text. No overflow or raw keys after the header fix.
- Local interaction checks: voice language and response toggles, app-language save confirmation, contrast/text scaling, pending/failed saves, owner/manager/helper visibility, offline disabling, Free-plan export gating, export failure recovery, and non-owner leave confirmation/cancel.
- Downloaded and inspected synthetic Inventory, Activity and Sales CSVs. Helper Inventory excluded purchase costs. No actual leave, deletion, sign-out, permission subscription, billing change or import was executed.

Evidence directory:
`/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/dashboard-review/settings/`

Files: `settings-desktop.png`, `settings-shop.png`, `settings-hindi-mobile.png`, `layout-checks.json`.

Review URL: `http://127.0.0.1:8010/?screen=settings&lang=en&role=OWNER`.
