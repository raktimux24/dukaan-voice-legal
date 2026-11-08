# Product form localization fix — 8 November 2026

The live mobile review found incorrect unit labels, English GST pricing guidance and mixed-script Hinglish in product add/edit forms. This patch corrects the shared labels for all eight supported units in all ten app languages and adds explicit symbols for weight/volume to prevent ambiguity. Stored codes and conversion math are unchanged.

Product-form summaries, pack hints, per-unit prices, opening quantities and margin text now use the same localized unit labels as the selector. Quantity conversion still translates the resulting unit (for example, 0.25 kg becomes 250 grams). Existing quantity-format callers retain their original behavior.

GST pricing guidance now covers inclusive, exclusive, unknown-registration and no-separate-collection states. Product-form Hinglish labels, help, actions and validation use Roman script. Current bundled copy takes priority over stale server dictionaries. A localized Field option prevents a second text-alias translation from turning correct labels back into old Hindi copy. Four mixed-script Bengali product strings were also corrected when adding authoritative catalog coverage.

## Verification

- `npm run build:verified`: full release regressions, translation checks, TypeScript and Next production build passed.
- Translation checks cover 2,050 web labels plus all mobile catalogs and interpolation. Added assertions for stale server overrides, all unit symbols, converted quantity labels and Roman-script product-form Hinglish.
- Added a rendered Field regression test proving already-localized labels/hints bypass stale aliases while legacy callers keep automatic translation.
- Both forms at 320px and 390px in all ten languages: 40 cases, no horizontal overflow or out-of-bounds controls. No English-exclusive GST fallback in translated forms; no Devanagari text in either Hinglish form.
- Malayalam inclusive-GST edit view at 320px with Extra Large text fits without overflow.
- Synthetic Hinglish save-and-add-another: pack size 20, pack price 1,000 produces purchase price 50; payload and reset form both retain unit code `g` while displaying “Gram (g)”. No live product writes.

Local screenshots and measurements are in `/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/product-localization-fix/`. Production deployment status belongs to the associated GitHub PR and Netlify deploy. Physical camera behavior and native mobile releases are outside this localization patch.
