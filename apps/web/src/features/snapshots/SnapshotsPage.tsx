import { useState } from 'react';
import { useCreateSnapshot } from './hooks';
import { CurrentNavCard } from './ui/CurrentNavCard';
import { SnapshotForm } from './ui/SnapshotForm';
import { SnapshotsList } from './ui/SnapshotsList';

export function SnapshotsPage() {
  const [showForm, setShowForm] = useState(false);

  const createSnapshotMutation = useCreateSnapshot();

  const handleCreateSnapshot = async (data: any) => {
    try {
      await createSnapshotMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating snapshot:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Snapshots</h1>
        <p className="text-muted-foreground">
          Mesačné snapshots s NAV výpočtom a rozdelením podielov
        </p>
      </div>

      {/* Current NAV Card */}
      <CurrentNavCard onCreateSnapshot={() => setShowForm(true)} />

      {/* Snapshot Form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6">
          <SnapshotForm
            onSubmit={handleCreateSnapshot}
            onCancel={handleCancelForm}
            isLoading={createSnapshotMutation.isPending}
          />
        </div>
      )}

      {/* Historical Snapshots */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          História snapshots
        </h2>
        <SnapshotsList onCreateSnapshot={() => setShowForm(true)} />
      </div>
    </div>
  );
}
