import type { AuditLogEntry, InventoryItem } from './types';

function escapeCsv(value: unknown) {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function row(values: unknown[]) {
  return values.map(escapeCsv).join(',');
}

export function inventoryCsv(items: InventoryItem[], hideCost: boolean) {
  const header = hideCost
    ? ['Name', 'Category', 'Unit', 'Quantity', 'Stock Status', 'Min Stock', 'Selling Price', 'Barcode', 'Last Updated']
    : ['Name', 'Category', 'Unit', 'Quantity', 'Stock Status', 'Min Stock', 'Purchase Price', 'Selling Price', 'Barcode', 'Last Updated'];
  const rows = items.map((item) => {
    const base = [
      item.product.name,
      item.product.category,
      item.product.unit,
      item.quantity,
      item.stockStatus,
      item.product.minStockLevel,
    ];
    const prices = hideCost
      ? [item.product.sellingPrice ?? '']
      : [item.product.purchasePrice ?? '', item.product.sellingPrice ?? ''];
    return row([...base, ...prices, item.product.barcode ?? '', item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN') : '']);
  });
  return [row(header), ...rows].join('\n');
}

export function auditCsv(logs: AuditLogEntry[]) {
  const header = row(['Date', 'User', 'Action Type', 'Input Method', 'Description', 'Confidence']);
  const rows = logs.map((log) =>
    row([
      new Date(log.createdAt).toLocaleString('en-IN'),
      log.userName,
      log.actionType,
      log.inputMethod,
      log.description,
      log.confidence ?? '',
    ]),
  );
  return [header, ...rows].join('\n');
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
