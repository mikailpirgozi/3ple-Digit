import { asyncHandler } from '@/core/error-handler';
import { validateRequiredParam } from '@/core/validation';
import { adminOrInternal, authenticate } from '@/modules/auth/middleware';
import { Router, type Router as ExpressRouter } from 'express';
import {
  createLiabilitySchema,
  getLiabilitiesQuerySchema,
  updateLiabilitySchema,
} from './schema';
import { liabilitiesService } from './service';

const router: ExpressRouter = Router();

// All liability routes require authentication
router.use(authenticate);

/**
 * GET /api/liabilities
 * Get all liabilities with pagination and search
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = getLiabilitiesQuerySchema.parse(req.query);
    const result = await liabilitiesService.getLiabilities(query);
    res.json(result);
  })
);

/**
 * POST /api/liabilities
 * Create a new liability (Admin/Internal only)
 */
router.post(
  '/',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const data = createLiabilitySchema.parse(req.body);
    const liability = await liabilitiesService.createLiability(data, req.user?.id);
    res.status(201).json(liability);
  })
);

/**
 * GET /api/liabilities/summary
 * Get liabilities summary
 */
router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const summary = await liabilitiesService.getLiabilitiesSummary();
    res.json(summary);
  })
);

/**
 * GET /api/liabilities/:id
 * Get liability by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const liability = await liabilitiesService.getLiabilityById(id);
    res.json(liability);
  })
);

/**
 * PUT /api/liabilities/:id
 * Update liability (Admin/Internal only)
 */
router.put(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = updateLiabilitySchema.parse(req.body);
    const liability = await liabilitiesService.updateLiability(id, data, req.user?.id);
    res.json(liability);
  })
);

/**
 * DELETE /api/liabilities/:id
 * Delete liability (Admin/Internal only)
 */
router.delete(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    await liabilitiesService.deleteLiability(id, req.user?.id);
    res.status(204).send();
  })
);

export { router as liabilitiesRouter };
