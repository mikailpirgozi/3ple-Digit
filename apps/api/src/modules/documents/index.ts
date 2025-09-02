// Documents module exports
export { documentsRouter } from './router.js';
export { documentsService } from './service.js';
export { 
  type CreateDocumentRequest,
  type UpdateDocumentRequest,
  type GetPresignedUploadUrlRequest,
  type DocumentResponse,
  type PresignedUploadResponse,
  type PresignedDownloadResponse,
} from './schema.js';
