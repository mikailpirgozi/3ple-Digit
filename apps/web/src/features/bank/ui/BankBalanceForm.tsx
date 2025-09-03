import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BankBalance, CreateBankBalanceRequest } from '@/types/api';
import { useAccountNames } from '../hooks';

const bankBalanceFormSchema = z.object({
  accountName: z.string().min(1, 'Názov účtu je povinný'),
  date: z.string().min(1, 'Dátum je povinný'),
  amount: z.number().min(0, 'Suma musí byť kladná'),
});

type BankBalanceFormData = z.infer<typeof bankBalanceFormSchema>;

interface BankBalanceFormProps {
  balance?: BankBalance;
  onSubmit: (data: CreateBankBalanceRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BankBalanceForm({ balance, onSubmit, onCancel, isLoading }: BankBalanceFormProps) {
  const { data: accountNames } = useAccountNames();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BankBalanceFormData>({
    resolver: zodResolver(bankBalanceFormSchema),
    defaultValues: balance
      ? {
          accountName: balance.accountName,
          date: balance.date.split('T')[0], // Convert to YYYY-MM-DD format
          amount: balance.amount,
        }
      : {
          date: new Date().toISOString().split('T')[0],
          amount: 0,
        },
  });

  const selectedAccountName = watch('accountName');

  const handleFormSubmit = (data: BankBalanceFormData) => {
    onSubmit(data);
  };

  const handleAccountNameSelect = (accountName: string) => {
    setValue('accountName', accountName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {balance ? 'Upraviť zostatok' : 'Nový zostatok'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {balance ? 'Upravte údaje bankového zostatku' : 'Pridajte nový bankový zostatok'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Account Name */}
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-foreground mb-2">
            Názov účtu
          </label>
          <div className="space-y-2">
            <input
              id="accountName"
              type="text"
              {...register('accountName')}
              placeholder="Napríklad: Main Business Account"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* Existing account names suggestions */}
            {accountNames && accountNames.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Existujúce účty:</p>
                <div className="flex flex-wrap gap-2">
                  {accountNames.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleAccountNameSelect(name)}
                      className={`px-2 py-1 text-xs rounded border ${
                        selectedAccountName === name
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.accountName && (
            <p className="mt-1 text-sm text-red-600">{errors.accountName.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Dátum
          </label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Suma (€)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Ukladám...' : balance ? 'Uložiť zmeny' : 'Vytvoriť zostatok'}
          </button>
        </div>
      </form>
    </div>
  );
}
