import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const files = [
  "app/components/shop/gst-ui.tsx",
  "app/components/shop/gst-rsp-checkout.tsx",
  "app/components/shop/screens/checkout.tsx",
  "app/components/shop/gst-workspace.tsx",
  "app/components/shop/gst-documents.tsx",
  "app/components/shop/gst-supplier.tsx",
  "app/components/shop/gst-sale-adjustments.tsx",
  "app/components/shop/gst-collection-review.tsx",
  ...readdirSync("app/components/shop/screens")
    .filter((n) => /^(gst-|purchase)/.test(n))
    .map((n) => "app/components/shop/screens/" + n),
  ...readdirSync("app/lib/shop")
    .filter((n) => /^gst-.*\.ts$/.test(n))
    .map((n) => "app/lib/shop/" + n),
];
const catalog = {};
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    if (
      ts.isStringLiteral(node) &&
      /[A-Za-z]+\s[A-Za-z]+/.test(node.text) &&
      !node.text.includes("/") &&
      !node.text.includes("${") &&
      !/^\s*(import|from)\s/.test(node.text) &&
      !node.text.includes("className") &&
      !/^[-\w ]+$/.test(
        node.text.replace(
          /\b(shop|gst|form|grid|gap|text|no|print|is|2|4)\b/g,
          "",
        ),
      )
    ) {
      /* handled below */
    }
    if (
      ts.isStringLiteral(node) &&
      /[A-Za-z]{2}/.test(node.text) &&
      !/[\/{}<>]|^[a-z]+[_.:-]/.test(node.text) &&
      !/^([\w-]+ )*(shop-|gst-|grid|gap-|text-|form-|no-print)/.test(
        node.text,
      ) &&
      ![
        "pending",
        "confirmed",
        "inclusive",
        "exclusive",
        "regular",
        "composition",
        "unknown",
        "unregistered",
        "numbering",
        "sales",
        "purchases",
        "hsn",
        "sac",
        "taxable",
        "exempt",
        "nil",
        "non_gst",
        "cash",
        "upi",
        "bank",
        "card",
        "none",
        "nearest_rupee",
        "json",
        "csv",
        "reason",
        "version",
        "reviewed",
        "effectiveFrom",
        "sourceReference",
      ].includes(node.text) &&
      (!/^[a-z_\-]+$/.test(node.text) ||
        ["documents", "products selected"].includes(node.text))
    ) {
      catalog[
        "web.gst." + node.text.toLowerCase().replace(/[^a-z0-9]+/g, "_")
      ] = node.text;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const old = JSON.parse(
  readFileSync("app/lib/shop/gst-web-locales.json", "utf8"),
);
for (const [key, value] of Object.entries(catalog)) {
  if (
    value === "use client" ||
    value.startsWith("?") ||
    value.startsWith("&") ||
    value.startsWith(".") ||
    /^[a-z]+[A-Z]/.test(value) ||
    ["POST", "PATCH", "OWNER"].includes(value)
  )
    delete catalog[key];
}
old.en = catalog;
for (const [lang, entries] of Object.entries(old)) {
  if (lang !== "en")
    for (const key of Object.keys(entries)) {
      if (!catalog[key]) delete entries[key];
    }
}
writeFileSync(
  "app/lib/shop/gst-web-locales.json",
  JSON.stringify(old, null, 2) + "\n",
);
console.log(`${Object.keys(catalog).length} web labels collected.`);
