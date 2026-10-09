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

function drawBill(bill: ShareBillInput) {
  const labels = bill.labels ?? defaultLabels;
  const width = 420;
  const lineHeight = 22;
  const height = 220 + bill.lines.length * 48 + bill.payments.length * lineHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(2, 2);
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#1c1c1c';
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Space Grotesk", sans-serif';
  let y = 36;
  ctx.fillText(bill.shopName, width / 2, y);
  ctx.font = '13px Inter, sans-serif';
  ctx.fillStyle = '#4a4a4a';
  if (bill.address) {
    y += 20;
    ctx.fillText(bill.address, width / 2, y);
  }
  if (bill.phone) {
    y += 18;
    ctx.fillText(bill.phone, width / 2, y);
  }
  y += 22;
  ctx.strokeStyle = '#b9b3a8';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(24, y);
  ctx.lineTo(width - 24, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 24;
  ctx.fillStyle = '#1c1c1c';
  ctx.textAlign = 'left';
  ctx.fillText(`${labels.bill} #${bill.saleNumber}`, 24, y);
  ctx.textAlign = 'right';
  ctx.fillText(bill.when, width - 24, y);
  y += 28;
  for (const line of bill.lines) {
    ctx.textAlign = 'left';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillStyle = '#1c1c1c';
    ctx.fillText(line.name.slice(0, 32), 24, y);
    ctx.textAlign = 'right';
    ctx.fillText(line.amount, width - 24, y);
    y += 18;
    ctx.textAlign = 'left';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5c5c5c';
    ctx.fillText(line.detail, 24, y);
    y += 26;
  }
  ctx.strokeStyle = '#b9b3a8';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(24, y - 8);
  ctx.lineTo(width - 24, y - 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1c1c1c';
  ctx.font = '13px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(labels.subtotal, 24, y + 10);
  ctx.textAlign = 'right';
  ctx.fillText(bill.subtotal, width - 24, y + 10);
  y += 28;
  if (bill.discount) {
    ctx.textAlign = 'left';
    ctx.fillText(labels.discount, 24, y);
    ctx.textAlign = 'right';
    ctx.fillText(bill.discount, width - 24, y);
    y += 24;
  }
  ctx.font = '700 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(labels.total, 24, y);
  ctx.textAlign = 'right';
  ctx.fillText(bill.total, width - 24, y);
  y += 28;
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#4a4a4a';
  for (const payment of bill.payments) {
    ctx.textAlign = 'left';
    ctx.fillText(payment, 24, y);
    y += 18;
  }
  y += 10;
  ctx.textAlign = 'center';
  ctx.fillText(bill.footer || labels.thanks, width / 2, y);
  return canvas;
}

export async function shareBill(bill: ShareBillInput): Promise<'shared' | 'copied' | 'cancelled'> {
  const text = billPlainText(bill);
  const title = `${bill.shopName} · ${(bill.labels ?? defaultLabels).bill} #${bill.saleNumber}`;
  const canvas = drawBill(bill);
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
