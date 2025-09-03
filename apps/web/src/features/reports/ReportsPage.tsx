import { useState } from 'react';
import { PortfolioReportCard } from './ui/PortfolioReportCard';
import { InvestorReportCard } from './ui/InvestorReportCard';
import { PerformanceReportCard } from './ui/PerformanceReportCard';
import { CashflowReportCard } from './ui/CashflowReportCard';

type ReportType = 'portfolio' | 'investors' | 'performance' | 'cashflow';

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('portfolio');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const reportTabs = [
    {
      id: 'portfolio' as ReportType,
      label: 'Portfolio',
      icon: '📊',
      description: 'Prehľad portfólia aktív',
    },
    {
      id: 'investors' as ReportType,
      label: 'Investori',
      icon: '💰',
      description: 'Report pre investorov',
    },
    {
      id: 'performance' as ReportType,
      label: 'Výkonnosť',
      icon: '📈',
      description: 'Analýza výkonnosti',
    },
    {
      id: 'cashflow' as ReportType,
      label: 'Cashflow',
      icon: '💸',
      description: 'Peňažné toky',
    },
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'portfolio':
        return <PortfolioReportCard filters={filters} />;
      case 'investors':
        return <InvestorReportCard filters={filters} />;
      case 'performance':
        return <PerformanceReportCard filters={filters} />;
      case 'cashflow':
        return <CashflowReportCard filters={filters} />;
      default:
        return <PortfolioReportCard filters={filters} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reporty</h1>
        <p className="text-muted-foreground">
          Analýzy a prehľady výkonnosti s možnosťou CSV exportu
        </p>
      </div>

      {/* Report Tabs */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Dostupné reporty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeReport === tab.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted text-foreground'
              }`}
            >
              <div className="text-2xl mb-2">{tab.icon}</div>
              <h3 className="font-medium">{tab.label}</h3>
              <p className="text-sm text-muted-foreground">{tab.description}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="period" className="text-sm font-medium text-foreground">
              Obdobie:
            </label>
            <input
              id="period"
              type="month"
              value={(filters.period as string) ?? ''}
              onChange={e => setFilters({ ...filters, period: e.target.value ?? undefined })}
              className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="dateFrom" className="text-sm font-medium text-foreground">
              Od:
            </label>
            <input
              id="dateFrom"
              type="date"
              value={(filters.dateFrom as string) ?? ''}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value ?? undefined })}
              className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="dateTo" className="text-sm font-medium text-foreground">
              Do:
            </label>
            <input
              id="dateTo"
              type="date"
              value={(filters.dateTo as string) ?? ''}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value ?? undefined })}
              className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setFilters({})}
            className="px-3 py-1 text-sm font-medium text-muted-foreground bg-background border border-border rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Vymazať filtre
          </button>
        </div>
      </div>

      {/* Active Report */}
      {renderActiveReport()}
    </div>
  );
}
