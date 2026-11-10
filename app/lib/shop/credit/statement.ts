import { creditDay } from "./contract";
import type { CreditStatement } from "./contract";
export const canonicalCredit = (v: unknown): string =>
  Array.isArray(v)
    ? "[" + v.map(canonicalCredit).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .sort()
          .map(
            (k) =>
              JSON.stringify(k) +
              ":" +
              canonicalCredit((v as Record<string, unknown>)[k]),
          )
          .join(",") +
        "}"
      : JSON.stringify(v);
export async function verifyStatement(
  s: CreditStatement,
  digest: (v: string) => Promise<string>,
) {
  const { hash, ...payload } = s;
  if (s.version !== 1 || (await digest(canonicalCredit(payload))) !== hash)
    throw Error("credit_failed");
  return s;
}
export function statementCsv(s: CreditStatement) {
  const t = (k: string) => s.labels["credit." + k] ?? k,
    cell = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
  return (
    "\uFEFF" +
    [
      [t("statement"), s.id],
      [s.shop.name, s.customer.name],
      [t("from"), s.from, t("to"), s.to],
      [t("opening"), s.opening],
      [t("debits"), s.debits],
      [t("credits"), s.credits],
      [t("closing"), s.closing],
      ...(Number(s.closing) < 0
        ? [
            [
              s.labels["credit.we_owe"].replace(
                "{{amount}}",
                String(Math.abs(Number(s.closing)).toFixed(2)),
              ),
            ],
          ]
        : []),
      [t("unreconciled"), s.unreconciled],
      [t("unassigned"), s.unassigned],
      [
        t("date"),
        t("recorded"),
        t("source"),
        t("ledger_id"),
        t("note"),
        t("debits"),
        t("credits"),
        t("balance"),
      ],
      ...s.lines.map((l) => [
        l.date,
        l.recordedAt,
        l.reference || s.labels["credit.ledger." + l.kind] || t("ledger.other"),
        l.id,
        l.note,
        l.debit,
        l.credit,
        l.balance,
      ]),
      [t("obligations_now")],
      [
        t("source"),
        t("original"),
        t("paid"),
        t("remaining"),
        t("due"),
        [t("status.unpaid"), t("status.partial"), t("status.paid")].join(" / "),
      ],
      ...s.obligations.map((o) => [
        o.reference || t("kind." + o.kind),
        o.original,
        o.paid,
        o.remaining,
        o.dueDate ?? t("no_due"),
        t("status." + o.status),
      ]),
    ]
      .map((r) => r.map(cell).join(","))
      .join("\r\n")
  );
}
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
/** Fixed A4 pages with bounded row heights, repeated labels and no external resources. */
export function statementHtml(s: CreditStatement, fontCss = "") {
  if (s.lines.length > 1200) throw Error("credit_too_many");
  const t = (k: string) => esc(s.labels["credit." + k] ?? k),
    chunks = [];
  for (let i = 0; i < Math.max(s.lines.length, 1); i += 12)
    chunks.push(s.lines.slice(i, i + 12));
  const pages = chunks.map((lines) => ({
    lines,
    obligations: [] as CreditStatement["obligations"],
  }));
  if (s.lines.length + s.obligations.length > 1200)
    throw Error("credit_too_many");
  if (s.obligations.length <= 6 && pages[pages.length - 1].lines.length <= 6)
    pages[pages.length - 1].obligations = s.obligations;
  else
    for (let i = 0; i < s.obligations.length; i += 12)
      pages.push({ lines: [], obligations: s.obligations.slice(i, i + 12) });
  return `<!doctype html><html lang="${esc(s.language === "hinglish" ? "en" : s.language)}"><head><meta charset="utf-8"><style>${fontCss}
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#151515;font-family:DocumentSans,DocumentIndic,sans-serif;font-size:11px;line-height:1.45;background:#e5e5e5}.credit-statement-page{width:794px;min-height:1123px;padding:42px;background:#fff;page-break-after:always;margin:0 auto 16px}.credit-statement-page:last-child{page-break-after:auto}h1{font-size:24px;margin:10px 0;color:#9f4200}h2{font-size:15px;margin:0 0 6px}.meta{color:#555;overflow-wrap:anywhere}.summary{display:flex;gap:16px;margin:22px 0;padding:14px 0;border-top:2px solid #ff6b00;border-bottom:1px solid #ddd}.summary>div{flex:1}.summary strong{display:block;font-size:17px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{text-align:left;border-bottom:1px solid #ddd;padding:9px 5px;vertical-align:top;overflow-wrap:anywhere}th{background:#f6eee8;font-weight:700}td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}.warn{border-left:3px solid #ff6b00;padding:8px;margin:12px 0}.footer{border-top:1px solid #ddd;margin-top:22px;padding-top:10px;font-size:9px;color:#555;overflow-wrap:anywhere}@media print{body{background:white}.credit-statement-page{margin:0}} </style></head><body>${pages
    .map(
      ({ lines, obligations }, i) =>
        `<section class="credit-statement-page"><h2>${esc(s.shop.name)}</h2><div class="meta">${esc(s.shop.phone ?? "")} ${esc(s.shop.address ?? "")}</div><h1>${t("statement")}</h1><h2>${esc(s.customer.name)}</h2><div class="meta">${esc(s.customer.phone ?? "")} · ${esc(s.from)} — ${esc(s.to)}</div><div class="summary">${[
          ["opening", s.opening],
          ["debits", s.debits],
          ["credits", s.credits],
          ["closing", s.closing],
        ]
          .map(([k, v]) => `<div>${t(k)}<strong>₹${esc(v)}</strong></div>`)
          .join(
            "",
          )}</div>${Number(s.closing) < 0 ? `<div class="warn">${esc(s.labels["credit.we_owe"].replace("{{amount}}", Math.abs(Number(s.closing)).toFixed(2)))}</div>` : ""}${s.unreconciled !== "0.00" ? `<div class="warn">${t("unreconciled")}: ₹${esc(s.unreconciled)}. ${t("unreconciled_help")}</div>` : ""}<table><thead><tr><th style="width:16%">${t("date")}</th><th style="width:30%">${t("source")}</th><th class="num">${t("debits")}</th><th class="num">${t("credits")}</th><th class="num">${t("balance")}</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${esc(creditDay(l.date))}</td><td>${esc(l.reference || s.labels["credit.ledger." + l.kind] || s.labels["credit.ledger.other"])}<div class="meta">${esc(l.note.slice(0, 100))}${l.note.length > 100 ? "…" : ""}</div></td><td class="num">${esc(l.debit)}</td><td class="num">${esc(l.credit)}</td><td class="num">${esc(l.balance)}</td></tr>`).join("")}</tbody></table>${obligations.length ? `<h2 style="margin-top:22px">${t("obligations")}</h2><p class="meta">${t("obligations_now")}</p><table><thead><tr><th style="width:30%">${t("source")}</th><th>${t("due")}</th><th class="num">${t("original")}</th><th class="num">${t("remaining")}</th></tr></thead><tbody>${obligations.map((o) => `<tr><td>${esc(o.reference || s.labels["credit.kind." + o.kind])}<div class="meta">${t("status." + o.status)}</div></td><td>${esc(o.dueDate ?? s.labels["credit.no_due"])}</td><td class="num">${esc(o.original)}</td><td class="num">${esc(o.remaining)}</td></tr>`).join("")}</tbody></table>` : ""}<div class="footer">${t("snapshot")}: ${esc(s.id)} · ${t("recorded")}: ${esc(s.createdAt)}<br>${t("unassigned")}: ₹${esc(s.unassigned)} · ${t("page")} ${i + 1}/${pages.length}<br>${t("export_help")}<br>${esc(s.hash)}</div></section>`,
    )
    .join("")}</body></html>`;
}
