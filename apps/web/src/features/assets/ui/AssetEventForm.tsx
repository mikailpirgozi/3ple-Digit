import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AssetEvent, AssetEventKind, CreateAssetEventRequest } from '@/types/api';

const assetEventFormSchema = z.object({
  date: z.string().min(1, 'Dátum je povinný'),
  kind: z.enum(['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX', 'NOTE']),
  amount: z.number().min(0).optional(),
  note: z.string().optional(),
});

type AssetEventFormData = z.infer<typeof assetEventFormSchema>;

interface AssetEventFormProps {
  event?: AssetEvent;
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
};

const eventKindDescriptions: Record<AssetEventKind, string> = {
  VALUATION: 'Zmena hodnoty aktíva na základe nového ocenenia',
  PAYMENT_IN: 'Príjem z aktíva (napr. nájomné, dividendy)',
  PAYMENT_OUT: 'Výdaj súvisiaci s aktívom (napr. opravy, poplatky)',
  CAPEX: 'Kapitálová investícia do aktíva (zvyšuje hodnotu)',
  NOTE: 'Poznámka bez finančného dopadu',
};

export function AssetEventForm({ event, onSubmit, onCancel, isLoading }: AssetEventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AssetEventFormData>({
    resolver: zodResolver(assetEventFormSchema),
    defaultValues: event
      ? {
          date: event.date.split('T')[0], // Convert to YYYY-MM-DD format
          kind: event.kind,
          amount: event.amount || undefined,
          note: event.note || '',
        }
      : {
          date: new Date().toISOString().split('T')[0],
          kind: 'VALUATION',
        },
  });

  const selectedKind = watch('kind');
  const requiresAmount = ['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX'].includes(selectedKind);

  const handleFormSubmit = (data: AssetEventFormData) => {
    onSubmit({
      ...data,
      amount: requiresAmount ? data.amount : undefined,
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
          <input
            id="date"
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        {/* Event Kind */}
        <div>
          <label htmlFor="kind" className="block text-sm font-medium text-foreground mb-2">
            Typ udalosti
          </label>
          <select
            id="kind"
            {...register('kind')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Object.entries(eventKindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {selectedKind && (
            <p className="mt-1 text-sm text-muted-foreground">
              {eventKindDescriptions[selectedKind]}
            </p>
          )}
          {errors.kind && <p className="mt-1 text-sm text-red-600">{errors.kind.message}</p>}
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
            {isLoading ? 'Ukladám...' : event ? 'Uložiť zmeny' : 'Vytvoriť udalosť'}
          </button>
        </div>
      </form>
    </div>
  );
}
