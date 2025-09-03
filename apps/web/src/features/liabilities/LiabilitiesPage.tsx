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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Záväzky</h1>
          <p className="text-muted-foreground">Prehľad úverov a ostatných záväzkov</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Pridať záväzok
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <LiabilityForm
            liability={editingLiability ?? undefined}
            onSubmit={editingLiability ? handleUpdateLiability : handleCreateLiability}
            onCancel={handleCancelForm}
            isLoading={createLiabilityMutation.isPending ?? updateLiabilityMutation.isPending}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Aktívne záväzky</h2>
          <LiabilitiesList
            onCreateLiability={() => setShowForm(true)}
            onEditLiability={handleEditLiability}
          />
        </div>
      )}
    </div>
  );
}
