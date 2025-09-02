import { useState } from 'react';
import { PeriodSnapshot, SnapshotFilters } from '@/types/api';
import { useSnapshots, useDeleteSnapshot } from '../hooks';

interface SnapshotsListProps {
  onCreateSnapshot?: () => void;
}

export function SnapshotsList({ onCreateSnapshot }: SnapshotsListProps) {
  const [filters, setFilters] = useState<SnapshotFilters>({});
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);

  const { data: snapshotsData, isLoading, error } = useSnapshots(filters);
  const deleteSnapshotMutation = useDeleteSnapshot();

  const handleDeleteSnapshot = async (id: string) => {
    if (window.confirm('Naozaj chcete odstrániť tento snapshot?')) {
      try {
        await deleteSnapshotMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting snapshot:', error);
      }
    }
  };

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

  const toggleExpanded = (snapshotId: string) => {
    setExpandedSnapshot(expandedSnapshot === snapshotId ? null : snapshotId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam snapshots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Chyba pri načítavaní snapshots</p>
      </div>
    );
  }

  const snapshots = snapshotsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="month"
          placeholder="Obdobie"
          value={filters.period || ''}
          onChange={(e) => setFilters({ ...filters, period: e.target.value || undefined })}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />

        <input
          type="date"
          placeholder="Od dátumu"
          value={filters.dateFrom || ''}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />

        <input
          type="date"
          placeholder="Do dátumu"
          value={filters.dateTo || ''}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Snapshots List */}
      <div className="space-y-4">
        {snapshots.length === 0 ? (
          <div className="text-center py-8">
            <div className="space-y-2">
              <svg className="w-12 h-12 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-muted-foreground">Žiadne snapshots nenájdené</p>
              <p className="text-sm text-muted-foreground">Vytvorte prvý snapshot pre uloženie aktuálneho NAV</p>
            </div>
            {onCreateSnapshot && (
              <button
                onClick={onCreateSnapshot}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Vytvoriť prvý snapshot
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots
              .sort((a, b) => b.period.localeCompare(a.period)) // Sort by period descending
              .map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="border border-border rounded-lg bg-card overflow-hidden"
                >
                  {/* Snapshot Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            {formatPeriod(snapshot.period)}
                          </h3>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(snapshot.nav)}
                            </p>
                            <p className="text-sm text-muted-foreground">NAV</p>
                          </div>
                        </div>
                        
                        {/* Quick Summary */}
                        <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Aktíva: {formatCurrency(snapshot.totals.assets)}</span>
                          <span>Hotovosť: {formatCurrency(snapshot.totals.cash)}</span>
                          <span>Záväzky: {formatCurrency(snapshot.totals.liabilities)}</span>
                          {snapshot.fee && (
                            <span>Fee: {formatCurrency(snapshot.fee.totalFee)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpanded(snapshot.id)}
                          className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          {expandedSnapshot === snapshot.id ? 'Skryť detaily' : 'Zobraziť detaily'}
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          disabled={deleteSnapshotMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Odstrániť
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSnapshot === snapshot.id && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ownership Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">
                            Rozdelenie podielov
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(snapshot.ownership).map(([investorId, capital]) => {
                              const percentage = (capital / snapshot.nav) * 100;
                              return (
                                <div
                                  key={investorId}
                                  className="flex items-center justify-between p-2 bg-background rounded border border-border"
                                >
                                  <span className="text-sm font-medium text-foreground">
                                    Investor {investorId.slice(-6)}
                                  </span>
                                  <div className="text-right">
                                    <span className="text-sm font-medium text-foreground">
                                      {percentage.toFixed(2)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({formatCurrency(capital)})
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Performance Fee Details */}
                        {snapshot.fee && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Performance Fee
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sadzba:</span>
                                <span className="text-foreground">{snapshot.fee.rate}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Celkový fee:</span>
                                <span className="text-foreground">
                                  {formatCurrency(snapshot.fee.totalFee)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pre manažérov:</span>
                                <span className="text-foreground">
                                  {formatCurrency(snapshot.fee.managerShare)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pre investorov:</span>
                                <span className="text-foreground">
                                  {formatCurrency(snapshot.fee.investorShare)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
