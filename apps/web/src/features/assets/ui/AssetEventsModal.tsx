import type {
  AssetResponse,
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
  useAssetEventValidationInfo,
} from '../hooks';
import { AssetEventForm } from './AssetEventForm';
import { LoanEventForm } from './LoanEventForm';

interface AssetEventsModalProps {
  asset: AssetResponse;
  onClose: () => void;
}

const eventKindLabels: Record<string, string> = {
  VALUATION: '📊 Prehodnotenie',
  PAYMENT_IN: '💰 Príjem',
  PAYMENT_OUT: '💸 Výdaj',
  CAPEX: '🔧 Investícia (CAPEX)',
  NOTE: '📝 Poznámka',
  SALE: '🏷️ Predaj',
  LOAN_DISBURSEMENT: '💳 Poskytnutie pôžičky',
  INTEREST_ACCRUAL: '📈 Narastanie úroku',
  INTEREST_PAYMENT: '💵 Platba úroku',
  PRINCIPAL_PAYMENT: '💸 Platba istiny',
  LOAN_REPAYMENT: '✅ Splatenie pôžičky',
  DEFAULT: '⚠️ Defaultovanie',
};

export function AssetEventsModal({ asset, onClose }: AssetEventsModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AssetEvent | null>(null);

  const { data: events, isLoading } = useAssetEvents(asset.id);
  const { data: validationInfo } = useAssetEventValidationInfo(asset.id);
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
          years,
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
          years,
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
            const startDate = (asset as { acquiredDate?: string | Date }).acquiredDate ?? asset.createdAt;
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
      case 'SALE': {
        // Calculate total performance from acquisition to sale
        const purchasePrice = asset.acquiredPrice ?? 0;
        if (purchasePrice > 0 && event.amount) {
          const totalGain = event.amount - purchasePrice;
          const totalPercent = (totalGain / purchasePrice) * 100;
          
          // Calculate time from acquisition to sale
          const startDate = (asset as { acquiredDate?: string | Date }).acquiredDate ?? asset.createdAt;
          const timePeriod = calculateTimePeriod(
            typeof startDate === 'string' ? startDate : (startDate as Date).toISOString(),
            typeof event.date === 'string' ? event.date : event.date.toISOString()
          );
          const annualizedReturn = calculateAnnualizedReturn(
            purchasePrice, 
            event.amount, 
            timePeriod.months
          );
          
          const gainText = totalGain >= 0 
            ? ` (+${formatCurrency(totalGain)})` 
            : ` (${formatCurrency(totalGain)})`;
          
          const percentText = `${totalPercent >= 0 ? '+' : ''}${totalPercent.toFixed(1)}%`;
          const timeText = `za ${timePeriod.text}`;
          const annualText = timePeriod.months > 0 
            ? ` (${annualizedReturn.toFixed(1)}% ročne)` 
            : '';
          
          return `Predané za ${formatCurrency(event.amount)}${gainText} | ${percentText} ${timeText}${annualText}`;
        }
        
        return `Predané za ${formatCurrency(event.amount)}`;
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] xs:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b border-border">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm xs:text-lg sm:text-xl font-semibold text-foreground truncate">Udalosti aktíva: {asset.name}</h2>
            <p className="text-xs xs:text-sm text-muted-foreground">
              Aktuálna hodnota: {formatCurrency(asset.currentValue)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none flex-shrink-0 ml-2"
          >
            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-3 xs:p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] xs:max-h-[calc(90vh-120px)]">
          {showForm ? (
            asset.type === 'PÔŽIČKY' && !editingEvent ? (
              <LoanEventForm
                assetId={asset.id}
                loanPrincipal={(asset as { loanPrincipal?: number }).loanPrincipal ?? undefined}
                interestRate={(asset as { interestRate?: number }).interestRate ?? undefined}
                interestPeriod={(asset as { interestPeriod?: string }).interestPeriod ?? undefined}
                onSubmit={handleCreateEvent}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
              />
            ) : (
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
            )
          ) : (
            <div className="space-y-4 xs:space-y-6">
              {/* Add Event Button */}
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-4">
                <h3 className="text-sm xs:text-lg font-medium text-foreground">História udalostí</h3>
                {validationInfo?.canAddEvents ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
                  >
                    Pridať udalosť
                  </button>
                ) : (
                  <div className="text-xs xs:text-sm text-muted-foreground">
                    {validationInfo?.isSold ? 'Aktívum predané' : 'Nie je možné pridať udalosť'}
                  </div>
                )}
              </div>

              {/* Validation Info for sold assets */}
              {validationInfo?.isSold && (
                <div className="p-2 xs:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs xs:text-sm text-orange-800">
                    ⚠️ Toto aktívum bolo predané. Nie je možné pridávať ďalšie udalosti.
                  </p>
                </div>
              )}

              {/* Events List */}
              {isLoading ? (
                <div className="text-center py-6 xs:py-8">
                  <div className="text-xs xs:text-sm text-muted-foreground">Načítavam udalosti...</div>
                </div>
              ) : events && events.length > 0 ? (
                <div className="space-y-2 xs:space-y-3">
                  {events
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4 p-3 xs:p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
                            <span className="text-xs xs:text-sm font-medium text-foreground">
                              {eventKindLabels[event.type as AssetEventKind]}
                            </span>
                            <span className="text-xs xs:text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </span>
                            {getValueChangeText(event, events || []) && (
                              <div className="text-xs xs:text-sm font-medium text-blue-600">
                                {getValueChangeText(event, events || [])}
                              </div>
                            )}
                          </div>
                          {event.note && (
                            <p className="mt-1 text-xs xs:text-sm text-muted-foreground">{event.note}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1 xs:gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setShowForm(true);
                            }}
                            className="px-2 xs:px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Upraviť
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deleteEventMutation.isPending}
                            className="px-2 xs:px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Odstrániť
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 xs:py-8">
                  <p className="text-xs xs:text-sm text-muted-foreground">Žiadne udalosti nenájdené</p>
                  {validationInfo?.canAddEvents && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Pridať prvú udalosť
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
