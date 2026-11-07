# Shop workflow illustrations

`shop-workflows-transparent.webp` is the current website asset, an original illustration generated for Samaan Bol on 2026-11-07. It is a 2172 × 724 triptych: setup records, daily counter work, and catalog/stock planning. The single shared WebP is approximately 328 KiB; CSS selects each third without downloading three separate images. It has genuine alpha transparency so the page background shows through around the illustrations. No CSS edge mask is needed.

`shop-workflows.webp` is the original, unused version with a dark background, retained as the source reference.

The artwork is decorative, with no embedded marketing copy. It is not a screenshot of the app. Keep the three scenes together and preserve their ivory, saffron and near-black palette when adapting the layout.

## Transparent edit

Created with the built-in image-generation tool in edit mode, with `transparent_background: true`. The generated PNG was converted to WebP at quality 90 and alpha quality 100, preserving its dimensions and transparency. Verified the alpha channel and the rendered page at its normal desktop viewport.

Final edit prompt:

> Use case: background-extraction. Edit target: the attached wide triptych illustration for the Samaan Bol website. Remove ONLY the near-black background completely to genuine alpha transparency, including all empty space between objects, outside each silhouette and between the three scenes. Preserve the exact three illustrations, all ivory engraved linework, saffron orange accents, shading within the objects, proportions, composition, relative positions, 3:1 panoramic aspect ratio, and generous margins. Left: ledger and spreadsheet papers, calculator, pencil; centre: kirana stall with striped awning, rice bags, scale, counter and open cash drawer; right: smartphone catalog, cartons and checklist with dotted connecting lines. Every scene remains centered in its existing equal-width third. Do not add background gradients, dark backdrop, floor, glow, cast shadow, white halo, checkerboard, text or new objects. Keep fine edges and dotted connectors intact, no cropping. Output actual transparent alpha background. This must sit seamlessly on a dark webpage with no rectangular image boundaries.

## Hero illustration

`kirana-hero.webp` (1536 × 1024, approximately 292 KiB) is an original, decorative illustration of a fictional merchant, generated with the built-in image tool using the triptych as a style reference. It has alpha transparency and is not a photograph, product screenshot or testimonial. The receipt and all product claims are separate, localized HTML. WebP conversion preserves alpha at quality 100, with color quality 88.

Generation prompt:

> Use case: illustration-story. Create a NEW single illustration for the Samaan Bol kirana billing landing-page hero. The attached triptych is STYLE REFERENCE only: match its meticulous ivory engraved linework, warm paper shading, restrained saffron orange accents and transparent background. New scene: a friendly Indian woman shopkeeper in her late thirties, hair tied back, wearing a simple saffron kurta, stands behind a compact wooden kirana counter. She holds a smartphone naturally in one hand at chest height, looking at its screen with calm focus; the phone screen faces her and is not readable. Other hand rests naturally on the counter beside a small paper bag of rice. Two glass jars and a neatly stacked pack of groceries frame the left side; a small old-fashioned weighing scale on the right. Waist-up, three-quarter view, refined editorial engraving, humane expressive face, realistic anatomically correct hands. Single coherent composed scene, not a collage or triptych. Objects are tactile and carefully drawn. Wide 3:2 composition, generous transparent margins, full silhouette without cropping, no floor or background wall, no scenery behind her, no text, no writing, no logos, no numbers, no UI mockup, no speech bubble, no border, no checkerboard or glow. Actual alpha transparency throughout empty space. Main figure slightly left of centre, lower right portion kept quiet to allow a separate HTML sample receipt overlay. This is an illustrative merchant, not a testimonial or photograph. Output polished consistent ivory-and-saffron ink engraving, legible on a near-black website.

Final edit prompt, with `transparent_background: true`:

> Use case: background-extraction. Edit this exact illustration. Preserve the woman shopkeeper, phone, groceries, counter and scale exactly, all ivory engraved details and orange accents, and the 3:2 framing. REMOVE ALL the tan/brown glow and vignette behind the woman and all objects. Background must be entirely empty true alpha transparency right up to the object silhouettes, no atmospheric light, no shadow, no residual glow, no visible rectangular or softly blurred backdrop. Preserve opaque materials inside the objects and the fine hair strands. Do not change composition or add anything. The illustration will sit directly on a near-black website and must blend naturally with no brown cloud.

## Pricing-page reuse

The pricing page uses the centre kirana-shop panel of `shop-workflows-transparent.webp` as decorative artwork. The GST receipt is an original inline SVG with no data or tax amounts; it is decorative, not a product screenshot. No new raster artwork was generated for the pricing page.
