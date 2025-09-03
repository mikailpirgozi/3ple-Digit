import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from './api';
import {
  Document,
  PresignUploadRequest,
} from '@/types/api';

// Query keys factory
export const documentsKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: () => [...documentsKeys.lists()] as const,
  details: () => [...documentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
};

// Documents queries
export function useDocuments() {
  return useQuery({
    queryKey: documentsKeys.list(),
    queryFn: () => documentsApi.getDocuments(),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: !!id,
  });
}

// Documents mutations
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      linkedType, 
      linkedId, 
      note 
    }: {
      file: File;
      title: string;
      linkedType: 'asset' | 'investor' | 'liability';
      linkedId: string;
      note?: string;
    }) => {
      // Calculate SHA256 hash
      const sha256 = await documentsApi.calculateSHA256(file);

      // Get presigned upload URL
      const presignData: PresignUploadRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };

      const presignResponse = await documentsApi.getPresignedUpload(presignData);

      // Upload file to R2
      await documentsApi.uploadFile(
        presignResponse.uploadUrl,
        file,
        presignResponse.fields
      );

      return presignResponse.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await documentsApi.getPresignedDownload(id);
      
      // Open download URL in new tab
      window.open(response.downloadUrl, '_blank');
      
      return response;
    },
  });
}
