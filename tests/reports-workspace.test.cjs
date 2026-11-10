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
  effectiveReportPeriod,
  SALES_PERIODS,
  STOCK_PERIODS,
  reportTab,
  stockMovementTotals,
  reportChartScale,
  reportCostVisible,
} = require("../app/lib/shop/reports.ts");
test("Free reports only request today or seven days across both tabs", () => {
  for (const p of new Set([...SALES_PERIODS, ...STOCK_PERIODS]))
    assert.equal(
      effectiveReportPeriod(p, false),
      ["today", "7d"].includes(p) ? p : "7d",
    );
});
test("Premium preserves last month and ninety days exactly for data, rankings and export", () => {
  for (const p of [...SALES_PERIODS, ...STOCK_PERIODS])
    assert.equal(effectiveReportPeriod(p, true), p);
});
test("stock totals subtract depletion and preserve fractional units and signed corrections", () => {
  const rows = [
    { unitsIn: 2.5, unitsSold: 1.25, unitsAdjusted: 0.5 },
    { unitsIn: 0, unitsSold: 2, unitsAdjusted: -0.25 },
  ];
  assert.deepEqual(stockMovementTotals(rows), {
    incoming: 2.5,
    sold: 3.25,
    adjusted: 0.25,
    net: -1,
  });
  assert.deepEqual(stockMovementTotals([]), {
    incoming: 0,
    sold: 0,
    adjusted: 0,
    net: 0,
  });
});
test("charts retain negative values around a common baseline and true zero", () => {
  const s = reportChartScale([-50, 100, 0]);
  assert.ok(Math.abs(s.zero - 100 / 3) < 1e-10);
  assert.equal(s.height(0), 0);
  assert.ok(Math.abs(s.height(-50) - 100 / 3) < 1e-10);
  assert.ok(Math.abs(s.height(100) - 200 / 3) < 1e-10);
  assert.equal(s.height(Infinity), 0);
});
test("empty charts never produce NaN or fake bars", () => {
  const s = reportChartScale([]);
  assert.equal(s.zero, 0);
  assert.equal(s.height(0), 0);
});
test("cost requires explicit server permission, role permission and visible setting", () => {
  for (const server of [undefined, false, true])
    for (const role of [false, true])
      for (const hidden of [false, true])
        assert.equal(
          reportCostVisible(server, role, hidden),
          server === true && role && !hidden,
        );
});
test("report deep links safely select Stock or default to Sales", () => {
  assert.equal(reportTab("stock"), "stock");
  for (const v of [null, "sales", "bogus"]) assert.equal(reportTab(v), "sales");
});
