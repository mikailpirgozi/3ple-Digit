import { useInvestorReport, useExportInvestors } from '../hooks';

interface InvestorReportCardProps {
  filters?: Record<string, unknown>;
}

export function InvestorReportCard({ filters }: InvestorReportCardProps) {
  const { data: report, isLoading, error } = useInvestorReport(filters);
  const exportMutation = useExportInvestors();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Načítavam investor report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Chyba pri načítavaní investor reportu</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Žiadne dáta pre investor report</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Investor Report</h2>
          <p className="text-sm text-muted-foreground">
            Prehľad investorov a ich podielov
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {exportMutation.isPending ? 'Exportujem...' : 'Export CSV'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Celkový kapitál</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(report.totalCapital)}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Počet investorov</p>
          <p className="text-2xl font-bold text-blue-600">{report.investorCount}</p>
        </div>
      </div>

      {/* Investors List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Investori</h3>
        <div className="space-y-3">
          {report.investors.map((investor) => (
            <div
              key={investor.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-foreground">{investor.displayName}</h4>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                    {investor.percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Kapitál: {formatCurrency(investor.capital)}</span>
                  <span>Posledná aktivita: {formatDate(investor.lastActivity)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-24 ml-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(investor.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Percentá sú vypočítané na základe kapitálu investorov voči celkovému NAV.
            Posledná aktivita zahŕňa vklady, výbery a ostatné transakcie.
          </span>
        </div>
      </div>
    </div>
  );
}
