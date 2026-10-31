import notices from './privacy-disclosures.json';
import retained from './retention-locales.json';

const escape = (text: string) => text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const paragraph = (text: string) => `<p>${escape(text)}</p>`;
const marker = 'data-privacy-disclosures="2026-10-31"';

/** Replace obsolete translated claims structurally so every public locale agrees. */
export function applyPrivacyDisclosures(html: string, locale: string) {
  if (html.includes(marker)) return html;
  const copy = notices[locale as keyof typeof notices] ?? notices.en;
  const retention = retained[locale as keyof typeof retained] ?? retained.en;
  const subsection = (number: string, next: string, text: string) => {
    const expression = new RegExp(`(<h3>${number.replace('.', '\\.')}[^<]*<\\/h3>)[\\s\\S]*?(?=<h3>${next.replace('.', '\\.')})`);
    if (!expression.test(html)) throw Error(`Missing privacy subsection ${locale}/${number}`);
    html = html.replace(expression, (_match, heading) => heading + paragraph(text) + '\n');
  };
  subsection('1.2', '1.3', copy.voice);
  subsection('1.3', '1.4', copy.business);
  html = html.replace(/(<h3>1\.6[^<]*<\/h3>)[\s\S]*?(<\/div>\s*<\/details>)/, (_match, heading, end) => heading + paragraph(copy.diagnostics) + end);
  const section = (id: string, text: string) => {
    const expression = new RegExp(`(<details id="${id}">[\\s\\S]*?<div class="section-content">)[\\s\\S]*?(<\\/div>\\s*<\\/details>)`);
    if (!expression.test(html)) throw Error(`Missing privacy section ${locale}/${id}`);
    html = html.replace(expression, (_match, start, end) => start + paragraph(text) + end);
  };
  section('s2', copy.uses);
  section('s5', retention.retention);
  section('s7', copy.sharing);
  html = html.replace(/(<details id="s3">[\s\S]*?<div class="section-content">)/, start => start + paragraph(copy.providers));
  html = html.replace(/(<details id="s9">[\s\S]*?)(<\/div>\s*<\/details>)/, (_match, start, end) => start + paragraph(copy.partial) + '<p><a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>' + end);
  html = html.replace(/<p class="effective">[\s\S]*?<\/p>/, `<p class="effective">${escape(copy.updated)}</p>`);
  return html.replace('<div class="container">', `<div class="container" ${marker}>`);
}
