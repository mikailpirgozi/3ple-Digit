import React, { useState } from 'react';
import { useInvestors, useCreateInvestor, useDeleteInvestor } from './hooks';
import { InvestorForm } from './ui/InvestorForm';
import { CreateInvestorRequest } from '@/types/api';

export function InvestorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // API hooks
  const { data: investorsData, isLoading, error } = useInvestors({
    q: searchQuery || undefined,
  });
  const createInvestorMutation = useCreateInvestor();
  const deleteInvestorMutation = useDeleteInvestor();

  // Handlers
  const handleCreateInvestor = async (data: CreateInvestorRequest) => {
    try {
      await createInvestorMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create investor:', error);
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    if (window.confirm('Ste si istí, že chcete odstrániť tohto investora?')) {
      try {
        await deleteInvestorMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete investor:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investori</h1>
          <p className="text-muted-foreground">
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
          <h1 className="text-3xl font-bold text-foreground">Investori</h1>
          <p className="text-muted-foreground">
            Správa investorov a ich kapitálových vkladov
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Chyba pri načítavaní investorov: {(error as any)?.message || 'Neznáma chyba'}
          </p>
        </div>
      </div>
    );
  }

  const investors = investorsData?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investori</h1>
        <p className="text-muted-foreground">
          Správa investorov a ich kapitálových vkladov
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Hľadať investorov..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Pridať investora
        </button>
      </div>

      {/* Create investor form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Nový investor
          </h2>
          <InvestorForm
            onSubmit={handleCreateInvestor}
            onCancel={() => setShowForm(false)}
            isLoading={createInvestorMutation.isPending}
          />
        </div>
      )}

      {/* Investors list */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Zoznam investorov ({investors.length})
        </h2>
        
        {investors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'Žiadni investori nenájdení.' : 'Zatiaľ nemáte žiadnych investorov.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {investors.map((investor) => (
              <div
                key={investor.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-foreground">{investor.displayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {investor.status === 'active' ? 'Aktívny' : 'Neaktívny'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vytvorený: {new Date(investor.createdAt).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteInvestor(investor.id)}
                    disabled={deleteInvestorMutation.isPending}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteInvestorMutation.isPending ? 'Odstraňovanie...' : 'Odstrániť'}
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
