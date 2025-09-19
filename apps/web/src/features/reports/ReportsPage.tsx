import { Button } from '@/ui/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/ui/card';
import { DatePicker } from '@/ui/ui/date-picker';
import { Label } from '@/ui/ui/label';
import { useState } from 'react';
import { CashflowReportCard } from './ui/CashflowReportCard';
import { InvestorReportCard } from './ui/InvestorReportCard';
import { PerformanceReportCard } from './ui/PerformanceReportCard';
import { PortfolioReportCard } from './ui/PortfolioReportCard';

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
    <div className="space-y-4 xs:space-y-6">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Reporty</h1>
        <p className="text-xs xs:text-sm text-muted-foreground">
          Analýzy a prehľady výkonnosti s možnosťou CSV exportu
        </p>
      </div>

      {/* Report Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg">Dostupné reporty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 mb-4 xs:mb-6">
            {reportTabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeReport === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveReport(tab.id)}
                className="h-auto p-3 xs:p-4 text-left justify-start"
              >
                <div className="flex flex-col items-start space-y-1 xs:space-y-2">
                  <div className="text-xl xs:text-2xl">{tab.icon}</div>
                  <h3 className="font-medium text-sm xs:text-base">{tab.label}</h3>
                  <p className="text-xs xs:text-sm text-muted-foreground">{tab.description}</p>
                </div>
              </Button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 xs:gap-4 p-3 xs:p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Label htmlFor="period" className="text-xs xs:text-sm font-medium text-foreground">
                Obdobie:
              </Label>
              <input
                id="period"
                type="month"
                value={(filters.period as string) ?? ''}
                onChange={e => setFilters({ ...filters, period: e.target.value ?? undefined })}
                className="px-2 py-1 text-xs xs:text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom" className="text-xs xs:text-sm font-medium text-foreground">
                Od:
              </Label>
              <DatePicker
                placeholder="Od dátumu"
                date={filters.dateFrom ? new Date(filters.dateFrom as string) : undefined}
                onSelect={(date: Date | undefined) =>
                  setFilters({
                    ...filters,
                    dateFrom: date ? date.toISOString().split('T')[0] : undefined,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo" className="text-xs xs:text-sm font-medium text-foreground">
                Do:
              </Label>
              <DatePicker
                placeholder="Do dátumu"
                date={filters.dateTo ? new Date(filters.dateTo as string) : undefined}
                onSelect={(date: Date | undefined) =>
                  setFilters({
                    ...filters,
                    dateTo: date ? date.toISOString().split('T')[0] : undefined,
                  })
                }
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => setFilters({})} className="text-xs xs:text-sm">
              Vymazať filtre
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Report */}
      {renderActiveReport()}
    </div>
  );
}
