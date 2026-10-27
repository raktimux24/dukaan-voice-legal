import {
  documentPaper,
  documentMessage,
  type DocumentContextView,
  type PrintableDocument,
} from "./contract";
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
/** Same measured DOM pagination is executed in WKWebView and the web preview. */
export const DOCUMENT_PAGINATION = String.raw`
(async()=>{
 await document.fonts.ready;
 await Promise.all([...document.images].map(i=>i.decode().catch(()=>{throw Error('document_image_failed')})));
 const source=document.querySelector('[data-document-source]');
 if(!source)throw Error('document_layout_missing');
 const paper=JSON.parse(document.querySelector('#document-paper').textContent);
 const header=source.querySelector('[data-repeat-header]').outerHTML;
 const columns=source.querySelector('[data-repeat-columns]').outerHTML;
 const pieces=[...source.querySelector('[data-document-pieces]').children].map(n=>n.cloneNode(true));
 const root=document.createElement('div');root.id='document-pages';document.body.append(root);
 let page,content,count=0;const pages=[];
 function start(){page=document.createElement('main');page.className='doc-sheet';page.innerHTML='<div class="doc-content">'+header+columns+'</div><footer class="doc-page-number"></footer>';root.append(page);content=page.querySelector('.doc-content');count=0;}
 function fits(){return content.getBoundingClientRect().height<=paper.height-2*paper.margin-22+.1&&content.scrollWidth<=paper.width-2*paper.margin+1;}
 function finish(){if(!count)return;pages.push(page);}
 start();
 for(const original of pieces){
  let piece=original;
  content.append(piece);
  if(fits()){count++;continue;}
  piece.remove();if(count){finish();start();content.append(piece);if(fits()){count++;continue;}piece.remove();}
  // Merchant terms may span pages. Split only flow paragraphs; never truncate a line or totals.
  if(!piece.hasAttribute('data-flow'))throw Error('document_block_exceeds_page');
  let words=piece.textContent.match(/\S+\s*|\s+/gu)||[''];
  if(words.length===1&&words[0].length>100){const seg=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;words=seg?[...seg.segment(words[0])].map(s=>s.segment):Array.from(words[0]);}
  while(words.length){let lo=1,hi=words.length,best=0;const part=piece.cloneNode(false);content.append(part);while(lo<=hi){const mid=Math.floor((lo+hi)/2);part.textContent=words.slice(0,mid).join('');if(fits()){best=mid;lo=mid+1;}else hi=mid-1;}if(!best)throw Error('document_block_exceeds_page');part.textContent=words.slice(0,best).join('');words=words.slice(best);count++;if(words.length){finish();start();}}
 }
 finish();if(!pages.length)throw Error('document_empty');
 source.remove();
 const pageLabel=document.querySelector('#document-page-label').textContent;
 pages.forEach((p,i)=>{p.dataset.page=String(i+1);p.querySelector('footer').textContent=pageLabel.replace('{{page}}',String(i+1)).replace('{{pages}}',String(pages.length));});
 if(pages.some(p=>p.scrollWidth>paper.width+1||p.scrollHeight>paper.height+1))throw Error('document_overflow');
 document.documentElement.dataset.documentReady='true';
 return {width:paper.width,height:paper.height,pages:pages.map(p=>p.outerHTML),head:document.head.innerHTML,lineIds:pages.flatMap(p=>[...p.querySelectorAll('[data-line-id]')].map(n=>n.dataset.lineId))};
})()
`;
export function documentHtml(
  model: PrintableDocument,
  context: DocumentContextView,
  fontCss = "",
  autoPaginate = true,
) {
  if (
    model.version !== 1 ||
    context.payload.version !== 1 ||
    context.payload.renderer !== "samaan_documents_v1"
  )
    throw Error("document_unsupported");
  const cfg = context.payload.config,
    p = documentPaper(cfg.layout),
    m = context.payload.messages,
    t = (k: string) => documentMessage(m, k),
    asset = (hash: string | null) => (hash ? (context.assets[hash] ?? "") : "");
  if (
    (context.payload.logoHash && !asset(context.payload.logoHash)) ||
    (context.payload.signatureHash && !asset(context.payload.signatureHash))
  )
    throw Error("document_asset_missing");
  const identity = model.identity;
  const header = `<header class="doc-head" data-repeat-header>${model.sample ? `<div class="doc-stamp">${esc(t("documents.sample_stamp"))}</div>` : ""}<div class="doc-brand">${context.payload.logoHash ? `<img class="doc-logo" alt="" src="${esc(asset(context.payload.logoHash))}" style="object-fit:${cfg.logoFit}">` : ""}<div><h1>${esc(identity.name)}</h1>${identity.address ? `<p>${esc(identity.address)}</p>` : ""}${identity.phone ? `<p>${esc(identity.phone)}</p>` : ""}</div></div><h2>${esc(model.title)}</h2><div class="doc-identity"><b>${esc(model.number)}</b><span>${esc(model.date)}</span></div>${model.customer ? `<p>${esc(model.customer)}</p>` : ""}${model.identityLines.map((v) => `<p class="doc-small">${esc(v)}</p>`).join("")}${model.status ? `<strong>${esc(model.status)}</strong>` : ""}</header>`;
  const columns = `<div class="doc-columns" data-repeat-columns><b>${esc(m["bill.item"])}</b><b>${esc(m["bill.qty"])}</b><b>${esc(m["bill.amount"])}</b></div>`;
  const rows = model.items
    .map(
      (row) =>
        `<section class="doc-line" data-line-id="${esc(row.id)}"><div class="doc-line-main"><div><strong>${esc(row.name)}</strong>${row.details.map((d) => `<p class="doc-small">${esc(d)}</p>`).join("")}</div><span>${esc(row.quantity)}</span><b>${esc(row.amount)}</b></div></section>`,
    )
    .join("");
  const groups = model.groups
    .map((g) => `<p class="doc-group doc-small">${esc(g)}</p>`)
    .join("");
  const summary = `<section class="doc-totals">${model.summary.map((r) => `<div class="doc-total ${r.emphasis ? "is-strong" : ""}"><span>${esc(r.label)}</span><b>${esc(r.value)}</b></div>`).join("")}</section>`;
  const footnotes = model.footnotes
    .map((f) => `<p class="doc-small" data-flow>${esc(f)}</p>`)
    .join("");
  const payment =
    cfg.showPayment &&
    (context.payload.payment.vpa || context.payload.payment.qr)
      ? `<section class="doc-payment"><b>${esc(t("documents.payment_title"))}</b>${context.payload.payment.payee ? `<p>${esc(context.payload.payment.payee)}</p>` : ""}${context.payload.payment.vpa ? `<p>UPI: ${esc(context.payload.payment.vpa)}</p>` : ""}${context.payload.payment.qr ? `<img class="doc-qr" src="${esc(context.payload.payment.qr)}" alt="">` : ""}<p class="doc-small">${esc(t("documents.payment_caption"))}</p></section>`
      : "";
  const terms = cfg.terms
    ? `<h3>${esc(t("documents.terms"))}</h3>` +
      cfg.terms
        .split(/\r?\n/)
        .map(
          (line) =>
            `<p class="doc-terms" data-flow>${esc(line) || "&#160;"}</p>`,
        )
        .join("")
    : `<p class="doc-small">${esc(m["bill.thanks"])}</p>`;
  const signature =
    cfg.showSignature && context.payload.signatureHash
      ? `<section class="doc-signature"><img alt="" src="${esc(asset(context.payload.signatureHash))}"><p class="doc-small">${esc(t("documents.signature_caption"))}</p></section>`
      : "";
  return `<!doctype html><html lang="${esc(cfg.language === "hinglish" ? "en" : cfg.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=${p.width},initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'"><style>${fontCss}
 @page{size:${p.widthMm}mm ${p.heightMm}mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;color:#17202a;background:#e9e9ed;font-family:'DocumentSans','DocumentIndic',sans-serif;overflow-wrap:anywhere}body{width:${p.width}px;font-size:${cfg.layout === "receipt" ? 11 : 12}px;line-height:1.4}p{margin:3px 0}h1{margin:0;font-size:${cfg.layout === "receipt" ? 18 : 24}px;line-height:1.2}h2{font-size:14px;margin:10px 0 5px}h3{font-size:12px;margin:12px 0 4px}.doc-sheet{position:relative;display:flow-root;width:${p.width}px;height:${p.height}px;padding:${p.margin}px;background:#fff;margin:0 0 16px;overflow:visible;break-after:page}.doc-sheet:last-child{break-after:auto}.doc-content{display:flow-root;width:${p.width - 2 * p.margin}px}.doc-head{padding-bottom:10px;border-bottom:1px solid #b8bec7}.doc-brand{display:flex;gap:14px;align-items:center}.doc-logo{width:${cfg.layout === "receipt" ? 60 : 96}px;height:${cfg.layout === "receipt" ? 40 : 60}px;flex-shrink:0}.doc-identity{display:flex;flex-wrap:wrap;justify-content:space-between;gap:5px}.doc-small{font-size:10px;color:#4f5965;white-space:pre-wrap}.doc-stamp{font-weight:700;border:2px solid #677181;padding:5px;text-align:center;margin-bottom:8px;font-size:11px}.doc-columns,.doc-line-main{display:grid;grid-template-columns:minmax(0,1fr) ${cfg.layout === "receipt" ? "18% 25%" : "18% 22%"};gap:8px}.doc-columns{padding:8px 0;border-bottom:1px solid #bbc1c9;font-size:10px}.doc-columns>*:nth-child(n+2),.doc-line-main>*:nth-child(n+2){text-align:right}.doc-line{padding:7px 0;border-bottom:1px solid #e5e7eb;break-inside:avoid}.doc-line-main>*{min-width:0}.doc-group{padding:5px 0;border-bottom:1px solid #eee}.doc-totals{border-top:1px solid #677181;padding-top:8px;margin-top:8px}.doc-total{display:flex;justify-content:space-between;gap:12px;padding:3px 0}.doc-total span{min-width:0;flex:1}.doc-total b{white-space:nowrap}.doc-total.is-strong{font-size:15px;border-top:1px solid #b7bec8;padding-top:7px;margin-top:5px}.doc-payment{margin-top:10px;padding:8px 0}.doc-qr{display:block;width:92px;height:92px;object-fit:contain;margin-top:5px}.doc-terms{white-space:pre-wrap;font-size:10px;margin:5px 0}.doc-signature{margin-top:12px}.doc-signature img{display:block;width:150px;height:55px;object-fit:contain;object-position:left center}.doc-page-number{position:absolute;bottom:${p.margin}px;left:${p.margin}px;right:${p.margin}px;font-size:9px;text-align:center;color:#687384}.doc-powered{font-size:9px;color:#687384;margin-top:10px}
 ${cfg.layout === "receipt" || cfg.layout === "a5" ? ".doc-brand{flex-direction:column;gap:6px;text-align:center}.doc-head h2{text-align:center}" : ""}
 [data-document-source]{width:${p.width - 2 * p.margin}px;background:white;margin:0;padding:0} @media print{html,body{background:white;width:${p.width}px}.doc-sheet{margin:0;box-shadow:none}}
 </style></head><body><script id="document-paper" type="application/json">${JSON.stringify(p)}</script><script id="document-page-label" type="text/plain">${esc(t("documents.page_label"))}</script><main data-document-source>${header}${columns}<div data-document-pieces>${rows}${groups}${summary}${footnotes}${payment}${terms}${signature}<p class="doc-powered">${esc(t("documents.powered"))}</p></div></main>${autoPaginate ? `<script>window.__samaanDocumentReady=${DOCUMENT_PAGINATION};window.__samaanDocumentReady.catch(e=>{document.documentElement.dataset.documentError=e.message;});</script>` : ""}</body></html>`;
}
export function sampleDocument(
  context: DocumentContextView,
  count = 20,
): PrintableDocument {
  if (![1, 20, 100].includes(count)) throw Error("document_invalid_sample");
  const m = context.payload.messages,
    t = (key: string, vars: Record<string, string | number> = {}) =>
      documentMessage(m, key, vars);
  return {
    version: 1,
    source: { kind: "sample", id: "sample" },
    title: t("documents.sample_bill"),
    number: t("documents.sample_number"),
    date: new Intl.DateTimeFormat(
      context.payload.config.language === "hinglish"
        ? "en-IN"
        : context.payload.config.language + "-IN",
      { dateStyle: "medium", timeZone: "Asia/Kolkata" },
    ).format(new Date()),
    identity: context.payload.identity,
    identityLines: [],
    customer: t("documents.sample_customer"),
    items: Array.from({ length: count }, (_, i) => ({
      id: "sample-" + (i + 1),
      name: t("documents.sample_item", { number: i + 1 }),
      quantity: "1",
      amount: "₹10.00",
      details: ["@ ₹10.00"],
    })),
    groups: [],
    summary: [
      { label: m["bill.subtotal"], value: "₹" + (count * 10).toFixed(2) },
      {
        label: m["bill.total"],
        value: "₹" + (count * 10).toFixed(2),
        emphasis: true,
      },
    ],
    footnotes: [t("documents.sample_help")],
    sample: true,
  };
}
