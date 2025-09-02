import { useState, useRef } from 'react';
import { useImportCsv } from '../hooks';

interface CsvImportModalProps {
  onClose: () => void;
}

export function CsvImportModal({ onClose }: CsvImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importCsvMutation = useImportCsv();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert('Prosím vyberte CSV súbor');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importCsvMutation.mutateAsync(selectedFile);
      setImportResult(result);
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const csvTemplate = `account_name,date,amount
Main Business Account,2025-01-31,125000.00
Reserve Account,2025-01-31,75000.00
USD Account,2025-01-31,25000.00`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_balances_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Import CSV</h2>
            <p className="text-sm text-muted-foreground">
              Importujte bankové zostatky z CSV súboru
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!importResult ? (
            <>
              {/* CSV Template */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-foreground">Formát CSV súboru</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm text-foreground whitespace-pre-wrap">
                    {csvTemplate}
                  </pre>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Stiahnuť šablónu
                </button>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-foreground">Vybrať súbor</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="cursor-pointer block"
                  >
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-foreground font-medium">
                        {selectedFile ? selectedFile.name : 'Kliknite pre výber CSV súboru'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alebo pretiahnite súbor sem
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-800">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-green-600 hover:text-green-800 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importCsvMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importCsvMutation.isPending ? 'Importujem...' : 'Importovať'}
                </button>
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Výsledky importu</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">
                    Úspešne importovaných: {importResult.imported} záznamov
                  </span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">Chyby pri importe:</h4>
                  <div className="space-y-1">
                    {importResult.errors.map((error: any, index: number) => (
                      <p key={index} className="text-sm text-red-700">
                        Riadok {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Importovať ďalší súbor
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Zavrieť
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
