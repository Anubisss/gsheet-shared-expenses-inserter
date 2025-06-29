import { FC } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sharedExpensesTableColumnNames } from '@/lib/constants';
import { ExpenseRow } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface Props {
  columnNames: string[];
  rows: ExpenseRow[];
  lastExpensesCount: number;
  showSkeletonRows: boolean;
  footerRowContent: string;
}

const SharedExpensesTable: FC<Props> = ({
  columnNames,
  rows,
  lastExpensesCount,
  showSkeletonRows,
  footerRowContent,
}) => {
  return (
    <div className="md:p-4">
      <h3 className="mb-3 text-center text-lg font-semibold">Last {lastExpensesCount} expenses</h3>
      <Table className="w-full">
        <TableHeader className="bg-cyan-100">
          <TableRow>
            {columnNames.map((cn, i) => (
              <TableHead key={i} className="font-bold text-black">
                {cn}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeletonRows &&
            Array.from({ length: lastExpensesCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columnNames.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-5" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!showSkeletonRows &&
            rows.map((r, ri) => (
              <TableRow key={ri}>
                <TableCell>{r.rowIndex}</TableCell>
                <TableCell>{r.date ? r.date.toDateString() : ''}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.total}</TableCell>
                <TableCell>{r.paidBy}</TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={sharedExpensesTableColumnNames.length}>
              {footerRowContent}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default SharedExpensesTable;
