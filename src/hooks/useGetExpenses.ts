import { useCallback, useEffect, useState } from 'react';

import { spreadsheetColumnIndexes } from '@/lib/constants';
import countOccurrences from '@/lib/countOccurrences';
import { Category, ExpenseRow, PaidBy } from '@/lib/types';

interface SheetsResponse {
  values: string[][];
}

const regexTotalCurrency = / [^ ]*$/;

const findSumRowIndex = (rows: string[][]): number => {
  return rows.findIndex((row) => row[0] === 'SUM');
};

const calculateYearMonthTotal = (rows: string[][], year: number, month: number): number => {
  const currentMonthExpenses = rows.filter((r) => {
    const rawDate = r[spreadsheetColumnIndexes.Date];
    if (rawDate) {
      const date = new Date(rawDate);
      if (year === date.getFullYear() && month === date.getMonth()) {
        return true;
      }
    }
    return false;
  });

  const currentMonthTotals = currentMonthExpenses.map((e) => e[spreadsheetColumnIndexes.Total]);

  const sum = currentMonthTotals.reduce((acc, current) => acc + +current.replace(/[^0-9]/g, ''), 0);

  return sum;
};

const useGetExpenses = (
  accessToken: string | null,
  spreadsheetId: string,
  range: string,
  rowsLimit: number,
) => {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paidBys, setPaidBys] = useState<PaidBy[]>([]);
  const [currency, setCurrency] = useState<string>('');

  const [sumRowIndex, setSumRowIndex] = useState<number | null>(null);

  const [currentMonthTotal, setCurrentMonthTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isReLoginNeeded, setIsReLoginNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        if (res.status === 401) setIsReLoginNeeded(true);
        throw new Error(`Error ${res.status} during expenses loading`);
      }

      const data: SheetsResponse = await res.json();

      const sri = findSumRowIndex(data.values);
      if (sri === -1) throw new Error("Can't find the SUM row.");
      setSumRowIndex(sri);

      const rowsBetweenHeaderAndSum = data.values.slice(1, sri);

      setCategories(
        Array.from(
          countOccurrences(rowsBetweenHeaderAndSum, spreadsheetColumnIndexes.Category),
          ([name, count]) => ({
            name,
            count,
          }),
        ),
      );
      setPaidBys(
        Array.from(
          countOccurrences(rowsBetweenHeaderAndSum, spreadsheetColumnIndexes.PaidBy),
          ([name, count]) => ({
            name,
            count,
          }),
        ),
      );

      setRows(
        data.values.slice(Math.max(0, sri - rowsLimit - 1), sri - 1).map((r, i) => ({
          rowIndex: sri - rowsLimit + i,
          date: r[spreadsheetColumnIndexes.Date]
            ? new Date(r[spreadsheetColumnIndexes.Date])
            : null,
          category: r[spreadsheetColumnIndexes.Category],
          total: r[spreadsheetColumnIndexes.Total],
          paidBy: r[spreadsheetColumnIndexes.PaidBy],
        })),
      );

      setCurrentMonthTotal(
        calculateYearMonthTotal(
          rowsBetweenHeaderAndSum,
          new Date().getFullYear(),
          new Date().getMonth(),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, range, rowsLimit, spreadsheetId]);

  useEffect(() => {
    if (accessToken) {
      loadExpenses();
    }
  }, [accessToken, loadExpenses]);

  useEffect(() => {
    if (rows.length) {
      const match = rows[0].total.match(regexTotalCurrency);
      if (match) {
        setCurrency(match[0].trim());
      }
    }
  }, [rows]);

  return {
    rows,
    categories,
    paidBys,
    currency,
    sumRowIndex,
    currentMonthTotal,
    isLoading,
    isReLoginNeeded,
    error,
    refetch: loadExpenses,
  };
};

export default useGetExpenses;
