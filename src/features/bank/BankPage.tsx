export function BankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bankové účty</h1>
        <p className="text-muted-foreground">
          Prehľad bankových účtov a hotovostných pozícií
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Účty
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Main Business Account</h3>
              <p className="text-sm text-muted-foreground">Slovenská sporiteľňa • Bežný účet</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€125,000</p>
              <p className="text-sm text-muted-foreground">EUR</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Reserve Account</h3>
              <p className="text-sm text-muted-foreground">VUB Banka • Sporiaci účet</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">€75,000</p>
              <p className="text-sm text-muted-foreground">EUR</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">USD Account</h3>
              <p className="text-sm text-muted-foreground">Tatra Banka • Devízový účet</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">$25,000</p>
              <p className="text-sm text-muted-foreground">USD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
