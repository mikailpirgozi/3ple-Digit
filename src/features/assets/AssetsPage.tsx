export function AssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Aktíva</h1>
        <p className="text-muted-foreground">
          Správa investičných aktív a ich ocenenia
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Portfolio aktív
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Office Building Bratislava</h3>
              <p className="text-sm text-muted-foreground">🏢 Nehnuteľnosť</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€500,000</p>
              <p className="text-sm text-green-600">+5.0%</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Business Loan - Company ABC</h3>
              <p className="text-sm text-muted-foreground">💰 Pôžička</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€150,000</p>
              <p className="text-sm text-green-600">+3.3%</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Tech Stocks Portfolio</h3>
              <p className="text-sm text-muted-foreground">📈 Akcie</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€75,000</p>
              <p className="text-sm text-red-600">-2.1%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
