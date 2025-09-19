import { asyncHandler } from '@/core/error-handler';
import { validateRequiredParam } from '@/core/validation';
import { adminOrInternal, authenticate } from '@/modules/auth/middleware';
import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import {
  createDocumentSchema,
  getDocumentsQuerySchema,
  getPresignedUploadUrlSchema,
  updateDocumentSchema,
} from './schema';
import { documentsService } from './service';

const router: ExpressRouter = Router();

// Configure multer for memory storage (temporary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    // Allowed mime types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All document routes require authentication
router.use(authenticate);

/**
 * GET /api/documents
 * Get all documents with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = getDocumentsQuerySchema.parse(req.query);
    const result = await documentsService.getDocuments(query);
    res.json(result);
  })
);

/**
 * POST /api/documents/upload-url
 * Get presigned URL for file upload
 */
router.post(
  '/upload-url',
  asyncHandler(async (req, res) => {
    const data = getPresignedUploadUrlSchema.parse(req.body);
    const result = await documentsService.getPresignedUploadUrl(data, req.user?.id);
    res.json(result);
  })
);

/**
 * POST /api/documents/upload-proxy
 * Upload file through backend proxy (avoids CORS issues)
 */
router.post(
  '/upload-proxy',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    // Get additional metadata from request body
    const { linkedType, linkedId, note } = req.body;

    // Upload file through backend
    const result = await documentsService.uploadFileProxy(
      {
        file: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        linkedType,
        linkedId,
        note,
      },
      req.user?.id
    );

    res.json(result);
  })
);

/**
 * POST /api/documents
 * Create document record after upload (Admin/Internal only)
 */
router.post(
  '/',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const { r2Key, ...documentData } = req.body as { r2Key: string; [key: string]: unknown };
    const data = createDocumentSchema.parse(documentData);
    const document = await documentsService.createDocument(data, r2Key, req.user?.id);
    res.status(201).json(document);
  })
);

/**
 * GET /api/documents/categories
 * Get all document categories
 */
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await documentsService.getDocumentCategories();
    res.json(categories);
  })
);

/**
 * GET /api/documents/stats
 * Get storage statistics
 */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const stats = await documentsService.getStorageStats();
    res.json(stats);
  })
);

/**
 * GET /api/documents/:id
 * Get document by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const document = await documentsService.getDocumentById(id);
    res.json(document);
  })
);

/**
 * GET /api/documents/:id/download
 * Get presigned download URL
 */
router.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const result = await documentsService.getPresignedDownloadUrl(id, req.user?.id);
    res.json(result);
  })
);

/**
 * PUT /api/documents/:id
 * Update document metadata (Admin/Internal only)
 */
router.put(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = updateDocumentSchema.parse(req.body);
    const document = await documentsService.updateDocument(id, data, req.user?.id);
    res.json(document);
  })
);

/**
 * DELETE /api/documents/:id
 * Delete document (Admin/Internal only)
 */
router.delete(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    await documentsService.deleteDocument(id, req.user?.id);
    res.status(204).send();
  })
);

export { router as documentsRouter };
