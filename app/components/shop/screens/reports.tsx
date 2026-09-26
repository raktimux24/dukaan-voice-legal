'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { catalogL1Label } from '../../../lib/shop/catalog';
import { downloadText } from '../../../lib/shop/csv';
import { formatINR } from '../../../lib/shop/money';
import type { SalesReport, StockReport } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Card, Chip, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass, isPremiumError } from '../ui';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
] as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'credit', label: 'Udhaar' },
] as const;

function clockLabel(hour: number) {
  const suffix = hour >= 12 ? 'pm' : 'am';
  return `${hour % 12 || 12}${suffix}`;
}

function shortDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ColumnChart({ columns }: { columns: { label: string; bars: { value: number; tone?: string }[] }[] }) {
  const max = Math.max(1, ...columns.flatMap((column) => column.bars.map((bar) => bar.value)));
  return (
    <div className="chart-bars" role="img">
      {columns.map((column, index) => (
        <div key={`${column.label}-${index}`} className="chart-col">
          <div className="chart-pair">
            {column.bars.map((bar, barIndex) => (
              <span
                key={barIndex}
                className={bar.tone}
                style={{ height: bar.value <= 0 ? '0%' : `${Math.max(6, (bar.value / max) * 100)}%` }}
              />
            ))}
          </div>
          <small>{column.label}</small>
        </div>
      ))}
    </div>
  );
}

function ShareList({ rows }: { rows: { key: string; label: string; pct: number; value: string; tone?: string }[] }) {
  if (rows.length === 0) return <p className="party-meta">Nothing in this period.</p>;
  return (
    <div className="chart-rows">
      {rows.map((row) => (
        <div key={row.key} className="chart-row">
          <span>{row.label}</span>
          <div className="chart-track" aria-hidden="true">
            <i className={row.tone} style={{ width: `${row.pct <= 0 ? 0 : Math.max(2, Math.min(100, row.pct))}%` }} />
          </div>
          <b>{row.value}</b>
        </div>
      ))}
    </div>
  );
}

function SalesView({ report, showCost }: { report: SalesReport; showCost: boolean }) {
  const summary = report.summary;
  const revenue = summary?.revenue ?? 0;
  const methodTotal = METHODS.reduce((sum, method) => sum + (summary?.byMethod?.[method.id] ?? 0), 0) || 1;
  const hours = summary?.byHour ?? [];
  const series = summary?.series ?? [];
  const week = WEEKDAYS.map((label, dow) => ({
    label,
    value: report.byWeekday?.find((day) => day.dow === dow)?.revenue ?? 0,
  }));

  return (
    <>
      {report.limitedToDays ? <p className="party-meta">Free plan shows the last {report.limitedToDays} days.</p> : null}
      <div className="kpi-grid">
        <div className="kpi">
          <p className="kpi-label">Revenue</p>
          <p className="kpi-value">{formatINR(revenue)}</p>
          {report.comparison ? (
            <p className={report.comparison.deltaPct.revenue >= 0 ? 'dash-delta is-up' : 'dash-delta is-down'}>
              {report.comparison.deltaPct.revenue >= 0 ? '+' : ''}
              {Math.round(report.comparison.deltaPct.revenue)}% {report.comparison.label.replaceAll('_', ' ')}
            </p>
          ) : null}
        </div>
        <div className="kpi">
          <p className="kpi-label">Bills</p>
          <p className="kpi-value">{summary?.bills ?? 0}</p>
          {report.comparison ? (
            <p className={report.comparison.deltaPct.bills >= 0 ? 'dash-delta is-up' : 'dash-delta is-down'}>
              {report.comparison.deltaPct.bills >= 0 ? '+' : ''}
              {Math.round(report.comparison.deltaPct.bills)}%
            </p>
          ) : null}
        </div>
        <div className="kpi">
          <p className="kpi-label">Avg bill</p>
          <p className="kpi-value">{formatINR(summary?.avgBill)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">{showCost ? 'Margin' : 'Items sold'}</p>
          <p className="kpi-value">{showCost ? (summary?.marginPct == null ? '—' : `${summary.marginPct.toFixed(1)}%`) : summary?.itemsSold ?? 0}</p>
        </div>
      </div>
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">By hour</h2>
          <p className="shop-section-sub">{report.bestHour == null ? 'No sales in this period.' : `Busiest at ${clockLabel(report.bestHour)}.`}</p>
          <ColumnChart
            columns={hours.map((value, hour) => ({
              label: hour % 3 === 0 ? clockLabel(hour) : '',
              bars: [{ value }],
            }))}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">By weekday</h2>
          <p className="shop-section-sub">Revenue across the week.</p>
          <ColumnChart columns={week.map((day) => ({ label: day.label, bars: [{ value: day.value }] }))} />
        </Card>
      </div>
      {series.length > 0 ? (
        <Card>
          <h2 className="shop-section-title">Over the period</h2>
          <ColumnChart
            columns={series.map((point, index) => ({
              label: series.length > 14 && index % Math.ceil(series.length / 8) !== 0 ? '' : shortDay(point.date),
              bars: [{ value: point.revenue }],
            }))}
          />
        </Card>
      ) : null}
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">How it was paid</h2>
          <ShareList
            rows={METHODS.map((method) => {
              const amount = summary?.byMethod?.[method.id] ?? 0;
              return { key: method.id, label: method.label, pct: (amount / methodTotal) * 100, value: formatINR(amount) };
            })}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">Categories</h2>
          <ShareList
            rows={(report.byCategory ?? []).map((row) => ({
              key: row.category,
              label: catalogL1Label(row.category),
              pct: row.sharePct,
              value: formatINR(row.revenue),
            }))}
          />
        </Card>
      </div>
      <div className="kpi-grid">
        <div className="kpi"><p className="kpi-label">Items / bill</p><p className="kpi-value">{report.basket?.itemsPerBill?.toFixed(1) ?? '—'}</p></div>
        <div className="kpi"><p className="kpi-label">Discounted bills</p><p className="kpi-value">{report.basket?.discountedBills ?? 0}</p></div>
        <div className="kpi"><p className="kpi-label">Returns</p><p className="kpi-value">{formatINR(report.returns?.returnAmount)}</p></div>
        <div className="kpi"><p className="kpi-label">Voids</p><p className="kpi-value">{report.returns?.voids ?? 0}</p></div>
      </div>
      {showCost ? (
        <div className="kpi-grid">
          <div className="kpi"><p className="kpi-label">Gross profit</p><p className="kpi-value">{formatINR(summary?.grossProfit)}</p></div>
          <div className="kpi"><p className="kpi-label">Cost of goods</p><p className="kpi-value">{formatINR(summary?.cogs)}</p></div>
          <div className="kpi"><p className="kpi-label">Cash in drawer</p><p className="kpi-value">{formatINR(summary?.cashInDrawer)}</p></div>
          <div className="kpi"><p className="kpi-label">Discounts</p><p className="kpi-value">{formatINR(summary?.discounts)}</p></div>
        </div>
      ) : null}
      {(report.inputMethods ?? []).length > 0 ? (
        <Card>
          <h2 className="shop-section-title">How bills were entered</h2>
          <ShareList
            rows={report.inputMethods.map((row) => ({
              key: row.method,
              label: row.method,
              pct: summary?.bills ? (row.bills / summary.bills) * 100 : 0,
              value: `${row.bills} bills`,
            }))}
          />
        </Card>
      ) : null}
    </>
  );
}

function StockView({ report, showCost }: { report: StockReport; showCost: boolean }) {
  const onHand = report.onHand;
  const products = onHand?.products || 1;
  const movement = report.movementByDay ?? [];
  const statuses = [
    { key: 'OK', label: 'In stock', tone: 'is-ok' },
    { key: 'LOW', label: 'Low', tone: 'is-warn' },
    { key: 'OUT', label: 'Out', tone: 'is-danger' },
  ];

  return (
    <>
      {report.limitedToDays ? <p className="party-meta">Movement covers the last {report.limitedToDays} days on this plan.</p> : null}
      <div className="kpi-grid">
        <div className="kpi"><p className="kpi-label">Products</p><p className="kpi-value">{onHand?.products ?? 0}</p></div>
        <div className="kpi"><p className="kpi-label">Units on hand</p><p className="kpi-value">{Math.round(onHand?.units ?? 0)}</p></div>
        <div className="kpi"><p className="kpi-label">Retail value</p><p className="kpi-value">{formatINR(onHand?.retailValue)}</p></div>
        {showCost ? <div className="kpi"><p className="kpi-label">Cost value</p><p className="kpi-value">{formatINR(onHand?.costValue)}</p></div> : null}
      </div>
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">Stock health</h2>
          <ShareList
            rows={statuses.map((status) => {
              const count = onHand?.byStatus?.[status.key]?.products ?? 0;
              return { key: status.key, label: status.label, pct: (count / products) * 100, value: String(count), tone: status.tone };
            })}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">Expiring</h2>
          <div className="party-stats">
            <div className="party-stat"><span>7 days</span><b>{report.expiry?.within7?.batches ?? 0}</b></div>
            <div className="party-stat"><span>30 days</span><b>{report.expiry?.within30?.batches ?? 0}</b></div>
            <div className="party-stat"><span>60 days</span><b>{report.expiry?.within60?.batches ?? 0}</b></div>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="shop-section-title">Movement</h2>
        <p className="chart-legend"><i /> In <i className="is-ok" /> Sold</p>
        {movement.length === 0 ? <p className="party-meta">No stock movement in this period.</p> : (
          <ColumnChart
            columns={movement.map((day, index) => ({
              label: movement.length > 14 && index % Math.ceil(movement.length / 8) !== 0 ? '' : shortDay(day.date),
              bars: [
                { value: day.unitsIn, tone: '' },
                { value: day.unitsSold, tone: 'is-ok' },
              ],
            }))}
          />
        )}
      </Card>
      <Card>
        <h2 className="shop-section-title">By category</h2>
        <ShareList
          rows={(report.byCategory ?? []).map((row) => ({
            key: row.category,
            label: catalogL1Label(row.category),
            pct: products ? (row.products / products) * 100 : 0,
            value: showCost ? formatINR(row.retailValue) : `${row.products} products`,
          }))}
        />
      </Card>
      {(report.expiry?.items.length ?? 0) > 0 ? (
        <Card flush>
          <div className="card-intro">
            <h2 className="shop-section-title">Batches nearing expiry</h2>
          </div>
          <div className="shop-list">
            {report.expiry?.items.map((item) => (
              <div key={`${item.productId}-${item.expiryDate}`} className="shop-list-row">
                <div className="shop-list-main">
                  <p className="shop-list-title">{item.name}</p>
                  <p className="shop-list-meta">{item.units} {item.unit} · {formatDaySafe(item.expiryDate)}</p>
                </div>
                <b>{item.daysRemaining}d</b>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
}

function formatDaySafe(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function ReportsScreen() {
  const { api, shop, perms, premium, prefs, hideCost } = useShop();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('week');
  const [tab, setTab] = useState<'sales' | 'stock'>('sales');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [asking, setAsking] = useState(false);
  const enabled = !!shop && perms.canSeeReports;
  const sales = useQuery({ queryKey: ['report-sales', shop?.id, period], enabled, queryFn: () => api.getSalesReport(shop!.id, period) });
  const stock = useQuery({ queryKey: ['report-stock', shop?.id, period], enabled, queryFn: () => api.getStockReport(shop!.id, period) });
  const top = useQuery({ queryKey: ['top', shop?.id, period], enabled: enabled && premium && tab === 'sales', queryFn: () => api.getTopProducts(shop!.id, { period }) });

  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what="Reports are for the owner and managers." />;

  const activeError = tab === 'sales' ? sales.error : stock.error;
  const showCost = (tab === 'sales' ? sales.data?.showCost : stock.data?.showCost) !== false && !hideCost;
  const exportCsv = () => {
    setError(null);
    const task = tab === 'sales'
      ? api.salesCsv(shop.id, { period }).then((csv) => downloadText(`sales-${period}.csv`, csv))
      : api.stockCsv(shop.id, period).then((csv) => downloadText(`stock-${period}.csv`, csv));
    void task.catch(setError);
  };

  return (
    <div className="shop-page">
      <PageHeader
        kicker="Insights"
        title="Reports"
        description="Sales and stock for the period you pick. Switch the view without losing the dates."
        actions={
          premium ? (
            <Button tone="ghost" onClick={exportCsv}>{tab === 'sales' ? 'Sales CSV' : 'Stock movement CSV'}</Button>
          ) : <Button href="/shop/settings/subscription" tone="ghost">CSV needs Premium</Button>
        }
      />
      <div className="shop-toolbar">
        <div className="shop-seg" role="tablist" aria-label="Report">
          <button type="button" role="tab" aria-selected={tab === 'sales'} className={tab === 'sales' ? 'is-active' : undefined} onClick={() => setTab('sales')}>Sales</button>
          <button type="button" role="tab" aria-selected={tab === 'stock'} className={tab === 'stock' ? 'is-active' : undefined} onClick={() => setTab('stock')}>Stock</button>
        </div>
        <div className="pos-chips">
          {PERIODS.map((item) => <Chip key={item.id} active={period === item.id} onClick={() => setPeriod(item.id)}>{item.label}</Chip>)}
        </div>
      </div>
      <Notice error={error} />
      {isPremiumError(activeError) ? <PremiumLock shopId={shop.id} feature="pos_reports" /> : null}
      {activeError && !isPremiumError(activeError) ? <Notice error={activeError} /> : null}
      {tab === 'sales' && sales.isLoading ? <Spinner label="Loading sales" /> : null}
      {tab === 'stock' && stock.isLoading ? <Spinner label="Loading stock" /> : null}
      {tab === 'sales' && sales.data && !isPremiumError(sales.error) ? <SalesView report={sales.data} showCost={showCost} /> : null}
      {tab === 'stock' && stock.data && !isPremiumError(stock.error) ? <StockView report={stock.data} showCost={showCost} /> : null}
      {tab === 'sales' && premium ? (
        <Card>
          <h2 className="shop-section-title">Top products</h2>
          {top.isLoading ? <Spinner /> : null}
          <ShareList
            rows={(top.data?.products ?? []).map((product) => {
              const max = Math.max(...(top.data?.products ?? []).map((row) => row.revenue), 1);
              return {
                key: `${product.productId}-${product.name}`,
                label: product.name,
                pct: (product.revenue / max) * 100,
                value: formatINR(product.revenue),
              };
            })}
          />
        </Card>
      ) : null}
      <Card>
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            const text = question.trim();
            if (!text || !premium) return;
            setAsking(true);
            setError(null);
            void api.ask(shop.id, text, prefs?.appLanguage).then((result) => setAnswer(result.answer)).catch(setError).finally(() => setAsking(false));
          }}
        >
          <Field label="Ask about this shop">
            <textarea className={inputClass} value={question} onChange={(event) => setQuestion(event.target.value)} />
          </Field>
          {premium ? <Button type="submit" disabled={asking || !question.trim()}>{asking ? 'Asking…' : 'Ask'}</Button> : <PremiumLock shopId={shop.id} feature="analytics" />}
          {answer ? <p>{answer}</p> : null}
        </form>
      </Card>
    </div>
  );
}
