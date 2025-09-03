import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateSnapshotRequest } from '@/types/api';

const snapshotFormSchema = z.object({
  period: z
    .string()
    .min(1, 'Obdobie je povinné')
    .regex(/^\d{4}-\d{2}$/, 'Formát musí byť YYYY-MM'),
  performanceFeeRate: z.number().min(0).max(100).optional(),
});

type SnapshotFormData = z.infer<typeof snapshotFormSchema>;

interface SnapshotFormProps {
  onSubmit: (data: CreateSnapshotRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SnapshotForm({ onSubmit, onCancel, isLoading }: SnapshotFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SnapshotFormData>({
    resolver: zodResolver(snapshotFormSchema),
    defaultValues: {
      period: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
      performanceFeeRate: undefined,
    },
  });

  const performanceFeeRate = watch('performanceFeeRate');

  const handleFormSubmit = (data: SnapshotFormData) => {
    onSubmit({
      ...data,
      performanceFeeRate: data.performanceFeeRate || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Vytvoriť nový snapshot</h2>
        <p className="text-sm text-muted-foreground">
          Snapshot uloží aktuálny NAV a rozdelenie podielov investorov
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Period */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-foreground mb-2">
            Obdobie (YYYY-MM)
          </label>
          <input
            id="period"
            type="month"
            {...register('period')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.period && <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>}
        </div>

        {/* Performance Fee Rate */}
        <div>
          <label
            htmlFor="performanceFeeRate"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Performance Fee (%)
          </label>
          <input
            id="performanceFeeRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...register('performanceFeeRate', { valueAsNumber: true })}
            placeholder="Napríklad: 20"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.performanceFeeRate && (
            <p className="mt-1 text-sm text-red-600">{errors.performanceFeeRate.message}</p>
          )}
          {performanceFeeRate && performanceFeeRate > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Performance fee sa rozdelí 50/50 medzi manažérov a investorov
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Čo sa stane pri vytvorení snapshot:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Vypočíta sa aktuálny NAV (Aktíva + Hotovosť - Záväzky)</li>
                <li>• Určia sa percentuálne podiely investorov na základe ich kapitálu</li>
                <li>• Ak je zadaný performance fee, rozdelí sa medzi manažérov a investorov</li>
                <li>• Všetky údaje sa uložia pre dané obdobie</li>
              </ul>
            </div>
          </div>
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
            {isLoading ? 'Vytváram snapshot...' : 'Vytvoriť snapshot'}
          </button>
        </div>
      </form>
    </div>
  );
}
