'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { downloadText } from '../../../lib/shop/csv';
import { formatINR } from '../../../lib/shop/money';
import { useShop } from '../context';
import { Button, Card, Field, NoAccess, Notice, PremiumLock, Spinner, inputClass, isPremiumError } from '../ui';

const PERIODS = ['today', 'week', 'month', 'year'] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function Facts({ data }: { data: unknown }) {
  const record = asRecord(data);
  if (!record) return null;
  return (
    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
      {Object.entries(record).map(([key, value]) => (
        <div key={key}>
          <dt className="text-xs uppercase text-faint">{key.replaceAll('_', ' ')}</dt>
          <dd>{typeof value === 'number' ? ( /revenue|total|profit|discount|value|spend/i.test(key) ? formatINR(value) : value) : typeof value === 'string' || typeof value === 'boolean' ? String(value) : Array.isArray(value) ? `${value.length} rows` : '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ReportsScreen() {
  const { api, shop, perms, premium, prefs } = useShop();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('week');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [asking, setAsking] = useState(false);
  const enabled = !!shop && perms.canSeeReports;
  const sales = useQuery({ queryKey: ['report-sales', shop?.id, period], enabled, queryFn: () => api.getSalesReport(shop!.id, period) });
  const stock = useQuery({ queryKey: ['report-stock', shop?.id, period], enabled, queryFn: () => api.getStockReport(shop!.id, period) });
  const top = useQuery({ queryKey: ['top', shop?.id, period], enabled: enabled && premium, queryFn: () => api.getTopProducts(shop!.id, { period }) });

  if (!shop) return <Spinner />;
  if (!perms.canSeeReports) return <NoAccess what="Reports are for the owner and managers." />;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Reports</h1>
        {premium ? (
          <Button tone="ghost" onClick={() => void api.stockCsv(shop.id, period).then((csv) => downloadText(`stock-${period}.csv`, csv)).catch(setError)}>Stock movement CSV</Button>
        ) : <Button href={`/account?shopId=${shop.id}`}>Premium CSV</Button>}
      </div>
      <div className="flex gap-2">
        {PERIODS.map((item) => <Button key={item} tone={period === item ? 'primary' : 'ghost'} onClick={() => setPeriod(item)}>{item}</Button>)}
      </div>
      <Notice error={error ?? sales.error ?? stock.error} />
      {isPremiumError(sales.error) || isPremiumError(stock.error) || isPremiumError(error) ? <PremiumLock shopId={shop.id} feature="pos_reports" /> : null}
      <Card>
        <h2 className="font-semibold">Sales</h2>
        {sales.isLoading ? <Spinner /> : <Facts data={sales.data?.summary ?? sales.data} />}
      </Card>
      <Card>
        <h2 className="font-semibold">Stock</h2>
        {stock.isLoading ? <Spinner /> : <Facts data={stock.data?.summary ?? stock.data} />}
      </Card>
      {premium ? (
        <Card>
          <h2 className="font-semibold">Top products</h2>
          {(top.data?.products ?? []).map((product) => (
            <p key={`${product.productId}-${product.name}`} className="mt-2 flex justify-between"><span>{product.name}</span><span>{formatINR(product.revenue)}</span></p>
          ))}
        </Card>
      ) : <PremiumLock shopId={shop.id} feature="pos_reports" />}
      <Card>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const text = question.trim();
            if (!text) return;
            if (!premium) return;
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
