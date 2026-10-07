import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const folder = mkdtempSync(join(tmpdir(), "samaan-gst-tests-"));
function run(file, args, env = process.env) {
  const result = spawnSync(process.execPath, [file, ...args], {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) throw Error(`Check failed: ${file}`);
}
try {
  run(resolve("node_modules/typescript/bin/tsc"), [
    "--ignoreConfig",
    "--outDir",
    folder,
    "--target",
    "ES2020",
    "--lib",
    "ES2022,DOM",
    "--module",
    "commonjs",
    "--moduleResolution",
    "node",
    "--ignoreDeprecations",
    "6.0",
    "--skipLibCheck",
    "app/lib/shop/gst-api.ts",
    "app/lib/shop/gst-storage.ts",
    "app/lib/shop/gst-document.ts",
    "app/lib/shop/gst-core/product-gross-price.ts",
    "app/lib/shop/gst-core/report-period.ts",
  ]);
  writeFileSync(join(folder, "package.json"), '{"type":"commonjs"}');
  run(resolve("tests/gst-contracts.mjs"), [], {
    ...process.env,
    GST_TEST_BUILD: folder,
  });
  run(resolve("tests/gst-storage.mjs"), [], {
    ...process.env,
    GST_TEST_BUILD: folder,
  });
  run(resolve("scripts/check-gst-core.mjs"), []);
} finally {
  rmSync(folder, { recursive: true, force: true });
}
