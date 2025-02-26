import { Expense } from './types';

const convertExpenseToSheetRow = (
  expense: Expense,
  newRowIndex: number,
): (Date | string | number)[] => {
  return [
    expense.date ? expense.date : new Date(),
    expense.category,
    +expense.total,
    expense.paidBy,
    `=C${newRowIndex}/2`,
    `=E${newRowIndex}`,
    '',
    '',
    `=MONTH(A${newRowIndex})`,
    `=YEAR(A${newRowIndex})`,
  ];
};

export default convertExpenseToSheetRow;
