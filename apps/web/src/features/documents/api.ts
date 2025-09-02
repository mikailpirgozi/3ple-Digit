import { api } from '@/lib/api-client';
import { 
  Document,
  PresignUploadRequest,
  PresignUploadResponse,
  PaginatedResponse
} from '@/types/api';

export const documentsApi = {
  // Get all documents
  getDocuments: (): Promise<PaginatedResponse<Document>> =>
    api.get('/documents'),

  // Get document by ID
  getDocument: (id: string): Promise<Document> =>
    api.get(`/documents/${id}`),

  // Delete document
  deleteDocument: (id: string): Promise<void> =>
    api.delete(`/documents/${id}`),

  // Get presigned upload URL
  getPresignedUpload: (data: PresignUploadRequest): Promise<PresignUploadResponse> =>
    api.post('/documents/presign', data),

  // Get presigned download URL
  getPresignedDownload: (id: string): Promise<{ downloadUrl: string }> =>
    api.get(`/documents/${id}/download`),

  // Upload file to R2 using presigned URL
  uploadFile: async (uploadUrl: string, file: File, fields?: Record<string, string>): Promise<void> => {
    const formData = new FormData();
    
    // Add fields first (if any)
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // Add file last
    formData.append('file', file);

    // Upload directly to R2 (not through our API)
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  },

  // Helper to calculate SHA256 hash of file
  calculateSHA256: async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};
