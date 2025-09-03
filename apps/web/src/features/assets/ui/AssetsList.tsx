import { useState } from 'react';
import { Asset, AssetType, AssetFilters } from '@/types/api';
import { useAssets, useDeleteAsset, useMarkAssetSold } from '../hooks';
import { AssetForm } from './AssetForm';
import { AssetEventForm } from './AssetEventForm';
import { AssetEventsModal } from './AssetEventsModal';

interface AssetsListProps {
  onCreateAsset?: () => void;
  onEditAsset?: (asset: Asset) => void;
}

const assetTypeLabels: Record<AssetType, string> = {
  loan: '💰 Pôžička',
  real_estate: '🏢 Nehnuteľnosť',
  vehicle: '🚗 Vozidlo',
  stock: '📈 Akcie',
  inventory: '📦 Inventár',
  share_in_company: '🏭 Podiel v spoločnosti',
};

export function AssetsList({ onCreateAsset, onEditAsset }: AssetsListProps) {
  const [filters, setFilters] = useState<AssetFilters>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);

  const { data: assetsData, isLoading, error } = useAssets(filters);
  const deleteAssetMutation = useDeleteAsset();
  const markAsSoldMutation = useMarkAssetSold();

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Naozaj chcete odstrániť toto aktívum?')) {
      try {
        await deleteAssetMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleMarkAsSold = async (asset: Asset) => {
    const salePrice = window.prompt(
      `Zadajte predajnú cenu pre ${asset.name}:`,
      asset.expectedSalePrice?.toString() || asset.currentValue.toString()
    );

    if (salePrice && !isNaN(Number(salePrice))) {
      try {
        await markAsSoldMutation.mutateAsync({
          id: asset.id,
          data: {
            date: new Date().toISOString(),
            salePrice: Number(salePrice),
          },
        });
      } catch (error) {
        console.error('Error marking asset as sold:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculatePnL = (asset: Asset) => {
    if (!asset.acquiredPrice) return null;
    const pnl = asset.currentValue - asset.acquiredPrice;
    const pnlPercent = (pnl / asset.acquiredPrice) * 100;
    return { pnl, pnlPercent };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam aktíva...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Chyba pri načítavaní aktív</p>
      </div>
    );
  }

  const assets = assetsData?.assets || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.type || ''}
          onChange={e =>
            setFilters({ ...filters, type: (e.target.value as AssetType) || undefined })
          }
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Všetky typy</option>
          {Object.entries(assetTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.status || ''}
          onChange={e =>
            setFilters({ ...filters, status: (e.target.value as 'ACTIVE' | 'SOLD') || undefined })
          }
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Všetky stavy</option>
          <option value="ACTIVE">Aktívne</option>
          <option value="SOLD">Predané</option>
        </select>

        <input
          type="text"
          placeholder="Hľadať podľa názvu..."
          value={filters.q || ''}
          onChange={e => setFilters({ ...filters, q: e.target.value || undefined })}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Assets List */}
      <div className="space-y-4">
        {assets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Žiadne aktíva nenájdené</p>
            {onCreateAsset && (
              <button
                onClick={onCreateAsset}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Pridať prvé aktívum
              </button>
            )}
          </div>
        ) : (
          assets.map(asset => {
            const pnlData = calculatePnL(asset);
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{asset.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {assetTypeLabels[asset.type]}
                    </span>
                    {asset.status === 'SOLD' && (
                      <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                        Predané
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {asset.acquiredPrice && (
                      <span>Kúpené za {formatCurrency(asset.acquiredPrice)} • </span>
                    )}
                    Aktuálna hodnota: {formatCurrency(asset.currentValue)}
                    {asset.expectedSalePrice && (
                      <span>
                        {' '}
                        • Očakávaná predajná cena: {formatCurrency(asset.expectedSalePrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {pnlData && (
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(asset.currentValue)}
                      </p>
                      <p
                        className={`text-sm ${
                          pnlData.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pnlData.pnl >= 0 ? '+' : ''}
                        {formatCurrency(pnlData.pnl)} ({pnlData.pnlPercent.toFixed(1)}%)
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowEventsModal(true);
                      }}
                      className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Udalosti
                    </button>

                    {asset.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleMarkAsSold(asset)}
                          disabled={markAsSoldMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Predať
                        </button>

                        {onEditAsset && (
                          <button
                            onClick={() => onEditAsset(asset)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Upraviť
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      disabled={deleteAssetMutation.isPending}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Odstrániť
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Asset Events Modal */}
      {selectedAsset && showEventsModal && (
        <AssetEventsModal
          asset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null);
            setShowEventsModal(false);
          }}
        />
      )}
    </div>
  );
}
