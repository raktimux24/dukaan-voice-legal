const SUB_UNITS: Record<string, { small: string; large: string; factor: number }> = {
  kg: { small: 'g', large: 'kg', factor: 1000 },
  g: { small: 'g', large: 'kg', factor: 1000 },
  L: { small: 'mL', large: 'L', factor: 1000 },
  mL: { small: 'mL', large: 'L', factor: 1000 },
};

export const UNITS = ['kg', 'g', 'L', 'mL', 'piece', 'packet', 'dozen', 'crate'] as const;

export const isWeightOrVolume = (unit: string) => unit in SUB_UNITS;

export const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function stepFor(unit: string): number {
  switch (unit) {
    case 'kg':
    case 'L':
      return 0.25;
    case 'g':
    case 'mL':
      return 50;
    default:
      return 1;
  }
}

export function defaultChips(unit: string, packSize?: number | null): number[] {
  let chips: number[];
  switch (unit) {
    case 'kg':
    case 'L':
      chips = [0.25, 0.5, 1, 2, 5];
      break;
    case 'g':
    case 'mL':
      chips = [100, 250, 500, 1000];
      break;
    default:
      chips = [1, 2, 5, 10];
  }
  if (packSize && packSize > 0 && !chips.includes(packSize)) chips = [...chips, packSize];
  return chips;
}

const trim = (n: number) => {
  const s = r3(n).toString();
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
};

export function formatQty(
  qty: number,
  unit: string,
  opts: { packSize?: number | null; packLabel?: string | null } = {},
): string {
  const pair = SUB_UNITS[unit];
  let text: string;
  if (pair && unit === pair.large && qty > 0 && qty < 1) {
    text = `${trim(qty * pair.factor)} ${pair.small}`;
  } else if (pair && unit === pair.small && qty >= pair.factor) {
    text = `${trim(qty / pair.factor)} ${pair.large}`;
  } else {
    text = `${trim(qty)} ${unit}`;
  }
  if (opts.packSize && opts.packSize > 0 && qty >= opts.packSize) {
    const packs = qty / opts.packSize;
    const label = opts.packLabel || 'pack';
    text += ` (${trim(packs)} ${label}${packs === 1 ? '' : 's'})`;
  }
  return text;
}
