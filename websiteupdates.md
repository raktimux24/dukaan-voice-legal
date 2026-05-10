# `dukaan-voice-legal` — Guidelines to Integrate the iOS Subscription Build

## Context

The mobile app's iOS subscription flow depends on `samaanbol.space` to host the entire subscribe + billing-management surface (Apple guideline 3.1.3(b) — no IAP on iOS, so the website is the iOS portal). Today every iOS CTA opens `https://samaanbol.space/account`, which returns **404** because none of the new pages have been deployed yet.

**State of `dukaan-voice-legal` on disk:**

- The new pages exist locally as **WIP scaffolding** — `app/account/`, `app/pricing/`, `app/subscription/return/`, `app/refund-policy/`, `app/contact/`, plus `app/lib/subscriptions.ts`, `app/components/SubscriptionChrome.tsx`, and `app/styles/subscription.css`. All untracked in git.
- 15 tracked files are also modified (layout, content/*, seo, sitemap, robots, i18n, home.css, package.json, package-lock).
- Last commit on `origin/main`: `1786dc5 Remove legacy static HTML files`. None of the subscription work is pushed.
- `.env.local` has the three keys present locally; Netlify env vars are unset.
- This is **intentional WIP** — pages are not ready to ship.

The plan below is the readiness gate (what to finish + verify before deploy), the deploy steps, and the post-deploy verification — including Apple Universal Links (AASA), which is in scope for v1.

The only files this plan would change are inside `dukaan-voice-legal` (and a single `app.json` line in the mobile repo for AASA). No mobile-app code edits beyond that.

## Phase 1 — Close the readiness gate (in `dukaan-voice-legal`)

The pages exist but were marked WIP for a reason. Before any deploy, each of these must hold:

### 1.1 Environment + dependencies actually run locally

From this repo's root:

- Confirm `.env.local` has real values for all three keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (must be the **same** key the mobile app uses — single Clerk instance, single user pool)
  - `NEXT_PUBLIC_API_BASE_URL` (the Render URL of the mobile server — the same origin the mobile app's `EXPO_PUBLIC_API_URL` points to in production)
  - `NEXT_PUBLIC_SITE_URL=https://samaanbol.space`
- `npm install` (Next 16, React 19, `@clerk/nextjs@7.3.3`)
- `npm run build` must finish without TypeScript or lint errors. **This is the first hard gate.** If it doesn't build locally, it won't build on Netlify.
- `npm run dev` and walk through every new route signed-out + signed-in.

### 1.2 Functional walkthrough on `localhost:3000`

For each page, manual checks:

- **`/pricing`** — monthly ↔ annual toggle, prices match mobile (₹499/month, ₹3,999/year), Subscribe CTA navigates to `/account`.
- **`/account`** signed-out — shows Clerk `<SignIn />`, `<UserButton />` is absent.
- **`/account`** signed-in (use a real mobile-app Clerk user) — `GET /api/shops` returns the user's shops, `GET /api/subscriptions/entitlement?shopId=…` returns the shape the page expects (status, plan, currentPeriodEnd, cancelAtPeriodEnd, trialEnd). If field names drift from the server, fix the client-side types in `app/lib/subscriptions.ts`.
- **Cancel flow** — `POST /api/subscriptions/cancel` updates the dashboard to `canceled` with `cancelAtPeriodEnd=true` and shows the period-end date.
- **Resubscribe flow** — from a `none`/`canceled` state, picking a plan and clicking Subscribe calls `/api/subscriptions/checkout`, gets a `shortUrl`, and redirects to Razorpay test mode.
- **`/subscription/return?razorpay_subscription_id=test`** — page renders the polling/pending state without crashing on a fake ID.
- **`/refund-policy`, `/contact`** — content renders, footer/nav present.

### 1.3 Content gaps to close (App Review will check these)

The reviewer for iOS App Review will click every footer link. These must be production-ready:

- **`/contact`** — real support email, response SLA, **business address with GSTIN** (currently a stub). Apple has rejected apps over missing physical contact info.
- **`/refund-policy`** — 7-day refund window, post-7-day no refund, cancellation = access until period end, Razorpay refund timeline (5–7 business days).
- **`/privacy-policy`** — Razorpay third-party processor disclosure, DPDP rights (deletion / correction / portability), data fiduciary contact, fields shared with Razorpay.
- **`/terms-of-service`** — auto-renewal disclosure (RBI requirement), trial mechanics (7-day free, mandate created upfront, first charge on day 8), cancellation method (in-app on Android, on web on iOS), GST clauses.
- **Footer + nav (`SubscriptionChrome`)** — every page links to Pricing, Account, Refund, Contact, Terms, Privacy.

### 1.4 SEO hygiene

- `app/sitemap.ts`: include `/pricing` and `/refund-policy`. Exclude `/account` and `/subscription/*`.
- `app/robots.ts`: `Disallow: /account` and `Disallow: /subscription/`.
- `noindex,nofollow` meta on `/account` and `/subscription/return`.

### 1.5 Apple App Site Association (universal links — in scope for v1)

Create `public/.well-known/apple-app-site-association` (no extension):

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "<TEAMID>.<bundleId>",
        "paths": ["/subscription/*", "/account", "/account/*"]
      }
    ]
  }
}
```

Replace `<TEAMID>` with the Apple Team ID from App Store Connect → Membership; `<bundleId>` with the value from the mobile repo's `app.json` (`expo.ios.bundleIdentifier`, likely `com.samaan.bol`). Validate after deploy: `https://app-site-association.cdn-apple.com/a/v1/samaanbol.space`.

Force the right MIME type and bypass any redirects in `netlify.toml`:

```toml
[[headers]]
  for = "/.well-known/apple-app-site-association"
  [headers.values]
    Content-Type = "application/json"

[[redirects]]
  from = "/.well-known/apple-app-site-association"
  to = "/.well-known/apple-app-site-association"
  status = 200
  force = true
```

(Optional now or later: `assetlinks.json` for Android App Links. Lower priority since Android subscribes in-app via the Razorpay SDK and rarely needs to bounce through the website.)

### 1.6 Mobile-side counterpart for AASA (one line, single mobile-repo change)

In `dukaan_voice_mobile/app.json`, add to the `expo.ios` block:

```json
"associatedDomains": ["applinks:samaanbol.space"]
```

This requires a fresh **EAS production build** to propagate to the App Store binary — universal links from `samaanbol.space` will not actually open the iOS app until the next build is signed and shipped via TestFlight or App Store. Until then, the explicit `samaan-bol://` URL-scheme button on `/subscription/return` is the working fallback.

## Phase 2 — Configuration outside the repo (must precede deploy)

### 2.1 Netlify environment variables

In Netlify dashboard → Site → Site configuration → Environment variables, set on the **production** context:

| Key | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | Clerk dashboard → API Keys |
| `NEXT_PUBLIC_API_BASE_URL` | e.g. `https://samaan-bol-api.onrender.com` | Render dashboard for the mobile-app server |
| `NEXT_PUBLIC_SITE_URL` | `https://samaanbol.space` | Constant |

`NEXT_PUBLIC_*` is baked at build time in Next.js — after saving env, trigger Deploys → "Clear cache and deploy site" so the new build picks them up.

### 2.2 Clerk dashboard

In the same Clerk project the mobile app uses:

- **Domains** → add `samaanbol.space`, `www.samaanbol.space`. Optionally `localhost:3000` for dev.
- **Allowed redirect URLs / origins** → mirror.
- **Auth methods** → confirm parity with mobile (email + phone OTP, whatever the mobile app uses).
- The `<SignIn />` component uses Clerk's hosted hash routing, so no custom paths are required.

### 2.3 Mobile-server CORS sanity check

The Hono server has wildcard CORS today (`origin: "*"` in `server/src/index.ts`), so the website's API calls work without changes. Sanity-check from the browser console on `https://samaanbol.space` after deploy:

```js
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/health`).then(r => r.status)
// → 200
```

If CORS has been tightened since, fix it on the mobile-server side, not here.

## Phase 3 — Deploy

The legal repo lives under a separate GitHub identity. Pushes need `gh auth switch --user raktimux24`.

1. `gh auth status` — confirm active account is `raktimux24`. If not: `gh auth switch --user raktimux24`.
2. Stage in two commits for clean history:
   - **Commit A** — new pages and lib: `app/account/`, `app/pricing/`, `app/subscription/`, `app/refund-policy/`, `app/contact/`, `app/lib/`, `app/components/SubscriptionChrome.tsx`, `app/styles/subscription.css`. Message: `feat: add Razorpay subscription pages (pricing, account, return, refund-policy, contact)`.
   - **Commit B** — chrome / SEO / content updates: `app/layout.tsx`, `app/content/*`, `app/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/i18n.ts`, `app/styles/home.css`, `app/components/LanguageSelectEffects.tsx`, `package.json`, `package-lock.json`, `.gitignore`, `next-env.d.ts`. Message: `chore: wire ClerkProvider, update sitemap/robots/seo for subscription routes`.
   - **Commit C** (only after Phase 1.5) — `public/.well-known/apple-app-site-association` + `netlify.toml` headers/redirect addition. Message: `feat: add Apple App Site Association for universal links`.
3. `git push origin main` — Netlify auto-builds (assuming env vars from 2.1 are already saved).

## Phase 4 — Post-deploy verification (iOS-focused)

### 4.1 URL probes (all must return 200)

```
curl -sI https://samaanbol.space/                        # 200
curl -sI https://samaanbol.space/pricing                 # 200
curl -sI https://samaanbol.space/account                 # 200 (closes the iOS bug)
curl -sI https://samaanbol.space/subscription/return     # 200
curl -sI https://samaanbol.space/refund-policy           # 200
curl -sI https://samaanbol.space/contact                 # 200
curl -sI https://samaanbol.space/.well-known/apple-app-site-association   # 200, Content-Type: application/json
```

### 4.2 Real-iPhone E2E in Razorpay test mode

1. From the mobile app on iOS, tap any "Manage subscription" / "Manage on web" CTA → system browser opens `/account` (was 404, should now be a working page).
2. Sign in with the same Clerk user that the mobile app uses.
3. Pick a shop → pick monthly → Subscribe.
4. Razorpay hosted page → complete UPI Autopay test mandate.
5. Auto-redirect to `/subscription/return?razorpay_subscription_id=…`.
6. Polling resolves to `active` (after webhook from Razorpay → mobile-server → DB).
7. Tap "Open in app" → `samaan-bol://subscription/return` opens the iOS app on `subscription-return.tsx` and the entitlement re-fetches as premium.
8. Pull-to-refresh on a previously-locked premium screen → unlocks.

If any step stalls, the bug is on the mobile-server side (webhook signing, entitlement endpoint, rate limiter) — not in this repo.

### 4.3 AASA verification (after the next iOS production build is on the device)

- `https://app-site-association.cdn-apple.com/a/v1/samaanbol.space` must show the AASA contents Apple cached.
- On a real iPhone with the new build installed, tapping `https://samaanbol.space/subscription/return` (e.g. from Notes) should open the iOS app directly — no Safari interstitial.

## What's explicitly OUT of scope

- No new pages need to be built — the scaffolding is already there. The work is **finishing** it (content, content correctness, integration verification).
- No backend / mobile-server / Razorpay-dashboard changes — covered by `razorpay-subscriptions-plan-2026-05-09.md` in the mobile repo.
- No domain DNS work — covered by `domain-migration-plan-2026-05-09.md` (already complete).
- No App Store Connect / Play Console metadata — covered separately.
- Android App Links (`assetlinks.json`) — defer; Android already has the in-app SDK flow.

## Files and dashboards touched by this plan

In `dukaan-voice-legal`:

- `app/layout.tsx`
- `app/lib/subscriptions.ts`
- `app/account/AccountClient.tsx`
- `app/subscription/return/ReturnClient.tsx`
- `app/pricing/PricingClient.tsx`
- `app/contact/page.tsx` — fill business address / GSTIN
- `public/.well-known/apple-app-site-association` (new file)
- `netlify.toml` — AASA Content-Type header + force-200 redirect
- `.env.local` — already populated; mirror to Netlify env

In `dukaan_voice_mobile` (only one line):

- `app.json` → `expo.ios.associatedDomains` (requires next EAS production build)

External dashboards:

- Netlify → environment variables + trigger rebuild
- Clerk → allowed origins / redirect URLs

## Definition of done

- [ ] `npm run build` succeeds locally in `dukaan-voice-legal`.
- [ ] Local sign-in + entitlement fetch + checkout + cancel walkthrough succeeds with real Clerk + Render API.
- [ ] `/contact` has real business address; refund / privacy / terms verified.
- [ ] AASA file in `public/.well-known/`, `netlify.toml` configured.
- [ ] Mobile `app.json` has `applinks:samaanbol.space` and is queued for the next EAS production build.
- [ ] Netlify env vars saved on production context, fresh deploy triggered.
- [ ] Clerk dashboard has `samaanbol.space` in allowed origins.
- [ ] All Phase 4.1 URL probes return 200.
- [ ] Phase 4.2 iPhone E2E walkthrough completes.
- [ ] (Post next iOS build) Phase 4.3 AASA verification passes.
