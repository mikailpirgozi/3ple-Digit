import { useState } from 'react';
import type { Liability, CreateLiabilityRequest, UpdateLiabilityRequest } from '@/types/api';
import { useCreateLiability, useUpdateLiability } from './hooks';
import { LiabilitiesList } from './ui/LiabilitiesList';
import { LiabilityForm } from './ui/LiabilityForm';

export function LiabilitiesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  const createLiabilityMutation = useCreateLiability();
  const updateLiabilityMutation = useUpdateLiability();

  const handleCreateLiability = async (data: CreateLiabilityRequest) => {
    try {
      await createLiabilityMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating liability:', error);
    }
  };

  const handleUpdateLiability = async (data: UpdateLiabilityRequest) => {
    if (!editingLiability) return;

    try {
      await updateLiabilityMutation.mutateAsync({ id: editingLiability.id, data });
      setEditingLiability(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating liability:', error);
    }
  };

  const handleEditLiability = (liability: Liability) => {
    setEditingLiability(liability);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLiability(null);
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Záväzky</h1>
          <p className="text-xs xs:text-sm text-muted-foreground">Prehľad úverov a ostatných záväzkov</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
          >
            Pridať záväzok
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
          <LiabilityForm
            liability={editingLiability ?? undefined}
            onSubmit={editingLiability ? handleUpdateLiability : handleCreateLiability}
            onCancel={handleCancelForm}
            isLoading={createLiabilityMutation.isPending ?? updateLiabilityMutation.isPending}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
          <h2 className="text-lg xs:text-xl font-semibold text-foreground mb-3 xs:mb-4">Aktívne záväzky</h2>
          <LiabilitiesList
            onCreateLiability={() => setShowForm(true)}
            onEditLiability={handleEditLiability}
          />
        </div>
      )}
    </div>
  );
}
