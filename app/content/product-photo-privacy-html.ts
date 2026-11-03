import notices from './product-photo-privacy.json';
import disclosures from './privacy-disclosures.json';
const marker='data-product-photo-privacy="2026-11-03"';
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Add the same photo boundaries to every published privacy locale. */
export function applyProductPhotoPrivacy(html:string,locale:string){
 if(html.includes(marker))return html;
 const copy=notices[locale as keyof typeof notices]??notices.en,date=disclosures[locale as keyof typeof disclosures]??disclosures.en;
 const heading=/<h3>1\.4[^<]*<\/h3>/;
 if(!heading.test(html))throw Error('Missing product photo privacy insertion point: '+locale);
 const section=`<section ${marker}><h4>${escape(copy.heading)}</h4><p>${escape(copy.photos)}</p><p>${escape(copy.retention)}</p><p>${escape(copy.cache)}</p></section>\n`;
 html=html.replace(heading,match=>section+match);
 const neon=/(<td><strong>Neon<\/strong><\/td>\s*<td>[\s\S]*?<\/td>\s*<td>)[\s\S]*?(<\/td>)/;
 if(!neon.test(html))throw Error('Missing photo metadata provider row: '+locale);
 html=html.replace(neon,(_match,start,end)=>start+escape(copy.database)+end);
 const provider=`<tr data-product-photo-provider="r2"><td><strong>Cloudflare R2</strong></td><td>${escape(copy.providerPurpose)}</td><td>${escape(copy.providerData)}</td><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">cloudflare.com/privacypolicy</a></td></tr>`;
 if(!html.includes('<tbody>'))throw Error('Missing photo provider table: '+locale);
 html=html.replace('<tbody>','<tbody>'+provider);
 return html.replace(/<p class="effective">[\s\S]*?<\/p>/,`<p class="effective">${escape(date.updated)}</p>`);
}
