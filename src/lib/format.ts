export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Local date as YYYY-MM-DD (not toISOString, which is UTC and can be off by a day). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function currentMonth(): string {
  return today().slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: y === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function parseAmount(value: string): number | null {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned || (cleaned.match(/\./g)?.length ?? 0) > 1) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const CATEGORY_EMOJI: [string, string][] = [
  ['grocer', '🛒'],
  ['food', '🍔'],
  ['dining', '🍽️'],
  ['restaurant', '🍽️'],
  ['coffee', '☕'],
  ['travel', '✈️'],
  ['transport', '🚗'],
  ['shopping', '🛍️'],
  ['entertainment', '🎬'],
  ['bill', '🧾'],
  ['utilit', '💡'],
  ['health', '💊'],
];

export function categoryEmoji(category: string): string {
  const c = category.toLowerCase();
  return CATEGORY_EMOJI.find(([key]) => c.includes(key))?.[1] ?? '💳';
}
