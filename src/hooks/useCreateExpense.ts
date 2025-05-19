import { useState } from 'react';

import convertExpenseToSheetRow from '@/lib/convertExpenseToSheetRow';
import convertToUserEnteredValue from '@/lib/convertToUserEnteredValue';
import { Expense } from '@/lib/types';

const useCreateExpense = (
  accessToken: string | null,
  spreadsheetId: string,
  sheetId: string,
  sumRowIndex: null | number,
  onSuccessfulCreate: () => void,
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = async (expense: Expense) => {
    if (!accessToken || !sumRowIndex) return;

    setIsCreating(true);
    setError(null);

    const insertNewRowIndex = sumRowIndex - 1;

    const cells = convertExpenseToSheetRow(expense, insertNewRowIndex + 1);

    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                insertDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: insertNewRowIndex,
                    endIndex: sumRowIndex,
                  },
                  inheritFromBefore: true,
                },
              },
              {
                updateCells: {
                  rows: [
                    {
                      values: cells.map((cell) => ({
                        userEnteredValue: convertToUserEnteredValue(cell),
                      })),
                    },
                  ],
                  fields: 'userEnteredValue',
                  start: {
                    sheetId: sheetId,
                    rowIndex: insertNewRowIndex,
                    columnIndex: 0,
                  },
                },
              },
            ],
          }),
        },
      );

      if (!res.ok) {
        throw new Error('Error occurred. Try again.');
      }

      onSuccessfulCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  return { createExpense, isCreating, error };
};

export default useCreateExpense;
