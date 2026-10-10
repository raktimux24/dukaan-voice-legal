'use client';

import { useGstText as useUiText } from "../gst-ui";

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { VoiceCapture, SpeechAudio } from '../voice-capture';
import type { SpokenAnswer } from '../../../lib/shop/types';
import { labeledL1 } from '../../../lib/shop/catalog';
import { downloadText } from '../../../lib/shop/csv';
import { formatINR, formatShortDay } from '../../../lib/shop/money';
import type { SalesReport, StockReport } from '../../../lib/shop/types';
import { EN_FALLBACK } from '../../../lib/shop/en-fallback';
import {SalesInsights} from '../report-sales-insights';
import {StockInsights} from '../report-stock-insights';
import { useShop } from '../context';
import { Button, Card, Chip, Field, NoAccess, Notice, PageHeader, PremiumLock, Spinner, inputClass, isPremiumError } from '../ui';

const SALES_PERIODS = ['today', '7d', '30d', 'month', 'last_month'] as const;
const STOCK_PERIODS = ['7d', '30d', '90d'] as const;

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const WEEKDAY_FALLBACK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'credit', label: 'Udhaar' },
] as const;

function periodChip(id: string, t: (key: string, fallback: string) => string) {
  if (id === 'today') return t('sales.period.today', 'Today');
  if (id === '7d') return t('sales.period.7d', '7 days');
  if (id === '30d') return t('sales.period.30d', '30 days');
  if (id === '90d') return t('reports.stock.period_90d', '90 days');
  if (id === 'month') return t('sales.period.month', 'This month');
  return t('reports.sales.period_last_month', 'Last month');
}

function clockLabel(hour: number) {
  const suffix = hour >= 12 ? 'pm' : 'am';
  return `${hour % 12 || 12}${suffix}`;
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
  const uiText = useUiText();
  if (rows.length === 0) return <p className="party-meta">{uiText("Nothing in this period.")}</p>;
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
  const uiText = useUiText();
  const { t, prefs } = useShop();
  const summary = report.summary;
  const revenue = summary?.revenue ?? 0;
  const methodTotal = METHODS.reduce((sum, method) => sum + (summary?.byMethod?.[method.id] ?? 0), 0) || 1;
  const hours = summary?.byHour ?? [];
  const series = summary?.series ?? [];
  const week = WEEKDAYS.map((id, dow) => ({
    label: t(`reports.sales.dow.${id}`, WEEKDAY_FALLBACK[dow] ?? id),
    value: report.byWeekday?.find((day) => day.dow === dow)?.revenue ?? 0,
  }));

  return (
    <>
      {report.limitedToDays ? <p className="party-meta">{t('activity.free_limit_title', 'Showing the last {{days}} days.', { days: report.limitedToDays })}</p> : null}
      <div className="kpi-grid">
        <div className="kpi">
          <p className="kpi-label">{t('sales.summary.revenue', 'Revenue')}</p>
          <p className="kpi-value">{formatINR(revenue)}</p>
          {report.comparison && report.comparison.deltaPct.revenue != null ? (
            <p className={report.comparison.deltaPct.revenue >= 0 ? 'dash-delta is-up' : 'dash-delta is-down'}>
              {report.comparison.deltaPct.revenue >= 0 ? '+' : ''}
              {Math.round(report.comparison.deltaPct.revenue)}% {report.comparison.label === 'same_day_last_week' ? t('reports.sales.vs_last_week', 'vs last week') : t('reports.sales.vs_previous', 'vs previous')}
            </p>
          ) : null}
        </div>
        <div className="kpi">
          <p className="kpi-label">{t('sales.summary.bills', 'Bills')}</p>
          <p className="kpi-value">{summary?.bills ?? 0}</p>
          {report.comparison && report.comparison.deltaPct.bills != null ? (
            <p className={report.comparison.deltaPct.bills >= 0 ? 'dash-delta is-up' : 'dash-delta is-down'}>
              {report.comparison.deltaPct.bills >= 0 ? '+' : ''}
              {Math.round(report.comparison.deltaPct.bills)}%
            </p>
          ) : null}
        </div>
        <div className="kpi">
          <p className="kpi-label">{t('sales.summary.avg_bill', 'Avg bill')}</p>
          <p className="kpi-value">{formatINR(summary?.avgBill)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">{showCost ? t('reports.sales.margin', 'Margin') : t('reports.sales.items_sold', 'Items sold')}</p>
          <p className="kpi-value">{showCost ? (summary?.marginPct == null ? '—' : `${summary.marginPct.toFixed(1)}%`) : summary?.itemsSold ?? 0}</p>
        </div>
      </div>
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.by_hour', 'By hour')}</h2>
          <p className="shop-section-sub">{report.bestHour == null ? t('sales.empty_title', 'No sales in this period.') : t('reports.sales.best_hour_line', 'Busiest at {{hour}}.', { hour: clockLabel(report.bestHour) })}</p>
          <ColumnChart
            columns={hours.map((value, hour) => ({
              label: hour % 3 === 0 ? clockLabel(hour) : '',
              bars: [{ value }],
            }))}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.busy_days', 'By weekday')}</h2>
          <p className="shop-section-sub">{t('sales.summary.revenue', 'Revenue')}</p>
          <ColumnChart columns={week.map((day) => ({ label: day.label, bars: [{ value: day.value }] }))} />
        </Card>
      </div>
      {series.length > 0 ? (
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.by_day', 'Over the period')}</h2>
          <ColumnChart
            columns={series.map((point, index) => ({
              label: series.length > 14 && index % Math.ceil(series.length / 8) !== 0 ? '' : formatShortDay(point.date, prefs?.appLanguage),
              bars: [{ value: point.revenue }],
            }))}
          />
        </Card>
      ) : null}
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.payment_mix', 'How it was paid')}</h2>
          {summary.collections && Object.values(summary.collections).some(amount => amount > 0) ? <p className="shop-hint">{t('reports.sales.incl_collections', EN_FALLBACK['reports.sales.incl_collections'], { amount: formatINR(Object.values(summary.collections).reduce((sum, amount) => sum + amount, 0)) })}</p> : null}
          <ShareList
            rows={METHODS.map((method) => {
              const amount = summary?.byMethod?.[method.id] ?? 0;
              return { key: method.id, label: t(`pos.method.${method.id}`, method.label), pct: (amount / methodTotal) * 100, value: formatINR(amount) };
            })}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.by_category', 'Categories')}</h2>
          <ShareList
            rows={(report.byCategory ?? []).map((row) => ({
              key: row.category,
              label: `${labeledL1(row.category, (key) => t(key, key))}${showCost && row.marginPct != null ? ` · ${row.marginPct}% ${t('reports.sales.margin', 'Margin')}` : ''}`,
              pct: row.sharePct,
              value: formatINR(row.revenue),
            }))}
          />
        </Card>
      </div>
      <div className="kpi-grid">
        <div className="kpi"><p className="kpi-label">{t('reports.sales.items_per_bill_label', 'Items / bill')}</p><p className="kpi-value">{report.basket?.itemsPerBill?.toFixed(1) ?? '—'}</p></div>
        <div className="kpi"><p className="kpi-label">{t('reports.sales.bills_discounted', 'Discounted bills')}</p><p className="kpi-value">{report.basket?.discountedBills ?? 0}</p></div>
        <div className="kpi"><p className="kpi-label">{t('sale_detail.returns', 'Returns')}</p><p className="kpi-value">{formatINR(report.returns?.returnAmount)}</p></div>
        <div className="kpi"><p className="kpi-label">{t('sales.status_filter.voided', 'Voids')}</p><p className="kpi-value">{report.returns?.voids ?? 0}</p></div>
      </div>
      {showCost ? (
        <div className="kpi-grid">
          <div className="kpi"><p className="kpi-label">{t('reports.sales.gross_profit', 'Gross profit')}</p><p className="kpi-value">{formatINR(summary?.grossProfit)}</p></div>
          <div className="kpi"><p className="kpi-label">{uiText("Cost of goods")}</p><p className="kpi-value">{formatINR(summary?.cogs)}</p></div>
          <div className="kpi"><p className="kpi-label">{t('reports.sales.cash_in_drawer', 'Cash in drawer')}</p><p className="kpi-value">{formatINR(summary?.cashInDrawer)}</p></div>
          <div className="kpi"><p className="kpi-label">{t('bill.discount', 'Discounts')}</p><p className="kpi-value">{formatINR(summary?.discounts)}</p></div>
        </div>
      ) : null}
      {showCost && summary?.purchaseCostMovement && summary.purchaseCostMovement.count > 0 ? (
        <Card>
          <h2 className="shop-section-title">{t('gst.cost_movement_title', EN_FALLBACK['gst.cost_movement_title'])} ({summary.purchaseCostMovement.count})</h2>
          <dl className="grid gap-3">
            {(['inventory', 'consumed', 'total'] as const).map(key => <div key={key} className="flex flex-wrap items-baseline justify-between gap-3"><dt>{t(`gst.cost_movement_${key}`, EN_FALLBACK[`gst.cost_movement_${key}`])}</dt><dd>{formatINR(Number(summary.purchaseCostMovement![key]))}</dd></div>)}
          </dl>
          <p className="shop-hint">{t('gst.cost_movement_notice', EN_FALLBACK['gst.cost_movement_notice'])}</p>
        </Card>
      ) : null}
      {(report.inputMethods ?? []).length > 0 ? (
        <Card>
          <h2 className="shop-section-title">{t('reports.sales.input_methods', 'How bills were entered')}</h2>
          <ShareList
            rows={report.inputMethods.map((row) => ({
              key: row.method,
              label: t(`reports.sales.method_${row.method === 'manual' ? 'manual' : row.method === 'scan' ? 'scan' : row.method === 'voice' ? 'voice' : row.method}`, row.method),
              pct: summary?.bills ? (row.bills / summary.bills) * 100 : 0,
              value: t('reports.sales.bills_n', '{{n}} bills', { n: row.bills }),
            }))}
          />
        </Card>
      ) : null}
      <SalesInsights report={report} showCost={showCost}/>
    </>
  );
}

function StockView({ report, showCost }: { report: StockReport; showCost: boolean }) {
  const uiText = useUiText();
  const { t, prefs } = useShop();
  const onHand = report.onHand;
  const products = onHand?.products || 1;
  const movement = report.movementByDay ?? [];
  const statuses = [
    { key: 'OK', label: t('reports.stock.status_ok', 'In stock'), tone: 'is-ok' },
    { key: 'LOW', label: t('reports.stock.status_low', 'Low'), tone: 'is-warn' },
    { key: 'OUT', label: t('reports.stock.status_out', 'Out'), tone: 'is-danger' },
  ] as const;

  return (
    <>
      {report.limitedToDays ? <p className="party-meta">{t('activity.free_limit_title', 'Showing the last {{days}} days.', { days: report.limitedToDays })}</p> : null}
      <div className="kpi-grid">
        <div className="kpi"><p className="kpi-label">{t('reports.stock.products', 'Products')}</p><p className="kpi-value">{onHand?.products ?? 0}</p></div>
        <div className="kpi"><p className="kpi-label">{t('reports.stock.units', 'Units on hand')}</p><p className="kpi-value">{Math.round(onHand?.units ?? 0)}</p></div>
        <div className="kpi"><p className="kpi-label">{t('reports.stock.retail_value', 'Retail value')}</p><p className="kpi-value">{formatINR(onHand?.retailValue)}</p></div>
        {showCost ? <div className="kpi"><p className="kpi-label">{t('reports.stock.value_at_cost', 'Cost value')}</p><p className="kpi-value">{formatINR(onHand?.costValue)}</p></div> : null}
      </div>
      <div className="dash-columns">
        <Card>
          <h2 className="shop-section-title">{t('reports.stock.on_hand', 'Stock health')}</h2>
          <ShareList
            rows={statuses.map((status) => {
              const count = onHand?.byStatus?.[status.key]?.products ?? 0;
              return { key: status.key, label: status.label, pct: (count / products) * 100, value: String(count), tone: status.tone };
            })}
          />
        </Card>
        <Card>
          <h2 className="shop-section-title">{t('reports.stock.expiry', 'Expiring')}</h2>
          <div className="party-stats">
            <div className="party-stat"><span>{t('sales.period.7d', '7 days')}</span><b>{report.expiry?.within7?.batches ?? 0}</b></div>
            <div className="party-stat"><span>{t('sales.period.30d', '30 days')}</span><b>{report.expiry?.within30?.batches ?? 0}</b></div>
            <div className="party-stat"><span>{uiText("60 days")}</span><b>{report.expiry?.within60?.batches ?? 0}</b></div>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="shop-section-title">{t('reports.stock.movement', 'Movement')}</h2>
        <p className="chart-legend"><i /> {t('reports.stock.units_in', 'In')} <i className="is-ok" /> {t('reports.stock.units_sold', 'Sold')} <i className="is-danger" /> {t('reports.stock.units_adjusted', 'Adjusted')}</p>
        {movement.length === 0 ? <p className="party-meta">{uiText("No stock movement in this period.")}</p> : (
          <ColumnChart
            columns={movement.map((day, index) => ({
              label: movement.length > 14 && index % Math.ceil(movement.length / 8) !== 0 ? '' : formatShortDay(day.date, prefs?.appLanguage),
              bars: [
                { value: day.unitsAdjusted, tone: 'is-danger' },
                { value: day.unitsIn, tone: '' },
                { value: day.unitsSold, tone: 'is-ok' },
              ],
            }))}
          />
        )}
      </Card>
      <Card>
        <h2 className="shop-section-title">{showCost ? t('reports.stock.value_by_category', 'Value by category') : t('reports.stock.units_by_category', 'Units by category')}</h2>
        <ShareList
          rows={(report.byCategory ?? []).map((row) => ({
            key: row.category,
            label: labeledL1(row.category, (key) => t(key, key)),
            pct: (showCost ? row.costValue ?? 0 : row.units) / ((report.byCategory ?? []).reduce((total, category) => total + (showCost ? category.costValue ?? 0 : category.units), 0) || 1) * 100,
            value: showCost ? formatINR(row.costValue) : `${row.units} ${t('reports.stock.units', 'Units')}`,
          }))}
        />
      </Card>
      {(report.expiry?.items.length ?? 0) > 0 ? (
        <Card flush>
          <div className="card-intro">
            <h2 className="shop-section-title">{t('reports.stock.expiry', 'Batches nearing expiry')}</h2>
          </div>
          <div className="shop-list">
            {report.expiry?.items.map((item) => (
              <div key={`${item.productId}-${item.expiryDate}`} className="shop-list-row">
                <div className="shop-list-main">
                  <p className="shop-list-title">{item.name}</p>
                  <p className="shop-list-meta">{item.units} {item.unit} · {formatShortDay(item.expiryDate, prefs?.appLanguage)}</p>
                </div>
                <b>{item.daysRemaining}d</b>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      <StockInsights report={report} showCost={showCost}/>
    </>
  );
}

export function ReportsScreen() {
  const uiText = useUiText();
  const { api, shop, userId, perms, premium, prefs, hideCost, t } = useShop();
  const [salesPeriod, setSalesPeriod] = useState<(typeof SALES_PERIODS)[number]>('today');
  const [stockPeriod, setStockPeriod] = useState<(typeof STOCK_PERIODS)[number]>('7d');
  const [topBy, setTopBy] = useState<'quantity' | 'revenue'>('quantity');
  const [tab, setTab] = useState<'sales' | 'stock'>('sales');
  const period = tab === 'sales' ? salesPeriod : stockPeriod;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{scope:string;response:SpokenAnswer} | null>(null);
  const scope = `${userId}:${shop?.id}:${prefs?.voiceLanguage}:${prefs?.voiceFeedbackEnabled}`;
  const currentScope=useRef(scope);currentScope.current=scope;
  const shownAnswer=answer?.scope===scope?answer.response:null;
  useEffect(()=>{setQuestion('');setAnswer(null);setError(null);setAsking(false);},[scope]);
  const [error, setError] = useState<unknown>(null);
  const [asking, setAsking] = useState(false);
  const enabled = !!shop && perms.canSeeReports;
  const sales = useQuery({ queryKey: ['report-sales', shop?.id, salesPeriod], enabled: enabled && tab === 'sales', queryFn: () => api.getSalesReport(shop!.id, salesPeriod) });
  const stock = useQuery({ queryKey: ['report-stock', shop?.id, stockPeriod], enabled: enabled && tab === 'stock', queryFn: () => api.getStockReport(shop!.id, stockPeriod) });
  const top = useQuery({ queryKey: ['top', shop?.id, salesPeriod, premium ? topBy : 'quantity'], enabled: enabled && tab === 'sales', queryFn: () => api.getTopProducts(shop!.id, { period: salesPeriod, by: premium ? topBy : 'quantity', limit: 8 }) });

  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what={uiText("Reports are for the owner and managers.")} />;

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
        kicker={t('reports.title', 'Insights')}
        title={t('reports.title', 'Reports')}
        description={uiText("Sales and stock for the period you pick. Switch the view without losing the dates.")}
        actions={
          premium ? (
            <Button tone="ghost" onClick={exportCsv}>{t('reports.sales.export_csv', tab === 'sales' ? 'Sales CSV' : 'Stock movement CSV')}</Button>
          ) : <Button href="/shop/settings/subscription" tone="ghost">{t('reports.sales.export_csv', 'CSV')} · {t('subscription.status.active', 'Premium')}</Button>
        }
      />
      <div className="shop-toolbar">
        <div className="shop-seg" role="tablist" aria-label={uiText("Report")}>
          <button type="button" role="tab" aria-selected={tab === 'sales'} className={tab === 'sales' ? 'is-active' : undefined} onClick={() => setTab('sales')}>{t('reports.tab.sales', 'Sales')}</button>
          <button type="button" role="tab" aria-selected={tab === 'stock'} className={tab === 'stock' ? 'is-active' : undefined} onClick={() => setTab('stock')}>{t('reports.tab.stock', 'Stock')}</button>
        </div>
        <div className="pos-chips">
          {tab === 'sales' ? SALES_PERIODS.map(id => <Chip key={id} active={salesPeriod === id} onClick={() => setSalesPeriod(id)}>{periodChip(id, t)}</Chip>) : STOCK_PERIODS.map(id => <Chip key={id} active={stockPeriod === id} onClick={() => setStockPeriod(id)}>{periodChip(id, t)}</Chip>)}
        </div>
      </div>
      <Notice error={error} />
      {isPremiumError(activeError) ? <PremiumLock shopId={shop.id} feature="pos_reports" /> : null}
      {activeError && !isPremiumError(activeError) ? <Notice error={activeError} /> : null}
      {tab === 'sales' && sales.isLoading ? <Spinner label={uiText("Loading sales")} /> : null}
      {tab === 'stock' && stock.isLoading ? <Spinner label={uiText("Loading stock")} /> : null}
      {tab === 'sales' && sales.data && !isPremiumError(sales.error) ? <SalesView report={sales.data} showCost={showCost} /> : null}
      {tab === 'stock' && stock.data && !isPremiumError(stock.error) ? <StockView report={stock.data} showCost={showCost} /> : null}
      {tab === 'sales' ? (
        <Card>
          <div className="shop-toolbar">
            <h2 className="shop-section-title">{t('reports.sales.top_products', 'Top sellers')}</h2>
            {premium ? <div className="shop-seg">
              {(['quantity', 'revenue'] as const).map(by => <button key={by} type="button" aria-pressed={topBy === by} className={topBy === by ? 'is-active' : undefined} onClick={() => setTopBy(by)}>{t(`reports.sales.by_${by}`, by === 'quantity' ? 'Qty' : '₹')}</button>)}
            </div> : null}
          </div>
          {top.isLoading ? <Spinner /> : top.error ? <Notice error={top.error} /> : (
            <div className="grid gap-4">
              {(top.data?.products ?? []).map((product, index) => <div key={`${product.productId}-${product.name}`} className="flex flex-wrap justify-between gap-3">
                <div><strong>{index + 1}. {product.name}</strong><p className="shop-hint">{product.quantity} {product.unit} · {t('reports.sales.in_bills', 'in {{n}} bills', { n: product.bills })}{showCost && product.marginPct != null ? ` · ${product.marginPct}% ${t('reports.sales.margin', 'Margin')}` : ''}</p>
                {product.fiscalCorrectionNet ? <p className="shop-hint">{t('reports.sales.value_corrections', EN_FALLBACK['reports.sales.value_corrections'])}: {formatINR(product.fiscalCorrectionNet)}</p> : null}</div>
                <strong>{formatINR(product.revenue)}</strong>
              </div>)}
              {!top.data?.products.length ? <p className="shop-hint">{t('modal.analytics.no_data', 'No data yet')}</p> : null}
            </div>
          )}
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
            const requestedScope=scope;
            void api.ask(shop.id, text, prefs?.voiceLanguage ?? prefs?.appLanguage, prefs?.voiceFeedbackEnabled !== false).then(response=>{if(currentScope.current===requestedScope)setAnswer({scope:requestedScope,response});}).catch(caught=>{if(currentScope.current===requestedScope)setError(caught);}).finally(()=>{if(currentScope.current===requestedScope)setAsking(false);});
          }}
        >
          <Field label={t('modal.analytics.ask_placeholder', 'Ask about this shop')}>
            <textarea className={inputClass} value={question} onChange={(event) => setQuestion(event.target.value)} />
          </Field>
          {premium ? <Button type="submit" disabled={asking || !question.trim()}>{asking ? t('modal.analytics.analyzing','Analyzing your question...') : uiText('Ask')}</Button> : <PremiumLock shopId={shop.id} feature="analytics" />}
          {premium ? <VoiceCapture key={scope} disabled={asking} onRecorded={async recording=>{
            const requestedScope=scope;setAsking(true);setError(null);
            try {const response=await api.askVoice(shop.id,recording,prefs?.voiceLanguage ?? prefs?.appLanguage,prefs?.voiceFeedbackEnabled !== false);if(currentScope.current===requestedScope){setAnswer({scope:requestedScope,response});if(response.transcript)setQuestion(response.transcript);}}
            catch(caught){if(currentScope.current===requestedScope)setError(caught);throw caught;}
            finally{if(currentScope.current===requestedScope)setAsking(false);}
          }} /> : null}
          {shownAnswer ? <div><p>{shownAnswer.answer}</p><SpeechAudio base64={shownAnswer.ttsAudioBase64} label={t('brief.listen','Listen')} /></div> : null}
        </form>
      </Card>
    </div>
  );
}
