import { api } from './api';
import { notify } from './confirm';
import { currentMonth } from './format';

/**
 * After saving an expense, tell the user if it pushed its category (or the whole
 * monthly budget) near or over the limit. Only checks the current month, and never
 * throws: a failed check must not look like a failed save.
 */
export async function alertAfterSave(expense: { category: string; date: string }) {
  if (expense.date.slice(0, 7) !== currentMonth()) return;
  try {
    const summary = await api.summary();
    const relevant = summary.alerts.filter((a) => a.category === expense.category || a.category === null);
    if (!relevant.length) return;
    const over = relevant.some((a) => a.level === 'over');
    notify(over ? 'Over budget' : 'Heads up', relevant.map((a) => a.message).join('\n\n'));
  } catch {
    // Ignore: the expense is already saved.
  }
}
