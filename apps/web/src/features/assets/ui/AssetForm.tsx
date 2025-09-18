import type { Asset, AssetType, CreateAssetRequest } from '@/types/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';

const assetFormSchema = z.object({
  type: z.enum(['PÔŽIČKY', 'NEHNUTEĽNOSTI', 'AUTÁ', 'AKCIE', 'MATERIÁL', 'PODIEL VO FIRME']),
  name: z.string().min(1, 'Názov je povinný'),
  category: z.string().optional(),
  acquiredPrice: z.number().min(0).optional(),
  acquiredDate: z.string().optional(),
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
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: asset
      ? {
          type: asset.type,
          name: asset.name,
          category: asset.category ?? '',
          acquiredPrice: asset.acquiredPrice ?? undefined,
          acquiredDate: asset.acquiredDate ? asset.acquiredDate.substring(0, 7) : undefined, // Extract YYYY-MM from ISO string
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

  const handleFormSubmit = (data: AssetFormData) => {
    onSubmit({
      ...data,
      acquiredDate: data.acquiredDate
        ? new Date(data.acquiredDate + '-01').toISOString()
        : undefined, // Add first day of month
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Asset Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: ControllerRenderProps<AssetFormData, 'type'> }) => (
              <FormItem>
                <FormLabel>Typ aktíva</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ aktíva" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(assetTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asset Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: ControllerRenderProps<AssetFormData, 'name'> }) => (
              <FormItem>
                <FormLabel>Názov aktíva</FormLabel>
                <FormControl>
                  <Input placeholder="Napríklad: Office Building Bratislava" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asset Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }: { field: ControllerRenderProps<AssetFormData, 'category'> }) => (
              <FormItem>
                <FormLabel>Kategória</FormLabel>
                <FormControl>
                  <Input placeholder="Napríklad: Apartmány, Kancelárie, Pozemky..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="acquiredPrice"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AssetFormData, 'acquiredPrice'>;
              }) => (
                <FormItem>
                  <FormLabel>Nákupná cena (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acquiredDate"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AssetFormData, 'acquiredDate'>;
              }) => (
                <FormItem>
                  <FormLabel>Dátum nadobudnutia (mesiac/rok)</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentValue"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AssetFormData, 'currentValue'>;
              }) => (
                <FormItem>
                  <FormLabel>Aktuálna hodnota (€) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedSalePrice"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AssetFormData, 'expectedSalePrice'>;
              }) => (
                <FormItem>
                  <FormLabel>Očakávaná predajná cena (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ukladám...' : asset ? 'Uložiť zmeny' : 'Vytvoriť aktívum'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
