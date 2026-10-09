export type ShareBillInput = {
  shopName: string;
  address?: string | null;
  phone?: string | null;
  saleNumber: number;
  when: string;
  lines: { name: string; detail: string; amount: string }[];
  subtotal: string;
  discount?: string | null;
  total: string;
  payments: string[];
  footer?: string | null;
  labels?: { bill: string; subtotal: string; discount: string; total: string; thanks: string };
};

const defaultLabels = { bill: 'Bill', subtotal: 'Subtotal', discount: 'Discount', total: 'Total', thanks: 'Thank you' };

export function billPlainText(bill: ShareBillInput) {
  const labels = bill.labels ?? defaultLabels;
  const rows = [
    bill.shopName,
    bill.address || null,
    bill.phone || null,
    '',
    `${labels.bill} #${bill.saleNumber}`,
    bill.when,
    '',
    ...bill.lines.flatMap((line) => [line.name, `${line.detail}  ${line.amount}`]),
    '',
    `${labels.subtotal}  ${bill.subtotal}`,
    bill.discount ? `${labels.discount}  ${bill.discount}` : null,
    `${labels.total}  ${bill.total}`,
    ...bill.payments,
    '',
    bill.footer || labels.thanks,
  ];
  return rows.filter((row) => row != null).join('\n');
}

export type BillImageLayout = { height: number; commands: Array<
  { kind: 'text'; text: string; x: number; y: number; font: string; color: string; align: CanvasTextAlign } |
  { kind: 'rule'; y: number }
> };

/** Wrap at words, splitting oversized tokens only at grapheme boundaries. */
export function wrapBillText(text: string, width: number, measure: (text: string) => number): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      if (!word) continue;
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      if (measure(word) <= width) { line = word; continue; }
      for (const { segment } of segmenter.segment(word)) {
        if (line && measure(line + segment) > width) { lines.push(line); line = ''; }
        line += segment;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Measure all content before sizing the bitmap; names and translated labels are never truncated. */
export function billImageLayout(bill: ShareBillInput, measure: (text: string, font: string) => number): BillImageLayout {
  const labels = bill.labels ?? defaultLabels;
  const commands: BillImageLayout['commands'] = [];
  const left = 24, right = 396, content = right - left;
  let y = 24;
  const block = (text: string, font: string, lineHeight: number, color = '#1c1c1c', align: CanvasTextAlign = 'left', x = left, width = content, top = y) => {
    const lines = wrapBillText(text, width, value => measure(value, font));
    lines.forEach((value, index) => commands.push({ kind: 'text', text: value, x, y: top + index * lineHeight, font, color, align }));
    return lines.length * lineHeight;
  };
  const full = (text: string, font: string, lineHeight: number, color = '#1c1c1c', align: CanvasTextAlign = 'left') => {
    y += block(text, font, lineHeight, color, align, align === 'center' ? 210 : left);
  };
  const row = (label: string, value: string, font = '13px Inter, sans-serif', lineHeight = 21) => {
    const column = (content - 16) / 2;
    const a = block(label, font, lineHeight, '#1c1c1c', 'left', left, column);
    const b = block(value, font, lineHeight, '#1c1c1c', 'right', right, column);
    y += Math.max(a, b) + 6;
  };
  const rule = () => { y += 10; commands.push({ kind: 'rule', y }); y += 18; };
  full(bill.shopName, '700 22px "Space Grotesk", sans-serif', 29, '#1c1c1c', 'center');
  for (const text of [bill.address, bill.phone]) if (text) full(text, '13px Inter, sans-serif', 21, '#4a4a4a', 'center');
  rule();
  row(`${labels.bill} #${bill.saleNumber}`, bill.when);
  y += 8;
  for (const line of bill.lines) {
    full(line.name, '600 14px Inter, sans-serif', 22);
    row(line.detail, line.amount, '12px Inter, sans-serif', 20);
    y += 8;
  }
  rule();
  row(labels.subtotal, bill.subtotal);
  if (bill.discount) row(labels.discount, bill.discount);
  row(labels.total, bill.total, '700 18px "Space Grotesk", sans-serif', 27);
  y += 8;
  for (const payment of bill.payments) full(payment, '12px Inter, sans-serif', 20, '#4a4a4a');
  y += 14;
  full(bill.footer || labels.thanks, '12px Inter, sans-serif', 20, '#4a4a4a', 'center');
  return { height: Math.ceil(y + 24), commands };
}

export function renderBillImage(bill: ShareBillInput) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const layout = billImageLayout(bill, (text, font) => { ctx.font = font; return ctx.measureText(text).width; });
  canvas.width = 840;
  canvas.height = layout.height * 2;
  ctx.scale(2, 2);
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, 420, layout.height);
  ctx.textBaseline = 'top';
  for (const command of layout.commands) {
    if (command.kind === 'rule') {
      ctx.strokeStyle = '#b9b3a8'; ctx.setLineDash([3, 3]); ctx.beginPath();
      ctx.moveTo(24, command.y); ctx.lineTo(396, command.y); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.font = command.font; ctx.fillStyle = command.color; ctx.textAlign = command.align;
      ctx.fillText(command.text, command.x, command.y);
    }
  }
  return canvas;
}

export async function shareBill(bill: ShareBillInput): Promise<'shared' | 'copied' | 'cancelled'> {
  const text = billPlainText(bill);
  const title = `${bill.shopName} · ${(bill.labels ?? defaultLabels).bill} #${bill.saleNumber}`;
  const canvas = renderBillImage(bill);
  const blob = canvas
    ? await new Promise<Blob | null>((resolve) => canvas.toBlob((file) => resolve(file), 'image/png'))
    : null;
  const file = blob ? new File([blob], `bill-${bill.saleNumber}.png`, { type: 'image/png' }) : null;
  try {
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return 'shared';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return 'cancelled';
  }
  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-${bill.saleNumber}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return 'copied';
}
