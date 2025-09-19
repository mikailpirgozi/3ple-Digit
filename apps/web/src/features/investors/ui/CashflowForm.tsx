import type { CreateCashflowRequest } from '@/types/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const cashflowSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'], {
    required_error: 'Vyberte typ cashflow',
  }),
  amount: z.number()
    .min(0.01, 'Suma musí byť väčšia ako 0')
    .max(10000000, 'Suma je príliš veľká (max 10M €)'),
  date: z.string().min(1, 'Dátum je povinný'),
  note: z.string().optional(),
});

type CashflowFormData = z.infer<typeof cashflowSchema>;

interface CashflowFormProps {
  onSubmit: (data: CreateCashflowRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateCashflowRequest>;
}

export const CashflowForm: React.FC<CashflowFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const form = useForm<CashflowFormData>({
    resolver: zodResolver(cashflowSchema),
    defaultValues: {
      type: initialData?.type ?? 'DEPOSIT',
      amount: initialData?.amount ?? 0,
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: initialData?.note ?? '',
    },
  });

  const handleSubmit = (data: CashflowFormData) => {
    const submitData = {
      type: data.type,
      amount: Number(data.amount),
      date: new Date(data.date).toISOString(),
      note: data.note,
    } as CreateCashflowRequest;
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typ cashflow</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte typ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DEPOSIT">💰 Vklad</SelectItem>
                  <SelectItem value="WITHDRAWAL">💸 Výber</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suma (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Zadajte sumu"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dátum</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poznámka (voliteľné)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Zadajte poznámku"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
            Zrušiť
          </Button>
          <Button type="submit" disabled={isLoading} className="order-1 sm:order-2">
            {isLoading ? 'Ukladanie...' : 'Uložiť'}
          </Button>
        </div>
      </form>
    </Form>
  );
};