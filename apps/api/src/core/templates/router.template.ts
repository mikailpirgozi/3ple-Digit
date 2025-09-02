/**
 * Template for new router files
 * Copy this template when creating new routers to ensure TypeScript safety
 */

import { asyncHandler } from '@/core/error-handler.js';
import { validateRequiredParam } from '@/core/validation.js';
import { adminOrInternal, authenticate } from '@/modules/auth/middleware.js';
import { Router } from 'express';
// Import your service and schemas here
// import { templateService } from './service.js';
// import { createTemplateSchema, updateTemplateSchema } from './schema.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/template
 * Get all templates with filtering and pagination
 */
router.get('/', asyncHandler(async (req, res) => {
  // Use req normally when you need query params or body
  const query = {}; // Parse query with Zod schema
  const result = {}; // await templateService.getTemplates(query);
  res.json(result);
}));

/**
 * POST /api/template
 * Create new template (Admin/Internal only)
 */
router.post('/', adminOrInternal, asyncHandler(async (req, res) => {
  // Use req normally when you need body data
  const data = {}; // Parse with Zod: createTemplateSchema.parse(req.body);
  const template = {}; // await templateService.createTemplate(data, req.user?.id);
  res.status(201).json(template);
}));

/**
 * GET /api/template/:id
 * Get template by ID
 * MANDATORY: Use validateRequiredParam for all route parameters
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const id = validateRequiredParam(req.params.id, 'id');
  const template = {}; // await templateService.getTemplateById(id);
  res.json(template);
}));

/**
 * PUT /api/template/:id
 * Update template (Admin/Internal only)
 * MANDATORY: Use validateRequiredParam for all route parameters
 */
router.put('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const id = validateRequiredParam(req.params.id, 'id');
  const data = {}; // Parse with Zod: updateTemplateSchema.parse(req.body);
  const template = {}; // await templateService.updateTemplate(id, data, req.user?.id);
  res.json(template);
}));

/**
 * DELETE /api/template/:id
 * Delete template (Admin/Internal only)
 * MANDATORY: Use validateRequiredParam for all route parameters
 */
router.delete('/:id', adminOrInternal, asyncHandler(async (req, res) => {
  const id = validateRequiredParam(req.params.id, 'id');
  // await templateService.deleteTemplate(id, req.user?.id);
  res.status(204).send();
}));

/**
 * Example route without parameters
 * MANDATORY: Use _req prefix for unused request parameter
 */
router.get('/stats', asyncHandler(async (_req, res) => {
  const stats = {}; // await templateService.getStats();
  res.json(stats);
}));

export { router as templateRouter };
