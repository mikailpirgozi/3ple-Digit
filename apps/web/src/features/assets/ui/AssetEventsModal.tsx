import type {
  Asset,
  AssetEvent,
  AssetEventKind,
  CreateAssetEventRequest,
  UpdateAssetEventRequest,
} from '@/types/api';
import { useState } from 'react';
import {
  useAssetEvents,
  useCreateAssetEvent,
  useDeleteAssetEvent,
  useUpdateAssetEvent,
} from '../hooks';
import { AssetEventForm } from './AssetEventForm';

interface AssetEventsModalProps {
  asset: Asset;
  onClose: () => void;
}

const eventKindLabels: Record<AssetEventKind, string> = {
  VALUATION: '📊 Prehodnotenie',
  PAYMENT_IN: '💰 Príjem',
  PAYMENT_OUT: '💸 Výdaj',
  CAPEX: '🔧 Investícia (CAPEX)',
  NOTE: '📝 Poznámka',
  SALE: '🏷️ Predaj',
};

export function AssetEventsModal({ asset, onClose }: AssetEventsModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AssetEvent | null>(null);

  const { data: events, isLoading } = useAssetEvents(asset.id);
  const createEventMutation = useCreateAssetEvent();
  const updateEventMutation = useUpdateAssetEvent();
  const deleteEventMutation = useDeleteAssetEvent();

  const handleCreateEvent = async (data: CreateAssetEventRequest) => {
    try {
      await createEventMutation.mutateAsync({ id: asset.id, data });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (data: UpdateAssetEventRequest) => {
    if (!editingEvent) return;

    try {
      await updateEventMutation.mutateAsync({
        assetId: asset.id,
        eventId: editingEvent.id,
        data,
      });
      setEditingEvent(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Naozaj chcete odstrániť túto udalosť?')) {
      try {
        await deleteEventMutation.mutateAsync({ assetId: asset.id, eventId });
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('sk-SK');
  };

  const calculateTimePeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in months more accurately
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;

    // Add partial month if we're past the start day
    const daysDiff = end.getDate() - start.getDate();
    const adjustedMonths = daysDiff >= 0 ? totalMonths : totalMonths - 1;
    const finalMonths = Math.max(1, adjustedMonths); // Minimum 1 month

    const years = finalMonths / 12;

    if (finalMonths < 12) {
      return {
        days: 0,
        months: finalMonths,
        years: years,
        text: finalMonths === 1 ? `${finalMonths} mesiac` : `${finalMonths} mesiacov`,
      };
    } else {
      const wholeYears = Math.floor(finalMonths / 12);
      const remainingMonths = finalMonths % 12;

      if (remainingMonths === 0) {
        return {
          days: 0,
          months: finalMonths,
          years: wholeYears,
          text: wholeYears === 1 ? `${wholeYears} rok` : `${wholeYears} rokov`,
        };
      } else {
        return {
          days: 0,
          months: finalMonths,
          years: years,
          text: `${wholeYears} rokov ${remainingMonths} mesiacov`,
        };
      }
    }
  };

  const calculateAnnualizedReturn = (startValue: number, endValue: number, months: number) => {
    if (months <= 0 || startValue <= 0) return 0;

    // Calculate simple percentage change
    const percentChange = ((endValue - startValue) / startValue) * 100;

    // Annualize by simple proportion: (percentage / months) * 12
    return (percentChange / months) * 12;
  };

  const getValueChangeText = (event: AssetEvent, events: AssetEvent[]) => {
    if (!event.amount) return null;

    switch (event.type) {
      case 'VALUATION': {
        // Find previous valuation to show the change
        const sortedEvents = events
          .filter(e => e.type === 'VALUATION' && new Date(e.date) < new Date(event.date))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const previousValuation = sortedEvents[0];

        if (previousValuation?.amount) {
          // Compare with previous valuation
          const change = event.amount - previousValuation.amount;
          const changePercent = (change / previousValuation.amount) * 100;
          const timePeriod = calculateTimePeriod(
            typeof previousValuation.date === 'string'
              ? previousValuation.date
              : previousValuation.date.toISOString(),
            typeof event.date === 'string' ? event.date : event.date.toISOString()
          );
          const annualizedReturn = calculateAnnualizedReturn(
            previousValuation.amount,
            event.amount,
            timePeriod.months
          );

          const changeText =
            change > 0 ? ` (+${formatCurrency(change)})` : ` (${formatCurrency(change)})`;

          const percentText = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
          const timeText = `za ${timePeriod.text}`;
          const annualText =
            timePeriod.months > 0 ? ` (${annualizedReturn.toFixed(1)}% ročne)` : '';

          return `Nová hodnota: ${formatCurrency(event.amount)}${changeText} | ${percentText} ${timeText}${annualText}`;
        } else {
          // First valuation - compare with purchase price (asset.acquiredPrice)
          const purchasePrice = asset.acquiredPrice ?? 0;
          if (purchasePrice > 0) {
            const change = event.amount - purchasePrice;
            const changePercent = (change / purchasePrice) * 100;

            // Calculate time from asset acquisition to first valuation
            const startDate = asset.acquiredDate ?? asset.createdAt;
            const timePeriod = calculateTimePeriod(
              typeof startDate === 'string' ? startDate : startDate.toISOString(),
              typeof event.date === 'string' ? event.date : event.date.toISOString()
            );
            const annualizedReturn = calculateAnnualizedReturn(
              purchasePrice,
              event.amount,
              timePeriod.months
            );

            const changeText =
              change > 0 ? ` (+${formatCurrency(change)})` : ` (${formatCurrency(change)})`;

            const percentText = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
            const timeText = `za ${timePeriod.text}`;
            const annualText =
              timePeriod.months > 0 ? ` (${annualizedReturn.toFixed(1)}% ročne)` : '';

            return `Nová hodnota: ${formatCurrency(event.amount)}${changeText} | ${percentText} ${timeText}${annualText} (vs nákupná cena)`;
          }

          return `Nová hodnota: ${formatCurrency(event.amount)}`;
        }
      }
      case 'PAYMENT_IN':
        return `+${formatCurrency(event.amount)} (príjem)`;
      case 'PAYMENT_OUT':
        return `-${formatCurrency(Math.abs(event.amount))} (výdaj)`;
      case 'CAPEX':
        return `+${formatCurrency(event.amount)} (investícia)`;
      case 'SALE':
        return `Predané za ${formatCurrency(event.amount)}`;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Udalosti aktíva: {asset.name}</h2>
            <p className="text-sm text-muted-foreground">
              Aktuálna hodnota: {formatCurrency(asset.currentValue)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showForm ? (
            <AssetEventForm
              event={editingEvent ?? undefined}
              assetId={asset.id}
              onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
              onCancel={() => {
                setShowForm(false);
                setEditingEvent(null);
              }}
              isLoading={createEventMutation.isPending ?? updateEventMutation.isPending}
            />
          ) : (
            <div className="space-y-6">
              {/* Add Event Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-foreground">História udalostí</h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Pridať udalosť
                </button>
              </div>

              {/* Events List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Načítavam udalosti...</div>
                </div>
              ) : events && events.length > 0 ? (
                <div className="space-y-3">
                  {events
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">
                              {eventKindLabels[event.type as AssetEventKind]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </span>
                            {getValueChangeText(event, events || []) && (
                              <div className="text-sm font-medium text-blue-600">
                                {getValueChangeText(event, events || [])}
                              </div>
                            )}
                          </div>
                          {event.note && (
                            <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setShowForm(true);
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Upraviť
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deleteEventMutation.isPending}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Odstrániť
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Žiadne udalosti nenájdené</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Pridať prvú udalosť
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
