import type { Asset, AssetType, CreateAssetRequest } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const assetFormSchema = z.object({
  type: z.enum(['PÔŽIČKY', 'NEHNUTEĽNOSTI', 'AUTÁ', 'AKCIE', 'MATERIÁL', 'PODIEL VO FIRME']),
  name: z.string().min(1, 'Názov je povinný'),
  category: z.string().optional(),
  acquiredPrice: z.number().min(0).optional(),
  currentValue: z.number().min(0, 'Aktuálna hodnota musí byť kladná'),
  expectedSalePrice: z.number().min(0).optional(),
  meta: z.record(z.unknown()).optional(),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  asset?: Asset;
  onSubmit: (data: CreateAssetRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const assetTypeLabels: Record<AssetType, string> = {
  PÔŽIČKY: '💰 Pôžičky',
  NEHNUTEĽNOSTI: '🏠 Nehnuteľnosti',
  AUTÁ: '🚗 Autá',
  AKCIE: '📈 Akcie',
  MATERIÁL: '🔧 Materiál',
  'PODIEL VO FIRME': '🏢 Podiel vo firme',
};

export function AssetForm({ asset, onSubmit, onCancel, isLoading }: AssetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: asset
      ? {
          type: asset.type,
          name: asset.name,
          category: asset.category ?? '',
          acquiredPrice: asset.acquiredPrice ?? undefined,
          currentValue: asset.currentValue,
          expectedSalePrice: asset.expectedSalePrice ?? undefined,
          meta: asset.meta ?? {},
        }
      : {
          type: 'NEHNUTEĽNOSTI',
          currentValue: 0,
          category: '',
        },
  });

  // const selectedType = watch('type'); // Unused for now

  const handleFormSubmit = (data: AssetFormData) => {
    onSubmit({
      ...data,
      meta: data.meta ?? {},
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {asset ? 'Upraviť aktívum' : 'Nové aktívum'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {asset ? 'Upravte údaje aktíva' : 'Pridajte nové aktívum do portfólia'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Asset Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
            Typ aktíva
          </label>
          <select
            id="type"
            {...register('type')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Object.entries(assetTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* Asset Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Názov aktíva
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Napríklad: Office Building Bratislava"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Asset Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
            Kategória
          </label>
          <input
            id="category"
            type="text"
            {...register('category')}
            placeholder="Napríklad: Apartmány, Kancelárie, Pozemky..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Financial Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="acquiredPrice"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Nákupná cena (€)
            </label>
            <input
              id="acquiredPrice"
              type="number"
              step="0.01"
              {...register('acquiredPrice', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.acquiredPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.acquiredPrice.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="currentValue"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Aktuálna hodnota (€) *
            </label>
            <input
              id="currentValue"
              type="number"
              step="0.01"
              {...register('currentValue', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.currentValue && (
              <p className="mt-1 text-sm text-red-600">{errors.currentValue.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="expectedSalePrice"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Očakávaná predajná cena (€)
            </label>
            <input
              id="expectedSalePrice"
              type="number"
              step="0.01"
              {...register('expectedSalePrice', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.expectedSalePrice && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedSalePrice.message}</p>
            )}
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
            {isLoading ? 'Ukladám...' : asset ? 'Uložiť zmeny' : 'Vytvoriť aktívum'}
          </button>
        </div>
      </form>
    </div>
  );
}
