const fs = require("node:fs"),
  ts = require("typescript"),
  { test } = require("node:test"),
  assert = require("node:assert/strict");
require.extensions[".ts"] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    f,
  );
const {
  settingsSection,
  preferenceValues,
  settingsLinks,
  settingsImports,
} = require("../app/lib/shop/settings.ts");
const { permissionsFor } = require("../app/lib/shop/permissions.ts");
test("defaults match the preference API including enabled voice feedback and evening recap", () => {
  assert.deepEqual(preferenceValues(null), {
    appLanguage: "en",
    voiceLanguage: "en",
    voiceFeedbackEnabled: true,
    highContrastMode: false,
    textSize: "medium",
    dailyRecapEnabled: true,
  });
});
test("explicit false preferences survive normalization and unsupported languages do not enter controls", () => {
  const p = preferenceValues({
    voiceFeedbackEnabled: false,
    dailyRecapEnabled: false,
    appLanguage: "pa",
    voiceLanguage: "or",
    textSize: "huge",
  });
  assert.equal(p.voiceFeedbackEnabled, false);
  assert.equal(p.dailyRecapEnabled, false);
  assert.equal(p.appLanguage, "en");
  assert.equal(p.voiceLanguage, "en");
  assert.equal(p.textSize, "medium");
  assert.equal(
    preferenceValues({ voiceLanguage: "hinglish", textSize: "extra_large" })
      .voiceLanguage,
    "hinglish",
  );
});
test("all members can view the shop profile; only owners receive subscription management", () => {
  for (const role of ["OWNER", "MANAGER", "HELPER"]) {
    const paths = settingsLinks(permissionsFor(role), false).map((x) => x.href);
    for (const path of [
      "/shop/settings/subscription",
    ])
      assert.equal(paths.includes(path), role === "OWNER");
    assert.equal(paths.includes("/shop/settings/shop"), true);
    assert.equal(paths.includes("/shop/settings/payments"), true);
    assert.equal(paths.includes("/shop/settings/staff"), role !== "HELPER");
    assert.equal(paths.includes("/shop/purchases"), role !== "HELPER");
  }
});
test("imports respect their respective role permissions", () => {
  for (const role of ["OWNER", "MANAGER", "HELPER"])
    assert.equal(
      settingsImports(permissionsFor(role), false).length,
      role === "HELPER" ? 0 : 4,
    );
  const restricted = {
    ...permissionsFor("MANAGER"),
    canManageCustomers: false,
    canSeeCost: false,
  };
  assert.deepEqual(
    settingsImports(restricted, false).map((x) => x.href),
    ["/shop/products/import", "/shop/settings/opening-balances"],
  );
});
test("offline removes all management and import destinations even with stale owner permissions", () => {
  assert.deepEqual(settingsLinks(permissionsFor("OWNER"), true), []);
  assert.deepEqual(settingsImports(permissionsFor("OWNER"), true), []);
});
test("deep links preserve known sections and safely default unknown values", () => {
  for (const value of ["preferences", "shop", "data", "account"])
    assert.equal(settingsSection(value), value);
  assert.equal(settingsSection(null), "preferences");
  assert.equal(settingsSection("delete"), "preferences");
});

test("legal links match supported languages and Hinglish uses the Hindi legal page", () => {
  const { settingsLegalPath } = require("../app/lib/shop/settings.ts");
  assert.equal(settingsLegalPath("privacy-policy", "hi"), "/hi/privacy-policy");
  assert.equal(
    settingsLegalPath("terms-of-service", "hinglish"),
    "/hi/terms-of-service",
  );
  assert.equal(settingsLegalPath("privacy-policy", "en"), "/privacy-policy");
  assert.equal(
    settingsLegalPath("privacy-policy", "../unsafe"),
    "/privacy-policy",
  );
});
