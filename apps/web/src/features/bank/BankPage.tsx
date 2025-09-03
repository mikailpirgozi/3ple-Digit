import { useState } from 'react';
import type { BankBalance, CreateBankBalanceRequest, UpdateBankBalanceRequest } from '@/types/api';
import { useCreateBankBalance, useUpdateBankBalance } from './hooks';
import { BankBalancesList } from './ui/BankBalancesList';
import { BankBalanceForm } from './ui/BankBalanceForm';
import { CsvImportModal } from './ui/CsvImportModal';

export function BankPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState<BankBalance | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const createBalanceMutation = useCreateBankBalance();
  const updateBalanceMutation = useUpdateBankBalance();

  const handleCreateBalance = async (data: CreateBankBalanceRequest) => {
    try {
      await createBalanceMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating balance:', error);
    }
  };

  const handleUpdateBalance = async (data: UpdateBankBalanceRequest) => {
    if (!editingBalance) return;

    try {
      await updateBalanceMutation.mutateAsync({ id: editingBalance.id, data });
      setEditingBalance(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleEditBalance = (balance: BankBalance) => {
    setEditingBalance(balance);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBalance(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bankové účty</h1>
          <p className="text-muted-foreground">Prehľad bankových účtov a hotovostných pozícií</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Import CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Pridať zostatok
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <BankBalanceForm
            balance={editingBalance ?? undefined}
            onSubmit={editingBalance ? handleUpdateBalance : handleCreateBalance}
            onCancel={handleCancelForm}
            isLoading={createBalanceMutation.isPending ?? updateBalanceMutation.isPending}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <BankBalancesList
            onCreateBalance={() => setShowForm(true)}
            onEditBalance={handleEditBalance}
            onImportCsv={() => setShowImportModal(true)}
          />
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && <CsvImportModal onClose={() => setShowImportModal(false)} />}
    </div>
  );
}
