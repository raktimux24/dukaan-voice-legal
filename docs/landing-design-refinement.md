# Landing page design refinement — 2026-11-07

The marketing page uses a shared dark, saffron and warm-paper treatment. The sale sequence, feature index, daily accounts and laptop section were refined first. The follow-up extends that treatment to the broader workflows, languages, comparison and final action.

## Design decisions

- **Beyond the bill:** three illustrated task groups replace nine dense panels. Native disclosure controls retain all nine explanations and their exact availability conditions. The section-level setup, role, connectivity and Premium note remains visible.
- **Illustration transparency:** the triptych now uses genuine alpha transparency, with the original dark backdrop removed and the CSS edge mask retired. Desktop visual verification confirms the page background flows around the artwork without rectangular image panels.
- **Languages:** nine supported mobile/web app languages and upcoming Punjabi/Odia app support are visibly separated. Punjabi/Odia website reading remains available now. Links switch the website language; the availability disclosure preserves the full explanation about app and browser settings.
- **Comparison:** four matching task/friction/outcome rows replace unrelated positive and negative lists. Premium is explicit for credit balances, and physical stock checks remain necessary. The layout offers a low-commitment link back to the sale walkthrough.
- **Final action:** three starting steps and one prominent browser action make the next step concrete. Pricing and current trial eligibility remain explicit. App Store and Google Play links remain available; on mobile they follow the primary action.

These are conversion hypotheses based on clearer choices, recognition and progressive disclosure. No conversion lift is claimed without audience testing.

## References

- [Shopify POS](https://www.shopify.com/pos): grouping capabilities around retail tasks.
- [Linear features](https://linear.app/features): concise product-led navigation and hierarchy.
- [Nielsen Norman Group: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): keep initial scanning simple while making detail easy to find.

## Validation

All eleven locale outputs are covered by the public-content checks, including disclosure contents, voice/reading language boundaries, paired comparison rows, pricing conditions and store links. Final browser checks use verified 320, 820 and 1135 pixel viewports, with an additional Hindi billing check at 390 pixels, plus keyboard disclosure activation and navigation. The original full release checks and the final production build pass. Translation coverage and rendering were checked; independent native-language proofreading and conversion experiments have not been performed.

## Hero, FAQ and motion follow-up

- The hero now pairs a transparent, original illustration of a fictional shopkeeper with one explicitly labelled sample sale. The editable HTML receipt shows 5 kg × ₹50 = ₹250 and states that the merchant confirms payment. It is an illustration, not an app screenshot or customer endorsement.
- The headline explains the review step; one primary browser action is followed by the sale walkthrough and clearly identified phone-app links. Premium, internet and Punjabi/Odia reading-only conditions remain visible. All new wording is present in eleven locales.
- The FAQ is a three-chapter reference section with a ledger illustration, explicit “Jump to a topic” links, ruled disclosures and optional pricing link. All seven original question/answer pairs remain unchanged and match FAQ schema. Multiple answers can stay open.
- The feature waveform uses staggered CSS transforms, a translated pause/play button, reduced-motion support and an intersection observer. It pauses offscreen and when the document is hidden. It does not access the microphone.

Reference: [NN/g’s accordion guidance](https://www.nngroup.com/articles/accordions-on-desktop/) informed descriptive question labels, independent disclosures and keyboard access. Shopify POS and Linear remain the presentation references above.

Validation: production build and TypeScript passed; public-content checks passed in all eleven languages. Final viewport coverage is recorded below. Keyboard FAQ expansion, topic jumps, waveform pause/play, actual changing waveform transforms and offscreen pause were checked. Reduced-motion CSS and media-change handling were reviewed in source; an OS reduced-motion preference was not changed for testing.

## Browser preview follow-up

The laptop section now uses one full-width, interactive sample workspace with three views: Home, Billing and Stock. The concise supporting feature descriptions sit below it. The preview is HTML/CSS rather than a screenshot, so labels remain readable and localized in all eleven website languages. It is identified as example shop data and makes no product API requests.

The design follows capabilities in `app/components/shop/screens/home.tsx` (sales totals, payment split, recent bills, low stock) and `sell.tsx` (catalog, available stock, quantity and bill review). The screen is representative rather than a claim of pixel-perfect live UI or feature parity. No web voice capability was introduced or claimed. The original feature conditions are retained.

Sample figures are consistent: ₹5,100 cash + ₹3,320 UPI + ₹640 Premium udhaar = ₹9,060. The bill example contains 5 kg rice at ₹50 and 1 L oil at ₹120, totalling ₹370. A separate stock example illustrates 24 kg minus a completed 5 kg sale = 19 kg; physical counting remains explicit. Recent bills are a subset of the illustrative day.

Tabs support mouse, touch, Left/Right, Up/Down, Home and End, with standard tab/tabpanel relationships and one active focus target. The final verified viewport checks below supersede the initial layout checks. Public-content tests cover translated tab labels, panel targets, sample context, bill totals and retained conditions. The production build and TypeScript checks pass. Browser screenshots cover Hindi at the reported desktop width and on mobile. Independent language proofreading and conversion testing remain unperformed.


## Six-comment refinement

- The hero receipt is a compact slip in normal flow with a slight overlap at the counter’s lower-right edge (24 px on desktop, 14 px on small phones). It no longer masks the shopkeeper, rice or weighing scale; the amount and payment-confirmation condition remain readable.
- Reproduced the missing animation on the user's original tab: the raw HTML had changed while `HomeEffects` retained its old listeners and observed nodes. Both homepage routes now key client effects to a server-side content digest so HTML replacements reattach the controls. Verified changing waveform transforms, pause/play and offscreen pause on the original tab.
- Updated all eleven locales to “Mobile + web app” and “Coming soon”. The latter explicitly refers to app support, while retaining existing Punjabi/Odia website links and the detailed current voice-language limits.
- The browser preview follows the actual `chrome.tsx` rail and `screens/home.tsx` dashboard: sales and payment split, bill count and average, daily brief, four stock-attention counts, recent bills and low-stock items. “New sale” and “Review stock” open sample views only. All values are fictional and the average reconciles to ₹9,060 / 24 = ₹377.50. The live session was signed out; the implementation source, rather than live account data, was the design reference.
- The FAQ reuses the transparent ledger artwork, with explicit, underlined topic jumps and downward arrows. It retains all seven answers and schema content.

Final browser validation: 99 combinations (11 locales × 320/820/1135 px × Home/Billing/Stock) were checked in same-origin iframe fixtures, confirming the actual document viewport width for each. No page overflow, updated-text overflow, tab selection mismatch or receipt/image overlap was found. The primary buttons’ existing clipped shine pseudo-element inflates `scrollWidth`, so those decorative measurements were excluded from the text-overflow findings. A separate 390 px Hindi billing view also passed. The temporary verification page was removed. Dashboard shortcuts, vertical keyboard tabs, Home/End and FAQ topic jumps were checked. Reduced-motion handling remains respected; OS preferences were not changed.

Evidence is saved under `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/`, including `landing-refinement-layout-checks-v4.json`, hero/dashboard/language screenshots and the Hindi mobile view. These are local refinements; no production deployment was performed in this pass.

Receipt placement follow-up: raised the slip to overlap only the lower edge of the counter, as requested. Earlier no-overlap measurements above describe the preceding layout.


## Compact homepage pricing

Added one pricing summary after the demo/comparison and immediately before the final setup CTA. A ruled, two-plan layout uses the existing dark and saffron treatment, stacking into compact rows on phones. Free shows ₹0 with manual billing, products/stock and cash/UPI QR bills. Premium shows ₹499/month or the full ₹3,999/year price per shop, with Free features plus phone voice billing and udhaar/customer balances. Internet and current trial-eligibility conditions remain visible. The summary links to each locale’s full pricing page.

Amounts reuse `planCopy` from `app/lib/subscriptions.ts`, the existing pricing-page source. The pricing page and its strings were not edited. All summary copy is supplied in eleven website languages, preserving the existing app-language availability disclosures elsewhere on the page.

Validation: public-content checks cover price-source parity, visible conditions, localized periods/links and position before the CTA. Browser checks passed for all eleven languages at actual 320/760/1135 px viewport widths (33 combinations), without page or summary-text overflow. Hindi phone layout was visually inspected at 390 px. The temporary viewport fixture was removed. Evidence: `home-pricing-layout-checks.json` and `home-pricing-summary-en.png` in the evidence directory above. Independent native-language proofreading and conversion testing have not been performed.


### GST and trial marketing details

The homepage summary now explicitly includes GST-enabled billing in Free (and therefore in Premium’s “Everything in Free”). The visible note retains dependence on registration, tax setup and enabled capabilities. It does not promise return filing or every special GST billing context. Checked `server/src/routes/sales.ts`, `routes/pos-settings.ts` and `lib/gst-core-capabilities.ts` in the mobile/backend repository: ordinary GST setup/billing is not Premium-gated; billing capabilities and setup still apply.

A visible saffron callout states “7-day free Premium trial”, qualified for eligible new shops, one trial per owner, with no card needed. `server/src/lib/entitlement.ts` grants an automatic trial only when the owner has not used one; its default duration is seven days and is configurable through `TRIAL_DAYS` / legacy `RAZORPAY_TRIAL_DAYS`. The requested seven-day offer matches the existing pricing-page copy and code default; live deployment overrides were not independently read in this pass.

All eleven locale versions include both additions. The public-content checks passed, and 33 real viewport combinations (11 locales × 320/760/1135 px) passed without pricing-text or page overflow. The pricing page remains unchanged. Evidence: `home-pricing-gst-trial-layout-checks.json` and `home-pricing-gst-trial.png` in the evidence directory above.


## Pricing page — 2026-11-07

Rebuilt the English pricing page and all ten translated routes to share the homepage’s dark, saffron, warm-paper and fine-rule design. A decorative crop of the existing transparent kirana illustration introduces the page; an inline receipt drawing accompanies the GST explanation. The decorative hero artwork is omitted on narrow screens to keep the offer and prices close to the top.

The main offer now leads with the eligible 7-day Premium trial (one per owner, no card). The Free/Premium comparison explicitly includes GST-enabled billing in Free, shows both recurring prices, and makes the full annual charge clear. All amounts still come from `planCopy`. The existing localized monthly/annual checkout URLs, account management, app deep link and refund-policy links are preserved. GST setup/capability conditions and the distinction from return filing remain visible. Subscription invoices are addressed separately in the subscription FAQ.

New page-specific copy covers all eleven locales. The page reuses the homepage’s plan labels, core features and trial eligibility to keep the two offers consistent. FAQ content and JSON-LD use the same function, and metadata now reflects Free, Premium, GST and the trial. CSS is scoped to `.pricing-page`; account/checkout styling is unchanged.

Verification: production build and public SEO/content checks pass. Browser checks passed for all eleven languages at actual iframe widths of 320, 760 and 1135 pixels (33 combinations), with no page or text overflow. Each combination was switched to annual and back using keyboard activation: the displayed prices and localized account URL retained the correct billing interval. Native FAQ disclosure and visible-answer/schema parity were checked in English; schema parity was also checked in Hindi. No subscription, account or payment was created. Temporary responsive fixtures were removed. Evidence: `pricing-page-layout-checks.json` and pricing-page screenshots in the current visualization directory.

Claims remain code-backed, not a fresh live entitlement audit. The backend’s default trial duration is seven days and can be configured; GST availability depends on registration, setup, role and enabled capabilities. Free report/activity history is capped at seven days in the current source. The authenticated shop was not accessed during this redesign.


## Retire the laptop marketing page — 2026-11-07

The `/billing-on-a-laptop` article and its ten translated routes have been retired. Config-level 308 redirects send each URL directly to its corresponding homepage `#web` demo and preserve query parameters. The retired routes are removed from the sitemap and no longer publish separate canonical/FAQ metadata. The unused article component and copy files were removed.

Header/footer navigation now says “Web app” (translated in all eleven languages) and links straight to the demo. The udhaar article and voice-billing guide also link directly there. The former article link beside the demo now leads to the FAQ’s Voice & devices group.

The homepage FAQ now has eight questions. A new localized answer explains signing in, selecting/creating a shop, searching/scanning, checking quantities/prices, identifying a credit customer, confirming received payments, completing the sale, and sharing/printing. The existing phone/browser answer now explicitly states same-account, same-shop and connected-sync requirements. Premium udhaar and phone voice/internet conditions remain intact; the homepage demo introduction stays concise. Visible answers and structured data continue to share the same content function.

The mobile navigation now closes on every navigation link, including same-document Web app links, and exposes its expanded state. Browser checks confirmed this at 390px for English and Hindi, alongside keyboard access to the migrated FAQ. English and Hindi desktop navigation/redirect behavior was also reviewed.

Validation: public SEO/content checks across eleven locales, production build, and rendered HTTP smoke tests. The HTTP checks cover all eleven retired paths both with and without campaign query parameters (22 direct permanent-redirect checks), localized canonical/hreflang, pricing and FAQ parity, and sitemap exclusion. No deployment was performed during this local revision.
