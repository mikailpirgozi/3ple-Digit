import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Liability, CreateLiabilityRequest } from '@/types/api';

const liabilityFormSchema = z.object({
  name: z.string().min(1, 'Názov je povinný'),
  currentBalance: z.number().min(0, 'Zostatok musí byť kladný'),
  note: z.string().optional(),
});

type LiabilityFormData = z.infer<typeof liabilityFormSchema>;

interface LiabilityFormProps {
  liability?: Liability;
  onSubmit: (data: CreateLiabilityRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LiabilityForm({ liability, onSubmit, onCancel, isLoading }: LiabilityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LiabilityFormData>({
    resolver: zodResolver(liabilityFormSchema),
    defaultValues: liability
      ? {
          name: liability.name,
          currentBalance: liability.currentBalance,
          note: liability.note || '',
        }
      : {
          currentBalance: 0,
          note: '',
        },
  });

  const handleFormSubmit = (data: LiabilityFormData) => {
    onSubmit({
      ...data,
      note: data.note || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {liability ? 'Upraviť záväzok' : 'Nový záväzok'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {liability ? 'Upravte údaje záväzku' : 'Pridajte nový záväzok'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Názov záväzku
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Napríklad: Bank Loan - Property"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Current Balance */}
        <div>
          <label
            htmlFor="currentBalance"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Aktuálny zostatok (€)
          </label>
          <input
            id="currentBalance"
            type="number"
            step="0.01"
            {...register('currentBalance', { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.currentBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.currentBalance.message}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">
            Poznámka
          </label>
          <textarea
            id="note"
            rows={3}
            {...register('note')}
            placeholder="Napríklad: Hypotéka na kancelársku budovu • 3.5% p.a. • Splatnosť: 01/2029"
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
            {isLoading ? 'Ukladám...' : liability ? 'Uložiť zmeny' : 'Vytvoriť záväzok'}
          </button>
        </div>
      </form>
    </div>
  );
}
