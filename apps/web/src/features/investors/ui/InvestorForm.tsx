import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateInvestorRequest } from '@/types/api';

const investorSchema = z.object({
  displayName: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          Meno investora
        </label>
        <input
          {...register('displayName')}
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Zadajte meno investora"
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
        )}
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
