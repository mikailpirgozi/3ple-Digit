import { api } from '@/lib/api-client';
import type {
  Document,
  PresignUploadRequest,
  PresignUploadResponse,
  DocumentsResponse,
} from '@/types/api';

export const documentsApi = {
  // Get all documents
  getDocuments: (): Promise<DocumentsResponse> => api.get('/documents'),

  // Get document by ID
  getDocument: (id: string): Promise<Document> => api.get(`/documents/${id}`),

  // Delete document
  deleteDocument: (id: string): Promise<void> => api.delete(`/documents/${id}`),

  // Get presigned upload URL
  getPresignedUpload: (data: PresignUploadRequest): Promise<PresignUploadResponse> =>
    api.post('/documents/upload-url', data),

  // Get presigned download URL
  getPresignedDownload: (id: string): Promise<{ downloadUrl: string }> =>
    api.get(`/documents/${id}/download`),

  // Create document record after upload
  createDocument: (data: {
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    r2Key: string;
    linkedType?: string;
    linkedId?: string;
    note?: string;
  }): Promise<Document> => api.post('/documents', data),

  // Upload file to R2 using presigned URL
  uploadFile: async (
    uploadUrl: string,
    file: File,
    fields?: Record<string, string>
  ): Promise<void> => {
    // Check if it's a mock URL (development mode)
    if (uploadUrl.includes('mock-upload-url.com') || uploadUrl.includes('mock')) {
      // eslint-disable-next-line no-console
      console.log('Skipping actual upload in development mode with mock URL');
      return;
    }

    const formData = new FormData();

    // Add fields first (if any)
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Add file last
    formData.append('file', file);

    try {
      // Upload directly to R2 (not through our API)
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors', // Explicitly set CORS mode
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('R2 Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          uploadUrl: `${uploadUrl.substring(0, 100)}...`, // Log partial URL for debugging
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('R2 Upload error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        uploadUrl: `${uploadUrl.substring(0, 100)}...`, // Log partial URL for debugging
        fileName: file.name,
        fileSize: file.size,
      });
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to file storage. Please check your internet connection and try again.');
      }
      
      throw error;
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
