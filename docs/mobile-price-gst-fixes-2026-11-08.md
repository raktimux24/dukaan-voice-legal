# Mobile product price and GST document fixes

## Changes

- Product summary metrics use the full mobile width below the photo/status; monetary amounts stay on one line. Wider layouts allow metric columns to wrap before values become cramped.
- Verified GST documents use labelled item summaries at widths up to 640px. Quantity, classification, rate, pre-GST value, discount, taxable value, tax components and total all remain available.
- Desktop and printed/downloaded documents retain the complete table. The alternate mobile list is excluded from printing; fiscal calculation, verification and immutable document data are unchanged.
- Both views reuse the existing translated labels, including all ten app language choices. No new English-only interface copy was introduced.

## Validation

- Browser preview rendered the actual product-detail and fiscal-document components with synthetic data.
- English, Hindi, Tamil, Malayalam, Telugu, Bengali, Marathi, Kannada, Gujarati and Hinglish were checked at 320 × 844 and 390 × 844: 40 unique screen/language/width combinations.
- Product price ₹1,24,900.00 remained a single line and fit its container in every combination. No page-level horizontal overflow was observed.
- The GST preview contained two items, a long mixed-script product name, discount, CGST/SGST and IGST. Mobile summaries were displayed and the wide table hidden at both mobile widths.
- Tablet/desktop product checks at 768, 1024 and 1280px passed; the GST table was visible and mobile list hidden at 1280px.
- English product and Tamil GST screenshots were visually reviewed at 320px. Browser console error/warning query returned no entries.
- Regression tests check field/tax preservation and ensure print/download HTML hides the alternate view while retaining the full table.
- `npm run build:verified` passed (release checks, translation coverage, type check and production build). A final production build was run after the tablet metric-width adjustment.

These are responsive Chromium checks, not physical iOS/Android device acceptance. No live sale, payment, stock adjustment or subscription action was performed.
