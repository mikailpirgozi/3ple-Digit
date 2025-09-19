import { asyncHandler } from '@/core/error-handler';
import { validateRequiredParam } from '@/core/validation';
import { adminOrInternal, authenticate } from '@/modules/auth/middleware';
import { Router, type Router as ExpressRouter } from 'express';
import {
  createCashflowSchema,
  createInvestorSchema,
  getCashflowsQuerySchema,
  getInvestorsQuerySchema,
  updateCashflowSchema,
  updateInvestorSchema,
} from './schema';
import { investorsService } from './service';

const router: ExpressRouter = Router();

// All investor routes require authentication
router.use(authenticate);

/**
 * GET /api/investors
 * Get all investors with pagination and search
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = getInvestorsQuerySchema.parse(req.query);
    const result = await investorsService.getInvestors(query);
    res.json(result);
  })
);

/**
 * POST /api/investors
 * Create a new investor (Admin/Internal only)
 */
router.post(
  '/',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const data = createInvestorSchema.parse(req.body);
    const investor = await investorsService.createInvestor(data, req.user?.id);
    res.status(201).json(investor);
  })
);

/**
 * GET /api/investors/:id
 * Get investor by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const investor = await investorsService.getInvestorById(id);
    res.json(investor);
  })
);

/**
 * PUT /api/investors/:id
 * Update investor (Admin/Internal only)
 */
router.put(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = updateInvestorSchema.parse(req.body);
    const investor = await investorsService.updateInvestor(id, data, req.user?.id);
    res.json(investor);
  })
);

/**
 * DELETE /api/investors/:id
 * Delete investor (Admin only)
 */
router.delete(
  '/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    await investorsService.deleteInvestor(id, req.user?.id);
    res.status(204).send();
  })
);

/**
 * GET /api/investors/:id/capital
 * Get investor capital summary
 */
router.get(
  '/:id/capital',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const summary = await investorsService.getInvestorCapitalSummary(id);
    res.json(summary);
  })
);

/**
 * GET /api/investors/:id/cashflows
 * Get cashflows for specific investor
 */
router.get(
  '/:id/cashflows',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const query = getCashflowsQuerySchema.parse({ ...req.query, investorId: id });
    const result = await investorsService.getCashflows(query);
    res.json(result);
  })
);

/**
 * POST /api/investors/:id/cashflows
 * Create a new cashflow for specific investor (Admin/Internal only)
 */
router.post(
  '/:id/cashflows',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = createCashflowSchema.parse({ ...req.body, investorId: id });
    const cashflow = await investorsService.createCashflow(data, req.user?.id);
    res.status(201).json(cashflow);
  })
);

// Cashflow routes

/**
 * GET /api/investors/cashflows
 * Get all cashflows with filtering and pagination
 */
router.get(
  '/cashflows',
  asyncHandler(async (req, res) => {
    const query = getCashflowsQuerySchema.parse(req.query);
    const result = await investorsService.getCashflows(query);
    res.json(result);
  })
);

/**
 * POST /api/investors/cashflows
 * Create a new cashflow entry (Admin/Internal only)
 */
router.post(
  '/cashflows',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const data = createCashflowSchema.parse(req.body);
    const cashflow = await investorsService.createCashflow(data, req.user?.id);
    res.status(201).json(cashflow);
  })
);

/**
 * PUT /api/investors/cashflows/:id
 * Update cashflow entry (Admin/Internal only)
 */
router.put(
  '/cashflows/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = updateCashflowSchema.parse(req.body);
    const cashflow = await investorsService.updateCashflow(id, data, req.user?.id);
    res.json(cashflow);
  })
);

/**
 * DELETE /api/investors/cashflows/:id
 * Delete cashflow entry (Admin/Internal only)
 */
router.delete(
  '/cashflows/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    await investorsService.deleteCashflow(id, req.user?.id);
    res.status(204).send();
  })
);

export { router as investorsRouter };
