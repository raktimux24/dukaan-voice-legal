import type { Locale } from '../i18n';
import copy from './browserPreviewCopy.json';
import opening from './landingOpeningCopy.json';
import workflows from './shopWorkflowsLocales.json';

const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const money = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;
const svg = (paths: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const icons = [
  svg('<path d="M7 4h10l-2 5 4 10a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3L9 9 7 4Zm2 5h6m-6 5 2 2m3-3-2 2m1 3 2-1"/>'),
  svg('<path d="M9 2h6v4l2 3v12H7V9l2-3V2Zm0 4h6M7 12h10M7 18h10"/>'),
  svg('<path d="m12 3 8 5v9l-8 5-8-5V8l8-5ZM4 8l8 5 8-5M12 13v9M8 5.5l8 5"/>'),
  svg('<path d="M6 3h12l-1 4 2 14H5L7 7 6 3Zm1 4h10M12 10v8m0-5-3-2m3 5 3-2"/>'),
];
const tabIcons = [
  svg('<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z"/>'),
  svg('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6"/>'),
  icons[2],
];
const searchIcon = svg('<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>');

// Fictional examples only. Totals are calculated from these fixtures so the
// overview and sample bill remain internally consistent as the design changes.
const products = [
  { available: 24, unit: 'kg', price: 50, low: false },
  { available: 2, unit: 'L', price: 120, low: true },
  { available: 3, unit: 'kg', price: 45, low: true },
  { available: 12, unit: 'kg', price: 40, low: false },
];
const payments = [5100, 3320, 640];
const bill = [{ product: 0, quantity: 5 }, { product: 1, quantity: 1 }];
const billTotal = bill.reduce((sum, line) => sum + line.quantity * products[line.product].price, 0);

export function browserPreviewHtml(locale: Locale) {
  const t = copy[locale];
  const o = opening[locale];
  const total = payments.reduce((sum, value) => sum + value, 0);
  const methods = [t.cash, 'UPI', t.credit];
  const productName = (index: number) => `<span class="preview-product"><span class="preview-product-icon preview-product-icon--${index}">${icons[index]}</span><span>${esc(t.products[index])}</span></span>`;
  const status = (index: number) => `<span class="preview-stock-status${products[index].low ? ' is-low' : ''}">${esc(products[index].low ? t.low : t.ready)}</span>`;
  const rows = (stock = false) => products.map((product, index) => `<tr><th scope="row">${productName(index)}</th><td>${stock ? `${product.available} ${product.unit}` : `${money(product.price)} <small>/ ${product.unit}</small>`}</td><td>${stock ? status(index) : `${product.available} ${product.unit}`}</td></tr>`).join('');
  const tabs = ['day', 'bill', 'stock'];
  const panel = (id: string, contents: string) => `<div class="preview-panel" id="preview-panel-${id}" role="tabpanel" aria-labelledby="preview-tab-${id}" tabindex="0"${id === 'day' ? '' : ' hidden'}>${contents}</div>`;

  return `<div class="desk-frame reveal shop-preview" data-shop-preview aria-describedby="web-preview-caption">
    <div class="browser-chrome"><span></span><span></span><span></span><div class="browser-url">samaanbol.space/shop</div></div>
    <div class="preview-shell"><aside class="preview-rail">
      <div class="preview-rail-brand"><img src="/logo1.svg" width="27" height="27" alt=""/><span>Samaan<span>Bol</span></span></div>
      <div class="preview-shop-name"><strong>${esc(t.shop)}</strong></div>
      <p class="preview-explore">${esc(t.explore)} <span aria-hidden="true">↓</span></p>
      <div class="preview-tabs" role="tablist" aria-orientation="vertical" aria-label="${esc(t.explore)}">${tabs.map((id, index) => `<button type="button" role="tab" id="preview-tab-${id}" data-preview-tab="${id}" aria-controls="preview-panel-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${tabIcons[index]}${esc(t.tabs[index])}</button>`).join('')}</div>
      <div class="preview-rail-bottom" aria-hidden="true"><span class="preview-rail-mark"></span>Samaan Bol</div>
    </aside><div class="preview-panels">
      ${panel('day', `<div class="preview-home-heading"><div><h3>${esc(t.home)}</h3><p>${esc(t.homeIntro)}</p></div><button type="button" data-preview-select="bill">${esc(t.newSale)} <span aria-hidden="true">＋</span></button></div>
        <div class="preview-day-layout"><div class="preview-sales"><h3>${esc(t.sales)}</h3><strong class="preview-total">${money(total)}</strong><dl class="preview-facts"><div><dt>${esc(t.bills)}</dt><dd>24</dd></div><div><dt>${esc(t.average)}</dt><dd>${money(total / 24)}</dd></div><div><dt>${esc(t.credit)} <small>Premium</small></dt><dd>${money(payments[2])}</dd></div></dl><div class="preview-payment-bar" aria-hidden="true">${payments.map((value, index) => `<span class="preview-method-${index}" style="flex:${value}"></span>`).join('')}</div><dl class="preview-payment-legend">${payments.map((value, index) => `<div><dt><i class="preview-method-${index}" aria-hidden="true"></i>${esc(methods[index])}</dt><dd>${money(value)}</dd></div>`).join('')}</dl></div>
        <div class="preview-brief"><h3><span aria-hidden="true">☀</span> ${esc(t.brief)}</h3><p>${esc(t.briefText)}</p><button type="button" data-preview-select="stock">${esc(t.reviewStock)} <span aria-hidden="true">→</span></button></div>
        <dl class="preview-attention">${[t.low, t.out, t.expiry, t.unpriced].map((label, index) => `<div${index === 0 ? ' class="is-low"' : ''}><dd>${index === 0 ? 2 : 0}</dd><dt>${esc(label)}</dt></div>`).join('')}</dl>
        <div class="preview-recent"><h3>${esc(t.recent)}</h3><table class="preview-table"><thead><tr>${t.billColumns.map(label => `<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${[250, 180, 320].map((value, index) => `<tr><th scope="row"><span class="preview-bill-number">#0${24 - index}</span><small>${['18:42', '18:35', '18:21'][index]}</small></th><td><span class="preview-method-pill preview-pill-${index}">${esc(methods[index])}</span></td><td>${money(value)}</td></tr>`).join('')}</tbody></table></div>
        <div class="preview-watch"><h3>${esc(t.watch)}</h3>${[1, 2].map(index => `<div class="preview-watch-row">${productName(index)}<div><strong>${products[index].available} ${products[index].unit}</strong>${status(index)}</div></div>`).join('')}</div></div>`)}
      ${panel('bill', `<div class="preview-billing-layout"><div class="preview-catalog"><div class="preview-search">${searchIcon}<span>${esc(t.search)}</span>${svg('<path d="M3 7V3h4m10 0h4v4M3 17v4h4m10 0h4v-4M7 7v10m3-10v10m4-10v10m3-10v10"/>')}</div><table class="preview-table preview-catalog-table"><thead><tr>${t.columns.map(label => `<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${rows()}</tbody></table></div>
        <div class="preview-bill-paper"><div class="preview-bill-paper-top"><span>SamaanBol</span><span>#025</span></div><h3>${esc(o.review)}</h3><div class="preview-bill-lines">${bill.map(line => `<div><div><strong>${esc(t.products[line.product])}</strong><small>${line.quantity} ${products[line.product].unit} × ${money(products[line.product].price)}</small></div><span>${money(line.quantity * products[line.product].price)}</span></div>`).join('')}</div><div class="preview-bill-total"><span>${esc(o.total)}</span><strong>${money(billTotal)}</strong></div><p>${esc(o.payment)}</p></div></div>`)}
      ${panel('stock', `<div class="preview-stock-layout"><table class="preview-table preview-inventory-table"><thead><tr><th scope="col">${esc(t.columns[0])}</th><th scope="col">${esc(t.columns[2])}</th><th scope="col">${esc(t.tabs[2])}</th></tr></thead><tbody>${rows(true)}</tbody></table><div class="preview-stock-story"><span class="preview-stock-story-icon" aria-hidden="true">${icons[0]}</span><h3>${esc(t.stockChange)}</h3><p>${esc(t.products[0])} · ${esc(t.sold)}</p><div class="preview-stock-equation"><div><small>${esc(t.before)}</small><strong>24 <span>kg</span></strong></div><span aria-hidden="true">→</span><div><small>${esc(t.after)}</small><strong>19 <span>kg</span></strong></div></div><p class="preview-stock-note">${esc(t.stockNote)}</p></div></div>`)}
    </div></div><p class="preview-conditions">${esc(workflows[locale].foot)}</p>
  </div>`;
}
