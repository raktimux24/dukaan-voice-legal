import type { PurchaseInvoice } from '../gst-types';
import { currentReportMonth, reportPeriod } from '../gst-core/report-period';

// Keep retained records readable when creation is turned off on the server.
export function purchaseAccess(settings?: { gstProtocol?: number; gstPurchasesAvailable?: boolean }, failed = false) {
  const readable = !!settings && settings.gstProtocol === 2 && typeof settings.gstPurchasesAvailable === 'boolean';
  return { readable, writable: readable && !failed && settings?.gstPurchasesAvailable === true };
}
export function invoicePeriod(from: string | null, through: string | null) {
  if (from && through) {
    try { reportPeriod(from, through); return { from, through }; } catch { /* Invalid links use this month. */ }
  }
  return currentReportMonth();
}
export function filterInvoices(rows: PurchaseInvoice[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return needle ? rows.filter(row => [row.number, row.snapshot.invoiceNumber, row.snapshot.supplier.name].some(value => value?.toLocaleLowerCase().includes(needle))) : rows;
}
export function reviewedCredit(ledger: { amount: string }[]) {
  return ledger.reduce((sum, row) => sum + Number(row.amount), 0);
}
