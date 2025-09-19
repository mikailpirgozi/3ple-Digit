import type { DocumentLinkedType } from '@/types/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/ui';
import { formatFileSize } from '@/ui/data-display';
import { getFileIcon } from '@/ui/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';
import { useAssets } from '../../assets/hooks';
import { useInvestors } from '../../investors/hooks';
import { useLiabilities } from '../../liabilities/hooks';

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

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadFormSchema),
    defaultValues: {
      linkedType: 'asset',
      linkedId: '',
      title: '',
      note: '',
    },
  });

  const selectedLinkedType = form.watch('linkedType');

  // Load entities based on selected type
  const { data: assetsData } = useAssets();
  const { data: investorsData } = useInvestors();
  const { data: liabilitiesData } = useLiabilities();

  const getEntitiesForType = () => {
    switch (selectedLinkedType) {
      case 'asset':
        return assetsData?.assets ?? [];
      case 'investor':
        return investorsData?.investors ?? [];
      case 'liability':
        return liabilitiesData?.liabilities ?? [];
      default:
        return [];
    }
  };

  const entities = getEntitiesForType();

  // Reset linkedId when linkedType changes
  React.useEffect(() => {
    form.setValue('linkedId', '');
  }, [selectedLinkedType, form]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!form.watch('title')) {
      // Auto-fill title with filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      form.setValue('title', nameWithoutExt);
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Nahrať dokument</h2>
        <p className="text-sm text-muted-foreground">Nahrajte dokument do Cloudflare R2 storage</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* File Upload Area */}
          <div>
            <label
              htmlFor="document-upload"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Súbor
            </label>
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
                id="document-upload"
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-4xl">
                    {React.createElement(getFileIcon(selectedFile.type), {
                      className: 'h-12 w-12 mx-auto',
                    })}
                  </div>
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
          <FormField
            control={form.control}
            name="title"
            render={({
              field,
            }: {
              field: ControllerRenderProps<DocumentUploadFormData, 'title'>;
            }) => (
              <FormItem>
                <FormLabel>Názov dokumentu</FormLabel>
                <FormControl>
                  <Input placeholder="Napríklad: Property Deed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Linked Type */}
          <FormField
            control={form.control}
            name="linkedType"
            render={({
              field,
            }: {
              field: ControllerRenderProps<DocumentUploadFormData, 'linkedType'>;
            }) => (
              <FormItem>
                <FormLabel>Typ entity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ entity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(linkedTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Linked Entity */}
          <FormField
            control={form.control}
            name="linkedId"
            render={({
              field,
            }: {
              field: ControllerRenderProps<DocumentUploadFormData, 'linkedId'>;
            }) => (
              <FormItem>
                <FormLabel>Entita</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Vyberte ${linkedTypeLabels[selectedLinkedType as DocumentLinkedType]?.toLowerCase() || 'entitu'}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Vyberte {linkedTypeLabels[selectedLinkedType as DocumentLinkedType]?.toLowerCase() || 'entitu'}, ku ktorej sa dokument vzťahuje
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({
              field,
            }: {
              field: ControllerRenderProps<DocumentUploadFormData, 'note'>;
            }) => (
              <FormItem>
                <FormLabel>Poznámka</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Voliteľná poznámka k dokumentu..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            <Button type="submit" disabled={isLoading ?? !selectedFile}>
              {isLoading ? 'Nahrávam...' : 'Nahrať dokument'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
