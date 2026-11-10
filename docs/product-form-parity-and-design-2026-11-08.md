# Product add/edit parity and redesign — 8 November 2026

## Scope and evidence

Compared the native `dukaan_voice_mobile/app/(modals)/add-product.tsx` and `src/components/ui/product-image-editor.tsx` with the web `app/components/shop/screens/product-form.tsx` and shared photo editor. Checked inventory request support in the native repository's `server/src/routes/inventory.ts`. This is a source comparison plus local synthetic UI verification, not a replay against production shop records.

## Parity

| Capability | Result |
| --- | --- |
| Product identity, allowed categories/subcategories, unit, short code, pack metadata | Existing support retained; missing legacy subcategory now explicitly requires selection. |
| Buying price/discount, selling price, manual/calculated MRP and GST | Existing calculations and tax confirmation flow retained. Added translated MRP guidance and numeric validation. |
| Stock tracking, minimum stock, opening quantity, supplier and batch dates | Retained. Edit does not resend opening stock; batch changes stay on product details. |
| Batch depletion order | Added expiry-first / FIFO choice; loaded from existing products, persisted on create/update and restored in local drafts. Untracked items use the backend's expiry default. |
| Buying by pack | Added pack-price helper, converting pack price / pack size to per-unit buying price rounded to two decimals. |
| Barcode entry/generation/management | Retained. Added the existing web camera scanner to blank barcode fields. Scanner Enter does not submit the form. Existing assigned barcodes still use barcode management. |
| Product photos | Retained five-photo editor, cover/order/alt text, replacement/removal, upload recovery and uncertain-save protections. Added a separate camera capture picker alongside the library picker; cancellation releases selection state. |
| Access | Owner/Manager form access retained; Helper cannot add/edit. Cost visibility and GST permissions remain conditional. |

Web-specific add-another and embedded creation remain supported. Native and web initial defaults (unit, stock alert threshold and auto-MRP) were not standardized: they are existing platform defaults, not missing features. Native image preprocessing and browser file-format support remain platform-specific.

## Design

A single form path now runs through Details, Prices & GST, Stock and Photos, with explicit section links. Optional pack/short-code fields remain expandable. Desktop gets a compact read-only product overview; narrow screens stack it below the form. Save actions remain visible above mobile navigation. Inputs have larger touch areas, and entering the screen no longer automatically opens the mobile keyboard. Styling uses the existing dark surfaces, restrained borders and saffron accents of the redesigned shop screens.

New copy and added controls are localized in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam. Legacy English fallbacks for stock rotation and subcategory selection were replaced, and MRP guidance was filled in.

## Verification

- Full `npm run build:verified` passed after final implementation: release regression suites, translation coverage, TypeScript and Next production build.
- Translation coverage: 1,982 web labels across the nine translated languages, plus mobile catalogs/interpolation.
- Add and edit screens checked at 320 and 390 CSS pixels in all ten languages (40 cases); no page overflow or visible input/select/button outside the viewport.
- Visual checks at 1280px desktop, Malayalam large text at 320px, and Tamil photo actions at 390px.
- Synthetic create exercised FIFO plus pack size 20 / pack price 1,000, yielding a per-unit buying price of 50 in the saved payload.
- Synthetic edit persisted FIFO and changed identity without sending opening-stock fields. Helper denial and Manager access verified.
- Regression coverage includes create/update depletion order, untracked stock behavior, malformed numeric input rejection, camera/library picker attributes and cancellation, and the existing photo/session/uncertain-save recovery tests.

Screenshots and responsive measurements: `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/product-form-review/`.

## Limits and release state

No production products, stock, tax records or photos were changed. Physical camera capture and real barcode decoding were not replayed on devices; capture UI depends on browser support and permission. Photo behavior continues through the established upload pipeline, whose earlier physical-iPhone acceptance was not repeated. Prepared on `codex/product-form-parity-design` for release through the GitHub merge to main and automatic Netlify deployment. Deployment status is recorded by the pull request and Netlify deploy rather than this validation snapshot.
