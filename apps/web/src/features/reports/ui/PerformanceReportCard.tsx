import { useExportPerformance, usePerformanceReport } from '../hooks';

interface PerformanceReportCardProps {
  filters?: Record<string, unknown>;
}

export function PerformanceReportCard({ filters }: PerformanceReportCardProps) {
  const { data: report, isLoading, error } = usePerformanceReport(filters);
  const exportMutation = useExportPerformance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('sk-SK', { year: 'numeric', month: 'long' });
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Načítavam performance report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Chyba pri načítavaní performance reportu</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Žiadne dáta pre performance report</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Performance Report</h2>
          <p className="text-sm text-muted-foreground">Analýza výkonnosti portfólia</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {exportMutation.isPending ? 'Exportujem...' : 'Export CSV'}
        </button>
      </div>

      {/* Current NAV */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Aktuálny NAV</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(report.currentNav)}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className={`rounded-lg p-4 border ${
            (report.navChange || 0) >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Zmena NAV</p>
            <p
              className={`text-xl font-bold ${
                (report.navChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(report.navChange || 0) >= 0 ? '+' : ''}
              {formatCurrency(report.navChange || 0)}
            </p>
            <p
              className={`text-sm ${
                (report.navChangePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(report.navChangePercent || 0)}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg p-4 border ${
            report.totalUnrealizedPnL >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Nerealizovaný P&L</p>
            <p
              className={`text-xl font-bold ${
                report.totalUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {report.totalUnrealizedPnL >= 0 ? '+' : ''}
              {formatCurrency(report.totalUnrealizedPnL)}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Analýza výkonnosti</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Predchádzajúci NAV</span>
              <span className="font-medium text-foreground">
                {formatCurrency(report.previousNav || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Aktuálny NAV</span>
              <span className="font-medium text-foreground">
                {formatCurrency(report.currentNav)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Absolútna zmena</span>
              <span
                className={`font-medium ${
                  (report.navChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(report.navChange || 0) >= 0 ? '+' : ''}
                {formatCurrency(report.navChange || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Percentuálna zmena</span>
              <span
                className={`font-medium ${
                  (report.navChangePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercentage(report.navChangePercent || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Výkonnosť je meraná na základe zmeny NAV medzi začiatkom a koncom obdobia. Celkový výnos
            zahŕňa všetky príjmy, výdavky a zmeny hodnôt aktív.
          </span>
        </div>
      </div>
    </div>
  );
}
