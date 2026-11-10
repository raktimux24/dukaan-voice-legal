# Shop Profile: mobile parity and web redesign

Date: 9 November 2026.

## Scope

Compared `app/(modals)/shop-settings.tsx`, the mobile unit picker, phone validation, preference defaults and the server shop-update contract with the web Shop Profile. Implemented in the current web worktree alongside the preceding, uncommitted Supplier Invoices changes. No commit, deployment or production record change was performed.

## Parity findings

| Mobile capability | Previous web page | Updated web page |
| --- | --- | --- |
| Profile visible to all shop members; owner edits | Entire page denied to non-owners | Members can view the profile from Settings. Only owners can edit online. |
| Owner name | Absent from web type and form | Owner name displayed and editable; maximum 120 characters; changing it to blank is rejected. Legacy missing names are not forced into unrelated updates. |
| Phone validation and normalization | Only trimmed | Optional Indian mobile validation, including +91/91/0 prefixes. Invalid nonempty numbers block saving. |
| Edit, cancel, save feedback | Always-open form | Readable profile first; explicit Edit and Cancel; failed saves retain the draft; save success is announced. Cancel restores every field, including owner name. |
| Refresh profile on entry | Context snapshot only | Fetches the current shop on entry, retaining the existing context view during loading. Failed refresh exposes retry. Updates send only changed fields. |
| Business type and subtype | English catalog labels | Localized business type and shop-format choices. Changing type resets incompatible format. |
| Default unit | Missing from this web journey | Same eight preference values as mobile, with shared localized unit labels. |
| Low-stock notifications and buy-list suggestions | Missing controls | Personal preference toggles use the existing preference API and mobile defaults. Saving/error feedback included; failed saves retain the previous setting. |
| Switch shop | Available in the surrounding shell | Also accessible within the profile. The in-page selector is disabled while editing; the keyed form prevents drafts carrying into another shop. |
| Support shop ID | Absent | Expandable support details with selectable ID. |
| Owner deletion / staff leave | Owner deletion only | Existing retained-record deletion workflow preserved behind a disclosure. Staff get a two-step Leave flow. Online and pending-state restrictions apply. |

The server still authorizes changes. The mobile screen and backend were not modified. Preferences are user preferences, not shop-wide settings; the copy makes that distinction. Live synchronization to a physical mobile device was not replayed.

## Design

- Saffron-led business record with a compact identity header and readable contact facts.
- Personal inventory preferences alongside the record on desktop, stacked on mobile.
- Two-column edit form on wider screens; one column on mobile with Save/Cancel above bottom navigation.
- Initial mobile edit focus scrolls the name field above the sticky action area, including with larger text.
- Support and destructive operations are expandable and separate from normal editing.

## Localization

Updated English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Added 14 profile-specific labels and translations for eight business types plus 25 shop formats. Explicit catalog-key precedence prevents unrelated English-text aliases from replacing the intended labels. Existing product unit and operational translations are reused.

## Verification

- `npm run build:verified` passed during implementation: existing release suite, TypeScript and production build.
- Final focused Settings/Profile tests: 15 passed. Covers member navigation, owner-only management links, partial patches, phone normalization, owner/name validation, nullable contact fields, field limits, catalog normalization and language coverage.
- Translation coverage: 2,142 web labels across nine translated languages plus English; interpolation and bundled mobile catalogs checked.
- Final production build and TypeScript passed after the mobile-focus fix; `git diff --check` passed.
- Final browser matrix: 60 checks = ten languages × two widths (320/390) × profile view, expanded disclosures and edit form. No page overflow, clipped controls or raw translation keys found.
- Tablet/desktop: view and edit at 768/1024/1440. Larger-text view/edit at 320 in English, Hindi and Malayalam also fitted; Malayalam field focus was rechecked after its adjustment.
- Local synthetic interactions: invalid phone rejected; accepted phone prefix normalized; type changed its available format options; Cancel restored owner name; saving updated the overview; default unit and notification preference changes persisted in the fixture. Failed profile save retained the draft; failed preference save retained the previous checkbox value. Keyboard Tab advanced from shop name to owner name.
- Manager and Helper saw no Edit control and could open/cancel Leave confirmation. Offline mutations were disabled. Missing contact details, pending refresh and failed refresh states rendered.
- No console errors observed on the final translated edit screen.

These were actual web components with synthetic local API responses. No live shop was edited, left or deleted. Destructive final submissions were not performed. Physical-device keyboards, native screen readers and cross-device preference synchronization remain separate acceptance work.

## Review artifacts

Preview: `http://127.0.0.1:8010/?screen=profile&lang=en&role=OWNER&review=profile-v4`.

Evidence directory: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/shop-profile-review-2026-11-09/`.

Includes final mobile layout JSON, wider-screen and larger-text checks, role/error-state observations and desktop/mobile screenshots. Logs: `/tmp/profile-build.log`, `/tmp/profile-final-build.log`.
