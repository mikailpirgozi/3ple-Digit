export function InvestorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investori</h1>
        <p className="text-muted-foreground">
          Správa investorov a ich kapitálových vkladov
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Zoznam investorov
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Investor One</h3>
              <p className="text-sm text-muted-foreground">investor1@example.com</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€150,000</p>
              <p className="text-sm text-muted-foreground">46.15% podiel</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Investor Two</h3>
              <p className="text-sm text-muted-foreground">investor2@example.com</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€175,000</p>
              <p className="text-sm text-muted-foreground">53.85% podiel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
