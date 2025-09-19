import type { AssetEvent, AssetEventKind, CreateAssetEventRequest } from '@/types/api';
import { Button } from '@/ui/ui/button';
import { DatePicker } from '@/ui/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAssetEventValidationInfo } from '../hooks';

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
  const { data: validationInfo, isLoading: validationLoading } = useAssetEventValidationInfo(assetId);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sk-SK');
  };

  // Check if we can add events
  const canAddEvents = validationInfo?.canAddEvents ?? true;
  const minDate = validationInfo?.minDate ? new Date(validationInfo.minDate) : undefined;

  const handleFormSubmit = (data: AssetEventFormData) => {
    const payload = {
      date: new Date(data.date).toISOString(),
      type: data.type,
      note: data.note ?? undefined,
      assetId,
      ...(requiresAmount && { amount: data.amount ?? 0 }),
    } as CreateAssetEventRequest;

    onSubmit(payload);
  };

  if (validationLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Načítavam validačné informácie...</div>
        </div>
      </div>
    );
  }

  if (!canAddEvents) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Nemožno pridať udalosť</h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {validationInfo?.isSold 
                ? 'Toto aktívum bolo predané. Nie je možné pridávať ďalšie udalosti.'
                : 'Nie je možné pridať udalosť k tomuto aktívu.'}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Zavrieť
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Validation Info */}
      {validationInfo && !event && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Informácie o obmedzeniach</h3>
          <div className="space-y-1 text-sm text-blue-700">
            {validationInfo.acquiredDate && (
              <p>📅 Dátum nákupu aktíva: {formatDate(validationInfo.acquiredDate)}</p>
            )}
            {validationInfo.lastEventDate && validationInfo.lastEventType && (
              <p>
                🕒 Posledná udalosť: {validationInfo.lastEventType} dňa {formatDate(validationInfo.lastEventDate)}
              </p>
            )}
            {validationInfo.minDate && (
              <p>⚠️ Minimálny povolený dátum: {formatDate(validationInfo.minDate)}</p>
            )}
          </div>
        </div>
      )}

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
            fromDate={minDate}
            disabledDays={minDate ? (date: Date) => date < minDate : undefined}
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
