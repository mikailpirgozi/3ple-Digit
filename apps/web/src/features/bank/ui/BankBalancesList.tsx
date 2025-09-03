import { BankBalance, BankFilters } from '@/types/api';
import { useState } from 'react';
import { useAccountNames, useBankBalances, useDeleteBankBalance } from '../hooks';

interface BankBalancesListProps {
  onCreateBalance?: () => void;
  onEditBalance?: (balance: BankBalance) => void;
  onImportCsv?: () => void;
}

type SortOption = 'amount' | 'date' | 'accountName';

export function BankBalancesList({
  onCreateBalance,
  onEditBalance,
  onImportCsv,
}: BankBalancesListProps) {
  const [filters, setFilters] = useState<BankFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: balancesData, isLoading, error } = useBankBalances(filters);
  const { data: accountNames } = useAccountNames();
  const deleteBalanceMutation = useDeleteBankBalance();

  const handleDeleteBalance = async (id: string) => {
    if (window.confirm('Naozaj chcete odstrániť tento zostatok?')) {
      try {
        await deleteBalanceMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting balance:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  // Group balances by account name and get latest balance for each account
  const getAccountSummary = () => {
    if (!balancesData?.balances) return [];

    const accountGroups = balancesData.balances.reduce(
      (acc, balance) => {
        if (!acc[balance.accountName]) {
          acc[balance.accountName] = [];
        }
        acc[balance.accountName].push(balance);
        return acc;
      },
      {} as Record<string, BankBalance[]>
    );

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
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam zostatky...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Chyba pri načítavaní zostatkov</p>
      </div>
    );
  }

  const balances = balancesData?.items || [];
  const accountSummary = getAccountSummary();
  const totalAmount = accountSummary.reduce(
    (sum, account) => sum + account.latestBalance.amount,
    0
  );

  // Sort balances based on selected criteria
  const sortedBalances = [...balances].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
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
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
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
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.accountName || ''}
            onChange={e => setFilters({ ...filters, accountName: e.target.value || undefined })}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Všetky účty</option>
            {accountNames?.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="date"
            placeholder="Od dátumu"
            value={filters.dateFrom || ''}
            onChange={e => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <input
            type="date"
            placeholder="Do dátumu"
            value={filters.dateTo || ''}
            onChange={e => setFilters({ ...filters, dateTo: e.target.value || undefined })}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="amount">Zoradiť podľa sumy</option>
            <option value="date">Zoradiť podľa dátumu</option>
            <option value="accountName">Zoradiť podľa účtu</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            title={sortOrder === 'asc' ? 'Zostupne' : 'Vzostupne'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex gap-2">
          {onImportCsv && (
            <button
              onClick={onImportCsv}
              className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Import CSV
            </button>
          )}
          {onCreateBalance && (
            <button
              onClick={onCreateBalance}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Pridať zostatok
            </button>
          )}
        </div>
      </div>

      {/* Account Summary View */}
      {!filters.accountName && accountSummary.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Prehľad účtov</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountSummary.map(account => (
              <div
                key={account.accountName}
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">{account.accountName}</h4>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(account.latestBalance.amount)}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Posledná aktualizácia</span>
                    <span>{formatDate(account.latestBalance.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Počet záznamov</span>
                    <span>{account.balanceCount}</span>
                  </div>
                  <button
                    onClick={() => setFilters({ ...filters, accountName: account.accountName })}
                    className="w-full mt-2 px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Zobraziť históriu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Balances List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">
            {filters.accountName ? `História účtu: ${filters.accountName}` : 'Všetky zostatky'}
          </h3>
          {filters.accountName && (
            <button
              onClick={() => setFilters({ ...filters, accountName: undefined })}
              className="px-3 py-1 text-sm font-medium text-muted-foreground bg-background border border-border rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Zobraziť všetky účty
            </button>
          )}
        </div>

        {sortedBalances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Žiadne zostatky nenájdené</p>
            {onCreateBalance && (
              <button
                onClick={onCreateBalance}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Pridať prvý zostatok
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedBalances.map(balance => (
              <div
                key={balance.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">{balance.accountName}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(balance.date)}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {formatCurrency(balance.amount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onEditBalance && (
                    <button
                      onClick={() => onEditBalance(balance)}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Upraviť
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBalance(balance.id)}
                    disabled={deleteBalanceMutation.isPending}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Odstrániť
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
