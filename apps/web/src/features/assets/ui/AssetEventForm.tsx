import type { AssetEvent, AssetEventKind, CreateAssetEventRequest } from '@/types/api';
import { Button } from '@/ui/ui/button';
import { DatePicker } from '@/ui/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const assetEventFormSchema = z.object({
  date: z.string({
    required_error: 'Dátum je povinný',
  }),
  type: z.enum(['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX', 'NOTE', 'SALE']),
  amount: z.number().min(0).optional(),
  note: z.string().optional(),
});

type AssetEventFormData = z.infer<typeof assetEventFormSchema>;

interface AssetEventFormProps {
  event?: AssetEvent;
  assetId: string;
  onSubmit: (data: CreateAssetEventRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const eventKindLabels: Record<AssetEventKind, string> = {
  VALUATION: '📊 Prehodnotenie',
  PAYMENT_IN: '💰 Príjem',
  PAYMENT_OUT: '💸 Výdaj',
  CAPEX: '🔧 Investícia (CAPEX)',
  NOTE: '📝 Poznámka',
  SALE: '🏷️ Predaj',
};

const eventKindDescriptions: Record<AssetEventKind, string> = {
  VALUATION: 'Zmena hodnoty aktíva na základe nového ocenenia',
  PAYMENT_IN: 'Príjem z aktíva (napr. nájomné, dividendy)',
  PAYMENT_OUT: 'Výdaj súvisiaci s aktívom (napr. opravy, poplatky)',
  CAPEX: 'Kapitálová investícia do aktíva (zvyšuje hodnotu)',
  NOTE: 'Poznámka bez finančného dopadu',
  SALE: 'Predaj aktíva',
};

export function AssetEventForm({
  event,
  assetId,
  onSubmit,
  onCancel,
  isLoading,
}: AssetEventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssetEventFormData>({
    resolver: zodResolver(assetEventFormSchema),
    defaultValues: event
      ? {
          date:
            event.date instanceof Date
              ? event.date.toISOString().split('T')[0]
              : (event.date as string).split('T')[0],
          type: event.type,
          amount: event.amount ?? undefined,
          note: event.note ?? '',
        }
      : {
          date: new Date().toISOString().split('T')[0],
          type: 'VALUATION',
        },
  });

  const selectedType = watch('type');
  const requiresAmount = ['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX'].includes(selectedType);

  const handleFormSubmit = (data: AssetEventFormData) => {
    onSubmit({
      assetId,
      ...data,
      date: new Date(data.date).toISOString(),
      // Backend requires amount to be a number, use 0 for NOTE type
      amount: requiresAmount ? (data.amount ?? 0) : 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {event ? 'Upraviť udalosť' : 'Nová udalosť'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {event ? 'Upravte údaje udalosti' : 'Pridajte novú udalosť k aktívu'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Dátum
          </label>
          <DatePicker
            date={watch('date') ? new Date(watch('date') ?? '') : undefined}
            onSelect={(date: Date | undefined) => {
              if (date) {
                const dateString = date.toISOString().split('T')[0] ?? '';
                setValue('date', dateString);
              }
            }}
            placeholder="Vyberte dátum"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        {/* Event Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
            Typ udalosti
          </label>
          <select
            id="type"
            {...register('type')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Object.entries(eventKindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {selectedType && (
            <p className="mt-1 text-sm text-muted-foreground">
              {eventKindDescriptions[selectedType as AssetEventKind]}
            </p>
          )}
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* Amount */}
        {requiresAmount && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
              Suma (€) *
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
        )}

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">
            Poznámka
          </label>
          <textarea
            id="note"
            rows={3}
            {...register('note')}
            placeholder="Voliteľná poznámka k udalosti..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Zrušiť
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Ukladám...' : event ? 'Uložiť zmeny' : 'Vytvoriť udalosť'}
          </Button>
        </div>
      </form>
    </div>
  );
}
