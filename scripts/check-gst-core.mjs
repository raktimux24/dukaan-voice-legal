import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const folder = resolve("app/lib/shop/gst-core");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const manifest = JSON.parse(
  readFileSync(resolve(folder, "manifest.json"), "utf8"),
);
for (const entry of manifest) {
  const file = readFileSync(resolve(folder, entry.file));
  if (hash(file) !== entry.vendoredSha256)
    throw Error(`GST core drift: ${entry.file}`);
  if (
    process.env.GST_SOURCE_ROOT &&
    hash(readFileSync(resolve(process.env.GST_SOURCE_ROOT, entry.source))) !==
      entry.sourceSha256
  )
    throw Error(`GST source changed: ${entry.source}`);
}
console.log(`Verified ${manifest.length} vendored GST contracts.`);
