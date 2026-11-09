export type Expense = {
  id: number;
  merchant: string;
  charge_name: string | null;
  amount: number;
  currency: string;
  category: string;
  date: string; // YYYY-MM-DD
  payment_method: string | null;
  notes: string | null;
  has_receipt: boolean;
};

export type ExpenseInput = {
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  charge_name?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  receipt_token?: string | null;
};

export type ScannedField = 'merchant' | 'amount' | 'currency' | 'category' | 'date';

/** Result of POST /scan-receipt: extracted fields to review, nothing saved yet. */
export type ScannedReceipt = {
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  source: 'ai' | 'ocr';
  missing: ScannedField[];
  receipt_token: string;
};

export type Budget = {
  amount: number;
  currency: string;
};

export type BudgetStatus = 'good' | 'warning' | 'over_budget';

export type CategoryBudget = {
  category: string;
  amount: number;
};

/** A category limit with this month's spending against it. */
export type CategoryBudgetStatus = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percent_used: number;
  status: BudgetStatus;
};

export type BudgetAlert = {
  level: 'warning' | 'over';
  category: string | null; // null = the overall monthly budget
  message: string;
};

export type Trends = {
  currency: string;
  monthly_budget: number;
  months: { month: string; total_spent: number }[];
};

export type Summary = {
  month: string; // YYYY-MM
  monthly_budget: number;
  currency: string;
  total_spent: number;
  remaining: number;
  percent_used: number;
  status: BudgetStatus;
  advice: string;
  expense_count: number;
  category_totals: Record<string, number>;
  category_budgets: CategoryBudgetStatus[];
  alerts: BudgetAlert[];
  other_currency_totals: Record<string, number>;
  insights: string[];
  recent_expenses: Expense[];
};

export type ExpenseFilters = {
  month?: string;
  category?: string;
  q?: string;
};

export type Health = {
  status: string;
  ai_enabled: boolean;
};
