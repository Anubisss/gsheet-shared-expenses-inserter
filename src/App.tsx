import { useEffect, useMemo } from 'react';

import AddExpense from './components/AddExpense';
import SharedExpensesTable from './components/SharedExpensesTable';
import { Button } from './components/ui/button';
import useCreateExpense from './hooks/useCreateExpense';
import useGetExpenses from './hooks/useGetExpenses';
import useLogin from './hooks/useLogin';
import { EXPENSES_TABLE_RANGE, SHEET_ID, SPREADSHEET_ID } from './lib/config';
import { lastExpensesCount, sharedExpensesTableColumnNames } from './lib/constants';
import getSpreadsheetUrl from './lib/getSpreadsheetUrl';
import { Expense } from './lib/types';

const getCurrentMonthTotalText = (total: number, currency: string): string => {
  const currentDate = new Date();
  const currentMonthNameLong = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    currentDate,
  );
  return `${currentMonthNameLong} total: ${new Intl.NumberFormat().format(total)} ${currency}`;
};

const App = () => {
  const { accessToken, login, clearAccessToken } = useLogin();
  const {
    rows,
    categories,
    paidBys,
    currency,
    sumRowIndex,
    currentMonthTotal,
    isLoading,
    isReLoginNeeded,
    error,
    refetch: refetchExpenses,
    paidBysByCategory,
  } = useGetExpenses(accessToken, SPREADSHEET_ID, EXPENSES_TABLE_RANGE, lastExpensesCount);

  const {
    createExpense,
    isCreating,
    error: createErrorMessage,
  } = useCreateExpense(accessToken, SPREADSHEET_ID, SHEET_ID, sumRowIndex, async () => {
    await refetchExpenses();
  });

  useEffect(() => {
    if (accessToken && isReLoginNeeded) {
      clearAccessToken();
    }
  }, [accessToken, clearAccessToken, isReLoginNeeded]);

  const handleAddExpense = async (expense: Expense) => {
    await createExpense(expense);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const sortedCategoryNames = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .map((c) => c.name),
    [categories],
  );
  const sortedPaidBys = useMemo(
    () =>
      paidBys
        .slice()
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .map((pb) => pb.name),
    [paidBys],
  );

  const spreadsheetUrl = getSpreadsheetUrl(SPREADSHEET_ID, SHEET_ID);

  return (
    <div className="min-h-screen md:bg-cyan-50 md:p-6">
      <div className="mx-auto max-w-2xl bg-white md:rounded-lg md:border md:border-cyan-500 md:p-6 md:shadow">
        <h1 className="mt-3 mb-2 text-center text-2xl font-bold md:mt-0">
          Shared Expenses
          {accessToken && (
            <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer" className="ml-2">
              📄
            </a>
          )}
        </h1>
        {accessToken ? (
          <>
            {error && (
              <div className="mt-4 rounded-md border border-red-500 bg-red-100 p-3 text-red-700">
                {error}
              </div>
            )}
            {!error && (
              <>
                <div className="mb-3 md:mb-5">
                  <SharedExpensesTable
                    columnNames={sharedExpensesTableColumnNames}
                    rows={rows}
                    lastExpensesCount={lastExpensesCount}
                    showSkeletonRows={isLoading}
                    footerRowContent={getCurrentMonthTotalText(currentMonthTotal, currency)}
                  />
                </div>
                <div className="md:my-6 md:border-t md:border-cyan-500"></div>
                <AddExpense
                  categoryOptions={sortedCategoryNames}
                  paidByOptions={sortedPaidBys}
                  paidBysByCategory={paidBysByCategory}
                  onAddExpense={handleAddExpense}
                  isDisabled={isLoading}
                  showLoadingIndicator={isCreating}
                  error={createErrorMessage}
                />
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => login()}
              type="submit"
              className="mt-1 cursor-pointer bg-cyan-500 py-5 text-center text-lg font-bold text-white hover:bg-cyan-400 md:w-full"
            >
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
      <footer className="mx-auto mt-8 mb-5 text-center text-sm">
        <a
          href="https://github.com/Anubisss/gsheet-shared-expenses-inserter"
          className="text-gray-500 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          gsheet-shared-expenses-inserter
        </a>
      </footer>
    </div>
  );
};

export default App;
