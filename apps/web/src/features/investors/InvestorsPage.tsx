import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { CreateInvestorRequest } from '@/types/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui';
import { useState } from 'react';
import { useCreateInvestor, useDeleteInvestor, useInvestors } from './hooks';
import { InvestorForm } from './ui/InvestorForm';

type SortOption = 'name' | 'totalCapital' | 'createdAt';

export function InvestorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('totalCapital');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    investorId: string;
    investorName: string;
  }>({
    open: false,
    investorId: '',
    investorName: '',
  });
  const { toast } = useToast();

  // API hooks
  const {
    data: investorsData,
    isLoading,
    error,
  } = useInvestors({
    q: searchQuery ?? undefined,
  });
  const createInvestorMutation = useCreateInvestor();
  const deleteInvestorMutation = useDeleteInvestor();

  // Handlers
  const handleCreateInvestor = async (data: CreateInvestorRequest) => {
    try {
      await createInvestorMutation.mutateAsync(data);
      setShowForm(false);
      toast({
        title: 'Úspech',
        description: 'Investor bol úspešne vytvorený.',
      });
    } catch (error: unknown) {
      logger.apiError('create investor', error, { investorData: data });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa vytvoriť investora.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvestor = async (id: string, name: string) => {
    setDeleteConfirm({
      open: true,
      investorId: id,
      investorName: name,
    });
  };

  const confirmDeleteInvestor = async () => {
    try {
      await deleteInvestorMutation.mutateAsync(deleteConfirm.investorId);
      toast({
        title: 'Úspech',
        description: 'Investor bol úspešne odstránený.',
      });
      setDeleteConfirm({ open: false, investorId: '', investorName: '' });
    } catch (error: unknown) {
      logger.apiError('delete investor', error, { investorId: deleteConfirm.investorId });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa odstrániť investora.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Investori</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Správa investorov a ich kapitálových vkladov
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Investori</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Správa investorov a ich kapitálových vkladov
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm sm:text-base text-red-800">
            Chyba pri načítavaní investorov: {(error as Error)?.message ?? 'Neznáma chyba'}
          </p>
        </div>
      </div>
    );
  }

  const investors = investorsData?.investors ?? [];

  // Sort investors based on selected criteria
  const sortedInvestors = [...investors].sort((a, b) => {
    switch (sortBy) {
      case 'totalCapital': {
        const aValue = a.totalCapital ?? 0;
        const bValue = b.totalCapital ?? 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      case 'name': {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      case 'createdAt': {
        const aValue = new Date(a.createdAt).getTime();
        const bValue = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Investori</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Správa investorov a ich kapitálových vkladov
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Hľadať investorov..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="totalCapital">Zoradiť podľa kapitálu</option>
            <option value="name">Zoradiť podľa mena</option>
            <option value="createdAt">Zoradiť podľa dátumu</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            title={sortOrder === 'asc' ? 'Zostupne' : 'Vzostupne'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
        >
          Pridať investora
        </button>
      </div>

      {/* Create investor form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Nový investor</h2>
          <InvestorForm
            onSubmit={handleCreateInvestor}
            onCancel={() => setShowForm(false)}
            isLoading={createInvestorMutation.isPending}
          />
        </div>
      )}

      {/* Investors list */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Zoznam investorov ({investors.length})
        </h2>

        {sortedInvestors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm sm:text-base text-muted-foreground">
              {searchQuery ? 'Žiadni investori nenájdení.' : 'Zatiaľ nemáte žiadnych investorov.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInvestors.map(investor => (
              <div
                key={investor.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-3 sm:gap-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm sm:text-base">
                    {investor.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Kapitál:{' '}
                      <span className="font-semibold text-green-600">
                        €{(investor.totalCapital ?? 0).toLocaleString('sk-SK')}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Podiel:{' '}
                      <span className="font-semibold text-blue-600">
                        {(investor.ownershipPercent ?? 0).toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vytvorený: {new Date(investor.createdAt).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div className="flex items-center justify-end sm:justify-start">
                  <button
                    onClick={() => handleDeleteInvestor(investor.id, investor.name)}
                    disabled={deleteInvestorMutation.isPending}
                    className="px-3 py-1 text-xs sm:text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteInvestorMutation.isPending ? 'Odstraňovanie...' : 'Odstrániť'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open: boolean) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť investora</AlertDialogTitle>
            <AlertDialogDescription>
              Ste si istí, že chcete odstrániť investora &quot;{deleteConfirm.investorName}&quot;?
              Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInvestorMutation.isPending}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInvestor}
              disabled={deleteInvestorMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteInvestorMutation.isPending ? 'Spracúvam...' : 'Odstrániť'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
