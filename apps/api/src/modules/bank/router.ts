import { asyncHandler } from '@/core/error-handler';
import { validateRequiredParam } from '@/core/validation';
import { adminOrInternal, authenticate } from '@/modules/auth/middleware';
import { Router, type Router as ExpressRouter } from 'express';
import {
  createBankBalanceSchema,
  csvImportSchema,
  getBankBalancesQuerySchema,
  updateBankBalanceSchema,
} from './schema';
import { bankService } from './service';

const router: ExpressRouter = Router();

// All bank routes require authentication
router.use(authenticate);

/**
 * GET /api/bank/balances
 * Get all bank balances with pagination and filtering
 */
router.get(
  '/balances',
  asyncHandler(async (req, res) => {
    const query = getBankBalancesQuerySchema.parse(req.query);
    const result = await bankService.getBankBalances(query);
    res.json(result);
  })
);

/**
 * POST /api/bank/balances
 * Create a new bank balance (Admin/Internal only)
 */
router.post(
  '/balances',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const data = createBankBalanceSchema.parse(req.body);
    const balance = await bankService.createBankBalance(data, req.user?.id);
    res.status(201).json(balance);
  })
);

/**
 * GET /api/bank/balances/:id
 * Get bank balance by ID
 */
router.get(
  '/balances/:id',
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const balance = await bankService.getBankBalanceById(id);
    res.json(balance);
  })
);

/**
 * PUT /api/bank/balances/:id
 * Update bank balance (Admin/Internal only)
 */
router.put(
  '/balances/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    const data = updateBankBalanceSchema.parse(req.body);
    const balance = await bankService.updateBankBalance(id, data, req.user?.id);
    res.json(balance);
  })
);

/**
 * DELETE /api/bank/balances/:id
 * Delete bank balance (Admin/Internal only)
 */
router.delete(
  '/balances/:id',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const id = validateRequiredParam(req.params.id, 'id');
    await bankService.deleteBankBalance(id, req.user?.id);
    res.status(204).send();
  })
);

/**
 * GET /api/bank/summary
 * Get bank balance summary
 */
router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const summary = await bankService.getBankBalanceSummary();
    res.json(summary);
  })
);

/**
 * POST /api/bank/import/csv
 * Import bank balances from CSV (Admin/Internal only)
 */
router.post(
  '/import/csv',
  adminOrInternal,
  asyncHandler(async (req, res) => {
    const data = csvImportSchema.parse(req.body);
    const result = await bankService.importFromCsv(data, req.user?.id);
    res.json(result);
  })
);

export { router as bankRouter };
