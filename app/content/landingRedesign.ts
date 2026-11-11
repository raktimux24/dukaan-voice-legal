import { localizedPath, locales, type Locale } from '../i18n';
import { appStoreUrl, playStoreUrl } from '../seo';
import { planCopy } from '../lib/subscriptions';
import copy from './landingRedesignCopy.json';
import opening from './landingOpeningCopy.json';
import offer from './offerCorrections.json';
import workflows from './shopWorkflowsLocales.json';
import completion from './landingCompletionCopy.json';
import preview from './browserPreviewCopy.json';
import { getLocaleHomeSlots } from './localeHomeSlots';

type Copy = (typeof copy)['en'];

const esc = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const icon = (paths: string) => `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const mic = icon('<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/>');
const check = icon('<path d="m5 12 5 5L20 7"/>');

// One stroke family (Lucide-style, 1.5px) for every workflow tile.
const tileIcons = [
  icon('<path d="M14 3v5h5M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M12 18v-6m-3 3 3-3 3 3"/>'),
  icon('<path d="M5 3l2 1 2-1 2 1 2-1 2 1 2-1 2 1v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1V3Z"/><path d="m9 15 6-6"/><circle cx="9.5" cy="9.5" r=".5"/><circle cx="14.5" cy="14.5" r=".5"/>'),
  icon('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  icon('<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 0 0 5H20M4 4.5v15"/><path d="M9 7h6M9 11h4"/>'),
  icon('<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z"/><circle cx="16" cy="14.5" r="1"/>'),
  icon('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
  icon('<path d="M3 9 5 4h14l2 5M3 9v11h18V9M3 9h18"/><path d="M9 20v-6h6v6"/>'),
  icon('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>'),
];

// The same sale, spoken in each voice language. Kept in its own script on every page.
export const spokenSale: Partial<Record<Locale, string>> = {
  en: 'Rice 5 kilo, sugar 1 kilo',
  hi: 'चावल 5 किलो, चीनी 1 किलो',
  bn: 'চাল 5 কেজি, চিনি 1 কেজি',
  ta: 'அரிசி 5 கிலோ, சர்க்கரை 1 கிலோ',
  te: 'బియ్యం 5 కిలో, చక్కెర 1 కిలో',
  mr: 'तांदूळ 5 किलो, साखर 1 किलो',
  kn: 'ಅಕ್ಕಿ 5 ಕೆಜಿ, ಸಕ್ಕರೆ 1 ಕೆಜಿ',
  gu: 'ચોખા 5 કિલો, ખાંડ 1 કિલો',
  ml: 'അരി 5 കിലോ, പഞ്ചസാര 1 കിലോ',
};

const wave = `<div class="sale-wave" aria-hidden="true">${[8, 15, 24, 12, 32, 43, 25, 17, 36, 50, 31, 16, 27, 41, 22, 12, 29, 17, 9].map((height, index) => `<i style="--bar-height:${height}px;--wave-delay:-${(index * .17).toFixed(2)}s;--wave-duration:${(1.1 + index % 4 * .19).toFixed(2)}s"></i>`).join('')}</div>`;

/** public/get-app-qr.svg encodes https://samaanbol.space/get-app, which sends each phone to its own store. */
const appQr = () => '<img src="/get-app-qr.svg" width="72" height="72" alt="" loading="lazy" decoding="async"/>';

function hero(original: string, locale: Locale, t: Copy) {
  const o = opening[locale];
  const languageNote = original.match(/<p class="language-support-note">[\s\S]*?<\/p>/)?.[0] ?? '';
  const seeHow = getLocaleHomeSlots(locale)?.ctaSeeHow ?? 'See how a sale works';
  const spoken = spokenSale[locale] ?? spokenSale.hi!;
  const spokenLang = locale in spokenSale ? locales.find(item => item.code === locale)!.hreflang : 'hi-IN';
  return `<section class="hero hero-counter lr-hero" aria-labelledby="hero-title"><div class="container">
    <div class="counter-hero-grid">
      <div class="counter-hero-copy">
        <p class="section-label">${esc(t.eyebrow)}</p>
        <h1 id="hero-title"><span>${esc(o.headline[0])}</span><span>${esc(o.headline[1])}</span></h1>
        <p class="counter-hero-intro">${esc(o.intro)}</p>${languageNote}
        <div class="counter-hero-actions" data-device-cta data-ios="${appStoreUrl}" data-android="${playStoreUrl}" data-app-label="${esc(t.getApp)}">
          <a href="/shop" class="btn-primary" data-cta-primary><span data-cta-label>${esc(workflows[locale].open)}</span> <span aria-hidden="true">→</span></a>
          <a href="#how" class="story-text-link">${esc(seeHow)} <span aria-hidden="true">↗</span></a>
        </div>
        <div class="counter-app-links" data-store-placement="hero">
          <div class="lr-qr" aria-hidden="true">${appQr()}</div>
          <div class="lr-app-copy"><span>${esc(o.appLabel)}</span><div><a href="${playStoreUrl}" data-store-placement="hero" aria-label="Samaan Bol — Google Play">Google Play <span aria-hidden="true">↗</span></a><a href="${appStoreUrl}" data-store-placement="hero" aria-label="Samaan Bol — App Store">App Store <span aria-hidden="true">↗</span></a></div><small class="lr-qr-label">${esc(t.qr)}</small></div>
        </div>
      </div>
      <figure class="counter-hero-scene lr-scene">
        <div class="counter-illustration"><img src="/illustrations/kirana-hero.webp" width="1536" height="1024" alt="" fetchpriority="high" decoding="async"/></div>
        <div class="lr-demo voice-motion" data-voice-motion data-hero-demo>
          <div class="lr-demo-voice">
            <span class="counter-voice-mark">${mic}</span>
            <div class="lr-demo-said"><span class="counter-scene-label" data-demo-status data-listening="${esc(t.listening)}">${esc(o.phone)}</span><p lang="${spokenLang}" data-demo-spoken>“${esc(spoken)}”</p></div>
            ${wave}
            <button type="button" class="voice-motion-toggle" data-motion-toggle data-pause-label="${esc(o.pause)}" data-play-label="${esc(o.play)}" aria-label="${esc(o.pause)}" title="${esc(o.pause)}" hidden><svg class="motion-pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10m6-10v10"/></svg><svg class="motion-play" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5 8 5-8 5Z"/></svg></button>
          </div>
          <div class="counter-sample-bill lr-bill">
            <p class="counter-bill-heading">${esc(o.review)}</p>
            <div class="lr-bill-line" data-demo-step="1"><div><strong>${esc(o.rice)}</strong><small>5 kg × ₹50</small></div><b>₹250</b></div>
            <div class="lr-bill-line" data-demo-step="2"><div><strong>${esc(t.sugar)}</strong><small>1 kg × ₹45</small></div><b>₹45</b></div>
            <div class="lr-bill-total" data-demo-step="2"><span>${esc(o.total)}</span><strong data-demo-total>₹295</strong></div>
            <p class="counter-bill-note">${esc(o.payment)}</p>
          </div>
          <p class="lr-shared" data-demo-step="3"><span>${check}</span>${esc(t.shared)}</p>
        </div>
        <figcaption>${esc(offer[locale].exampleLabel)}</figcaption>
      </figure>
    </div>
  </div></section>
  <section class="lr-proof" aria-label="${esc(t.eyebrow)}"><div class="container"><ul>${t.proof.map(([value, label]) => `<li><strong>${esc(value)}</strong><span>${esc(label)}</span></li>`).join('')}</ul></div></section>`;
}

function miniUi(index: number, locale: Locale, t: Copy) {
  const m = t.mini;
  const p = preview[locale];
  const o = opening[locale];
  const [rice, oil, sugar] = [o.rice, p.products[1], t.sugar].map(name => esc(name));
  if (index === 0) return `<div class="lr-mini lr-mini--import" aria-hidden="true"><p><b>products.csv</b><span>248 ${esc(m.rows)}</span></p><ul><li><i></i>Basmati rice<em>25 kg</em></li><li><i></i>Toor dal<em>12 kg</em></li><li><i></i>Sunflower oil<em>18 L</em></li></ul></div>`;
  if (index === 1) return `<div class="lr-mini lr-mini--gst" aria-hidden="true"><p><span>${esc(m.taxable)}</span><b>₹1,000.00</b></p><p><span>CGST 2.5%</span><b>₹25.00</b></p><p><span>SGST 2.5%</span><b>₹25.00</b></p><p class="lr-mini-total"><span>${esc(m.total)}</span><b>₹1,050.00</b></p></div>`;
  if (index === 3) return `<div class="lr-mini lr-mini--dues" aria-hidden="true">${[['R', 'Ramesh', '₹640'], ['S', 'Sunita', '₹210'], ['A', 'Anwar', '₹95']].map(([initial, name, amount]) => `<p><i>${initial}</i><span>${name}</span><b>${amount}</b><small>${esc(m.due)}</small></p>`).join('')}</div>`;
  if (index === 4) return `<div class="lr-mini lr-mini--cash" aria-hidden="true"><p><span>${esc(m.expected)}</span><b>₹5,100</b></p><div class="lr-mini-bar"><i></i></div><p><span>${esc(m.counted)}</span><b>₹5,100 <em>${check}</em></b></p></div>`;
  if (index === 2) return `<div class="lr-mini lr-mini--po" aria-hidden="true"><p><b>PO-014</b><span>2 / 3</span></p><ul><li class="is-done"><i>${check}</i>${rice}<em>25 kg</em></li><li class="is-done"><i>${check}</i>${oil}<em>12 L</em></li><li><i></i>${sugar}<em>10 kg</em></li></ul></div>`;
  if (index === 5) return `<div class="lr-mini lr-mini--quote" aria-hidden="true"><div><small>EST-007</small><b>₹1,240</b></div><span>→</span><div class="is-bill"><small>#025</small><b>₹1,240</b></div></div>`;
  if (index === 6) return `<div class="lr-mini lr-mini--catalog" aria-hidden="true">${[[rice, '₹50'], [oil, '₹140'], [sugar, '₹45']].map(([name, price]) => `<div><i></i><span>${name}</span><b>${price}</b></div>`).join('')}</div>`;
  if (index === 7) return `<div class="lr-mini lr-mini--restock" aria-hidden="true">${[[sugar, '3 kg', 14], [oil, '2 L', 10]].map(([name, left, width]) => `<p><span>${name}</span><em><i style="width:${width}%"></i></em><b>${left}</b></p>`).join('')}<small>${esc(p.low)}</small></div>`;
  if (index === 8) return `<div class="lr-mini lr-mini--team" aria-hidden="true">${[['P', 'Priya', '#024 · ₹250', '18:42'], ['R', 'Raju', '#023 · ₹180', '18:35'], ['M', 'Meena', '#022 · ₹320', '18:21']].map(([initial, name, bill, time]) => `<p><i>${initial}</i><span>${name}</span><b>${bill}</b><small>${time}</small></p>`).join('')}</div>`;
  return '';
}

function bento(locale: Locale, t: Copy) {
  const w = workflows[locale];
  const tile = (index: number) => {
    const [title, body, note] = w.cards[index];
    return `<article class="shop-workflow lr-tile lr-tile--feature">${miniUi(index, locale, t)}
      <span class="lr-tile-icon">${tileIcons[index]}</span><h3>${esc(title)}</h3>
      <div class="workflow-detail-body"><p>${esc(body)}</p><details class="lr-req"><summary>${esc(t.requirements)}</summary><p class="shop-workflow-note">${esc(note)}</p></details></div>
    </article>`;
  };
  return `<section class="shop-workflows lr-bento" id="shop-workflows" aria-labelledby="shop-workflows-title"><div class="container">
    <div class="lr-section-head"><div class="section-label">${esc(w.label)}</div><h2 class="section-heading" id="shop-workflows-title">${esc(t.bentoTitle)}</h2><p class="section-sub">${esc(t.bentoIntro)}</p></div>
    <div class="lr-bento-grid">${[0, 1, 3, 4, 2, 7, 5, 6, 8].map(tile).join('')}</div>
    <div class="lr-bento-cta"><a href="/shop" class="btn-primary">${esc(w.open)} <span aria-hidden="true">→</span></a><a href="${localizedPath(locale, 'pricing')}" class="story-text-link">${esc(w.pricing)} <span aria-hidden="true">↗</span></a></div>
  </div></section>`;
}

function askViz(index: number, locale: Locale, t: Copy) {
  const p = preview[locale];
  const o = opening[locale];
  if (index === 0) return `<div class="lr-viz lr-viz--split" aria-hidden="true"><div class="lr-split-bar"><i style="flex:5100"></i><i style="flex:3320"></i><i style="flex:640"></i></div><dl><div><dt>${esc(p.cash)}</dt><dd>₹5,100</dd></div><div><dt>UPI</dt><dd>₹3,320</dd></div><div><dt>${esc(p.credit)}</dt><dd>₹640</dd></div></dl></div>`;
  if (index === 1) return `<div class="lr-viz lr-viz--dues" aria-hidden="true">${[['R', 'Ramesh', '₹640', 100], ['S', 'Sunita', '₹210', 33], ['A', 'Anwar', '₹95', 15]].map(([initial, name, amount, width]) => `<p><i>${initial}</i><span>${name}</span><em><b style="width:${width}%"></b></em><strong>${amount}</strong></p>`).join('')}</div>`;
  if (index === 2) return `<div class="lr-viz lr-viz--hours" aria-hidden="true"><div class="lr-hours">${[22, 34, 30, 46, 58, 40, 28, 36, 52, 78, 100, 64, 38].map((height, hour) => `<i${hour === 10 ? ' class="is-peak"' : ''} style="height:${height}%"></i>`).join('')}</div><div class="lr-hours-axis"><span>9</span><span>12</span><span>3</span><span>6</span><span>9</span></div></div>`;
  return `<div class="lr-viz lr-viz--stock" aria-hidden="true">${[[t.sugar, '3 kg', 14, true], [p.products[1], '2 L', 10, true], [o.rice, '19 kg', 76, false]].map(([name, left, width, low]) => `<p${low ? ' class="is-low"' : ''}><span>${esc(String(name))}</span><em><b style="width:${width}%"></b></em><strong>${left}</strong><small>${esc(low ? p.low : p.ready)}</small></p>`).join('')}</div>`;
}

function ask(original: string, locale: Locale, t: Copy) {
  const label = original.match(/<div class="section-label">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const heading = original.match(/<h2 class="section-heading">([\s\S]*?)<\/h2>/)?.[1] ?? '';
  const kicker = heading.match(/<span class="hindi"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim() ?? '';
  const title = heading.replace(/<span class="hindi"[^>]*>[\s\S]*?<\/span>/, '').trim();
  const sub = original.match(/<p class="section-sub">([\s\S]*?)<\/p>/)?.[1] ?? '';
  const blocks = [...original.matchAll(/<div class="ai-block reveal">([\s\S]*?)(?=<div class="ai-block reveal">|<\/div>\s*<\/div>\s*<\/section>)/g)].map(match => match[1]);
  const bars = `<span class="lr-ask-wave" aria-hidden="true">${[5, 11, 16, 8, 14, 6].map(height => `<i style="height:${height}px"></i>`).join('')}</span>`;
  const cards = blocks.map((block, index) => {
    const tag = (block.match(/<div class="ai-block-tag[^"]*">([\s\S]*?)<\/div>/)?.[1] ?? '').replace(/[.।]\s*$/, '');
    const h3 = block.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? '';
    const asked = block.includes('voice-bubble-avatar--user');
    const said = block.match(/<div class="hindi">([\s\S]*?)<\/div>/)?.[1] ?? '';
    const meaning = block.match(/<div class="translation">([\s\S]*?)<\/div>/)?.[1] ?? '';
    const link = block.match(/<a class="topic-link"[\s\S]*?<\/a>/)?.[0] ?? '';
    // Some locales repeat the spoken question as the body; show it once.
    const rawBody = block.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? '';
    const body = said && rawBody.includes(said.replaceAll('"', '').trim()) ? '' : rawBody;
    return `<article class="lr-ask-card lr-ask-card--${index} reveal">
      <div class="lr-ask-q"><span class="lr-ask-mic">${mic}</span><div>${asked ? `<p class="lr-ask-said hindi">${said}</p><small>${meaning}</small>` : `<p class="lr-ask-said">${h3}</p>`}</div>${bars}</div>
      <div class="lr-ask-a"><span class="lr-ask-tag">${tag}</span><strong>${esc(t.answers[index] ?? '')}</strong>${askViz(index, locale, t)}${body ? `<p>${body}</p>` : ''}${link}</div>
    </article>`;
  }).join('');
  return `<section class="ai-section lr-ask" id="ai" aria-labelledby="ask-title"><div class="container">
    <div class="lr-section-head"><div class="section-label">${label}</div><h2 class="section-heading" id="ask-title">${kicker ? `<span class="lr-kicker hindi">${kicker}</span>` : ''}${title}</h2><p class="section-sub">${sub}</p></div>
    <div class="lr-ask-grid">${cards}</div>
  </div></section>`;
}

function languages(original: string, locale: Locale, t: Copy) {
  const label = original.match(/<div class="section-label">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const details = original.match(/<details class="language-availability">[\s\S]*?<\/details>/)?.[0] ?? '';
  const c = completion[locale];
  const link = (item: typeof locales[number], spoken?: string) => `<a class="language-specimen${spoken ? ' lr-specimen' : ''}" href="${localizedPath(item.code, 'home')}#languages" lang="${item.hreflang}"${item.code === locale ? ' aria-current="page"' : ''}>${spoken ? `<span class="lr-specimen-said">“${esc(spoken)}”</span>` : ''}<span class="lr-specimen-name">${item.nativeLabel}</span><span class="language-link-arrow" aria-hidden="true">${item.code === locale ? '✓' : '↗'}</span></a>`;
  return `<section class="languages-section lr-languages" id="languages" aria-labelledby="language-directory-title"><div class="container">
    <div class="lr-section-head"><div class="section-label">${label}</div><h2 class="section-heading" id="language-directory-title">${esc(t.langHeading)}</h2><p class="section-sub">${esc(t.langIntro)}</p>${details}</div>
    <div class="lr-specimens" data-language-support="voice">${locales.filter(item => item.code in spokenSale).map(item => link(item, spokenSale[item.code])).join('')}</div>
    <div class="lr-reading"><p class="language-coming-note">${esc(c.comingSoonNote)}</p><div data-language-support="reading">${locales.filter(item => !(item.code in spokenSale)).map(item => link(item)).join('')}</div></div>
  </div></section>`;
}

function pricingValue(t: Copy) {
  const monthly = Number(planCopy.monthly.price.replace(/\D/g, ''));
  const annual = Number(planCopy.annual.price.replace(/\D/g, ''));
  const perDay = `₹${Math.round(annual / 365)}`;
  const percent = String(Math.round((1 - annual / (monthly * 12)) * 100));
  return `<p class="lr-plan-value"><span class="lr-save">${esc(t.save.replace('{percent}', percent))}</span>${esc(t.perDay.replace('{price}', perDay))}</p>`;
}

function footerExtra(locale: Locale, t: Copy) {
  return `<div class="lr-footer-extra">
    <div><h2>${esc(t.readSite)}</h2><ul class="lr-footer-langs">${locales.map(item => `<li><a href="${localizedPath(item.code, 'home')}" lang="${item.hreflang}"${item.code === locale ? ' aria-current="page"' : ''}>${item.nativeLabel}</a></li>`).join('')}</ul></div>
    <div class="lr-footer-contact"><a href="mailto:samaan-bol@outlook.com">${esc(t.email)} · samaan-bol@outlook.com</a><p>${esc(t.payments)}</p></div>
  </div>`;
}

const section = (html: string, pattern: RegExp) => html.match(pattern)?.[0] ?? '';

/**
 * The final layout pass: one demo-led hero, a proof strip, the sale, the
 * shop's wider work, the day's answers, the browser, languages, plans, answers
 * and the closing action — in that order. Earlier adapters supply the copy.
 */
export function redesignLanding(html: string, locale: Locale) {
  const t = (copy as Record<string, Copy>)[locale] ?? copy.en;
  const languagesHtml = section(html, /<section class="languages-section"[\s\S]*?<\/section>/);
  const questionsHtml = section(html, /<section class="product-answers[\s\S]*?<\/section>/);
  const downloadHtml = section(html, /<section class="cta-section" id="download"[\s\S]*?<\/section>/);

  let out = html
    .replace(/<section class="hero hero-counter"[\s\S]*?<\/section>/, original => hero(original, locale, t))
    .replace(/(<section class="how-it-works" id="how">[\s\S]*?<h2 class="section-heading">)[\s\S]*?(<\/h2>\s*<p class="section-sub">)[\s\S]*?(<\/p>)/, `$1${esc(t.howHeading)}$2${esc(t.trust)}$3`)
    .replace(/(<div class="step reveal reveal-delay-3">\s*<div class="step-number">03<\/div>\s*<h3>)[\s\S]*?(<\/h3>)/, `$1${esc(t.step3)}$2`)
    .replace(/<section class="shop-workflows"[\s\S]*?<\/section>/, () => bento(locale, t))
    .replace(/<section class="features" id="features"[\s\S]*?<\/section>/, '')
    .replace(/<section class="ai-section" id="ai"[\s\S]*?<\/section>/, original => ask(original, locale, t))
    .replace(languagesHtml, '')
    .replace(/<p class="preview-conditions">[\s\S]*?<\/p>/, '')
    .replace(/(<div class="web-grid">[\s\S]*?)<article class="web-card reveal">(?:(?!<article)[\s\S])*?<\/article>(\s*<\/div>)/, '$1$2')
    .replace(/(<section class="web-section" id="web">[\s\S]*?<\/section>)/, `$1${languages(languagesHtml, locale, t)}`)
    .replace(/<section class="comparison"[\s\S]*?<\/section>/, '')
    .replace(/(<p class="home-plan-annual">[\s\S]*?<\/p>)/, `$1${pricingValue(t)}`)
    .replace(questionsHtml, '')
    .replace(downloadHtml, `${questionsHtml}${downloadHtml}`)
    .replace('<div class="footer-bottom">', `${footerExtra(locale, t)}<div class="footer-bottom">`);

  out = out.replaceAll('href="#features"', 'href="#shop-workflows"');
  return out;
}
