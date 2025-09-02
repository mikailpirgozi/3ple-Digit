import { useCashflowReport, useExportCashflow } from '../hooks';

interface CashflowReportCardProps {
  filters?: Record<string, unknown>;
}

export function CashflowReportCard({ filters }: CashflowReportCardProps) {
  const { data: report, isLoading, error } = useCashflowReport(filters);
  const exportMutation = useExportCashflow();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
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
          <div className="text-muted-foreground">Načítavam cashflow report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Chyba pri načítavaní cashflow reportu</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Žiadne dáta pre cashflow report</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Cashflow Report</h2>
          <p className="text-sm text-muted-foreground">
            Prehľad peňažných tokov za {formatPeriod(report.period)}
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

      {/* Net Cashflow Summary */}
      <div className={`rounded-lg p-4 mb-6 border ${
        report.netCashflow >= 0 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Čistý peňažný tok</p>
          <p className={`text-3xl font-bold ${
            report.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {report.netCashflow >= 0 ? '+' : ''}{formatCurrency(report.netCashflow)}
          </p>
        </div>
      </div>

      {/* Investor Cashflows */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-foreground">Investorské toky</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Vklady</p>
            <p className="text-xl font-bold text-green-600">
              +{formatCurrency(report.deposits)}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Výbery</p>
            <p className="text-xl font-bold text-red-600">
              -{formatCurrency(report.withdrawals)}
            </p>
          </div>
          <div className={`rounded-lg p-4 text-center border ${
            report.netCashflow >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm text-muted-foreground mb-1">Čistý tok</p>
            <p className={`text-xl font-bold ${
              (report.deposits - report.withdrawals) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(report.deposits - report.withdrawals) >= 0 ? '+' : ''}
              {formatCurrency(report.deposits - report.withdrawals)}
            </p>
          </div>
        </div>
      </div>

      {/* Asset Cashflows */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-foreground">Toky z aktív</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Príjmy</p>
            <p className="text-xl font-bold text-green-600">
              +{formatCurrency(report.assetCashflows.paymentsIn)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nájomné, dividendy, splátky
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Výdavky</p>
            <p className="text-xl font-bold text-red-600">
              -{formatCurrency(report.assetCashflows.paymentsOut)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Opravy, poplatky, údržba
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">CAPEX</p>
            <p className="text-xl font-bold text-blue-600">
              -{formatCurrency(report.assetCashflows.capex)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Kapitálové investície
            </p>
          </div>
        </div>
      </div>

      {/* Cashflow Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Detailný rozpis</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Vklady investorov</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(report.deposits)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Výbery investorov</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(report.withdrawals)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Príjmy z aktív</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(report.assetCashflows.paymentsIn)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Výdavky na aktíva</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(report.assetCashflows.paymentsOut)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Kapitálové investície</span>
            <span className="font-medium text-blue-600">
              -{formatCurrency(report.assetCashflows.capex)}
            </span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
            <span className="font-medium text-foreground">Čistý peňažný tok</span>
            <span className={`font-bold ${
              report.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {report.netCashflow >= 0 ? '+' : ''}{formatCurrency(report.netCashflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Cashflow report zahŕňa všetky peňažné toky za dané obdobie.
            Kladný čistý tok znamená, že do fondu prišlo více peňazí než z neho odišlo.
          </span>
        </div>
      </div>
    </div>
  );
}
