import { useState } from 'react';
import { useCreateSnapshot } from './hooks';
import { CurrentNavCard } from './ui/CurrentNavCard';
import { SnapshotForm } from './ui/SnapshotForm';
import { SnapshotsList } from './ui/SnapshotsList';

export function SnapshotsPage() {
  const [showForm, setShowForm] = useState(false);

  const createSnapshotMutation = useCreateSnapshot();

  const handleCreateSnapshot = async (data: { performanceFeeRate?: number }) => {
    try {
      await createSnapshotMutation.mutateAsync({
        date: new Date().toISOString(),
        performanceFeeRate: data.performanceFeeRate,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating snapshot:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Snapshots</h1>
        <p className="text-xs xs:text-sm text-muted-foreground">
          Mesačné snapshots s NAV výpočtom a rozdelením podielov
        </p>
      </div>

      {/* Current NAV Card */}
      <CurrentNavCard onCreateSnapshot={() => setShowForm(true)} />

      {/* Snapshot Form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
          <SnapshotForm
            onSubmit={handleCreateSnapshot}
            onCancel={handleCancelForm}
            isLoading={createSnapshotMutation.isPending}
          />
        </div>
      )}

      {/* Historical Snapshots */}
      <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
        <h2 className="text-lg xs:text-xl font-semibold text-foreground mb-3 xs:mb-4">História snapshots</h2>
        <SnapshotsList onCreateSnapshot={() => setShowForm(true)} />
      </div>
    </div>
  );
}
