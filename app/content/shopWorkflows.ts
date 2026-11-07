import type { Locale } from '../i18n';
import { localizedPath } from '../i18n';
import translations from './shopWorkflowsLocales.json';

/** The source copy and condition-preserving translations of the acquisition section. */
export const shopWorkflowsHtml = `
<section class="shop-workflows" id="shop-workflows" aria-labelledby="shop-workflows-title">
  <div class="container">
    <div class="section-label">Beyond the bill</div>
    <h2 class="section-heading" id="shop-workflows-title">Bring your shop's work together</h2>
    <p class="section-sub">Start with the records you have, then manage the work around each sale: stock, suppliers, customer dues and the day's cash.</p>
    <div class="shop-workflows-grid">
      <article class="shop-workflow"><span class="shop-workflow-number">01 / SETUP</span><h3>Bring your existing lists</h3><p>Import products, customers and suppliers from Excel or CSV. Review the mapped rows, then prepare your starting stock and balances for owner confirmation.</p><p class="shop-workflow-note">Customer imports and credit balances use Premium. Imports and opening balances are reviewed separately.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">02 / GST</span><h3>Keep your GST records in order</h3><p>Set up your shop's registration and product tax details. For supported bills, review how GST is included or added, and keep records and exports for review.</p><p class="shop-workflow-note">Available features depend on registration and enabled capabilities. Exports do not file GST returns.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">03 / PURCHASING</span><h3>Know what you ordered and received</h3><p>Build a buy list, prepare a purchase order and record deliveries as they arrive. Keep supplier invoices and payments as separate, linked steps.</p><p class="shop-workflow-note">Purchasing tools require the appropriate role and a connection; supplier invoice recording depends on the server configuration.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">04 / CUSTOMER DUES</span><h3>See what is still owed</h3><p>Record credit sales and customer repayments, review outstanding balances and prepare a reminder when you need to follow up.</p><p class="shop-workflow-note">Udhaar is a Premium feature. You decide whether to share a reminder; sharing does not confirm delivery or payment.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">05 / CASHBOOK</span><h3>Close the day with a clearer count</h3><p>Record expenses and review opening cash, recorded receipts and payments. Compare expected closing cash with the cash you count.</p><p class="shop-workflow-note">The result depends on the movements recorded; cashbook access and day closing are role-controlled.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">06 / ESTIMATES</span><h3>Quote first, bill when ready</h3><p>Prepare an estimate with products, quantities and prices. After acceptance, bring eligible details into checkout and review the bill.</p><p class="shop-workflow-note">An estimate is not a tax invoice or payment. Conversion requires a connection and current-data checks.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">07 / ONLINE STORE</span><h3>Share a catalog beyond the counter</h3><p>Choose products for a public catalog and manage supported customer orders after the owner publishes the store.</p><p class="shop-workflow-note">Online ordering needs configuration, a verified email sender and customer email verification. Staff confirm payments and fulfilment separately.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">08 / STOCK ATTENTION</span><h3>See what may need restocking</h3><p>Set reorder levels and review low-stock or near-expiry items. Use available suggestions to prepare a buy list for your own review.</p><p class="shop-workflow-note">Suggestions depend on available records and are not guaranteed forecasts or automatic orders.</p></article>
      <article class="shop-workflow"><span class="shop-workflow-number">09 / TEAM</span><h3>Work in the same shop</h3><p>Invite your team and use owner, manager and helper roles to give people access suited to their work. Review recorded shop activity.</p><p class="shop-workflow-note">Available actions depend on the person's role and the shop's settings.</p></article>
    </div>
    <p class="shop-workflows-footnote">Features depend on your shop setup, role, connection and applicable Premium access. Review each action before confirming it.</p>
    <div class="shop-workflows-actions"><a href="/shop" class="btn-primary">Open your shop</a><a href="/pricing" class="btn-secondary">See plans and pricing</a></div>
  </div>
</section>`;


function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function getShopWorkflowsHtml(locale: Locale) {
  if (locale === 'en') return shopWorkflowsHtml;
  const copy = translations[locale];
  const cards = copy.cards.map(([title, body, note], index) => `<article class="shop-workflow"><span class="shop-workflow-number">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><p class="shop-workflow-note">${escapeHtml(note)}</p></article>`).join('');
  return `<section class="shop-workflows" id="shop-workflows" aria-labelledby="shop-workflows-title"><div class="container"><div class="section-label">${escapeHtml(copy.label)}</div><h2 class="section-heading" id="shop-workflows-title">${escapeHtml(copy.title)}</h2><p class="section-sub">${escapeHtml(copy.intro)}</p><div class="shop-workflows-grid">${cards}</div><p class="shop-workflows-footnote">${escapeHtml(copy.foot)}</p><div class="shop-workflows-actions"><a href="/shop" class="btn-primary">${escapeHtml(copy.open)}</a><a href="${localizedPath(locale, 'pricing')}" class="btn-secondary">${escapeHtml(copy.pricing)}</a></div></div></section>`;
}
