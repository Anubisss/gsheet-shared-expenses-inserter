import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense, PaidBysByCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  date: z.date(),
  category: z.string().min(1, 'Required'),
  total: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Must be greater than 0',
    },
  ),
  paidBy: z.string().min(1, 'Required'),
});

interface Props {
  categoryOptions: string[];
  paidByOptions: string[];
  paidBysByCategory: PaidBysByCategory;
  onAddExpense: (values: Expense) => void;
  isDisabled: boolean;
  showLoadingIndicator: boolean;
  error: null | string;
}

const AddExpense: FC<Props> = ({
  categoryOptions,
  paidByOptions,
  paidBysByCategory,
  onAddExpense,
  isDisabled,
  showLoadingIndicator,
  error,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      category: '',
      total: '',
      paidBy: '',
    },
  });

  const watchCategory = form.watch('category');

  useEffect(() => {
    if (watchCategory && paidBysByCategory[watchCategory]) {
      const mostFrequentPaidBy = paidBysByCategory[watchCategory].sort(
        (a, b) => b.count - a.count,
      )[0];
      form.setValue('paidBy', mostFrequentPaidBy.name, { shouldValidate: true });
    }
  }, [watchCategory, paidBysByCategory, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddExpense(values);
    form.reset();
  };

  return (
    <div className={`p-2 md:p-4 ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>
      <h3 className="mb-3 text-center text-lg font-semibold">New expense</h3>
      {error && (
        <div className="my-4 rounded-md border border-red-500 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((co, i) => (
                      <SelectItem key={i} value={co}>
                        {co}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                  <Input type="text" inputMode="numeric" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paidBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid by</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select somebody" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paidByOptions.map((pbo, i) => (
                      <SelectItem key={i} value={pbo}>
                        {pbo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={showLoadingIndicator}
            className="mt-1 w-full cursor-pointer bg-cyan-500 py-5 text-lg font-bold text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 md:mt-5"
          >
            {showLoadingIndicator ? (
              <>
                <div className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Adding Expense...
              </>
            ) : (
              'Add New Expense'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddExpense;
