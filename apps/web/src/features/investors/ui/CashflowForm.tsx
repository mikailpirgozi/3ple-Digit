import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateCashflowRequest } from '@/types/api';

const cashflowSchema = z.object({
  date: z.string().min(1, 'Dátum je povinný'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'], {
    required_error: 'Typ je povinný',
  }),
  amount: z.number().positive('Suma musí byť kladná'),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CashflowFormData>({
    resolver: zodResolver(cashflowSchema),
    defaultValues: {
      ...initialData,
      date: initialData?.date || new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = (data: CashflowFormData) => {
    onSubmit({
      ...data,
      amount: Number(data.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Dátum
          </label>
          <input
            {...register('date')}
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Typ
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Vyberte typ</option>
            <option value="DEPOSIT">Vklad</option>
            <option value="WITHDRAWAL">Výber</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Suma (€)
        </label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="0.00"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
          Poznámka (voliteľné)
        </label>
        <textarea
          {...register('note')}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Zadajte poznámku..."
        />
        {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Zrušiť
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Ukladanie...' : 'Uložiť'}
        </button>
      </div>
    </form>
  );
};
