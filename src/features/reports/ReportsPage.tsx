export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reporty</h1>
        <p className="text-muted-foreground">
          Analýzy a prehľady výkonnosti
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Výkonnosť aktív
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nehnuteľnosti</span>
              <span className="font-medium text-green-600">+5.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pôžičky</span>
              <span className="font-medium text-green-600">+8.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Akcie</span>
              <span className="font-medium text-red-600">-2.3%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Mesačný prehľad
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Príjmy</span>
              <span className="font-medium text-green-600">€45,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Výdavky</span>
              <span className="font-medium text-red-600">€12,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Čistý zisk</span>
              <span className="font-medium text-foreground">€33,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dostupné exporty
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-accent text-left">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-foreground">Portfolio Report</h3>
            <p className="text-sm text-muted-foreground">Kompletný prehľad portfólia</p>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-accent text-left">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium text-foreground">Investor Report</h3>
            <p className="text-sm text-muted-foreground">Report pre investorov</p>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-accent text-left">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-foreground">Performance Report</h3>
            <p className="text-sm text-muted-foreground">Analýza výkonnosti</p>
          </button>
        </div>
      </div>
    </div>
  );
}
