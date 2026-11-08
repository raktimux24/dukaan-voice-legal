# Staff review — 8 November 2026

Compared native `app/(modals)/staff-manage.tsx`, Settings entry points, member/invite server routes, managed-role logic and product tax authorization contracts with the web Staff screen. Native parity is source-based; no new simulator or physical-device acceptance was performed.

## Parity and changes

| Capability | Web outcome |
| --- | --- |
| Team visibility | Owners and Managers can view staff. Managers now have Staff navigation and a Settings entry, matching mobile. Helpers and offline sessions remain excluded. |
| Directory | Search name/email, role filter, role counts, initials, current-member marker, email and relative app activity. Missing/future activity is not presented as active. Read failures show unknown counts rather than zero. |
| Member details | Focused detail view with role, email, joined date, recent activity and exact timestamp. Phone appears only if the API actually supplies it. Opening a member resets scroll to the top. |
| Invitations | Helper invitation default; owners may choose Manager. Managers only see/share Helper codes, even if an incorrectly supplied shop object contains a Manager code. Copy code, copy app deep link and native browser sharing with clipboard fallback have explicit feedback. No code means disabled sharing. |
| Invite replacement | Existing web-only capability preserved, now scoped to the selected role and reviewed before submission. Copy explains that the previous code stops working while existing members retain access. |
| Role/removal actions | Owner-only, excludes Owner targets. Confirmation presents the member and resulting access/removal consequences. One shared lock prevents overlapping role/removal/tax/invite writes. Active session asserted before and after requests. No mutation is automatically retried. |
| Product tax authorization | Owner-only manager permission control, separate from role and GST registration. Existing expected member/event IDs retained; query errors or missing manager authorization data cannot become an implicit grant. Confirmation plus permission timestamp/event record added. Demotion copy explains the backend's tax permission revocation. |
| Shop deletion | Removed the duplicate destructive control from Staff. Canonical Shop settings deletion remains available with its existing dedicated deletion flow. |

## Visual and language work

Uses the established dark/saffron directory style: restrained rows, clear role counts, separate member details, focused invite/confirmation sheets and concise permission explanations. Owner controls are separate from ordinary roster information. Roles and activity are labelled as app access/activity, not attendance or performance.

Added 63 explicit Staff keys across English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Existing shared navigation/form controls reused. No native-language human proofreading is claimed.

## Verification

- Eight focused tests passed: visibility and offline gates, owner-target protection, role-specific invite privacy, missing-code handling, encoded deep links, directory search/filter/order, unknown/future activity, and initials.
- `npm run build:verified` passed, including all existing release regressions, translations, TypeScript and production build. Final TypeScript and production build passed after detail-layout cleanup.
- Translation coverage passed: 1,740 web labels across English and nine translated languages, including interpolation checks.
- Browser: 90 layout combinations (list, details and invite panel × ten languages × 320/768/1135 widths); no horizontal overflow. Ten phone role-confirmation sheets fit, and ten member-navigation checks returned to the top.
- Interaction checks: email search, Helper filter, Owner protection, role-change and tax-revocation confirmation/cancel, invite replacement review/cancel, copy feedback, Manager read-only controls and Helper-only invite selector. Empty/error/loading/offline/Helper denial, tax-query failure and absent invite-code states were also checked.
- Browser copy success feedback was observed; clipboard readback through the browser tool was empty, so copied contents were not independently verified there. The deep-link encoding is unit tested. Native share-sheet delivery was not exercised.

Evidence: task visualization directory `dashboard-review/staff/` contains staff-list, staff-detail and Hindi phone screenshots plus layout/state results. Preview renders actual components against synthetic fixtures. All permission, member and invite write methods in that preview reject instead of changing data. No real invitation was sent, no code rotated, no member removed and no permission changed. Server-side mutation acceptance and physical-device sharing were not replayed. Changes remain local and are not deployed.
