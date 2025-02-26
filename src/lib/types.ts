export interface Expense {
  date: Date | null;
  category: string;
  total: string;
  paidBy: string;
}

export interface ExpenseRow extends Expense {
  rowIndex: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface PaidBy {
  name: string;
  count: number;
}
