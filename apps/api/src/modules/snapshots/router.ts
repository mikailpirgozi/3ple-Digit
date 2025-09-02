import { Router } from 'express';
import { snapshotsService } from './service.js';
import {
  createSnapshotSchema,
  updateSnapshotSchema,
  getSnapshotsQuerySchema,
} from './schema.js';
import { asyncHandler } from '@/core/error-handler.js';
import { authenticate, adminOrInternal } from '@/modules/auth/middleware.js';

const router = Router();

// All snapshot routes require authentication
router.use(authenticate);

/**
 * GET /api/snapshots/nav/current
 * Get current NAV calculation (without creating snapshot)
 */
router.get('/nav/current', asyncHandler(async (req, res) => {
  const navCalculation = await snapshotsService.calculateCurrentNav();
  res.json(navCalculation);
}));

/**
 * GET /api/snapshots/ownership/current
 * Get current investor ownership percentages
 */
router.get('/ownership/current', asyncHandler(async (req, res) => {
  const ownership = await snapshotsService.calculateInvestorOwnership();
  res.json(ownership);
}));

/**
 * GET /api/snapshots
 * Get all snapshots with pagination
 */
router.get('/', asyncHandler(async (req, res) => {
  const query = getSnapshotsQuerySchema.parse(req.query);
  const result = await snapshotsService.getSnapshots(query);
  res.json(result);
}));

/**
 * POST /api/snapshots
 * Create a new snapshot (Admin/Internal only)
 */
router.post('/', adminOrInternal, asyncHandler(async (req, res) => {
  const data = createSnapshotSchema.parse(req.body);
  const snapshot = await snapshotsService.createSnapshot(data, req.user?.id);
  res.status(201).json(snapshot);
}));

/**
 * GET /api/snapshots/latest
 * Get latest snapshot
 */
router.get('/latest', asyncHandler(async (req, res) => {
  const snapshot = await snapshotsService.getLatestSnapshot();
  if (!snapshot) {
    return res.status(404).json({ 
      error: { code: 'NOT_FOUND', message: 'No snapshots found' } 
    });
  }
  res.json(snapshot);
}));

/**
 * GET /api/snapshots/:id
 * Get snapshot by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const snapshot = await snapshotsService.getSnapshotById(id);
  res.json(snapshot);
}));

/**
 * PUT /api/snapshots/:id
 * Update snapshot (Admin/Internal only)
 */
router.put('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateSnapshotSchema.parse(req.body);
  const snapshot = await snapshotsService.updateSnapshot(id, data, req.user?.id);
  res.json(snapshot);
}));

/**
 * DELETE /api/snapshots/:id
 * Delete snapshot (Admin/Internal only)
 */
router.delete('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await snapshotsService.deleteSnapshot(id, req.user?.id);
  res.status(204).send();
}));

/**
 * GET /api/snapshots/investor/:investorId
 * Get snapshots for specific investor
 */
router.get('/investor/:investorId', asyncHandler(async (req, res) => {
  const { investorId } = req.params;
  const snapshots = await snapshotsService.getInvestorSnapshots(investorId);
  res.json(snapshots);
}));

export { router as snapshotsRouter };
