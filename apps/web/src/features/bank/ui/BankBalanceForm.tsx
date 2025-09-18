import type { BankBalance, CreateBankBalanceRequest } from '@/types/api';
import { Button } from '@/ui/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/ui/card';
import { DatePicker } from '@/ui/ui/date-picker';
import { Input } from '@/ui/ui/input';
import { Label } from '@/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAccountNames } from '../hooks';

const bankBalanceFormSchema = z.object({
  accountName: z.string().min(1, 'Názov účtu je povinný'),
  date: z.string().min(1, 'Dátum je povinný'),
  amount: z.number().min(0, 'Suma musí byť kladná'),
  currency: z.string().min(1, 'Mena je povinná').default('EUR'),
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
          date:
            balance.date instanceof Date
              ? balance.date.toISOString().split('T')[0]
              : (balance.date as string).split('T')[0],
          amount: balance.amount,
          currency: balance.currency,
        }
      : {
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          currency: 'EUR',
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
    <Card>
      <CardHeader>
        <CardTitle>{balance ? 'Upraviť zostatok' : 'Nový zostatok'}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {balance ? 'Upravte údaje bankového zostatku' : 'Pridajte nový bankový zostatok'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Account Name */}
          <div>
            <Label htmlFor="accountName">Názov účtu</Label>
            <div className="space-y-2">
              <Input
                id="accountName"
                type="text"
                {...register('accountName')}
                placeholder="Napríklad: Main Business Account"
              />

              {/* Existing account names suggestions */}
              {accountNames && accountNames.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Existujúce účty:</p>
                  <div className="flex flex-wrap gap-2">
                    {accountNames.map(name => (
                      <Button
                        key={name}
                        type="button"
                        variant={selectedAccountName === name ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAccountNameSelect(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.accountName && (
              <p className="mt-1 text-sm text-destructive">{errors.accountName.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Dátum</Label>
            <DatePicker
              placeholder="Vyberte dátum"
              date={watch('date') ? new Date(watch('date') || '') : undefined}
              onSelect={(date: Date | undefined) => {
                const dateString = date
                  ? (date.toISOString().split('T')[0] ?? '')
                  : (new Date().toISOString().split('T')[0] ?? '');
                setValue('date', dateString);
              }}
            />
            {errors.date && <p className="mt-1 text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Mena</Label>
            <Select
              value={watch('currency')}
              onValueChange={(value: string) => setValue('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CZK">CZK (Kč)</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="mt-1 text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Suma</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ukladám...' : balance ? 'Uložiť zmeny' : 'Vytvoriť zostatok'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
