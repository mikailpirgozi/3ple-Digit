export function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Prehľad vašich investícií a aktív
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* NAV Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">NAV</p>
              <p className="text-2xl font-bold text-foreground">€700,000</p>
            </div>
          </div>
        </div>

        {/* Assets Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center">
            <div className="text-2xl">🏢</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Aktíva</p>
              <p className="text-2xl font-bold text-foreground">€725,000</p>
            </div>
          </div>
        </div>

        {/* Bank Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center">
            <div className="text-2xl">🏦</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Banka</p>
              <p className="text-2xl font-bold text-foreground">€225,000</p>
            </div>
          </div>
        </div>

        {/* Liabilities Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center">
            <div className="text-2xl">💳</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Záväzky</p>
              <p className="text-2xl font-bold text-destructive">€250,000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Vitajte v 3ple Digit MVP
        </h2>
        <p className="text-muted-foreground mb-4">
          Toto je základná verzia aplikácie pre správu investícií. Momentálne máte prístup k:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
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
