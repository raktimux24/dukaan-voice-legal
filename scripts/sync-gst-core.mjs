import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, basename } from "node:path";
const source = process.env.GST_SOURCE_ROOT;
if (!source)
  throw Error(
    "Set GST_SOURCE_ROOT to the mobile repository. This is a development-only synchronization tool.",
  );
const folder = resolve("app/lib/shop/gst-core"),
  manifestPath = resolve(folder, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const files = new Set(manifest.map((row) => row.file.replace(/\.ts$/, "")));
const hash = (value) => createHash("sha256").update(value).digest("hex");
for (const entry of manifest) {
  const original = readFileSync(resolve(source, entry.source), "utf8");
  const browserSource = original.replace(
    /import\s+type\s*\{\s*GstReportSummary\s*\}\s+from\s+['"][^'"]*\/gst-report-summary(?:\.js)?['"];?/g,
    "import type {GstPreparationSummary as GstReportSummary} from '../gst-types';",
  );
  const content = browserSource.replace(
    /(from\s+['"])([^'"]+)(['"])/g,
    (all, start, path, end) => {
      if (path === "node:crypto") return `${start}../gst-hash${end}`;
      if (path.endsWith("gst-report-summary.js")) return `${start}./report-decimal${end}`;
      if (path.endsWith("/api/purchases")) return `${start}../gst-types${end}`;
      const name = basename(path).replace(/\.(?:js|ts)$/, "");
      return files.has(name) ? `${start}./${name}${end}` : all;
    },
  );
  if (process.argv.includes("--check")) {
    if (content !== readFileSync(resolve(folder, entry.file), "utf8"))
      throw Error(`Shared contract differs: ${entry.source}`);
  } else {
    writeFileSync(resolve(folder, entry.file), content);
    entry.sourceSha256 = hash(original);
    entry.vendoredSha256 = hash(content);
  }
}
if (!process.argv.includes("--check"))
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `GST contracts ${process.argv.includes("--check") ? "match" : "synchronized"} (${manifest.length}).`,
);
