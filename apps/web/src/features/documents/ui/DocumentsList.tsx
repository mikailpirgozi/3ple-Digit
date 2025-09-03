import type { Document, DocumentLinkedType } from '@/types/api';
import { useDeleteDocument, useDocuments, useDownloadDocument } from '../hooks';

interface DocumentsListProps {
  onUploadDocument?: () => void;
}

const linkedTypeLabels: Record<DocumentLinkedType, string> = {
  asset: 'Aktívum',
  investor: 'Investor',
  liability: 'Záväzok',
};

const linkedTypeColors: Record<DocumentLinkedType, string> = {
  asset: 'bg-blue-100 text-blue-800',
  investor: 'bg-green-100 text-green-800',
  liability: 'bg-red-100 text-red-800',
};

export function DocumentsList({ onUploadDocument }: DocumentsListProps) {
  const { data: documentsData, isLoading, error } = useDocuments();
  const deleteDocumentMutation = useDeleteDocument();
  const downloadDocumentMutation = useDownloadDocument();

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Naozaj chcete odstrániť tento dokument?')) {
      try {
        await deleteDocumentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadDocument = async (id: string) => {
    try {
      await downloadDocumentMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mime: string | null | undefined) => {
    if (!mime) return '📎';
    const type = mime.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const groupDocumentsByType = (documents: Document[]) => {
    return documents.reduce(
      (acc, doc) => {
        if (!acc[doc.linkedType]) {
          acc[doc.linkedType] = [];
        }
        acc[doc.linkedType].push(doc);
        return acc;
      },
      {} as Record<DocumentLinkedType, Document[]>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam dokumenty...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Chyba pri načítavaní dokumentov</p>
      </div>
    );
  }

  const documents = documentsData?.documents || [];
  const groupedDocuments = groupDocumentsByType(documents);
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">Celkový prehľad</h3>
            <p className="text-sm text-muted-foreground">
              {documents.length} dokumentov • {formatFileSize(totalSize)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {Object.entries(groupedDocuments).map(([type, docs]) => (
              <div key={type} className="text-center">
                <p className="font-medium text-foreground">{docs.length}</p>
                <p>{linkedTypeLabels[type as DocumentLinkedType]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="space-y-2">
              <svg
                className="w-12 h-12 text-muted-foreground mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-muted-foreground">Žiadne dokumenty nenájdené</p>
              <p className="text-sm text-muted-foreground">Nahrajte prvý dokument do R2 storage</p>
            </div>
            {onUploadDocument && (
              <button
                onClick={onUploadDocument}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Nahrať prvý dokument
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(document => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{getFileIcon(document.mime)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{document.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${linkedTypeColors[document.linkedType]}`}
                        >
                          {linkedTypeLabels[document.linkedType]}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(document.size)}</span>
                        <span>{document.mime || 'Neznámy typ'}</span>
                        <span>{formatDate(document.createdAt)}</span>
                      </div>

                      {document.note && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {document.note}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground mt-1">
                        Entity ID: {document.linkedId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadDocument(document.id)}
                      disabled={downloadDocumentMutation.isPending}
                      className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                    >
                      {downloadDocumentMutation.isPending ? 'Sťahujem...' : 'Stiahnuť'}
                    </button>

                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={deleteDocumentMutation.isPending}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Odstrániť
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Security Info */}
      {documents.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Bezpečnosť dokumentov</p>
              <p>
                Všetky dokumenty sú uložené v Cloudflare R2 storage s SHA256 kontrolnými súčtami.
                Prístup je zabezpečený cez presigned URLs s obmedzenou platnosťou.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
