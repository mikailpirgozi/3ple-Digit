import { useCurrentNav } from '../hooks';

interface CurrentNavCardProps {
  onCreateSnapshot?: () => void;
}

export function CurrentNavCard({ onCreateSnapshot }: CurrentNavCardProps) {
  const { data: currentNav, isLoading, error } = useCurrentNav();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('sk-SK', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });
  // };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Načítavam aktuálny NAV...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Chyba pri načítavaní aktuálneho NAV</p>
      </div>
    );
  }

  if (!currentNav) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Žiadne dáta pre NAV</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 xs:p-4 sm:p-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4 mb-4 xs:mb-6">
        <div>
          <h2 className="text-lg xs:text-xl font-semibold text-foreground">Aktuálny NAV</h2>
          <p className="text-xs xs:text-sm text-muted-foreground">Aktuálny stav portfólia</p>
        </div>
        {onCreateSnapshot && (
          <button
            onClick={onCreateSnapshot}
            className="px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
          >
            Vytvoriť snapshot
          </button>
        )}
      </div>

      {/* NAV Summary */}
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-4 mb-4 xs:mb-6">
        <div className="text-center p-2 xs:p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">NAV</p>
          <p className="text-sm xs:text-lg sm:text-2xl font-bold text-primary">
            {formatCurrency(currentNav.nav)}
          </p>
        </div>
        <div className="text-center p-2 xs:p-3 sm:p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Aktíva</p>
          <p className="text-sm xs:text-lg sm:text-xl font-semibold text-green-600">
            {formatCurrency(currentNav.totalAssetValue)}
          </p>
        </div>
        <div className="text-center p-2 xs:p-3 sm:p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Hotovosť</p>
          <p className="text-sm xs:text-lg sm:text-xl font-semibold text-blue-600">
            {formatCurrency(currentNav.totalBankBalance)}
          </p>
        </div>
        <div className="text-center p-2 xs:p-3 sm:p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Záväzky</p>
          <p className="text-sm xs:text-lg sm:text-xl font-semibold text-red-600">
            -{formatCurrency(currentNav.totalLiabilities)}
          </p>
        </div>
      </div>

      {/* NAV Calculation Formula */}
      <div className="bg-muted/50 border border-border rounded-lg p-3 xs:p-4">
        <h3 className="text-xs xs:text-sm font-medium text-foreground mb-2">Výpočet NAV</h3>
        <div className="text-xs xs:text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Aktíva:</span>
            <span className="text-green-600">+{formatCurrency(currentNav.totalAssetValue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Hotovosť:</span>
            <span className="text-blue-600">+{formatCurrency(currentNav.totalBankBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Záväzky:</span>
            <span className="text-red-600">-{formatCurrency(currentNav.totalLiabilities)}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between font-semibold text-foreground">
            <span>NAV:</span>
            <span className="text-primary">{formatCurrency(currentNav.nav)}</span>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
        <svg
          className="w-3 h-3 mr-1 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Automatické obnovenie každých 30 sekúnd
      </div>
    </div>
  );
}
