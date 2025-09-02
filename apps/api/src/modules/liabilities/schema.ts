import { z } from 'zod';

// Liability schemas
export const createLiabilitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  currentBalance: z.number().min(0, 'Current balance must be non-negative'),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.coerce.date().optional(),
});

export const updateLiabilitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  currentBalance: z.number().min(0, 'Current balance must be non-negative').optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.coerce.date().optional(),
});

// Query schemas
export const getLiabilitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'currentBalance', 'interestRate', 'maturityDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Response schemas
export const liabilityResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currentBalance: z.number(),
  interestRate: z.number().nullable(),
  maturityDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type CreateLiabilityRequest = z.infer<typeof createLiabilitySchema>;
export type UpdateLiabilityRequest = z.infer<typeof updateLiabilitySchema>;
export type GetLiabilitiesQuery = z.infer<typeof getLiabilitiesQuerySchema>;
export type LiabilityResponse = z.infer<typeof liabilityResponseSchema>;
