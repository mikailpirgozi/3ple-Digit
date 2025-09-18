import type { SnapshotFilters } from '@/types/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/ui/alert-dialog';
import { Button } from '@/ui/ui/button';
import { Card, CardContent } from '@/ui/ui/card';
import { DatePicker } from '@/ui/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/ui/select';
import { Skeleton } from '@/ui/ui/skeleton';
import { useState } from 'react';
import { useDeleteSnapshot, useSnapshots } from '../hooks';

interface SnapshotsListProps {
  onCreateSnapshot?: () => void;
}

type SortOption = 'date' | 'nav' | 'totalAssetValue';

export function SnapshotsList({ onCreateSnapshot }: SnapshotsListProps) {
  const [filters, setFilters] = useState<SnapshotFilters>({});
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; snapshotId: string }>({
    open: false,
    snapshotId: '',
  });

  const { data: snapshotsData, isLoading, error } = useSnapshots(filters);
  const deleteSnapshotMutation = useDeleteSnapshot();

  const handleDeleteSnapshot = (id: string) => {
    setDeleteConfirm({
      open: true,
      snapshotId: id,
    });
  };

  const confirmDeleteSnapshot = async () => {
    try {
      await deleteSnapshotMutation.mutateAsync(deleteConfirm.snapshotId);
      setDeleteConfirm({ open: false, snapshotId: '' });
    } catch (error) {
      console.error('Error deleting snapshot:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleExpanded = (snapshotId: string) => {
    setExpandedSnapshot(expandedSnapshot === snapshotId ? null : snapshotId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Chyba pri načítavaní snapshots</p>
        </CardContent>
      </Card>
    );
  }

  const snapshots = snapshotsData?.snapshots ?? [];

  // Sort snapshots based on selected criteria
  const sortedSnapshots = [...snapshots].sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case 'nav':
        aValue = a.nav ?? 0;
        bValue = b.nav ?? 0;
        break;
      case 'totalAssetValue':
        aValue = a.totalAssetValue ?? 0;
        bValue = b.totalAssetValue ?? 0;
        break;
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="month"
              placeholder="Obdobie"
              value={filters.period ?? ''}
              onChange={e => setFilters({ ...filters, period: e.target.value ?? undefined })}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <DatePicker
              placeholder="Od dátumu"
              date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
              onSelect={(date: Date | undefined) =>
                setFilters({
                  ...filters,
                  dateFrom: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
            />

            <DatePicker
              placeholder="Do dátumu"
              date={filters.dateTo ? new Date(filters.dateTo) : undefined}
              onSelect={(date: Date | undefined) =>
                setFilters({
                  ...filters,
                  dateTo: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
            />

            <Select
              value={sortBy}
              onValueChange={(value: string) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Zoradiť podľa dátumu</SelectItem>
                <SelectItem value="nav">Zoradiť podľa NAV</SelectItem>
                <SelectItem value="totalAssetValue">Zoradiť podľa aktív</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Zostupne' : 'Vzostupne'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots List */}
      <Card>
        <CardContent className="p-6">
          {sortedSnapshots.length === 0 ? (
            <div className="text-center py-8">
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 text-muted-foreground mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-muted-foreground">Žiadne snapshots nenájdené</p>
                <p className="text-sm text-muted-foreground">
                  Vytvorte prvý snapshot pre uloženie aktuálneho NAV
                </p>
              </div>
              {onCreateSnapshot && (
                <Button onClick={onCreateSnapshot} className="mt-4">
                  Vytvoriť prvý snapshot
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSnapshots.map(snapshot => (
                <Card key={snapshot.id} className="overflow-hidden">
                  {/* Snapshot Header */}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            {formatDate(snapshot.date)}
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
                          <span>Aktíva: {formatCurrency(snapshot.totalAssetValue)}</span>
                          <span>Hotovosť: {formatCurrency(snapshot.totalBankBalance)}</span>
                          <span>Záväzky: {formatCurrency(snapshot.totalLiabilities)}</span>
                          {snapshot.totalPerformanceFee && (
                            <span>Fee: {formatCurrency(snapshot.totalPerformanceFee)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(snapshot.id)}
                        >
                          {expandedSnapshot === snapshot.id ? 'Skryť detaily' : 'Zobraziť detaily'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          disabled={deleteSnapshotMutation.isPending}
                        >
                          Odstrániť
                        </Button>
                      </div>
                    </div>
                  </CardContent>

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
                            {snapshot.investorSnapshots?.map(investorSnapshot => {
                              return (
                                <Card key={investorSnapshot.id}>
                                  <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-foreground">
                                        Investor {investorSnapshot.investorId}
                                      </span>
                                      <div className="text-right">
                                        <span className="text-sm font-medium text-foreground">
                                          {investorSnapshot.ownershipPercentage.toFixed(2)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({formatCurrency(investorSnapshot.capital)})
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>

                          {/* Summary */}
                          <Card className="mt-4">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                  <span className="text-muted-foreground">Celkový kapitál:</span>
                                  <span className="text-foreground">
                                    {formatCurrency(
                                      snapshot.investorSnapshots?.reduce(
                                        (sum, inv) => sum + inv.capital,
                                        0
                                      ) ?? 0
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                  <span className="text-muted-foreground">Celkové %:</span>
                                  <span className="text-foreground">
                                    {snapshot.investorSnapshots
                                      ?.reduce((sum, inv) => sum + inv.ownershipPercentage, 0)
                                      .toFixed(2) ?? '0.00'}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                  <span className="text-muted-foreground">Počet investorov:</span>
                                  <span className="text-foreground">
                                    {snapshot.investorSnapshots?.length ?? 0}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Performance Fee Details */}
                        {snapshot.performanceFeeRate && snapshot.totalPerformanceFee && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Performance Fee
                            </h4>
                            <Card>
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sadzba:</span>
                                    <span className="text-foreground">
                                      {snapshot.performanceFeeRate}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Celkový fee:</span>
                                    <span className="text-foreground">
                                      {formatCurrency(snapshot.totalPerformanceFee)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open: boolean) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť snapshot</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť tento snapshot? Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSnapshot}
              disabled={deleteSnapshotMutation.isPending}
            >
              {deleteSnapshotMutation.isPending ? 'Odstraňuje...' : 'Odstrániť'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
