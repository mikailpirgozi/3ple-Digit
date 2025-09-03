import { useBankSummary } from '@/features/bank/hooks';
import { useLiabilitiesSummary } from '@/features/liabilities/hooks';
import { useCurrentNav, useLatestSnapshots } from '@/features/snapshots/hooks';
import { RecentActivity } from './RecentActivity';
import { SimpleLineChart } from './SimpleLineChart';
import { SimplePieChart } from './SimplePieChart';
import { TrendIndicator } from './TrendIndicator';
import { QuickActions } from './QuickActions';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to translate asset types
const translateAssetType = (type: string) => {
  const translations: Record<string, string> = {
    loan: 'Pôžička',
    real_estate: 'Nehnuteľnosť',
    vehicle: 'Vozidlo',
    stock: 'Akcie',
    inventory: 'Zásoby',
    share_in_company: 'Podiel v spoločnosti',
  };
  return translations[type] || type;
};

// Loading skeleton component
const StatCardSkeleton = () => (
  <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
    <div className="flex items-center">
      <div className="text-xl sm:text-2xl animate-pulse">⏳</div>
      <div className="ml-3 sm:ml-4">
        <div className="h-4 bg-muted animate-pulse rounded mb-2 w-16"></div>
        <div className="h-6 bg-muted animate-pulse rounded w-24"></div>
      </div>
    </div>
  </div>
);

// Error card component
const StatCardError = ({ title, error }: { title: string; error: string }) => (
  <div className="rounded-lg border border-destructive bg-card p-4 sm:p-6">
    <div className="flex items-center">
      <div className="text-xl sm:text-2xl">⚠️</div>
      <div className="ml-3 sm:ml-4">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-sm text-destructive">Chyba: {error}</p>
      </div>
    </div>
  </div>
);

export function HomePage() {
  const { data: navData, isLoading: navLoading, error: navError } = useCurrentNav();
  const { data: bankData, isLoading: bankLoading, error: bankError } = useBankSummary();
  const {
    data: liabilitiesData,
    isLoading: liabilitiesLoading,
    error: liabilitiesError,
  } = useLiabilitiesSummary();
  const { data: snapshotsData } = useLatestSnapshots(2);

  // Get previous values for trend calculation
  const previousSnapshot = snapshotsData?.snapshots?.[1];
  const currentSnapshot = snapshotsData?.snapshots?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Prehľad</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Prehľad vašich investícií a aktív
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* NAV Card */}
        {navLoading ? (
          <StatCardSkeleton />
        ) : navError ? (
          <StatCardError title="NAV" error="Nepodarilo sa načítať dáta" />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl">💰</div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">NAV</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {formatCurrency(navData?.nav || 0)}
                  </p>
                </div>
              </div>
              <TrendIndicator
                current={navData?.nav || 0}
                previous={previousSnapshot?.nav}
                formatValue={formatCurrency}
              />
            </div>
          </div>
        )}

        {/* Assets Card */}
        {navLoading ? (
          <StatCardSkeleton />
        ) : navError ? (
          <StatCardError title="Aktíva" error="Nepodarilo sa načítať dáta" />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl">🏢</div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Aktíva</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {formatCurrency(navData?.totalAssetValue || 0)}
                  </p>
                </div>
              </div>
              <TrendIndicator
                current={navData?.totalAssetValue || 0}
                previous={previousSnapshot?.totalAssetValue}
                formatValue={formatCurrency}
              />
            </div>
          </div>
        )}

        {/* Bank Card */}
        {bankLoading ? (
          <StatCardSkeleton />
        ) : bankError ? (
          <StatCardError title="Banka" error="Nepodarilo sa načítať dáta" />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl">🏦</div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Banka</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {formatCurrency(bankData?.totalBalance || 0)}
                  </p>
                </div>
              </div>
              <TrendIndicator
                current={bankData?.totalBalance || 0}
                previous={previousSnapshot?.totalBankBalance}
                formatValue={formatCurrency}
              />
            </div>
          </div>
        )}

        {/* Liabilities Card */}
        {liabilitiesLoading ? (
          <StatCardSkeleton />
        ) : liabilitiesError ? (
          <StatCardError title="Záväzky" error="Nepodarilo sa načítať dáta" />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl">💳</div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Záväzky</p>
                  <p className="text-lg sm:text-2xl font-bold text-destructive">
                    {formatCurrency(liabilitiesData?.totalBalance || 0)}
                  </p>
                </div>
              </div>
              <TrendIndicator
                current={liabilitiesData?.totalBalance || 0}
                previous={previousSnapshot?.totalLiabilities}
                formatValue={formatCurrency}
              />
            </div>
          </div>
        )}
      </div>

      {/* Asset Breakdown */}
      {navData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rozdelenie aktív</h3>
            <div className="space-y-3">
              {navData.assetBreakdown
                .sort((a, b) => b.totalValue - a.totalValue) // Zoradenie podľa ceny (najvyššie prvé)
                .map((asset, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {translateAssetType(asset.type)} ({asset.count}x)
                    </span>
                    <span className="text-sm font-medium">{formatCurrency(asset.totalValue)}</span>
                  </div>
                ))}
              {navData.assetBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">Žiadne aktíva</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Bankové účty</h3>
            <div className="space-y-3">
              {bankData?.byAccount
                .sort((a, b) => b.amount - a.amount) // Zoradenie podľa sumy (najvyššie prvé)
                .map((account, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">{account.accountName}</span>
                      {account.bankName && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({account.bankName})
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(account.amount)}</span>
                  </div>
                )) || <p className="text-sm text-muted-foreground">Žiadne bankové účty</p>}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* NAV Trend Chart */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Vývoj NAV</h3>
          {snapshotsData && snapshotsData.snapshots.length > 0 ? (
            <SimpleLineChart
              data={snapshotsData.snapshots
                .slice()
                .reverse()
                .map(snapshot => ({
                  date: snapshot.date,
                  value: snapshot.nav,
                }))}
              width={400}
              height={200}
              formatValue={formatCurrency}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">Nedostatok dát pre zobrazenie grafu</p>
            </div>
          )}
        </div>

        {/* Asset Allocation Chart */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Alokácia aktív</h3>
          {navData && navData.assetBreakdown.length > 0 ? (
            <SimplePieChart
              data={navData.assetBreakdown
                .sort((a, b) => b.totalValue - a.totalValue) // Zoradenie podľa hodnoty
                .map(asset => ({
                  label: translateAssetType(asset.type),
                  value: asset.totalValue,
                }))}
              size={200}
              formatValue={formatCurrency}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">Žiadne aktíva na zobrazenie</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Rýchle akcie</h3>
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Nedávne aktivity</h3>
        <RecentActivity />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Vitajte v 3ple Digit MVP
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Toto je základná verzia aplikácie pre správu investícií. Momentálne máte prístup k:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li>• 👥 Správa investorov a ich vkladov</li>
          <li>• 🏢 Evidencia aktív (nehnuteľnosti, pôžičky, akcie...)</li>
          <li>• 🏦 Sledovanie bankových účtov</li>
          <li>• 💳 Evidencia záväzkov</li>
          <li>• 📈 Mesačné snapshots s NAV výpočtom</li>
          <li>• 📄 Správa dokumentov</li>
          <li>• 📋 Základné reporty</li>
        </ul>
      </div>
    </div>
  );
}
