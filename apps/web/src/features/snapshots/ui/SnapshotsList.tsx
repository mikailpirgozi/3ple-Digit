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
    <div className="space-y-4 xs:space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <div className="flex flex-col xs:flex-row xs:flex-wrap gap-2 xs:gap-4">
            <input
              type="month"
              placeholder="Obdobie"
              value={filters.period ?? ''}
              onChange={e => setFilters({ ...filters, period: e.target.value ?? undefined })}
              className="px-2 xs:px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs xs:text-sm"
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
              <SelectTrigger className="w-full xs:w-[200px]">
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
              className="text-xs xs:text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots List */}
      <Card>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          {sortedSnapshots.length === 0 ? (
            <div className="text-center py-6 xs:py-8">
              <div className="space-y-2">
                <svg
                  className="w-8 h-8 xs:w-12 xs:h-12 text-muted-foreground mx-auto"
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
                <p className="text-xs xs:text-sm text-muted-foreground">Žiadne snapshots nenájdené</p>
                <p className="text-xs text-muted-foreground">
                  Vytvorte prvý snapshot pre uloženie aktuálneho NAV
                </p>
              </div>
              {onCreateSnapshot && (
                <Button onClick={onCreateSnapshot} className="mt-3 xs:mt-4 text-xs xs:text-sm">
                  Vytvoriť prvý snapshot
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-3">
              {sortedSnapshots.map(snapshot => (
                <Card key={snapshot.id} className="overflow-hidden">
                  {/* Snapshot Header */}
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                          <h3 className="text-sm xs:text-lg font-semibold text-foreground">
                            {formatDate(snapshot.date)}
                          </h3>
                          <div className="text-left xs:text-right">
                            <p className="text-lg xs:text-xl font-bold text-primary">
                              {formatCurrency(snapshot.nav)}
                            </p>
                            <p className="text-xs xs:text-sm text-muted-foreground">NAV</p>
                          </div>
                        </div>

                        {/* Quick Summary */}
                        <div className="mt-2 flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-6 text-xs xs:text-sm text-muted-foreground">
                          <span>Aktíva: {formatCurrency(snapshot.totalAssetValue)}</span>
                          <span>Hotovosť: {formatCurrency(snapshot.totalBankBalance)}</span>
                          <span>Záväzky: {formatCurrency(snapshot.totalLiabilities)}</span>
                          {snapshot.totalPerformanceFee && (
                            <span>Fee: {formatCurrency(snapshot.totalPerformanceFee)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(snapshot.id)}
                          className="text-xs xs:text-sm"
                        >
                          {expandedSnapshot === snapshot.id ? 'Skryť detaily' : 'Zobraziť detaily'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          disabled={deleteSnapshotMutation.isPending}
                          className="text-xs xs:text-sm"
                        >
                          Odstrániť
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  {/* Expanded Details */}
                  {expandedSnapshot === snapshot.id && (
                    <div className="border-t border-border bg-muted/30 p-3 xs:p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                        {/* Ownership Breakdown */}
                        <div>
                          <h4 className="text-xs xs:text-sm font-medium text-foreground mb-2 xs:mb-3">
                            Rozdelenie podielov
                          </h4>
                          <div className="space-y-1 xs:space-y-2">
                            {snapshot.investorSnapshots?.map(investorSnapshot => {
                              return (
                                <Card key={investorSnapshot.id}>
                                  <CardContent className="p-2">
                                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-2">
                                      <span className="text-xs xs:text-sm font-medium text-foreground">
                                        Investor {investorSnapshot.investorId}
                                      </span>
                                      <div className="text-left xs:text-right">
                                        <span className="text-xs xs:text-sm font-medium text-foreground">
                                          {investorSnapshot.ownershipPercentage.toFixed(2)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1 xs:ml-2">
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
                          <Card className="mt-3 xs:mt-4">
                            <CardContent className="p-2 xs:p-3">
                              <div className="space-y-1 xs:space-y-2">
                                <div className="flex justify-between text-xs xs:text-sm font-medium">
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
                                <div className="flex justify-between text-xs xs:text-sm font-medium">
                                  <span className="text-muted-foreground">Celkové %:</span>
                                  <span className="text-foreground">
                                    {snapshot.investorSnapshots
                                      ?.reduce((sum, inv) => sum + inv.ownershipPercentage, 0)
                                      .toFixed(2) ?? '0.00'}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs xs:text-sm font-medium">
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
                            <h4 className="text-xs xs:text-sm font-medium text-foreground mb-2 xs:mb-3">
                              Performance Fee
                            </h4>
                            <Card>
                              <CardContent className="p-2 xs:p-3">
                                <div className="space-y-1 xs:space-y-2">
                                  <div className="flex justify-between text-xs xs:text-sm">
                                    <span className="text-muted-foreground">Sadzba:</span>
                                    <span className="text-foreground">
                                      {snapshot.performanceFeeRate}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs xs:text-sm">
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
