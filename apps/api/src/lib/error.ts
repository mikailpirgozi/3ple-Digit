/**
 * Enhanced error handling for 3ple Digit
 * MANDATORY: Use these error utilities for consistent error responses
 */

/**
 * Application error codes - MUST be consistent across the app
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_OPERATION: 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.CONFLICT]: 409,
  
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 422,
  [ERROR_CODES.INVALID_OPERATION]: 422,
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 422,
  
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.NETWORK_ERROR]: 500,
};

/**
 * Application Error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.details = details;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, AppError);
  }
}

/**
 * Error factory functions for common error types
 */
export const appError = {
  // Authentication & Authorization
  unauthorized: (message: string = 'Unauthorized', details?: unknown) =>
    new AppError(ERROR_CODES.UNAUTHORIZED, message, details),
    
  forbidden: (message: string = 'Forbidden', details?: unknown) =>
    new AppError(ERROR_CODES.FORBIDDEN, message, details),
    
  invalidToken: (message: string = 'Invalid token', details?: unknown) =>
    new AppError(ERROR_CODES.INVALID_TOKEN, message, details),
    
  tokenExpired: (message: string = 'Token expired', details?: unknown) =>
    new AppError(ERROR_CODES.TOKEN_EXPIRED, message, details),

  // Validation
  validation: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, details),
    
  invalidInput: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.INVALID_INPUT, message, details),
    
  missingField: (fieldName: string) =>
    new AppError(ERROR_CODES.MISSING_REQUIRED_FIELD, `Missing required field: ${fieldName}`, { field: fieldName }),

  // Resources
  notFound: (resource: string = 'Resource', id?: string) =>
    new AppError(ERROR_CODES.NOT_FOUND, `${resource} not found`, { id }),
    
  alreadyExists: (resource: string, details?: unknown) =>
    new AppError(ERROR_CODES.ALREADY_EXISTS, `${resource} already exists`, details),
    
  conflict: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.CONFLICT, message, details),

  // Business Logic
  insufficientFunds: (message: string = 'Insufficient funds', details?: unknown) =>
    new AppError(ERROR_CODES.INSUFFICIENT_FUNDS, message, details),
    
  invalidOperation: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.INVALID_OPERATION, message, details),
    
  businessRule: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.BUSINESS_RULE_VIOLATION, message, details),

  // External Services
  externalService: (service: string, message?: string) =>
    new AppError(ERROR_CODES.EXTERNAL_SERVICE_ERROR, message || `External service error: ${service}`, { service }),
    
  rateLimit: (message: string = 'Rate limit exceeded', details?: unknown) =>
    new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, message, details),

  // System
  internal: (message: string = 'Internal server error', details?: unknown) =>
    new AppError(ERROR_CODES.INTERNAL_ERROR, message, details, false),
    
  database: (message: string = 'Database error', details?: unknown) =>
    new AppError(ERROR_CODES.DATABASE_ERROR, message, details, false),
    
  network: (message: string = 'Network error', details?: unknown) =>
    new AppError(ERROR_CODES.NETWORK_ERROR, message, details, false),
};

/**
 * Error response format - MUST be consistent across all endpoints
 */
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: AppError | Error): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details || null,
      },
    };
  }

  // Handle unknown errors
  return {
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
      details: null,
    },
  };
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Sanitize error for logging (remove sensitive data)
 */
export function sanitizeError(error: Error): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof AppError) {
    sanitized.code = error.code;
    sanitized.statusCode = error.statusCode;
    sanitized.isOperational = error.isOperational;
    
    // Sanitize details - remove sensitive fields
    if (error.details && typeof error.details === 'object') {
      sanitized.details = sanitizeObject(error.details as Record<string, unknown>);
    }
  }

  return sanitized;
}

/**
 * Sanitize object by removing sensitive fields
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
