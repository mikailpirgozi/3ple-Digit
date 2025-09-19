// Prisma import removed as not needed
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  AppError,
  appError,
  createErrorResponse,
  isOperationalError,
  sanitizeError,
} from '../lib/error';
import { log } from './logger';

// Re-export for backward compatibility
export { AppError, appError as errors } from '../lib/error';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
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
    const validationError = appError.validation(
      'Validation failed',
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
  } else if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const dbError = appError.database('Database operation failed', {
      code: (error as unknown as Record<string, unknown>).code as string,
      meta: (error as unknown as Record<string, unknown>).meta as Record<string, unknown>,
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
  const errorResponse =
    error instanceof AppError
      ? createErrorResponse(error)
      : {
          error: {
            code,
            message,
            details: details ?? null,
          },
        };

  res.status(statusCode).json(errorResponse);
};
