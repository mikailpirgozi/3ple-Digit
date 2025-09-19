import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { log } from './logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export const errors = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message = 'Unauthorized') => new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Forbidden') => new AppError(message, 403, 'FORBIDDEN'),

  notFound: (message = 'Resource not found') => new AppError(message, 404, 'NOT_FOUND'),

  conflict: (message: string, details?: unknown) => new AppError(message, 409, 'CONFLICT', details),

  validation: (message: string, details?: unknown) =>
    new AppError(message, 422, 'VALIDATION_ERROR', details),

  internal: (message = 'Internal server error') => new AppError(message, 500, 'INTERNAL_ERROR'),
};

// Error handler middleware
export const errorHandler = (
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: unknown = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if ('code' in error && 'meta' in error) {
    // Handle Prisma known request errors
    const prismaError = error as { code: string; meta?: Record<string, unknown> };
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'Resource already exists';
        details = { field: prismaError.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        code = 'NOT_FOUND';
        message = 'Resource not found';
        break;
      default:
        statusCode = 400;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
        details = { code: prismaError.code };
    }
  } else if (error instanceof Error && error.message.includes('Invalid `prisma.')) {
    // Handle Prisma validation errors
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided';
  }

  // Log error
  const logMeta = {
    statusCode,
    code,
    url: _req.url,
    method: _req.method,
    ip: _req.ip,
    userAgent: _req.get('User-Agent'),
    stack: error.stack,
    details,
  };

  if (statusCode >= 500) {
    log.error(message, logMeta);
  } else {
    log.warn(message, logMeta);
  }

  // Send error response
  const errorResponse = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
