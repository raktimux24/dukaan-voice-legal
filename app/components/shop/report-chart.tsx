"use client";
import { reportChartScale } from "../../lib/shop/reports";
import { useShop } from "./context";
export function ReportChart({
  columns,
  series,
  money = false,
  empty,
}: {
  columns: { label: string; values: number[] }[];
  series: string[];
  money?: boolean;
  empty?: string;
}) {
  const { t } = useShop();
  const scale = reportChartScale(columns.flatMap((c) => c.values));
  const format = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      ...(money ? { style: "currency", currency: "INR" } : {}),
    }).format(n);
  const values = columns.flatMap((c) => c.values);
  if (!values.some((n) => Number.isFinite(n) && n !== 0))
    return (
      <p className="shop-hint report-chart-empty">
        {empty ??
          t("reportweb.chart_empty", "Nothing recorded in this period yet.")}
      </p>
    );
  // Name the highest bar so the chart reads without hovering.
  let peak: { label: string; value: number } | null = null;
  if (series.length === 1)
    for (const c of columns)
      for (const v of c.values)
        if (Number.isFinite(v) && (!peak || v > peak.value))
          peak = { label: c.label, value: v };
  return (
    <div className="report-chart">
      {peak && peak.value > 0 ? (
        <p className="report-chart-peak">
          {t("reportweb.peak", "Highest: {{label}} · {{value}}", {
            label: peak.label,
            value: format(peak.value),
          })}
        </p>
      ) : null}
      <div className="report-chart-plot" aria-hidden="true">
        <div
          className="report-chart-zero"
          style={{ bottom: `${scale.zero}%` }}
        />
        {columns.map((c, i) => (
          <div
            className="report-chart-column"
            key={i}
            title={`${c.label}: ${c.values.map(format).join(" / ")}`}
          >
            <div className="report-chart-bars">
              {c.values.map((n, j) => (
                <i
                  key={j}
                  className={`report-series-${j}`}
                  style={{
                    height: `${scale.height(n)}%`,
                    bottom: `${n < 0 ? scale.zero - scale.height(n) : scale.zero}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="report-chart-ends" aria-hidden="true">
        <span>{columns[0]?.label}</span>
        <span>{columns.at(-1)?.label}</span>
      </div>
      <details className="report-data">
        <summary>{t("reportweb.values", "View chart values")}</summary>
        <div className="report-table-scroll">
          <table className="gst-table">
            <caption className="sr-only">{series.join(" / ")}</caption>
            <thead>
              <tr>
                <th>{t("reportweb.interval", "Date / time")}</th>
                {series.map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((c, i) => (
                <tr key={i}>
                  <th scope="row">{c.label}</th>
                  {c.values.map((v, j) => (
                    <td key={j}>{format(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
