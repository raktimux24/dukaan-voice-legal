import type { Locale } from '../i18n';
import copy from './landingSectionCopy.json';
import offerCorrections from './offerCorrections.json';
import openingCopy from './landingOpeningCopy.json';
import { browserPreviewHtml } from './browserPreview';

const svg = (paths: string, className = '') => `<svg class="${className}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const cash = svg('<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9v6m14-6v6"/>');
const qr = svg('<path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h2v2h-2zm6 0v6h-6v-2m4-6h2"/>');
const ledger = svg('<path d="M8 3h12v18H8a4 4 0 0 1 0-8h12M8 3a4 4 0 0 0-4 4v10m8-10h4m-4 3h4"/>');
const receipt = svg('<path d="M5 3l2 1 2-1 3 1 3-1 2 1 2-1v18l-2-1-2 1-3-1-3 1-2-1-2 1V3zm4 5h6m-6 4h6m-6 4h3"/>');
const stock = svg('<path d="m12 3 9 5-9 5-9-5 9-5zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>');
const wave = `<div class="sale-wave" aria-hidden="true">${[8, 15, 24, 12, 32, 43, 25, 17, 36, 50, 31, 16, 27, 41, 22, 12, 29, 17, 9].map((height, index) => `<i style="--bar-height:${height}px;--wave-delay:-${(index * .17).toFixed(2)}s;--wave-duration:${(1.1 + index % 4 * .19).toFixed(2)}s"></i>`).join('')}</div>`;

/** Apply presentation after the existing locale and feature-availability adapters. */
export function refineHomeSections(html: string, locale: Locale) {
  const text = copy[locale];
  const motion = openingCopy[locale];
  const animatedWave = `<div class="voice-motion" data-voice-motion>${wave}<button type="button" class="voice-motion-toggle" data-motion-toggle data-pause-label="${motion.pause}" data-play-label="${motion.play}" aria-label="${motion.pause}" title="${motion.pause}" hidden><svg class="motion-pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10m6-10v10"/></svg><svg class="motion-play" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5 8 5-8 5Z"/></svg></button></div>`;
  let step = 0;
  let example = 0;
  let feature = 0;
  let laptop = 0;
  let account = 0;
  const featureCopy = new Map([0, 2, 3, 4, 5].map((index, i) => [index, text.features[i]]));
  featureCopy.set(1, text.language);

  return html
    .replace(/(<div class="step [^"]*">[\s\S]*?<h3>)([\s\S]*?)(<\/h3>\s*<p>)[\s\S]*?(<\/p>)/g,
      (_match, before, title, middle, after) => `${before}${title}${middle}${text.steps[step++]}${after}`)
    .replace(/<div class="step-example">/g, () => {
      // The illustrations repeat the adjacent text and are decorative, not controls.
      const index = example++;
      return index === 0 ? `<div class="step-example step-example--voice">${wave}`
        : index === 1 ? '<div class="step-example step-example--payment">'
          : `<div class="step-example step-example--receipt"><div class="sale-receipt" aria-hidden="true">${receipt}</div>`;
    })
    .replace(/(<div class="step-example step-example--payment">)([\s\S]*?)(<\/div>\s*<\/div>)/, (_match, before, content, after) => {
      let method = 0;
      return before + content.replace(/<span style="[^"]*">/g, () => `<span class="payment-method">${[cash, qr, ledger][method++]}`) + after;
    })
    .replace(/(<div class="feature(?: [^"]*)?">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/g, (match, before, original, after) => {
      const index = feature++;
      const body = featureCopy.get(index);
      const prefix = index === 4 ? before.replace(/(<div class="feature-icon">)[\s\S]*?(<\/div>)/, `$1${ledger}$2`) : before;
      if (body) return `${prefix}${body}${after}`;
      // Keep the translated laptop link while shortening its surrounding prose.
      const link = original.match(/<a [\s\S]*?<\/a>/)?.[0];
      return index === 6 && link ? `${prefix}${text.web[0]} ${link}.${after}` : match;
    })
    .replace(/(<div class="feature feature--hero[^>]*>[\s\S]*?<\/p>)/, `$1${animatedWave}`)
    .replace(/(<div class="ai-block-icon">)[\s\S]*?(<\/div>)/g, (_match, before, after) => `${before}${[cash, ledger, receipt, stock][account++]}${after}`)
    .replace(/(<article class="web-card [^"]*">[\s\S]*?<p>)[\s\S]*?(<\/p>)/g,
      (_match, before, after) => `${before}${text.web[laptop++]}${after}`)
    .replace(/<div class="desk-frame reveal">[\s\S]*?(?=\s*<div class="web-grid">)/,
      `<p class="web-demo-note" id="web-preview-caption">${offerCorrections[locale].exampleLabel}</p>${browserPreviewHtml(locale)}`);
}
