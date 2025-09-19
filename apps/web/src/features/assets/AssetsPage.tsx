import { useState } from 'react';
import type { Asset, CreateAssetRequest, UpdateAssetRequest } from '@/types/api';
import { useCreateAsset, useUpdateAsset } from './hooks';
import { AssetsList } from './ui/AssetsList';
import { AssetForm } from './ui/AssetForm';

export function AssetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();

  const handleCreateAsset = async (data: CreateAssetRequest) => {
    try {
      await createAssetMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const handleUpdateAsset = async (data: UpdateAssetRequest) => {
    if (!editingAsset) return;

    try {
      await updateAssetMutation.mutateAsync({ id: editingAsset.id, data });
      setEditingAsset(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Aktíva</h1>
          <p className="text-xs xs:text-sm text-muted-foreground">Správa investičných aktív a ich ocenenia</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
          >
            Pridať aktívum
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
          <AssetForm
            asset={editingAsset ?? undefined}
            onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
            onCancel={handleCancelForm}
            isLoading={createAssetMutation.isPending ?? updateAssetMutation.isPending}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
          <h2 className="text-lg xs:text-xl font-semibold text-foreground mb-3 xs:mb-4">Portfolio aktív</h2>
          <AssetsList onCreateAsset={() => setShowForm(true)} onEditAsset={handleEditAsset} />
        </div>
      )}
    </div>
  );
}
