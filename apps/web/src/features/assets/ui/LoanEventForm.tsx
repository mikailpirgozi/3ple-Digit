import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/ui/ui/button';
import { Input } from '@/ui/ui/input';
import { Label } from '@/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/ui/select';
import { Textarea } from '@/ui/ui/textarea';
import { Switch } from '@/ui/ui/switch';
import type { CreateAssetEventRequest } from '@/types/api';

const loanEventSchema = z.object({
  type: z.enum([
    'LOAN_DISBURSEMENT',
    'INTEREST_ACCRUAL',
    'INTEREST_PAYMENT',
    'PRINCIPAL_PAYMENT',
    'LOAN_REPAYMENT',
    'DEFAULT',
  ]),
  date: z.string().min(1, 'Dátum je povinný'),
  amount: z.number().optional(),
  interestAmount: z.number().optional(),
  principalAmount: z.number().optional(),
  isPaid: z.boolean().optional(),
  paymentDate: z.string().optional(),
  referencePeriodStart: z.string().optional(),
  referencePeriodEnd: z.string().optional(),
  note: z.string().optional(),
});

type LoanEventFormData = z.infer<typeof loanEventSchema>;

interface LoanEventFormProps {
  assetId: string;
  loanPrincipal?: number;
  interestRate?: number;
  interestPeriod?: string;
  onSubmit: (data: CreateAssetEventRequest) => Promise<void>;
  onCancel: () => void;
}

export function LoanEventForm({
  assetId,
  loanPrincipal,
  interestRate,
  interestPeriod,
  onSubmit,
  onCancel,
}: LoanEventFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoanEventFormData>({
    resolver: zodResolver(loanEventSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'INTEREST_ACCRUAL',
      isPaid: true,
    },
  });

  const selectedType = watch('type');
  const isPaid = watch('isPaid');

  // Calculate interest amount based on period
  const calculateInterestAmount = React.useCallback(() => {
    if (!loanPrincipal || !interestRate) return 0;

    let multiplier = 1;
    if (interestPeriod === 'YEARLY') {
      multiplier = 1 / 12; // Monthly calculation from yearly rate
    } else if (interestPeriod === 'QUARTERLY') {
      multiplier = 1 / 3; // Monthly calculation from quarterly rate
    }

    return loanPrincipal * (interestRate / 100) * multiplier;
  }, [loanPrincipal, interestRate, interestPeriod]);

  // Auto-fill interest amount for INTEREST_ACCRUAL
  React.useEffect(() => {
    if (selectedType === 'INTEREST_ACCRUAL') {
      const amount = calculateInterestAmount();
      setValue('interestAmount', amount);
    }
  }, [selectedType, calculateInterestAmount, setValue]);

  const handleFormSubmit = async (data: LoanEventFormData) => {
    const eventData: CreateAssetEventRequest = {
      assetId,
      type: data.type as CreateAssetEventRequest['type'],
      date: data.date,
      note: data.note,
      amount: data.amount ?? 0,
      interestAmount: data.interestAmount,
      principalAmount: data.principalAmount,
      isPaid: data.isPaid,
      paymentDate: data.paymentDate,
      referencePeriodStart: data.referencePeriodStart,
      referencePeriodEnd: data.referencePeriodEnd,
    } as unknown as CreateAssetEventRequest;

    // Set amount based on event type
    if (data.type === 'INTEREST_ACCRUAL' || data.type === 'INTEREST_PAYMENT') {
      if (data.interestAmount !== undefined) {
        eventData.amount = data.interestAmount;
      }
    } else if (data.type === 'PRINCIPAL_PAYMENT') {
      if (data.principalAmount !== undefined) {
        eventData.amount = data.principalAmount;
      }
    } else if (data.type === 'LOAN_DISBURSEMENT') {
      if (loanPrincipal !== undefined) {
        eventData.amount = loanPrincipal;
      }
    }

    await onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Typ udalosti</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue('type', value as LoanEventFormData['type'])}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Vyberte typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOAN_DISBURSEMENT">Poskytnutie pôžičky</SelectItem>
            <SelectItem value="INTEREST_ACCRUAL">Narastanie úroku</SelectItem>
            <SelectItem value="INTEREST_PAYMENT">Platba úroku</SelectItem>
            <SelectItem value="PRINCIPAL_PAYMENT">Platba istiny</SelectItem>
            <SelectItem value="LOAN_REPAYMENT">Splatenie pôžičky</SelectItem>
            <SelectItem value="DEFAULT">Defaultovanie</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Dátum</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          className={errors.date ? 'border-red-500' : ''}
        />
        {errors.date && (
          <p className="text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {selectedType === 'INTEREST_ACCRUAL' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="interestAmount">Výška úroku (€)</Label>
            <Input
              id="interestAmount"
              type="number"
              step="0.01"
              {...register('interestAmount', { valueAsNumber: true })}
              className={errors.interestAmount ? 'border-red-500' : ''}
            />
            {errors.interestAmount && (
              <p className="text-sm text-red-600">{errors.interestAmount.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              checked={isPaid}
              onCheckedChange={(checked) => setValue('isPaid', checked)}
            />
            <Label htmlFor="isPaid">
              Úrok bol zaplatený
            </Label>
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Dátum platby</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register('paymentDate')}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referencePeriodStart">Obdobie od</Label>
              <Input
                id="referencePeriodStart"
                type="date"
                {...register('referencePeriodStart')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencePeriodEnd">Obdobie do</Label>
              <Input
                id="referencePeriodEnd"
                type="date"
                {...register('referencePeriodEnd')}
              />
            </div>
          </div>
        </>
      )}

      {selectedType === 'INTEREST_PAYMENT' && (
        <div className="space-y-2">
          <Label htmlFor="interestAmount">Výška plateného úroku (€)</Label>
          <Input
            id="interestAmount"
            type="number"
            step="0.01"
            {...register('interestAmount', { valueAsNumber: true })}
            className={errors.interestAmount ? 'border-red-500' : ''}
          />
          {errors.interestAmount && (
            <p className="text-sm text-red-600">{errors.interestAmount.message}</p>
          )}
        </div>
      )}

      {selectedType === 'PRINCIPAL_PAYMENT' && (
        <div className="space-y-2">
          <Label htmlFor="principalAmount">Výška splátky istiny (€)</Label>
          <Input
            id="principalAmount"
            type="number"
            step="0.01"
            {...register('principalAmount', { valueAsNumber: true })}
            className={errors.principalAmount ? 'border-red-500' : ''}
          />
          {errors.principalAmount && (
            <p className="text-sm text-red-600">{errors.principalAmount.message}</p>
          )}
        </div>
      )}

      {(selectedType === 'LOAN_REPAYMENT' || selectedType === 'LOAN_DISBURSEMENT') && (
        <div className="space-y-2">
          <Label htmlFor="amount">Suma (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            defaultValue={selectedType === 'LOAN_DISBURSEMENT' ? loanPrincipal : undefined}
            {...register('amount', { valueAsNumber: true })}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="note">Poznámka</Label>
        <Textarea
          id="note"
          {...register('note')}
          rows={3}
          placeholder="Voliteľná poznámka k udalosti..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Zrušiť
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ukladá sa...' : 'Pridať udalosť'}
        </Button>
      </div>
    </form>
  );
}
