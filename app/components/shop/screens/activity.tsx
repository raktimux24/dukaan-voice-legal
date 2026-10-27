'use client';

import { useGstText as useUiText } from "../gst-ui";

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auditCsv, downloadText } from '../../../lib/shop/csv';
import { useShopDates } from '../use-shop-dates';
import type { AuditLogEntry } from '../../../lib/shop/types';
import { useShop } from '../context';
import { Button, Chip, Notice, PageHeader, Spinner } from '../ui';

function activityFilterLabel(id: string, fallback: string, t: (key: string, fallback: string) => string) {
  if (id === 'all') return t('activity.filter_all', fallback);
  if (id === 'sales') return t('activity.filter_sales', fallback);
  if (id === 'stock') return t('activity.filter_stock', fallback);
  if (id === 'today') return t('activity.filter_today', fallback);
  return fallback;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sales', label: 'Sales' },
  { id: 'stock', label: 'Stock' },
  { id: 'today', label: 'Today' },
] as const;

const ACTION_KEYS: Record<string, [string, string]> = {
  product_bulk_edit:['bulk.title','Bulk product editing'],
  barcode_generated:['barcodes.title','Product barcodes'],
  barcode_replaced:['barcodes.title','Product barcodes'],
  party_import:['imports.source','File import'],
  inventory_import:['imports.source','File import'],
  sale: ['activity.filter_sales', 'Sale'],
  sale_created: ['activity.filter_sales', 'Sale'],
  sale_void: ['sales.status_filter.voided', 'Sale voided'],
  sale_voided: ['sales.status_filter.voided', 'Sale voided'],
  sale_returned: ['sale_detail.returns', 'Sale returned'],
  sale_return: ['sale_detail.returns', 'Sale returned'],
  stock_adjusted: ['reports.stock.units_adjusted', 'Stock adjusted'],
};

function dayLabel(iso: string, t: (key: string, fallback: string) => string, language: string | undefined) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return t('brief.earlier', 'Earlier');
  const today = new Date();
  const same = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
  if (same(date, today)) return t('common.time_today', 'Today');
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (same(date, yesterday)) return t('common.time_yesterday', 'Yesterday');
  const locale = language && language !== 'hinglish' ? `${language}-IN` : 'en-IN';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function tone(action: string) {
  if (action.includes('void') || action.includes('return') || action.includes('deleted') || action.includes('removed')) return 'is-danger';
  if (action.startsWith('sale')) return 'is-sale';
  if (action.startsWith('stock') || action.startsWith('batch') || action.startsWith('product')) return 'is-stock';
  return '';
}

function groups(logs: AuditLogEntry[], t: (key: string, fallback: string) => string, language: string | undefined) {
  const days: { label: string; logs: AuditLogEntry[] }[] = [];
  for (const log of logs) {
    const label = dayLabel(log.createdAt, t, language);
    const last = days[days.length - 1];
    if (last?.label === label) last.logs.push(log);
    else days.push({ label, logs: [log] });
  }
  return days;
}

export function ActivityScreen() {
  const uiText = useUiText();
  const { formatTime } = useShopDates();
  const { api, shop, prefs, t } = useShop();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [error, setError] = useState<unknown>(null);
  const logs = useQuery({
    queryKey: ['audit', shop?.id, filter],
    enabled: !!shop,
    queryFn: () => api.getAudit(shop!.id, filter),
  });

  if (!shop) return <Spinner />;
  const days = groups(logs.data?.logs ?? [], t, prefs?.appLanguage);

  return (
    <div className="shop-page">
      <PageHeader
        kicker={t('reports.title', 'Insights')}
        title={t('activity.title', 'Activity')}
        description={uiText("Every stock change, sale, void, and staff change in this shop.")}
        actions={
          <Button
            tone="ghost"
            onClick={() => {
              setError(null);
              void api.getAllAudit(shop.id).then((rows) => downloadText(`activity-${shop.name}.csv`, auditCsv(rows, prefs?.appLanguage))).catch(setError);
            }}
          >
            {t('reports.sales.export_csv', 'Export CSV')}
          </Button>
        }
      />
      <div className="pos-chips">
        {FILTERS.map((item) => <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>{activityFilterLabel(item.id, item.label, t)}</Chip>)}
      </div>
      <Notice error={error ?? logs.error} />
      {logs.data?.limitedToDays ? <p className="party-meta">{t('activity.free_limit_title', 'Showing the last {{days}} days.', { days: logs.data.limitedToDays })}</p> : null}
      {logs.isLoading ? <Spinner label={uiText("Loading activity")} /> : null}
      {!logs.isLoading && days.length === 0 ? <p className="shop-list-empty">{t('activity.empty_title', 'Nothing recorded for this filter.')}</p> : null}
      {days.map((day) => (
        <section key={day.label}>
          <h2 className="timeline-day">{day.label}</h2>
          <ol className="timeline">
            {day.logs.map((log) => (
              <li key={log.id} className={`timeline-item ${tone(log.actionType)}`}>
                <div>
                  <p className="timeline-title">{log.inputMethod==='import'?t('imports.source','File import'):log.actionType.startsWith('opening_')?t('activity.'+log.actionType, ''):log.actionType==='document_branding_updated'?t('documents.title','Branding & formats'):ACTION_KEYS[log.actionType] ? t(ACTION_KEYS[log.actionType][0], ACTION_KEYS[log.actionType][1]) : log.actionType.replaceAll('_', ' ')}</p>
                  <p className="timeline-meta">{log.actionType.startsWith('opening_')?t('activity.'+log.actionType, ''):log.actionType==='document_branding_updated'?t('documents.activity','',{layout:t('documents.'+String(log.payload?.layout??'receipt'),'')}):(['inventory_import','party_import'].includes(log.actionType)||log.inputMethod==='import'&&!!log.payload?.importId)?t('imports.activity','Imported {{name}} (row {{row}})',{name:String(log.payload?.productName??log.payload?.partyName??(log.payload?.identity as {name?:string}|undefined)?.name??''),row:Number(log.payload?.sourceRow??0)}):log.actionType==='product_bulk_edit'?t('bulk.activity','Bulk edited {{name}} · batch {{batch}}',{name:String(log.payload?.productName??''),batch:Number(log.payload?.batch??1)}):['barcode_generated','barcode_replaced'].includes(log.actionType)?t(log.actionType==='barcode_generated'?'barcodes.activity_generated':'barcodes.activity_replaced',log.description??'',{name:String(log.payload?.productName??'')}):log.description}</p>
                  <p className="timeline-meta">{log.userName} · {log.inputMethod==='import'?t('imports.source','File import'):log.inputMethod==='manual'?t('activity.filter_manual','Manual'):log.inputMethod==='voice'?t('activity.filter_voice','Voice'):log.inputMethod}</p>
                </div>
                <time className="timeline-when" dateTime={log.createdAt}>{formatTime(log.createdAt)}</time>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
