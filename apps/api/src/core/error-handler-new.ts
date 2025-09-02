import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, appError, createErrorResponse, isOperationalError, sanitizeError } from '../lib/error.js';
import { log } from './logger.js';

// Re-export for backward compatibility
export { AppError, appError as errors } from '../lib/error.js';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error handler middleware
export const errorHandler = (
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
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
    const validationError = appError.validation('Validation failed', 
      error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
    statusCode = validationError.statusCode;
    code = validationError.code;
    message = validationError.message;
    details = validationError.details;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const dbError = appError.database('Database operation failed', {
      code: error.code,
      meta: error.meta,
    });
    statusCode = dbError.statusCode;
    code = dbError.code;
    message = dbError.message;
    details = dbError.details;
  } else {
    // Unknown error - log full details but don't expose
    const internalError = appError.internal();
    statusCode = internalError.statusCode;
    code = internalError.code;
    message = internalError.message;
    details = null;
    
    log.error('Unknown error occurred', sanitizeError(error));
  }

  // Log error with context (only for operational errors)
  if (error instanceof AppError && isOperationalError(error)) {
    log.warn('Operational error', {
      error: sanitizeError(error),
      request: {
        method: _req.method,
        url: _req.url,
        ip: _req.ip,
        userAgent: _req.get('User-Agent'),
      },
    });
  } else {
    log.error('System error', {
      error: sanitizeError(error),
      request: {
        method: _req.method,
        url: _req.url,
        ip: _req.ip,
        userAgent: _req.get('User-Agent'),
      },
    });
  }

  // Send standardized error response
  const errorResponse = error instanceof AppError 
    ? createErrorResponse(error)
    : {
        error: {
          code,
          message,
          details: details || null,
        },
      };
      
  res.status(statusCode).json(errorResponse);
};
