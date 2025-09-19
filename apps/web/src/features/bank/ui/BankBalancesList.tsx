import type { BankBalance, BankFilters } from '@/types/api';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/ui/card';
import { DatePicker } from '@/ui/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/ui/select';
import { Skeleton } from '@/ui/ui/skeleton';
import { useState } from 'react';
import { useAccountNames, useBankBalances, useDeleteBankBalance } from '../hooks';

interface BankBalancesListProps {
  onCreateNewAccount?: () => void;
  onAddBalanceToAccount?: (accountName: string) => void;
  onEditBalance?: (balance: BankBalance) => void;
  onImportCsv?: () => void;
}

type SortOption = 'amount' | 'date' | 'accountName';

export function BankBalancesList({
  onCreateNewAccount,
  onAddBalanceToAccount,
  onEditBalance,
  onImportCsv,
}: BankBalancesListProps) {
  const [filters, setFilters] = useState<BankFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    balanceId: string;
    accountName: string;
  }>({
    open: false,
    balanceId: '',
    accountName: '',
  });

  const { data: balancesData, isLoading, error } = useBankBalances(filters);
  const { data: accountNames } = useAccountNames();
  const deleteBalanceMutation = useDeleteBankBalance();

  const handleDeleteBalance = (id: string, accountName: string) => {
    setDeleteConfirm({
      open: true,
      balanceId: id,
      accountName,
    });
  };

  const confirmDeleteBalance = async () => {
    try {
      await deleteBalanceMutation.mutateAsync(deleteConfirm.balanceId);
      setDeleteConfirm({ open: false, balanceId: '', accountName: '' });
    } catch (error) {
      console.error('Error deleting balance:', error);
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
    return dateObj.toLocaleDateString('sk-SK');
  };

  // Group balances by account name and get latest balance for each account
  const getAccountSummary = () => {
    if (!balancesData?.balances) return [];

    const accountGroups =
      balancesData?.balances?.reduce(
        (acc, balance) => {
          acc[balance.accountName] ??= [];
          acc[balance.accountName]?.push(balance);
          return acc;
        },
        {} as Record<string, BankBalance[]>
      ) ?? {};

    return Object.entries(accountGroups).map(([accountName, balances]) => {
      const sortedBalances = balances.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latestBalance = sortedBalances[0];
      const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);

      return {
        accountName,
        latestBalance,
        totalBalance,
        balanceCount: balances.length,
        balances: sortedBalances,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-12 w-32" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
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
          <p className="text-destructive">Chyba pri načítavaní zostatkov</p>
        </CardContent>
      </Card>
    );
  }

  const balances = balancesData?.items ?? [];
  const accountSummary = getAccountSummary();
  const totalAmount = accountSummary.reduce(
    (sum, account) => sum + (account.latestBalance?.amount ?? 0),
    0
  );

  // Sort balances based on selected criteria
  const sortedBalances = [...balances].sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case 'amount':
        aValue = a.amount ?? 0;
        bValue = b.amount ?? 0;
        break;
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'accountName':
        aValue = a.accountName.toLowerCase();
        bValue = b.accountName.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortBy === 'accountName') {
      return sortOrder === 'asc'
        ? (aValue as string).localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue as string);
    } else {
      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">Celkový zostatok</h3>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Počet účtov</p>
              <p className="text-lg font-semibold text-foreground">{accountSummary.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.accountName ?? 'all'}
                onValueChange={(value: string) =>
                  setFilters({ ...filters, accountName: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Všetky účty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky účty</SelectItem>
                  {accountNames?.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  <SelectItem value="amount">Zoradiť podľa sumy</SelectItem>
                  <SelectItem value="date">Zoradiť podľa dátumu</SelectItem>
                  <SelectItem value="accountName">Zoradiť podľa účtu</SelectItem>
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

            <div className="flex gap-2">
              {onImportCsv && (
                <Button variant="outline" onClick={onImportCsv}>
                  Import CSV
                </Button>
              )}
              {onCreateNewAccount && <Button onClick={onCreateNewAccount}>Nový účet</Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary View */}
      {!filters.accountName && accountSummary.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Prehľad účtov</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountSummary.map(account => (
              <Card key={account.accountName} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">{account.accountName}</h4>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(account.latestBalance?.amount ?? 0)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Posledná aktualizácia</span>
                      <span>{formatDate(account.latestBalance?.date ?? new Date())}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Počet záznamov</span>
                      <span>{account.balanceCount}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ ...filters, accountName: account.accountName })}
                        className="flex-1"
                      >
                        Zobraziť históriu
                      </Button>
                      {onAddBalanceToAccount && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onAddBalanceToAccount(account.accountName)}
                          className="flex-1"
                        >
                          Pridať zostatok
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Balances List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {filters.accountName ? `História účtu: ${filters.accountName}` : 'Všetky zostatky'}
            </CardTitle>
            {filters.accountName && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, accountName: undefined })}
              >
                Zobraziť všetky účty
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sortedBalances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Žiadne zostatky nenájdené</p>
              {onCreateNewAccount && (
                <Button onClick={onCreateNewAccount} className="mt-2">
                  Vytvoriť prvý účet
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBalances.map(balance => (
                <Card key={balance.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-foreground">{balance.accountName}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(balance.date)}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency(balance.amount)}
                          </p>
                          {balance.bankName && (
                            <p className="text-sm text-muted-foreground">
                              Banka: {balance.bankName}
                            </p>
                          )}
                          {balance.accountType && (
                            <p className="text-sm text-muted-foreground">
                              Typ: {balance.accountType}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onEditBalance && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditBalance(balance)}
                          >
                            Upraviť
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBalance(balance.id, balance.accountName)}
                          disabled={deleteBalanceMutation.isPending}
                        >
                          Odstrániť
                        </Button>
                      </div>
                    </div>
                  </CardContent>
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
            <AlertDialogTitle>Odstrániť zostatok</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť zostatok pre účet &quot;{deleteConfirm.accountName}&quot;?
              Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBalance}
              disabled={deleteBalanceMutation.isPending}
            >
              {deleteBalanceMutation.isPending ? 'Odstraňuje...' : 'Odstrániť'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
