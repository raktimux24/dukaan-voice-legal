import { localizedPath, type Locale } from '../i18n';
import translations from './shopWorkflowsLocales.json';
import sectionCopy from './landingCompletionCopy.json';

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// Group by the merchant's task, preserving every capability and availability note.
const chapters = [[0, 1, 8], [2, 3, 4], [5, 6, 7]];

export function getShopWorkflowsHtml(locale: Locale) {
  const copy = translations[locale];
  const labels = sectionCopy[locale];
  const groups = chapters.map((indices, group) => `<div class="workflow-chapter" role="group" aria-labelledby="workflow-chapter-${group}">
    <div class="workflow-art workflow-art--${group}" aria-hidden="true"></div>
    <div class="workflow-chapter-heading"><span aria-hidden="true">0${group + 1}</span><h3 id="workflow-chapter-${group}">${escapeHtml(labels.groups[group])}</h3></div>
    ${indices.map(index => {
      const [title, body, note] = copy.cards[index];
      return `<article class="shop-workflow"><details class="workflow-detail">
        <summary><h4>${escapeHtml(title)}</h4><span class="workflow-detail-label">${escapeHtml(labels.details)}</span><span class="workflow-toggle" aria-hidden="true"></span></summary>
        <div class="workflow-detail-body"><p>${escapeHtml(body)}</p><p class="shop-workflow-note">${escapeHtml(note)}</p></div>
      </details></article>`;
    }).join('')}
  </div>`).join('');

  return `<section class="shop-workflows" id="shop-workflows" aria-labelledby="shop-workflows-title"><div class="container">
    <div class="workflow-intro"><div><div class="section-label">${escapeHtml(copy.label)}</div><h2 class="section-heading" id="shop-workflows-title">${escapeHtml(copy.title)}</h2></div><p class="section-sub">${escapeHtml(copy.intro)}</p></div>
    <div class="shop-workflows-grid">${groups}</div>
    <div class="workflow-footer"><p class="shop-workflows-footnote">${escapeHtml(copy.foot)}</p><div class="shop-workflows-actions"><a href="/shop" class="btn-primary">${escapeHtml(copy.open)}</a><a href="${localizedPath(locale, 'pricing')}" class="btn-secondary">${escapeHtml(copy.pricing)}</a></div></div>
  </div></section>`;
}

export const shopWorkflowsHtml = getShopWorkflowsHtml('en');
