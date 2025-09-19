import type { Asset, AssetFilters, AssetType } from '@/types/api';
import { useState } from 'react';
import { useAssets, useDeleteAsset, useMarkAssetSold } from '../hooks';
import { AssetEventsModal } from './AssetEventsModal';

interface AssetsListProps {
  onCreateAsset?: () => void;
  onEditAsset?: (asset: Asset) => void;
}

const assetTypeLabels: Record<AssetType, string> = {
  PÔŽIČKY: '💰 Pôžičky',
  NEHNUTEĽNOSTI: '🏠 Nehnuteľnosti',
  AUTÁ: '🚗 Autá',
  AKCIE: '📈 Akcie',
  MATERIÁL: '🔧 Materiál',
  'PODIEL VO FIRME': '🏢 Podiel vo firme',
};

type SortOption = 'name' | 'currentValue' | 'createdAt' | 'type';

export function AssetsList({ onCreateAsset, onEditAsset }: AssetsListProps) {
  const [filters, setFilters] = useState<AssetFilters>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('currentValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      asset.expectedSalePrice?.toString() ?? asset.currentValue.toString()
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
        console.error('Full error details:', JSON.stringify(error, null, 2));
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateTimePeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in months more accurately
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;

    // Add partial month if we're past the start day
    const daysDiff = end.getDate() - start.getDate();
    const adjustedMonths = daysDiff >= 0 ? totalMonths : totalMonths - 1;
    const finalMonths = Math.max(1, adjustedMonths); // Minimum 1 month

    const years = finalMonths / 12;

    if (finalMonths < 12) {
      return {
        days: 0,
        months: finalMonths,
        years: years,
        text: finalMonths === 1 ? `${finalMonths} mesiac` : `${finalMonths} mesiacov`,
      };
    } else {
      const wholeYears = Math.floor(finalMonths / 12);
      const remainingMonths = finalMonths % 12;

      if (remainingMonths === 0) {
        return {
          days: 0,
          months: finalMonths,
          years: wholeYears,
          text: wholeYears === 1 ? `${wholeYears} rok` : `${wholeYears} rokov`,
        };
      } else {
        return {
          days: 0,
          months: finalMonths,
          years: years,
          text: `${wholeYears} rokov ${remainingMonths} mesiacov`,
        };
      }
    }
  };

  const calculateAnnualizedReturn = (startValue: number, endValue: number, months: number) => {
    if (months <= 0 || startValue <= 0) return 0;

    // Calculate simple percentage change
    const percentChange = ((endValue - startValue) / startValue) * 100;

    // Annualize by simple proportion: (percentage / months) * 12
    return (percentChange / months) * 12;
  };

  const calculatePnL = (asset: Asset) => {
    if (!asset.acquiredPrice) return null;
    
    // For sold assets, use salePrice; for active assets, use currentValue
    const finalValue = asset.status === 'SOLD' && asset.salePrice ? asset.salePrice : asset.currentValue;
    const pnl = finalValue - asset.acquiredPrice;
    const pnlPercent = (pnl / asset.acquiredPrice) * 100;

    // Calculate time period and annualized return
    const startDate = asset.acquiredDate ?? asset.createdAt;
    // For sold assets, use saleDate; for active assets, use current date
    const endDate = asset.status === 'SOLD' && asset.saleDate ? asset.saleDate : new Date().toISOString();
    const timePeriod = calculateTimePeriod(startDate, endDate);
    const annualizedReturn = calculateAnnualizedReturn(
      asset.acquiredPrice,
      finalValue,
      timePeriod.months
    );

    return {
      pnl,
      pnlPercent,
      timePeriod,
      annualizedReturn: timePeriod.months > 0 ? annualizedReturn : null,
      finalValue,
    };
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

  const assets = assetsData?.assets ?? [];

  // Sort assets based on selected criteria
  const sortedAssets = [...assets].sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case 'currentValue':
        aValue = a.currentValue ?? 0;
        bValue = b.currentValue ?? 0;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        return 0;
    }

    if (sortBy === 'name' || sortBy === 'type') {
      return sortOrder === 'asc'
        ? (aValue as string).localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue as string);
    } else {
      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  // Group assets by type for category display
  const assetsByType = sortedAssets.reduce(
    (acc, asset) => {
      if (!acc[asset.type]) {
        acc[asset.type] = [];
      }
      acc[asset.type].push(asset);
      return acc;
    },
    {} as Record<AssetType, Asset[]>
  );

  // Calculate totals by type
  const typeTotals = Object.entries(assetsByType)
    .map(([type, typeAssets]) => ({
      type: type as AssetType,
      assets: typeAssets as Asset[],
      count: (typeAssets as Asset[]).length,
      totalValue: (typeAssets as Asset[]).reduce((sum, asset) => sum + asset.currentValue, 0),
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.type ?? ''}
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
          value={filters.status ?? ''}
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

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="currentValue">Zoradiť podľa hodnoty</option>
          <option value="name">Zoradiť podľa názvu</option>
          <option value="type">Zoradiť podľa typu</option>
          <option value="createdAt">Zoradiť podľa dátumu</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          title={sortOrder === 'asc' ? 'Zostupne' : 'Vzostupne'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Assets List by Categories */}
      <div className="space-y-6">
        {sortedAssets.length === 0 ? (
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
          typeTotals.map(({ type, assets: typeAssets, count, totalValue }) => (
            <div key={type} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{assetTypeLabels[type]}</h3>
                  <span className="px-2 py-1 text-xs font-medium text-muted-foreground bg-background rounded-full">
                    {count} {count === 1 ? 'aktívum' : count < 5 ? 'aktíva' : 'aktív'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(totalValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">Celková hodnota kategórie</p>
                </div>
              </div>

              {/* Assets in Category */}
              <div className="space-y-2 ml-4">
                {(typeAssets as Asset[]).map(asset => {
                  const pnlData = calculatePnL(asset);
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-foreground">{asset.name}</h4>
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
                          {asset.status === 'SOLD' && asset.salePrice ? (
                            <span>Predané za {formatCurrency(asset.salePrice)}</span>
                          ) : (
                            <span>Aktuálna hodnota: {formatCurrency(asset.currentValue)}</span>
                          )}
                          {asset.expectedSalePrice && asset.status !== 'SOLD' && (
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
                              {formatCurrency(pnlData.finalValue)}
                            </p>
                            <p
                              className={`text-sm ${
                                pnlData.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {pnlData.pnl >= 0 ? '+' : ''}
                              {formatCurrency(pnlData.pnl)} ({pnlData.pnlPercent.toFixed(1)}%)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              za {pnlData.timePeriod.text}
                              {pnlData.annualizedReturn && (
                                <span> ({pnlData.annualizedReturn.toFixed(1)}% ročne)</span>
                              )}
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
                })}
              </div>
            </div>
          ))
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
