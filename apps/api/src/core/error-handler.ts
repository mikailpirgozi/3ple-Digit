import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { log } from './logger.js';

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
  
  unauthorized: (message = 'Unauthorized') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Forbidden') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (message = 'Resource not found') => 
    new AppError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string, details?: unknown) => 
    new AppError(message, 409, 'CONFLICT', details),
  
  validation: (message: string, details?: unknown) => 
    new AppError(message, 422, 'VALIDATION_ERROR', details),
  
  internal: (message = 'Internal server error') => 
    new AppError(message, 500, 'INTERNAL_ERROR'),
};

// Error handler middleware
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
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
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'Resource already exists';
        details = { field: error.meta?.target };
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
        details = { code: error.code };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided';
  }

  // Log error
  const logMeta = {
    statusCode,
    code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
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
      ...(details && { details }),
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
