export function SnapshotsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Snapshots</h1>
        <p className="text-muted-foreground">
          Mesačné snapshots s NAV výpočtom a rozdelením podielov
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Posledný snapshot
          </h2>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Vytvoriť nový snapshot
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">NAV</p>
            <p className="text-2xl font-bold text-foreground">€700,000</p>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Performance Fee</p>
            <p className="text-2xl font-bold text-foreground">€15,000</p>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Dátum</p>
            <p className="text-2xl font-bold text-foreground">30/04/2024</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-4">
          Rozdelenie podielov
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium text-foreground">Investor One</span>
            <div className="text-right">
              <span className="font-medium text-foreground">46.15%</span>
              <span className="text-sm text-muted-foreground ml-2">(€150,000)</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium text-foreground">Investor Two</span>
            <div className="text-right">
              <span className="font-medium text-foreground">53.85%</span>
              <span className="text-sm text-muted-foreground ml-2">(€175,000)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
