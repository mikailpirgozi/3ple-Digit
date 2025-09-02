import { Router } from 'express';
import { reportsService } from './service.js';
import {
  getPortfolioReportQuerySchema,
  getInvestorReportQuerySchema,
  getPerformanceReportQuerySchema,
  getCashflowReportQuerySchema,
  exportCsvSchema,
} from './schema.js';
import { asyncHandler } from '@/core/error-handler.js';
import { authenticate } from '@/modules/auth/middleware.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

/**
 * GET /api/reports/portfolio
 * Get portfolio report
 */
router.get('/portfolio', asyncHandler(async (req, res) => {
  const query = getPortfolioReportQuerySchema.parse(req.query);
  const report = await reportsService.getPortfolioReport(query);
  res.json(report);
}));

/**
 * GET /api/reports/investors
 * Get investor report
 */
router.get('/investors', asyncHandler(async (req, res) => {
  const query = getInvestorReportQuerySchema.parse(req.query);
  const report = await reportsService.getInvestorReport(query);
  res.json(report);
}));

/**
 * GET /api/reports/performance
 * Get performance report
 */
router.get('/performance', asyncHandler(async (req, res) => {
  const query = getPerformanceReportQuerySchema.parse(req.query);
  const report = await reportsService.getPerformanceReport(query);
  res.json(report);
}));

/**
 * GET /api/reports/cashflow
 * Get cashflow report
 */
router.get('/cashflow', asyncHandler(async (req, res) => {
  const query = getCashflowReportQuerySchema.parse(req.query);
  const report = await reportsService.getCashflowReport(query);
  res.json(report);
}));

/**
 * POST /api/reports/export/csv
 * Export report as CSV
 */
router.post('/export/csv', asyncHandler(async (req, res) => {
  const data = exportCsvSchema.parse(req.body);
  const csvData = await reportsService.exportCsv(data, req.user?.id);
  
  // Set CSV headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${data.reportType}-report.csv"`);
  
  res.send(csvData);
}));

export { router as reportsRouter };
