import type { CreateInvestorRequest } from '@/types/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const investorSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;

interface InvestorFormProps {
  onSubmit: (data: CreateInvestorRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateInvestorRequest>;
}

export const InvestorForm: React.FC<InvestorFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meno investora</FormLabel>
              <FormControl>
                <Input placeholder="Zadajte meno investora" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Zadajte email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefón (voliteľné)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Zadajte telefón" {...field} />
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
