import { api, apiClient } from '@/lib/api-client';
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

  // Upload file through backend proxy (NEW - avoids CORS)
  uploadFileProxy: async (
    file: File,
    metadata?: {
      linkedType?: string;
      linkedId?: string;
      note?: string;
    }
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    if (metadata?.linkedType) formData.append('linkedType', metadata.linkedType);
    if (metadata?.linkedId) formData.append('linkedId', metadata.linkedId);
    if (metadata?.note) formData.append('note', metadata.note);

    console.log('📤 Uploading file through proxy:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
        key,
        value: value instanceof File ? `File: ${value.name}` : value
      }))
    });

    // Use fetch instead of axios for FormData
    const token = localStorage.getItem('auth_token');
    const baseURL = apiClient.defaults.baseURL;
    
    const response = await fetch(`${baseURL}/documents/upload-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Upload failed');
    }
    
    return response.json();
  },

  // Upload file to R2 using presigned URL
  uploadFile: async (
    uploadUrl: string,
    file: File
  ): Promise<void> => {
    // Check if it's a mock URL (development mode)
    if (uploadUrl.includes('mock-upload-url.com') || uploadUrl.includes('mock')) {
      // eslint-disable-next-line no-console
      console.log('Skipping actual upload in development mode with mock URL');
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('🚀 Starting R2 upload:', {
        uploadUrl, // Show full URL for debugging
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        method: 'PUT'
      });

      // Log the origin for CORS debugging
      console.log('📍 Current origin:', window.location.origin);

      // Upload directly to R2 using PUT (matches backend PutObjectCommand)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        mode: 'cors',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'Content-Length': file.size.toString(),
        },
      });

      // eslint-disable-next-line no-console
      console.log('✅ R2 response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
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
