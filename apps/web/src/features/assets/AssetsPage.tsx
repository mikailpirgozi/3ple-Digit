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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aktíva</h1>
          <p className="text-muted-foreground">Správa investičných aktív a ich ocenenia</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Pridať aktívum
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <AssetForm
            asset={editingAsset ?? undefined}
            onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
            onCancel={handleCancelForm}
            isLoading={createAssetMutation.isPending ?? updateAssetMutation.isPending}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Portfolio aktív</h2>
          <AssetsList onCreateAsset={() => setShowForm(true)} onEditAsset={handleEditAsset} />
        </div>
      )}
    </div>
  );
}
