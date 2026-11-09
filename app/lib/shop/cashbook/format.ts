/** Display an exact decimal amount without rounding or changing ledger precision. */
export function cashNumber(value: string): string {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return '—';
  const integer = match[2].replace(/^0+(?=\d)/, '');
  const last = integer.slice(-3);
  const first = integer.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (match[1] ? '−' : '') + (first ? first + ',' : '') + last + '.' + (match[3] ?? '').padEnd(2, '0');
}
export function cashMoney(value: string): string {
  const amount = cashNumber(value);
  return amount === '—' ? amount : amount.startsWith('−') ? '−₹' + amount.slice(1) : '₹' + amount;
}
