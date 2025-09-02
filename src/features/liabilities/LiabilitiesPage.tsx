export function LiabilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Záväzky</h1>
        <p className="text-muted-foreground">
          Prehľad úverov a ostatných záväzkov
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Aktívne záväzky
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Bank Loan - Property</h3>
              <p className="text-sm text-muted-foreground">Hypotéka na kancelársku budovu • 3.5% p.a.</p>
              <p className="text-xs text-muted-foreground">Splatnosť: 01/2029</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-destructive">€200,000</p>
              <p className="text-sm text-muted-foreground">Zostatok</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Credit Line</h3>
              <p className="text-sm text-muted-foreground">Podnikateľský úverový rámec • 5.5% p.a.</p>
              <p className="text-xs text-muted-foreground">Revolving</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-destructive">€50,000</p>
              <p className="text-sm text-muted-foreground">Čerpané</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
