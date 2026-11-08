# Live product add/edit mobile review — 8 November 2026

## Result

Responsive layout passes at the tested sizes. Localization is **not fully ready**: incorrect unit labels are the most significant remaining issue, followed by untranslated GST guidance and inconsistent unit/Hinglish copy. No application code was changed during this review.

## Environment and boundaries

- Production: https://samaanbol.space, after PR180 / merge `03ddbeaa66c00986a64705e8c7a8f82d904f3fcb` was published by Netlify.
- Existing authenticated Owner session, shop Mina Sales.
- Actual add form and actual edit form for the existing QA USB-C Cable 1 m product. No product save, tax confirmation, stock mutation, photo upload or transaction was submitted.
- Browser viewport review, not a physical iPhone/Android or on-screen-keyboard test.
- Temporarily changed the account's app-language preference through Settings; restored English and the original Small text size. Voice language remained English.

## Passed

- Add and edit at 320 × 844 and 390 × 844 CSS pixels in English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati and Malayalam: **40 cases**, no horizontal page overflow or out-of-bounds visible inputs, selects, buttons, headings or summaries.
- Optional pack fields opened; add-form tax controls expanded. Existing edit tax details loaded.
- Malayalam edit pricing at 320px with Extra Large account text size: no horizontal overflow; section anchor lands below the header; save action remains above mobile navigation.
- Empty product name disables saving. An unsaved name change enables Update; restoring the original name disables it again.
- Pack size 20 and pack price 1,000 produce buying price 50.
- Unsaved selling price 80 with 18% exclusive GST shows tax 14.40 and customer price/calculated MRP 94.40.
- Existing edit data shows net 500, GST 90 and customer price 590 in every language.
- FIFO selection works; disabling stock tracking hides batch/depletion controls.
- Existing barcode is read-only with a separate Manage barcode link. Photo library/camera controls render and fit; actual capture, decoding and upload were not exercised.
- Reopened edit fields match the pre-review baseline exactly. Blank add form is restored. No browser console errors/warnings captured.

## Findings

### 1. High priority: incorrect unit labels

The saved unit codes remain unchanged, but some translated choices describe a different unit or are invalid words. This can cause a merchant to choose the wrong unit.

| Language | Code / field | Observed label | Issue |
| --- | --- | --- | --- |
| Marathi | g | ॲंगस्ट्रॉम | Ångström, not grams. |
| Bengali | ml | মিলিগ্রাম | Milligrams, not millilitres. |
| Kannada | ml | ಮಿಲಿಗ್ರಾಂ | Milligrams, not millilitres. |
| Kannada | liter | ಲೋಟ | Cup/vessel rather than litre. |
| Tamil | g | ஊ | Not a valid gram label. |
| Telugu | g / ml | ఘ / మిలియను | Incorrect unit words. |
| Tamil, Telugu, Marathi | Unit field heading | பிரிவு / విభాగం / विभाग | Category/section wording instead of a measurement unit. |

These are legacy catalog translations surfaced by the live form. Correct the shared unit labels and check all supported unit options, while preserving the stored unit codes.

### 2. Medium priority: English GST explanation in every translated form

Both add and edit show:

> Selling price excludes GST. The selected GST rate is added to calculate the customer price.

This occurs in all nine non-English language settings. The selected live shop uses exclusive GST. Inclusive/unregistered variants were not activated against production shop settings in this review; their translation coverage should be checked with the fix.

### 3. Lower priority: inconsistent localized unit and Hinglish copy

Pack hints, price summary, opening quantity and margin interpolate raw codes such as `piece` instead of the displayed localized unit. Hinglish mixes Roman-script controls with older Devanagari field titles/help. Resolve these using explicit unit display labels and a consistent Hinglish catalog.

## Interaction caveats

One automated checkbox action failed its immediate checked-state assertion; the control worked on the subsequent direct label click. One browser navigation command timed out, but the destination loaded correctly and review continued. Neither produced a reproducible application failure or console error.

## Evidence

`/Users/lifecycle/.codex/visualizations/2026/11/07/01a1b572-52ff-76f2-bedb-3b485a760b4c/live-product-forms-2026-11-08/`

- `responsive-checks.json`: 40 viewport observations.
- `rendered-form-copy.json`: text from both forms in all ten languages.
- `summary.json`: unchanged-field comparison, restored preferences and calculation checks.
- `ml-extra-large-pricing.jpg`: 320px large-text layout and visible English GST fallback.
- `en-add-mobile.jpg`, `en-edit-photos-mobile.jpg`: live mobile screenshots.

End-to-end successful save/recovery and physical camera behavior are not newly certified by this read-only/unsaved production review; the prior local synthetic regression and previously recorded device evidence remain separate.
