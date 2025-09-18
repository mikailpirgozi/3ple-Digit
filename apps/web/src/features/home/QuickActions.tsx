import { useCreateAsset } from '@/features/assets/hooks';
import { useCreateSnapshot } from '@/features/snapshots/hooks';
import type { AssetType } from '@/types/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function QuickActionModal({ isOpen, onClose, title, children }: QuickActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg border border-border p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateSnapshotModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [performanceFeeRate, setPerformanceFeeRate] = useState<string>('');
  const createSnapshot = useCreateSnapshot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSnapshot.mutateAsync({
        date: new Date().toISOString(),
        performanceFeeRate: performanceFeeRate ? parseFloat(performanceFeeRate) : undefined,
      });
      onClose();
      // Zobrazenie úspešnej správy by sa mohlo pridať
    } catch (error) {
      console.error('Chyba pri vytváraní snapshot:', error);
    }
  };

  return (
    <QuickActionModal isOpen={isOpen} onClose={onClose} title="Vytvoriť snapshot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="snapshot-date" className="block text-sm font-medium mb-2">
            Dátum
          </label>
          <input
            id="snapshot-date"
            type="text"
            value={new Date().toLocaleDateString('sk-SK')}
            disabled
            className="w-full px-3 py-2 border border-border rounded-md bg-muted"
          />
        </div>

        <div>
          <label htmlFor="performance-fee" className="block text-sm font-medium mb-2">
            Performance fee sadzba (%)
          </label>
          <input
            id="performance-fee"
            type="number"
            value={performanceFeeRate}
            onChange={e => setPerformanceFeeRate(e.target.value)}
            placeholder="Napr. 20"
            min="0"
            max="100"
            step="0.1"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            disabled={createSnapshot.isPending}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {createSnapshot.isPending ? 'Vytvára sa...' : 'Vytvoriť'}
          </button>
        </div>
      </form>
    </QuickActionModal>
  );
}

function CreateAssetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'NEHNUTEĽNOSTI' as AssetType,
    acquiredPrice: '',
    currentValue: '',
    description: '',
  });
  const createAsset = useCreateAsset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAsset.mutateAsync({
        name: formData.name,
        type: formData.type,
        acquiredPrice: formData.acquiredPrice ? parseFloat(formData.acquiredPrice) : undefined,
        currentValue: parseFloat(formData.currentValue),
        description: formData.description ?? undefined,
      });
      onClose();
      setFormData({
        name: '',
        type: 'NEHNUTEĽNOSTI',
        acquiredPrice: '',
        currentValue: '',
        description: '',
      });
    } catch (error) {
      console.error('Chyba pri vytváraní aktíva:', error);
    }
  };

  const assetTypes = [
    { value: 'NEHNUTEĽNOSTI', label: 'Nehnuteľnosti' },
    { value: 'PÔŽIČKY', label: 'Pôžičky' },
    { value: 'AUTÁ', label: 'Autá' },
    { value: 'AKCIE', label: 'Akcie' },
    { value: 'MATERIÁL', label: 'Materiál' },
    { value: 'PODIEL VO FIRME', label: 'Podiel vo firme' },
  ];

  return (
    <QuickActionModal isOpen={isOpen} onClose={onClose} title="Pridať aktívum">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="asset-name" className="block text-sm font-medium mb-2">
            Názov *
          </label>
          <input
            id="asset-name"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-border rounded-md"
            placeholder="Názov aktíva"
          />
        </div>

        <div>
          <label htmlFor="asset-type" className="block text-sm font-medium mb-2">
            Typ *
          </label>
          <select
            id="asset-type"
            value={formData.type}
            onChange={e =>
              setFormData({
                ...formData,
                type: e.target.value as AssetType,
              })
            }
            className="w-full px-3 py-2 border border-border rounded-md"
          >
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="asset-current-value" className="block text-sm font-medium mb-2">
            Aktuálna hodnota (€) *
          </label>
          <input
            id="asset-current-value"
            type="number"
            value={formData.currentValue}
            onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded-md"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="asset-acquired-price" className="block text-sm font-medium mb-2">
            Obstarávacia cena (€)
          </label>
          <input
            id="asset-acquired-price"
            type="number"
            value={formData.acquiredPrice}
            onChange={e => setFormData({ ...formData, acquiredPrice: e.target.value })}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded-md"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="asset-description" className="block text-sm font-medium mb-2">
            Popis
          </label>
          <textarea
            id="asset-description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md"
            placeholder="Popis aktíva..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            disabled={createAsset.isPending}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {createAsset.isPending ? 'Vytvára sa...' : 'Pridať'}
          </button>
        </div>
      </form>
    </QuickActionModal>
  );
}

export function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();

  const actions = [
    {
      id: 'snapshot',
      icon: '📈',
      label: 'Vytvoriť snapshot',
      onClick: () => setActiveModal('snapshot'),
    },
    {
      id: 'asset',
      icon: '🏢',
      label: 'Pridať aktívum',
      onClick: () => setActiveModal('asset'),
    },
    {
      id: 'investor',
      icon: '👥',
      label: 'Pridať investora',
      onClick: () => navigate('/investors'),
    },
    {
      id: 'document',
      icon: '📄',
      label: 'Nahrať dokument',
      onClick: () => navigate('/documents'),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center p-3 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-xs text-center">{action.label}</span>
          </button>
        ))}
      </div>

      <CreateSnapshotModal
        isOpen={activeModal === 'snapshot'}
        onClose={() => setActiveModal(null)}
      />

      <CreateAssetModal isOpen={activeModal === 'asset'} onClose={() => setActiveModal(null)} />
    </>
  );
}
