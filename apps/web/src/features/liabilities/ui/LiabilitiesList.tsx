import type { Liability } from '@/types/api';
import { useLiabilities, useDeleteLiability } from '../hooks';

interface LiabilitiesListProps {
  onCreateLiability?: () => void;
  onEditLiability?: (liability: Liability) => void;
}

export function LiabilitiesList({ onCreateLiability, onEditLiability }: LiabilitiesListProps) {
  const { data: liabilitiesData, isLoading, error } = useLiabilities();
  const deleteLiabilityMutation = useDeleteLiability();

  const handleDeleteLiability = async (id: string) => {
    if (window.confirm('Naozaj chcete odstrániť tento záväzok?')) {
      try {
        await deleteLiabilityMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting liability:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam záväzky...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Chyba pri načítavaní záväzkov</p>
      </div>
    );
  }

  const liabilities = liabilitiesData?.liabilities ?? [];
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum + liability.currentBalance,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">Celkové záväzky</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Počet záväzkov</p>
            <p className="text-lg font-semibold text-foreground">{liabilities.length}</p>
          </div>
        </div>
      </div>

      {/* Liabilities List */}
      <div className="space-y-4">
        {liabilities.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-muted-foreground">Žiadne záväzky nenájdené</p>
              <p className="text-sm text-muted-foreground">Skvelé! Nemáte žiadne záväzky.</p>
            </div>
            {onCreateLiability && (
              <button
                onClick={onCreateLiability}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Pridať prvý záväzok
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {liabilities
              .sort((a, b) => b.currentBalance - a.currentBalance) // Sort by balance descending
              .map(liability => (
                <div
                  key={liability.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{liability.name}</h3>
                      {liability.note && (
                        <p className="text-sm text-muted-foreground">{liability.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Vytvorené: {formatDate(liability.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(liability.currentBalance)}
                      </p>
                      <p className="text-sm text-muted-foreground">Zostatok</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onEditLiability && (
                        <button
                          onClick={() => onEditLiability(liability)}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Upraviť
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLiability(liability.id)}
                        disabled={deleteLiabilityMutation.isPending}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Odstrániť
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {liabilities.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
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
              Záväzky sú zoradené podľa výšky zostatku. Celkové záväzky sa odpočítavaju od NAV.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
