export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dokumenty</h1>
        <p className="text-muted-foreground">
          Správa dokumentov a súborov
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Nahraté dokumenty
          </h2>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Nahrať dokument
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📄</div>
              <div>
                <h3 className="font-medium text-foreground">Property Deed</h3>
                <p className="text-sm text-muted-foreground">office_building_deed.pdf • 1.0 MB</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Asset Document
              </span>
              <button className="text-primary hover:text-primary/80">
                Stiahnuť
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-medium text-foreground">Bank Statement April 2024</h3>
                <p className="text-sm text-muted-foreground">bank_statement_2024_04.pdf • 512 KB</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                Bank Statement
              </span>
              <button className="text-primary hover:text-primary/80">
                Stiahnuť
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
