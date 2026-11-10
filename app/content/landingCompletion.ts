import { localizedPath, locales, type Locale } from '../i18n';
import { getLocaleHomeSlots } from './localeHomeSlots';
import { productAnswers } from './productAnswers';
import offerCorrections from './offerCorrections.json';
import workflows from './shopWorkflowsLocales.json';
import copy from './landingCompletionCopy.json';
import { homePricingHtml } from './homePricing';

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function completeLandingSections(html: string, locale: Locale) {
  const t = copy[locale];
  const seeHow = getLocaleHomeSlots(locale)?.ctaSeeHow ?? 'See how a sale works';
  const stockNote = locale === 'en'
    ? 'A completed sale updates tracked stock, giving you a record to check against a physical count.'
    : offerCorrections[locale].stockCount;
  const languageLink = (item: typeof locales[number]) => `<a class="language-specimen" href="${localizedPath(item.code, 'home')}#languages" lang="${item.hreflang}"${item.code === locale ? ' aria-current="page"' : ''}><span>${item.nativeLabel}</span><span class="language-link-arrow" aria-hidden="true">${item.code === locale ? '✓' : '↗'}</span></a>`;

  return html
    .replace(/<section class="languages-section"[\s\S]*?<\/section>/, original => {
      const label = original.match(/<div class="section-label">([\s\S]*?)<\/div>/)?.[1] ?? '';
      const heading = original.match(/<h2 class="section-heading">([\s\S]*?)<\/h2>/)?.[1] ?? '';
      return `<section class="languages-section" id="languages" aria-labelledby="language-directory-title"><div class="container language-composition">
        <div class="language-intro"><div class="section-label">${label}</div><h2 class="section-heading" id="language-directory-title">${heading}</h2><p class="section-sub">${escapeHtml(t.languageIntro)}</p>
          <details class="language-availability"><summary>${escapeHtml(t.languageDetails)}</summary><p>${escapeHtml(productAnswers(locale)[3].a)}</p></details>
        </div>
        <div class="language-directory"><div class="language-directory-heading"><span aria-hidden="true">09</span><h3>${escapeHtml(t.voiceLanguages)}</h3></div><div class="language-specimens" data-language-support="voice">${locales.filter(item => item.code !== 'pa' && item.code !== 'or').map(languageLink).join('')}</div>
          <div class="language-reading"><div class="language-directory-heading"><span aria-hidden="true">02</span><h3>${escapeHtml(t.readingLanguages)}</h3></div><p class="language-coming-note">${escapeHtml(t.comingSoonNote)}</p><div class="language-specimens" data-language-support="reading">${locales.filter(item => item.code === 'pa' || item.code === 'or').map(languageLink).join('')}</div></div>
        </div>
      </div></section>`;
    })
    .replace(/<section class="comparison">[\s\S]*?<\/section>/, original => {
      const label = original.match(/<div class="section-label">([\s\S]*?)<\/div>/)?.[1] ?? '';
      return `<section class="comparison" id="comparison" aria-labelledby="comparison-title"><div class="container">
        <div class="comparison-intro"><div class="section-label">${label}</div><h2 class="section-heading" id="comparison-title">${escapeHtml(t.comparisonHeading)}</h2></div>
        <table class="comparison-sheet" aria-labelledby="comparison-title"><thead><tr>${t.columns.map(column => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>
        ${t.rows.map(([task, before, after]) => `<tr><th scope="row">${escapeHtml(task)}</th><td class="comparison-before"><span class="comparison-mobile-label" aria-hidden="true">${escapeHtml(t.columns[1])}</span>${escapeHtml(before)}</td><td class="comparison-after"><span class="comparison-mobile-label" aria-hidden="true">${escapeHtml(t.columns[2])}</span><span class="comparison-outcome">${escapeHtml(after)}</span></td></tr>`).join('')}
        </tbody></table>
        <div class="comparison-footer"><p>${escapeHtml(stockNote)}</p><a class="story-text-link" href="#how">${escapeHtml(seeHow)} <span aria-hidden="true">↗</span></a></div>
      </div></section>`;
    })
    .replace(/<section class="cta-section" id="download">[\s\S]*?<\/section>/, original => {
      const label = original.match(/<div class="section-label">([\s\S]*?)<\/div>/)?.[1] ?? '';
      const storeLinks = [...original.matchAll(/<a [^>]*class="store-badge"[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]).join('');
      return `${homePricingHtml(locale)}<section class="cta-section" id="download" aria-labelledby="launch-title"><div class="container"><div class="launch-composition">
        <div class="launch-copy"><div class="section-label">${label}</div><h2 class="section-heading" id="launch-title">${escapeHtml(offerCorrections[locale].sampleSetup)}</h2><p class="section-sub">${escapeHtml(offerCorrections[locale].closing)}</p><a class="story-text-link" href="${localizedPath(locale, 'pricing')}">${escapeHtml(workflows[locale].pricing)} <span aria-hidden="true">↗</span></a></div>
        <div class="launch-plan"><h3>${escapeHtml(t.groups[0])}</h3><ol>${t.startSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol><a href="/shop" class="launch-primary">${escapeHtml(workflows[locale].open)} <span aria-hidden="true">→</span></a></div><div class="launch-store-options">${storeLinks}</div>
      </div></div></section>`;
    });
}
