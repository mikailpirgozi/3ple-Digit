import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DocumentLinkedType } from '@/types/api';

const documentUploadFormSchema = z.object({
  title: z.string().min(1, 'Názov je povinný'),
  linkedType: z.enum(['asset', 'investor', 'liability']),
  linkedId: z.string().min(1, 'Musíte vybrať entitu'),
  note: z.string().optional(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadFormSchema>;

interface DocumentUploadFormProps {
  onSubmit: (data: DocumentUploadFormData & { file: File }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const linkedTypeLabels: Record<DocumentLinkedType, string> = {
  asset: 'Aktívum',
  investor: 'Investor',
  liability: 'Záväzok',
};

export function DocumentUploadForm({ onSubmit, onCancel, isLoading }: DocumentUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadFormSchema),
    defaultValues: {
      linkedType: 'asset',
    },
  });

  const selectedLinkedType = watch('linkedType');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!watch('title')) {
      // Auto-fill title with filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setValue('title', nameWithoutExt);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' ?? e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFormSubmit = (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      alert('Prosím vyberte súbor');
      return;
    }

    onSubmit({
      ...data,
      file: selectedFile,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') ?? type.includes('document')) return '📝';
    if (type.includes('excel') ?? type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') ?? type.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Nahrať dokument</h2>
        <p className="text-sm text-muted-foreground">Nahrajte dokument do Cloudflare R2 storage</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Súbor</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-4xl">{getFileIcon(selectedFile)}</div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Odstrániť súbor
                </button>
              </div>
            ) : (
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Kliknite pre výber súboru
                  </button>
                  <p className="text-sm text-muted-foreground">alebo pretiahnite súbor sem</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Podporované formáty: PDF, DOC, XLS, obrázky, ZIP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Názov dokumentu
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder="Napríklad: Property Deed"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Linked Type */}
        <div>
          <label htmlFor="linkedType" className="block text-sm font-medium text-foreground mb-2">
            Typ entity
          </label>
          <select
            id="linkedType"
            {...register('linkedType')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Object.entries(linkedTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.linkedType && (
            <p className="mt-1 text-sm text-red-600">{errors.linkedType.message}</p>
          )}
        </div>

        {/* Linked ID */}
        <div>
          <label htmlFor="linkedId" className="block text-sm font-medium text-foreground mb-2">
            ID entity
          </label>
          <input
            id="linkedId"
            type="text"
            {...register('linkedId')}
            placeholder={`ID ${linkedTypeLabels[selectedLinkedType].toLowerCase()}u`}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.linkedId && (
            <p className="mt-1 text-sm text-red-600">{errors.linkedId.message}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            UUID entity, ku ktorej sa dokument vzťahuje
          </p>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">
            Poznámka
          </label>
          <textarea
            id="note"
            rows={3}
            {...register('note')}
            placeholder="Voliteľná poznámka k dokumentu..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            disabled={isLoading ?? !selectedFile}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Nahrávam...' : 'Nahrať dokument'}
          </button>
        </div>
      </form>
    </div>
  );
}
