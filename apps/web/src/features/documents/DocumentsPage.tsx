import { useState } from 'react';
import { useUploadDocument } from './hooks';
import { DocumentsList } from './ui/DocumentsList';
import { DocumentUploadForm } from './ui/DocumentUploadForm';

export function DocumentsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const uploadDocumentMutation = useUploadDocument();

  const handleUploadDocument = async (data: {
    file: File;
    title: string;
    linkedType: 'asset' | 'investor' | 'liability';
    linkedId: string;
    note?: string;
  }) => {
    try {
      await uploadDocumentMutation.mutateAsync(data);
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dokumenty</h1>
          <p className="text-muted-foreground">
            Správa dokumentov a súborov v Cloudflare R2 storage
          </p>
        </div>
        {!showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Nahrať dokument
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="rounded-lg border border-border bg-card p-6">
          <DocumentUploadForm
            onSubmit={handleUploadDocument}
            onCancel={handleCancelUpload}
            isLoading={uploadDocumentMutation.isPending}
          />
        </div>
      )}

      {/* Documents List */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Nahraté dokumenty</h2>
        <DocumentsList onUploadDocument={() => setShowUploadForm(true)} />
      </div>
    </div>
  );
}
