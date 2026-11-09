import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type {
  Budget,
  Expense,
  ExpenseFilters,
  ExpenseInput,
  Health,
  ScannedReceipt,
  Summary,
} from './types';

const API_PORT = 8000;

/**
 * Where the FastAPI backend lives.
 * 1. EXPO_PUBLIC_API_URL if set (e.g. a deployed server).
 * 2. On web, the same host the page was served from.
 * 3. On a device/emulator, the IP of the computer running `expo start`
 *    (so a physical phone on the same Wi-Fi reaches your laptop, not itself).
 */
export function getApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:${API_PORT}`;
  }

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${API_PORT}`;

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://127.0.0.1:${API_PORT}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function describeDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  // FastAPI validation errors: [{ loc: [...], msg: "..." }]
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : null;
        return field ? `${field}: ${d.msg}` : d?.msg;
      })
      .filter(Boolean)
      .join('\n');
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init?.timeoutMs ?? 15000);
  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, { ...init, signal: controller.signal });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(
      timedOut
        ? 'The server took too long to respond.'
        : `Can't reach the Budget Buddy server at ${getApiUrl()}. Is it running?`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = describeDetail(body?.detail) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

function json(method: string, data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

function query(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`).join('&');
}

/** Builds multipart form data that works on both native (file URI) and web (Blob). */
async function imageForm(uri: string, mimeType = 'image/jpeg'): Promise<FormData> {
  const form = new FormData();
  const ext = mimeType.split('/')[1] ?? 'jpg';
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('receipt', blob, `receipt.${ext}`);
  } else {
    // React Native's FormData accepts this shape for file uploads.
    form.append('receipt', { uri, name: `receipt.${ext}`, type: mimeType } as unknown as Blob);
  }
  return form;
}

export const api = {
  health: () => request<Health>('/health', { timeoutMs: 5000 }),

  summary: (month?: string) => request<Summary>(`/summary${query({ month })}`),

  categories: () => request<string[]>('/categories'),

  listExpenses: (filters: ExpenseFilters = {}) =>
    request<Expense[]>(`/expenses${query({ ...filters, limit: '500' })}`),
  getExpense: (id: number) => request<Expense>(`/expenses/${id}`),
  createExpense: (input: ExpenseInput) => request<Expense>('/expenses', json('POST', input)),
  updateExpense: (id: number, input: Partial<ExpenseInput>) =>
    request<Expense>(`/expenses/${id}`, json('PATCH', input)),
  deleteExpense: (id: number) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  receiptUrl: (id: number) => `${getApiUrl()}/expenses/${id}/receipt`,

  getBudget: () => request<Budget>('/budget'),
  setBudget: (budget: Budget) => request<Budget>('/budget', json('PUT', budget)),

  /** Reads a receipt without saving; confirm by passing receipt_token to createExpense. */
  scanReceipt: async (uri: string, mimeType?: string) =>
    request<ScannedReceipt>('/scan-receipt', {
      method: 'POST',
      body: await imageForm(uri, mimeType),
      timeoutMs: 60000,
    }),

  askAssistant: (question: string) =>
    request<{ question: string; response: string }>(
      '/ai-assistant',
      { ...json('POST', { question }), timeoutMs: 60000 },
    ),
};
