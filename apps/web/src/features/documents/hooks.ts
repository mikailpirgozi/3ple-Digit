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
    }: {
      file: File;
      linkedType: DocumentLinkedType;
      linkedId: string;
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

      const presignResponse = await documentsApi.getPresignedUpload(presignData);

      // Upload file to R2
      await documentsApi.uploadFile(presignResponse.uploadUrl, file, presignResponse.fields);

      return presignResponse.document;
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

      // Open download URL in new tab
      window.open(response.downloadUrl, '_blank');

      return response;
    },
  });
}
