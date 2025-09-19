import type {
  DocumentLinkedType,
  DocumentResponse,
  DocumentsResponse,
  PresignUploadRequest,
} from '@/types/api';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { documentsApi } from './api';
// Document type removed as unused

// Query keys factory
export const documentsKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: () => [...documentsKeys.lists()] as const,
  details: () => [...documentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
};

// Documents queries
export function useDocuments(): UseQueryResult<DocumentsResponse, Error> {
  return useQuery({
    queryKey: documentsKeys.list(),
    queryFn: () => documentsApi.getDocuments(),
  });
}

export function useDocument(id: string): UseQueryResult<DocumentResponse, Error> {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: Boolean(id),
  });
}

// Documents mutations
export function useDeleteDocument(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

export function useUploadDocument(): UseMutationResult<
  DocumentResponse,
  Error,
  {
    file: File;
    linkedType: DocumentLinkedType;
    linkedId: string;
  },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      linkedType,
      linkedId,
      title,
      note,
    }: {
      file: File;
      linkedType: DocumentLinkedType;
      linkedId: string;
      title: string;
      note?: string;
    }) => {
      // Calculate SHA256 hash
      await documentsApi.calculateSHA256(file);

      // Get presigned upload URL
      const presignData: PresignUploadRequest = {
        fileName: file.name,
        mimeType: file.type,
        fileType: file.type,
        size: file.size,
        fileSize: file.size,
        linkedType: linkedType as DocumentLinkedType,
        linkedId,
      };

      // eslint-disable-next-line no-console
      console.log('Getting presigned upload URL...', { fileName: file.name, size: file.size });
      const presignResponse = await documentsApi.getPresignedUpload(presignData);
      // eslint-disable-next-line no-console
      console.log('Presigned response received:', { 
        uploadUrl: `${presignResponse.uploadUrl.substring(0, 100)}...`, 
        r2Key: presignResponse.r2Key 
      });

      // Upload file to R2 (skip in development with mock URL)
      if (!presignResponse.uploadUrl.includes('mock-upload-url.com') && !presignResponse.uploadUrl.includes('mock')) {
        await documentsApi.uploadFile(presignResponse.uploadUrl, file, presignResponse.fields);
      }

      // Create document record in database
      const document = await documentsApi.createDocument({
        name: title,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        r2Key: presignResponse.r2Key,
        linkedType,
        linkedId,
        note,
      });

      return document;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

export function useDownloadDocument(): UseMutationResult<
  { downloadUrl: string },
  Error,
  string,
  unknown
> {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await documentsApi.getPresignedDownload(id);

      // Check if it's a mock URL (development mode)
      if (response.downloadUrl.includes('mock-download-url.com') || response.downloadUrl.includes('mock')) {
        alert('V development móde nie je download dostupný. Dokument je uložený v databáze s mock R2 storage.');
        return response;
      }

      // Open download URL in new tab
      window.open(response.downloadUrl, '_blank');

      return response;
    },
  });
}
