import { Router } from 'express';
import { assetsService } from './service.js';
import {
  createAssetSchema,
  updateAssetSchema,
  createAssetEventSchema,
  updateAssetEventSchema,
  getAssetsQuerySchema,
  getAssetEventsQuerySchema,
} from './schema.js';
import { asyncHandler } from '@/core/error-handler.js';
import { authenticate, adminOrInternal } from '@/modules/auth/middleware.js';

const router = Router();

// All asset routes require authentication
router.use(authenticate);

/**
 * GET /api/assets
 * Get all assets with pagination and filtering
 */
router.get('/', asyncHandler(async (req, res) => {
  const query = getAssetsQuerySchema.parse(req.query);
  const result = await assetsService.getAssets(query);
  res.json(result);
}));

/**
 * POST /api/assets
 * Create a new asset (Admin/Internal only)
 */
router.post('/', adminOrInternal, asyncHandler(async (req, res) => {
  const data = createAssetSchema.parse(req.body);
  const asset = await assetsService.createAsset(data, req.user?.id);
  res.status(201).json(asset);
}));

/**
 * GET /api/assets/:id
 * Get asset by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asset = await assetsService.getAssetById(id);
  res.json(asset);
}));

/**
 * PUT /api/assets/:id
 * Update asset (Admin/Internal only)
 */
router.put('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateAssetSchema.parse(req.body);
  const asset = await assetsService.updateAsset(id, data, req.user?.id);
  res.json(asset);
}));

/**
 * DELETE /api/assets/:id
 * Delete asset (Admin/Internal only)
 */
router.delete('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assetsService.deleteAsset(id, req.user?.id);
  res.status(204).send();
}));

/**
 * POST /api/assets/:id/mark-sold
 * Mark asset as sold (Admin/Internal only)
 */
router.post('/:id/mark-sold', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { salePrice, date, note } = req.body;
  
  // Create a sale event
  const saleEvent = await assetsService.createAssetEvent({
    assetId: id,
    type: 'SALE',
    amount: salePrice,
    date: new Date(date),
    note: note || 'Asset sold',
  }, req.user?.id);

  // Update asset status to SOLD
  const asset = await assetsService.updateAsset(id, {
    status: 'SOLD',
    salePrice,
    saleDate: new Date(date),
  }, req.user?.id);

  // Calculate PnL
  const pnl = salePrice - (asset.acquiredPrice || 0);

  res.json({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    description: asset.description,
    currentValue: asset.currentValue,
    status: asset.status,
    salePrice: asset.salePrice,
    saleDate: asset.saleDate,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    pnl,
    saleEvent,
  });
}));

/**
 * GET /api/assets/:id/events
 * Get events for specific asset
 */
router.get('/:id/events', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = getAssetEventsQuerySchema.parse({ ...req.query, assetId: id });
  const result = await assetsService.getAssetEvents(query);
  res.json(result);
}));

/**
 * POST /api/assets/:id/events
 * Create a new event for specific asset (Admin/Internal only)
 */
router.post('/:id/events', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = createAssetEventSchema.parse({ ...req.body, assetId: id });
  const event = await assetsService.createAssetEvent(data, req.user?.id);
  res.status(201).json(event);
}));

// Asset events routes

/**
 * GET /api/assets/events
 * Get all asset events with filtering and pagination
 */
router.get('/events', asyncHandler(async (req, res) => {
  const query = getAssetEventsQuerySchema.parse(req.query);
  const result = await assetsService.getAssetEvents(query);
  res.json(result);
}));

/**
 * POST /api/assets/events
 * Create a new asset event (Admin/Internal only)
 */
router.post('/events', adminOrInternal, asyncHandler(async (req, res) => {
  const data = createAssetEventSchema.parse(req.body);
  const event = await assetsService.createAssetEvent(data, req.user?.id);
  res.status(201).json(event);
}));

/**
 * PUT /api/assets/events/:id
 * Update asset event (Admin/Internal only)
 */
router.put('/events/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateAssetEventSchema.parse(req.body);
  const event = await assetsService.updateAssetEvent(id, data, req.user?.id);
  res.json(event);
}));

/**
 * DELETE /api/assets/events/:id
 * Delete asset event (Admin/Internal only)
 */
router.delete('/events/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assetsService.deleteAssetEvent(id, req.user?.id);
  res.status(204).send();
}));

export { router as assetsRouter };
