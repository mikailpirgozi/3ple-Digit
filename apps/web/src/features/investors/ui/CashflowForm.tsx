import type { CreateCashflowRequest } from '@/types/api';
import {
  Button,
  DatePicker,
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
import type { ControllerRenderProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
const cashflowSchema = z.object({
  date: z.date({
    required_error: 'Dátum je povinný',
  }),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'], {
    required_error: 'Typ je povinný',
  }),
  amount: z.number().positive('Suma musí byť kladná'),
  note: z.string().optional(),
});

type CashflowFormData = z.infer<typeof cashflowSchema>;

interface CashflowFormProps {
  investorId: string;
  onSubmit: (data: CreateCashflowRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateCashflowRequest>;
}

export const CashflowForm: React.FC<CashflowFormProps> = ({
  investorId,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const form = useForm<CashflowFormData>({
    resolver: zodResolver(cashflowSchema),
    defaultValues: {
      ...initialData,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });

  const handleFormSubmit = (data: CashflowFormData) => {
    onSubmit({
      investorId,
      ...data,
      amount: Number(data.amount),
      date: data.date.toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }: { field: ControllerRenderProps<CashflowFormData, 'date'> }) => (
              <FormItem>
                <FormLabel>Dátum</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onSelect={field.onChange}
                    placeholder="Vyberte dátum"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: ControllerRenderProps<CashflowFormData, 'type'> }) => (
              <FormItem>
                <FormLabel>Typ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Vklad</SelectItem>
                    <SelectItem value="WITHDRAWAL">Výber</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }: { field: ControllerRenderProps<CashflowFormData, 'amount'> }) => (
            <FormItem>
              <FormLabel>Suma (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }: { field: ControllerRenderProps<CashflowFormData, 'note'> }) => (
            <FormItem>
              <FormLabel>Poznámka (voliteľné)</FormLabel>
              <FormControl>
                <Textarea placeholder="Zadajte poznámku..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Zrušiť
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Ukladanie...' : 'Uložiť'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
