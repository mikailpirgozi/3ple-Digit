import type { AssetType } from '@/types/api';
import { useExportPortfolio, usePortfolioReport } from '../hooks';

interface PortfolioReportCardProps {
  filters?: Record<string, unknown>;
}

const assetTypeLabels: Record<AssetType, string> = {
  PÔŽIČKY: '💰 Pôžičky',
  NEHNUTEĽNOSTI: '🏠 Nehnuteľnosti',
  AUTÁ: '🚗 Autá',
  AKCIE: '📈 Akcie',
  MATERIÁL: '🔧 Materiál',
  'PODIEL VO FIRME': '🏢 Podiel vo firme',
};

export function PortfolioReportCard({ filters }: PortfolioReportCardProps) {
  const { data: report, isLoading, error } = usePortfolioReport(filters);
  const exportMutation = useExportPortfolio();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Načítavam portfolio report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Chyba pri načítavaní portfolio reportu</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Žiadne dáta pre portfolio report</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Portfolio Report</h2>
          <p className="text-sm text-muted-foreground">Kompletný prehľad portfólia aktív</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {exportMutation.isPending ? 'Exportujem...' : 'Export CSV'}
        </button>
      </div>

      {/* Total Value */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Celková hodnota portfólia</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(report.totalValue)}</p>
        </div>
      </div>

      {/* Assets by Type */}
      {report.assetsByType && report.assetsByType.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-foreground">Rozdelenie podľa typu</h3>
          <div className="space-y-3">
            {report.assetsByType.map((assetType) => (
              <div
                key={assetType.type}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {assetTypeLabels[assetType.type as AssetType]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(assetType.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {assetType.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Assets */}
      {report.topAssets && report.topAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Top aktíva</h3>
          <div className="space-y-2">
            {report.topAssets.map((asset, index) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{assetTypeLabels[asset.type]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
